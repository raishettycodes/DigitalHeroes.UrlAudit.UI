export interface CreatePaymentOrderResponse {
  keyId: string;
  orderId: string;
  plan: string;
  amount: number;
  currency: string;
}