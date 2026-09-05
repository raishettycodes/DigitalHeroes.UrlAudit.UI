import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuditHistory } from '../../../core/models/audit-history.model';
import { Website } from '../../../core/models/website.model';

import { AuditResultComponent } from '../../audit-result/audit-result.component';

@Component({
  selector: 'app-website-history-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './website-history-dialog.component.html',
  styleUrls: ['./website-history-dialog.component.css']
})
export class WebsiteHistoryDialogComponent {

  displayedColumns: string[] = [
    'createdAt',
    'statusCode',
    'responseTimeMs',
    'status',
    'seoScore',
    'message',
    'action'
  ];

  constructor(
    private dialogRef: MatDialogRef<WebsiteHistoryDialogComponent>,
    private dialog: MatDialog,

    @Inject(MAT_DIALOG_DATA)
    public data: {
      website: Website;
      history: AuditHistory[];
    }
  ) {}

  viewAudit(audit: AuditHistory): void {
    this.dialog.open(AuditResultComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        audit
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}