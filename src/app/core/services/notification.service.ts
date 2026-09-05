import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { Notification } from '../models/notification.model';

interface UnreadCountResponse {
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly apiUrl =
    'https://localhost:7225/api/Notification';

  private readonly unreadCountSubject =
    new BehaviorSubject<number>(0);

  readonly unreadCount$ =
    this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient
  ) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      this.apiUrl
    );
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http
      .get<UnreadCountResponse>(
        `${this.apiUrl}/unread-count`
      )
      .pipe(
        tap(response => {
          this.unreadCountSubject.next(response.count);
        })
      );
  }

  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe({
      error: error => {
        console.error(
          'Failed to refresh notification count:',
          error
        );
      }
    });
  }

  markAsRead(id: number): Observable<void> {
    return this.http
      .put<void>(
        `${this.apiUrl}/${id}/read`,
        {}
      )
      .pipe(
        tap(() => {
          this.refreshUnreadCount();
        })
      );
  }

  markAllAsRead(): Observable<void> {
    return this.http
      .put<void>(
        `${this.apiUrl}/read-all`,
        {}
      )
      .pipe(
        tap(() => {
          this.unreadCountSubject.next(0);
        })
      );
  }

  deleteNotification(id: number): Observable<void> {
    return this.http
      .delete<void>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        tap(() => {
          this.refreshUnreadCount();
        })
      );
  }
}