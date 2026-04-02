import { request } from "../request";

export interface BrowserNavigateResult {
  success: boolean;
  url?: string;
  title?: string;
  error?: string;
}

export interface BrowserActionResult {
  success: boolean;
  url?: string;
  title?: string;
  canGoBack?: boolean;
  canGoForward?: boolean;
  error?: string;
}

export interface BrowserStatus {
  url: string;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
}

export const browserApi = {
  /**
   * Navigate to a URL
   */
  async navigate(url: string): Promise<BrowserNavigateResult> {
    return request("/browser/navigate", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  },

  /**
   * Go back in history
   */
  async goBack(): Promise<BrowserActionResult> {
    return request("/browser/back", {
      method: "POST",
    });
  },

  /**
   * Go forward in history
   */
  async goForward(): Promise<BrowserActionResult> {
    return request("/browser/forward", {
      method: "POST",
    });
  },

  /**
   * Refresh the current page
   */
  async refresh(): Promise<BrowserActionResult> {
    return request("/browser/refresh", {
      method: "POST",
    });
  },

  /**
   * Get current browser status
   */
  async getStatus(): Promise<BrowserStatus> {
    return request("/browser/status", {
      method: "GET",
    });
  },

  /**
   * Get page title
   */
  async getTitle(): Promise<{ title: string }> {
    return request("/browser/title", {
      method: "GET",
    });
  },
};
