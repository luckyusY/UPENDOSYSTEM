"use client";

import { CSSProperties, FormEvent, useEffect, useMemo, useState } from "react";

type Shift = "amanywa" | "nimugoroba" | "umunsi-wose";

type OperationRecord = {
  _id: string;
  date: string;
  shift: Shift;
  barSales: number;
  restaurantSales: number;
  cashSales: number;
  mobileMoneySales: number;
  cardSales: number;
  creditSales: number;
  expenses: number;
  purchases: number;
  openingStock: number;
  closingStock: number;
  wastage: number;
  staffCount: number;
  notes?: string;
};

type RecordForm = Omit<OperationRecord, "_id">;

const emptyForm: RecordForm = {
  date: new Date().toISOString().slice(0, 10),
  shift: "umunsi-wose",
  barSales: 0,
  restaurantSales: 0,
  cashSales: 0,
  mobileMoneySales: 0,
  cardSales: 0,
  creditSales: 0,
  expenses: 0,
  purchases: 0,
  openingStock: 0,
  closingStock: 0,
  wastage: 0,
  staffCount: 0,
  notes: "",
};

function money(value: number) {
  const n = Math.round(value || 0);
  return "RWF " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function totalSales(record: Pick<RecordForm, "barSales" | "restaurantSales">) {
  return record.barSales + record.restaurantSales;
}

function totalPayments(
  record: Pick<RecordForm, "cashSales" | "mobileMoneySales" | "cardSales" | "creditSales">,
) {
  return record.cashSales + record.mobileMoneySales + record.cardSales + record.creditSales;
}

function stockUsed(
  record: Pick<RecordForm, "openingStock" | "purchases" | "closingStock" | "wastage">,
) {
  return Math.max(
    record.openingStock + record.purchases - record.closingStock - record.wastage,
    0,
  );
}

function parseValue(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

const shiftLabel: Record<Shift, string> = {
  "umunsi-wose": "Umunsi wose",
  amanywa: "Amanywa",
  nimugoroba: "Nimugoroba",
};

function shiftBadge(shift: Shift): CSSProperties {
  switch (shift) {
    case "umunsi-wose": return { background: "#D1FAE5", color: "#065F46" };
    case "amanywa":     return { background: "#FEF3C7", color: "#92400E" };
    case "nimugoroba":  return { background: "#DBEAFE", color: "#1E40AF" };
  }
}

const FOREST   = "#1B4332";
const FOREST_D = "#0D2B1D";
const FOREST_L = "#2D6A4F";
const GOLD     = "#C9921F";
const GOLD_L   = "#F4C542";
const CREAM    = "#F4F1EB";
const CARD_BG  = "#FFFFFF";
const BORDER   = "#E8E2D9";
const MUTED    = "#7A7163";
const TEXT     = "#1A1A1A";
const INPUT_BG = "#FDFCFA";
const SERIF    = "'Playfair Display', Georgia, serif";
const SANS     = "'DM Sans', system-ui, sans-serif";

export function OperationsDashboard() {
  const [records, setRecords] = useState<OperationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function loadRecords() {
    setLoading(true);
    try {
      const response = await fetch("/api/records", { cache: "no-store" });
      const data = (await response.json()) as { records?: OperationRecord[] };
      setRecords(data.records ?? []);
    } catch {
      setMessage({ text: "Raporo ntizabonetse. Reba internet cyangwa MongoDB.", ok: false });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadRecords(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const totals = useMemo(() => {
    return records.reduce(
      (sum, r) => {
        sum.sales     += totalSales(r);
        sum.expenses  += r.expenses;
        sum.purchases += r.purchases;
        sum.stock     += stockUsed(r);
        return sum;
      },
      { sales: 0, expenses: 0, purchases: 0, stock: 0 },
    );
  }, [records]);

  const latest         = records[0];
  const profitEstimate = totals.sales - totals.expenses - totals.purchases;
  const paymentMismatch = latest ? totalPayments(latest) - totalSales(latest) : 0;
  const maxDailySale   = Math.max(...records.slice(0, 7).map(totalSales), 1);

  async function submitRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const data = new FormData(event.currentTarget);
    const record: RecordForm = {
      date:              String(data.get("date") || emptyForm.date),
      shift:             String(data.get("shift") || emptyForm.shift) as Shift,
      barSales:          parseValue(data.get("barSales")),
      restaurantSales:   parseValue(data.get("restaurantSales")),
      cashSales:         parseValue(data.get("cashSales")),
      mobileMoneySales:  parseValue(data.get("mobileMoneySales")),
      cardSales:         parseValue(data.get("cardSales")),
      creditSales:       parseValue(data.get("creditSales")),
      expenses:          parseValue(data.get("expenses")),
      purchases:         parseValue(data.get("purchases")),
      openingStock:      parseValue(data.get("openingStock")),
      closingStock:      parseValue(data.get("closingStock")),
      wastage:           parseValue(data.get("wastage")),
      staffCount:        parseValue(data.get("staffCount")),
      notes:             String(data.get("notes") || ""),
    };

    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      if (!response.ok) throw new Error("save failed");
      event.currentTarget.reset();
      setMessage({ text: "Raporo yabitswe neza.", ok: true });
    } catch {
      setMessage({
        text: "Byatinze kwemezwa. Reba ku rutonde hepfo niba raporo yabitswe.",
        ok: false,
      });
    } finally {
      setSaving(false);
      // Always re-read: on a slow Vercel/Atlas response the write usually
      // still succeeds even when the client times out, so this shows it.
      await loadRecords();
    }
  }

  return (
    <div style={{ background: CREAM, minHeight: "100vh", fontFamily: SANS }}>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header style={{
        background: `linear-gradient(150deg, ${FOREST_D} 0%, ${FOREST} 55%, ${FOREST_L} 100%)`,
        position: "relative", overflow: "hidden",
      }}>
        {/* dot-grid texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.045,
          backgroundImage: "radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)",
          backgroundSize: "24px 24px", pointerEvents: "none",
        }} />
        {/* decorative rings */}
        <div style={{
          position: "absolute", bottom: -80, right: -80,
          width: 320, height: 320, borderRadius: "50%",
          border: "48px solid rgba(255,255,255,0.04)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -20, right: 80,
          width: 180, height: 180, borderRadius: "50%",
          border: "20px solid rgba(201,146,31,0.18)", pointerEvents: "none",
        }} />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" style={{ position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* brand + date */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                    background: `linear-gradient(135deg, ${GOLD}, ${GOLD_L})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: SERIF, fontSize: 20, fontWeight: 800, color: FOREST,
                    boxShadow: "0 2px 12px rgba(201,146,31,0.4)",
                  }}>U</div>
                  <span style={{
                    color: "#A8D5B5", fontSize: 12, fontWeight: 600,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                  }}>Upendo System</span>
                </div>
                <h1 style={{
                  fontFamily: SERIF, fontSize: "clamp(1.75rem, 4vw, 2.9rem)",
                  fontWeight: 800, color: "#FFFFFF", lineHeight: 1.15, maxWidth: 580,
                }}>
                  Raporo y&apos;Ibikorwa<br />
                  <span style={{ color: GOLD_L }}>bya Bar na Restaurant</span>
                </h1>
                <p style={{ color: "#A8D5B5", fontSize: 14, marginTop: 12, maxWidth: 480, lineHeight: 1.65 }}>
                  Injiza amakuru ya buri munsi: amafaranga yinjiye, stock,
                  ibyo mwaguze, expenses, n&apos;inyandiko z&apos;umuyobozi.
                </p>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.14)", borderRadius: 18,
                padding: "18px 24px", minWidth: 164, flexShrink: 0,
              }}>
                <p style={{ color: "#A8D5B5", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                  Uyu munsi
                </p>
                <p style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>
                  {emptyForm.date}
                </p>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%", background: "#52B788",
                    boxShadow: "0 0 0 3px rgba(82,183,136,0.25)",
                  }} />
                  <span style={{ color: "#52B788", fontSize: 12, fontWeight: 500 }}>Sisitemu ikora</span>
                </div>
              </div>
            </div>

            {/* KPI row */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Sales zose"     value={money(totals.sales)}     arrow="up"   arrowColor="#52B788" />
              <KpiCard label="Expenses"       value={money(totals.expenses)}  arrow="down" arrowColor="#FC8181" />
              <KpiCard label="Ibyaguzwe"      value={money(totals.purchases)} arrow="dot"  arrowColor="#F6AD55" />
              <KpiCard
                label="Profit estimate"
                value={money(profitEstimate)}
                arrow={profitEstimate >= 0 ? "up" : "down"}
                arrowColor={profitEstimate >= 0 ? GOLD_L : "#FC8181"}
                highlight
                good={profitEstimate >= 0}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────── */}
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">

        {/* ── FORM ── */}
        <form onSubmit={submitRecord}>
          <div style={{
            background: CARD_BG, borderRadius: 20,
            border: `1px solid ${BORDER}`,
            boxShadow: "0 4px 28px rgba(27,67,50,0.08), 0 1px 4px rgba(27,67,50,0.04)",
            overflow: "hidden",
          }}>
            {/* form header */}
            <div style={{ padding: "22px 24px 18px", borderBottom: `1px solid #F0EBE3` }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 700, color: TEXT }}>
                    Injiza Raporo Nshya
                  </h2>
                  <p style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>
                    Bikoreshwa ku mpera ya shift cyangwa ku mpera y&apos;umunsi.
                  </p>
                </div>
                <span style={{
                  background: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0",
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                  padding: "4px 11px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0,
                }}>Mobile ready</span>
              </div>
            </div>

            <div style={{ padding: "4px 24px 28px" }}>

              <FormSection label="Igihe" num="01">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Itariki" name="date" type="date" defaultValue={emptyForm.date} />
                  <div>
                    <label style={labelStyle}>Shift</label>
                    <select name="shift" defaultValue={emptyForm.shift} style={inputStyle as CSSProperties}>
                      <option value="umunsi-wose">Umunsi wose</option>
                      <option value="amanywa">Amanywa</option>
                      <option value="nimugoroba">Nimugoroba</option>
                    </select>
                  </div>
                </div>
              </FormSection>

              <FormSection label="Amafaranga Yinjiye" num="02">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Sales za bar"        name="barSales" />
                  <Field label="Sales za restaurant" name="restaurantSales" />
                </div>
              </FormSection>

              <FormSection label="Uburyo bwo Kwishyura" num="03">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Cash"             name="cashSales" />
                  <Field label="Mobile money"     name="mobileMoneySales" />
                  <Field label="Card / bank"      name="cardSales" />
                  <Field label="Credit / amadeni" name="creditSales" />
                </div>
              </FormSection>

              <FormSection label="Stock & Ibigo" num="04">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Opening stock value"     name="openingStock" />
                  <Field label="Closing stock value"     name="closingStock" />
                  <Field label="Ibyaguzwe"               name="purchases" />
                  <Field label="Ibyangiritse / wastage"  name="wastage" />
                </div>
              </FormSection>

              <FormSection label="Ibindi" num="05">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Expenses"        name="expenses" />
                  <Field label="Abakozi bakoze"  name="staffCount" />
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={labelStyle}>Icyitonderwa</label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Urugero: supplier yatinze, cash shortage, stock iri hasi..."
                    style={{
                      ...inputStyle,
                      height: "auto", padding: "10px 13px",
                      resize: "none", display: "block", width: "100%",
                    } as CSSProperties}
                  />
                </div>
              </FormSection>

              <button
                type="submit"
                disabled={saving}
                style={{
                  marginTop: 10, width: "100%", height: 50,
                  background: saving
                    ? "#4A7C59"
                    : `linear-gradient(135deg, ${FOREST_D} 0%, ${FOREST_L} 100%)`,
                  color: "#FFFFFF", borderRadius: 12, border: "none",
                  fontFamily: SANS, fontSize: 15, fontWeight: 700, letterSpacing: "0.03em",
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: saving ? "none" : "0 4px 16px rgba(27,67,50,0.32)",
                  transition: "all 0.2s",
                }}
              >
                {saving ? "Birabikwa..." : "Bika Raporo"}
              </button>

              {message && (
                <div style={{
                  marginTop: 12, padding: "12px 16px", borderRadius: 10,
                  background: message.ok ? "#F0FDF4" : "#FFF5F5",
                  border: `1px solid ${message.ok ? "#BBF7D0" : "#FECACA"}`,
                  color: message.ok ? "#15803D" : "#B91C1C",
                  fontSize: 14, fontWeight: 500, fontFamily: SANS,
                }}>
                  {message.ok ? "✓  " : "✗  "}{message.text}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* ── RIGHT PANEL ── */}
        <div style={{ display: "grid", gap: 20, alignContent: "start" }}>

          {/* Daily closing */}
          <Card>
            <div style={{ padding: "20px 22px 0" }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: TEXT }}>Daily Closing</h2>
                  <p style={{ color: MUTED, fontSize: 13, marginTop: 3 }}>
                    Incamake y&apos;umunsi wa nyuma winjijwe.
                  </p>
                </div>
                <button
                  onClick={loadRecords}
                  style={{
                    padding: "8px 16px", borderRadius: 9,
                    border: `1.5px solid ${BORDER}`, background: CARD_BG,
                    fontSize: 13, fontWeight: 600, color: "#4A4A4A",
                    cursor: "pointer", fontFamily: SANS,
                  }}
                >Refresh</button>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "24px 22px 22px", display: "grid", gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{
                    height: 64, borderRadius: 12,
                    background: "linear-gradient(90deg,#F0EBE3 25%,#FAF8F4 50%,#F0EBE3 75%)",
                    backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
                  }} />
                ))}
              </div>
            ) : latest ? (
              <div style={{ padding: "16px 22px 22px" }}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatTile label="Sales zose"       value={money(totalSales(latest))} />
                  <StatTile label="Payments zose"    value={money(totalPayments(latest))} />
                  <StatTile
                    label="Difference"
                    value={money(paymentMismatch)}
                    tone={paymentMismatch === 0 ? "good" : "bad"}
                  />
                  <StatTile label="Stock yakoreshejwe" value={money(stockUsed(latest))} />
                  <StatTile label="Expenses"           value={money(latest.expenses)} />
                  <StatTile label="Ibyaguzwe"          value={money(latest.purchases)} />
                </div>
              </div>
            ) : (
              <p style={{ padding: "28px 22px", color: MUTED, fontSize: 14 }}>
                Nta raporo irabikwa. Tangira winjize iya mbere.
              </p>
            )}
          </Card>

          {/* 7-day trend */}
          <Card>
            <div style={{ padding: "20px 22px 8px" }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: TEXT }}>
                Trend y&apos;Iminsi 7
              </h2>
            </div>
            <div style={{ padding: "8px 22px 22px", display: "grid", gap: 14 }}>
              {records.slice(0, 7).map((record) => {
                const value = totalSales(record);
                const pct   = Math.max((value / maxDailySale) * 100, 5);
                return (
                  <div key={record._id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: "#2C2C2C" }}>{record.date}</span>
                      <span style={{ color: FOREST, fontWeight: 700 }}>{money(value)}</span>
                    </div>
                    <div style={{ height: 8, background: "#EDE9E1", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`, borderRadius: 999,
                        background: `linear-gradient(90deg, ${FOREST_L}, #52B788)`,
                        transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                      }} />
                    </div>
                  </div>
                );
              })}
              {!records.length && (
                <p style={{ color: MUTED, fontSize: 14 }}>
                  Graph izagaragara nyuma yo kubika raporo.
                </p>
              )}
            </div>
          </Card>

          {/* Recent records table */}
          <Card style={{ overflow: "hidden" }}>
            <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid #F0EBE3` }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: TEXT }}>
                Raporo Ziheruka
              </h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", fontSize: 13, fontFamily: SANS }}>
                <thead>
                  <tr style={{ background: "#FAF8F4" }}>
                    {["Itariki", "Shift", "Sales", "Expenses", "Stock used"].map((h) => (
                      <th key={h} style={{
                        padding: "10px 14px", textAlign: "left",
                        fontWeight: 700, color: MUTED,
                        fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 10).map((record, i) => (
                    <tr key={record._id} style={{ background: i % 2 === 0 ? CARD_BG : "#FDFCFA" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: TEXT }}>{record.date}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 999,
                          fontSize: 11, fontWeight: 700,
                          ...shiftBadge(record.shift),
                        }}>
                          {shiftLabel[record.shift]}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: FOREST }}>{money(totalSales(record))}</td>
                      <td style={{ padding: "12px 14px", color: "#4A4A4A" }}>{money(record.expenses)}</td>
                      <td style={{ padding: "12px 14px", color: "#4A4A4A" }}>{money(stockUsed(record))}</td>
                    </tr>
                  ))}
                  {!records.length && !loading && (
                    <tr>
                      <td colSpan={5} style={{ padding: "24px 14px", color: MUTED, fontSize: 14 }}>
                        Nta raporo irabikwa.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        input:focus, select:focus, textarea:focus {
          border-color: ${FOREST_L} !important;
          box-shadow: 0 0 0 3px rgba(45,106,79,0.13) !important;
        }
        button[type="submit"]:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(27,67,50,0.42) !important;
        }
      `}</style>
    </div>
  );
}

// ── shared style objects ──────────────────────────────────────────────────────

const labelStyle: CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600,
  color: "#4A4A4A", marginBottom: 8, fontFamily: SANS,
};

const inputStyle: CSSProperties = {
  display: "block", width: "100%", height: 44,
  borderRadius: 10, border: "1.5px solid #DDD8D0",
  padding: "0 13px", fontSize: 14, color: TEXT,
  outline: "none", background: INPUT_BG,
  boxSizing: "border-box", fontFamily: SANS,
  transition: "border-color 0.15s, box-shadow 0.15s",
};

// ── sub-components ────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: CARD_BG, borderRadius: 20,
      border: `1px solid ${BORDER}`,
      boxShadow: "0 4px 28px rgba(27,67,50,0.08), 0 1px 4px rgba(27,67,50,0.04)",
      ...style,
    }}>
      {children}
    </div>
  );
}

function FormSection({ label, num, children }: { label: string; num: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          background: "#F0FDF4", border: "1px solid #BBF7D0",
          color: FOREST, fontSize: 10, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{num}</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: FOREST,
          letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: SANS,
        }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: "#F0EBE3" }} />
      </div>
      {children}
    </div>
  );
}

function Field({
  label, name, type = "number", defaultValue = 0,
}: {
  label: string;
  name: keyof RecordForm;
  type?: string;
  defaultValue?: string | number;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        name={name}
        type={type}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? 1 : undefined}
        defaultValue={defaultValue}
        style={inputStyle}
      />
    </div>
  );
}

function KpiCard({
  label, value, arrow, arrowColor, highlight, good,
}: {
  label: string; value: string; arrow: "up" | "down" | "dot";
  arrowColor: string; highlight?: boolean; good?: boolean;
}) {
  const arrowGlyph = arrow === "up" ? "▲" : arrow === "down" ? "▼" : "◆";
  return (
    <div style={{
      background: highlight ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
      border: highlight ? "1px solid rgba(244,197,66,0.28)" : "1px solid rgba(255,255,255,0.1)",
      borderRadius: 14, padding: "16px 18px", backdropFilter: "blur(8px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ color: "#A8D5B5", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", fontFamily: SANS }}>
          {label}
        </span>
        <span style={{ color: arrowColor, fontSize: 9 }}>{arrowGlyph}</span>
      </div>
      <p style={{
        fontSize: 19, fontWeight: 800, letterSpacing: "-0.025em", fontFamily: SANS,
        color: highlight ? (good ? GOLD_L : "#FC8181") : "#FFFFFF",
      }}>{value}</p>
    </div>
  );
}

function StatTile({
  label, value, tone = "neutral",
}: {
  label: string; value: string; tone?: "neutral" | "good" | "bad";
}) {
  const valueColor  = tone === "good" ? "#15803D" : tone === "bad" ? "#B91C1C" : TEXT;
  const bg          = tone === "good" ? "#F0FDF4"  : tone === "bad" ? "#FFF5F5"  : "#FAF8F4";
  const borderColor = tone === "good" ? "#BBF7D0"  : tone === "bad" ? "#FECACA"  : "#F0EBE3";

  return (
    <div style={{ background: bg, border: `1px solid ${borderColor}`, borderRadius: 12, padding: "12px 14px" }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: MUTED,
        letterSpacing: "0.09em", textTransform: "uppercase",
        marginBottom: 6, fontFamily: SANS,
      }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 800, color: valueColor, letterSpacing: "-0.02em", fontFamily: SANS }}>
        {value}
      </p>
    </div>
  );
}
