// Sentry utility functions for PII scrubbing and configuration
// Framework-agnostic - works with both @sentry/node and @sentry/react

/**
 * Scrubs personally identifiable information (PII) from Sentry event data
 * @param event The Sentry event object
 * @param hint Additional metadata about the event
 * @returns The sanitized event object (or null to drop the event)
 */
export function scrubPii(event: any, hint: any): any | null {
  // Don't send events that don't have an exception (optional)
  // if (!event.exception) {
  //   return null;
  // }

  // Create a deep copy of the event to avoid mutating the original
  const sanitizedEvent = JSON.parse(JSON.stringify(event));

  // Scrub user data - remove email, username, IP, etc. but keep anonymized ID
  if (sanitizedEvent.user) {
    const sanitizedUser = { ...sanitizedEvent.user };

    // Remove PII fields
    delete sanitizedUser.email;
    delete sanitizedUser.username;
    delete sanitizedUser.ip_address;

    // If we have an email, we can create an anonymized hash for tracking
    // but for simplicity, we'll just remove it

    sanitizedEvent.user = sanitizedUser;
  }

  // Scrub extra data that might contain PII
  if (sanitizedEvent.extra) {
    sanitizedEvent.extra = scrubObject(sanitizedEvent.extra);
  }

  // Scrub contexts that might contain sensitive information
  if (sanitizedEvent.contexts) {
    // Keep only safe contexts, remove those likely to contain PII
    const safeContexts: Record<string, any> = {};
    const allowedContexts = ['os', 'browser', 'device', 'runtime', 'trace'];

    for (const [key, value] of Object.entries(sanitizedEvent.contexts)) {
      if (allowedContexts.includes(key)) {
        // For allowed contexts, still scrub their contents
        safeContexts[key] = scrubObject(value);
      }
      // Skip other contexts that might contain PII (like 'data', 'custom', etc.)
    }

    sanitizedEvent.contexts = safeContexts;
  }

  // Scrub breadcrumbs that might contain PII
  if (Array.isArray(sanitizedEvent.breadcrumbs)) {
    sanitizedEvent.breadcrumbs = sanitizedEvent.breadcrumbs.map((breadcrumb: any) => {
      if (breadcrumb.data) {
        breadcrumb.data = scrubObject(breadcrumb.data);
      }
      return breadcrumb;
    });
  }

  // Scrub request data if present (common in Node.js requests)
  if (sanitizedEvent.request) {
    sanitizedEvent.request = scrubRequestData(sanitizedEvent.request);
  }

  return sanitizedEvent;
}

/**
 * Recursively scrub objects to remove or mask sensitive data
 * @param obj The object to scrub
 * @returns The sanitized object
 */
function scrubObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(scrubObject);
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    const SENSITIVE_WORDS = [
      "email",
      "password",
      "secret",
      "token",
      "key",
      "authorization",
      "cookie",
      "resume",
      "jd",
      "jobdescription",
      "resumecontent",
      "jobdescriptioncontent",
      "ssn",
      "socialsecurity",
      "creditcard",
      "ccnumber",
      "pwd",
    ];

    // Skip known sensitive fields entirely (case-insensitive match, including partial keys)
    if (SENSITIVE_WORDS.some((word) => lowerKey === word || lowerKey.startsWith(word) || lowerKey.includes(`${word}-`) || lowerKey.includes(word))) {
      continue;
    }

    // For string values that might contain long text (resume/JD), truncate or mark as redacted
    if (typeof value === 'string') {
      // Check if this looks like it could contain resume/JD content
      if (['description', 'content', 'text', 'body', 'value', 'data'].includes(lowerKey) &&
        value.length > 100) {
        // Likely contains substantial text content - replace with marker
        sanitized[key] = '[CONTENT REDACTED FOR PRIVACY]';
      }
      // Check for email patterns in strings
      else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        // Looks like an email address
        sanitized[key] = '[EMAIL REDACTED]';
      }
      // Very long strings might contain sensitive data
      else if (value.length > 500) {
        sanitized[key] = value.substring(0, 200) + '...[TRUNCATED]';
      } else {
        sanitized[key] = value;
      }
    } else {
      // Recursively clean nested objects
      sanitized[key] = scrubObject(value);
    }
  }

  return sanitized;
}

/**
 * Scrub request-specific data that might contain PII
 * @param request The request object from Sentry event
 * @returns The sanitized request object
 */
function scrubRequestData(request: any): any {
  if (!request || typeof request !== 'object') {
    return request;
  }

  const sanitized = { ...request };

  // Scrub headers (remove authorization, cookies, etc.)
  if (sanitized.headers) {
    const sanitizedHeaders: Record<string, string> = {};
    for (const [headerKey, headerValue] of Object.entries(sanitized.headers)) {
      const lowerHeaderKey = headerKey.toLowerCase();
      if (['authorization', 'cookie', 'x-api-key', 'x-auth-token'].includes(lowerHeaderKey)) {
        continue;
      }

      const valueStr = typeof headerValue === "string" ? headerValue : String(headerValue ?? "");
      if (valueStr.length > 256) {
        sanitizedHeaders[headerKey] = valueStr.substring(0, 256) + '...[TRUNCATED]';
      } else {
        sanitizedHeaders[headerKey] = valueStr;
      }
    }
    sanitized.headers = sanitizedHeaders;
  }

  // Scrub URL - remove query parameters that might contain sensitive data
  if (sanitized.url) {
    try {
      const urlObj = new URL(sanitized.url);
      // Keep only safe query parameters, remove potentially sensitive ones
      const safeParams = ['page', 'limit', 'sort', 'offset', 'limit']; // Common safe params
      urlObj.searchParams.forEach((value, key) => {
        if (!safeParams.includes(key.toLowerCase())) {
          urlObj.searchParams.delete(key);
        }
      });
      sanitized.url = urlObj.toString();
    } catch (e) {
      // If URL parsing fails, keep original but try to scrub obvious sensitive params
      if (typeof sanitized.url === 'string') {
        // Remove common sensitive query parameters
        const url = sanitized.url.replace(/[&?](password|secret|token|key|email)=[^&]*/g, '');
        sanitized.url = url.replace(/[&?]$/, ''); // Remove trailing & or ?
      }
    }
  }

  // Scrub body/data if present
  if (sanitized.data) {
    sanitized.data = scrubObject(sanitized.data);
  }

  return sanitized;
}

import * as Sentry from "@sentry/react";

// Export a pre-configured Sentry init function for reuse
export function initSentry(options: {
  dsn?: string;
  environment?: string;
  tracesSampleRate?: number;
  // Add other Sentry.init options as needed
}) {
  Sentry.init({
    dsn: options.dsn,
    environment: options.environment,
    tracesSampleRate: options.tracesSampleRate ?? 0.1,
    beforeSend: scrubPii,
    ...options,
  });
}
