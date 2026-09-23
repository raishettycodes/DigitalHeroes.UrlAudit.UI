import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  loading = false;
  submitted = false;
  errorMessage = '';

  private token = '';

  resetPasswordForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.token =
  this.route.snapshot.queryParamMap.get('token') || '';
  }

  submit(): void {
    this.errorMessage = '';

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } =
      this.resetPasswordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!this.token) {
      this.errorMessage =
        'This password reset link is invalid or missing.';
      return;
    }

    this.loading = true;

    this.authService
      .resetPassword({
        token: this.token,
        newPassword
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.submitted = true;
        },
        error: error => {
          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'The password reset link is invalid or has expired.';
        }
      });
  }
}
