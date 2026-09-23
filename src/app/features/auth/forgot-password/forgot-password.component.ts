import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  submitted = false;
  loading = false;
  errorMessage = '';

  forgotPasswordForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  submit(): void {
    this.errorMessage = '';

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService
      .forgotPassword(this.forgotPasswordForm.getRawValue())
      .subscribe({
        next: response => {
          this.loading = false;

          // Development only: store the generated token temporarily
          // so we can test the complete reset flow locally.
          if (response.resetToken) {
             this.router.navigate(
              ['/reset-password'],
              {
        queryParams: {
        token: response.resetToken
      }
    }

  );

  return;
}

this.submitted = true;
        },
        error: error => {
          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to process your request. Please try again.';
        }
      });
  }
}
