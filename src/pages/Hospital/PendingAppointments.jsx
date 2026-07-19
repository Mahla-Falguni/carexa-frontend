import React, { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";
import {
    FaClock, FaCheckCircle, FaTimesCircle, FaEye,
    FaUserMd, FaUser, FaCalendarAlt, FaHospital, FaSearch
} from "react-icons/fa";

const PendingAppointments = () => {

    const { globalSearch = "" } = useOutletContext() || {};
    const [appointments, setAppointments]       = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal]             = useState(false);
    const [searchQuery, setSearchQuery]         = useState("");
    const [actionLoading, setActionLoading]     = useState(null);

    // ── PAGINATION ──────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const token = localStorage.getItem("HospitalToken");

    const fetchPendingAppointments = async () => {
        try {
            const res = await axios.get(
                "https://carexa-backend.vercel.app/hospitalapi/get-pending-appointments",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAppointments(res.data.appointments || []);
        } catch (error) {
            console.log("Error fetching pending appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPendingAppointments(); }, []);

    const handleApprove = async (id) => {
        const confirm = await Swal.fire({
            title: "Approve Appointment?",
            text: "This will mark the appointment as Scheduled.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Approve"
        });
        if (!confirm.isConfirmed) return;

        setActionLoading(id);
        try {
            await axios.put(
                `https://carexa-backend.vercel.app/hospitalapi/approve-appointment/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.fire({ icon: "success", title: "Approved!", timer: 1500, showConfirmButton: false });
            fetchPendingAppointments();
        } catch (error) {
            Swal.fire("Error", error?.response?.data?.message || "Failed to approve", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        const confirm = await Swal.fire({
            title: "Reject Appointment?",
            text: "This will mark the appointment as Cancelled.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Reject"
        });
        if (!confirm.isConfirmed) return;

        setActionLoading(id);
        try {
            await axios.put(
                `https://carexa-backend.vercel.app/hospitalapi/reject-appointment/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.fire({ icon: "success", title: "Rejected!", timer: 1500, showConfirmButton: false });
            fetchPendingAppointments();
        } catch (error) {
            Swal.fire("Error", error?.response?.data?.message || "Failed to reject", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = appointments.filter(a => {
        const q = (globalSearch || searchQuery).trim().toLowerCase();
        if (!q) return true;
        return (
            (a.patient_id?.patient_name || "").toLowerCase().includes(q) ||
            (a.patient_id?.patient_email || "").toLowerCase().includes(q) ||
            (a.patient_id?.patient_phone || "").includes(q) ||
            (a.doctor_id?.name || "").toLowerCase().includes(q) ||
            (a.doctor_id?.specialization || "").toLowerCase().includes(q) ||
            (a.appointment_date || "").includes(q)
        );
    });

    // ── PAGINATION LOGIC ────────────────────────────
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSearch = (val) => { setSearchQuery(val); setCurrentPage(1); };

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
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading pending appointments...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 p-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .pending-page { font-family: 'DM Sans', sans-serif; }
                .page-title { font-family: 'Playfair Display', serif; }
                .card-row { transition: all 0.15s ease; border-left: 3px solid transparent; }
                .card-row:hover { background: #fffbf0; border-left-color: #f59e0b; transform: translateX(2px); }
                .btn-approve { background: linear-gradient(135deg, #16a34a, #15803d); transition: all 0.2s; }
                .btn-approve:hover { box-shadow: 0 4px 15px rgba(22,163,74,0.35); transform: translateY(-1px); }
                .btn-reject { background: linear-gradient(135deg, #dc2626, #b91c1c); transition: all 0.2s; }
                .btn-reject:hover { box-shadow: 0 4px 15px rgba(220,38,38,0.3); transform: translateY(-1px); }
                .modal-overlay { backdrop-filter: blur(6px); background: rgba(15,23,42,0.6); }
                .stat-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f1f5f9; }
            `}</style>

            <div className="pending-page max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="page-title text-3xl text-slate-800 mb-1">Pending Appointments</h1>
                        <p className="text-slate-500 text-sm">Review and take action on appointment requests</p>
                    </div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold border border-amber-200 self-start">
                        <FaClock size={12} /> {appointments.length} Pending
                    </span>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="stat-card flex items-center gap-4">
                        <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
                            <FaClock className="text-amber-600" size={18} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{appointments.length}</p>
                            <p className="text-xs text-slate-400 font-medium">Total Pending</p>
                        </div>
                    </div>
                    <div className="stat-card flex items-center gap-4">
                        <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <FaCheckCircle className="text-emerald-600" size={18} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">
                                {new Set(appointments.map(a => a.doctor_id?._id)).size}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">Doctors Involved</p>
                        </div>
                    </div>
                    <div className="stat-card flex items-center gap-4">
                        <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FaUser className="text-blue-600" size={18} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">
                                {new Set(appointments.map(a => a.patient_id?._id)).size}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">Unique Patients</p>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                            <input type="text"
                                placeholder="Search by patient, doctor or specialization..."
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-slate-50"
                            />
                        </div>
                        <button onClick={fetchPendingAppointments}
                            className="text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition font-medium">
                            Refresh
                        </button>
                    </div>

                    {/* Table */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
                                <FaCheckCircle className="text-amber-300" size={28} />
                            </div>
                            <p className="text-slate-600 font-semibold text-lg">All caught up!</p>
                            <p className="text-slate-400 text-sm mt-1">No pending appointments found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["#","Patient","Doctor","Date","Time","Status","Actions"].map(h => (
                                            <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginated.map((appt, index) => (
                                        <tr key={appt._id} className="card-row">
                                            <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>
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
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <FaCalendarAlt size={11} className="text-slate-400" />
                                                    {new Date(appt.appointment_date).toLocaleDateString("en-GB")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                                                    <FaClock size={10} />
                                                    {appt.start_time || appt.appointment_time || "—"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                                                    <FaClock size={9} /> {appt.appointment_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => { setSelectedAppointment(appt); setShowModal(true); }} title="View Details"
                                                        className="w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition">
                                                        <FaEye size={13} />
                                                    </button>
                                                    <button onClick={() => handleApprove(appt._id)} disabled={actionLoading === appt._id} title="Approve"
                                                        className="btn-approve w-8 h-8 flex items-center justify-center text-white rounded-lg disabled:opacity-50">
                                                        <FaCheckCircle size={13} />
                                                    </button>
                                                    <button onClick={() => handleReject(appt._id)} disabled={actionLoading === appt._id} title="Reject"
                                                        className="btn-reject w-8 h-8 flex items-center justify-center text-white rounded-lg disabled:opacity-50">
                                                        <FaTimesCircle size={13} />
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
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 text-sm rounded disabled:opacity-30 disabled:cursor-not-allowed transition">&#8249;</button>
                                {getPageNumbers().map((item, idx) =>
                                    item === "..." ? (
                                        <span key={"dots-" + idx} className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm">&#8230;</span>
                                    ) : (
                                        <button key={item} onClick={() => setCurrentPage(item)}
                                            className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded transition ${currentPage === item ? "border-2 border-slate-800 text-slate-800 bg-white font-semibold" : "border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500"}`}>
                                            {item}</button>
                                    )
                                )}
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white text-sm rounded disabled:opacity-30 disabled:cursor-not-allowed transition">&#8250;</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Detail Modal */}
            {showModal && selectedAppointment && (
                <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-white font-bold text-base">Appointment Details</h2>
                                <p className="text-slate-400 text-xs mt-0.5">Full appointment information</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition">
                                <FaTimesCircle size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3 flex items-center gap-2"><FaUser size={10} /> Patient Info</p>
                                <div className="space-y-1.5">
                                    <p className="text-sm text-slate-700"><span className="font-semibold">Name:</span> {selectedAppointment.patient_id?.patient_name || "—"}</p>
                                    <p className="text-sm text-slate-700"><span className="font-semibold">Email:</span> {selectedAppointment.patient_id?.patient_email || "—"}</p>
                                    <p className="text-sm text-slate-700"><span className="font-semibold">Phone:</span> {selectedAppointment.patient_id?.patient_phone || "—"}</p>
                                </div>
                            </div>
                            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-3 flex items-center gap-2"><FaUserMd size={10} /> Doctor Info</p>
                                <div className="space-y-1.5">
                                    <p className="text-sm text-slate-700"><span className="font-semibold">Name:</span> {selectedAppointment.doctor_id?.name || "—"}</p>
                                    <p className="text-sm text-slate-700"><span className="font-semibold">Specialization:</span> {selectedAppointment.doctor_id?.specialization || "—"}</p>
                                </div>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2"><FaCalendarAlt size={10} /> Appointment Info</p>
                                <div className="space-y-1.5">
                                    <p className="text-sm text-slate-700"><span className="font-semibold">Date:</span> {new Date(selectedAppointment.appointment_date).toLocaleDateString("en-GB")}</p>
                                    <p className="text-sm text-slate-700"><span className="font-semibold">Time:</span> {selectedAppointment.start_time || selectedAppointment.appointment_time || "—"}</p>
                                    <p className="text-sm text-slate-700"><span className="font-semibold">Status:</span>
                                        <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-800 text-xs rounded-full font-semibold">
                                            {selectedAppointment.appointment_status}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => { setShowModal(false); handleApprove(selectedAppointment._id); }}
                                className="btn-approve flex-1 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                                <FaCheckCircle size={13} /> Approve
                            </button>
                            <button onClick={() => { setShowModal(false); handleReject(selectedAppointment._id); }}
                                className="btn-reject flex-1 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                                <FaTimesCircle size={13} /> Reject
                            </button>
                            <button onClick={() => setShowModal(false)}
                                className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingAppointments;