"use client";

import { CSSProperties, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Employee = {
  _id: string;
  fullName: string;
  role: string;
  phone: string;
  salary: number;
  startDate: string;
  status: "active" | "inactive";
  idNumber: string;
  notes: string;
};

type TransactionType = "avansi" | "amande" | "bonus";

type Transaction = {
  _id: string;
  date: string;
  type: TransactionType;
  amount: number;
  reason: string;
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

const TX_META: Record<TransactionType, { label: string; sign: -1 | 1; bg: string; color: string; hint: string }> = {
  avansi: { label: "Avansi",          sign: -1, bg: "#FEF3C7", color: "#92400E", hint: "Amafaranga yafashe mbere y'umushahara" },
  amande: { label: "Amande / Igihano", sign: -1, bg: "#FEE2E2", color: "#991B1B", hint: "Igabanywa iyo hari ikosa (gukoresha nabi, kumena...)" },
  bonus:  { label: "Bonusi",           sign: 1,  bg: "#D1FAE5", color: "#065F46", hint: "Amafaranga yiyongera (akazi keza, overtime...)" },
};

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

export function EmployeeDetail({ employeeId }: { employeeId: string }) {
  const [employee, setEmployee]   = useState<Employee | null>(null);
  const [txs, setTxs]             = useState<Transaction[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [month, setMonth]         = useState(THIS_MONTH);
  const [txType, setTxType]       = useState<TransactionType>("avansi");
  const [message, setMessage]     = useState<{ text: string; ok: boolean } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [empRes, txRes] = await Promise.all([
        fetch(`/api/employees/${employeeId}`, { cache: "no-store" }),
        fetch(`/api/employees/${employeeId}/transactions`, { cache: "no-store" }),
      ]);
      const empData = (await empRes.json()) as { employee?: Employee };
      const txData  = (await txRes.json()) as { transactions?: Transaction[] };
      setEmployee(empData.employee ?? null);
      setTxs(txData.transactions ?? []);
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
  }, [employeeId]);

  const monthTxs = useMemo(
    () => txs.filter((t) => t.date.startsWith(month)),
    [txs, month],
  );

  const sums = useMemo(() => {
    const acc = { avansi: 0, amande: 0, bonus: 0 };
    monthTxs.forEach((t) => { acc[t.type] += t.amount; });
    return acc;
  }, [monthTxs]);

  const salary    = employee?.salary ?? 0;
  const netPay    = salary + sums.bonus - sums.avansi - sums.amande;

  async function addTx(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/employees/${employeeId}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date:   fd.get("date"),
          type:   fd.get("type"),
          amount: Number(fd.get("amount") || 0),
          reason: fd.get("reason"),
        }),
      });
      if (!res.ok) throw new Error();
      e.currentTarget.reset();
      setMessage({ text: "Byanditswe neza.", ok: true });
      await load();
    } catch {
      setMessage({ text: "Kubika byanze. Ongera ugerageze.", ok: false });
    } finally {
      setSaving(false);
    }
  }

  async function deleteTx(id: string) {
    if (!window.confirm("Ugomba gusiba iyi nyandiko?")) return;
    try {
      await fetch(`/api/employees/${employeeId}/transactions/${id}`, { method: "DELETE" });
      await load();
    } catch {
      setMessage({ text: "Gusiba byanze.", ok: false });
    }
  }

  const initials = (employee?.fullName ?? "?")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

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
        <div
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
          style={{ position: "relative" }}
        >
          <Link
            href="/abakozi"
            style={{
              color: "#A8D5B5", fontSize: 13, fontWeight: 500,
              textDecoration: "none", marginBottom: 16, display: "inline-block",
            }}
          >← Subira ku bakozi</Link>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16, flexShrink: 0,
              background: `linear-gradient(135deg, ${GOLD_L}, #C9921F)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800, color: FOREST_D,
            }}>{initials}</div>
            <div>
              <h1 style={{
                fontFamily: SERIF, fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontWeight: 800, color: "#fff", lineHeight: 1.1,
              }}>{employee?.fullName ?? "..."}</h1>
              <p style={{ color: "#A8D5B5", fontSize: 14, marginTop: 4 }}>
                {employee?.role}{employee?.phone ? `  ·  ${employee.phone}` : ""}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* month picker */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 18, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Ukwezi:</span>
          <input
            type="month" value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ ...inputSt, width: "auto", height: 40 }}
          />
        </div>

        {/* net pay summary */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" style={{ marginBottom: 22 }}>
          <SummaryTile label="Umushahara (base)" value={money(salary)} />
          <SummaryTile label="Bonusi (+)"        value={money(sums.bonus)}  tone="good" />
          <SummaryTile label="Avansi (−)"        value={money(sums.avansi)} tone="warn" />
          <SummaryTile label="Amande (−)"        value={money(sums.amande)} tone="bad" />
          <SummaryTile label="Asigaye guhembwa"  value={money(netPay)}      tone="net" big />
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.4fr]">

          {/* add transaction form */}
          <div style={{
            background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`,
            boxShadow: "0 4px 24px rgba(27,67,50,0.07)", overflow: "hidden",
            alignSelf: "start",
          }}>
            <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #F0EBE3" }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: TEXT }}>
                Ongeramo
              </h2>
              <p style={{ color: MUTED, fontSize: 13, marginTop: 3 }}>
                Avansi, amande (igihano), cyangwa bonusi.
              </p>
            </div>
            <form onSubmit={addTx} style={{ padding: "16px 22px 22px" }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Ubwoko</label>
                <div style={{ display: "grid", gap: 8 }}>
                  {(Object.keys(TX_META) as TransactionType[]).map((t) => {
                    const meta = TX_META[t];
                    const active = txType === t;
                    return (
                      <label
                        key={t}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                          border: `1.5px solid ${active ? meta.color : BORDER}`,
                          background: active ? meta.bg : INPUT_BG,
                        }}
                      >
                        <input
                          type="radio" name="type" value={t}
                          checked={active}
                          onChange={() => setTxType(t)}
                          style={{ accentColor: meta.color }}
                        />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: active ? meta.color : TEXT }}>
                            {meta.label}
                          </div>
                          <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>{meta.hint}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Amafaranga (RWF)</label>
                <input name="amount" type="number" min="0" step="100" defaultValue="0" required style={inputSt} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Itariki</label>
                <input name="date" type="date" defaultValue={TODAY} style={inputSt} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>Impamvu</label>
                <input name="reason" placeholder="Urugero: yamennye amacupa 3..." style={inputSt} />
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
                  color: message.ok ? "#15803D" : "#B91C1C",
                  fontSize: 13, fontWeight: 500,
                }}>
                  {message.ok ? "✓  " : "✗  "}{message.text}
                </div>
              )}
            </form>
          </div>

          {/* transaction history */}
          <div style={{
            background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`,
            boxShadow: "0 4px 24px rgba(27,67,50,0.07)", overflow: "hidden",
          }}>
            <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #F0EBE3" }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: TEXT }}>
                Amateka ya {month}
              </h2>
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
            ) : monthTxs.length === 0 ? (
              <div style={{ padding: "44px 22px", textAlign: "center", color: MUTED }}>
                <p style={{ fontSize: 14 }}>Nta nyandiko yo muri {month}.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 460, borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#FAF8F4" }}>
                      {["Itariki", "Ubwoko", "Amafaranga", "Impamvu", ""].map((h) => (
                        <th key={h} style={{
                          padding: "10px 14px", textAlign: "left",
                          fontWeight: 700, color: MUTED, fontSize: 11,
                          letterSpacing: "0.08em", textTransform: "uppercase",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthTxs.map((t, i) => {
                      const meta = TX_META[t.type];
                      return (
                        <tr key={t._id} style={{ background: i % 2 === 0 ? CARD_BG : "#FDFCFA", borderTop: "1px solid #F5F2EC" }}>
                          <td style={{ padding: "12px 14px", fontWeight: 600, color: TEXT }}>{t.date}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{
                              padding: "3px 10px", borderRadius: 999,
                              fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color,
                            }}>{meta.label}</span>
                          </td>
                          <td style={{ padding: "12px 14px", fontWeight: 700, color: meta.sign === 1 ? "#15803D" : "#B91C1C" }}>
                            {meta.sign === 1 ? "+" : "−"} {money(t.amount)}
                          </td>
                          <td style={{ padding: "12px 14px", color: MUTED }}>{t.reason || "—"}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <button
                              onClick={() => void deleteTx(t._id)}
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

function SummaryTile({
  label, value, tone = "neutral", big,
}: {
  label: string; value: string;
  tone?: "neutral" | "good" | "bad" | "warn" | "net"; big?: boolean;
}) {
  const map = {
    neutral: { bg: "#FAF8F4", bc: "#F0EBE3", color: TEXT },
    good:    { bg: "#F0FDF4", bc: "#BBF7D0", color: "#15803D" },
    bad:     { bg: "#FFF5F5", bc: "#FECACA", color: "#B91C1C" },
    warn:    { bg: "#FFFBEB", bc: "#FDE68A", color: "#92400E" },
    net:     { bg: FOREST,    bc: FOREST,    color: "#fff" },
  }[tone];
  return (
    <div style={{
      background: map.bg, border: `1px solid ${map.bc}`,
      borderRadius: 12, padding: big ? "14px 16px" : "12px 14px",
    }}>
      <p style={{
        fontSize: 11, fontWeight: 700,
        color: tone === "net" ? "rgba(255,255,255,0.7)" : MUTED,
        letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6, fontFamily: SANS,
      }}>{label}</p>
      <p style={{ fontSize: big ? 20 : 17, fontWeight: 800, color: map.color, letterSpacing: "-0.02em", fontFamily: SANS }}>
        {value}
      </p>
    </div>
  );
}
