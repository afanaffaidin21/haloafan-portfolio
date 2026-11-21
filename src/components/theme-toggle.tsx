"use client";

import { useSyncExternalStore } from "react";
import { THEME_EVENT, THEME_KEY, type Theme } from "@/lib/theme";

const subscribe = (onChange: () => void) => {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
};

const getSnapshot = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("dark");

const getServerSnapshot = () => false;

/** Sun/moon button. Instance-safe: both mounts subscribe to the same event. */
export function ThemeToggle({ className }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage blocked: the class still applies for this page */
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      className={className}
    >
      <svg
        className="tt-sun"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg
        className="tt-moon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    </button>
  );
}
