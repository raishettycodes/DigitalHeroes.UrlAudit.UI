export interface SubscriptionUpgradeResponse {
  success: boolean;
  message: string;
  plan: string;
  monthlyAuditLimit: number;
  isActive: boolean;
}