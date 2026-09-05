import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuditService } from '../../../core/services/audit.service';
import { AuditStatistics } from '../../../core/models/audit-statistics.model';
import { AuditHistory } from '../../../core/models/audit-history.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  statistics: AuditStatistics | null = null;

  history: AuditHistory[] = [];

  loading = true;

  constructor(
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.loadAdminData();
  }

  loadAdminData(): void {

    this.loading = true;

    this.auditService.getStatistics().subscribe({

      next: (response) => {

        this.statistics = response;

        this.loading = false;

      },

      error: (error) => {

        console.error(
          'Failed to load admin statistics:',
          error
        );

        this.loading = false;

      }

    });

    this.auditService
      .getHistory(1, 10)
      .subscribe({

        next: (response) => {

          this.history = response.items;

        },

        error: (error) => {

          console.error(
            'Failed to load admin audit history:',
            error
          );

        }

      });

  }

  get successRate(): number {

    if (!this.statistics?.totalAudits) {
      return 0;
    }

    return Math.round(
      (
        this.statistics.successfulAudits /
        this.statistics.totalAudits
      ) * 100
    );

  }

}