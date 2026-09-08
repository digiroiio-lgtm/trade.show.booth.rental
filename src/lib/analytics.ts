"use client";

export type AnalyticsEvent =
  | "quote_form_started"
  | "quote_form_step"
  | "quote_form_completed"
  | "phone_clicked"
  | "email_clicked"
  | "cta_clicked";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  event: AnalyticsEvent,
  params: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  if (typeof window.gtag === "function") {
    window.gtag("event", event, params);
  } else {
    window.dataLayer.push({ event, ...params });
  }
}
