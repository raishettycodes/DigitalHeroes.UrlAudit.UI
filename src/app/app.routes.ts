import { Routes } from '@angular/router';

import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ForgotPasswordComponent }
  from './features/auth/forgot-password/forgot-password.component';

import { ResetPasswordComponent }
  from './features/auth/reset-password/reset-password.component';

import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuditComponent } from './features/audit/audit/audit.component';
import { WebsitesComponent } from './features/websites/websites.component';
import { ReportsComponent } from './features/reports/reports/reports.component';

import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';

import { SubscriptionComponent }
  from './features/subscription/subscription/subscription.component';

import { NotificationsComponent }
  from './features/notifications/notifications/notifications.component';

import { SettingsComponent }
  from './features/settings/settings/settings.component';

import { AdminComponent }
  from './features/admin/admin/admin.component';

import { authGuard } from './guards/auth.guard';

import { PricingComponent } from './pricing/pricing.component';

export const routes: Routes = [

  // =========================
  // LOGIN
  // =========================

  {
    path: 'login',
    component: LoginComponent
  },

  {
  path: 'register',
  component: RegisterComponent
  },
  {
  path: 'forgot-password',
  component: ForgotPasswordComponent
},
{
  path: 'reset-password',
  component: ResetPasswordComponent
},



  // =========================
  // DASHBOARD LAYOUT
  // =========================

  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],

    children: [

      // =========================
      // DASHBOARD
      // =========================

      {
        path: '',
        component: DashboardComponent
      },


      // =========================
      // AUDIT
      // =========================

      {
        path: 'audit',
        component: AuditComponent
      },


      // =========================
      // WEBSITES
      // =========================

      {
        path: 'websites',
        component: WebsitesComponent
      },


      // =========================
      // REPORTS
      // =========================

      {
        path: 'reports',
        component: ReportsComponent
      },


      // =========================
      // SUBSCRIPTION
      // =========================

      {
        path: 'subscription',
        component: SubscriptionComponent
      },

      {
       path: 'pricing',
       component: PricingComponent
      },


      // =========================
      // NOTIFICATIONS
      // =========================

      {
        path: 'notifications',
        component: NotificationsComponent
      },


      // =========================
      // SETTINGS
      // =========================

      {
        path: 'settings',
        component: SettingsComponent
      },


      // =========================
      // ADMIN
      // =========================

      {
        path: 'admin',
        component: AdminComponent
      }

    ]
  },


  // =========================
  // UNKNOWN ROUTE
  // =========================

  {
    path: '**',
    redirectTo: ''
  },

];
