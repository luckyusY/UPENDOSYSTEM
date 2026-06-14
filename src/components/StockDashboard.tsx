"use client";

import { CSSProperties, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  STOCK_CATEGORIES,
  STOCK_UNITS,
  getStockCategory,
} from "@/lib/stockCategories";

type StockItem = {
  _id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  unitPrice: number;
  supplier: string;
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

function money(value: number) {
  const n = Math.round(value || 0);
  return "RWF " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function num(value: number) {
  return (Math.round((value || 0) * 100) / 100).toString();
}

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

export function StockDashboard() {
  const [items, setItems]       = useState<StockItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [message, setMessage]   = useState<{ text: string; ok: boolean } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch("/api/stock", { cache: "no-store" });
      const data = (await res.json()) as { items?: StockItem[] };
      setItems(data.items ?? []);
    } catch {
      setMessage({ text: "Ntibyashobotse gufata ububiko.", ok: false });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, it) => {
        acc.buyValue  += it.quantity * it.unitCost;
        acc.sellValue += it.quantity * it.unitPrice;
        if (it.quantity <= it.reorderLevel) acc.low += 1;
        return acc;
      },
      { buyValue: 0, sellValue: 0, low: 0 },
    );
  }, [items]);

  const lowStock = useMemo(
    () => items.filter((it) => it.quantity <= it.reorderLevel),
    [items],
  );

  const filtered = items.filter(
    (it) => filterCat === "all" || it.category === filterCat,
  );

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:         fd.get("name"),
          category:     fd.get("category"),
          unit:         fd.get("unit"),
          quantity:     Number(fd.get("quantity") || 0),
          reorderLevel: Number(fd.get("reorderLevel") || 0),
          unitCost:     Number(fd.get("unitCost") || 0),
          unitPrice:    Number(fd.get("unitPrice") || 0),
          supplier:     fd.get("supplier"),
          notes:        fd.get("notes"),
        }),
      });
      if (!res.ok) throw new Error();
      e.currentTarget.reset();
      setShowForm(false);
      setMessage({ text: "Ikintu cyongerewe neza.", ok: true });
    } catch {
      setMessage({ text: "Byatinze kwemezwa. Reba ku rutonde niba cyabitswe.", ok: false });
    } finally {
      setSaving(false);
      await load();
    }
  }

  async function deleteItem(id: string) {
    if (!window.confirm("Ugomba gusiba iki kintu n'amateka yacyo?")) return;
    try {
      await fetch(`/api/stock/${id}`, { method: "DELETE" });
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
          width: 280, height: 280, borderRadius: "50%",
          border: "44px solid rgba(255,255,255,0.04)", pointerEvents: "none",
        }} />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" style={{ position: "relative" }}>
          <div style={{ marginBottom: 22 }}>
            <p style={{
              color: "#A8D5B5", fontSize: 12, fontWeight: 600,
              letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8,
            }}>Ububiko</p>
            <h1 style={{
              fontFamily: SERIF, fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              fontWeight: 800, color: "#fff", lineHeight: 1.15,
            }}>
              Stock n&apos;{" "}
              <span style={{ color: GOLD_L }}>Ibicuruzwa</span>
            </h1>
            <p style={{ color: "#A8D5B5", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
              Genzura inzoga, ibinyobwa, ibiribwa: ingano isigaye, agaciro, n&apos;ibyaguzwe.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <HeroKpi label="Ibintu byose"            value={String(items.length)} />
            <HeroKpi label="Agaciro k'ububiko (cost)" value={money(totals.buyValue)} />
            <HeroKpi label="Agaciro mu kugurisha"      value={money(totals.sellValue)} color="#A7F3D0" />
            <HeroKpi label="Bigeze hasi (reorder)"     value={String(totals.low)} color={totals.low > 0 ? "#FCA5A5" : "#A7F3D0"} />
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Low-stock alert */}
        {!loading && lowStock.length > 0 && (
          <div style={{
            background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 16,
            padding: "16px 20px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <h3 style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: "#9A3412" }}>
                Ibigeze hasi — bigomba kongerwa ({lowStock.length})
              </h3>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {lowStock.map((it) => (
                <Link
                  key={it._id}
                  href={`/ububiko/${it._id}`}
                  style={{
                    textDecoration: "none",
                    background: "#fff", border: "1px solid #FED7AA", borderRadius: 999,
                    padding: "5px 13px", fontSize: 13, fontWeight: 600, color: "#9A3412",
                  }}
                >
                  {it.name} — {num(it.quantity)} {it.unit}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16, flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <FilterBtn active={filterCat === "all"} onClick={() => setFilterCat("all")}>Byose</FilterBtn>
            {STOCK_CATEGORIES.map((c) => (
              <FilterBtn key={c.slug} active={filterCat === c.slug} onClick={() => setFilterCat(c.slug)}>
                {c.icon} {c.label}
              </FilterBtn>
            ))}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "9px 20px", borderRadius: 10, fontWeight: 700, fontSize: 14,
              background: showForm ? "#F0EBE3" : `linear-gradient(135deg, ${FOREST_D}, ${FOREST_L})`,
              color: showForm ? FOREST : "#fff",
              border: "none", cursor: "pointer", fontFamily: SANS,
              boxShadow: showForm ? "none" : "0 4px 14px rgba(27,67,50,0.28)",
            }}
          >
            {showForm ? "Funga" : "+ Ongeramo ikintu"}
          </button>
        </div>

        {/* Add item form */}
        {showForm && (
          <div style={{
            background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`,
            boxShadow: "0 4px 24px rgba(27,67,50,0.07)", marginBottom: 20, overflow: "hidden",
          }}>
            <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #F0EBE3" }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: TEXT }}>
                Ongeramo Ikintu
              </h2>
              <p style={{ color: MUTED, fontSize: 13, marginTop: 3 }}>
                Urugero: Primus 72cl, Fanta, Inyama z&apos;inka...
              </p>
            </div>
            <form onSubmit={submit} style={{ padding: "16px 22px 22px" }}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label style={labelSt}>Izina ry&apos;ikintu *</label>
                  <input name="name" required placeholder="Nk'ubuntu: Primus 72cl" style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Ubwoko *</label>
                  <select name="category" required style={{ ...inputSt, appearance: "auto" } as CSSProperties}>
                    {STOCK_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label} — {c.english}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Igipimo (unit)</label>
                  <input name="unit" list="stock-units" defaultValue="icupa" style={inputSt} />
                  <datalist id="stock-units">
                    {STOCK_UNITS.map((u) => <option key={u} value={u} />)}
                  </datalist>
                </div>
                <div>
                  <label style={labelSt}>Ingano isanzwe ihari</label>
                  <input name="quantity" type="number" min="0" step="1" defaultValue="0" style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Aho bigera bigomba kongerwa</label>
                  <input name="reorderLevel" type="number" min="0" step="1" defaultValue="0" style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Uwabigurishije (supplier)</label>
                  <input name="supplier" placeholder="Nk'ubuntu: Bralirwa" style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Igiciro cyo kugura (RWF)</label>
                  <input name="unitCost" type="number" min="0" step="1" defaultValue="0" style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Igiciro cyo kugurisha (RWF)</label>
                  <input name="unitPrice" type="number" min="0" step="1" defaultValue="0" style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Inyandiko</label>
                  <input name="notes" placeholder="Ubundi bumwe..." style={inputSt} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button
                  type="submit" disabled={saving}
                  style={{
                    height: 46, padding: "0 28px", borderRadius: 10, border: "none",
                    background: saving ? "#4A7C59" : `linear-gradient(135deg, ${FOREST_D}, ${FOREST_L})`,
                    color: "#fff", fontFamily: SANS, fontSize: 14, fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: saving ? "none" : "0 4px 14px rgba(27,67,50,0.28)",
                  }}
                >
                  {saving ? "Birabikwa..." : "Bika ikintu"}
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
            color: message.ok ? "#15803D" : "#B91C1C", fontSize: 14, fontWeight: 500,
          }}>
            {message.ok ? "✓  " : "✗  "}{message.text}
          </div>
        )}

        {/* Items table */}
        <div style={{
          background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`,
          boxShadow: "0 4px 24px rgba(27,67,50,0.07)", overflow: "hidden",
        }}>
          {loading ? (
            <div style={{ padding: "28px 22px", display: "grid", gap: 12 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  height: 54, borderRadius: 12,
                  background: "linear-gradient(90deg,#F0EBE3 25%,#FAF8F4 50%,#F0EBE3 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
                }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "52px 22px", textAlign: "center", color: MUTED }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
              <p style={{ fontSize: 15, fontWeight: 500, color: TEXT, marginBottom: 6 }}>
                {items.length === 0 ? "Nta kintu kiri mu bubiko." : "Nta kintu kiri muri ubu bwoko."}
              </p>
              {items.length === 0 && (
                <p style={{ fontSize: 13 }}>Kanda &quot;+ Ongeramo ikintu&quot; gutangira.</p>
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", fontSize: 13, fontFamily: SANS }}>
                <thead>
                  <tr style={{ background: "#FAF8F4" }}>
                    {["Ikintu", "Ubwoko", "Ingano", "Igura", "Igurisha", "Agaciro", ""].map((h) => (
                      <th key={h} style={{
                        padding: "10px 14px", textAlign: "left",
                        fontWeight: 700, color: MUTED, fontSize: 11,
                        letterSpacing: "0.09em", textTransform: "uppercase",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((it, i) => {
                    const cat = getStockCategory(it.category);
                    const low = it.quantity <= it.reorderLevel;
                    return (
                      <tr key={it._id} style={{ background: i % 2 === 0 ? CARD_BG : "#FDFCFA", borderTop: "1px solid #F5F2EC" }}>
                        <td style={{ padding: "13px 14px" }}>
                          <div style={{ fontWeight: 700, color: TEXT, fontSize: 14 }}>{it.name}</div>
                          {it.supplier && <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{it.supplier}</div>}
                        </td>
                        <td style={{ padding: "13px 14px" }}>
                          {cat && (
                            <span style={{
                              padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                              background: cat.bg, color: cat.color,
                            }}>{cat.icon} {cat.label}</span>
                          )}
                        </td>
                        <td style={{ padding: "13px 14px" }}>
                          <span style={{
                            fontWeight: 700, fontSize: 14,
                            color: low ? "#C2410C" : TEXT,
                          }}>
                            {num(it.quantity)} {it.unit}
                          </span>
                          {low && (
                            <span style={{
                              marginLeft: 8, padding: "2px 8px", borderRadius: 999,
                              fontSize: 10, fontWeight: 700, background: "#FFEDD5", color: "#9A3412",
                            }}>HASI</span>
                          )}
                        </td>
                        <td style={{ padding: "13px 14px", color: "#4A4A4A" }}>{money(it.unitCost)}</td>
                        <td style={{ padding: "13px 14px", color: "#4A4A4A" }}>{money(it.unitPrice)}</td>
                        <td style={{ padding: "13px 14px", fontWeight: 700, color: FOREST }}>{money(it.quantity * it.unitCost)}</td>
                        <td style={{ padding: "13px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Link
                              href={`/ububiko/${it._id}`}
                              style={{
                                padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                                background: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0",
                                fontFamily: SANS, textDecoration: "none", whiteSpace: "nowrap",
                              }}
                            >Genzura</Link>
                            <button
                              onClick={() => void deleteItem(it._id)}
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

function FilterBtn({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
        border: "1.5px solid", borderColor: active ? FOREST : BORDER,
        background: active ? FOREST : CARD_BG, color: active ? "#fff" : MUTED,
        cursor: "pointer", fontFamily: SANS, whiteSpace: "nowrap",
      }}
    >{children}</button>
  );
}

function HeroKpi({
  label, value, color = "#fff",
}: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 14, padding: "14px 16px",
    }}>
      <p style={{ color: "#A8D5B5", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8, fontFamily: SANS }}>
        {label}
      </p>
      <p style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: "-0.02em", fontFamily: SANS }}>
        {value}
      </p>
    </div>
  );
}
