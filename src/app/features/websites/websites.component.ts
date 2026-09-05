import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AuditService } from '../../core/services/audit.service';
import { Website } from '../../core/models/website.model';
import { AuditResultComponent } from '../audit-result/audit-result.component';

@Component({
  selector: 'app-websites',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './websites.component.html',
  styleUrl: './websites.component.css'
})
export class WebsitesComponent implements OnInit {

  websites: Website[] = [];

  loading = false;
  saving = false;
  auditing = false;

  searchText = '';

  showForm = false;
  editingId: number | null = null;

  websiteName = '';
  websiteUrl = '';
  isActive = true;

  constructor(
    private auditService: AuditService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadWebsites();
  }

  // ==========================================
  // LOAD WEBSITES
  // ==========================================

  loadWebsites(): void {
    this.loading = true;

    this.auditService.getWebsites().subscribe({
      next: (response: Website[]) => {
        this.websites = response ?? [];
        this.loading = false;
      },

      error: (error) => {
        console.error('Failed to load websites:', error);

        this.websites = [];
        this.loading = false;

        alert('Failed to load websites. Please try again.');
      }
    });
  }

  // ==========================================
  // FILTER
  // ==========================================

  get filteredWebsites(): Website[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.websites;
    }

    return this.websites.filter(website =>
      website.name.toLowerCase().includes(search) ||
      website.url.toLowerCase().includes(search)
    );
  }

  // ==========================================
  // ADD
  // ==========================================

  startAdd(): void {
    this.resetForm();

    this.showForm = true;
  }

  // ==========================================
  // EDIT
  // ==========================================

  startEdit(website: Website): void {
    this.editingId = website.id;
    this.websiteName = website.name;
    this.websiteUrl = website.url;
    this.isActive = website.isActive;

    this.showForm = true;
  }

  // ==========================================
  // CANCEL
  // ==========================================

  cancelForm(): void {
    this.resetForm();

    this.showForm = false;
  }

  // ==========================================
  // SAVE
  // ==========================================

  saveWebsite(): void {
    const name = this.websiteName.trim();
    const url = this.websiteUrl.trim();

    if (!name) {
      alert('Please enter website name.');
      return;
    }

    if (!url) {
      alert('Please enter website URL.');
      return;
    }

    if (!this.isValidUrl(url)) {
      alert('Please enter a valid website URL.');
      return;
    }

    this.saving = true;

    if (this.editingId !== null) {
      this.updateWebsite(name, url);
      return;
    }

    this.addWebsite(name, url);
  }

  // ==========================================
  // ADD WEBSITE
  // ==========================================

  private addWebsite(
    name: string,
    url: string
  ): void {
    this.auditService.addWebsite({
      name,
      url
    }).subscribe({
      next: () => {
        this.saving = false;
        this.cancelForm();
        this.loadWebsites();
      },

      error: (error) => {
        console.error('Failed to add website:', error);

        this.saving = false;

        alert(
          error?.error?.message ||
          'Failed to add website. Please try again.'
        );
      }
    });
  }

  // ==========================================
  // UPDATE WEBSITE
  // ==========================================

  private updateWebsite(
    name: string,
    url: string
  ): void {
    this.auditService.updateWebsite(
      this.editingId!,
      {
        name,
        url,
        isActive: this.isActive
      }
    ).subscribe({
      next: () => {
        this.saving = false;
        this.cancelForm();
        this.loadWebsites();
      },

      error: (error) => {
        console.error('Failed to update website:', error);

        this.saving = false;

        alert(
          error?.error?.message ||
          'Failed to update website. Please try again.'
        );
      }
    });
  }

  // ==========================================
  // DELETE
  // ==========================================

  deleteWebsite(website: Website): void {
    const confirmed = confirm(
      `Are you sure you want to delete "${website.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.auditService
      .deleteWebsite(website.id)
      .subscribe({
        next: () => {
          this.websites = this.websites.filter(
            item => item.id !== website.id
          );
        },

        error: (error) => {
          console.error(
            'Failed to delete website:',
            error
          );

          alert(
            error?.error?.message ||
            'Failed to delete website. Please try again.'
          );
        }
      });
  }

  // ==========================================
  // AUDIT SAVED WEBSITE
  // ==========================================

  auditWebsite(website: Website): void {
    if (!website?.url || !website.isActive || this.auditing) {
      return;
    }

    this.auditing = true;

    this.auditService
      .audit({
        url: website.url
      })
      .subscribe({
        next: (response) => {
          this.auditing = false;

          this.dialog.open(
            AuditResultComponent,
            {
              width: '900px',
              maxWidth: '95vw',
              maxHeight: '90vh',
              data: {
                audit: response
              }
            }
          );

          this.loadWebsites();
        },

        error: (error) => {
          console.error(
            'Failed to audit website:',
            error
          );

          this.auditing = false;

          alert(
            error?.error?.message ||
            'Failed to audit website. Please try again.'
          );
        }
      });
  }

  // ==========================================
  // URL VALIDATION
  // ==========================================

  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);

      return (
        parsedUrl.protocol === 'http:' ||
        parsedUrl.protocol === 'https:'
      );
    } catch {
      return false;
    }
  }

  // ==========================================
  // RESET FORM
  // ==========================================

  private resetForm(): void {
    this.editingId = null;
    this.websiteName = '';
    this.websiteUrl = '';
    this.isActive = true;
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');

    window.location.href = '/login';
  }
}