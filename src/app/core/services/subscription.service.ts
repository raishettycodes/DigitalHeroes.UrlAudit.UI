import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SubscriptionPlan } from '../models/subscription-plan.model';
import { SubscriptionUsage } from '../models/subscription-usage.model';
import { SubscriptionUpgradeResponse } from '../models/subscription-upgrade-response.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  private apiBaseUrl = 'https://localhost:7225/api';

  constructor(private http: HttpClient) {}

  getPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(
      `${this.apiBaseUrl}/Subscription/plans`
    );
  }

  getUsage(): Observable<SubscriptionUsage> {
    return this.http.get<SubscriptionUsage>(
      `${this.apiBaseUrl}/Subscription/usage`
    );
  }

  upgradePlan(plan: string): Observable<SubscriptionUpgradeResponse> {
  return this.http.post<SubscriptionUpgradeResponse>(
    `${this.apiBaseUrl}/Subscription/upgrade`,
    { plan }
  );
}
}