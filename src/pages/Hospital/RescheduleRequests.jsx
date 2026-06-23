import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    FaExchangeAlt, FaCheckCircle, FaTimesCircle,
    FaEye, FaSearch, FaUserMd, FaCalendarAlt,
    FaClock, FaHospital, FaCommentAlt, FaTimes
} from "react-icons/fa";

const RescheduleRequests = () => {

    const [requests, setRequests]               = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal]             = useState(false);
    const [searchQuery, setSearchQuery]         = useState("");
    const [filterStatus, setFilterStatus]       = useState("ALL");
    const [currentPage, setCurrentPage]         = useState(1);
    const ITEMS_PER_PAGE = 5;

    const token   = localStorage.getItem("HospitalToken");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                "https://carexa-backend.vercel.app/hospitalapi/reschedule-request",
                { headers }
            );
            setRequests(res.data.rescheduleRequests || []);
        } catch (error) {
            console.log("Error fetching reschedule requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const formatDate = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    const statusBadge = (status) => ({
        PENDING:  "bg-amber-100 text-amber-700 border-amber-200",
        APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
        REJECTED: "bg-red-100 text-red-600 border-red-200"
    }[status] || "bg-amber-100 text-amber-700 border-amber-200");

    const counts = {
        ALL:      requests.length,
        PENDING:  requests.filter(r => r.status === "PENDING").length,
        APPROVED: requests.filter(r => r.status === "APPROVED").length,
        REJECTED: requests.filter(r => r.status === "REJECTED").length,
    };

    const filtered = requests.filter(r => {
        const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
        const q = searchQuery.toLowerCase();
        return matchStatus && (
            r.appointment_id?.doctor_id?.name?.toLowerCase().includes(q) ||
            r.appointment_id?.hospital_id?.hospital_name?.toLowerCase().includes(q) ||
            r.reason?.toLowerCase().includes(q)
        );
    });

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
        <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading reschedule requests...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-indigo-50/20 p-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .rs-page { font-family: 'DM Sans', sans-serif; }
                .page-title { font-family: 'Playfair Display', serif; }
                .card-row { transition: all 0.15s ease; border-left: 3px solid transparent; }
                .card-row:hover { background: #f5f3ff; border-left-color: #7c3aed; }
                .modal-overlay { backdrop-filter: blur(6px); background: rgba(15,23,42,0.6); }
                .filter-tab { transition: all 0.15s; cursor: pointer; }
                .filter-tab.active { background: #7c3aed; color: white; }
                .filter-tab:not(.active):hover { background: #ede9fe; color: #7c3aed; }
            `}</style>

            <div className="rs-page max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="page-title text-3xl text-slate-800 mb-1">Reschedule Requests</h1>
                        <p className="text-slate-500 text-sm">View all patient reschedule requests</p>
                    </div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold border border-amber-200 self-start">
                        <FaClock size={12} /> {counts.PENDING} Pending
                    </span>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total",    count: counts.ALL,      color: "bg-violet-100", icon: <FaExchangeAlt className="text-violet-600" size={16} /> },
                        { label: "Pending",  count: counts.PENDING,  color: "bg-amber-100",  icon: <FaClock className="text-amber-600" size={16} /> },
                        { label: "Approved", count: counts.APPROVED, color: "bg-emerald-100", icon: <FaCheckCircle className="text-emerald-600" size={16} /> },
                        { label: "Rejected", count: counts.REJECTED, color: "bg-red-100",    icon: <FaTimesCircle className="text-red-500" size={16} /> },
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

                    {/* Filters + Search */}
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex gap-2 flex-wrap">
                            {["ALL","PENDING","APPROVED","REJECTED"].map(s => (
                                <button key={s} onClick={() => handleFilter(s)}
                                    className={`filter-tab px-3 py-1.5 rounded-lg text-xs font-semibold ${filterStatus === s ? "active" : "text-slate-500 bg-slate-100"}`}>
                                    {s} <span className="ml-1 opacity-70">({counts[s]})</span>
                                </button>
                            ))}
                        </div>
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                            <input type="text" placeholder="Search by doctor, hospital or reason..."
                                value={searchQuery} onChange={e => handleSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-slate-50" />
                        </div>
                        <button onClick={fetchRequests}
                            className="text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition font-medium shrink-0">
                            Refresh
                        </button>
                    </div>

                    {/* Table — no overflow-x-auto, table-fixed prevents horizontal scroll */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
                                <FaExchangeAlt className="text-violet-300" size={28} />
                            </div>
                            <p className="text-slate-600 font-semibold text-lg">No requests found</p>
                            <p className="text-slate-400 text-sm mt-1">No reschedule requests match your filter</p>
                        </div>
                    ) : (
                        <div>
                            <table className="w-full table-fixed">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-10">#</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-48">Doctor</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-36">Hospital</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Date</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Time</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Status</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">View</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginated.map((req, index) => (
                                        <tr key={req._id} className="card-row">

                                            {/* # */}
                                            <td className="px-4 py-4 text-sm text-slate-400 font-medium">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>

                                            {/* Doctor */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                                                        <FaUserMd size={11} className="text-indigo-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-700 truncate">
                                                            {req.appointment_id?.doctor_id?.name || "—"}
                                                        </p>
                                                        <p className="text-xs text-slate-400 truncate">
                                                            {req.appointment_id?.doctor_id?.specialization || ""}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Hospital */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                    <FaHospital size={11} className="text-slate-400 shrink-0" />
                                                    <span className="truncate">
                                                        {req.appointment_id?.hospital_id?.hospital_name || "—"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Original Date */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                    <FaCalendarAlt size={11} className="text-slate-400 shrink-0" />
                                                    <span className="truncate">
                                                        {req.appointment_id?.appointment_date
                                                            ? new Date(req.appointment_id.appointment_date).toLocaleDateString("en-GB")
                                                            : "—"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Time */}
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                                                    <FaClock size={10} />
                                                    {req.appointment_id?.start_time || "—"}
                                                </span>
                                            </td>

                                            {/* Reason */}
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-slate-600 truncate" title={req.reason}>
                                                    {req.reason || <span className="text-slate-300 italic">No reason</span>}
                                                </p>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border ${statusBadge(req.status)}`}>
                                                    {req.status === "PENDING"  && <FaClock size={9} />}
                                                    {req.status === "APPROVED" && <FaCheckCircle size={9} />}
                                                    {req.status === "REJECTED" && <FaTimesCircle size={9} />}
                                                    {req.status}
                                                </span>
                                            </td>

                                            {/* View only */}
                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => { setSelectedRequest(req); setShowModal(true); }}
                                                    className="w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                                                    title="View Details">
                                                    <FaEye size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} requests
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-9 h-9 flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 text-sm rounded-lg disabled:opacity-30 transition">
                                    ‹
                                </button>
                                {getPageNumbers().map((item, idx) =>
                                    item === "..." ? (
                                        <span key={"d" + idx} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">…</span>
                                    ) : (
                                        <button key={item} onClick={() => setCurrentPage(item)}
                                            className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg transition ${
                                                currentPage === item
                                                    ? "bg-violet-600 text-white border-2 border-violet-600"
                                                    : "border border-slate-200 bg-slate-50 hover:bg-violet-50 hover:border-violet-300 text-slate-500"
                                            }`}>
                                            {item}
                                        </button>
                                    )
                                )}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-9 h-9 flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg disabled:opacity-30 transition">
                                    ›
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── VIEW ONLY DETAIL MODAL ── */}
            {showModal && selectedRequest && (
                <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4"
                    onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-violet-800 to-indigo-700 px-6 py-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-white font-bold text-base">Reschedule Request Details</h2>
                                <p className="text-violet-300 text-xs mt-0.5">View only — managed by the doctor</p>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="text-white/60 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition">
                                <FaTimes size={15} />
                            </button>
                        </div>

                        {/* Status strip */}
                        <div className={`px-6 py-2.5 flex items-center justify-between border-b border-slate-100 ${
                            selectedRequest.status === "PENDING"  ? "bg-amber-50"   :
                            selectedRequest.status === "APPROVED" ? "bg-emerald-50" : "bg-red-50"
                        }`}>
                            <span className={`text-xs font-bold flex items-center gap-1.5 ${statusBadge(selectedRequest.status).split(" ")[1]}`}>
                                {selectedRequest.status === "PENDING"  && <FaClock size={10} />}
                                {selectedRequest.status === "APPROVED" && <FaCheckCircle size={10} />}
                                {selectedRequest.status === "REJECTED" && <FaTimesCircle size={10} />}
                                {selectedRequest.status}
                            </span>
                            <span className="text-xs text-slate-400">
                                Requested: {new Date(selectedRequest.createdAt).toLocaleDateString("en-GB")}
                            </span>
                        </div>

                        <div className="p-6 space-y-4">

                            {/* Patient */}
                            {selectedRequest.requested_by && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Patient</p>
                                    <p className="text-sm text-slate-700">
                                        <span className="font-semibold">Name:</span> {selectedRequest.requested_by?.patient_name || "—"}
                                    </p>
                                    <p className="text-sm text-slate-700 mt-1">
                                        <span className="font-semibold">Email:</span> {selectedRequest.requested_by?.patient_email || "—"}
                                    </p>
                                </div>
                            )}

                            {/* Doctor */}
                            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FaUserMd size={10} /> Doctor
                                </p>
                                <p className="text-sm text-slate-700">
                                    <span className="font-semibold">Name:</span> {selectedRequest.appointment_id?.doctor_id?.name || "—"}
                                </p>
                                <p className="text-sm text-slate-700 mt-1">
                                    <span className="font-semibold">Specialization:</span> {selectedRequest.appointment_id?.doctor_id?.specialization || "—"}
                                </p>
                            </div>

                            {/* Original Appointment */}
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FaCalendarAlt size={10} /> Original Appointment
                                </p>
                                <p className="text-sm text-slate-700">
                                    <span className="font-semibold">Date:</span> {formatDate(selectedRequest.appointment_id?.appointment_date)}
                                </p>
                                <p className="text-sm text-slate-700 mt-1">
                                    <span className="font-semibold">Time:</span> {selectedRequest.appointment_id?.start_time || "—"}
                                    {selectedRequest.appointment_id?.end_time ? ` – ${selectedRequest.appointment_id.end_time}` : ""}
                                </p>
                            </div>

                            {/* Preferred Slot */}
                            {(selectedRequest.preferred_date || selectedRequest.preferred_start_time) && (
                                <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                                    <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <FaClock size={10} /> Patient's Preferred Slot
                                    </p>
                                    <p className="text-sm text-slate-700">
                                        <span className="font-semibold">Date:</span> {selectedRequest.preferred_date || "—"}
                                    </p>
                                    <p className="text-sm text-slate-700 mt-1">
                                        <span className="font-semibold">Time:</span> {selectedRequest.preferred_start_time || "—"}
                                        {selectedRequest.preferred_end_time ? ` – ${selectedRequest.preferred_end_time}` : ""}
                                    </p>
                                </div>
                            )}

                            {/* Reason */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FaCommentAlt size={10} /> Reason
                                </p>
                                <p className="text-sm text-slate-700">
                                    {selectedRequest.reason || <span className="italic text-slate-400">No reason provided</span>}
                                </p>
                            </div>

                            {/* Info note */}
                            <div className="px-3 py-2 bg-slate-100 rounded-xl">
                                <span className="text-xs text-slate-500">
                                    ℹ️ Reschedule actions are handled by the assigned doctor from their dashboard.
                                </span>
                            </div>
                        </div>

                        {/* Close only */}
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

export default RescheduleRequests;