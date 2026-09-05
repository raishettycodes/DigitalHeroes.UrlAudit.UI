export interface Notification {
  id: number;
  userId?: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}