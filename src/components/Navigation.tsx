"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FOREST_D = "#0D2B1D";
const GOLD     = "#C9921F";
const GOLD_L   = "#F4C542";
const SANS     = "'DM Sans', system-ui, sans-serif";

const PAGES = [
  { href: "/",           label: "Raporo",     sub: "Dashboard", match: "exact" as const },
  { href: "/abakozi",    label: "Abakozi",    sub: "Employees", match: "prefix" as const },
  { href: "/amafaranga", label: "Amafaranga", sub: "Expenses",  match: "prefix" as const },
];

export function Navigation() {
  const pathname = usePathname();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <nav
      style={{
        background: FOREST_D,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        fontFamily: SANS,
      }}
    >
      <div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        style={{ display: "flex", alignItems: "center", height: 54, gap: 4 }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginRight: 20,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_L})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 800, color: FOREST_D,
            }}
          >U</div>
          <span
            className="hidden sm:block"
            style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}
          >Upendo</span>
        </Link>

        {/* Page links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          {PAGES.map(({ href, label, sub, match }) => {
            const active =
              match === "exact"
                ? pathname === href
                : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                style={{
                  textDecoration: "none",
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: active ? "rgba(255,255,255,0.11)" : "transparent",
                  transition: "background 0.15s",
                  minWidth: 64,
                }}
              >
                <div style={{
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#fff" : "rgba(255,255,255,0.55)",
                  lineHeight: 1.3,
                }}>{label}</div>
                <div
                  className="hidden sm:block"
                  style={{
                    fontSize: 10,
                    color: active ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.28)",
                    lineHeight: 1.2,
                  }}
                >{sub}</div>
              </Link>
            );
          })}
        </div>

        {/* Date */}
        <span
          className="hidden lg:block"
          style={{ color: "rgba(255,255,255,0.32)", fontSize: 12, flexShrink: 0 }}
        >{today}</span>
      </div>
    </nav>
  );
}
