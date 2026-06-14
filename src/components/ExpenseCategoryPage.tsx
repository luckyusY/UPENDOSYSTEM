"use client";

import { CSSProperties, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getCategory, type ExpenseCategorySlug } from "@/lib/expenseCategories";

type UtilityExpense = {
  _id: string;
  date: string;
  category: string;
  amount: number;
  provider: string;
  reference: string;
  notes: string;
};

const FOREST   = "#1B4332";
const FOREST_D = "#0D2B1D";
const FOREST_L = "#2D6A4F";
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

const TODAY      = new Date().toISOString().slice(0, 10);
const THIS_MONTH = TODAY.slice(0, 7);

const labelSt: CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600,
  color: "#4A4A4A", marginBottom: 8, fontFamily: SANS,
};
const inputSt: CSSProperties = {
  display: "block", width: "100%", height: 44,
  borderRadius: 10, border: "1.5px solid #DDD8D0",
  padding: "0 13px", fontSize: 14, color: TEXT,
  outline: "none", background: INPUT_BG,
  boxSizing: "border-box", fontFamily: SANS,
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export function ExpenseCategoryPage({ category }: { category: ExpenseCategorySlug }) {
  const meta = getCategory(category)!;
  const isElectric = category === "amashanyarazi";

  const [items, setItems]     = useState<UtilityExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch("/api/utilities", { cache: "no-store" });
      const data = (await res.json()) as { expenses?: UtilityExpense[] };
      setItems((data.expenses ?? []).filter((e) => e.category === category));
    } catch {
      setMessage({ text: "Ntibyashobotse gufata amakuru.", ok: false });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const thisMonthTotal = useMemo(
    () => items.filter((e) => e.date.startsWith(THIS_MONTH)).reduce((s, e) => s + e.amount, 0),
    [items],
  );
  const allTotal = useMemo(() => items.reduce((s, e) => s + e.amount, 0), [items]);
  const lastPaid = items[0]?.date ?? "—";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/utilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date:      fd.get("date"),
          category,
          amount:    Number(fd.get("amount") || 0),
          provider:  fd.get("provider"),
          reference: fd.get("reference"),
          notes:     fd.get("notes"),
        }),
      });
      if (!res.ok) throw new Error();
      e.currentTarget.reset();
      setMessage({ text: "Byabitswe neza.", ok: true });
    } catch {
      setMessage({
        text: "Byatinze kwemezwa. Reba ku mateka niba byabitswe.",
        ok: false,
      });
    } finally {
      setSaving(false);
      // Slow Vercel/Atlas responses often still save; re-read to surface it.
      await load();
    }
  }

  async function deleteItem(id: string) {
    if (!window.confirm("Ugomba gusiba iyi raporo?")) return;
    try {
      await fetch(`/api/utilities/${id}`, { method: "DELETE" });
      await load();
    } catch {
      setMessage({ text: "Gusiba byanze.", ok: false });
    }
  }

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
          position: "absolute", bottom: -70, right: -50,
          width: 260, height: 260, borderRadius: "50%",
          border: `40px solid ${meta.accent}33`, pointerEvents: "none",
        }} />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" style={{ position: "relative" }}>
          <Link
            href="/amafaranga"
            style={{ color: "#A8D5B5", fontSize: 13, fontWeight: 500, textDecoration: "none", marginBottom: 16, display: "inline-block" }}
          >← Amafaranga asohoka yose</Link>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
            }}>{meta.icon}</div>
            <div>
              <p style={{ color: "#A8D5B5", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
                {meta.english}{meta.provider !== "—" ? `  ·  ${meta.provider}` : ""}
              </p>
              <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.5rem, 3.5vw, 2.3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
                {meta.label}
              </h1>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <HeroKpi label={`Uku kwezi — ${THIS_MONTH}`} value={money(thisMonthTotal)} />
            <HeroKpi label="Byose hamwe (igiteranyo)"   value={money(allTotal)} />
            <HeroKpi label="Bwa nyuma byishyuwe"        value={lastPaid} />
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.4fr]">

          {/* add form */}
          <div style={{
            background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`,
            boxShadow: "0 4px 24px rgba(27,67,50,0.07)", overflow: "hidden", alignSelf: "start",
          }}>
            <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #F0EBE3" }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: TEXT }}>
                Ongeramo {meta.label}
              </h2>
              <p style={{ color: MUTED, fontSize: 13, marginTop: 3 }}>
                {isElectric
                  ? "Andika itariki wagurishijeho amashanyarazi na token."
                  : `Andika itariki n'amafaranga ya ${meta.label.toLowerCase()}.`}
              </p>
            </div>
            <form onSubmit={submit} style={{ padding: "16px 22px 22px" }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Itariki {isElectric ? "(wagurishijeho)" : ""} *</label>
                <input name="date" type="date" defaultValue={TODAY} required style={inputSt} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Amafaranga (RWF) *</label>
                <input name="amount" type="number" min="0" step="100" defaultValue="0" required style={inputSt} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Uwabihe / Sosiyete</label>
                <input name="provider" defaultValue={meta.provider !== "—" ? meta.provider : ""} placeholder={meta.provider} style={inputSt} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>{isElectric ? "Token / Units" : "Nimero ya resepsiyo"}</label>
                <input name="reference" placeholder={isElectric ? "Token cyangwa units (kWh)..." : "Nimero ya resepsiyo..."} style={inputSt} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>Inyandiko</label>
                <input name="notes" placeholder="Ubundi bumwe bw'amakuru..." style={inputSt} />
              </div>
              <button
                type="submit" disabled={saving}
                style={{
                  width: "100%", height: 46, borderRadius: 10, border: "none",
                  background: saving ? "#4A7C59" : `linear-gradient(135deg, ${FOREST_D}, ${FOREST_L})`,
                  color: "#fff", fontFamily: SANS, fontSize: 14, fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: saving ? "none" : "0 4px 14px rgba(27,67,50,0.28)",
                }}
              >
                {saving ? "Birabikwa..." : "Bika"}
              </button>
              {message && (
                <div style={{
                  marginTop: 12, padding: "10px 14px", borderRadius: 9,
                  background: message.ok ? "#F0FDF4" : "#FFF5F5",
                  border: `1px solid ${message.ok ? "#BBF7D0" : "#FECACA"}`,
                  color: message.ok ? "#15803D" : "#B91C1C", fontSize: 13, fontWeight: 500,
                }}>
                  {message.ok ? "✓  " : "✗  "}{message.text}
                </div>
              )}
            </form>
          </div>

          {/* history */}
          <div style={{
            background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`,
            boxShadow: "0 4px 24px rgba(27,67,50,0.07)", overflow: "hidden",
          }}>
            <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #F0EBE3" }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: TEXT }}>Amateka</h2>
            </div>

            {loading ? (
              <div style={{ padding: "22px", display: "grid", gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{
                    height: 52, borderRadius: 10,
                    background: "linear-gradient(90deg,#F0EBE3 25%,#FAF8F4 50%,#F0EBE3 75%)",
                    backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
                  }} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: "44px 22px", textAlign: "center", color: MUTED }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{meta.icon}</div>
                <p style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>Nta makuru aboneka.</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Injiza iya mbere mu ifishi y&apos;ibumoso.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 500, borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#FAF8F4" }}>
                      {["Itariki", "Amafaranga", isElectric ? "Token/Units" : "Resepsiyo", "Inyandiko", ""].map((h) => (
                        <th key={h} style={{
                          padding: "10px 14px", textAlign: "left",
                          fontWeight: 700, color: MUTED, fontSize: 11,
                          letterSpacing: "0.08em", textTransform: "uppercase",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={it._id} style={{ background: i % 2 === 0 ? CARD_BG : "#FDFCFA", borderTop: "1px solid #F5F2EC" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: TEXT }}>{it.date}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: meta.accent }}>{money(it.amount)}</td>
                        <td style={{ padding: "12px 14px" }}>
                          {it.reference
                            ? <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: meta.bg, color: meta.color }}>{it.reference}</span>
                            : <span style={{ color: MUTED }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 14px", color: MUTED }}>{it.notes || it.provider || "—"}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <button
                            onClick={() => void deleteItem(it._id)}
                            style={{
                              padding: "4px 11px", borderRadius: 7, fontSize: 12,
                              background: "#FFF5F5", color: "#B91C1C",
                              border: "1px solid #FECACA", cursor: "pointer", fontFamily: SANS,
                            }}
                          >Siba</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        input:focus, select:focus, textarea:focus {
          border-color: #2D6A4F !important;
          box-shadow: 0 0 0 3px rgba(45,106,79,0.13) !important;
        }
      `}</style>
    </div>
  );
}

function HeroKpi({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 14, padding: "14px 16px",
    }}>
      <p style={{ color: "#A8D5B5", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8, fontFamily: SANS }}>
        {label}
      </p>
      <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", fontFamily: SANS }}>
        {value}
      </p>
    </div>
  );
}
