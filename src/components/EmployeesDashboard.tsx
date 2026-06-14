"use client";

import { CSSProperties, FormEvent, useEffect, useState } from "react";
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

const ROLES = [
  "Umukozi wa bar",
  "Kuki",
  "Umuservi",
  "Kasiyo",
  "Umurezi",
  "Umukozi w'isuku",
  "Umuyobozi",
  "Ibindi",
];

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  "Umukozi wa bar":  { bg: "#D1FAE5", color: "#065F46" },
  "Kuki":            { bg: "#FEF3C7", color: "#92400E" },
  "Umuservi":        { bg: "#DBEAFE", color: "#1E40AF" },
  "Kasiyo":          { bg: "#EDE9FE", color: "#5B21B6" },
  "Umurezi":         { bg: "#FEE2E2", color: "#991B1B" },
  "Umukozi w'isuku": { bg: "#CCFBF1", color: "#0F766E" },
  "Umuyobozi":       { bg: "#FEF9C3", color: "#854D0E" },
  "Ibindi":          { bg: "#F3F4F6", color: "#374151" },
};

function roleStyle(role: string) {
  return ROLE_COLORS[role] ?? { bg: "#F3F4F6", color: "#374151" };
}

function money(value: number) {
  const n = Math.round(value || 0);
  return "RWF " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const TODAY = new Date().toISOString().slice(0, 10);

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

export function EmployeesDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [filter, setFilter]       = useState<"all" | "active" | "inactive">("all");
  const [message, setMessage]     = useState<{ text: string; ok: boolean } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch("/api/employees", { cache: "no-store" });
      const data = (await res.json()) as { employees?: Employee[] };
      setEmployees(data.employees ?? []);
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

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName:  fd.get("fullName"),
          role:      fd.get("role"),
          phone:     fd.get("phone"),
          salary:    Number(fd.get("salary") || 0),
          startDate: fd.get("startDate"),
          idNumber:  fd.get("idNumber"),
          notes:     fd.get("notes"),
          status:    "active",
        }),
      });
      if (!res.ok) throw new Error();
      e.currentTarget.reset();
      setShowForm(false);
      setMessage({ text: "Umukozi wongerewe neza.", ok: true });
      await load();
    } catch {
      setMessage({ text: "Wongera umukozi byanze. Ongera ugerageze.", ok: false });
    } finally {
      setSaving(false);
    }
  }

  async function deleteEmp(id: string) {
    if (!window.confirm("Ugomba gusiba uyu mukozi?")) return;
    try {
      await fetch(`/api/employees/${id}`, { method: "DELETE" });
      await load();
    } catch {
      setMessage({ text: "Gusiba byanze.", ok: false });
    }
  }

  async function toggleStatus(emp: Employee) {
    try {
      await fetch(`/api/employees/${emp._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: emp.status === "active" ? "inactive" : "active" }),
      });
      await load();
    } catch {
      setMessage({ text: "Guhindura byanze.", ok: false });
    }
  }

  const active       = employees.filter((e) => e.status === "active");
  const totalSalary  = active.reduce((s, e) => s + e.salary, 0);
  const rssbEmployer = Math.round(totalSalary * 0.05);
  const rssbEmployee = Math.round(totalSalary * 0.05);

  const filtered = employees.filter((e) =>
    filter === "all" ? true : e.status === filter,
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
          position: "absolute", bottom: -80, right: -80,
          width: 300, height: 300, borderRadius: "50%",
          border: "48px solid rgba(255,255,255,0.04)", pointerEvents: "none",
        }} />

        <div
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
          style={{ position: "relative" }}
        >
          <div style={{ marginBottom: 22 }}>
            <p style={{
              color: "#A8D5B5", fontSize: 12, fontWeight: 600,
              letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8,
            }}>Abakozi</p>
            <h1 style={{
              fontFamily: SERIF,
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              fontWeight: 800, color: "#FFFFFF", lineHeight: 1.15,
            }}>
              Abakozi na{" "}
              <span style={{ color: GOLD_L }}>Mushahara</span>
            </h1>
            <p style={{ color: "#A8D5B5", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
              Genzura abakozi bose, imirimo yabo, mushahara, n&apos;amakuru agenga RSSB.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <HeroKpi label="Abakozi bose"            value={String(employees.length)} />
            <HeroKpi label="Abakozi bakora"          value={String(active.length)} />
            <HeroKpi label="Mushahara wose (ukwezi)" value={money(totalSalary)} />
            <HeroKpi label="RSSB ikigo (5%)"         value={money(rssbEmployer)} color={GOLD_L} />
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Action bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16, flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                  border: "1.5px solid",
                  borderColor: filter === f ? FOREST : BORDER,
                  background: filter === f ? FOREST : CARD_BG,
                  color: filter === f ? "#fff" : MUTED,
                  cursor: "pointer", fontFamily: SANS,
                }}
              >
                {f === "all" ? "Bose" : f === "active" ? "Bakora" : "Ntibakora"}
              </button>
            ))}
          </div>
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
            {showForm ? "Funga" : "+ Ongeramo umukozi"}
          </button>
        </div>

        {/* Add employee form */}
        {showForm && (
          <div style={{
            background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`,
            boxShadow: "0 4px 24px rgba(27,67,50,0.07)", marginBottom: 20, overflow: "hidden",
          }}>
            <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #F0EBE3" }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: TEXT }}>
                Ongeramo Umukozi
              </h2>
              <p style={{ color: MUTED, fontSize: 13, marginTop: 3 }}>
                Injiza amakuru y&apos;umukozi mushya.
              </p>
            </div>
            <form onSubmit={submit} style={{ padding: "16px 22px 22px" }}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label style={labelSt}>Amazina yuzuye *</label>
                  <input
                    name="fullName" required
                    placeholder="Nk'ubuntu: Jean Pierre Uwimana"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Akazi *</label>
                  <select
                    name="role" required
                    style={{ ...inputSt, appearance: "auto" } as CSSProperties}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Nomero ya telefoni</label>
                  <input name="phone" placeholder="07X XXX XXX" style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Mushahara w&apos;ukwezi (RWF)</label>
                  <input
                    name="salary" type="number" min="0" step="1000"
                    defaultValue="0" style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Tariki yatangiye akazi</label>
                  <input
                    name="startDate" type="date"
                    defaultValue={TODAY} style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Nomero y&apos;indangamuntu</label>
                  <input
                    name="idNumber"
                    placeholder="1 XXXX X XXXXXXX X XX"
                    style={inputSt}
                  />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={labelSt}>Inyandiko (optional)</label>
                <textarea
                  name="notes" rows={2}
                  placeholder="Ubundi bumwe bw'amakuru..."
                  style={{ ...inputSt, height: "auto", padding: "10px 13px", resize: "none" } as CSSProperties}
                />
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
                  {saving ? "Birabikwa..." : "Bika umukozi"}
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

        {/* Message banner */}
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

        {/* Employee table */}
        <div style={{
          background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`,
          boxShadow: "0 4px 24px rgba(27,67,50,0.07)", overflow: "hidden",
          marginBottom: 20,
        }}>
          {loading ? (
            <div style={{ padding: "28px 22px", display: "grid", gap: 12 }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 56, borderRadius: 12,
                    background: "linear-gradient(90deg,#F0EBE3 25%,#FAF8F4 50%,#F0EBE3 75%)",
                    backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
                  }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "52px 22px", textAlign: "center", color: MUTED }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
              <p style={{ fontSize: 15, fontWeight: 500, color: TEXT, marginBottom: 6 }}>
                {employees.length === 0 ? "Nta mukozi urabikwa." : "Nta mukozi uhuye n'ufashisha."}
              </p>
              {employees.length === 0 && (
                <p style={{ fontSize: 13 }}>Kanda &quot;+ Ongeramo umukozi&quot; gutangira.</p>
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%", minWidth: 680, borderCollapse: "collapse",
                fontSize: 13, fontFamily: SANS,
              }}>
                <thead>
                  <tr style={{ background: "#FAF8F4" }}>
                    {["Amazina", "Akazi", "Telefoni", "Mushahara / ukwezi", "Tariki", "Imiterere", ""].map((h) => (
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
                  {filtered.map((emp, i) => {
                    const rs = roleStyle(emp.role);
                    return (
                      <tr
                        key={emp._id}
                        style={{
                          background: i % 2 === 0 ? CARD_BG : "#FDFCFA",
                          borderTop: "1px solid #F5F2EC",
                        }}
                      >
                        <td style={{ padding: "13px 14px" }}>
                          <div style={{ fontWeight: 700, color: TEXT, fontSize: 14 }}>
                            {emp.fullName}
                          </div>
                          {emp.idNumber && (
                            <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                              ID: {emp.idNumber}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "13px 14px" }}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 999,
                            fontSize: 11, fontWeight: 700,
                            background: rs.bg, color: rs.color,
                          }}>{emp.role}</span>
                        </td>
                        <td style={{ padding: "13px 14px", color: "#4A4A4A" }}>
                          {emp.phone || "—"}
                        </td>
                        <td style={{ padding: "13px 14px", fontWeight: 700, color: FOREST }}>
                          {money(emp.salary)}
                        </td>
                        <td style={{ padding: "13px 14px", color: "#4A4A4A" }}>
                          {emp.startDate}
                        </td>
                        <td style={{ padding: "13px 14px" }}>
                          <button
                            onClick={() => void toggleStatus(emp)}
                            style={{
                              padding: "4px 11px", borderRadius: 999,
                              fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
                              background: emp.status === "active" ? "#D1FAE5" : "#FEE2E2",
                              color: emp.status === "active" ? "#065F46" : "#991B1B",
                            }}
                          >
                            {emp.status === "active" ? "Akora" : "Ntakora"}
                          </button>
                        </td>
                        <td style={{ padding: "13px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Link
                              href={`/abakozi/${emp._id}`}
                              style={{
                                padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                                background: "#F0FDF4", color: "#15803D",
                                border: "1px solid #BBF7D0", cursor: "pointer",
                                fontFamily: SANS, textDecoration: "none", whiteSpace: "nowrap",
                              }}
                            >Reba / Avansi</Link>
                            <button
                              onClick={() => void deleteEmp(emp._id)}
                              style={{
                                padding: "5px 12px", borderRadius: 7, fontSize: 12,
                                background: "#FFF5F5", color: "#B91C1C",
                                border: "1px solid #FECACA", cursor: "pointer", fontFamily: SANS,
                              }}
                            >Siba</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RSSB summary */}
        {active.length > 0 && (
          <div style={{
            background: CARD_BG, borderRadius: 16, border: `1px solid ${BORDER}`,
            boxShadow: "0 2px 12px rgba(27,67,50,0.06)", padding: "18px 22px",
          }}>
            <h3 style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 14 }}>
              Incamake ya RSSB
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryTile label="Mushahara wose (brut)" value={money(totalSalary)} />
              <SummaryTile label="RSSB abakozi (5%)"     value={money(rssbEmployee)} tone="warn" />
              <SummaryTile label="RSSB ikigo (5%)"       value={money(rssbEmployer)} tone="warn" />
              <SummaryTile label="Abakozi bakira (net)"  value={money(totalSalary - rssbEmployee)} tone="good" />
            </div>
            <p style={{ fontSize: 12, color: MUTED, marginTop: 12, lineHeight: 1.6 }}>
              RSSB: umukozi atanga 5% (igabanwa ku mushahara), ikigo cyongeraho 5% (gishyirwa n&apos;ikigo ubwacyo).
              Mushahara bakira (net) = brut × 95%.
            </p>
          </div>
        )}
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

function SummaryTile({
  label, value, tone = "neutral",
}: { label: string; value: string; tone?: "neutral" | "good" | "warn" }) {
  const bg    = tone === "good" ? "#F0FDF4"  : tone === "warn" ? "#FFFBEB"  : "#FAF8F4";
  const bc    = tone === "good" ? "#BBF7D0"  : tone === "warn" ? "#FDE68A"  : "#F0EBE3";
  const color = tone === "good" ? "#15803D"  : tone === "warn" ? "#92400E"  : TEXT;
  return (
    <div style={{ background: bg, border: `1px solid ${bc}`, borderRadius: 12, padding: "12px 14px" }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: MUTED,
        letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontFamily: SANS,
      }}>{label}</p>
      <p style={{ fontSize: 17, fontWeight: 800, color, letterSpacing: "-0.02em", fontFamily: SANS }}>
        {value}
      </p>
    </div>
  );
}
