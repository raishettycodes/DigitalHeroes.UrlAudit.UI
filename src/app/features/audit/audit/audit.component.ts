import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AuditService } from '../../../core/services/audit.service';
import { AuthService } from '../../../core/services/auth.service';

import { AuditResponse } from '../../../core/models/audit-response.model';
import { AuditHistory } from '../../../core/models/audit-history.model';
import { Website } from '../../../core/models/website.model';

import { AuditResultComponent } from '../../audit-result/audit-result.component';
import { EditWebsiteDialogComponent } from '../../website/edit-website-dialog/edit-website-dialog.component';
import { WebsiteHistoryDialogComponent } from '../website-history-dialog/website-history-dialog.component';
import { WebsiteDetailsComponent } from '../../website-details/website-details.component';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.css'
})
export class AuditComponent implements OnInit {

  // =====================================================
  // AUDIT
  // =====================================================

  url = '';
  loading = false;
  result?: AuditResponse;


  // =====================================================
  // HISTORY TABLE
  // =====================================================

  displayedColumns: string[] = [
    'url',
    'status',
    'http',
    'time',
    'action'
  ];

  history: AuditHistory[] = [];

  totalHistoryRecords = 0;
  currentHistoryPage = 1;
  historyPageSize = 10;

  historyPageSizes = [5, 10, 25, 50];
  historyTotalPages = 0;


  // =====================================================
  // HISTORY SEARCH / FILTER / SORT
  // =====================================================

  searchText = '';

  statusFilter:
    | 'all'
    | 'successful'
    | 'failed' = 'all';

  historySort:
    | 'latest'
    | 'oldest'
    | 'fastest'
    | 'slowest' = 'latest';


  // =====================================================
  // SAVED WEBSITES
  // =====================================================

  websites: Website[] = [];

  websiteSearchText = '';

  showAddWebsite = false;

