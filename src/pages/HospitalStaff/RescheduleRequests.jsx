import { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";
import {
    FaExchangeAlt, FaCheckCircle, FaTimesCircle, FaHourglassHalf,
    FaCalendarAlt, FaClock, FaSearch, FaEye,
    FaTimes, FaPhone, FaEnvelope, FaSyncAlt,
    FaChevronDown, FaChevronUp, FaUserAlt
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

const BASE = "https://carexa-backend.vercel.app/staffapi";
const hdrs = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("StaffToken")}` } });
const COLOR = "#2563eb";

const fmt = (d) => d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

const statusCfg = {
    PENDING: { label: "Pending", bg: "#fef3c7", color: "#b45309", border: "#fde68a", icon: <FaHourglassHalf size={10} /> },
    APPROVED: { label: "Approved", bg: "#d1fae5", color: "#065f46", border: "#6ee7b7", icon: <FaCheckCircle size={10} /> },
    REJECTED: { label: "Rejected", bg: "#fee2e2", color: "#b91c1c", border: "#fca5a5", icon: <FaTimesCircle size={10} /> },
};

const StatusBadge = ({ status }) => {
    const s = statusCfg[status] || statusCfg.PENDING;
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full border"
            style={{ background: s.bg, color: s.color, borderColor: s.border }}>
            {s.icon} {s.label}
        </span>
    );
};

// ── Detail Modal ──────────────────────────────────────────────────────────────
const DetailModal = ({ req, onClose, onApprove, onReject, loading }) => {
    if (!req) return null;
    const s = statusCfg[req.status] || statusCfg.PENDING;
    const appt = req.appointment_id;
    const pat = appt?.patient_id || req.requested_by;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(8px)", background: "rgba(15,23,42,0.65)" }}
            onClick={onClose}>
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ background: `linear-gradient(135deg, ${COLOR}, #1e40af)` }}
                    className="px-6 py-5 flex items-start justify-between">
                    <div>
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
                            Reschedule Request
                        </p>
                        <h2 className="text-white font-bold text-lg">{pat?.patient_name || "Patient"}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            {pat?.patient_phone && (
                                <span className="text-blue-200 text-xs flex items-center gap-1">
                                    <FaPhone size={9} /> {pat.patient_phone}
                                </span>
                            )}
                            {pat?.patient_email && (
                                <span className="text-blue-200 text-xs flex items-center gap-1">
                                    <FaEnvelope size={9} /> {pat.patient_email}
                                </span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="text-white/60 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition ml-3">
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Status strip */}
                <div className="px-6 py-2.5 flex items-center justify-between border-b border-slate-100"
                    style={{ background: s.bg }}>
                    <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: s.color }}>
                        {s.icon} Status: {s.label}
                    </span>
                    <span className="text-xs text-slate-400">Requested: {fmt(req.createdAt)}</span>
                </div>

                <div className="p-6 space-y-4">
                    {/* Current Appointment */}
                    <div className="rounded-xl border border-slate-100 overflow-hidden">
                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Current Appointment</p>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3">
                            {[
                                { label: "Date", value: fmt(appt?.appointment_date), icon: <FaCalendarAlt size={10} />, color: COLOR },
                                { label: "Time", value: `${appt?.start_time || "—"}${appt?.end_time ? ` – ${appt.end_time}` : ""}`, icon: <FaClock size={10} />, color: "#7c3aed" },
                                { label: "Patient", value: pat?.patient_name || "—", icon: <FaUserAlt size={10} />, color: "#059669" },
                                { label: "Status", value: appt?.appointment_status || "—", icon: null, color: "#d97706" },
                            ].map(({ label, value, icon, color }) => (
                                <div key={label} className="p-3 rounded-xl"
                                    style={{ background: "#f8fafc", borderLeft: `3px solid ${color}30` }}>
                                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1 flex items-center gap-1" style={{ color }}>
                                        {icon} {label}
                                    </p>
                                    <p className="text-slate-700 text-xs font-semibold">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Patient's Preferred Slot */}
                    {(req.preferred_date || req.preferred_start_time) && (
                        <div className="rounded-xl border border-blue-100 overflow-hidden">
                            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                                <FaSyncAlt size={10} className="text-blue-500" />
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Patient's Preferred Slot</p>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-blue-50" style={{ borderLeft: "3px solid #2563eb40" }}>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                        <FaCalendarAlt size={10} /> Preferred Date
                                    </p>
                                    <p className="text-slate-700 text-xs font-semibold">{req.preferred_date || "—"}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-blue-50" style={{ borderLeft: "3px solid #7c3aed40" }}>
                                    <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                        <FaClock size={10} /> Preferred Time
                                    </p>
                                    <p className="text-slate-700 text-xs font-semibold">
                                        {req.preferred_start_time || "—"}
                                        {req.preferred_end_time ? ` – ${req.preferred_end_time}` : ""}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reason */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Reason</p>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {req.reason || <span className="italic text-slate-400">No reason provided</span>}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                {req.status === "PENDING" ? (
                    <div className="px-6 pb-6 flex gap-3">
                        <button onClick={() => onReject(req._id)} disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>
                            <FaTimesCircle size={13} /> Reject
                        </button>
                        <button onClick={() => onApprove(req._id)} disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #059669, #047857)" }}>
                            <FaCheckCircle size={13} /> Approve
                        </button>
                    </div>
                ) : (
                    <div className="px-6 pb-6">
                        <button onClick={onClose}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-bold transition">
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const RescheduleRequests = () => {
    const { globalSearch = "" } = useOutletContext() || {};
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [expandedId, setExpandedId] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${BASE}/my-reschedule-requests`, hdrs());
            setRequests(data.rescheduleRequests || []);
        } catch (err) {
            console.error("Fetch error:", err?.response?.data || err.message);
            Swal.fire({
                icon: "error",
                title: "Failed to load requests",
                text: err?.response?.data?.message || "Server error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await axios.patch(`${BASE}/reschedule-request/${id}/approved`, {}, hdrs());
            Swal.fire({ icon: "success", title: "Request Approved!", timer: 1500, showConfirmButton: false });
            setShowModal(false);
            fetchRequests();
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed to approve", "error");
        } finally { setActionLoading(null); }
    };

    const handleReject = async (id) => {
        const result = await Swal.fire({
            title: "Reject Request?",
            text: "The patient's reschedule request will be rejected.",
            icon: "warning", showCancelButton: true,
            confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Reject"
        });
        if (!result.isConfirmed) return;
        setActionLoading(id);
        try {
            await axios.patch(`${BASE}/reschedule-request/${id}/rejected`, {}, hdrs());
            Swal.fire({ icon: "success", title: "Request Rejected", timer: 1500, showConfirmButton: false });
            setShowModal(false);
            fetchRequests();
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed to reject", "error");
        } finally { setActionLoading(null); }
    };

    const counts = {
        ALL: requests.length,
        PENDING: requests.filter(r => r.status === "PENDING").length,
        APPROVED: requests.filter(r => r.status === "APPROVED").length,
        REJECTED: requests.filter(r => r.status === "REJECTED").length,
    };

    const filtered = requests.filter(r => {
        const matchFilter = filter === "ALL" || r.status === filter;
        const q = (globalSearch || search).trim().toLowerCase();
        const pat = r.appointment_id?.patient_id || r.requested_by;
        const matchSearch = !q
            || (pat?.patient_name || "").toLowerCase().includes(q)
            || (pat?.patient_email || "").toLowerCase().includes(q)
            || (r.reason || "").toLowerCase().includes(q)
            || (r.status || "").toLowerCase().includes(q);
        return matchFilter && matchSearch;
    });

    const onFocus = e => (e.target.style.borderColor = COLOR);
    const onBlur = e => (e.target.style.borderColor = "#e2e8f0");

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                .rr-card { transition: all 0.15s ease; border-left: 3px solid transparent; }
                .rr-card:hover { transform: translateX(2px); border-left-color: ${COLOR}; background: #f8fafc; }
                .rr-card.pending:hover { border-left-color: #f59e0b; }
                .tab-btn { transition: all 0.15s; cursor: pointer; border: none; }
                .action-btn { transition: all 0.15s; }
                .action-btn:hover { transform: translateY(-1px); }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                        My Reschedule Requests
                    </h1>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>
                        Patients requesting to reschedule your appointments
                        {counts.PENDING > 0 && (
                            <span style={{ marginLeft: 10, background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                                {counts.PENDING} pending
                            </span>
                        )}
                    </p>
                </div>
                <button onClick={fetchRequests}
                    style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "1.5px solid #e2e8f0", color: "#64748b", borderRadius: 12, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLOR; e.currentTarget.style.color = COLOR; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
                    <MdRefresh size={14} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
                {[
                    { key: "ALL", label: "Total", icon: <FaExchangeAlt size={16} />, accent: "#2563eb", bg: "#eff6ff" },
                    { key: "PENDING", label: "Pending", icon: <FaHourglassHalf size={16} />, accent: "#d97706", bg: "#fffbeb" },
                    { key: "APPROVED", label: "Approved", icon: <FaCheckCircle size={16} />, accent: "#059669", bg: "#ecfdf5" },
                    { key: "REJECTED", label: "Rejected", icon: <FaTimesCircle size={16} />, accent: "#dc2626", bg: "#fef2f2" },
                ].map(({ key, label, icon, accent, bg }) => (
                    <div key={key} onClick={() => setFilter(key)}
                        style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", cursor: "pointer", border: filter === key ? `2px solid ${accent}` : "1.5px solid #f1f5f9", boxShadow: filter === key ? `0 0 0 3px ${accent}15` : "0 1px 6px rgba(0,0,0,0.05)", transition: "all 0.15s" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, color: accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                            {icon}
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: 3 }}>{counts[key]}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Search + Filter */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #f1f5f9", padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <FaSearch size={12} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input placeholder="Search by patient name, email or reason…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "Nunito, sans-serif", color: "#334155", background: "#f8fafc", outline: "none" }}
                        onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {["ALL", "PENDING", "APPROVED", "REJECTED"].map(s => (
                        <button key={s} onClick={() => setFilter(s)} className="tab-btn"
                            style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, fontFamily: "Nunito, sans-serif", background: filter === s ? COLOR : "#f1f5f9", color: filter === s ? "#fff" : "#64748b", border: filter === s ? `1px solid ${COLOR}` : "1px solid #e2e8f0" }}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Request List */}
            {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9" }}>
                    <div style={{ textAlign: "center" }}>
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading requests…</p>
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", gap: 8 }}>
                    <FaExchangeAlt size={36} style={{ color: "#e2e8f0" }} />
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>No requests found</p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>
                        {search ? `No results for "${search}"` : "No reschedule requests for your appointments"}
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filtered.map((req) => {
                        const appt = req.appointment_id;
                        const pat = appt?.patient_id || req.requested_by;
                        const isExpanded = expandedId === req._id;

                        return (
                            <div key={req._id} className={`rr-card ${req.status === "PENDING" ? "pending" : ""}`}
                                style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>

                                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>

                                    {/* Patient avatar */}
                                    <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${COLOR}, #1d4ed8)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff" }}>
                                        {(pat?.patient_name || "P")[0].toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                                            <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                                                {pat?.patient_name || "Patient"}
                                            </p>
                                            <StatusBadge status={req.status} />
                                        </div>
                                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                            {appt?.appointment_date && (
                                                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                                                    <FaCalendarAlt size={9} /> {fmt(appt.appointment_date)}
                                                </span>
                                            )}
                                            {appt?.start_time && (
                                                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                                                    <FaClock size={9} /> {appt.start_time}
                                                </span>
                                            )}
                                            {pat?.patient_phone && (
                                                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                                                    <FaPhone size={9} /> {pat.patient_phone}
                                                </span>
                                            )}
                                            {req.preferred_date && (
                                                <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, background: "#eff6ff", padding: "2px 8px", borderRadius: 6 }}>
                                                    <FaSyncAlt size={9} /> Prefers: {req.preferred_date}{req.preferred_start_time ? ` at ${req.preferred_start_time}` : ""}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                        <button onClick={() => { setSelected(req); setShowModal(true); }} className="action-btn"
                                            style={{ width: 34, height: 34, borderRadius: 10, background: "#eff6ff", border: "1px solid #bfdbfe", color: COLOR, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                            <FaEye size={13} />
                                        </button>

                                        {req.status === "PENDING" && (
                                            <>
                                                <button onClick={() => handleApprove(req._id)} disabled={actionLoading === req._id} className="action-btn"
                                                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, background: "linear-gradient(135deg,#059669,#047857)", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                                                    <FaCheckCircle size={11} /> Approve
                                                </button>
                                                <button onClick={() => handleReject(req._id)} disabled={actionLoading === req._id} className="action-btn"
                                                    style={{ width: 34, height: 34, borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                                    <FaTimesCircle size={13} />
                                                </button>
                                            </>
                                        )}

                                        <button onClick={() => setExpandedId(isExpanded ? null : req._id)}
                                            style={{ width: 30, height: 30, borderRadius: 8, background: "#f1f5f9", border: "none", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                            {isExpanded ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div style={{ padding: "0 20px 16px", borderTop: "1px solid #f8fafc" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
                                            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 14px", borderLeft: "3px solid #2563eb30" }}>
                                                <p style={{ fontSize: 10, fontWeight: 700, color: COLOR, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Current Slot</p>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{fmt(appt?.appointment_date)}</p>
                                                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                                                    {appt?.start_time || "—"}{appt?.end_time ? ` – ${appt.end_time}` : ""}
                                                </p>
                                            </div>
                                            <div style={{ background: "#eff6ff", borderRadius: 12, padding: "12px 14px", borderLeft: "3px solid #2563eb60" }}>
                                                <p style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                                                    <FaSyncAlt size={9} /> Patient Prefers
                                                </p>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{req.preferred_date || "No preference"}</p>
                                                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                                                    {req.preferred_start_time || "—"}{req.preferred_end_time ? ` – ${req.preferred_end_time}` : ""}
                                                </p>
                                            </div>
                                            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 14px", borderLeft: "3px solid #94a3b830" }}>
                                                <p style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Reason</p>
                                                <p style={{ fontSize: 11, color: "#475569", lineHeight: 1.5 }}>
                                                    {req.reason || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Not provided</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail Modal */}
            {showModal && selected && (
                <DetailModal
                    req={selected}
                    onClose={() => { setShowModal(false); setSelected(null); }}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    loading={actionLoading !== null}
                />
            )}
        </div>
    );
};

export default RescheduleRequests;