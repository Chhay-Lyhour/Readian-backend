## File Structure

```
backend/
└── src
    └── features
        └── payment
            ├── controllers
            │   └── payment.controller.ts
            ├── dto
            │   └── payment.schema.ts
            ├── repositories
            │   └── payment.repository.ts
            ├── routes
            │   └── payment.route.ts
            ├── services
            │   ├── abaHash.ts
            │   └── payment.service.ts
            └── index.ts
```

### `src/features/payment/controllers/payment.controller.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import { paymentService } from "../services/payment.service";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../shared/utils/responseHandler";

export class PaymentController {
  /**
   * Create payment QR code for an order
   * POST /payments/create
   */
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body;
      const userId = req.user!.id;

      const result = await paymentService.createPayment(orderId, userId);

      sendSuccessResponse(res, result, "Payment QR code created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle payment callback from ABA
   * POST /payments/callback
   */
  async handleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const callbackData = req.body;

      const result = await paymentService.handleCallback(callbackData);

      // ABA expects a simple response
      res.status(200).json({
        success: true,
        message: "Payment callback processed",
        status: result.status,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check transaction status
   * GET /payments/check/:tranId
   */
  async checkTransactionStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { tranId } = req.params;

      const result = await paymentService.checkTransactionStatus(tranId);

      sendSuccessResponse(
        res,
        result,
        "Transaction status retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
```

### `src/features/payment/dto/payment.schema.ts`

```typescript
import { z } from "zod";

/**
 * Schema for creating a new payment QR code
 */
export const createPaymentSchema = z.object({
  orderId: z.uuid("Invalid order ID format"),
});

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;

/**
 * Schema for checking transaction status
 */
export const checkTransactionSchema = z.object({
  tranId: z.string().min(1, "Transaction ID is required"),
});

export type CheckTransactionDto = z.infer<typeof checkTransactionSchema>;

/**
 * Schema for ABA payment callback
 * Note: Callback comes from ABA, not from user
 */
export const paymentCallbackSchema = z.object({
  tran_id: z.string(),
  req_time: z.string(),
  merchant_id: z.string(),
  status: z.string(), // "0" = success, "1" = failed, "2" = pending
  amount: z.string().optional(),
  hash: z.string(),
});

export type PaymentCallbackDto = z.infer<typeof paymentCallbackSchema>;
```

### `src/features/payment/index.ts`

```typescript
export { paymentRouter } from "./routes/payment.route";
```

### `src/features/payment/repositories/payment.repository.ts`

```typescript
import { PaymentStatus } from "@prisma/client";
import { prisma } from "../../../shared/config/prisma";

export class PaymentRepository {
  /**
   * Create a new payment record
   */
  async createPayment(data: {
    orderId: string;
    tranId: string;
    amount: string;
    currency: string;
    reqTime: string;
    merchantId: string;
    paymentOption?: string;
    qrImage?: string;
    deeplink?: string;
    qrString?: string;
  }) {
    return prisma.payment.create({
      data: {
        orderId: data.orderId,
        tranId: data.tranId,
        amount: data.amount,
        currency: data.currency,
        reqTime: data.reqTime,
        merchantId: data.merchantId,
        paymentOption: data.paymentOption,
        qrImage: data.qrImage,
        deeplink: data.deeplink,
        qrString: data.qrString,
        status: PaymentStatus.PENDING,
      },
      include: {
        order: {
          include: {
            shop: {
              select: {
                id: true,
                name: true,
              },
            },
            OrderItem: {
              include: {
                menuItem: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find payment by transaction ID
   */
  async findByTranId(tranId: string) {
    return prisma.payment.findUnique({
      where: { tranId },
      include: {
        order: {
          include: {
            shop: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find payment by order ID
   */
  async findByOrderId(orderId: string) {
    return prisma.payment.findFirst({
      where: { orderId },
      include: {
        order: true,
      },
    });
  }

  /**
   * Update payment status after callback
   */
  async updatePaymentStatus(data: {
    tranId: string;
    status: PaymentStatus;
    abaResponse: any;
    paidAt?: Date;
  }) {
    return prisma.payment.update({
      where: { tranId: data.tranId },
      data: {
        status: data.status,
        abaResponse: data.abaResponse as any,
        paidAt: data.paidAt,
        updatedAt: new Date(),
      },
    });
  }
}

export const paymentRepository = new PaymentRepository();
```

### `src/features/payment/routes/payment.route.ts`

```typescript
import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { validateRequest } from "../../../shared/middlewares/validator";
import {
  createPaymentSchema,
  checkTransactionSchema,
} from "../dto/payment.schema";
import { requireAuth } from "../../auth/middlewares/auth.middleware";

const router: Router = Router();

/**
 * @route   POST /payments/create
 * @desc    Create payment QR code for an order
 * @access  Authenticated users (BUYER)
 */
router.post(
  "/create",
  requireAuth,
  validateRequest(createPaymentSchema),
  paymentController.createPayment.bind(paymentController)
);

/**
 * @route   POST /payments/callback
 * @desc    Receive payment callback from ABA
 * @access  Public (called by ABA)
 */
router.post(
  "/callback",
  paymentController.handleCallback.bind(paymentController)
);

/**
 * @route   GET /payments/check/:tranId
 * @desc    Check transaction status
 * @access  Authenticated users
 */
router.get(
  "/check/:tranId",
  requireAuth,
  paymentController.checkTransactionStatus.bind(paymentController)
);

export const paymentRouter = router;
```

### `src/features/payment/services/abaHash.ts`

```typescript
import crypto from "crypto";
import { Logger } from "../../../shared/utils/logger";

/**
 * ABA PayWay KHQR Hash Generation Utility
 * Uses HMAC-SHA512 with base64 encoding
 */

const API_KEY = process.env.ABA_API_KEY || "";

export interface IAbaItem {
  name: string;
  price: string;
  quantity: string;
}

export interface IAbaPurchaseRequest {
  req_time: string;
  merchant_id: string;
  tran_id: string;
  amount: string;
  items: string;
  shipping: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  type: string;
  payment_option: string;
  return_url: string;
  cancel_url: string;
  continue_success_url: string;
  return_deeplink: string;
  currency: string;
  custom_fields: string;
  return_params: string;
  payout: string;
  lifetime: string;
  additional_params: string;
  google_pay_token: string;
  skip_success_page: string;
}

/**
 * Creates hash for ABA purchase request (24 fields)
 * Field order MUST match ABA documentation exactly
 */
export function createPurchaseHash(data: IAbaPurchaseRequest): string {
  // 1. Concatenate all 24 fields in the exact order specified by ABA
  const b4hash =
    data.req_time +
    data.merchant_id +
    data.tran_id +
    data.amount +
    data.items +
    data.shipping +
    data.firstname +
    data.lastname +
    data.email +
    data.phone +
    data.type +
    data.payment_option +
    data.return_url +
    data.cancel_url +
    data.continue_success_url +
    data.return_deeplink +
    data.currency +
    data.custom_fields +
    data.return_params +
    data.payout +
    data.lifetime +
    data.additional_params +
    data.google_pay_token +
    data.skip_success_page;

  Logger.debug("=== Hash Debug ===");
  Logger.debug("String before hash (b4hash):", {
    b4hash,
    length: b4hash.length,
  });

  // 2. Create the HMAC-SHA512 hash
  const hash = crypto
    .createHmac("sha512", API_KEY)
    .update(b4hash)
    .digest("base64");
  Logger.debug("Final hash:", { hash });

  return hash;
}

/**
 * Creates hash for transaction status check (3 fields)
 */
export function createTransactionCheckHash(
  req_time: string,
  merchant_id: string,
  tran_id: string
): string {
  const b4hash = req_time + merchant_id + tran_id;
  return crypto.createHmac("sha512", API_KEY).update(b4hash).digest("base64");
}

// /**
//  * Creates hash for refund request (3 fields)
//  * Formula: base64(sha512(req_time + merchant_id + merchant_auth))
//  * merchant_auth = transaction ID (tranId)
//  */
// export function createRefundHash(
//   req_time: string,
//   merchant_id: string,
//   merchant_auth: string
// ): string {
//   const b4hash = req_time + merchant_id + merchant_auth;
//   const hash = crypto
//     .createHmac("sha512", API_KEY)
//     .update(b4hash)
//     .digest("base64");

//   console.log("=== Refund Hash Debug ===");
//   console.log("req_time:", req_time);
//   console.log("merchant_id:", merchant_id);
//   console.log("merchant_auth (tranId):", merchant_auth);
//   console.log("String before hash:", b4hash);
//   console.log("Generated hash:", hash);

//   return hash;
// }

/**
 * Verifies callback hash from ABA
 * Returns true if hash matches
 * Formula: req_time + tran_id + merchant_id + status
 */
export function verifyCallbackHash(
  receivedHash: string,
  req_time: string,
  tran_id: string,
  merchant_id: string,
  status: string
): boolean {
  const str = req_time + tran_id + merchant_id + status;
  const calculatedHash = crypto
    .createHmac("sha512", API_KEY)
    .update(str)
    .digest("base64");

  Logger.debug("=== Callback Hash Verification ===");
  Logger.debug("Verification details:", {
    stringToHash: str,
    calculatedHash,
    receivedHash,
    match: receivedHash === calculatedHash,
  });

  return receivedHash === calculatedHash;
}
```

### `src/features/payment/services/payment.service.ts`

```typescript
import axios from "axios";
import FormData from "form-data";
import { format } from "date-fns-tz";
import { PaymentStatus } from "@prisma/client";
import { paymentRepository } from "../repositories/payment.repository";
import {
  createPurchaseHash,
  createTransactionCheckHash,
  // createRefundHash,
  verifyCallbackHash,
  IAbaItem,
  IAbaPurchaseRequest,
} from "./abaHash";
import { AppError } from "../../../shared/utils/errorHandler";
import { config } from "../../../shared/config/config";
import { prisma } from "../../../shared/config/prisma";
import { Logger } from "../../../shared/utils/logger";

export class PaymentService {
  /**
   * Create ABA KHQR payment
   * Implements smart retry logic:
   * - If payment exists and PAID → Error "Order already paid"
   * - If payment exists and PENDING:
   *   - If < 5 minutes old → Return existing payment (reuse QR)
   *   - If ≥ 5 minutes old → Mark as FAILED, create new payment
   * - If payment exists and FAILED → Create new payment
   * - If no payment exists → Create new payment
   */
  async createPayment(orderId: string, userId: string) {
    // Check if payment already exists for this order
    const existingPayment = await paymentRepository.findByOrderId(orderId);

    if (existingPayment) {
      // Case 1: Already PAID → Cannot create new payment
      if (existingPayment.status === PaymentStatus.PAID) {
        throw new AppError(
          "INTERNAL_SERVER_ERROR",
          "This order has already been paid",
          400
        );
      }

      // Case 2: PENDING payment exists → Check if expired
      if (existingPayment.status === PaymentStatus.PENDING) {
        const now = new Date();
        const createdAt = new Date(existingPayment.createdAt);
        const ageInMinutes =
          (now.getTime() - createdAt.getTime()) / (1000 * 60);

        // QR code valid for 5 minutes
        if (ageInMinutes < 5) {
          // Still valid - return existing payment with QR data
          Logger.info(
            `♻️  Reusing existing payment (age: ${ageInMinutes.toFixed(
              2
            )} minutes)`
          );

          return {
            payment: existingPayment,
            qrImage: existingPayment.qrImage || null,
            qrString: existingPayment.qrString || null,
            deeplink: existingPayment.deeplink || null,
            checkoutUrl: `${config.abaPaywayApiUrl}/payments/${existingPayment.tranId}`,
            tranId: existingPayment.tranId,
            appStoreUrl: null, // Frontend can add this
            playStoreUrl: null, // Frontend can add this
            isReused: true, // Flag to indicate this is reused
          };
        } else {
          // Expired - mark as FAILED and create new payment
          Logger.info(
            `⏰ Payment expired (age: ${ageInMinutes.toFixed(
              2
            )} minutes). Marking as FAILED and creating new payment.`
          );

          await paymentRepository.updatePaymentStatus({
            tranId: existingPayment.tranId,
            status: PaymentStatus.FAILED,
            abaResponse: { reason: "QR code expired (5 min timeout)" },
          });
          // Continue to create new payment below
        }
      }

      // Case 3: FAILED payment exists → Create new payment (continue below)
      if (existingPayment.status === PaymentStatus.FAILED) {
        Logger.info("🔄 Previous payment failed. Creating new payment.");
      }
    }

    // Create new payment (Case 4: No payment exists, or old one was FAILED/expired)

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError("ORDER_NOT_FOUND");
    }

    // Verify order belongs to user
    if (order.userId !== userId) {
      throw new AppError(
        "INSUFFICIENT_PERMISSIONS",
        "You are not authorized to create payment for this order"
      );
    }

    // Prepare ABA request data
    const reqTime = format(new Date(), "yyyyMMddHHmmss", { timeZone: "UTC" });
    // ABA transaction ID must be <= 20 characters
    // Generate a unique 20-char ID using timestamp + random string
    const tranId = `${Date.now()}${Math.random()
      .toString(36)
      .substring(2, 6)}`.substring(0, 20);
    const amount = order.total.toFixed(2); // Convert to string with 2 decimals

    // Parse order items and Base64 encode them (as required by ABA)
    let items: IAbaItem[] = [];
    try {
      const orderItemsData = JSON.parse(order.items);
      items = orderItemsData.map((item: any) => ({
        name: item.name || "Item",
        price: (item.price || 0).toFixed(2),
        quantity: (item.quantity || 1).toString(),
      }));
    } catch (error) {
      // Fallback to basic item
      items = [
        {
          name: `Order from ${order.shop?.name || "Shop"}`,
          price: amount,
          quantity: "1",
        },
      ];
    }

    // Base64 encode items as required by ABA
    const itemsBase64 = Buffer.from(JSON.stringify(items)).toString("base64");

    const requestData: IAbaPurchaseRequest = {
      req_time: reqTime,
      merchant_id: config.abaMerchantId,
      tran_id: tranId,
      amount,
      items: itemsBase64,
      shipping: "0",
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      type: "purchase",
      payment_option: "abapay_khqr_deeplink",
      return_url: config.abaReturnUrl,
      cancel_url: `${config.frontendUrl}/payment-cancelled`,
      continue_success_url: config.abaContinueSuccessUrl,
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

    // Generate hash
    const hash = createPurchaseHash(requestData);

    // Debug logging
    Logger.debug("=== ABA Request Debug ===", { requestData, hash });

    try {
      // Prepare form data for ABA API (they expect multipart/form-data)
      const formData = new FormData();

      // Append all 24 fields in the exact order used in hash calculation
      formData.append("req_time", requestData.req_time);
      formData.append("merchant_id", requestData.merchant_id);
      formData.append("tran_id", requestData.tran_id);
      formData.append("amount", requestData.amount);
      formData.append("items", requestData.items);
      formData.append("shipping", requestData.shipping || "0");
      formData.append("firstname", requestData.firstname || "");
      formData.append("lastname", requestData.lastname || "");
      formData.append("email", requestData.email || "");
      formData.append("phone", requestData.phone || "");
      formData.append("type", requestData.type || "purchase");
      formData.append("payment_option", requestData.payment_option || "");
      formData.append("return_url", requestData.return_url || "");
      formData.append("cancel_url", requestData.cancel_url || "");
      formData.append(
        "continue_success_url",
        requestData.continue_success_url || ""
      );
      formData.append("return_deeplink", requestData.return_deeplink || "");
      formData.append("currency", requestData.currency || "USD");
      formData.append("custom_fields", requestData.custom_fields || "");
      formData.append("return_params", requestData.return_params || "");
      formData.append("payout", requestData.payout || "");
      formData.append("lifetime", requestData.lifetime || "");
      formData.append("additional_params", requestData.additional_params || "");
      formData.append("google_pay_token", requestData.google_pay_token || "");
      formData.append("skip_success_page", requestData.skip_success_page || "");
      formData.append("hash", hash);

      // Call ABA API with correct endpoint
      const response = await axios.post(
        `${config.abaPaywayApiUrl}/api/payment-gateway/v1/payments/purchase`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );

      Logger.debug("=== ABA API Response ===", { response: response.data });

      // ABA returns different response based on payment_option:
      // For abapay_khqr_deeplink: Returns JSON with QR image (base64), deeplink, and checkout URL
      const abaData = response.data;

      // Create payment record with QR data stored
      const payment = await paymentRepository.createPayment({
        orderId,
        tranId,
        amount,
        currency: "USD",
        reqTime,
        merchantId: config.abaMerchantId,
        paymentOption: "abapay_khqr_deeplink",
        // Store QR data for potential reuse within 15-minute validity window
        qrImage: abaData.qrImage || null,
        deeplink: abaData.abapay_deeplink || null,
        qrString: abaData.qrString || null,
      });

      return {
        payment,
        // QR Code as base64 data URI (ready to display in <img> tag)
        qrImage: abaData.qrImage || null,
        // QR code string (raw KHQR data)
        qrString: abaData.qrString || null,
        // Deeplink to open ABA app directly
        deeplink: abaData.abapay_deeplink || null,
        // Web checkout URL (fallback)
        checkoutUrl: `${config.abaPaywayApiUrl}/payments/${tranId}`,
        // Transaction ID
        tranId,
        isReused: false, // Flag to indicate this is a new payment
      };
    } catch (error: any) {
      Logger.error("ABA API Error:", {
        error: error.response?.data || error.message,
      });
      throw new AppError(
        "PAYMENT_QR_CREATE_FAILED",
        error.response?.data?.message || "Failed to create payment with ABA"
      );
    }
  }

  /**
   * Handle payment callback from ABA
   * ABA sends back ALL the original purchase fields + status
   */
  async handleCallback(callbackData: any) {
    Logger.info("📥 Received payment callback from ABA", { callbackData });

    // Extract all fields from the callback
    const {
      tran_id,
      status, // '0' = success, '1' = failed, '2' = pending
      amount,
      hash,
      req_time,
      merchant_id,
      payment_option,
      firstname,
      lastname,
      email,
      phone,
      items,
      shipping,
      type,
      return_url,
      cancel_url,
      continue_success_url,
      return_deeplink,
      currency,
      custom_fields,
      return_params,
      payout,
      lifetime,
      additional_params,
      google_pay_token,
      skip_success_page,
    } = callbackData;

    // --- CRITICAL: Verify the hash using ALL 24 fields (same as purchase) ---
    const purchaseData: IAbaPurchaseRequest = {
      req_time: req_time || "",
      merchant_id: merchant_id || "",
      tran_id: tran_id || "",
      amount: amount || "",
      items: items || "",
      shipping: shipping || "0",
      firstname: firstname || "",
      lastname: lastname || "",
      email: email || "",
      phone: phone || "",
      type: type || "purchase",
      payment_option: payment_option || "",
      return_url: return_url || "",
      cancel_url: cancel_url || "",
      continue_success_url: continue_success_url || "",
      return_deeplink: return_deeplink || "",
      currency: currency || "USD",
      custom_fields: custom_fields || "",
      return_params: return_params || "",
      payout: payout || "",
      lifetime: lifetime || "",
      additional_params: additional_params || "",
      google_pay_token: google_pay_token || "",
      skip_success_page: skip_success_page || "",
    };

    const expectedHash = createPurchaseHash(purchaseData);

    if (expectedHash !== hash) {
      Logger.error("❌ Invalid hash! Possible fraud attempt.", {
        expected: expectedHash,
        received: hash,
      });
      throw new AppError("INTERNAL_SERVER_ERROR", "Invalid callback hash", 400);
    }

    Logger.info("✅ Hash verified successfully");

    // Find payment
    const payment = await paymentRepository.findByTranId(tran_id);
    if (!payment) {
      Logger.error(`❌ Payment not found for tran_id: ${tran_id}`);
      throw new AppError("PAYMENT_NOT_FOUND");
    }

    // Determine payment status based on ABA status code
    let paymentStatus: PaymentStatus;
    let paidAt: Date | undefined;

    switch (status) {
      case "0": // Success
        paymentStatus = PaymentStatus.PAID;
        paidAt = new Date();
        Logger.info(`✅ Payment successful for order ${tran_id}`, {
          amount,
          currency,
        });
        break;
      case "1": // Failed
        paymentStatus = PaymentStatus.FAILED;
        Logger.warn(`❌ Payment failed for order ${tran_id}`);
        break;
      case "2": // Pending
        paymentStatus = PaymentStatus.PENDING;
        Logger.info(`⏳ Payment pending for order ${tran_id}`);
        break;
      default:
        paymentStatus = PaymentStatus.FAILED;
        Logger.error(`❓ Unknown payment status: ${status}`);
    }

    // Update payment
    const updatedPayment = await paymentRepository.updatePaymentStatus({
      tranId: tran_id,
      status: paymentStatus,
      abaResponse: callbackData,
      paidAt,
    });

    Logger.info(`💾 Payment updated in database`, {
      tranId: tran_id,
      status: paymentStatus,
    });

    return updatedPayment;
  }

  /**
   * Check transaction status
   */
  async checkTransactionStatus(tranId: string) {
    Logger.info(`🔍 Checking transaction status for order ${tranId}`);

    // Find payment
    let payment = await paymentRepository.findByTranId(tranId);
    if (!payment) {
      throw new AppError("PAYMENT_NOT_FOUND");
    }

    const reqTime = format(new Date(), "yyyyMMddHHmmss", { timeZone: "UTC" });
    const hash = createTransactionCheckHash(
      reqTime,
      config.abaMerchantId,
      tranId
    );

    try {
      // Build form data (ABA requires multipart/form-data, not JSON)
      const formData = new FormData();
      formData.append("req_time", reqTime);
      formData.append("merchant_id", config.abaMerchantId);
      formData.append("tran_id", tranId);
      formData.append("hash", hash);

      const response = await axios.post(
        `${config.abaPaywayApiUrl}/api/payment-gateway/v1/payments/check-transaction`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );

      Logger.debug(`📦 Full check-transaction response`, {
        response: response.data,
      });

      // ABA API returns status as number or string
      const status =
        response.data.status !== undefined
          ? String(response.data.status)
          : response.data.status;

      Logger.info(`Transaction status for ${tranId}: ${status}`);

      // Update payment status in database if it changed
      if (status === "0" && payment.status !== PaymentStatus.PAID) {
        // Payment approved - update database
        Logger.info(`✅ Payment approved! Updating database for ${tranId}`);
        await paymentRepository.updatePaymentStatus({
          tranId,
          status: PaymentStatus.PAID,
          abaResponse: response.data,
          paidAt: new Date(),
        });
        // Refetch to get updated payment with order relation
        payment = (await paymentRepository.findByTranId(tranId))!;
      } else if (status === "1" && payment.status !== PaymentStatus.FAILED) {
        // Payment failed - update database
        Logger.warn(`❌ Payment failed! Updating database for ${tranId}`);
        await paymentRepository.updatePaymentStatus({
          tranId,
          status: PaymentStatus.FAILED,
          abaResponse: response.data,
        });
        // Refetch to get updated payment with order relation
        payment = (await paymentRepository.findByTranId(tranId))!;
      }

      return {
        payment,
        abaStatus: {
          ...response.data,
          status: status, // Normalize to string
        },
      };
    } catch (error: any) {
      Logger.error("ABA Check Transaction Error:", {
        error: error.response?.data || error.message,
      });
      return {
        payment,
        abaStatus: null,
        error:
          error.response?.data?.message || "Failed to check transaction status",
      };
    }
  }

  // /**
  //  * Refund a payment through ABA API
  //  * Can only refund payments with PAID status
  //  * Refunds must be within 30 days of payment
  //  */
  // async refundPayment(tranId: string, reason: string) {
  //   console.log(`💸 Initiating refund for transaction: ${tranId}`);
  //   console.log(`Reason: ${reason}`);

  //   // 1. Get payment record
  //   const payment = await paymentRepository.findByTranId(tranId);
  //   if (!payment) {
  //     throw new AppError("PAYMENT_NOT_FOUND");
  //   }

  //   // 2. Validate payment status
  //   if (payment.status !== PaymentStatus.PAID) {
  //     throw new AppError(
  //       "INTERNAL_SERVER_ERROR",
  //       `Cannot refund payment with status: ${payment.status}. Only PAID payments can be refunded.`,
  //       400
  //     );
  //   }

  //   // 3. Check if already refunded
  //   if (payment.refundedAt) {
  //     throw new AppError(
  //       "INTERNAL_SERVER_ERROR",
  //       "This payment has already been refunded",
  //       400
  //     );
  //   }

  //   // 4. Prepare refund request
  //   const reqTime = format(new Date(), "yyyyMMddHHmmss", { timeZone: "UTC" });
  //   const hash = createRefundHash(reqTime, config.abaMerchantId, tranId);

  //   const requestData = {
  //     request_time: reqTime,
  //     merchant_id: config.abaMerchantId,
  //     merchant_auth: tranId, // Transaction ID to refund
  //     hash: hash,
  //   };

  //   console.log("=== ABA Refund Request ===");
  //   console.log("Request Data:", requestData);

  //   try {
  //     // 5. Call ABA refund API
  //     const response = await axios.post(
  //       `${config.abaPaywayApiUrl}/api/merchant-portal/merchant-access/online-transaction/refund`,
  //       requestData,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     console.log("=== ABA Refund Response ===");
  //     console.log("Response:", response.data);

  //     // 6. Validate refund success
  //     if (response.data.status?.code !== "00") {
  //       throw new Error(
  //         `Refund failed: ${response.data.status?.message || "Unknown error"}`
  //       );
  //     }

  //     // 7. Update payment record
  //     const updatedPayment = await prisma.payment.update({
  //       where: { tranId },
  //       data: {
  //         status: PaymentStatus.REFUNDED,
  //         refundedAt: new Date(),
  //         refundReason: reason,
  //         abaResponse: response.data, // Store refund response
  //       },
  //     });

  //     console.log(
  //       `✅ Refund successful! Amount: ${response.data.total_refunded} ${response.data.currency}`
  //     );

  //     return {
  //       success: true,
  //       payment: updatedPayment,
  //       refundDetails: {
  //         grandTotal: response.data.grand_total,
  //         totalRefunded: response.data.total_refunded,
  //         currency: response.data.currency,
  //         transactionStatus: response.data.transaction_status,
  //         message: response.data.status?.message,
  //       },
  //     };
  //   } catch (error: any) {
  //     console.error(
  //       "❌ ABA Refund Error:",
  //       error.response?.data || error.message
  //     );

  //     throw new AppError(
  //       "INTERNAL_SERVER_ERROR",
  //       error.response?.data?.status?.message ||
  //         error.message ||
  //         "Failed to process refund through ABA",
  //       500
  //     );
  //   }
  // }
}

export const paymentService = new PaymentService();
```
