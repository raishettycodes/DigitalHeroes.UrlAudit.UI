import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { AuditHistory } from '../../core/models/audit-history.model';
import { AuditResponse } from '../../core/models/audit-response.model';

type AuditResult = AuditHistory | AuditResponse;

@Component({
  selector: 'app-audit-result',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './audit-result.component.html',
  styleUrl: './audit-result.component.css'
})
export class AuditResultComponent {

  constructor(
    private dialogRef: MatDialogRef<AuditResultComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: { audit: AuditResult }
  ) {}

  get audit(): AuditResult {
    return this.data.audit;
  }

  close(): void {
    this.dialogRef.close();
  }

  // ==========================================
  // SEO SCORE
  // ==========================================

  getSeoScore(): number {
    return Math.max(
      0,
      Math.min(100, this.audit.seoScore ?? 0)
    );
  }

  getSeoScoreDegrees(): number {
    return (this.getSeoScore() / 100) * 360;
  }

  // ==========================================
  // SEO GRADE
  // ==========================================

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

  getSeoGradeClass(): string {
    const score = this.getSeoScore();

    if (score >= 80) {
      return 'seo-excellent';
    }

    if (score >= 60) {
      return 'seo-good';
    }

    if (score >= 40) {
      return 'seo-warning';
    }

    return 'seo-poor';
  }

  // ==========================================
  // SEO RECOMMENDATIONS
  // ==========================================

  getSeoRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!this.audit.metaDescription) {
      recommendations.push(
        'Add a meta description to help search engines understand the page.'
      );
    }

    if ((this.audit.h1Count ?? 0) === 0) {
      recommendations.push(
        'Add one clear H1 heading that describes the main purpose of the page.'
      );
    }

    if ((this.audit.h1Count ?? 0) > 1) {
      recommendations.push(
        'Consider using a single primary H1 heading for the page.'
      );
    }

    if ((this.audit.h2Count ?? 0) === 0) {
      recommendations.push(
        'Add H2 headings to organize the page content into meaningful sections.'
      );
    }

    if ((this.audit.imagesWithoutAlt ?? 0) > 0) {
      recommendations.push(
        `Add ALT text to ${this.audit.imagesWithoutAlt} image(s) for accessibility and SEO.`
      );
    }

    if (!this.audit.title) {
      recommendations.push(
        'Add a descriptive page title.'
      );
    }

    if (this.audit.isSslValid === false) {
      recommendations.push(
        'Fix the website SSL certificate and ensure the site is served securely over HTTPS.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'No major SEO issues were detected.'
      );
    }

    return recommendations;
  }
}