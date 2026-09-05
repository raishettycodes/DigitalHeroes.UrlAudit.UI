export interface AuditResponse {
  success: boolean;

  id?: number;
  createdAt?: string;

  url: string;

  statusCode: number;
  responseTimeMs: number;
  isReachable: boolean;

  message: string;

  httpVersion?: string;
  server?: string;
  contentType?: string;
  contentLength?: number | null;

  isRedirect?: boolean | null;
  redirectLocation?: string | null;
  isSslValid?: boolean | null;

  title?: string | null;
  metaDescription?: string | null;

  h1Count?: number | null;
  h2Count?: number | null;

  images?: number | null;
  imagesWithoutAlt?: number | null;

  seoScore?: number | null;
}