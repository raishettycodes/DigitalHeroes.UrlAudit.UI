import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SubscriptionService } from '../core/services/subscription.service';
import { SubscriptionPlan } from '../core/models/subscription-plan.model';
import { SubscriptionUsage } from '../core/models/subscription-usage.model';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css'
})
export class PricingComponent implements OnInit {

  plans: SubscriptionPlan[] = [];

  usage: SubscriptionUsage | null = null;

  loading = true;

  upgradingPlan = '';

  errorMessage = '';

  constructor(
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.loadPlans();
    this.loadUsage();
  }

  loadPlans(): void {
    this.subscriptionService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
      },
      error: (error) => {
        console.error('Failed to load subscription plans:', error);

        this.errorMessage =
          'Unable to load subscription plans.';

        this.loading = false;
      }
    });
  }

  loadUsage(): void {
    this.subscriptionService.getUsage().subscribe({
      next: (usage) => {
        this.usage = usage;

        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load subscription usage:', error);

        this.loading = false;
      }
    });
  }

  isCurrentPlan(plan: SubscriptionPlan): boolean {
    return this.usage?.plan?.toLowerCase() ===
           plan.name.toLowerCase();
  }

  getPlanDescription(plan: SubscriptionPlan): string {

    if (plan.monthlyAuditLimit === -1) {
      return 'Unlimited website audits';
    }

    return `${plan.monthlyAuditLimit.toLocaleString()} audits per month`;
  }

  getButtonText(plan: SubscriptionPlan): string {

    if (this.isCurrentPlan(plan)) {
      return 'Current Plan';
    }

    if (plan.monthlyPrice === 0) {
      return 'Downgrade';
    }

    return 'Upgrade';
  }

 selectPlan(plan: SubscriptionPlan): void {

  if (this.isCurrentPlan(plan)) {
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to select the ${plan.name} plan?`
  );

  if (!confirmed) {
    return;
  }

  this.upgradingPlan = plan.name;

  this.subscriptionService.upgradePlan(plan.name).subscribe({

    next: (response) => {

      console.log('Subscription upgraded:', response);

      this.upgradingPlan = '';

      alert(
        `Successfully changed to ${response.plan} plan.`
      );

      this.loadUsage();
    },

    error: (error) => {

      console.error(
        'Subscription upgrade failed:',
        error
      );

      this.upgradingPlan = '';

      alert(
        error?.error?.message ||
        'Unable to change subscription plan.'
      );
    }

  });
}
}