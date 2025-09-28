export interface WebFetchRequest {
  url: string;
  options?: {
    timeout?: number;
    userAgent?: string;
    waitForSelector?: string;
    customHeaders?: Record<string, string>;
  };
}

export interface WebFetchResponse {
  content: string;
  url: string;
  title?: string;
  status: number;
  error?: string;
}

export interface FetchStrategy {
  canHandle(url: string): boolean;
  fetch(request: WebFetchRequest): Promise<WebFetchResponse>;
}