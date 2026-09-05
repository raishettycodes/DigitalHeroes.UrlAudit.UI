export interface SubscriptionUsage {
  plan: string;
  monthlyAuditLimit: number;
  auditsUsed: number;
  remainingAudits: number;
  usagePercentage: number;
  isActive: boolean;
}

