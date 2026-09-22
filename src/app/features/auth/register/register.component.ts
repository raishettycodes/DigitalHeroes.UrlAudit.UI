import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const name = this.name.trim();
    const email = this.email.trim();
    const password = this.password;
    const confirmPassword = this.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;
    console.log('REGISTER PAYLOAD:', {
       fullName: this.name,
       email: this.email,
       password: this.password

       });
        this.authService.register({
       fullName: this.name,
       email: this.email,
       password: this.password
    })  
    .subscribe({
      next: () => {
        this.loading = false;
        this.successMessage =
          'Registration successful. You can now log in.';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },

      error: (error) => {
        console.error('Registration failed:', error);

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          error?.error?.title ||
          'Registration failed. Please try again.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}