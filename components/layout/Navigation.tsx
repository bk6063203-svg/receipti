"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LayoutGrid, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { PORTAL_LINKS } from "./PortalSwitcher";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#product", label: "Product", hash: "#product" },
  { href: "/#how-it-works", label: "How It Works", hash: "#how-it-works" },
  { href: "/#customers", label: "Customers", hash: "#customers" },
  { href: "/#business", label: "Merchants", hash: "#business" },
  { href: "/verify", label: "Verification" },
  { href: "/live", label: "Live Demo" },
] as const;

const MOBILE_LINKS = [
  { href: "/", label: "Home" },
  ...LINKS,
  { href: "/demo", label: "Demo" },
] as const;

function isActive(pathname: string, hash: string, link: { href: string; hash?: string }): boolean {
  if (link.hash) return pathname === "/" && hash === link.hash;
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [hash, setHash] = React.useState("");

  React.useEffect(() => setOpen(false), [pathname]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Escape closes the mobile menu; lock scroll while open.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open ]);

  const currentPortal = PORTAL_LINKS.find((p) => pathname === p.href || pathname.startsWith(`${p.href}/`));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled || open
          ? "border-b border-line bg-background/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--r-card)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <Link href="/" aria-label="Receipti home" className="rounded-lg">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => {
            const active = isActive(pathname, hash, l);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Dropdown
            key={pathname}
            label="Portals"
            align="right"
            selectedId={currentPortal?.id}
            trigger={
              <Button
                variant="ghost"
                leftIcon={<LayoutGrid className="h-4 w-4" aria-hidden="true" />}
                rightIcon={<ChevronDown className="h-4 w-4" aria-hidden="true" />}
              >
                Portals
              </Button>
            }
            items={PORTAL_LINKS.map((p) => ({
              id: p.id,
              label: p.label,
              icon: <p.icon className="h-4 w-4" aria-hidden="true" />,
            }))}
            onSelect={(id) => {
              const target = PORTAL_LINKS.find((p) => p.id === id);
              if (target) router.push(target.href);
            }}
          />
          <Link href="/demo">
            <Button>Launch Demo</Button>
          </Link>
        </div>

        <IconButton
          label={open ? "Close menu" : "Open menu"}
          className="lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </IconButton>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-[var(--r-card)] lg:hidden"
        >
          <div className="container-x flex flex-col gap-1 py-4">
            {MOBILE_LINKS.map((l) => {
              const active = "hash" in l ? isActive(pathname, hash, l) : pathname === l.href;
              return (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-3 text-[0.9375rem] font-medium transition-colors hover:bg-background",
                    active ? "text-ink" : "text-ink-muted"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
              <p className="type-label px-3 text-ink-faint">Portals</p>
              {PORTAL_LINKS.map((p) => (
                <Link key={p.id} href={p.href} onClick={() => setOpen(false)}>
                  <Button
                    variant={currentPortal?.id === p.id ? "primary" : "outline"}
                    className="w-full"
                    leftIcon={<p.icon className="h-4 w-4" aria-hidden="true" />}
                  >
                    {p.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
