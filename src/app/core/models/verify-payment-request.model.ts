export interface VerifyPaymentRequest {
  plan: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}