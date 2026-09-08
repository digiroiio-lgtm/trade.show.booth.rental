"use client";

export type AnalyticsEvent =
  | "hero_rfq_started"
  | "rfq_step_completed"
  | "rfq_form_completed"
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
