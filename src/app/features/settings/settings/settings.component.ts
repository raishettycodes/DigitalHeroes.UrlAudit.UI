import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface UserSettings {
  emailNotifications: boolean;
  auditNotifications: boolean;
  weeklyReports: boolean;
  darkMode: boolean;
  autoAudit: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {

  emailNotifications = true;
  auditNotifications = true;
  weeklyReports = false;
  darkMode = false;
  autoAudit = false;

  private readonly settingsKey = 'settings';

  ngOnInit(): void {
    this.loadSettings();
  }

  saveSettings(): void {
    const settings: UserSettings = {
      emailNotifications: this.emailNotifications,
      auditNotifications: this.auditNotifications,
      weeklyReports: this.weeklyReports,
      darkMode: this.darkMode,
      autoAudit: this.autoAudit
    };

    localStorage.setItem(
      this.settingsKey,
      JSON.stringify(settings)
    );

    alert('Settings saved successfully.');
  }

  private loadSettings(): void {
    const savedSettings =
      localStorage.getItem(this.settingsKey);

    if (!savedSettings) {
      return;
    }

    try {
      const settings =
        JSON.parse(savedSettings) as Partial<UserSettings>;

      this.emailNotifications =
        settings.emailNotifications ?? this.emailNotifications;

      this.auditNotifications =
        settings.auditNotifications ?? this.auditNotifications;

      this.weeklyReports =
        settings.weeklyReports ?? this.weeklyReports;

      this.darkMode =
        settings.darkMode ?? this.darkMode;

      this.autoAudit =
        settings.autoAudit ?? this.autoAudit;

    } catch (error) {
      console.error(
        'Failed to load saved settings:',
        error
      );
    }
  }
}

