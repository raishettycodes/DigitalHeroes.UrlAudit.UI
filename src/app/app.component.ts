import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  private readonly settingsKey = 'settings';

  ngOnInit(): void {
    this.applySavedTheme();
  }

  private applySavedTheme(): void {
    const savedSettings = localStorage.getItem(this.settingsKey);

    if (!savedSettings) {
      return;
    }

    try {
      const settings = JSON.parse(savedSettings);

      document.body.classList.toggle(
        'dark-mode',
        settings.darkMode === true
      );
    } catch (error) {
      console.error('Failed to load saved theme:', error);
    }
  }
}