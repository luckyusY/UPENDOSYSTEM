"use client";

import { CSSProperties, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getStockCategory } from "@/lib/stockCategories";

type StockItem = {
  _id: string;
  name: string;
  category: string;
  unit: string;
  packSize: number;
  packUnit: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  unitPrice: number;
  supplier: string;
  notes: string;
};

type MovementType = "kwinjiza" | "gusohoka" | "byangiritse";

type Movement = {
  _id: string;
  date: string;
  type: MovementType;
  quantity: number;
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

const MV_META: Record<MovementType, { label: string; sign: -1 | 1; bg: string; color: string; hint: string }> = {
  kwinjiza:    { label: "Kwinjiza",    sign: 1,  bg: "#D1FAE5", color: "#065F46", hint: "Ibyaguzwe / byinjiye mu bubiko" },
  gusohoka:    { label: "Gusohoka",    sign: -1, bg: "#DBEAFE", color: "#1E40AF", hint: "Byagurishijwe / byakoreshejwe" },
  byangiritse: { label: "Byangiritse", sign: -1, bg: "#FEE2E2", color: "#991B1B", hint: "Byamenetse / byangiritse" },
};

function money(value: number) {
  const n = Math.round(value || 0);
  return "RWF " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function num(value: number) {
  return (Math.round((value || 0) * 100) / 100).toString();
}

// "3 agasanduku + 4 icupa" breakdown of a base-unit quantity.
function packBreakdown(qty: number, packSize: number, packUnit: string, unit: string) {
  if (packSize <= 1 || !packUnit) return `${num(qty)} ${unit}`;
  const packs = Math.floor(qty / packSize);
  const rest  = qty - packs * packSize;
  const parts: string[] = [];
  if (packs > 0) parts.push(`${packs} ${packUnit}`);
  if (rest > 0)  parts.push(`${rest} ${unit}`);
  return parts.length ? parts.join(" + ") : `0 ${packUnit}`;
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

export function StockItemDetail({ itemId }: { itemId: string }) {
  const [item, setItem]       = useState<StockItem | null>(null);
  const [moves, setMoves]     = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [mvType, setMvType]   = useState<MovementType>("kwinjiza");
  const [mvPacks, setMvPacks] = useState("");
  const [mvLoose, setMvLoose] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [iRes, mRes] = await Promise.all([
        fetch(`/api/stock/${itemId}`, { cache: "no-store" }),
        fetch(`/api/stock/${itemId}/movements`, { cache: "no-store" }),
      ]);
      const iData = (await iRes.json()) as { item?: StockItem };
      const mData = (await mRes.json()) as { movements?: Movement[] };
      setItem(iData.item ?? null);
      setMoves(mData.movements ?? []);
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
  }, [itemId]);

  const sums = useMemo(() => {
    const acc = { kwinjiza: 0, gusohoka: 0, byangiritse: 0 };
    moves.forEach((m) => { acc[m.type] += m.quantity; });
    return acc;
  }, [moves]);

  const cat = item ? getStockCategory(item.category) : undefined;
  const low = item ? item.quantity <= item.reorderLevel : false;

  async function addMove(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    const packSize = item?.packSize ?? 1;
    const hasPacks = packSize > 1 && !!item?.packUnit;
    const packs    = Number(mvPacks) || 0;
    const loose    = Number(mvLoose) || 0;
    const baseQty  = hasPacks ? packs * packSize + loose : loose;

    let reason = String(fd.get("reason") || "");
    if (hasPacks && packs > 0) {
      const tag = `${packs} ${item?.packUnit}${loose > 0 ? ` + ${loose} ${item?.unit}` : ""}`;
      reason = reason ? `${reason} · ${tag}` : tag;
    }

    if (baseQty <= 0) {
      setSaving(false);
      setMessage({ text: "Andika ingano irenze zeru.", ok: false });
      return;
    }

    try {
      const res = await fetch(`/api/stock/${itemId}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date:     fd.get("date"),
          type:     fd.get("type"),
          quantity: baseQty,
          reason,
        }),
      });
      if (!res.ok) throw new Error();
      e.currentTarget.reset();
      setMvPacks("");
      setMvLoose("");
      setMessage({ text: "Byanditswe neza.", ok: true });
    } catch {
      setMessage({ text: "Byatinze kwemezwa. Reba ku mateka niba byabitswe.", ok: false });
    } finally {
      setSaving(false);
      await load();
    }
  }

  async function deleteMove(id: string) {
    if (!window.confirm("Gusiba iyi nyandiko bizagarura ingano isigaye uko yari imeze. Komeza?")) return;
    try {
      await fetch(`/api/stock/${itemId}/movements/${id}`, { method: "DELETE" });
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" style={{ position: "relative" }}>
          <Link
            href="/ububiko"
            style={{ color: "#A8D5B5", fontSize: 13, fontWeight: 500, textDecoration: "none", marginBottom: 16, display: "inline-block" }}
          >← Subira ku bubiko</Link>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{
              width: 58, height: 58, borderRadius: 16, flexShrink: 0,
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
            }}>{cat?.icon ?? "📦"}</div>
            <div>
              <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
                {item?.name ?? "..."}
              </h1>
              <p style={{ color: "#A8D5B5", fontSize: 14, marginTop: 4 }}>
                {cat?.label}{item?.supplier ? `  ·  ${item.supplier}` : ""}
                {item && item.packSize > 1 && item.packUnit
                  ? `  ·  1 ${item.packUnit} = ${item.packSize} ${item.unit}`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* summary */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" style={{ marginBottom: 22 }}>
          <SummaryTile
            label="Ingano isigaye"
            value={item ? packBreakdown(item.quantity, item.packSize, item.packUnit, item.unit) : "—"}
            sub={item && item.packSize > 1 && item.packUnit ? `${num(item.quantity)} ${item.unit}` : undefined}
            tone={low ? "bad" : "net"}
            big
          />
          <SummaryTile label="Byinjiye (+)"   value={num(sums.kwinjiza)} tone="good" />
          <SummaryTile label="Byasohotse (−)" value={num(sums.gusohoka)} tone="neutral" />
          <SummaryTile label="Byangiritse (−)" value={num(sums.byangiritse)} tone="bad" />
          <SummaryTile label="Agaciro (cost)"  value={item ? money(item.quantity * item.unitCost) : "—"} tone="neutral" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.4fr]">

          {/* add movement */}
          <div style={{
            background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`,
            boxShadow: "0 4px 24px rgba(27,67,50,0.07)", overflow: "hidden", alignSelf: "start",
          }}>
            <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #F0EBE3" }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: TEXT }}>
                Hindura Ububiko
              </h2>
              <p style={{ color: MUTED, fontSize: 13, marginTop: 3 }}>
                Kwinjiza ibyaguzwe, gusohora ibyagurishijwe, cyangwa ibyangiritse.
              </p>
            </div>
            <form onSubmit={addMove} style={{ padding: "16px 22px 22px" }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Ubwoko</label>
                <div style={{ display: "grid", gap: 8 }}>
                  {(Object.keys(MV_META) as MovementType[]).map((t) => {
                    const meta = MV_META[t];
                    const active = mvType === t;
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
                        <input type="radio" name="type" value={t} checked={active} onChange={() => setMvType(t)} style={{ accentColor: meta.color }} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: active ? meta.color : TEXT }}>{meta.label}</div>
                          <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>{meta.hint}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Ingano</label>

                {item && item.packSize > 1 && item.packUnit ? (
                  <>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="number" min="0" step="1"
                          value={mvPacks}
                          onChange={(e) => setMvPacks(e.target.value)}
                          placeholder="0"
                          style={inputSt}
                        />
                        <p style={{ fontSize: 11, color: MUTED, marginTop: 4, textAlign: "center" }}>{item.packUnit}</p>
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          type="number" min="0" step="1"
                          value={mvLoose}
                          onChange={(e) => setMvLoose(e.target.value)}
                          placeholder="0"
                          style={inputSt}
                        />
                        <p style={{ fontSize: 11, color: MUTED, marginTop: 4, textAlign: "center" }}>{item.unit} (loose)</p>
                      </div>
                    </div>
                    {(Number(mvPacks) > 0 || Number(mvLoose) > 0) && (
                      <p style={{ fontSize: 12, color: FOREST_L, fontWeight: 600, marginTop: 6 }}>
                        = {(Number(mvPacks) || 0) * item.packSize + (Number(mvLoose) || 0)} {item.unit}
                        {" "}({Number(mvPacks) || 0} {item.packUnit} × {item.packSize} + {Number(mvLoose) || 0})
                      </p>
                    )}
                  </>
                ) : (
                  <input
                    type="number" min="0" step="1"
                    value={mvLoose}
                    onChange={(e) => setMvLoose(e.target.value)}
                    placeholder={`Ingano mu ${item?.unit ?? "bice"}`}
                    style={inputSt}
                  />
                )}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Itariki</label>
                <input name="date" type="date" defaultValue={TODAY} style={inputSt} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>Impamvu</label>
                <input name="reason" placeholder="Urugero: yaguze kuri Bralirwa..." style={inputSt} />
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

          {/* movement history */}
          <div style={{
            background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`,
            boxShadow: "0 4px 24px rgba(27,67,50,0.07)", overflow: "hidden",
          }}>
            <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #F0EBE3" }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: TEXT }}>
                Amateka y&apos;Ububiko
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
            ) : moves.length === 0 ? (
              <div style={{ padding: "44px 22px", textAlign: "center", color: MUTED }}>
                <p style={{ fontSize: 14 }}>Nta mateka arabaho. Tangira ukoreshe ifishi y&apos;ibumoso.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 460, borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#FAF8F4" }}>
                      {["Itariki", "Ubwoko", "Ingano", "Impamvu", ""].map((h) => (
                        <th key={h} style={{
                          padding: "10px 14px", textAlign: "left",
                          fontWeight: 700, color: MUTED, fontSize: 11,
                          letterSpacing: "0.08em", textTransform: "uppercase",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {moves.map((m, i) => {
                      const meta = MV_META[m.type];
                      return (
                        <tr key={m._id} style={{ background: i % 2 === 0 ? CARD_BG : "#FDFCFA", borderTop: "1px solid #F5F2EC" }}>
                          <td style={{ padding: "12px 14px", fontWeight: 600, color: TEXT }}>{m.date}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color }}>
                              {meta.label}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px", fontWeight: 700, color: meta.sign === 1 ? "#15803D" : "#B91C1C" }}>
                            {meta.sign === 1 ? "+" : "−"} {num(m.quantity)}
                          </td>
                          <td style={{ padding: "12px 14px", color: MUTED }}>{m.reason || "—"}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <button
                              onClick={() => void deleteMove(m._id)}
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
  label, value, sub, tone = "neutral", big,
}: {
  label: string; value: string; sub?: string;
  tone?: "neutral" | "good" | "bad" | "net"; big?: boolean;
}) {
  const map = {
    neutral: { bg: "#FAF8F4", bc: "#F0EBE3", color: TEXT },
    good:    { bg: "#F0FDF4", bc: "#BBF7D0", color: "#15803D" },
    bad:     { bg: "#FFF5F5", bc: "#FECACA", color: "#B91C1C" },
    net:     { bg: FOREST,    bc: FOREST,    color: "#fff" },
  }[tone];
  return (
    <div style={{ background: map.bg, border: `1px solid ${map.bc}`, borderRadius: 12, padding: big ? "14px 16px" : "12px 14px" }}>
      <p style={{
        fontSize: 11, fontWeight: 700,
        color: tone === "net" ? "rgba(255,255,255,0.7)" : MUTED,
        letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6, fontFamily: SANS,
      }}>{label}</p>
      <p style={{ fontSize: big ? 20 : 17, fontWeight: 800, color: map.color, letterSpacing: "-0.02em", fontFamily: SANS }}>
        {value}
      </p>
      {sub && (
        <p style={{
          fontSize: 11, fontWeight: 500, marginTop: 3, fontFamily: SANS,
          color: tone === "net" ? "rgba(255,255,255,0.6)" : MUTED,
        }}>{sub}</p>
      )}
    </div>
  );
}
