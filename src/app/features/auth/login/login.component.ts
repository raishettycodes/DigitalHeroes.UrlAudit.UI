import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email = '';
  password = '';

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    this.errorMessage = '';

    const email = this.email.trim();
    const password = this.password;

    if (!email || !password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    this.authService.login({
      email,
      password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/audit']);
      },

      error: (error) => {
        console.error('Login failed:', error);

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'Invalid email or password. Please try again.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}