import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environment';

import { AuditRequest } from '../models/audit-request.model';
import { AuditResponse } from '../models/audit-response.model';
import { AuditHistory } from '../models/audit-history.model';
import { PagedResponse } from '../models/paged-response.model';
import { AuditStatistics } from '../models/audit-statistics.model';

import { Website } from '../models/website.model';
import { CreateWebsiteRequest } from '../models/create-website-request.model';

import { SubscriptionInfo } from '../models/SubscriptionInfo.model';
import { SubscriptionUpgradeResponse } from '../models/subscription-upgrade-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  private readonly apiBaseUrl =
    `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient
  ) {}

  // =========================
  // Audit
  // =========================

  audit(
    request: AuditRequest
  ): Observable<AuditResponse> {
    return this.http.post<AuditResponse>(
      `${this.apiBaseUrl}/Audit`,
      request
    );
  }

  getStatistics(): Observable<AuditStatistics> {
    return this.http.get<AuditStatistics>(
      `${this.apiBaseUrl}/Audit/statistics`
    );
  }

  // =========================
  // Audit History
  // =========================

  getHistory(
    page: number,
    pageSize: number,
    search: string = '',
    status: string = 'all',
    sort: string = 'latest'
  ): Observable<PagedResponse<AuditHistory>> {

    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('sort', sort);

    const trimmedSearch = search.trim();

    if (trimmedSearch) {
      params = params.set(
        'search',
        trimmedSearch
      );
    }

    if (status && status !== 'all') {
      params = params.set(
        'status',
        status
      );
    }

    return this.http.get<PagedResponse<AuditHistory>>(
      `${this.apiBaseUrl}/AuditHistory`,
      { params }
    );
  }

  getAuditById(
    id: number
  ): Observable<AuditHistory> {
    return this.http.get<AuditHistory>(
      `${this.apiBaseUrl}/AuditHistory/${id}`
    );
  }

  getWebsiteHistory(
    websiteId: number
  ): Observable<AuditHistory[]> {
    return this.http.get<AuditHistory[]>(
      `${this.apiBaseUrl}/AuditHistory/website/${websiteId}`
    );
  }

  deleteAudit(
    id: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiBaseUrl}/AuditHistory/${id}`
    );
  }

  // =========================
  // Websites
  // =========================

  getWebsites(): Observable<Website[]> {
    return this.http.get<Website[]>(
      `${this.apiBaseUrl}/Website`
    );
  }

  addWebsite(
    request: CreateWebsiteRequest
  ): Observable<Website> {
    return this.http.post<Website>(
      `${this.apiBaseUrl}/Website`,
      request
    );
  }

  updateWebsite(
    id: number,
    website: {
      name: string;
      url: string;
      isActive: boolean;
    }
  ): Observable<Website> {
    return this.http.put<Website>(
      `${this.apiBaseUrl}/Website/${id}`,
      website
    );
  }

  deleteWebsite(
    id: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiBaseUrl}/Website/${id}`
    );
  }

  // =========================
  // Subscription
  // =========================

  getSubscription(): Observable<SubscriptionInfo> {
    return this.http.get<SubscriptionInfo>(
      `${this.apiBaseUrl}/Subscription/usage`
    );
  }

  upgradeSubscription(
    plan: string
  ): Observable<SubscriptionUpgradeResponse> {
    return this.http.post<SubscriptionUpgradeResponse>(
      `${this.apiBaseUrl}/Subscription/upgrade`,
      { plan }
    );
  }
}

