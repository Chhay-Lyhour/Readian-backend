import axios from "axios";
import FormData from "form-data";
import { format } from "date-fns-tz";
import PaymentModel from "../models/paymentModel.js";
import Subscription from "../models/subscriptionModel.js";
import {
  createPurchaseHash,
  createTransactionCheckHash,
  verifyCallbackHash,
} from "./abaHashService.js";
import { AppError } from "../utils/errorHandler.js";
import { config } from "../config/config.js";

/**
 * Create ABA KHQR payment for a subscription.
 */
async function createPayment(subscriptionId, userId) {
  // Check if a payment already exists for this subscription
  const existingPayment = await PaymentModel.findOne({ subscription: subscriptionId }).sort({ createdAt: -1 });

  if (existingPayment) {
    if (existingPayment.status === "PAID") {
      throw new AppError("This subscription has already been paid.", 400);
    }

    if (existingPayment.status === "PENDING") {
      const now = new Date();
      const createdAt = new Date(existingPayment.createdAt);
      const ageInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

      if (ageInMinutes < 5) {
        // If QR is still valid, reuse it
        return {
          payment: existingPayment,
          qrImage: existingPayment.qrImage,
          qrString: existingPayment.qrString,
          deeplink: existingPayment.deeplink,
          isReused: true,
        };
      } else {
        // If expired, mark as FAILED and proceed to create a new one
        existingPayment.status = "FAILED";
        existingPayment.abaResponse = { reason: "QR code expired (5 min timeout)" };
        await existingPayment.save();
      }
    }
  }

  // Find the subscription to get details like amount
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw new AppError("Subscription not found.", 404);
  }

  if (subscription.user.toString() !== userId) {
    throw new AppError("You are not authorized to create a payment for this subscription.", 403);
  }

  // --- Create a new payment ---
  const reqTime = format(new Date(), "yyyyMMddHHmmss", { timeZone: "UTC" });
  const tranId = `${Date.now()}${Math.random().toString(36).substring(2, 6)}`.substring(0, 20);
  const amount = subscription.amount.toFixed(2); // Assuming subscription has an amount field

  const items = [
    {
      name: `Readian Subscription - ${subscription.tier}`, // Assuming tier like 'monthly'
      price: amount,
      quantity: "1",
    },
  ];
  const itemsBase64 = Buffer.from(JSON.stringify(items)).toString("base64");

  const requestData = {
    req_time: reqTime,
    merchant_id: config.aba.merchantId,
    tran_id: tranId,
    amount,
    items: itemsBase64,
    shipping: "0",
    firstname: "User", // You can enhance this by getting user's name
    lastname: "Readian",
    email: "user@example.com", // Get user's email
    phone: "012345678", // Get user's phone
    type: "purchase",
    payment_option: "abapay_khqr_deeplink",
    return_url: config.aba.returnUrl,
    cancel_url: `${config.frontendUrl}/payment-cancelled`,
    continue_success_url: config.aba.continueSuccessUrl,
    return_deeplink: "",
    currency: "USD",
    custom_fields: "",
    return_params: "",
    payout: "",
    lifetime: "5", // QR code valid for 5 minutes
    additional_params: "",
    google_pay_token: "",
    skip_success_page: "1",
  };

  const hash = createPurchaseHash(requestData);

  try {
    const formData = new FormData();
    Object.keys(requestData).forEach(key => formData.append(key, requestData[key]));
    formData.append("hash", hash);

    const response = await axios.post(
      `${config.aba.paywayApiUrl}/api/payment-gateway/v1/payments/purchase`,
      formData,
      { headers: formData.getHeaders() }
    );

    const abaData = response.data;

    const payment = await PaymentModel.create({
      subscription: subscriptionId,
      user: userId,
      tranId,
      amount,
      reqTime,
      paymentOption: "abapay_khqr_deeplink",
      qrImage: abaData.qrImage,
      deeplink: abaData.abapay_deeplink,
      qrString: abaData.qrString,
    });

    return {
      payment,
      qrImage: abaData.qrImage,
      qrString: abaData.qrString,
      deeplink: abaData.abapay_deeplink,
      isReused: false,
    };
  } catch (error) {
    console.error("ABA API Error:", error.response?.data || error.message);
    throw new AppError("Failed to create payment with ABA.", 500);
  }
}

/**
 * Handle payment callback from ABA.
 */
async function handleCallback(callbackData) {
  if (!verifyCallbackHash(callbackData)) {
    throw new AppError("Invalid callback hash. Possible fraud attempt.", 400);
  }

  const { tran_id, status } = callbackData;
  const payment = await PaymentModel.findOne({ tranId: tran_id });

  if (!payment) {
    throw new AppError("Payment not found.", 404);
  }

  let paymentStatus;
  let paidAt;

  switch (status) {
    case "0":
      paymentStatus = "PAID";
      paidAt = new Date();
      // Activate the subscription
      await Subscription.findByIdAndUpdate(payment.subscription, {
        status: "active",
        startDate: new Date(),
        // Set endDate based on tier
      });
      break;
    case "1":
      paymentStatus = "FAILED";
      break;
    case "2":
      paymentStatus = "PENDING";
      break;
    default:
      paymentStatus = "FAILED";
  }

  payment.status = paymentStatus;
  payment.abaResponse = callbackData;
  if (paidAt) {
    payment.paidAt = paidAt;
  }
  await payment.save();

  return payment;
}

/**
 * Check transaction status with ABA.
 */
async function checkTransactionStatus(tranId) {
  const payment = await PaymentModel.findOne({ tranId });
  if (!payment) {
    throw new AppError("Payment not found.", 404);
  }

  const reqTime = format(new Date(), "yyyyMMddHHmmss", { timeZone: "UTC" });
  const hash = createTransactionCheckHash(reqTime, config.aba.merchantId, tranId);

  try {
    const formData = new FormData();
    formData.append("req_time", reqTime);
    formData.append("merchant_id", config.aba.merchantId);
    formData.append("tran_id", tranId);
    formData.append("hash", hash);

    const response = await axios.post(
      `${config.aba.paywayApiUrl}/api/payment-gateway/v1/payments/check-transaction`,
      formData,
      { headers: formData.getHeaders() }
    );

    const abaStatus = String(response.data.status);

    if (abaStatus === "0" && payment.status !== "PAID") {
      payment.status = "PAID";
      payment.paidAt = new Date();
      payment.abaResponse = response.data;
      await payment.save();
      // Activate subscription
      await Subscription.findByIdAndUpdate(payment.subscription, { status: "active" });
    } else if (abaStatus === "1" && payment.status !== "FAILED") {
      payment.status = "FAILED";
      payment.abaResponse = response.data;
      await payment.save();
    }

    return { payment, abaStatus: response.data };
  } catch (error) {
    console.error("ABA Check Transaction Error:", error.response?.data || error.message);
    return { payment, abaStatus: null, error: "Failed to check transaction status" };
  }
}

export const paymentService = {
  createPayment,
  handleCallback,
  checkTransactionStatus,
};
