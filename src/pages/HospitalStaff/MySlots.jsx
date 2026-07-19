import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt, FaClock, FaUserAlt, FaCheckCircle,
  FaBan, FaHourglassHalf, FaSearch, FaLayerGroup,
  FaCalendarCheck, FaTimesCircle
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { useOutletContext } from "react-router-dom";

const BASE = "https://carexa-backend.vercel.app/staffapi";
const hdrs = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("StaffToken")}` } });
const COLOR = "#2563eb";
const PER_PAGE = 5;

const fmt = (d) => d
  ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

const dayLabel = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tom = new Date(today); tom.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tom.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-IN", { weekday: "short" });
};

const STATUS_CFG = {
  AVAILABLE: { label: "Available", bg: "#ecfdf5", color: "#059669", border: "#6ee7b7", icon: <FaCheckCircle size={10} />, dot: "#10b981" },
  BOOKED: { label: "Booked", bg: "#eff6ff", color: "#2563eb", border: "#93c5fd", icon: <FaUserAlt size={10} />, dot: "#2563eb" },
  CANCELLED: { label: "Cancelled", bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", icon: <FaTimesCircle size={10} />, dot: "#ef4444" },
  COMPLETED: { label: "Completed", bg: "#f5f3ff", color: "#7c3aed", border: "#c4b5fd", icon: <FaHourglassHalf size={10} />, dot: "#7c3aed" },
};

const Badge = ({ status }) => {
  const s = STATUS_CFG[status] || STATUS_CFG.AVAILABLE;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {s.icon} {s.label}
    </span>
  );
};

const groupByDate = (slots) => {
  const map = {};
  slots.forEach(s => {
    const key = s.appointment_date ? new Date(s.appointment_date).toDateString() : "Unknown";
    if (!map[key]) map[key] = [];
    map[key].push(s);
  });
  return Object.entries(map).sort(([a], [b]) => new Date(a) - new Date(b));
};

const Paginator = ({ page, totalPages, total, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
    .reduce((acc, n, idx, arr) => {
      if (idx > 0 && arr[idx - 1] !== n - 1) acc.push("…");
      acc.push(n); return acc;
    }, []);

  return (
    <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
      <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, margin: 0 }}>
        Showing {total === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total} slots
      </p>
      <div style={{ display: "flex", gap: 6 }}>
        <button disabled={page === 1} onClick={() => onPageChange(p => p - 1)}
          style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #e2e8f0", background: page === 1 ? "#f8fafc" : "#fff", color: page === 1 ? "#cbd5e1" : "#475569", cursor: page === 1 ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        {pages.map((item, idx) =>
          item === "…"
            ? <span key={`d${idx}`} style={{ width: 30, textAlign: "center", fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>…</span>
            : <button key={item} onClick={() => onPageChange(item)}
              style={{ width: 30, height: 30, borderRadius: 8, border: page === item ? `2px solid ${COLOR}` : "1.5px solid #e2e8f0", background: page === item ? COLOR : "#fff", color: page === item ? "#fff" : "#475569", cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito,sans-serif" }}>
              {item}
            </button>
        )}
        <button disabled={page === totalPages} onClick={() => onPageChange(p => p + 1)}
          style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #e2e8f0", background: page === totalPages ? "#f8fafc" : "#fff", color: page === totalPages ? "#cbd5e1" : "#475569", cursor: page === totalPages ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
      </div>
    </div>
  );
};

const MySlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [view, setView] = useState("list");
  const [page, setPage] = useState(1);
  const { globalSearch = "" } = useOutletContext() || {};

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE}/my-slots`, hdrs());
      setSlots(data.slots || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSlots(); }, []);
  useEffect(() => { setPage(1); }, [search, filter, view, globalSearch]);

  const counts = {
    ALL: slots.length,
    AVAILABLE: slots.filter(s => s.slot_status === "AVAILABLE").length,
    BOOKED: slots.filter(s => s.slot_status === "BOOKED").length,
    CANCELLED: slots.filter(s => s.slot_status === "CANCELLED").length,
    COMPLETED: slots.filter(s => s.slot_status === "COMPLETED").length,
  };

  const filtered = slots.filter(s => {
    const matchFilter = filter === "ALL" || s.slot_status === filter;
    const q = (globalSearch || search).trim().toLowerCase();
    if (!q) return matchFilter;
    return matchFilter && (
      fmt(s.appointment_date).toLowerCase().includes(q) ||
      (s.start_time || "").toLowerCase().includes(q) ||
      (s.end_time || "").toLowerCase().includes(q) ||
      (s.booked_by?.patient_name || "").toLowerCase().includes(q) ||
      (s.booked_by?.patient_email || "").toLowerCase().includes(q) ||
      (s.slot_status || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const groupedPaginated = groupByDate(paginated);

  const onFocus = e => (e.target.style.borderColor = COLOR);
  const onBlur = e => (e.target.style.borderColor = "#e2e8f0");

  const SlotCard = ({ slot }) => {
    const isPast = new Date(slot.appointment_date) < new Date(new Date().setHours(0, 0, 0, 0));
    return (
      <div style={{ background: "#fff", borderRadius: 14, border: `1.5px solid ${slot.slot_status === "AVAILABLE" && !isPast ? "#bbf7d0" : "#f1f5f9"}`, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", opacity: isPast && slot.slot_status === "AVAILABLE" ? 0.6 : 1, transition: "all 0.15s" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", borderRadius: 8, padding: "5px 10px" }}>
            <FaClock size={10} color="#64748b" />
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{slot.start_time}</span>
            {slot.end_time && <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>– {slot.end_time}</span>}
          </div>
          <Badge status={slot.slot_status} />
        </div>
        {slot.booked_by ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${COLOR},#1d4ed8)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {(slot.booked_by.patient_name || "P")[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#334155", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{slot.booked_by.patient_name}</p>
              {slot.booked_by.patient_phone && <p style={{ fontSize: 10, color: "#94a3b8", margin: 0, fontWeight: 500 }}>{slot.booked_by.patient_phone}</p>}
            </div>
          </div>
        ) : <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, margin: 0 }}>{slot.slot_status === "AVAILABLE" ? "Open for booking" : "—"}</p>}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
        .slot-row { transition:background 0.12s; }
        .slot-row:hover { background:#f8fafc; }
        .tab-btn { transition:all 0.15s; cursor:pointer; border:none; font-family:Nunito,sans-serif; }
        .view-btn { transition:all 0.15s; cursor:pointer; }
        .stat-card { transition:all 0.15s; cursor:pointer; }
        .stat-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.08); }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>My Appointment Slots</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>{slots.length} total · {counts.AVAILABLE} available · {counts.BOOKED} booked</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 3, gap: 2 }}>
            {[{ v: "list", label: "List" }, { v: "grouped", label: "By Date" }].map(({ v, label }) => (
              <button key={v} className="view-btn" onClick={() => setView(v)}
                style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: view === v ? "#fff" : "transparent", color: view === v ? "#0f172a" : "#64748b", border: "none", boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={fetchSlots}
            style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "1.5px solid #e2e8f0", color: "#64748b", borderRadius: 12, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito,sans-serif", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLOR; e.currentTarget.style.color = COLOR; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
            <MdRefresh size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { key: "ALL", label: "Total", icon: <FaLayerGroup size={16} />, accent: "#2563eb", bg: "#eff6ff" },
          { key: "AVAILABLE", label: "Available", icon: <FaCheckCircle size={16} />, accent: "#059669", bg: "#ecfdf5" },
          { key: "BOOKED", label: "Booked", icon: <FaCalendarCheck size={16} />, accent: "#2563eb", bg: "#eff6ff" },
          { key: "COMPLETED", label: "Completed", icon: <FaHourglassHalf size={16} />, accent: "#7c3aed", bg: "#f5f3ff" },
          { key: "CANCELLED", label: "Cancelled", icon: <FaBan size={16} />, accent: "#dc2626", bg: "#fef2f2" },
        ].map(({ key, label, icon, accent, bg }) => (
          <div key={key} className="stat-card" onClick={() => setFilter(key)}
            style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", border: filter === key ? `2px solid ${accent}` : "1.5px solid #f1f5f9", boxShadow: filter === key ? `0 0 0 3px ${accent}15` : "0 1px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, color: accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>{icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: 3 }}>{counts[key]}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #f1f5f9", padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <FaSearch size={12} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input placeholder="Search by date, time or patient name…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "Nunito,sans-serif", color: "#334155", background: "#f8fafc", outline: "none" }}
            onFocus={onFocus} onBlur={onBlur} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["ALL", "AVAILABLE", "BOOKED", "COMPLETED", "CANCELLED"].map(s => (
            <button key={s} className="tab-btn" onClick={() => setFilter(s)}
              style={{ padding: "7px 14px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: filter === s ? COLOR : "#f1f5f9", color: filter === s ? "#fff" : "#64748b", border: filter === s ? `1px solid ${COLOR}` : "1px solid #e2e8f0" }}>
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 220, background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9" }}>
          <div style={{ textAlign: "center" }}>
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading slots…</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220, background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", gap: 8 }}>
          <FaCalendarAlt size={36} style={{ color: "#e2e8f0" }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>No slots found</p>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>{search ? `No results for "${search}"` : "No slots match the selected filter"}</p>
        </div>

      ) : view === "grouped" ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "20px 20px 12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {groupedPaginated.map(([dateStr, daySlots]) => {
                const d = new Date(dateStr);
                const day = dayLabel(d);
                const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));
                return (
                  <div key={dateStr}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: isPast ? "#94a3b8" : `linear-gradient(135deg,${COLOR},#1d4ed8)`, color: "#fff", borderRadius: 12, padding: "6px 14px", flexShrink: 0, minWidth: 56, textAlign: "center" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.85 }}>{day}</span>
                        <span style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1 }}>{d.getDate()}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>{d.toLocaleDateString("en-IN", { weekday: "long", month: "long", year: "numeric" })}</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontWeight: 500 }}>
                          {daySlots.length} slot{daySlots.length !== 1 ? "s" : ""} · {daySlots.filter(s => s.slot_status === "AVAILABLE").length} available · {daySlots.filter(s => s.slot_status === "BOOKED").length} booked
                        </p>
                      </div>
                      <div style={{ flex: 1, height: 1, background: "#f1f5f9", marginLeft: 4 }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                      {daySlots.map(slot => <SlotCard key={slot._id} slot={slot} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <Paginator page={page} totalPages={totalPages} total={filtered.length} onPageChange={setPage} />
        </div>

      ) : (
        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 160px 120px 1fr", gap: 0, background: "#f8fafc", borderBottom: "1px solid #f1f5f9", padding: "10px 20px" }}>
            {["#", "Date", "Time", "Status", "Patient"].map(h => (
              <p key={h} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{h}</p>
            ))}
          </div>

          {paginated.map((slot, i) => {
            const d = new Date(slot.appointment_date);
            const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));
            const day = dayLabel(d);
            const rowIdx = (page - 1) * PER_PAGE + i + 1;
            return (
              <div key={slot._id} className="slot-row"
                style={{ display: "grid", gridTemplateColumns: "40px 1fr 160px 120px 1fr", padding: "14px 20px", borderBottom: "1px solid #f8fafc", alignItems: "center", gap: 0, opacity: isPast && slot.slot_status === "AVAILABLE" ? 0.55 : 1 }}>
                <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, margin: 0 }}>{rowIdx}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: isPast ? "#f1f5f9" : `linear-gradient(135deg,${COLOR}15,${COLOR}08)`, border: `1px solid ${isPast ? "#e2e8f0" : COLOR + "20"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: isPast ? "#94a3b8" : COLOR, lineHeight: 1 }}>{day}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: isPast ? "#94a3b8" : "#0f172a", lineHeight: 1.1 }}>{d.getDate()}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>{fmt(slot.appointment_date)}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontWeight: 500 }}>{d.toLocaleDateString("en-IN", { weekday: "long" })}</p>
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700, color: "#334155" }}>
                  <FaClock size={10} color="#94a3b8" />{slot.start_time}
                  {slot.end_time && <span style={{ color: "#94a3b8", fontWeight: 500 }}>– {slot.end_time}</span>}
                </span>
                <Badge status={slot.slot_status} />
                <div>
                  {slot.booked_by ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${COLOR},#1d4ed8)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                        {(slot.booked_by.patient_name || "P")[0].toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#334155", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{slot.booked_by.patient_name}</p>
                        {slot.booked_by.patient_phone && <p style={{ fontSize: 11, color: "#94a3b8", margin: "1px 0 0", fontWeight: 500 }}>{slot.booked_by.patient_phone}</p>}
                      </div>
                    </div>
                  ) : <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, fontStyle: "italic" }}>{slot.slot_status === "AVAILABLE" ? "Open for booking" : "—"}</span>}
                </div>
              </div>
            );
          })}

          <div style={{ padding: "10px 20px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 16 }}>
            {Object.entries(STATUS_CFG).map(([key, s]) => counts[key] > 0 && (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }} />
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{counts[key]} {s.label}</span>
              </div>
            ))}
          </div>
          <Paginator page={page} totalPages={totalPages} total={filtered.length} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default MySlots;