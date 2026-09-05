import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  registerables
} from 'chart.js';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuditService } from '../../core/services/audit.service';
import { Website } from '../../core/models/website.model';
import { AuditHistory } from '../../core/models/audit-history.model';
import { AuditResponse } from '../../core/models/audit-response.model';
import { AuditResultComponent } from '../audit-result/audit-result.component';

Chart.register(...registerables);

@Component({
  selector: 'app-website-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDividerModule,
    MatChipsModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,

    BaseChartDirective
  ],
  templateUrl: './website-details.component.html',
  styleUrl: './website-details.component.scss'
})
export class WebsiteDetailsComponent implements OnInit {

  website!: Website;
  history: AuditHistory[] = [];

  loading = true;

  // History
  searchText = '';

  statusFilter: 'all' | 'successful' | 'failed' = 'all';

  historySort:
    | 'latest'
    | 'oldest'
    | 'fastest'
    | 'slowest' = 'latest';

  currentHistoryPage = 1;
  historyPageSize = 10;

  // Statistics
  totalAudits = 0;
  successfulAudits = 0;
  failedAudits = 0;
  averageResponseTime = 0;
  fastestResponseTime = 0;
  slowestResponseTime = 0;
  successRate = 0;

  // Latest audit
  latestAudit?: AuditResponse;
  latestAuditCreatedAt?: string;

  // SEO
  seoRecommendations: string[] = [];

  // History table
  displayedColumns: string[] = [
    'createdAt',
    'statusCode',
    'responseTimeMs',
    'status',
    'message',
    'action'
  ];

