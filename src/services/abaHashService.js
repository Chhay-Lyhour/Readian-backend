import crypto from "crypto";
import { config } from "../config/config.js";

const API_KEY = config.aba.apiKey;

/**
 * Creates hash for ABA purchase request (24 fields)
 * Field order MUST match ABA documentation exactly
 */
export function createPurchaseHash(data) {
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

  // 2. Create the HMAC-SHA512 hash
  const hash = crypto
    .createHmac("sha512", API_KEY)
    .update(b4hash)
    .digest("base64");

  return hash;
}

/**
 * Creates hash for transaction status check (3 fields)
 */
export function createTransactionCheckHash(req_time, merchant_id, tran_id) {
  const b4hash = req_time + merchant_id + tran_id;
  return crypto.createHmac("sha512", API_KEY).update(b4hash).digest("base64");
}

/**
 * Verifies callback hash from ABA
 * Returns true if hash matches
 * This uses the same 24-field logic as the purchase request.
 */
export function verifyCallbackHash(callbackData) {
  const receivedHash = callbackData.hash;

  const purchaseData = {
    req_time: callbackData.req_time || "",
    merchant_id: callbackData.merchant_id || "",
    tran_id: callbackData.tran_id || "",
    amount: callbackData.amount || "",
    items: callbackData.items || "",
    shipping: callbackData.shipping || "0",
    firstname: callbackData.firstname || "",
    lastname: callbackData.lastname || "",
    email: callbackData.email || "",
    phone: callbackData.phone || "",
    type: callbackData.type || "purchase",
    payment_option: callbackData.payment_option || "",
    return_url: callbackData.return_url || "",
    cancel_url: callbackData.cancel_url || "",
    continue_success_url: callbackData.continue_success_url || "",
    return_deeplink: callbackData.return_deeplink || "",
    currency: callbackData.currency || "USD",
    custom_fields: callbackData.custom_fields || "",
    return_params: callbackData.return_params || "",
    payout: callbackData.payout || "",
    lifetime: callbackData.lifetime || "",
    additional_params: callbackData.additional_params || "",
    google_pay_token: callbackData.google_pay_token || "",
    skip_success_page: callbackData.skip_success_page || "",
  };

  const expectedHash = createPurchaseHash(purchaseData);

  return receivedHash === expectedHash;
}
