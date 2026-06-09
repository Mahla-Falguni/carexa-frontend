import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    FaRupeeSign, FaCheckCircle, FaSearch, FaReceipt,
    FaMoneyBillWave, FaQrcode, FaCreditCard,
    FaCalendarAlt, FaUserMd, FaChartLine,
    FaArrowUp, FaFilter, FaUsers
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import PaymentReceiptModal from "../HospitalStaff/PaymentReceiptModal";

const BASE = "http://localhost:5000/hospitalapi";
const hdrs = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("HospitalToken")}` } });

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

const METHOD_CFG = {
    CASH: { label: "Cash", icon: <FaMoneyBillWave size={12} />, color: "#059669", bg: "#ecfdf5", border: "#6ee7b7" },
    UPI: { label: "UPI", icon: <FaQrcode size={12} />, color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
    CARD: { label: "Card", icon: <FaCreditCard size={12} />, color: "#0891b2", bg: "#ecfeff", border: "#67e8f9" },
    OTHER: { label: "Other", icon: <FaRupeeSign size={12} />, color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
};

const PER_PAGE = 8;

export default function HospitalAdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [methodFilter, setMethodFilter] = useState("ALL");
    const [doctorFilter, setDoctorFilter] = useState("ALL");
    const [receipt, setReceipt] = useState(null);
    const [page, setPage] = useState(1);
    const [stats, setStats] = useState({ total: 0, totalRevenue: 0, todayRevenue: 0 });

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${BASE}/payments`, hdrs());
            setPayments(data.payments || []);
            setStats({ total: data.total, totalRevenue: data.totalRevenue, todayRevenue: data.todayRevenue });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Failed to load payments", text: err?.response?.data?.message });
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchPayments(); }, []);
    useEffect(() => { setPage(1); }, [search, methodFilter, doctorFilter]);

    // unique doctors for filter dropdown
    const doctors = [...new Map(payments.map(p => [p.doctor_id?._id, p.doctor_id]).filter(([k]) => k)).values()];

    const cashCount = payments.filter(p => p.payment_method === "CASH").length;
    const upiCount = payments.filter(p => p.payment_method === "UPI").length;

    const filtered = payments.filter(p => {
        const mOk = methodFilter === "ALL" || p.payment_method === methodFilter;
        const dOk = doctorFilter === "ALL" || p.doctor_id?._id === doctorFilter;
        const q = search.toLowerCase();
        return mOk && dOk && (!q ||
            (p.patient_id?.patient_name || "").toLowerCase().includes(q) ||
            (p.patient_id?.patient_phone || "").includes(q) ||
            (p.doctor_id?.name || "").toLowerCase().includes(q) ||
            (p.transaction_id || "").toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const inp = (focused) => ({
        background: "#f8fafc", border: `1.5px solid ${focused ? "#2563eb" : "#e2e8f0"}`,
        borderRadius: 12, padding: "9px 14px", fontSize: 13, outline: "none",
        fontFamily: "'Nunito',sans-serif", color: "#334155", transition: "border-color 0.15s"
    });

    return (
        <div style={{ fontFamily: "'Nunito',sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Lora:wght@600;700&display=swap');
                .hap-root * { font-family:'Nunito',sans-serif; box-sizing:border-box; }
                @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                .fade-up { animation:fadeUp 0.22s ease forwards; }
                .stat-g { transition:all 0.18s; }
                .stat-g:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,0.12)!important; }
                .pay-row { transition:background 0.1s; border-left:3px solid transparent; }
                .pay-row:hover { background:#f8fafc!important; border-left-color:#2563eb; }
                .rcpt-btn { transition:all 0.15s; }
                .rcpt-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(37,99,235,0.25); }
                .pill { transition:all 0.12s; cursor:pointer; border:none; font-family:'Nunito',sans-serif; }
                .pg-btn { transition:all 0.12s; }
                .pg-btn:hover:not(:disabled) { border-color:#2563eb!important; color:#2563eb!important; }
            `}</style>

            <div className="hap-root fade-up" style={{ maxWidth: 1260, margin: "0 auto", paddingBottom: 40 }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Hospital Admin · Finance</p>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#0f172a", margin: 0, fontFamily: "'Lora',serif" }}>Payment Records</h1>
                        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0", fontWeight: 500 }}>
                            {stats.total} transactions · ₹{(stats.totalRevenue || 0).toLocaleString("en-IN")} total revenue
                        </p>
                    </div>
                    <button onClick={fetchPayments}
                        style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #e2e8f0", color: "#475569", borderRadius: 14, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}>
                        <MdRefresh size={15} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                {/* Stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
                    {[
                        { label: "Total Revenue", value: `₹${(stats.totalRevenue || 0).toLocaleString("en-IN")}`, sub: `${stats.total} payments`, bg: "linear-gradient(135deg,#0f2242,#2563eb)", icon: <FaChartLine size={20} color="#fff" /> },
                        { label: "Today's Collection", value: `₹${(stats.todayRevenue || 0).toLocaleString("en-IN")}`, sub: "collected today", bg: "linear-gradient(135deg,#064e3b,#059669)", icon: <FaArrowUp size={20} color="#fff" /> },
                        { label: "Cash Payments", value: cashCount, sub: "transactions", bg: "linear-gradient(135deg,#78350f,#d97706)", icon: <FaMoneyBillWave size={20} color="#fff" /> },
                        { label: "UPI / Digital", value: upiCount, sub: "transactions", bg: "linear-gradient(135deg,#3b0764,#7c3aed)", icon: <FaQrcode size={20} color="#fff" /> },
                    ].map((s, i) => (
                        <div key={i} className="stat-g" style={{ borderRadius: 18, padding: "20px 22px", background: s.bg, boxShadow: "0 4px 18px rgba(0,0,0,0.14)", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", right: 18, top: 18, width: 44, height: 44, borderRadius: 13, background: "rgba(255,255,255,0.13)", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                            <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>{s.label}</p>
                            <p style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: "0 0 2px", lineHeight: 1 }}>{s.value}</p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", margin: 0 }}>{s.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                    {/* Search */}
                    <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                        <FaSearch size={12} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input placeholder="Search patient, doctor, txn ID…" value={search} onChange={e => setSearch(e.target.value)}
                            style={{ ...inp(false), paddingLeft: 36, width: "100%" }}
                            onFocus={e => e.target.style.borderColor = "#2563eb"}
                            onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                    </div>

                    {/* Doctor filter */}
                    <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)}
                        style={{ ...inp(false), paddingRight: 28, cursor: "pointer" }}>
                        <option value="ALL">All Doctors</option>
                        {doctors.map(d => d && <option key={d._id} value={d._id}> {d.name}</option>)}
                    </select>

                    {/* Method pills */}
                    <div style={{ display: "flex", gap: 6 }}>
                        {[{ k: "ALL", l: "All", c: "#2563eb" }, { k: "CASH", l: "Cash", c: "#059669" }, { k: "UPI", l: "UPI", c: "#7c3aed" }, { k: "CARD", l: "Card", c: "#0891b2" }, { k: "OTHER", l: "Other", c: "#d97706" }].map(f => (
                            <button key={f.k} className="pill" onClick={() => setMethodFilter(f.k)}
                                style={{ padding: "7px 14px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: methodFilter === f.k ? f.c : "#f1f5f9", color: methodFilter === f.k ? "#fff" : "#64748b", boxShadow: methodFilter === f.k ? `0 3px 10px ${f.c}40` : "none" }}>
                                {f.l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, background: "#fff", borderRadius: 20, border: "1.5px solid #f1f5f9", gap: 14 }}>
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading payments…</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 240, background: "#fff", borderRadius: 20, border: "1.5px solid #f1f5f9", gap: 10 }}>
                        <FaReceipt size={40} style={{ color: "#e2e8f0" }} />
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#64748b", margin: 0 }}>No payments found</p>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{search ? `No results for "${search}"` : "No payments recorded yet"}</p>
                    </div>
                ) : (
                    <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #f1f5f9", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                        {/* Head */}
                        <div style={{ display: "grid", gridTemplateColumns: "36px 1.6fr 1.3fr 1.2fr 100px 100px 120px 90px 110px", padding: "11px 20px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                            {["#", "Patient", "Doctor", "Recorded By", "Date", "Time", "Amount", "Method", "Receipt"].map(h => (
                                <p key={h} style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{h}</p>
                            ))}
                        </div>

                        {paginated.map((p, i) => {
                            const mCfg = METHOD_CFG[p.payment_method] || METHOD_CFG.OTHER;
                            return (
                                <div key={p._id} className="pay-row"
                                    style={{ display: "grid", gridTemplateColumns: "36px 1.6fr 1.3fr 1.2fr 100px 100px 120px 90px 110px", padding: "13px 20px", borderBottom: "1px solid #f9fafb", alignItems: "center" }}>

                                    <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, margin: 0 }}>{(page - 1) * PER_PAGE + i + 1}</p>

                                    {/* Patient */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#1e3a5f,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                                            {(p.patient_id?.patient_name || "P")[0].toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.patient_id?.patient_name || "—"}</p>
                                            <p style={{ fontSize: 10, color: "#94a3b8", margin: "1px 0 0" }}>{p.patient_id?.patient_phone || ""}</p>
                                        </div>
                                    </div>

                                    {/* Doctor */}
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: "#334155", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}> {p.doctor_id?.name || "—"}</p>
                                        <p style={{ fontSize: 10, color: "#94a3b8", margin: "1px 0 0" }}>{p.doctor_id?.specialization || ""}</p>
                                    </div>

                                    {/* Recorded by */}
                                    <p style={{ fontSize: 12, color: "#475569", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.recorded_by?.name || "—"}</p>

                                    {/* Date */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#475569", fontWeight: 600 }}>
                                        <FaCalendarAlt size={9} color="#94a3b8" />{fmt(p.payment_date)}
                                    </div>

                                    {/* Time */}
                                    <span style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: "#334155" }}>
                                        {fmtTime(p.payment_date)}
                                    </span>

                                    {/* Amount */}
                                    <p style={{ fontSize: 15, fontWeight: 900, color: "#059669", margin: 0 }}>₹{Number(p.amount || 0).toLocaleString("en-IN")}</p>

                                    {/* Method */}
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 7, fontSize: 10, fontWeight: 700, background: mCfg.bg, color: mCfg.color, border: `1px solid ${mCfg.border}` }}>
                                        {mCfg.icon} {mCfg.label}
                                    </span>

                                    {/* Receipt */}
                                    <button className="rcpt-btn" onClick={() => setReceipt(p)}
                                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 9, background: "linear-gradient(135deg,#0f2242,#2563eb)", border: "none", color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                                        <FaReceipt size={9} /> Receipt
                                    </button>
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                            <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, margin: 0 }}>
                                Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                            </p>
                            {totalPages > 1 && (
                                <div style={{ display: "flex", gap: 5 }}>
                                    <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}
                                        style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #e2e8f0", background: page === 1 ? "#f8fafc" : "#fff", color: page === 1 ? "#cbd5e1" : "#475569", cursor: page === 1 ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                                        .reduce((acc, n, idx, arr) => { if (idx > 0 && arr[idx - 1] !== n - 1) acc.push("…"); acc.push(n); return acc; }, [])
                                        .map((item, idx) => item === "…" ? (
                                            <span key={`d${idx}`} style={{ width: 30, textAlign: "center", fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>…</span>
                                        ) : (
                                            <button key={item} className="pg-btn" onClick={() => setPage(item)}
                                                style={{ width: 30, height: 30, borderRadius: 8, border: page === item ? "2px solid #2563eb" : "1.5px solid #e2e8f0", background: page === item ? "#2563eb" : "#fff", color: page === item ? "#fff" : "#475569", cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {item}
                                            </button>
                                        ))}
                                    <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                                        style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #e2e8f0", background: page === totalPages ? "#f8fafc" : "#fff", color: page === totalPages ? "#cbd5e1" : "#475569", cursor: page === totalPages ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {receipt && <PaymentReceiptModal payment={receipt} onClose={() => setReceipt(null)} />}
        </div>
    );
}