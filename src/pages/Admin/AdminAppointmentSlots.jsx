import { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";
import {
    FaCalendarAlt, FaUserMd, FaHospital, FaSearch,
    FaClock, FaTrash, FaEye, FaFilter
} from "react-icons/fa";

const AdminAppointmentSlots = () => {

    const { globalSearch = "" } = useOutletContext() || {};
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // ── PAGINATION ──────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const token = localStorage.getItem("adminToken");

    const fetchSlots = async () => {
        try {
            const res = await axios.get(
                "https://carexa-backend.vercel.app/adminapi/All-Appointment-Slots",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSlots(res.data.slots || []);
        } catch (error) {
            console.log("Error fetching slots:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSlots(); }, []);

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Slot?",
            text: "This appointment slot will be permanently removed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Delete"
        });
        if (!confirm.isConfirmed) return;

        try {
            await axios.delete(
                `https://carexa-backend.vercel.app/adminapi/delete-slot/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
            setSlots(slots.filter(s => s._id !== id));
        } catch (error) {
            Swal.fire("Error", "Failed to delete slot", "error");
        }
    };

    const statusBadge = (status) => {
        const map = {
            AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-200",
            BOOKED:    "bg-blue-100 text-blue-700 border-blue-200",
            CANCELLED: "bg-red-100 text-red-600 border-red-200",
            COMPLETED: "bg-slate-100 text-slate-600 border-slate-200",
        };
        return map[status] || map.AVAILABLE;
    };

    const filtered = slots.filter(s => {
        const matchStatus = filterStatus === "ALL" || s.slot_status === filterStatus;
        const q = (globalSearch || searchQuery).trim().toLowerCase();
        const matchSearch =
            s.doctor_id?.name?.toLowerCase().includes(q) ||
            s.doctor_id?.specialization?.toLowerCase().includes(q) ||
            s.hospital_id?.hospital_name?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    // ── PAGINATION LOGIC ────────────────────────────
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSearch  = (val) => { setSearchQuery(val);  setCurrentPage(1); };
    const handleFilter  = (val) => { setFilterStatus(val); setCurrentPage(1); };

    const getPageNumbers = () => {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .reduce((acc, p, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== p - 1) acc.push("...");
                acc.push(p);
                return acc;
            }, []);
    };

    const counts = {
        ALL:       slots.length,
        AVAILABLE: slots.filter(s => s.slot_status === "AVAILABLE").length,
        BOOKED:    slots.filter(s => s.slot_status === "BOOKED").length,
        CANCELLED: slots.filter(s => s.slot_status === "CANCELLED").length,
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading appointment slots...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 p-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .slots-page { font-family: 'DM Sans', sans-serif; }
                .page-title { font-family: 'Playfair Display', serif; }
                .card-row   { transition: all 0.15s ease; border-left: 3px solid transparent; }
                .card-row:hover { background: #eff6ff; border-left-color: #3b82f6; }
                .filter-tab { transition: all 0.15s; cursor: pointer; }
                .filter-tab.active { background: #2563eb; color: white; }
                .filter-tab:not(.active):hover { background: #dbeafe; color: #2563eb; }
                .modal-overlay { backdrop-filter: blur(6px); background: rgba(15,23,42,0.6); }
                .btn-delete { background: linear-gradient(135deg, #dc2626, #b91c1c); transition: all 0.2s; }
                .btn-delete:hover { box-shadow: 0 4px 12px rgba(220,38,38,0.3); transform: translateY(-1px); }
            `}</style>

            <div className="slots-page max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="page-title text-3xl text-slate-800 mb-1">Appointment Slots</h1>
                        <p className="text-slate-500 text-sm">All appointment slots across hospitals and doctors</p>
                    </div>
                    <button
                        onClick={fetchSlots}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition font-medium self-start"
                    >
                        Refresh
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Slots", count: counts.ALL,       color: "bg-blue-50",    icon: <FaCalendarAlt size={16} className="text-blue-600" /> },
                        { label: "Available",   count: counts.AVAILABLE, color: "bg-emerald-50", icon: <FaClock size={16} className="text-emerald-600" /> },
                        { label: "Booked",      count: counts.BOOKED,    color: "bg-indigo-50",  icon: <FaUserMd size={16} className="text-indigo-600" /> },
                        { label: "Cancelled",   count: counts.CANCELLED, color: "bg-red-50",     icon: <FaFilter size={16} className="text-red-500" /> },
                    ].map(({ label, count, color, icon }) => (
                        <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
                            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>{icon}</div>
                            <div>
                                <p className="text-xl font-bold text-slate-800">{count}</p>
                                <p className="text-xs text-slate-400 font-medium">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">

                        {/* Filter Tabs */}
                        <div className="flex gap-2 flex-wrap">
                            {["ALL", "AVAILABLE", "BOOKED", "CANCELLED"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleFilter(s)}
                                    className={`filter-tab px-3 py-1.5 rounded-lg text-xs font-semibold ${filterStatus === s ? "active" : "text-slate-500 bg-slate-100"}`}
                                >
                                    {s} <span className="ml-1 opacity-70">({counts[s] ?? slots.length})</span>
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                            <input
                                type="text"
                                placeholder="Search by doctor, hospital or specialization..."
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                                <FaCalendarAlt className="text-blue-300" size={28} />
                            </div>
                            <p className="text-slate-600 font-semibold text-lg">No slots found</p>
                            <p className="text-slate-400 text-sm mt-1">No appointment slots match your filter</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospital</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Start</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">End</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {/* ── Use paginated instead of filtered ── */}
                                    {paginated.map((slot, index) => (
                                        <tr key={slot._id} className="card-row">
                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>

                                            {/* Doctor */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                                                        <FaUserMd size={11} className="text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-700">{slot.doctor_id?.name || "—"}</p>
                                                        <p className="text-xs text-slate-400">{slot.doctor_id?.specialization || ""}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Hospital */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <FaHospital size={11} className="text-slate-400" />
                                                    {slot.hospital_id?.hospital_name || "—"}
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <FaCalendarAlt size={11} className="text-slate-400" />
                                                    {slot.appointment_date
                                                        ? new Date(slot.appointment_date).toLocaleDateString("en-GB")
                                                        : "—"}
                                                </div>
                                            </td>

                                            {/* Start Time */}
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-100">
                                                    <FaClock size={9} /> {slot.start_time || "—"}
                                                </span>
                                            </td>

                                            {/* End Time */}
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                                                    <FaClock size={9} /> {slot.end_time || "—"}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${statusBadge(slot.slot_status)}`}>
                                                    {slot.slot_status || "AVAILABLE"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => { setSelectedSlot(slot); setShowModal(true); }}
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
                                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} slots
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
            {showModal && selectedSlot && (
                <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

                        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-white font-bold text-base">Slot Details</h2>
                                <p className="text-blue-200 text-xs mt-0.5">Full appointment slot information</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white text-lg">✕</button>
                        </div>

                        <div className="p-6 space-y-3">

                            {/* Doctor */}
                            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FaUserMd size={10} /> Doctor
                                </p>
                                <p className="text-sm text-slate-700"><span className="font-semibold">Name:</span> {selectedSlot.doctor_id?.name || "—"}</p>
                                <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Specialization:</span> {selectedSlot.doctor_id?.specialization || "—"}</p>
                            </div>

                            {/* Hospital */}
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FaHospital size={10} /> Hospital
                                </p>
                                <p className="text-sm text-slate-700">{selectedSlot.hospital_id?.hospital_name || "—"}</p>
                            </div>

                            {/* Slot Info */}
                            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FaCalendarAlt size={10} /> Slot Info
                                </p>
                                <p className="text-sm text-slate-700"><span className="font-semibold">Date:</span> {selectedSlot.appointment_date ? new Date(selectedSlot.appointment_date).toLocaleDateString("en-GB") : "—"}</p>
                                <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Start Time:</span> {selectedSlot.start_time || "—"}</p>
                                <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">End Time:</span> {selectedSlot.end_time || "—"}</p>
                                <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Duration:</span> {selectedSlot.slot_duration || 30} mins</p>
                                <div className="mt-2">
                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${statusBadge(selectedSlot.slot_status)}`}>
                                        {selectedSlot.slot_status || "AVAILABLE"}
                                    </span>
                                </div>
                            </div>

                        </div>

                        <div className="px-6 pb-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAppointmentSlots;