import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { AuditHistory } from '../../../core/models/audit-history.model';

@Component({
  selector: 'app-audit-result-dialog',
  standalone: true,

  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule
  ],

  templateUrl: './audit-result-dialog.component.html',
  styleUrls: ['./audit-result-dialog.component.css']
})
export class AuditResultDialogComponent {

  constructor(
    private dialogRef: MatDialogRef<AuditResultDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: {
      result: AuditHistory;
    }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}