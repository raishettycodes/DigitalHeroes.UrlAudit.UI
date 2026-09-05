export interface SubscriptionInfo {
  plan: string;
  monthlyPrice: number;
  monthlyAuditLimit: number;
  auditsUsed: number;
  remainingAudits: number;
  usagePercentage: number;
  isUnlimited: boolean;
  status: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}