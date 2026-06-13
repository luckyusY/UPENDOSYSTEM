"use client";

import { CSSProperties, FormEvent, useEffect, useMemo, useState } from "react";

type UtilityCategory =
  | "amashanyarazi"
  | "amazi"
  | "internet"
  | "ubukode"
  | "rssb"
  | "rra"
  | "ibikoresho"
  | "ubwishingizi"
  | "ibindi";

type UtilityExpense = {
  _id: string;
  date: string;
  category: UtilityCategory;
  amount: number;
  provider: string;
  reference: string;
  notes: string;
};

const CAT_META: Record<UtilityCategory, { label: string; hint: string; bg: string; color: string }> = {
  amashanyarazi: { label: "Amashanyarazi", hint: "EUCL",        bg: "#FEF3C7", color: "#92400E" },
  amazi:         { label: "Amazi",         hint: "WASAC",       bg: "#DBEAFE", color: "#1E40AF" },
  internet:      { label: "Internet",      hint: "MTN / Airtel",bg: "#EDE9FE", color: "#5B21B6" },
  ubukode:       { label: "Ubukode",       hint: "Rent",        bg: "#D1FAE5", color: "#065F46" },
  rssb:          { label: "RSSB",          hint: "RSSB",        bg: "#FEE2E2", color: "#991B1B" },
  rra:           { label: "RRA / Umusoro", hint: "RRA",         bg: "#F3F4F6", color: "#374151" },
  ibikoresho:    { label: "Ibikoresho",    hint: "Supplies",    bg: "#CCFBF1", color: "#0F766E" },
  ubwishingizi:  { label: "Ubwishingizi",  hint: "Insurance",   bg: "#F3E8FF", color: "#6B21A8" },
  ibindi:        { label: "Ibindi",        hint: "Other",       bg: "#F3F4F6", color: "#374151" },
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

export function UtilitiesDashboard() {
  const [expenses, setExpenses] = useState<UtilityExpense[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState<UtilityCategory | "all">("all");
  const [message, setMessage]   = useState<{ text: string; ok: boolean } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch("/api/utilities", { cache: "no-store" });
      const data = (await res.json()) as { expenses?: UtilityExpense[] };
      setExpenses(data.expenses ?? []);
    } catch {
      setMessage({ text: "Ntibyashobotse gufata amakuru.", ok: false });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const thisMonth = useMemo(
    () => expenses.filter((e) => e.date.startsWith(THIS_MONTH)),
    [expenses],
  );

  const totalMonth = useMemo(() => thisMonth.reduce((s, e) => s + e.amount, 0), [thisMonth]);

  const byCat = useMemo(() => {
    const acc: Partial<Record<UtilityCategory, number>> = {};
    thisMonth.forEach((e) => { acc[e.category] = (acc[e.category] ?? 0) + e.amount; });
    return acc;
  }, [thisMonth]);

  const electricHistory = useMemo(
    () => expenses.filter((e) => e.category === "amashanyarazi").slice(0, 12),
    [expenses],
  );

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
          category:  fd.get("category"),
          amount:    Number(fd.get("amount") || 0),
          provider:  fd.get("provider"),
          reference: fd.get("reference"),
          notes:     fd.get("notes"),
        }),
      });
      if (!res.ok) throw new Error();
      e.currentTarget.reset();
      setShowForm(false);
      setMessage({ text: "Ibyoherezwa byabitswe neza.", ok: true });
      await load();
    } catch {
      setMessage({ text: "Kubika byanze. Ongera ugerageze.", ok: false });
    } finally {
      setSaving(false);
    }
  }

  async function deleteExp(id: string) {
    if (!window.confirm("Ugomba gusiba iyi raporo?")) return;
    try {
      await fetch(`/api/utilities/${id}`, { method: "DELETE" });
      await load();
    } catch {
      setMessage({ text: "Gusiba byanze.", ok: false });
    }
  }

  const filtered = expenses.filter(
    (e) => filterCat === "all" || e.category === filterCat,
  );

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
          position: "absolute", bottom: -60, right: -60,
          width: 280, height: 280, borderRadius: "50%",
          border: "40px solid rgba(201,146,31,0.12)", pointerEvents: "none",
        }} />

        <div
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
          style={{ position: "relative" }}
        >
          <div style={{ marginBottom: 22 }}>
            <p style={{
              color: "#A8D5B5", fontSize: 12, fontWeight: 600,
              letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8,
            }}>Gasutamo & Ibikoresho</p>
            <h1 style={{
              fontFamily: SERIF,
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              fontWeight: 800, color: "#FFFFFF", lineHeight: 1.15,
            }}>
              Ibyoherezwa buri{" "}
              <span style={{ color: GOLD_L }}>Kwezi</span>
            </h1>
            <p style={{ color: "#A8D5B5", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
              Amashanyarazi (EUCL), amazi (WASAC), internet, ubukode, RSSB, RRA, n&apos;ibindi.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <HeroKpi label={`Ikirenga — ${THIS_MONTH}`}  value={money(totalMonth)} color="#FC8181" />
            <HeroKpi label="Amashanyarazi (uku kwezi)"   value={money(byCat.amashanyarazi ?? 0)} color={GOLD_L} />
            <HeroKpi label="Amazi (uku kwezi)"           value={money(byCat.amazi ?? 0)}  color="#93C5FD" />
            <HeroKpi label="Ubukode (uku kwezi)"         value={money(byCat.ubukode ?? 0)} color="#A7F3D0" />
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Action bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "9px 20px", borderRadius: 10, fontWeight: 700, fontSize: 14,
              background: showForm
                ? "#F0EBE3"
                : `linear-gradient(135deg, ${FOREST_D}, ${FOREST_L})`,
              color: showForm ? FOREST : "#fff",
              border: "none", cursor: "pointer", fontFamily: SANS,
              boxShadow: showForm ? "none" : "0 4px 14px rgba(27,67,50,0.28)",
            }}
          >
            {showForm ? "Funga" : "+ Ongeramo ibyoherezwa"}
          </button>
        </div>

        {/* Add expense form */}
        {showForm && (
          <div style={{
            background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`,
            boxShadow: "0 4px 24px rgba(27,67,50,0.07)", marginBottom: 20, overflow: "hidden",
          }}>
            <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #F0EBE3" }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: TEXT }}>
                Ongeramo Ibyoherezwa
              </h2>
              <p style={{ color: MUTED, fontSize: 13, marginTop: 3 }}>
                Injiza amashanyarazi, amazi, internet, ubukode, n&apos;ibindi.
              </p>
            </div>
            <form onSubmit={submit} style={{ padding: "16px 22px 22px" }}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label style={labelSt}>Itariki *</label>
                  <input name="date" type="date" defaultValue={TODAY} required style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Ubwoko *</label>
                  <select
                    name="category" required
                    style={{ ...inputSt, appearance: "auto" } as CSSProperties}
                  >
                    {(Object.entries(CAT_META) as [UtilityCategory, { label: string; hint: string }][]).map(
                      ([k, v]) => (
                        <option key={k} value={k}>{v.label} — {v.hint}</option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Amafaranga (RWF) *</label>
                  <input
                    name="amount" type="number" min="0" step="100"
                    defaultValue="0" required style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Uwabihe / Sosiyete</label>
                  <input
                    name="provider"
                    placeholder="Nk'ubuntu: EUCL, WASAC, MTN..."
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Nimero ya resepsiyo / Token</label>
                  <input
                    name="reference"
                    placeholder="Nimero yo hejuru ya resepsiyo..."
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Inyandiko</label>
                  <input
                    name="notes"
                    placeholder="Ubundi bumwe bw'amakuru..."
                    style={inputSt}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button
                  type="submit" disabled={saving}
                  style={{
                    height: 46, padding: "0 28px", borderRadius: 10, border: "none",
                    background: saving
                      ? "#4A7C59"
                      : `linear-gradient(135deg, ${FOREST_D}, ${FOREST_L})`,
                    color: "#fff", fontFamily: SANS, fontSize: 14, fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: saving ? "none" : "0 4px 14px rgba(27,67,50,0.28)",
                  }}
                >
                  {saving ? "Birabikwa..." : "Bika"}
                </button>
                <button
                  type="button" onClick={() => setShowForm(false)}
                  style={{
                    height: 46, padding: "0 20px", borderRadius: 10, border: "none",
                    background: "#F0EBE3", color: MUTED, fontFamily: SANS, fontSize: 14, cursor: "pointer",
                  }}
                >Hagarika</button>
              </div>
            </form>
          </div>
        )}

        {/* Message */}
        {message && (
          <div style={{
            marginBottom: 16, padding: "12px 16px", borderRadius: 10,
            background: message.ok ? "#F0FDF4" : "#FFF5F5",
            border: `1px solid ${message.ok ? "#BBF7D0" : "#FECACA"}`,
            color: message.ok ? "#15803D" : "#B91C1C",
            fontSize: 14, fontWeight: 500,
          }}>
            {message.ok ? "✓  " : "✗  "}{message.text}
          </div>
        )}

        {/* This-month category breakdown */}
        {Object.keys(byCat).length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
              Ibyoherezwa bya {THIS_MONTH}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(Object.entries(byCat) as [UtilityCategory, number][]).map(([cat, total]) => {
                const meta = CAT_META[cat];
                return (
                  <div
                    key={cat}
                    style={{
                      background: CARD_BG, border: `1px solid ${BORDER}`,
                      borderRadius: 14, padding: "14px 16px",
                      boxShadow: "0 2px 8px rgba(27,67,50,0.05)",
                    }}
                  >
                    <span style={{
                      display: "inline-block",
                      padding: "3px 10px", borderRadius: 999,
                      fontSize: 11, fontWeight: 700,
                      background: meta.bg, color: meta.color,
                      marginBottom: 8,
                    }}>{meta.label}</span>
                    <p style={{ fontSize: 20, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>
                      {money(total)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Electricity (EUCL) token history */}
        {electricHistory.length > 0 && (
          <div style={{
            background: "#FFFBEB", border: "1px solid #FDE68A",
            borderRadius: 16, padding: "18px 20px", marginBottom: 24,
          }}>
            <h3 style={{
              fontFamily: SERIF, fontSize: 16, fontWeight: 700,
              color: "#92400E", marginBottom: 14,
            }}>
              Amashanyarazi — Amatoke EUCL
            </h3>
            <div style={{ display: "grid", gap: 8 }}>
              {electricHistory.map((e) => (
                <div
                  key={e._id}
                  style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap", gap: 8,
                    background: "#FFFFFF", border: "1px solid #FDE68A",
                    borderRadius: 10, padding: "10px 14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: "#92400E", fontSize: 14 }}>{e.date}</span>
                    {e.reference && (
                      <span style={{
                        background: "#FEF3C7", color: "#B45309",
                        fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 999,
                      }}>Token: {e.reference}</span>
                    )}
                    {e.provider && (
                      <span style={{ color: MUTED, fontSize: 12 }}>{e.provider}</span>
                    )}
                    {e.notes && (
                      <span style={{ color: MUTED, fontSize: 12 }}>{e.notes}</span>
                    )}
                  </div>
                  <span style={{ fontWeight: 800, color: "#92400E", fontSize: 15, flexShrink: 0 }}>
                    {money(e.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full history table */}
        <div style={{
          background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`,
          boxShadow: "0 4px 24px rgba(27,67,50,0.07)", overflow: "hidden",
        }}>
          <div style={{
            padding: "16px 22px 12px", borderBottom: "1px solid #F0EBE3",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 10,
          }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: TEXT }}>
              Amateka Yose
            </h2>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value as UtilityCategory | "all")}
              style={{
                height: 36, borderRadius: 8, border: `1px solid ${BORDER}`,
                padding: "0 10px", fontSize: 13, fontFamily: SANS,
                outline: "none", background: INPUT_BG,
              }}
            >
              <option value="all">Ubwoko bwose</option>
              {(Object.entries(CAT_META) as [UtilityCategory, { label: string }][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ padding: "24px", display: "grid", gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 52, borderRadius: 10,
                    background: "linear-gradient(90deg,#F0EBE3 25%,#FAF8F4 50%,#F0EBE3 75%)",
                    backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
                  }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "48px 22px", textAlign: "center", color: MUTED }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: TEXT, marginBottom: 6 }}>
                Nta makuru aboneka.
              </p>
              <p style={{ fontSize: 13 }}>Kanda &quot;+ Ongeramo ibyoherezwa&quot; gutangira.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%", minWidth: 620, borderCollapse: "collapse",
                fontSize: 13, fontFamily: SANS,
              }}>
                <thead>
                  <tr style={{ background: "#FAF8F4" }}>
                    {["Itariki", "Ubwoko", "Amafaranga", "Uwabihe", "Nimero/Token", "Inyandiko", ""].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 14px", textAlign: "left",
                          fontWeight: 700, color: MUTED,
                          fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase",
                        }}
                      >{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((exp, i) => {
                    const meta = CAT_META[exp.category];
                    return (
                      <tr
                        key={exp._id}
                        style={{ background: i % 2 === 0 ? CARD_BG : "#FDFCFA", borderTop: "1px solid #F5F2EC" }}
                      >
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: TEXT }}>{exp.date}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 999,
                            fontSize: 11, fontWeight: 700,
                            background: meta.bg, color: meta.color,
                          }}>{meta.label}</span>
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: FOREST }}>
                          {money(exp.amount)}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#4A4A4A" }}>{exp.provider || "—"}</td>
                        <td style={{ padding: "12px 14px", color: "#4A4A4A" }}>{exp.reference || "—"}</td>
                        <td style={{ padding: "12px 14px", color: MUTED }}>{exp.notes || "—"}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <button
                            onClick={() => void deleteExp(exp._id)}
                            style={{
                              padding: "4px 11px", borderRadius: 7, fontSize: 12,
                              background: "#FFF5F5", color: "#B91C1C",
                              border: "1px solid #FECACA", cursor: "pointer", fontFamily: SANS,
                            }}
                          >Siba</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        input:focus, select:focus, textarea:focus {
          border-color: #2D6A4F !important;
          box-shadow: 0 0 0 3px rgba(45,106,79,0.13) !important;
        }
      `}</style>
    </div>
  );
}

function HeroKpi({
  label, value, color = "#FFFFFF",
}: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 14, padding: "14px 16px",
    }}>
      <p style={{
        color: "#A8D5B5", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.05em", marginBottom: 8, fontFamily: SANS,
      }}>{label}</p>
      <p style={{
        fontSize: 20, fontWeight: 800, color,
        letterSpacing: "-0.02em", fontFamily: SANS,
      }}>{value}</p>
    </div>
  );
}
