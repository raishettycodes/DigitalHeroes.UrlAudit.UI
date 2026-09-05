import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { AuditHistory, PagedResponse } from '../models/history.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  private http = inject(HttpClient);

  private api =
    'https://localhost:7225/api/AuditHistory';

  getHistory(
    page: number,
    pageSize: number
  ): Observable<PagedResponse<AuditHistory>> {

    return this.http.get<PagedResponse<AuditHistory>>(
      `${this.api}?page=${page}&pageSize=${pageSize}`
    );
  }

  deleteAudit(id: number) {

    return this.http.delete(
      `${this.api}/${id}`
    );
  }

}