import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {

  notifications: Notification[] = [];
  loading = false;

  constructor(
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;

    this.notificationService.getNotifications().subscribe({
      next: notifications => {
        this.notifications = notifications ?? [];
        this.loading = false;

        this.notificationService.refreshUnreadCount();
      },

      error: error => {
        console.error('Failed to load notifications:', error);

        this.notifications = [];
        this.loading = false;
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) {
      return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        this.notificationService.refreshUnreadCount();
      },

      error: error => {
        console.error('Failed to mark notification as read:', error);
      }
    });
  }

  markAllAsRead(): void {
    if (this.unreadCount === 0) {
      return;
    }

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(notification => {
          notification.isRead = true;
        });

        this.notificationService.refreshUnreadCount();
      },

      error: error => {
        console.error(
          'Failed to mark all notifications as read:',
          error
        );
      }
    });
  }

  deleteNotification(
  notification: Notification,
  event: Event
): void {

  // Prevent the notification card click
  event.stopPropagation();

  if (!confirm('Are you sure you want to delete this notification?')) {
    return;
  }

  this.notificationService
    .deleteNotification(notification.id)
    .subscribe({

      next: () => {

        // Remove immediately from UI
        this.notifications =
          this.notifications.filter(
            n => n.id !== notification.id
          );

        // Refresh unread count
        this.notificationService.refreshUnreadCount();
      },

      error: error => {
        console.error(
          'Failed to delete notification:',
          error
        );
      }
    });
}

  get unreadCount(): number {
    return this.notifications.filter(
      notification => !notification.isRead
    ).length;
  }

  getNotificationIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'success':
        return 'check_circle';

      case 'warning':
        return 'warning';

      case 'error':
        return 'error';

      case 'audit':
        return 'language';

      default:
        return 'info';
    }
  }

  getNotificationClass(type: string): string {
    switch (type?.toLowerCase()) {
      case 'success':
        return 'success';

      case 'warning':
        return 'warning';

      case 'error':
        return 'error';

      case 'audit':
        return 'audit';

      default:
        return 'info';
    }
  }
}