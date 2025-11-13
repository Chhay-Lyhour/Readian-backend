import { z } from "zod";

/**
 * Schema for creating a new payment QR code
 */
export const createPaymentSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID is required"),
});

/**
 * Schema for checking transaction status
 */
export const checkTransactionSchema = z.object({
  tranId: z.string().min(1, "Transaction ID is required"),
});

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
