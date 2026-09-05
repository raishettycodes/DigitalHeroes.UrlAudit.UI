export interface AuditHistory {
  id: number;
  websiteId: number;
  url: string;
  statusCode: number;
  responseTimeMs: number;
  isReachable: boolean;
  message: string;
  createdAt: Date;
}

export interface PagedResponse<T> {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  items: T[];
}