import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './shared/contexts/AuthContext.tsx';
import { ToastProvider } from './shared/contexts/ToastContext.tsx';
import ErrorBoundary from './shared/components/ErrorBoundary.tsx';
import ErrorFallback from './shared/components/ErrorFallback.tsx';
import { scrubPii } from '../sentry-utils';
import posthog from 'posthog-js';

Sentry.init({
  dsn: (typeof process !== "undefined" ? process.env.VITE_SENTRY_DSN : undefined) || import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  beforeSend: scrubPii,
});

// Initialize PostHog if key is provided
if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false,
    session_recording: undefined,
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
            <App />
          </Sentry.ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);