import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SubscriptionPlan } from '../models/subscription-plan.model';
import { SubscriptionUsage } from '../models/subscription-usage.model';
import { SubscriptionUpgradeResponse } from '../models/subscription-upgrade-response.model';
import { environment } from '../../../environment';
import { CreatePaymentOrderRequest } from '../models/create-payment-order-request.model';
import { CreatePaymentOrderResponse } from '../models/create-payment-order-response.model';
import { VerifyPaymentRequest } from '../models/verify-payment-request.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  private apiBaseUrl = `${environment.apiUrl}/api`;

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

createPaymentOrder(
  request: CreatePaymentOrderRequest
): Observable<CreatePaymentOrderResponse> {
  return this.http.post<CreatePaymentOrderResponse>(
    `${this.apiBaseUrl}/Payment/create-order`,
    request
  );
}

verifyPayment(
  request: VerifyPaymentRequest
): Observable<any> {
  return this.http.post(
    `${this.apiBaseUrl}/Payment/verify`,
    request
  );
}
}