  newWebsiteName = '';
  newWebsiteUrl = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private auditService: AuditService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}


  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {
    this.loadHistory();
    this.loadWebsites();
  }


  // =====================================================
  // LOAD HISTORY
  // =====================================================

  loadHistory(): void {
    this.auditService
      .getHistory(
        this.currentHistoryPage,
        this.historyPageSize,
        this.searchText.trim(),
        this.statusFilter,
        this.historySort
      )
      .subscribe({
        next: response => {
          this.history = response.items ?? [];

          this.currentHistoryPage =
            response.page ?? this.currentHistoryPage;

          this.historyPageSize =
            response.pageSize ?? this.historyPageSize;

          this.totalHistoryRecords =
            response.totalRecords ?? 0;

          this.historyTotalPages =
            response.totalPages ?? 0;
        },

        error: error => {
          console.error(
            'Failed to load audit history:',
            error
          );

          this.history = [];
          this.totalHistoryRecords = 0;
          this.historyTotalPages = 0;
        }
      });
  }


  // =====================================================
  // LOAD SAVED WEBSITES
  // =====================================================

  loadWebsites(): void {
    this.auditService
      .getWebsites()
      .subscribe({
        next: websites => {
          this.websites = websites ?? [];
        },

        error: error => {
          console.error(
            'Unable to load websites:',
            error
          );

          this.websites = [];
        }
      });
  }


  // =====================================================
  // RUN AUDIT
  // =====================================================

  auditWebsite(): void {
    const websiteUrl = this.url.trim();

    if (!websiteUrl) {
      alert('Please enter a URL.');
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;
    this.result = undefined;

    this.auditService
      .audit({ url: websiteUrl })
      .subscribe({
        next: response => {
          this.result = response;
          this.loading = false;

          this.currentHistoryPage = 1;

          this.loadHistory();
          this.loadWebsites();
        },

        error: error => {
          console.error(
            'Audit failed:',
            error
          );

          this.loading = false;

          if (error.status === 403) {
            const message =
              error?.error?.message ||
              'Your monthly audit limit has been reached.';

            alert(
              `${message}\n\nPlease upgrade your plan to continue auditing.`
            );

            return;
          }

          if (error.status === 401) {
            alert(
              'Your session has expired. Please login again.'
            );

            this.authService.logout();
            this.router.navigate(['/login']);

            return;
          }

          alert(
            error?.error?.message ||
            'Unable to audit the website. Please try again.'
          );
        }
      });
  }


  // =====================================================
  // AUDIT SAVED WEBSITE
  // =====================================================

  auditSavedWebsite(
    websiteUrl: string
  ): void {
    const url = websiteUrl.trim();

    if (!url) {
      alert('Invalid website URL.');
      return;
    }

    this.url = url;
    this.auditWebsite();
  }


  // =====================================================
  // OPEN AUDIT RESULT
  // =====================================================

  openAuditResult(
    audit: AuditHistory
  ): void {
    if (!audit?.id) {
      console.warn(
        'Cannot open audit result. Audit ID is missing.'
      );

      return;
    }

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
            'Unable to load audit result.'
          );
        }
      });
  }


  // =====================================================
  // DELETE AUDIT
  // =====================================================

  deleteAudit(
    audit: AuditHistory,
    event?: Event
  ): void {
    event?.stopPropagation();

    if (!audit?.id) {
      return;
    }

    if (!confirm('Delete this audit?')) {
      return;
    }

    this.auditService
      .deleteAudit(audit.id)
      .subscribe({
        next: () => {
          if (
            this.history.length === 1 &&
            this.currentHistoryPage > 1
          ) {
            this.currentHistoryPage--;
          }

          this.loadHistory();
        },

        error: error => {
          console.error(
            'Unable to delete audit:',
            error
          );

          alert(
            'Unable to delete audit.'
          );
        }
      });
  }


  // =====================================================
  // FILTERED WEBSITES
  // =====================================================

  get filteredWebsites(): Website[] {
    const search =
      this.websiteSearchText
        .trim()
        .toLowerCase();

    if (!search) {
      return this.websites;
    }

    return this.websites.filter(
      website =>
        website.name
          .toLowerCase()
          .includes(search) ||
        website.url
          .toLowerCase()
          .includes(search)
    );
  }


  // =====================================================
  // HISTORY PAGINATION
  // =====================================================

  get totalHistoryPages(): number {
    return this.historyTotalPages || 1;
  }

  get historyDisplayStart(): number {
    if (this.totalHistoryRecords === 0) {
      return 0;
    }

    return (
      (this.currentHistoryPage - 1) *
      this.historyPageSize
    ) + 1;
  }

  get historyDisplayEnd(): number {
    return Math.min(
      this.currentHistoryPage *
        this.historyPageSize,
      this.totalHistoryRecords
    );
  }


  // =====================================================
  // HISTORY SEARCH
  // =====================================================

  onHistorySearch(): void {
    this.currentHistoryPage = 1;
    this.loadHistory();
  }


  // =====================================================
  // HISTORY STATUS FILTER
  // =====================================================

  onHistoryStatusChange(): void {
    this.currentHistoryPage = 1;
    this.loadHistory();
  }


  // =====================================================
  // HISTORY SORT
  // =====================================================

  changeHistorySort(): void {
    this.currentHistoryPage = 1;
    this.loadHistory();
  }


  // =====================================================
  // PAGINATOR
  // =====================================================

  onHistoryPageChange(
    event: PageEvent
  ): void {
    this.currentHistoryPage =
      event.pageIndex + 1;

    this.historyPageSize =
      event.pageSize;

    this.loadHistory();
  }


  // =====================================================
  // EDIT WEBSITE
  // =====================================================

  editWebsite(
    website: Website
  ): void {
    const dialogRef =
      this.dialog.open(
        EditWebsiteDialogComponent,
        {
          width: '500px',
          data: website
        }
      );

    dialogRef
      .afterClosed()
      .subscribe({
        next: (
          updatedWebsite: Website | undefined
        ) => {
          if (!updatedWebsite) {
            return;
          }

          this.auditService
            .updateWebsite(
              updatedWebsite.id,
              {
                name: updatedWebsite.name,
                url: updatedWebsite.url,
                isActive:
                  updatedWebsite.isActive
              }
            )
            .subscribe({
              next: () => {
                this.loadWebsites();
              },

              error: error => {
                console.error(
                  'Unable to update website:',
                  error
                );

                alert(
                  'Unable to update website.'
                );
              }
            });
        }
      });
  }


  // =====================================================
  // DELETE WEBSITE
  // =====================================================

  deleteWebsite(
    website: Website
  ): void {
    if (!website?.id) {
      return;
    }

    if (
      !confirm(
        `Delete "${website.name}"?`
      )
    ) {
      return;
    }

    this.auditService
      .deleteWebsite(website.id)
      .subscribe({
        next: () => {
          this.loadWebsites();
        },

        error: error => {
          console.error(
            'Unable to delete website:',
            error
          );

          alert(
            'Unable to delete website.'
          );
        }
      });
  }


  // =====================================================
  // ADD WEBSITE
  // =====================================================

  addWebsite(): void {
    const name =
      this.newWebsiteName.trim();

    const url =
      this.newWebsiteUrl.trim();

    if (!name) {
      alert(
        'Please enter website name.'
      );

      return;
    }

    if (!url) {
      alert(
        'Please enter website URL.'
      );

      return;
    }

    this.auditService
      .addWebsite({
        name,
        url
      })
      .subscribe({
        next: website => {
          this.websites.unshift(website);

          this.newWebsiteName = '';
          this.newWebsiteUrl = '';
          this.showAddWebsite = false;
        },

        error: error => {
          console.error(
            'Unable to add website:',
            error
          );

          alert(
            'Unable to add website.'
          );
        }
      });
  }


  // =====================================================
  // VIEW WEBSITE HISTORY
  // =====================================================

  viewWebsiteHistory(
    website: Website
  ): void {
    if (!website?.id) {
      return;
    }

    this.auditService
      .getWebsiteHistory(website.id)
      .subscribe({
        next: history => {
          this.dialog.open(
            WebsiteHistoryDialogComponent,
            {
              width: '900px',
              maxWidth: '95vw',
              data: {
                website,
                history: history ?? []
              }
            }
          );
        },

        error: error => {
          console.error(
            'Unable to load website history:',
            error
          );

          alert(
            'Unable to load website history.'
          );
        }
      });
  }


  // =====================================================
  // WEBSITE DETAILS
  // =====================================================

  openWebsiteDetails(
    website: Website
  ): void {
    this.dialog.open(
      WebsiteDetailsComponent,
      {
        width: '950px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        data: {
          website
        }
      }
    );
  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


  // =====================================================
  // SEO SCORE
  // =====================================================

  getSeoScore(): number {
    const score =
      this.result?.seoScore ?? 0;

    return Math.max(
      0,
      Math.min(100, score)
    );
  }


  // =====================================================
  // SEO GRADE
  // =====================================================

  getSeoGrade(): string {
    const score =
      this.getSeoScore();

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


  // =====================================================
  // SEO SCORE COLOR
  // =====================================================

  getSeoScoreColor(): string {
    const score =
      this.getSeoScore();

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
}