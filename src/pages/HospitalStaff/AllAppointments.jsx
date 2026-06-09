import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useOutletContext } from "react-router-dom";
import {
    FaCalendarAlt, FaClock, FaUserAlt, FaSearch,
    FaCheckCircle, FaTimesCircle, FaHourglassHalf,
    FaSyncAlt, FaBan, FaEye
} from "react-icons/fa";

const PER_PAGE = 5;

const statusConfig = {
    PENDING: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: <FaHourglassHalf size={10} /> },
    SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <FaCalendarAlt size={10} /> },
    COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <FaCheckCircle size={10} /> },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-600 border-red-200", icon: <FaBan size={10} /> },
    RESCHEDULED: { label: "Rescheduled", color: "bg-violet-100 text-violet-700 border-violet-200", icon: <FaSyncAlt size={10} /> },
};

const COLOR = "#2563eb";

const Paginator = ({ page, totalPages, total, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
        .reduce((acc, n, idx, arr) => {
            if (idx > 0 && arr[idx - 1] !== n - 1) acc.push("…");
            acc.push(n); return acc;
        }, []);

    return (
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-100 flex-wrap gap-2">
            <p className="text-xs text-slate-400 font-medium">
                Showing <span className="text-slate-600 font-semibold">{total === 0 ? 0 : (page - 1) * PER_PAGE + 1}</span>–<span className="text-slate-600 font-semibold">{Math.min(page * PER_PAGE, total)}</span> of <span className="text-slate-600 font-semibold">{total}</span> appointments
            </p>
            <div className="flex gap-1.5">
                <button disabled={page === 1} onClick={() => onPageChange(p => p - 1)}
                    style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #e2e8f0", background: page === 1 ? "#f8fafc" : "#fff", color: page === 1 ? "#cbd5e1" : "#475569", cursor: page === 1 ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                {pages.map((item, idx) =>
                    item === "…"
                        ? <span key={`d${idx}`} style={{ width: 30, textAlign: "center", fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>…</span>
                        : <button key={item} onClick={() => onPageChange(item)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: page === item ? `2px solid ${COLOR}` : "1.5px solid #e2e8f0", background: page === item ? COLOR : "#fff", color: page === item ? "#fff" : "#475569", cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {item}
                        </button>
                )}
                <button disabled={page === totalPages} onClick={() => onPageChange(p => p + 1)}
                    style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #e2e8f0", background: page === totalPages ? "#f8fafc" : "#fff", color: page === totalPages ? "#cbd5e1" : "#475569", cursor: page === totalPages ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
            </div>
        </div>
    );
};


const AllAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [completing, setCompleting] = useState(null);
    const [page, setPage] = useState(1);
    const AllAppointments = ({ searchQuery = "" }) => {
        // Use it in your existing filter:
        const filtered = appointments.filter(a => {
            const q = (searchQuery || search).toLowerCase();
            return (
                a.patient_id?.patient_name?.toLowerCase().includes(q) ||
                a.patient_id?.patient_email?.toLowerCase().includes(q) ||
                a.patient_id?.patient_phone?.includes(q)
            );
        });

    };

    const token = localStorage.getItem("StaffToken");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/staffapi/my-appointments", { headers });
            setAppointments(res.data.appointments || []);
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { setPage(1); }, [search, filterStatus]);

    const handleComplete = async (appt) => {
        const confirm = await Swal.fire({
            title: "Mark as Completed?",
            text: `Confirm appointment with ${appt.patient_id?.patient_name} is done.`,
            icon: "question", showCancelButton: true,
            confirmButtonColor: "#16a34a", confirmButtonText: "Yes, Complete"
        });
        if (!confirm.isConfirmed) return;
        setCompleting(appt._id);
        try {
            await axios.patch(`http://localhost:5000/staffapi/appointment/complete/${appt._id}`, {}, { headers });
            Swal.fire({ icon: "success", title: "Marked Complete!", timer: 1500, showConfirmButton: false });
            fetchData();
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed", "error");
        } finally { setCompleting(null); }
    };

    const counts = {
        ALL: appointments.length,
        PENDING: appointments.filter(a => a.appointment_status === "PENDING").length,
        SCHEDULED: appointments.filter(a => a.appointment_status === "SCHEDULED").length,
        COMPLETED: appointments.filter(a => a.appointment_status === "COMPLETED").length,
        CANCELLED: appointments.filter(a => a.appointment_status === "CANCELLED").length,
        RESCHEDULED: appointments.filter(a => a.appointment_status === "RESCHEDULED").length,
    };

    const filtered = appointments.filter(a => {
        const matchStatus = filterStatus === "ALL" || a.appointment_status === filterStatus;
        const q = search.toLowerCase();
        return matchStatus && (
            (a.patient_id?.patient_name || "").toLowerCase().includes(q) ||
            (a.patient_id?.patient_email || "").toLowerCase().includes(q) ||
            (a.patient_id?.patient_phone || "").includes(q)
        );
    });

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');`}</style>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Playfair Display',serif" }}>All Appointments</h1>
                <p className="text-slate-400 text-sm">{appointments.length} total appointments assigned to you</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                {[
                    { key: "ALL", label: "Total", bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
                    { key: "PENDING", label: "Pending", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
                    { key: "SCHEDULED", label: "Scheduled", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
                    { key: "COMPLETED", label: "Completed", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
                    { key: "CANCELLED", label: "Cancelled", bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
                    { key: "RESCHEDULED", label: "Rescheduled", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
                ].map(({ key, label, bg, text, border }) => (
                    <div key={key} onClick={() => setFilterStatus(key)}
                        className={`${bg} border ${border} rounded-2xl p-3 text-center cursor-pointer transition hover:shadow-sm ${filterStatus === key ? "ring-2 ring-blue-400 ring-offset-1" : ""}`}>
                        <p className={`text-xl font-bold ${text}`}>{counts[key] ?? 0}</p>
                        <p className={`text-xs font-medium ${text} opacity-80 mt-0.5`}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Search + Filter */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input type="text" placeholder="Search by patient name, email or phone..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50" />
                </div>
                <div className="flex flex-wrap gap-2">
                    {["ALL", "PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${filterStatus === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-600"}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <FaCalendarAlt className="text-slate-300 mb-3" size={40} />
                        <p className="text-slate-600 font-semibold">No appointments found</p>
                        <p className="text-slate-400 text-sm mt-1">{search ? `No results for "${search}"` : "No appointments match your filter"}</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["#", "Patient", "Date", "Time", "Status", "Actions"].map(h => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginated.map((appt, i) => {
                                        const sc = statusConfig[appt.appointment_status] || statusConfig.PENDING;
                                        const rowIdx = (page - 1) * PER_PAGE + i + 1;
                                        return (
                                            <tr key={appt._id} className="hover:bg-slate-50 transition">
                                                <td className="px-5 py-4 text-sm text-slate-400">{rowIdx}</td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                                            <FaUserAlt size={13} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-700">{appt.patient_id?.patient_name || "—"}</p>
                                                            <p className="text-xs text-slate-400">{appt.patient_id?.patient_phone || appt.patient_id?.patient_email || ""}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                        <FaCalendarAlt size={11} className="text-slate-400" /> {formatDate(appt.appointment_date)}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                                                        <FaClock size={10} /> {appt.start_time} – {appt.end_time}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${sc.color}`}>
                                                        {sc.icon} {sc.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => { setSelected(appt); setShowModal(true); }}
                                                            className="w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition">
                                                            <FaEye size={13} />
                                                        </button>
                                                        {["SCHEDULED", "PENDING"].includes(appt.appointment_status) && (
                                                            <button onClick={() => handleComplete(appt)} disabled={completing === appt._id}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition disabled:opacity-60">
                                                                {completing === appt._id ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaCheckCircle size={11} />}
                                                                Complete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Paginator page={page} totalPages={totalPages} total={filtered.length} onPageChange={setPage} />
                    </>
                )}
            </div>

            {/* Detail Modal */}
            {showModal && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backdropFilter: "blur(8px)", background: "rgba(15,23,42,0.60)" }}
                    onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5 flex justify-between items-start">
                            <div>
                                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Appointment Details</p>
                                <h2 className="text-white font-bold text-lg">{selected.patient_id?.patient_name || "Patient"}</h2>
                                <p className="text-blue-200 text-sm mt-0.5">{selected.patient_id?.patient_phone}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition text-lg">✕</button>
                        </div>
                        <div className={`px-6 py-2 flex items-center gap-2 text-xs font-semibold ${statusConfig[selected.appointment_status]?.color || ""}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            {statusConfig[selected.appointment_status]?.icon} Status: {statusConfig[selected.appointment_status]?.label}
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-3">
                            {[
                                { label: "Date", icon: <FaCalendarAlt size={12} className="text-blue-500" />, value: formatDate(selected.appointment_date) },
                                { label: "Time", icon: <FaClock size={12} className="text-blue-500" />, value: `${selected.start_time} – ${selected.end_time}` },
                                { label: "Email", icon: <FaUserAlt size={12} className="text-blue-500" />, value: selected.patient_id?.patient_email || "—" },
                                { label: "Phone", icon: <FaUserAlt size={12} className="text-blue-500" />, value: selected.patient_id?.patient_phone || "—" },
                            ].map(({ label, icon, value }) => (
                                <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">{icon} {label}</p>
                                    <p className="text-sm font-semibold text-slate-700">{value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            {["SCHEDULED", "PENDING"].includes(selected.appointment_status) && (
                                <button onClick={() => { setShowModal(false); handleComplete(selected); }}
                                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                                    <FaCheckCircle size={13} /> Mark Complete
                                </button>
                            )}
                            <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold transition">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllAppointments;