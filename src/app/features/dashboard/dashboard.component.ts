import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { AuditResultComponent } from '../audit-result/audit-result.component';

import { AuditService } from '../../core/services/audit.service';

import { AuditStatistics } from '../../core/models/audit-statistics.model';
import { AuditHistory } from '../../core/models/audit-history.model';
import { AuditRequest } from '../../core/models/audit-request.model';
import { AuditResponse } from '../../core/models/audit-response.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  // =========================================================
  // AUDIT
  // =========================================================

  url = '';
  loading = false;

  result?: AuditResponse;

  // =========================================================
  // STATISTICS
  // =========================================================

  totalAudits = 0;
  successfulAudits = 0;
  failedAudits = 0;
  averageTime = 0;

  statistics: AuditStatistics | null = null;
  loadingStatistics = false;

  // =========================================================
  // HISTORY
  // =========================================================

  history: AuditHistory[] = [];
  filteredHistory: AuditHistory[] = [];
  searchText = '';

  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage = 1;
  pageSize = 10;
  pageSizes = [5, 10, 25, 50];

  // =========================================================
  // CHART
  // =========================================================

  responseChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Response Time (ms)',
        tension: 0.3,
        fill: false
      }
    ]
  };

  responseChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true
      }
    },

    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Milliseconds'
        }
      },

      x: {
        title: {
          display: true,
          text: 'Audit'
        }
      }
    }
  };

  constructor(
    private auditService: AuditService,
    private dialog: MatDialog
  ) {}

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnInit(): void {
    this.loadHistory();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    // Reserved for future dashboard subscriptions.
  }

  // =========================================================
  // LOAD HISTORY
  // =========================================================

  loadHistory(): void {
    this.loading = true;

    this.auditService
      .getHistory(this.currentPage, this.pageSize)
      .subscribe({
        next: response => {
          this.history = response.items ?? [];
          this.totalAudits = response.totalRecords ?? 0;
          this.filteredHistory = [...this.history];

          this.updateResponseChart();

          this.loading = false;
        },

        error: error => {
          console.error(
            'Unable to load audit history:',
            error
          );

          this.history = [];
          this.filteredHistory = [];
          this.loading = false;
        }
      });
  }

  // =========================================================
  // LOAD STATISTICS
  // =========================================================

  loadStatistics(): void {
    this.loadingStatistics = true;

    this.auditService
      .getStatistics()
      .subscribe({
        next: (response: AuditStatistics) => {
          this.statistics = response;

          this.totalAudits = response.totalAudits;
          this.successfulAudits =
            response.successfulAudits;

          this.failedAudits =
            response.failedAudits;

          this.averageTime =
            Math.round(
              response.averageResponseTimeMs
            );

          this.loadingStatistics = false;
        },

        error: error => {
          console.error(
            'Failed to load dashboard statistics:',
            error
          );

          this.loadingStatistics = false;
        }
      });
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(): void {
    const search = this.searchText
      .trim()
      .toLowerCase();

    if (!search) {
      this.filteredHistory = [...this.history];
      return;
    }

    this.filteredHistory = this.history.filter(
      audit =>
        audit.url
          .toLowerCase()
          .includes(search)
    );
  }

  clearSearch(): void {
    this.searchText = '';
    this.filteredHistory = [...this.history];
  }

  // =========================================================
  // AUDIT WEBSITE
  // =========================================================

  auditWebsite(): void {
    const websiteUrl = this.url.trim();

    if (!websiteUrl) {
      alert('Please enter a website URL.');
      return;
    }

    if (this.loading) {
      return;
    }

    const request: AuditRequest = {
      url: websiteUrl
    };

    this.loading = true;

    this.auditService
      .audit(request)
      .subscribe({
        next: response => {
          this.result = response;
          this.url = '';
          this.loading = false;

          this.currentPage = 1;

          this.loadHistory();
          this.loadStatistics();
        },

        error: error => {
          console.error(
            'Unable to audit website:',
            error
          );

          this.loading = false;

          alert(
            error?.error?.message ||
            'Unable to complete the audit. Please try again.'
          );
        }
      });
  }

  // =========================================================
  // VIEW AUDIT
  // =========================================================

  viewAudit(audit: AuditHistory): void {
    this.auditService
      .getAuditById(audit.id)
      .subscribe({
        next: result => {
          this.dialog.open(
            AuditResultComponent,
            {
              width: '900px',
              maxWidth: '95vw',
              maxHeight: '90vh',
              data: {
                audit: result
              }
            }
          );
        },

        error: error => {
          console.error(
            'Unable to load audit result:',
            error
          );

          alert(
            'Unable to load the audit result. Please try again.'
          );
        }
      });
  }

  // =========================================================
  // DELETE AUDIT
  // =========================================================

  deleteAudit(id: number): void {
    const confirmed = confirm(
      'Are you sure you want to delete this audit?'
    );

    if (!confirmed) {
      return;
    }

    this.auditService
      .deleteAudit(id)
      .subscribe({
        next: () => {
          this.loadHistory();
          this.loadStatistics();
        },

        error: error => {
          console.error(
            'Unable to delete audit:',
            error
          );

          alert(
            error?.error?.message ||
            'Unable to delete the audit. Please try again.'
          );
        }
      });
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;

    this.loadHistory();
  }

  // =========================================================
  // STATUS
  // =========================================================

  getStatusText(audit: AuditHistory): string {
    return audit.isReachable
      ? 'Successful'
      : 'Failed';
  }

  getStatusClass(audit: AuditHistory): string {
    return audit.isReachable
      ? 'success'
      : 'failed';
  }

  // =========================================================
  // RESPONSE CHART
  // =========================================================

  updateResponseChart(): void {
    const sortedHistory = [...this.history].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );

    this.responseChartData = {
      labels: sortedHistory.map(audit =>
        new Date(audit.createdAt).toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        )
      ),

      datasets: [
        {
          data: sortedHistory.map(
            audit => audit.responseTimeMs ?? 0
          ),

          label: 'Response Time (ms)',
          tension: 0.3,
          fill: false
        }
      ]
    };
  }
}