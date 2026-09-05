import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { AuditService } from '../../../core/services/audit.service';
import { AuditStatistics } from '../../../core/models/audit-statistics.model';
import { AuditHistory } from '../../../core/models/audit-history.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  statistics: AuditStatistics | null = null;
  history: AuditHistory[] = [];
  loading = false;

  constructor(
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;

    this.auditService.getStatistics().subscribe({
      next: response => {
        this.statistics = response;
        this.loadHistory();
      },
      error: error => {
        console.error(
          'Failed to load report statistics:',
          error
        );

        this.statistics = null;
        this.history = [];
        this.loading = false;
      }
    });
  }

  private loadHistory(): void {
    this.auditService
      .getHistory(1, 50, '', 'all', 'latest')
      .subscribe({
        next: response => {
          this.history = response.items ?? [];
          this.loading = false;
        },
        error: error => {
          console.error(
            'Failed to load report history:',
            error
          );

          this.history = [];
          this.loading = false;
        }
      });
  }

  get successRate(): number {
    if (!this.statistics || this.statistics.totalAudits === 0) {
      return 0;
    }

    return Math.round(
      (this.statistics.successfulAudits /
        this.statistics.totalAudits) *
        100
    );
  }

  getAverageSeoScore(): number {
    const scores = this.history
      .map(audit => audit.seoScore)
      .filter(
        (score): score is number =>
          score !== null &&
          score !== undefined
      );

    if (scores.length === 0) {
      return 0;
    }

    return Math.round(
      scores.reduce(
        (total, score) => total + score,
        0
      ) / scores.length
    );
  }

  getSeoLabel(score: number): string {
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

  exportCsv(): void {
    if (this.history.length === 0) {
      alert(
        'No audit records available to export.'
      );
      return;
    }

    const headers = [
      'Website',
      'Status',
      'HTTP Status',
      'Response Time (ms)',
      'SEO Score',
      'SSL',
      'Date'
    ];

    const rows = this.history.map(audit => [
      audit.url,
      audit.isReachable
        ? 'Successful'
        : 'Failed',
      audit.statusCode,
      audit.responseTimeMs,
      audit.seoScore ?? '',
      audit.isSslValid === true
        ? 'Valid'
        : audit.isSslValid === false
          ? 'Invalid'
          : 'Unknown',
      this.formatDate(audit.createdAt)
    ]);

    const csv = [
      headers,
      ...rows
    ]
      .map(row =>
        row
          .map(value =>
            `"${String(value ?? '').replace(
              /"/g,
              '""'
            )}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob(
      [csv],
      {
        type: 'text/csv;charset=utf-8;'
      }
    );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;
    link.download =
      `audit-report-${this.getFileDate()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  }

  exportPdf(): void {
    if (
      !this.statistics ||
      this.history.length === 0
    ) {
      alert(
        'No report data available to export.'
      );
      return;
    }

    const doc = new jsPDF();
    const averageSeo =
      this.getAverageSeoScore();

    // Title

    doc.setFontSize(20);
    doc.text(
      'URL Audit Report',
      14,
      20
    );

    doc.setFontSize(10);
    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      14,
      28
    );

    // Summary

    doc.setFontSize(14);
    doc.text(
      'Audit Summary',
      14,
      42
    );

    doc.setFontSize(10);

    doc.text(
      `Total Audits: ${this.statistics.totalAudits}`,
      14,
      52
    );

    doc.text(
      `Successful: ${this.statistics.successfulAudits}`,
      14,
      59
    );

    doc.text(
      `Failed: ${this.statistics.failedAudits}`,
      14,
      66
    );

    doc.text(
      `Success Rate: ${this.successRate}%`,
      14,
      73
    );

    doc.text(
      `Average Response: ${this.statistics.averageResponseTimeMs} ms`,
      14,
      80
    );

    doc.text(
      `Average SEO Score: ${averageSeo}/100`,
      14,
      87
    );

    // Audit table

    const tableData =
      this.history.map(audit => [
        audit.url,
        audit.isReachable
          ? 'Successful'
          : 'Failed',
        audit.statusCode,
        `${audit.responseTimeMs} ms`,
        audit.seoScore ?? 'N/A',
        audit.isSslValid === true
          ? 'Valid'
          : audit.isSslValid === false
            ? 'Invalid'
            : 'Unknown',
        this.formatDate(audit.createdAt)
      ]);

    autoTable(doc, {
      startY: 98,

      head: [[
        'Website',
        'Status',
        'HTTP',
        'Response',
        'SEO',
        'SSL',
        'Date'
      ]],

      body: tableData,

      styles: {
        fontSize: 7
      },

      headStyles: {
        fontSize: 7
      },

      columnStyles: {
        0: {
          cellWidth: 42
        }
      }
    });

    // Footer

    const pageCount =
      doc.getNumberOfPages();

    for (
      let page = 1;
      page <= pageCount;
      page++
    ) {
      doc.setPage(page);

      doc.setFontSize(8);

      doc.text(
        `URL Audit Report - Page ${page} of ${pageCount}`,
        14,
        290
      );
    }

    doc.save(
      `audit-report-${this.getFileDate()}.pdf`
    );
  }

  private formatDate(
    value: string
  ): string {
    return new Date(value).toLocaleString();
  }

  private getFileDate(): string {
    return new Date()
      .toISOString()
      .split('T')[0];
  }
}