import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuditService } from '../../../core/services/audit.service';
import { SubscriptionInfo } from '../../../core/models/SubscriptionInfo.model';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent implements OnInit {

  subscription: SubscriptionInfo | null = null;
  loading = false;

  constructor(
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.loadSubscription();
  }

  // =========================
  // Load Current Subscription
  // =========================

  loadSubscription(): void {
    this.loading = true;

    this.auditService.getSubscription().subscribe({
      next: (response) => {
        this.subscription = response;
        this.loading = false;
      },

      error: (error) => {
        console.error(
          'Failed to load subscription:',
          error
        );

        this.subscription = null;
        this.loading = false;
      }
    });
  }

  // =========================
  // Upgrade Subscription
  // =========================

  upgrade(plan: string): void {

    if (this.loading) {
      return;
    }

    // Free plan
    if (plan === 'Free') {
      alert(
        'You are already using the Free plan.'
      );
      return;
    }

    // Agency plan
    // Razorpay/payment integration will be added later.
    if (plan === 'Agency') {
      alert(
        'Agency plan selected. Payment integration will be added next.'
      );
      return;
    }

    let price = 0;

    switch (plan) {

      case 'Starter':
        price = 199;
        break;

      case 'Professional':
        price = 499;
        break;

      default:
        alert('Invalid subscription plan.');
        return;
    }

    const confirmed = confirm(
      `Do you want to upgrade to the ${plan} plan for ₹${price}/month?`
    );

    if (!confirmed) {
      return;
    }

    this.loading = true;

    this.auditService
      .upgradeSubscription(plan)
      .subscribe({

        next: (response) => {

          alert(
            response.message ||
            `${plan} plan activated successfully.`
          );

          // Reload current subscription
          this.loadSubscription();
        },

        error: (error) => {

          console.error(
            'Subscription upgrade failed:',
            error
          );

          this.loading = false;

          alert(
            error?.error?.message ||
            'Failed to upgrade subscription. Please try again.'
          );
        }

      });
  }
}

