import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    FaCalendarAlt, FaUserMd, FaHospital, FaSearch,
    FaClock, FaTrash, FaEye, FaUser
} from "react-icons/fa";

const AdminAllAppointments = () => {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [searchQuery, setSearchQuery]   = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [showModal, setShowModal]       = useState(false);

    // ── PAGINATION ──────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const token = localStorage.getItem("adminToken");

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                "http://localhost:5000/adminapi/all-appointments",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAppointments(res.data.appointments || []);
        } catch (error) {
            console.log("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAppointments(); }, []);

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Appointment?",
            text: "This appointment will be permanently removed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Delete"
        });
        if (!confirm.isConfirmed) return;

        try {
            await axios.delete(
                `http://localhost:5000/adminapi/delete-appointment/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
            setAppointments(appointments.filter(a => a._id !== id));
        } catch {
            Swal.fire("Error", "Failed to delete appointment", "error");
        }
    };

    const statusBadge = (status) => ({
        PENDING:     "bg-amber-100 text-amber-700 border-amber-200",
        SCHEDULED:   "bg-blue-100 text-blue-700 border-blue-200",
        COMPLETED:   "bg-emerald-100 text-emerald-700 border-emerald-200",
        CANCELLED:   "bg-red-100 text-red-600 border-red-200",
        RESCHEDULED: "bg-violet-100 text-violet-700 border-violet-200",
        NO_SHOW:     "bg-slate-100 text-slate-600 border-slate-200",
    }[status] || "bg-amber-100 text-amber-700 border-amber-200");

    const counts = {
        ALL:         appointments.length,
        PENDING:     appointments.filter(a => a.appointment_status === "PENDING").length,
        SCHEDULED:   appointments.filter(a => a.appointment_status === "SCHEDULED").length,
        COMPLETED:   appointments.filter(a => a.appointment_status === "COMPLETED").length,
        CANCELLED:   appointments.filter(a => a.appointment_status === "CANCELLED").length,
        RESCHEDULED: appointments.filter(a => a.appointment_status === "RESCHEDULED").length,
    };

    const filtered = appointments.filter(a => {
        const matchStatus = filterStatus === "ALL" || a.appointment_status === filterStatus;
        const q = searchQuery.toLowerCase();
        return matchStatus && (
            a.patient_id?.patient_name?.toLowerCase().includes(q) ||
            a.doctor_id?.name?.toLowerCase().includes(q) ||
            a.doctor_id?.specialization?.toLowerCase().includes(q) ||
            a.hospital_id?.hospital_name?.toLowerCase().includes(q)
        );
    });

    // ── PAGINATION LOGIC ────────────────────────────
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSearch = (val) => { setSearchQuery(val);  setCurrentPage(1); };
    const handleFilter = (val) => { setFilterStatus(val); setCurrentPage(1); };

    const getPageNumbers = () => {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .reduce((acc, p, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== p - 1) acc.push("...");
                acc.push(p);
                return acc;
            }, []);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading appointments...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 p-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .appt-page  { font-family: 'DM Sans', sans-serif; }
                .page-title { font-family: 'Playfair Display', serif; }
                .card-row   { transition: all 0.15s; border-left: 3px solid transparent; }
                .card-row:hover { background: #eff6ff; border-left-color: #3b82f6; }
                .filter-tab { transition: all 0.15s; cursor: pointer; }
                .filter-tab.active { background: #2563eb; color: white; }
                .filter-tab:not(.active):hover { background: #dbeafe; color: #2563eb; }
                .modal-overlay { backdrop-filter: blur(6px); background: rgba(15,23,42,0.6); }
                .btn-del { background: linear-gradient(135deg,#dc2626,#b91c1c); transition: all 0.2s; }
                .btn-del:hover { box-shadow: 0 4px 12px rgba(220,38,38,0.3); transform: translateY(-1px); }
            `}</style>

            <div className="appt-page max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="page-title text-3xl text-slate-800 mb-1">All Appointments</h1>
                        <p className="text-slate-500 text-sm">All patient appointments across hospitals</p>
                    </div>
                    <button onClick={fetchAppointments}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition font-medium self-start">
                        Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    {[
                        { label: "Total",       count: counts.ALL,         text: "text-blue-600" },
                        { label: "Pending",     count: counts.PENDING,     text: "text-amber-600" },
                        { label: "Scheduled",   count: counts.SCHEDULED,   text: "text-indigo-600" },
                        { label: "Completed",   count: counts.COMPLETED,   text: "text-emerald-600" },
                        { label: "Cancelled",   count: counts.CANCELLED,   text: "text-red-500" },
                        { label: "Rescheduled", count: counts.RESCHEDULED, text: "text-violet-600" },
                    ].map(({ label, count, text }) => (
                        <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
                            <p className={`text-2xl font-bold ${text}`}>{count}</p>
                            <p className="text-xs text-slate-400 font-medium mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex gap-2 flex-wrap">
                            {["ALL","PENDING","SCHEDULED","COMPLETED","CANCELLED","RESCHEDULED"].map(s => (
                                <button key={s}
                                    onClick={() => handleFilter(s)}
                                    className={`filter-tab px-3 py-1.5 rounded-lg text-xs font-semibold ${filterStatus === s ? "active" : "text-slate-500 bg-slate-100"}`}
                                >
                                    {s} <span className="ml-1 opacity-70">({counts[s] ?? 0})</span>
                                </button>
                            ))}
                        </div>
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                            <input type="text"
                                placeholder="Search by patient, doctor or hospital..."
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <FaCalendarAlt className="text-slate-300 mb-4" size={36} />
                            <p className="text-slate-500 font-semibold">No appointments found</p>
                            <p className="text-slate-400 text-sm mt-1">No appointments match your filter</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["#","Patient","Doctor","Hospital","Date","Time","Status","Actions"].map(h => (
                                            <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {/* ── Use paginated instead of filtered ── */}
                                    {paginated.map((appt, i) => (
                                        <tr key={appt._id} className="card-row">
                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                            </td>

                                            {/* Patient */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                                        <FaUser size={11} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-700">{appt.patient_id?.patient_name || "—"}</p>
                                                        <p className="text-xs text-slate-400">{appt.patient_id?.patient_phone || ""}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Doctor */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                                                        <FaUserMd size={11} className="text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-700">{appt.doctor_id?.name || "—"}</p>
                                                        <p className="text-xs text-slate-400">{appt.doctor_id?.specialization || ""}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Hospital */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <FaHospital size={11} className="text-slate-400" />
                                                    {appt.hospital_id?.hospital_name || "—"}
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <FaCalendarAlt size={11} className="text-slate-400" />
                                                    {appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString("en-GB") : "—"}
                                                </div>
                                            </td>

                                            {/* Time */}
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                                                    <FaClock size={9} /> {appt.start_time || appt.appointment_time || "—"}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusBadge(appt.appointment_status)}`}>
                                                    {appt.appointment_status || "PENDING"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => { setSelectedAppt(appt); setShowModal(true); }}
                                                        className="w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                                                        title="View Details"
                                                    >
                                                        <FaEye size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── PAGINATION ── */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} appointments
                            </p>
                            <div className="flex items-center gap-1.5">

                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 text-sm rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                                >&#8249;</button>

                                {getPageNumbers().map((item, idx) =>
                                    item === "..." ? (
                                        <span key={"dots-" + idx} className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm">&#8230;</span>
                                    ) : (
                                        <button key={item}
                                            onClick={() => setCurrentPage(item)}
                                            className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded transition ${
                                                currentPage === item
                                                    ? "border-2 border-slate-800 text-slate-800 bg-white font-semibold"
                                                    : "border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500"
                                            }`}
                                        >{item}</button>
                                    )
                                )}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white text-sm rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                                >&#8250;</button>

                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Detail Modal */}
            {showModal && selectedAppt && (
                <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

                        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-white font-bold text-base">Appointment Details</h2>
                                <p className="text-blue-200 text-xs mt-0.5">Full appointment information</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white text-lg">✕</button>
                        </div>

                        <div className="p-6 space-y-3">

                            {/* Patient */}
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FaUser size={10} /> Patient
                                </p>
                                <p className="text-sm text-slate-700"><span className="font-semibold">Name:</span> {selectedAppt.patient_id?.patient_name || "—"}</p>
                                <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Email:</span> {selectedAppt.patient_id?.patient_email || "—"}</p>
                                <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Phone:</span> {selectedAppt.patient_id?.patient_phone || "—"}</p>
                            </div>

                            {/* Doctor */}
                            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FaUserMd size={10} /> Doctor
                                </p>
                                <p className="text-sm text-slate-700"><span className="font-semibold">Name:</span> {selectedAppt.doctor_id?.name || "—"}</p>
                                <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Specialization:</span> {selectedAppt.doctor_id?.specialization || "—"}</p>
                            </div>

                            {/* Appointment Info */}
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FaCalendarAlt size={10} /> Appointment
                                </p>
                                <p className="text-sm text-slate-700"><span className="font-semibold">Hospital:</span> {selectedAppt.hospital_id?.hospital_name || "—"}</p>
                                <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Date:</span> {selectedAppt.appointment_date ? new Date(selectedAppt.appointment_date).toLocaleDateString("en-GB") : "—"}</p>
                                <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Time:</span> {selectedAppt.start_time || selectedAppt.appointment_time || "—"}</p>
                                <div className="mt-2">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusBadge(selectedAppt.appointment_status)}`}>
                                        {selectedAppt.appointment_status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6">
                            <button onClick={() => setShowModal(false)}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAllAppointments;