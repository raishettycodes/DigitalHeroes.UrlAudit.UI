import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SubscriptionService } from '../core/services/subscription.service';
import { SubscriptionPlan } from '../core/models/subscription-plan.model';
import { SubscriptionUsage } from '../core/models/subscription-usage.model';
import { ChangeDetectorRef } from '@angular/core';


declare var Razorpay: any;
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
    private subscriptionService: SubscriptionService,
    private cdr: ChangeDetectorRef
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

      console.log('Pricing usage refreshed:', usage);
      console.log('Pricing current plan:', this.usage?.plan);

      this.loading = false;

      this.cdr.detectChanges();
    },

    error: (error) => {

      console.error(
        'Failed to load subscription usage:',
        error
      );

      this.loading = false;

      this.cdr.detectChanges();
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

  // Free plan does not require payment
  if (plan.monthlyPrice === 0) {
    this.upgradingPlan = plan.name;

    this.subscriptionService.upgradePlan(plan.name).subscribe({
      next: (response) => {
        console.log('Subscription changed:', response);

        this.upgradingPlan = '';

        alert(
          `Successfully changed to ${response.plan} plan.`
        );

        this.loadUsage();
      },

      error: (error) => {
        console.error(
          'Subscription change failed:',
          error
        );

        this.upgradingPlan = '';

        alert(
          error?.error?.message ||
          'Unable to change subscription plan.'
        );
      }
    });

    return;
  }

  this.upgradingPlan = plan.name;

  this.subscriptionService.createPaymentOrder({
    plan: plan.name
  }).subscribe({

    next: (order) => {

      console.log('Razorpay order created:', order);

      const options = {

        key: order.keyId,

        amount: order.amount * 100,

        currency: order.currency,

        name: 'DigitalHeroes',

        description: `${order.plan} Plan`,

        order_id: order.orderId,

        handler: (response: any) => {

          console.log(
            'Razorpay payment successful:',
            response
          );

          this.verifyPayment(
            plan.name,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
        },

        modal: {
          ondismiss: () => {

            console.log(
              'Razorpay checkout dismissed.'
            );

            this.upgradingPlan = '';
          }
        },

        theme: {
          color: '#1976d2'
        }
      };

      const razorpay = new Razorpay(options);

      razorpay.on(
        'payment.failed',
        (response: any) => {

          console.error(
            'Razorpay payment failed:',
            response
          );

          this.upgradingPlan = '';

          alert(
            response?.error?.description ||
            'Payment failed. Please try again.'
          );
        }
      );

      razorpay.open();
    },

    error: (error) => {

      console.error(
        'Failed to create Razorpay order:',
        error
      );

      this.upgradingPlan = '';

      alert(
        error?.error?.message ||
        'Unable to start payment. Please try again.'
      );
    }
  });
}
private verifyPayment(
  plan: string,
  orderId: string,
  paymentId: string,
  signature: string
): void {

  this.subscriptionService.verifyPayment({
    plan: plan,
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: signature
  }).subscribe({

    next: (response) => {

      console.log(
        'Payment verified successfully:',
        response
      );

      this.upgradingPlan = '';

      alert(
        `Payment successful! Your ${plan} plan is now active.`
      );

      this.loadUsage();
    },

 error: (error) => {

  console.error('VERIFY ERROR OBJECT:', error);
  console.log('VERIFY STATUS:', error?.status);
  console.log('VERIFY MESSAGE:', error?.error?.message);

  this.upgradingPlan = '';

  if (
    error?.status === 409 &&
    error?.error?.message === 'Payment has already been verified.'
  ) {

    console.log('>>> ALREADY VERIFIED CONDITION MATCHED <<<');

    alert(
      `Payment successful! Your ${plan} plan is now active.`
    );

    this.loadUsage();

    return;
  }

  console.log('>>> NORMAL PAYMENT ERROR <<<');

  alert(
    error?.error?.message ||
    'Payment verification failed. Please contact support if your payment was deducted.'
  );
}
  });
}
}