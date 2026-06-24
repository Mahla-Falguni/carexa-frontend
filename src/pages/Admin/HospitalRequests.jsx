import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    FaHospital, FaCheckCircle, FaTimesCircle,
    FaClock, FaSearch, FaEnvelope, FaPhone
} from "react-icons/fa";

const HospitalRequests = () => {

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [actionLoading, setActionLoading] = useState(null);

    // ── PAGINATION ──────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const token = localStorage.getItem("adminToken");

    const getRequests = async () => {
        try {
            const res = await axios.get(
                "https://carexa-backend.vercel.app/adminapi/HospitalRequests",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRequests(res.data.data || []);
        } catch (error) {
            console.log("Fetch Requests Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { getRequests(); }, []);

    const handleAction = async (id, status) => {
        const isApprove = status === "APPROVED";

        const confirm = await Swal.fire({
            title: isApprove ? "Approve Request?" : "Reject Request?",
            text: isApprove
                ? "This hospital will be approved and granted access."
                : "This hospital request will be rejected.",
            icon: isApprove ? "question" : "warning",
            showCancelButton: true,
            confirmButtonColor: isApprove ? "#16a34a" : "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: isApprove ? "Yes, Approve" : "Yes, Reject"
        });

        if (!confirm.isConfirmed) return;

        setActionLoading(id + status);
        try {
            await axios.post(
                `https://carexa-backend.vercel.app/adminapi/approve_hospital_request/${id}`,
                { request_status: status },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire({
                icon: "success",
                title: isApprove ? "Approved!" : "Rejected!",
                timer: 1500,
                showConfirmButton: false
            });

            getRequests();
        } catch (error) {
            Swal.fire("Error", error?.response?.data?.message || "Action failed", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const statusBadge = (status) => {
        const map = {
            PENDING:  { cls: "bg-amber-100 text-amber-700 border-amber-200",       icon: <FaClock size={9} />,        label: "Pending"  },
            APPROVED: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <FaCheckCircle size={9} />,  label: "Approved" },
            REJECTED: { cls: "bg-red-100 text-red-600 border-red-200",             icon: <FaTimesCircle size={9} />,  label: "Rejected" },
        };
        return map[status] || map.PENDING;
    };

    const counts = {
        ALL:      requests.length,
        PENDING:  requests.filter(r => r.request_status === "PENDING").length,
        APPROVED: requests.filter(r => r.request_status === "APPROVED").length,
        REJECTED: requests.filter(r => r.request_status === "REJECTED").length,
    };

    const filtered = requests.filter(r => {
        const matchStatus = filterStatus === "ALL" || r.request_status === filterStatus;
        const q = searchQuery.toLowerCase();
        const matchSearch =
            r.hospital_name?.toLowerCase().includes(q) ||
            r.hospital_email?.toLowerCase().includes(q) ||
            r.hospital_phone?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    // ── PAGINATION LOGIC ────────────────────────────
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Reset to page 1 whenever search or filter changes
    const handleSearch = (val) => { setSearchQuery(val); setCurrentPage(1); };
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
                <p className="text-gray-500 font-medium">Loading requests...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 p-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .req-page { font-family: 'DM Sans', sans-serif; }
                .page-title { font-family: 'Playfair Display', serif; }
                .card-row { transition: all 0.15s ease; border-left: 3px solid transparent; }
                .card-row:hover { background: #eff6ff; border-left-color: #3b82f6; transform: translateX(2px); }
                .btn-approve { background: linear-gradient(135deg, #16a34a, #15803d); transition: all 0.2s; }
                .btn-approve:hover:not(:disabled) { box-shadow: 0 4px 15px rgba(22,163,74,0.35); transform: translateY(-1px); }
                .btn-reject  { background: linear-gradient(135deg, #dc2626, #b91c1c); transition: all 0.2s; }
                .btn-reject:hover:not(:disabled)  { box-shadow: 0 4px 15px rgba(220,38,38,0.3);  transform: translateY(-1px); }
                .filter-tab { transition: all 0.15s; cursor: pointer; }
                .filter-tab.active { background: #2563eb; color: white; }
                .filter-tab:not(.active):hover { background: #dbeafe; color: #2563eb; }
            `}</style>

            <div className="req-page max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="page-title text-3xl text-slate-800 mb-1">Hospital Requests</h1>
                        <p className="text-slate-500 text-sm">Review and approve hospital registration requests</p>
                    </div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold border border-amber-200 self-start">
                        <FaClock size={12} /> {counts.PENDING} Pending
                    </span>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total",    count: counts.ALL,      color: "bg-blue-100",    icon: <FaHospital className="text-blue-600" size={16} /> },
                        { label: "Pending",  count: counts.PENDING,  color: "bg-amber-100",   icon: <FaClock className="text-amber-600" size={16} /> },
                        { label: "Approved", count: counts.APPROVED, color: "bg-emerald-100", icon: <FaCheckCircle className="text-emerald-600" size={16} /> },
                        { label: "Rejected", count: counts.REJECTED, color: "bg-red-100",     icon: <FaTimesCircle className="text-red-500" size={16} /> },
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
                        <div className="flex gap-2">
                            {["ALL", "PENDING", "APPROVED", "REJECTED"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleFilter(s)}
                                    className={`filter-tab px-3 py-1.5 rounded-lg text-xs font-semibold ${filterStatus === s ? "active" : "text-slate-500 bg-slate-100"}`}
                                >
                                    {s} <span className="ml-1 opacity-70">({counts[s]})</span>
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                            <input
                                type="text"
                                placeholder="Search by name, email or phone..."
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
                            />
                        </div>

                        <button
                            onClick={getRequests}
                            className="text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition font-medium shrink-0"
                        >
                            Refresh
                        </button>
                    </div>

                    {/* Table */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                                <FaHospital className="text-blue-300" size={28} />
                            </div>
                            <p className="text-slate-600 font-semibold text-lg">No requests found</p>
                            <p className="text-slate-400 text-sm mt-1">No hospital requests match your filter</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospital</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {/* ── Use paginated instead of filtered ── */}
                                    {paginated.map((hospital, index) => {
                                        const badge = statusBadge(hospital.request_status);
                                        return (
                                            <tr key={hospital._id} className="card-row">
                                                {/* Row number accounts for current page offset */}
                                                <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                                                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                                </td>

                                                {/* Hospital */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                                            <FaHospital size={14} className="text-blue-600" />
                                                        </div>
                                                        <p className="text-sm font-semibold text-slate-700">{hospital.hospital_name}</p>
                                                    </div>
                                                </td>

                                                {/* Email */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <FaEnvelope size={11} className="text-slate-400" />
                                                        {hospital.hospital_email}
                                                    </div>
                                                </td>

                                                {/* Phone */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <FaPhone size={11} className="text-slate-400" />
                                                        {hospital.hospital_phone || "—"}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${badge.cls}`}>
                                                        {badge.icon} {badge.label}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleAction(hospital._id, "APPROVED")}
                                                            disabled={hospital.request_status === "APPROVED" || actionLoading === hospital._id + "APPROVED"}
                                                            className="btn-approve flex items-center gap-1.5 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                                                        >
                                                            <FaCheckCircle size={11} /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(hospital._id, "REJECTED")}
                                                            disabled={hospital.request_status === "REJECTED" || actionLoading === hospital._id + "REJECTED"}
                                                            className="btn-reject flex items-center gap-1.5 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                                                        >
                                                            <FaTimesCircle size={11} /> Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── PAGINATION ── */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} requests
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
        </div>
    );
};

export default HospitalRequests;