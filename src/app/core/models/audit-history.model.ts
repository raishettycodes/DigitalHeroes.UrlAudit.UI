export interface AuditHistory {
  id: number;
  websiteId: number;

  url: string;
  statusCode: number;
  responseTimeMs: number;
  isReachable: boolean;
  message: string;
  createdAt: string;

  // Technical details

  httpVersion?: string | null;
  server?: string | null;
  contentType?: string | null;
  contentLength?: number | null;
  isRedirect?: boolean | null;
  redirectLocation?: string | null;
  isSslValid?: boolean | null;

  // SEO details

  title?: string | null;
  metaDescription?: string | null;
  h1Count?: number | null;
  h2Count?: number | null;
  images?: number | null;
  imagesWithoutAlt?: number | null;
  seoScore?: number | null;
}