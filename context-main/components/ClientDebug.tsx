"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ClientDebug
 * Minimal client-side error capture overlay for development.
 * - Captures window 'error' and 'unhandledrejection'
 * - Shows last error summary in a compact bottom-right toast
 * - Prints full details to console for inspection
 */
export default function ClientDebug() {
  const [lastError, setLastError] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    const onError = (event: ErrorEvent) => {
      const summary = `${event.message} (${event.filename}:${event.lineno}:${event.colno})`;
      // eslint-disable-next-line no-console
      console.error("[ClientDebug] window.error", event);
      setLastError(summary);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setLastError(null), 8000);
    };

    const onUnhandled = (event: PromiseRejectionEvent) => {
      const reason =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason);
      // eslint-disable-next-line no-console
      console.error("[ClientDebug] unhandledrejection", event);
      setLastError(`Unhandled promise rejection: ${reason}`);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setLastError(null), 8000);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandled);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandled);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (process.env.NODE_ENV === "production" || !lastError) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[1000] max-w-sm rounded-lg bg-red-600 text-white shadow-lg"
    >
      <div className="px-4 py-3 text-sm font-medium">{lastError}</div>
    </div>
  );
}
