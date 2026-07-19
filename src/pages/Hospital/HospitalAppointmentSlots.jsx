import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
    FaCalendarAlt, FaClock, FaUserMd, FaPlus,
    FaEdit, FaTrash, FaSearch, FaEye
} from "react-icons/fa";
import Swal from "sweetalert2";

const AppointmentSlots = () => {

    const { globalSearch = "" } = useOutletContext() || {};
    const [slots, setSlots]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [searchQuery, setSearchQuery]   = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showModal, setShowModal]       = useState(false);

    // ── PAGINATION ──────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const navigate = useNavigate();
    const token = localStorage.getItem("HospitalToken");

    const getSlots = async () => {
        try {
            const res = await axios.get(
                "https://carexa-backend.vercel.app/hospitalapi/get-appointment-slots",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSlots(res.data.slots || []);
        } catch (error) {
            console.log("Error fetching slots", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { getSlots(); }, []);

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Slot?",
            text: "This slot will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Delete"
        });
        if (!confirm.isConfirmed) return;

        try {
            await axios.delete(
                `https://carexa-backend.vercel.app/hospitalapi/delete-slot/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
            getSlots();
        } catch {
            Swal.fire("Error", "Failed to delete slot", "error");
        }
    };

    const statusOf = (slot) => slot.is_booked ? "BOOKED" : (slot.slot_status || "AVAILABLE");

    const statusBadge = (slot) => {
        const s = statusOf(slot);
        const map = {
            AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-200",
            BOOKED:    "bg-blue-100 text-blue-700 border-blue-200",
            CANCELLED: "bg-red-100 text-red-600 border-red-200",
            COMPLETED: "bg-slate-100 text-slate-600 border-slate-200",
        };
        return map[s] || map.AVAILABLE;
    };

    const counts = {
        ALL:       slots.length,
        AVAILABLE: slots.filter(s => !s.is_booked && (s.slot_status === "AVAILABLE" || !s.slot_status)).length,
        BOOKED:    slots.filter(s => s.is_booked || s.slot_status === "BOOKED").length,
    };

    const filtered = slots.filter(s => {
        const status = statusOf(s);
        const matchStatus = filterStatus === "ALL" || status === filterStatus;
        const q = (globalSearch || searchQuery).toLowerCase();
        return matchStatus && (
            s.doctor_id?.name?.toLowerCase().includes(q) ||
            s.doctor_id?.specialization?.toLowerCase().includes(q)
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
                <p className="text-gray-500 font-medium">Loading slots...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 p-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .slots-page { font-family: 'DM Sans', sans-serif; }
                .page-title { font-family: 'Playfair Display', serif; }
                .card-row   { transition: all 0.15s; border-left: 3px solid transparent; }
                .card-row:hover { background: #eff6ff; border-left-color: #3b82f6; }
                .btn-edit   { background: linear-gradient(135deg,#d97706,#b45309); transition: all 0.2s; }
                .btn-edit:hover   { box-shadow: 0 4px 12px rgba(217,119,6,0.3); transform: translateY(-1px); }
                .btn-delete { background: linear-gradient(135deg,#dc2626,#b91c1c); transition: all 0.2s; }
                .btn-delete:hover { box-shadow: 0 4px 12px rgba(220,38,38,0.3); transform: translateY(-1px); }
                .add-btn    { background: linear-gradient(135deg,#2563eb,#4f46e5); transition: all 0.2s; }
                .add-btn:hover { box-shadow: 0 6px 20px rgba(79,70,229,0.35); transform: translateY(-1px); }
                .filter-tab { transition: all 0.15s; cursor: pointer; }
                .filter-tab.active { background: #2563eb; color: white; }
                .filter-tab:not(.active):hover { background: #dbeafe; color: #2563eb; }
                .modal-overlay { backdrop-filter: blur(6px); background: rgba(15,23,42,0.6); }
            `}</style>

            <div className="slots-page max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="page-title text-3xl text-slate-800 mb-1">Appointment Slots</h1>
                        <p className="text-slate-500 text-sm">{slots.length} slots created for your hospital</p>
                    </div>
                    <Link to="/hospital-dashboard/add-slots"
                        className="add-btn flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold self-start">
                        <FaPlus size={12} /> Add Slot
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: "Total Slots", count: counts.ALL,       bg: "bg-blue-50",    icon: <FaCalendarAlt size={18} className="text-blue-600" /> },
                        { label: "Available",   count: counts.AVAILABLE, bg: "bg-emerald-50", icon: <FaClock size={18} className="text-emerald-600" /> },
                        { label: "Booked",      count: counts.BOOKED,    bg: "bg-indigo-50",  icon: <FaUserMd size={18} className="text-indigo-600" /> },
                    ].map(({ label, count, bg, icon }) => (
                        <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0`}>{icon}</div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{count}</p>
                                <p className="text-xs text-slate-400 font-medium">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex gap-2">
                            {["ALL","AVAILABLE","BOOKED"].map(s => (
                                <button key={s} onClick={() => handleFilter(s)}
                                    className={`filter-tab px-3 py-1.5 rounded-lg text-xs font-semibold ${filterStatus === s ? "active" : "text-slate-500 bg-slate-100"}`}>
                                    {s} <span className="ml-1 opacity-70">({counts[s] ?? 0})</span>
                                </button>
                            ))}
                        </div>
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                            <input type="text"
                                placeholder="Search by doctor or specialization..."
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
                            />
                        </div>
                        <button onClick={getSlots}
                            className="text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition font-medium shrink-0">
                            Refresh
                        </button>
                    </div>

                    {/* Table */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                                <FaCalendarAlt className="text-blue-300" size={28} />
                            </div>
                            <p className="text-slate-600 font-semibold text-lg">No slots found</p>
                            <p className="text-slate-400 text-sm mt-1">
                                {searchQuery ? "Try a different search" : "Add your first appointment slot"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["#","Doctor","Date","Time","Status","Actions"].map(h => (
                                            <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                        ))}
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

                                            {/* Date */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <FaCalendarAlt size={11} className="text-slate-400" />
                                                    {new Date(slot.appointment_date).toLocaleDateString("en-GB")}
                                                </div>
                                            </td>

                                            {/* Time */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-100">
                                                        <FaClock size={9} /> {slot.start_time}
                                                    </span>
                                                    <span className="text-slate-300 text-xs">—</span>
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                                                        <FaClock size={9} /> {slot.end_time}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusBadge(slot)}`}>
                                                    {statusOf(slot)}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => { setSelectedSlot(slot); setShowModal(true); }}
                                                        className="w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition" title="View">
                                                        <FaEye size={13} />
                                                    </button>
                                                    <button onClick={() => navigate(`/hospital-dashboard/edit-slot/${slot._id}`)}
                                                        className="btn-edit w-8 h-8 flex items-center justify-center text-white rounded-lg" title="Edit">
                                                        <FaEdit size={12} />
                                                    </button>
                                                    <button onClick={() => handleDelete(slot._id)}
                                                        className="btn-delete w-8 h-8 flex items-center justify-center text-white rounded-lg" title="Delete">
                                                        <FaTrash size={12} />
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

                            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-2"><FaUserMd size={10} /> Doctor</p>
                                <p className="text-sm text-slate-700"><span className="font-semibold">Name:</span> {selectedSlot.doctor_id?.name || "—"}</p>
                                <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Specialization:</span> {selectedSlot.doctor_id?.specialization || "—"}</p>
                            </div>

                            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-2"><FaCalendarAlt size={10} /> Slot Info</p>
                                <p className="text-sm text-slate-700"><span className="font-semibold">Date:</span> {new Date(selectedSlot.appointment_date).toLocaleDateString("en-GB")}</p>
                                <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Start:</span> {selectedSlot.start_time}</p>
                                <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">End:</span> {selectedSlot.end_time}</p>
                                <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Duration:</span> {selectedSlot.slot_duration || 30} mins</p>
                                <div className="mt-2">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusBadge(selectedSlot)}`}>
                                        {statusOf(selectedSlot)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => { setShowModal(false); navigate(`/hospital-dashboard/edit-slot/${selectedSlot._id}`); }}
                                className="btn-edit flex-1 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                                <FaEdit size={13} /> Edit Slot
                            </button>
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 py-2.5 rounded-xl text-sm font-semibold transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentSlots;