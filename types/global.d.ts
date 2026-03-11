/* eslint-disable no-var */

interface Window {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: Record<string, unknown>[];
  fbq?: (...args: unknown[]) => void;
}