  // Response-time chart
  responseChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  responseChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: 'index',
      intersect: false
    },

    plugins: {
      legend: {
        display: true,
        position: 'top'
      },

      tooltip: {
        enabled: true,

        callbacks: {
          title: items => items[0]?.label ?? '',
          label: context =>
            ` Response Time: ${context.parsed.y} ms`
        }
      }
    },

    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 1000,

        ticks: {
          callback: value => `${value} ms`
        },

        title: {
          display: true,
          text: 'Response Time (ms)'
        }
      },

      x: {
        title: {
          display: true,
          text: 'Audit Time'
        },

        ticks: {
          maxTicksLimit: 8,
          autoSkip: true
        }
      }
    }
  };

  constructor(
    private auditService: AuditService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<WebsiteDetailsComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: {
      website: Website;
    }
  ) {}

  ngOnInit(): void {
    this.website = this.data.website;
    this.loadHistory();
  }

  // ---------------------------------------------------------------------------
  // DATA
  // ---------------------------------------------------------------------------

  loadHistory(): void {
    this.loading = true;

    this.auditService
      .getWebsiteHistory(this.website.id)
      .subscribe({
        next: history => {
          this.history = history ?? [];

          this.calculateStatistics();
          this.buildResponseTimeChart();

          this.loading = false;
        },

        error: err => {
          console.error(
            'Unable to load website history:',
            err
          );

          this.history = [];

          this.calculateStatistics();
          this.buildResponseTimeChart();

          this.loading = false;
        }
      });
  }

  calculateStatistics(): void {
    this.totalAudits = this.history.length;

    this.successfulAudits = this.history.filter(
      audit => audit.isReachable
    ).length;

    this.failedAudits =
      this.totalAudits - this.successfulAudits;

    if (this.totalAudits === 0) {
      this.resetStatistics();
      return;
    }

    const responseTimes = this.history
      .map(audit => audit.responseTimeMs)
      .filter(
        time =>
          typeof time === 'number' &&
          Number.isFinite(time)
      );

    if (responseTimes.length > 0) {
      const totalResponseTime = responseTimes.reduce(
        (sum, time) => sum + time,
        0
      );

      this.averageResponseTime = Math.round(
        totalResponseTime / responseTimes.length
      );

      this.fastestResponseTime =
        Math.min(...responseTimes);

      this.slowestResponseTime =
        Math.max(...responseTimes);
    } else {
      this.averageResponseTime = 0;
      this.fastestResponseTime = 0;
      this.slowestResponseTime = 0;
    }

    this.successRate = Math.round(
      (this.successfulAudits / this.totalAudits) * 100
    );

    const latest = [...this.history].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )[0];

    this.latestAuditCreatedAt = latest.createdAt;

    this.latestAudit = {
      success: latest.isReachable,
      url: latest.url ?? this.website.url,
      statusCode: latest.statusCode,
      responseTimeMs: latest.responseTimeMs,
      isReachable: latest.isReachable,
      message: latest.message,

      httpVersion: latest.httpVersion ?? undefined,
      server: latest.server ?? undefined,
      contentType: latest.contentType ?? undefined,
      contentLength: latest.contentLength ?? undefined,

      isRedirect: latest.isRedirect ?? undefined,
      redirectLocation: latest.redirectLocation,
      isSslValid: latest.isSslValid ?? undefined,

      title: latest.title,
      metaDescription: latest.metaDescription,

      h1Count: latest.h1Count ?? undefined,
      h2Count: latest.h2Count ?? undefined,

      images: latest.images ?? undefined,
      imagesWithoutAlt:
        latest.imagesWithoutAlt ?? undefined,

      seoScore: latest.seoScore ?? undefined
    };

    this.seoRecommendations =
      this.getSeoRecommendations();
  }

  private resetStatistics(): void {
    this.averageResponseTime = 0;
    this.fastestResponseTime = 0;
    this.slowestResponseTime = 0;
    this.successRate = 0;

    this.latestAudit = undefined;
    this.latestAuditCreatedAt = undefined;
    this.seoRecommendations = [];
  }

  // ---------------------------------------------------------------------------
  // CHART
  // ---------------------------------------------------------------------------

  buildResponseTimeChart(): void {
    const validHistory = [...this.history]
      .filter(
        audit =>
          typeof audit.responseTimeMs === 'number' &&
          Number.isFinite(audit.responseTimeMs)
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );

    if (validHistory.length === 0) {
      this.responseChartData = {
        labels: [],
        datasets: []
      };

      return;
    }

    const labels = validHistory.map(audit =>
      new Date(audit.createdAt).toLocaleString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }
      )
    );

    const responseTimes = validHistory.map(
      audit => Number(audit.responseTimeMs)
    );

    this.responseChartData = {
      labels,

      datasets: [
        {
          label: 'Response Time (ms)',
          data: responseTimes,
          tension: 0.3,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 7,
          borderWidth: 3
        }
      ]
    };
  }

  getResponseBarWidth(responseTime: number): number {
    const responseTimes = this.history
      .map(audit => audit.responseTimeMs)
      .filter(
        time =>
          typeof time === 'number' &&
          Number.isFinite(time)
      );

    if (
      responseTimes.length === 0 ||
      responseTime <= 0
    ) {
      return 0;
    }

    const maxTime = Math.max(...responseTimes);

    if (maxTime <= 0) {
      return 0;
    }

    return Math.max(
      5,
      Math.round((responseTime / maxTime) * 100)
    );
  }

  // ---------------------------------------------------------------------------
  // SEO
  // ---------------------------------------------------------------------------

  getSeoScore(): number {
    const score = this.latestAudit?.seoScore ?? 0;

    return Math.max(
      0,
      Math.min(100, score)
    );
  }

  getSeoGrade(): string {
    const score = this.getSeoScore();

    if (score >= 80) {
      return 'Excellent';
    }

    if (score >= 60) {
      return 'Good';
    }

    if (score >= 40) {
      return 'Needs Improvement';
    }

    return 'Poor';
  }

  getSeoScoreColor(): string {
    const score = this.getSeoScore();

    if (score >= 80) {
      return '#16a34a';
    }

    if (score >= 60) {
      return '#2563eb';
    }

    if (score >= 40) {
      return '#d97706';
    }

    return '#dc2626';
  }

  getSeoRecommendations(): string[] {
    if (!this.latestAudit) {
      return [];
    }

    const recommendations: string[] = [];

    if (!this.latestAudit.metaDescription) {
      recommendations.push(
        'Add a meta description to help search engines understand the page.'
      );
    }

    if ((this.latestAudit.h1Count ?? 0) === 0) {
      recommendations.push(
        'Add one clear H1 heading that describes the main purpose of the page.'
      );
    }

    if ((this.latestAudit.h1Count ?? 0) > 1) {
      recommendations.push(
        'Consider using a single primary H1 heading for the page.'
      );
    }

    if ((this.latestAudit.h2Count ?? 0) === 0) {
      recommendations.push(
        'Add H2 headings to organize the page content into meaningful sections.'
      );
    }

    if ((this.latestAudit.imagesWithoutAlt ?? 0) > 0) {
      recommendations.push(
        `Add ALT text to ${this.latestAudit.imagesWithoutAlt} image(s) for accessibility and SEO.`
      );
    }

    if (!this.latestAudit.title) {
      recommendations.push(
        'Add a descriptive page title.'
      );
    }

    if (this.latestAudit.isSslValid === false) {
      recommendations.push(
        'Fix the website SSL certificate and ensure the site is served securely over HTTPS.'
      );
    }

    return recommendations;
  }

  // ---------------------------------------------------------------------------
  // HISTORY FILTERING / SORTING / PAGINATION
  // ---------------------------------------------------------------------------

  get filteredHistory(): AuditHistory[] {
    let result = [...this.history];

    const search = this.searchText
      .trim()
      .toLowerCase();

    if (search) {
      result = result.filter(audit => {
        const url =
          (audit.url ?? '').toLowerCase();

        const status =
          String(audit.statusCode ?? '');

        const message =
          (audit.message ?? '').toLowerCase();

        const auditStatus =
          audit.isReachable
            ? 'successful'
            : 'failed';

        return (
          url.includes(search) ||
          status.includes(search) ||
          message.includes(search) ||
          auditStatus.includes(search)
        );
      });
    }

    if (this.statusFilter === 'successful') {
      result = result.filter(
        audit => audit.isReachable
      );
    }

    if (this.statusFilter === 'failed') {
      result = result.filter(
        audit => !audit.isReachable
      );
    }

    return result;
  }

  get sortedHistory(): AuditHistory[] {
    const result = [...this.filteredHistory];

    switch (this.historySort) {
      case 'oldest':
        return result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );

      case 'fastest':
        return result.sort(
          (a, b) =>
            (a.responseTimeMs ?? 0) -
            (b.responseTimeMs ?? 0)
        );

      case 'slowest':
        return result.sort(
          (a, b) =>
            (b.responseTimeMs ?? 0) -
            (a.responseTimeMs ?? 0)
        );

      case 'latest':
      default:
        return result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
    }
  }

  get paginatedHistory(): AuditHistory[] {
    const start =
      (this.currentHistoryPage - 1) *
      this.historyPageSize;

    return this.sortedHistory.slice(
      start,
      start + this.historyPageSize
    );
  }

  get totalHistoryPages(): number {
    return Math.ceil(
      this.sortedHistory.length /
      this.historyPageSize
    );
  }

  get historyDisplayEnd(): number {
    return Math.min(
      this.currentHistoryPage *
        this.historyPageSize,
      this.sortedHistory.length
    );
  }

  resetHistoryPage(): void {
    this.currentHistoryPage = 1;
  }

  changeHistorySort(): void {
    this.resetHistoryPage();
  }

  nextHistoryPage(): void {
    if (
      this.currentHistoryPage <
      this.totalHistoryPages
    ) {
      this.currentHistoryPage++;
    }
  }

  previousHistoryPage(): void {
    if (this.currentHistoryPage > 1) {
      this.currentHistoryPage--;
    }
  }

  // ---------------------------------------------------------------------------
  // AUDIT ACTIONS
  // ---------------------------------------------------------------------------

  openAuditResult(audit: AuditHistory): void {
    this.dialog.open(
      AuditResultComponent,
      {
        width: '900px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        data: {
          audit
        }
      }
    );
  }

  deleteAudit(
    audit: AuditHistory,
    event: Event
  ): void {
    event.stopPropagation();

    const confirmed = confirm(
      `Delete this audit?\n\n${audit.url}`
    );

    if (!confirmed) {
      return;
    }

    this.auditService
      .deleteAudit(audit.id)
      .subscribe({
        next: () => {
          this.history = this.history.filter(
            item => item.id !== audit.id
          );

          this.calculateStatistics();
          this.buildResponseTimeChart();

          const totalPages =
            this.totalHistoryPages;

          if (totalPages === 0) {
            this.currentHistoryPage = 1;
            return;
          }

          this.currentHistoryPage =
            Math.min(
              this.currentHistoryPage,
              totalPages
            );
        },

        error: err => {
          console.error(
            'Unable to delete audit:',
            err
          );

          alert(
            'Unable to delete audit.'
          );
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}