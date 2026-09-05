import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AuditService } from '../../core/services/audit.service';
import { AuditHistory } from '../../core/models/audit-history.model';
import { AuditResultComponent } from '../audit-result/audit-result.component';

@Component({
  selector: 'app-audit-history',
  standalone: true,

  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatCardModule,
    MatDialogModule
  ],

  templateUrl: './audit-history.component.html',
  styleUrl: './audit-history.component.css'
})
export class AuditHistoryComponent implements OnInit {

  history: AuditHistory[] = [];

  loading = false;

  page = 1;
  pageSize = 10;

  totalRecords = 0;
  totalPages = 0;

  // displayedColumns: string[] = [
  //   'createdAt',
  //   'url',
  //   'statusCode',
  //   'responseTimeMs',
  //   'seoScore',
  //   'status',
  //   'action'
  // ];

  displayedColumns = [
  'createdAt',
  'url',
  'statusCode',
  'responseTimeMs',
  'seoScore',
  'status',
  'action'
];

  constructor(
    private auditService: AuditService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {

    this.loading = true;

    this.auditService
      .getHistory(this.page, this.pageSize)
      .subscribe({

        next: (response) => {

          this.history = response.items;

          this.totalRecords = response.totalRecords;
          this.totalPages = response.totalPages;

          this.loading = false;
        },

        error: (err) => {

          console.error(
            'Unable to load audit history:',
            err
          );

          this.loading = false;
        }

      });
  }

  onPageChange(event: PageEvent): void {

    this.page = event.pageIndex + 1;

    this.pageSize = event.pageSize;

    this.loadHistory();
  }

  getStatusText(audit: AuditHistory): string {

    return audit.isReachable
      ? 'Successful'
      : 'Failed';
  }

  openAuditResult(audit: AuditHistory): void {

    console.log('Opening audit result:', audit);

    this.auditService
      .getAuditById(audit.id)
      .subscribe({

        next: (result) => {

          console.log('Audit result loaded:', result);

          this.dialog.open(AuditResultComponent, {

            width: '900px',

            maxWidth: '95vw',

            maxHeight: '90vh',

            data: {
              audit: result
            }

          });

        },

        error: (err) => {

          console.error(
            'Unable to load audit result:',
            err
          );

        }

      });
  }
}

