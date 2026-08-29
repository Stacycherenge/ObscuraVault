

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface FetchOptions extends RequestInit {
  json?: any;
}

/**
 * Core secure fetch client wrapper.
 * Automatically injects headers and enforces credential delivery.
 */
async function apiClient(endpoint: string, options: FetchOptions = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set up baseline options
  const headers = new Headers(options.headers);
  
  if (options.json && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(options.json);
  }

  const config: RequestInit = {
    ...options,
    headers,
    // SECURE BY DESIGN: This allows the browser to capture, hold, and send 
    // HTTP-Only cookies to and from cross-origin backend routes safely.
    credentials: "include", 
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Network error triggered code: ${response.status}`);
  }

  return response.json();
}

// Exported modular network route wrappers
export const api = {
  get: (endpoint: string, options?: FetchOptions) => 
    apiClient(endpoint, { ...options, method: "GET" }),
    
  post: (endpoint: string, body?: any, options?: FetchOptions) => 
    apiClient(endpoint, { ...options, method: "POST", json: body }),
    
  delete: (endpoint: string, options?: FetchOptions) => 
    apiClient(endpoint, { ...options, method: "DELETE" }),
};
