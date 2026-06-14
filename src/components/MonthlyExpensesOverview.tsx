"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EXPENSE_CATEGORIES } from "@/lib/expenseCategories";

type UtilityExpense = {
  _id: string;
  date: string;
  category: string;
  amount: number;
};

type Employee = {
  _id: string;
  salary: number;
  status: "active" | "inactive";
};

const FOREST   = "#1B4332";
const FOREST_D = "#0D2B1D";
const FOREST_L = "#2D6A4F";
const GOLD_L   = "#F4C542";
const CREAM    = "#F4F1EB";
const CARD_BG  = "#FFFFFF";
const BORDER   = "#E8E2D9";
const MUTED    = "#7A7163";
const TEXT     = "#1A1A1A";
const INPUT_BG = "#FDFCFA";
const SERIF    = "'Playfair Display', Georgia, serif";
const SANS     = "'DM Sans', system-ui, sans-serif";

function money(value: number) {
  const n = Math.round(value || 0);
  return "RWF " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const THIS_MONTH = new Date().toISOString().slice(0, 10).slice(0, 7);

export function MonthlyExpensesOverview() {
  const [expenses, setExpenses]   = useState<UtilityExpense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]     = useState(true);
  const [month, setMonth]         = useState(THIS_MONTH);

  async function load() {
    setLoading(true);
    try {
      const [uRes, eRes] = await Promise.all([
        fetch("/api/utilities", { cache: "no-store" }),
        fetch("/api/employees", { cache: "no-store" }),
      ]);
      const uData = (await uRes.json()) as { expenses?: UtilityExpense[] };
      const eData = (await eRes.json()) as { employees?: Employee[] };
      setExpenses(uData.expenses ?? []);
      setEmployees(eData.employees ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(month)),
    [expenses, month],
  );

  const byCat = useMemo(() => {
    const acc: Record<string, number> = {};
    monthExpenses.forEach((e) => { acc[e.category] = (acc[e.category] ?? 0) + e.amount; });
    return acc;
  }, [monthExpenses]);

  const utilitiesTotal = useMemo(() => monthExpenses.reduce((s, e) => s + e.amount, 0), [monthExpenses]);
  const salariesTotal  = useMemo(
    () => employees.filter((e) => e.status === "active").reduce((s, e) => s + e.salary, 0),
    [employees],
  );
  const grandTotal = utilitiesTotal + salariesTotal;
  const maxCat = Math.max(...EXPENSE_CATEGORIES.map((c) => byCat[c.slug] ?? 0), 1);

  return (
    <div style={{ background: CREAM, minHeight: "100vh", fontFamily: SANS }}>
      {/* ── HEADER ── */}
      <header
        style={{
          background: `linear-gradient(150deg, ${FOREST_D} 0%, ${FOREST} 55%, ${FOREST_L} 100%)`,
          position: "relative", overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }} />
        <div style={{
          position: "absolute", bottom: -80, right: -60,
          width: 300, height: 300, borderRadius: "50%",
          border: "44px solid rgba(201,146,31,0.12)", pointerEvents: "none",
        }} />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" style={{ position: "relative" }}>
          <p style={{ color: "#A8D5B5", fontSize: 12, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
            Buri Kwezi
          </p>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15 }}>
            Amafaranga Asohoka{" "}
            <span style={{ color: GOLD_L }}>Yose</span>
          </h1>
          <p style={{ color: "#A8D5B5", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
            Incamake y&apos;ibyoherejwe byose: amashanyarazi, amazi, umutekano, imishahara, n&apos;ibindi.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, marginBottom: 22, flexWrap: "wrap" }}>
            <span style={{ color: "#A8D5B5", fontSize: 13, fontWeight: 600 }}>Hitamo ukwezi:</span>
            <input
              type="month" value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{
                height: 40, borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)", color: "#fff",
                padding: "0 12px", fontSize: 14, fontFamily: SANS, outline: "none",
                colorScheme: "dark",
              }}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <HeroKpi label="Ibyoherezwa (gasutamo)" value={money(utilitiesTotal)} color="#FC8181" />
            <HeroKpi label="Imishahara (abakora)"    value={money(salariesTotal)}  color="#93C5FD" />
            <HeroKpi label="IGITERANYO CYOSE"        value={money(grandTotal)}     color={GOLD_L} big />
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        {/* breakdown bars */}
        <h2 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
          Uko byagabanyijwe — {month}
        </h2>
        <p style={{ color: MUTED, fontSize: 13, marginBottom: 18 }}>
          Kanda kuri buri cyiciro urebe amateka cyangwa wongeremo.
        </p>

        <div style={{
          background: CARD_BG, borderRadius: 18, border: `1px solid ${BORDER}`,
          boxShadow: "0 4px 24px rgba(27,67,50,0.07)", padding: "20px 22px", marginBottom: 26,
        }}>
          {loading ? (
            <div style={{ display: "grid", gap: 12 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  height: 30, borderRadius: 8,
                  background: "linear-gradient(90deg,#F0EBE3 25%,#FAF8F4 50%,#F0EBE3 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
                }} />
              ))}
            </div>
          ) : utilitiesTotal === 0 ? (
            <p style={{ color: MUTED, fontSize: 14, padding: "8px 0" }}>
              Nta byoherejwe muri {month} biboneka. Injiza mu byiciro biri hasi.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {EXPENSE_CATEGORIES.filter((c) => (byCat[c.slug] ?? 0) > 0).map((c) => {
                const val = byCat[c.slug] ?? 0;
                const pct = Math.max((val / maxCat) * 100, 4);
                return (
                  <Link key={c.slug} href={`/amafaranga/${c.slug}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
                        <span style={{ marginRight: 6 }}>{c.icon}</span>{c.label}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: c.accent }}>{money(val)}</span>
                    </div>
                    <div style={{ height: 8, background: "#EDE9E1", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: c.accent }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* category tiles → separate pages */}
        <h2 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 16 }}>
          Ibyiciro byose
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXPENSE_CATEGORIES.map((c) => {
            const val = byCat[c.slug] ?? 0;
            return (
              <Link
                key={c.slug}
                href={`/amafaranga/${c.slug}`}
                style={{
                  textDecoration: "none",
                  background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 16,
                  padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,
                  boxShadow: "0 2px 10px rgba(27,67,50,0.05)", transition: "transform 0.12s, box-shadow 0.12s",
                }}
                className="cat-tile"
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                  background: c.soft, border: `1px solid ${c.bg}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>{c.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>{c.english}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: val > 0 ? c.accent : "#C9C2B6" }}>
                    {money(val)}
                  </div>
                  <div style={{ fontSize: 16, color: "#C9C2B6", lineHeight: 1 }}>›</div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .cat-tile:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(27,67,50,0.12) !important; }
        input[type="month"]:focus { box-shadow: 0 0 0 3px rgba(255,255,255,0.18) !important; }
      `}</style>
    </div>
  );
}

function HeroKpi({
  label, value, color = "#fff", big,
}: { label: string; value: string; color?: string; big?: boolean }) {
  return (
    <div style={{
      background: big ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.08)",
      border: big ? "1px solid rgba(244,197,66,0.3)" : "1px solid rgba(255,255,255,0.1)",
      borderRadius: 14, padding: "14px 16px",
    }}>
      <p style={{ color: "#A8D5B5", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 8, fontFamily: SANS }}>
        {label}
      </p>
      <p style={{ fontSize: big ? 24 : 20, fontWeight: 800, color, letterSpacing: "-0.025em", fontFamily: SANS }}>
        {value}
      </p>
    </div>
  );
}
