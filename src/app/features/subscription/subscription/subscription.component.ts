import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuditService } from '../../../core/services/audit.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { SubscriptionInfo } from '../../../core/models/SubscriptionInfo.model';

declare var Razorpay: any;

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
    private auditService: AuditService,
    private subscriptionService: SubscriptionService
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

    this.loading = true;

    // Create Razorpay order
    this.subscriptionService.createPaymentOrder({
      plan: plan
    }).subscribe({

      next: (order) => {

        console.log(
          'Razorpay order created:',
          order
        );

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
              plan,
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

              this.loading = false;
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

            this.loading = false;

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

        this.loading = false;

        alert(
          error?.error?.message ||
          'Unable to start payment. Please try again.'
        );
      }
    });
  }

  // =========================
  // Verify Payment
  // =========================

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

        this.loading = false;

        alert(
          `Payment successful! Your ${plan} plan is now active.`
        );

        this.loadSubscription();
      },

      error: (error) => {

        console.error(
          'Payment verification failed:',
          error
        );

        this.loading = false;

        alert(
          error?.error?.message ||
          'Payment verification failed. Please contact support if your payment was deducted.'
        );
      }
    });
  }
}