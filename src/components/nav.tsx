"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { navLinks } from "@/lib/nav";
import { MaybeImg, emptyFrame } from "@/components/maybe-img";

type NavProps = { avatar: string; name: string; email: string };

const MOBILE_QUERY = "(max-width: 767px)";
const subscribeMobile = (onChange: () => void) => {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const isMobile = () => window.matchMedia(MOBILE_QUERY).matches;
const isMobileOnServer = () => false;

/**
 * The server and every screen from 768px render the desktop pill unchanged.
 * Below 768px the pill cannot open to 545px, so after hydration it swaps to
 * the menu-button variant.
 */
export function Nav(props: NavProps) {
  const mobile = useSyncExternalStore(subscribeMobile, isMobile, isMobileOnServer);
  return mobile ? <MobileNav {...props} /> : <DesktopNav {...props} />;
}

/**
 * Pill nav, measured 233x56 collapsed at 1440.
 * Collapsed: avatar + name + a 24x24 dots box at [800,40] (13px from the right edge).
 * The dots are the trigger — hovering the name does nothing in the reference.
 * Open: 545x56 at [447.5,24]; content is flush and the toggle glyph keeps the
 * same 13px inset as the avatar. name→links gap is 64px (32 nav gap + 32 cluster padding),
 * links row 309px, links fade in staggered (Work 0s, Skills .1s, Blog .2s, Contact .3s, Email me .4s).
 */
function DesktopNav({ avatar, name, email }: NavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed left-1/2 top-6 z-[9] -translate-x-1/2">
      <nav
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="pointer-events-auto relative flex h-14 max-w-[calc(100vw-24px)] items-center gap-8 overflow-hidden rounded-[32px] border border-line/70 bg-surface/50 p-3 backdrop-blur-[5px] transition-[width] duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ width: open ? 545 : 233 }}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label={`${name} — home`}
        >
          <span className={`relative block size-8 overflow-hidden rounded-full${emptyFrame(avatar)}`}>
            <MaybeImg
              src={avatar}
              alt={name}
              className="size-8 rounded-full object-cover"
            />
          </span>
          <span className="t-label whitespace-pre">{name}</span>
        </Link>

        <div className="flex shrink-0 items-center gap-4 pl-8">
          {navLinks.map((l, i) => (
            <Link
              key={l.label}
              href={l.href}
              className="t-label whitespace-nowrap transition-opacity duration-300 hover:opacity-60"
              style={{
                opacity: open ? 1 : 0,
                transitionDelay: open ? `${i * 0.1}s` : "0s",
              }}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={`mailto:${email}`}
            className="t-label whitespace-nowrap rounded-[24px] bg-invert px-[18px] py-2 text-invert-ink shadow-btn transition-opacity duration-300 hover:opacity-90"
            style={{
              opacity: open ? 1 : 0,
              transitionDelay: open ? "0.4s" : "0s",
            }}
          >
            Email me
          </a>
          <span
            className="-mr-1 hidden shrink-0 md:block"
            style={{
              opacity: open ? 1 : 0,
              transitionDelay: open ? "0.5s" : "0s",
            }}
          >
            <ThemeToggle className="grid size-6 place-items-center rounded-full transition-opacity duration-300 hover:opacity-60" />
          </span>
        </div>

        <div
          onMouseEnter={() => setOpen(true)}
          className={`absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center gap-1.5 transition-opacity duration-300 ${
            open ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
          }`}
          aria-hidden
        >
          <span className="block size-1 rounded-full bg-invert" />
          <span className="block size-1 rounded-full bg-ink-3" />
          <span className="block size-1 rounded-full bg-ink-4" />
        </div>
      </nav>
    </div>
  );
}

const PANEL_ID = "nav-menu";

/**
 * Below 768px: the pill stays at its collapsed size, and the dots are a real
 * button that opens a panel under the pill with the same links. The panel
 * closes on Escape, an outside press, a chosen link, or a route change.
 */
export function MobileNav({ avatar, name, email }: NavProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  // A route change closes the panel; adjusting state during render avoids
  // the extra commit an effect would cause.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  const item = "t-label flex min-h-11 items-center rounded-[24px] px-4 transition-opacity duration-300 hover:opacity-60";

  return (
    <div ref={rootRef} className="pointer-events-none fixed left-1/2 top-6 z-[9] -translate-x-1/2">
      <nav className="pointer-events-auto relative flex h-14 w-[233px] max-w-[calc(100vw-24px)] items-center gap-8 overflow-hidden rounded-[32px] border border-line/70 bg-surface/50 p-3 backdrop-blur-[5px]">
        <Link href="/" className="relative flex shrink-0 items-center gap-2 tap-target" aria-label={`${name} — home`}>
          <span className={`relative block size-8 overflow-hidden rounded-full${emptyFrame(avatar)}`}>
            <MaybeImg src={avatar} alt={name} className="size-8 rounded-full object-cover" />
          </span>
          <span className="t-label whitespace-pre">{name}</span>
        </Link>

        {/* 44x44 target; the dots keep the desktop box's centre, 24px from the right edge. */}
        <button
          ref={buttonRef}
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls={PANEL_ID}
          onClick={() => (open ? close(true) : setOpen(true))}
          className="absolute right-0.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full"
        >
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="block size-1 rounded-full bg-invert" />
            <span className="block size-1 rounded-full bg-ink-3" />
            <span className="block size-1 rounded-full bg-ink-4" />
          </span>
        </button>
      </nav>

      <div
        id={PANEL_ID}
        ref={panelRef}
        // Visible at once on open, so focus can land in it; hidden only after the fade on close.
        className={`absolute left-1/2 top-full mt-2 flex w-[233px] max-w-[calc(100vw-24px)] -translate-x-1/2 flex-col gap-1 rounded-[32px] border border-line/70 bg-surface/95 p-2 backdrop-blur-[5px] motion-reduce:transition-none ${
          open
            ? "pointer-events-auto visible translate-y-0 opacity-100 [transition:opacity_200ms_cubic-bezier(.4,0,.2,1),translate_200ms_cubic-bezier(.4,0,.2,1),visibility_0s]"
            : "invisible -translate-y-1 opacity-0 [transition:opacity_200ms_cubic-bezier(.4,0,.2,1),translate_200ms_cubic-bezier(.4,0,.2,1),visibility_0s_200ms]"
        }`}
      >
        {navLinks.map((l) => (
          <Link key={l.label} href={l.href} className={item} onClick={() => close(true)}>
            {l.label}
          </Link>
        ))}
        <a
          href={`mailto:${email}`}
          onClick={() => close(true)}
          className="t-label flex min-h-11 items-center justify-center rounded-[24px] bg-invert px-[18px] text-invert-ink shadow-btn transition-opacity duration-300 hover:opacity-90"
        >
          Email me
        </a>
        <ThemeToggle className="grid size-11 place-items-center self-center rounded-full transition-opacity duration-300 hover:opacity-60" />
      </div>
    </div>
  );
}
