import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
    FaCalendarAlt, FaClock, FaHospital, FaUserMd,
    FaSearch, FaTimesCircle, FaCheckCircle,
    FaHourglassHalf, FaSyncAlt, FaBan, FaEye,
    FaArrowRight, FaMapMarkerAlt, FaChevronLeft, FaChevronRight
} from "react-icons/fa";

const PER_PAGE = 5;

/* ─────────────────────────────────────────────
   RESCHEDULE SLOT-PICKER MODAL
───────────────────────────────────────────── */
const RescheduleModal = ({ appt, onClose, onConfirm }) => {
    const [slots, setSlots]               = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [weekOffset, setWeekOffset]     = useState(0);
    const [submitting, setSubmitting]     = useState(false);

    const token   = localStorage.getItem("UserToken");
    const headers = { Authorization: `Bearer ${token}` };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + weekOffset * 7 + i);
        return d;
    });

    const formatDateKey = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const dayLabel   = (d) => d.toLocaleDateString("en-US", { weekday: "short" });
    const monthLabel = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    useEffect(() => {
        if (!selectedDate || !appt?.doctor_id?._id) return;
        setSlots([]); setSelectedSlot(null); setLoadingSlots(true);
        axios.get(`http://localhost:5000/api/available-slots`, {
            params: { doctorId: appt.doctor_id._id, date: formatDateKey(selectedDate) }, headers,
        }).then(res => setSlots(res.data.slots || [])).catch(() => setSlots([])).finally(() => setLoadingSlots(false));
    }, [selectedDate]);

    const handleConfirm = async () => {
        if (!selectedDate || !selectedSlot) return;
        setSubmitting(true);
        try {
            await onConfirm({ appointmentId: appt._id, preferredDate: formatDateKey(selectedDate), preferredStartTime: selectedSlot.start_time, preferredEndTime: selectedSlot.end_time });
        } finally { setSubmitting(false); }
    };

    const isToday  = (d) => formatDateKey(d) === formatDateKey(new Date());
    const isPastDay = (d) => { const t = new Date(); t.setHours(0,0,0,0); return d < t; };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter:"blur(10px)", background:"rgba(10,20,45,0.65)" }} onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                style={{ maxHeight:"90vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5 flex justify-between items-start">
                    <div>
                        <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Reschedule Appointment</p>
                        <h2 className="text-white font-bold text-lg">{appt.doctor_id?.name || "Doctor"}</h2>
                        {appt.doctor_id?.specialization && <p className="text-blue-200 text-sm mt-0.5">{appt.doctor_id.specialization}</p>}
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition">✕</button>
                </div>
                <div className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold text-slate-700"><FaCalendarAlt className="inline mr-1.5 text-blue-500" size={13}/>Select a Date</p>
                            <div className="flex items-center gap-2">
                                <button disabled={weekOffset===0} onClick={() => { setWeekOffset(w=>w-1); setSelectedDate(null); }}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs transition ${weekOffset===0?"border-slate-100 text-slate-300 cursor-not-allowed":"border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-500"}`}>
                                    <FaChevronLeft size={10}/>
                                </button>
                                <span className="text-xs text-slate-500 font-medium">{monthLabel(weekDays[0])} – {monthLabel(weekDays[6])}</span>
                                <button onClick={() => { setWeekOffset(w=>w+1); setSelectedDate(null); }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-500 transition text-xs">
                                    <FaChevronRight size={10}/>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1.5">
                            {weekDays.map(d => {
                                const past = isPastDay(d);
                                const selected = selectedDate && formatDateKey(d) === formatDateKey(selectedDate);
                                return (
                                    <button key={formatDateKey(d)} disabled={past} onClick={() => setSelectedDate(d)}
                                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-center transition border
                                            ${past?"bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed":""}
                                            ${!past && !selected?"bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600":""}
                                            ${selected?"bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200":""}`}>
                                        <span className="text-xs font-semibold leading-none mb-1">{dayLabel(d)}</span>
                                        <span className="text-sm font-bold leading-none">{d.getDate()}</span>
                                        {isToday(d) && !selected && <span className="w-1 h-1 rounded-full bg-blue-500 mt-1"/>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {selectedDate && (
                        <div className="mb-6">
                            <p className="text-sm font-bold text-slate-700 mb-3">
                                <FaClock className="inline mr-1.5 text-blue-500" size={13}/>
                                Available Slots for <span className="text-blue-600">{selectedDate.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</span>
                            </p>
                            {loadingSlots ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-7 h-7 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                                    <span className="ml-3 text-sm text-slate-400">Fetching slots…</span>
                                </div>
                            ) : slots.length === 0 ? (
                                <div className="bg-slate-50 rounded-xl border border-slate-100 py-8 text-center">
                                    <FaTimesCircle className="text-slate-300 mx-auto mb-2" size={24}/>
                                    <p className="text-sm text-slate-500 font-medium">No slots available on this date</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {slots.map((slot, idx) => {
                                        const isSel = selectedSlot?.start_time===slot.start_time && selectedSlot?.end_time===slot.end_time;
                                        return (
                                            <button key={idx} onClick={() => setSelectedSlot(slot)}
                                                className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition text-center
                                                    ${isSel?"bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200":"bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"}`}>
                                                {slot.start_time}
                                                <span className={`block text-center ${isSel?"text-blue-200":"text-slate-400"}`}>– {slot.end_time}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                    {selectedDate && selectedSlot && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 flex items-start gap-3">
                            <FaCheckCircle className="text-blue-500 mt-0.5 shrink-0" size={15}/>
                            <div className="text-sm">
                                <p className="font-semibold text-blue-800">Your preferred slot</p>
                                <p className="text-blue-600 mt-0.5">
                                    {selectedDate.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})} &bull; {selectedSlot.start_time} – {selectedSlot.end_time}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold transition">Cancel</button>
                        <button disabled={!selectedDate || !selectedSlot || submitting} onClick={handleConfirm}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition
                                ${selectedDate && selectedSlot && !submitting?"bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200":"bg-blue-100 text-blue-300 cursor-not-allowed"}`}>
                            {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Sending…</> : <><FaSyncAlt size={11}/> Send Request</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const MyAppointments = () => {
    const [appointments, setAppointments]   = useState([]);
    const [loading, setLoading]             = useState(true);
    const [search, setSearch]               = useState("");
    const [filterStatus, setFilterStatus]   = useState("ALL");
    const [selectedAppt, setSelectedAppt]   = useState(null);
    const [showModal, setShowModal]         = useState(false);
    const [pendingReschedules, setPendingReschedules] = useState(new Set());
    const [rescheduleAppt, setRescheduleAppt]         = useState(null);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [page, setPage]                   = useState(1);

    const navigate = useNavigate();
    const token    = localStorage.getItem("UserToken");
    const headers  = { Authorization: `Bearer ${token}` };

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const [apptRes, reschedRes] = await Promise.all([
                axios.get("http://localhost:5000/api/MyAppointment", { headers }),
                axios.get("http://localhost:5000/api/my-reschedule-requests", { headers }).catch(() => ({ data: { requests: [] } }))
            ]);
            setAppointments(apptRes.data.appointments || []);
            const pendingSet = new Set(
                (reschedRes.data.requests || []).filter(r => r.status==="PENDING").map(r => r.appointment_id?._id || r.appointment_id)
            );
            setPendingReschedules(pendingSet);
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAppointments(); }, []);
    useEffect(() => { setPage(1); }, [search, filterStatus]);

    const statusConfig = {
        PENDING:     { label:"Pending",     color:"bg-amber-100 text-amber-700 border-amber-200",     icon:<FaHourglassHalf size={10}/> },
        SCHEDULED:   { label:"Scheduled",   color:"bg-blue-100 text-blue-700 border-blue-200",        icon:<FaCalendarAlt size={10}/> },
        COMPLETED:   { label:"Completed",   color:"bg-emerald-100 text-emerald-700 border-emerald-200",icon:<FaCheckCircle size={10}/> },
        CANCELLED:   { label:"Cancelled",   color:"bg-red-100 text-red-600 border-red-200",           icon:<FaBan size={10}/> },
        RESCHEDULED: { label:"Rescheduled", color:"bg-violet-100 text-violet-700 border-violet-200",  icon:<FaSyncAlt size={10}/> },
    };

    const counts = {
        ALL:         appointments.length,
        PENDING:     appointments.filter(a=>a.appointment_status==="PENDING").length,
        SCHEDULED:   appointments.filter(a=>a.appointment_status==="SCHEDULED").length,
        COMPLETED:   appointments.filter(a=>a.appointment_status==="COMPLETED").length,
        CANCELLED:   appointments.filter(a=>a.appointment_status==="CANCELLED").length,
        RESCHEDULED: appointments.filter(a=>a.appointment_status==="RESCHEDULED").length,
    };

    const filtered = appointments.filter(a => {
        const matchStatus = filterStatus==="ALL" || a.appointment_status===filterStatus;
        const q = search.toLowerCase();
        return matchStatus && (
            a.doctor_id?.name?.toLowerCase().includes(q) ||
            a.hospital_id?.hospital_name?.toLowerCase().includes(q) ||
            a.doctor_id?.specialization?.toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
    const isPast = (appt) => new Date(appt.appointment_date) < new Date();

    const handleReschedule = (appt) => { setRescheduleAppt(appt); setShowRescheduleModal(true); setShowModal(false); };

    const handleRescheduleConfirm = async ({ appointmentId, preferredDate, preferredStartTime, preferredEndTime }) => {
        try {
            await axios.post("http://localhost:5000/api/Request-Reschedule", { appointmentId, preferredDate, preferredStartTime, preferredEndTime }, { headers });
            setPendingReschedules(prev => new Set([...prev, appointmentId]));
            setShowRescheduleModal(false); setRescheduleAppt(null);
            Swal.fire({ icon:"success", title:"Request Sent!", text:`Reschedule requested for ${preferredDate} at ${preferredStartTime}.`, timer:2500, showConfirmButton:false });
            fetchAppointments();
        } catch (err) { Swal.fire("Error", err?.response?.data?.message || "Failed to request reschedule", "error"); }
    };

    const handleCancel = async (appt) => {
        const confirm = await Swal.fire({ title:"Cancel Appointment?", text:"This will be permanently cancelled.", icon:"warning", showCancelButton:true, confirmButtonColor:"#dc2626", cancelButtonColor:"#6b7280", confirmButtonText:"Yes, Cancel It" });
        if (!confirm.isConfirmed) return;
        try {
            await axios.post("http://localhost:5000/api/cancel-appointment", { appointmentId:appt._id }, { headers });
            Swal.fire({ icon:"success", title:"Appointment Cancelled!", timer:1500, showConfirmButton:false });
            fetchAppointments();
        } catch (err) { Swal.fire("Error", err?.response?.data?.message || "Failed to cancel", "error"); }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
                <p className="text-slate-400 text-sm">Loading your appointments...</p>
            </div>
        </div>
    );

    // Pagination page numbers
    const getPages = () => {
        return Array.from({length:totalPages},(_,i)=>i+1)
            .filter(n=>n===1||n===totalPages||Math.abs(n-page)<=1)
            .reduce((acc,n,idx,arr)=>{ if(idx>0&&arr[idx-1]!==n-1) acc.push("…"); acc.push(n); return acc; },[]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .appt-page { font-family:'DM Sans',sans-serif; }
                .page-title { font-family:'Playfair Display',serif; }
                .appt-card { transition:all 0.2s ease; border-left:3px solid transparent; }
                .appt-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(11,29,58,0.08); border-left-color:#2f80ed; }
                .filter-tab { transition:all 0.15s; cursor:pointer; font-size:11px; font-weight:600; padding:5px 12px; border-radius:20px; border:1.5px solid transparent; }
                .filter-tab.active { background:#2563eb; color:white; border-color:#2563eb; }
                .filter-tab:not(.active) { background:white; color:#5a7294; border-color:#e2e8f0; }
                .filter-tab:not(.active):hover { border-color:#2563eb; color:#2563eb; }
                .pg-btn { transition:all 0.12s; }
                .pg-btn:hover:not(:disabled) { border-color:#2563eb!important; color:#2563eb!important; }
            `}</style>

            {/* ── full-width, no side margins ── */}
            <div className="appt-page w-full px-4 py-6">

                {/* Header */}
                <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="page-title text-2xl text-slate-800 mb-0.5">My Appointments</h1>
                        <p className="text-slate-400 text-xs">{appointments.length} total · showing {filtered.length} filtered</p>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-6 gap-2 mb-4">
                    {[
                        { key:"ALL",         label:"Total",       bg:"bg-slate-50",   text:"text-slate-700",   border:"border-slate-200" },
                        { key:"PENDING",     label:"Pending",     bg:"bg-amber-50",   text:"text-amber-700",   border:"border-amber-200" },
                        { key:"SCHEDULED",   label:"Scheduled",   bg:"bg-blue-50",    text:"text-blue-700",    border:"border-blue-200" },
                        { key:"COMPLETED",   label:"Completed",   bg:"bg-emerald-50", text:"text-emerald-700", border:"border-emerald-200" },
                        { key:"CANCELLED",   label:"Cancelled",   bg:"bg-red-50",     text:"text-red-600",     border:"border-red-200" },
                        { key:"RESCHEDULED", label:"Rescheduled", bg:"bg-violet-50",  text:"text-violet-700",  border:"border-violet-200" },
                    ].map(({ key, label, bg, text, border }) => (
                        <div key={key} onClick={() => setFilterStatus(key)}
                            className={`${bg} border ${border} rounded-xl p-2.5 text-center cursor-pointer transition hover:shadow-sm ${filterStatus===key?"ring-2 ring-blue-400 ring-offset-1":""}`}>
                            <p className={`text-lg font-bold ${text}`}>{counts[key]??0}</p>
                            <p className={`text-[10px] font-semibold ${text} opacity-80`}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Search + Filter bar */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 mb-4 flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-40">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12}/>
                        <input type="text" placeholder="Search by doctor, hospital or specialization..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"/>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {["ALL","PENDING","SCHEDULED","COMPLETED","CANCELLED","RESCHEDULED"].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)} className={`filter-tab ${filterStatus===s?"active":""}`}>{s}</button>
                        ))}
                    </div>
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-16 text-center">
                        <FaCalendarAlt className="text-slate-300 mb-3" size={36}/>
                        <p className="text-slate-600 font-semibold">No appointments found</p>
                        <p className="text-slate-400 text-sm mt-1 mb-5">{search ? `No results for "${search}"` : "You haven't booked any appointments yet"}</p>
                        <button onClick={() => navigate("/hospitals")}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition">
                            Find a Hospital <FaArrowRight size={11}/>
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2.5">
                            {paginated.map(appt => {
                                const sc   = statusConfig[appt.appointment_status] || statusConfig.PENDING;
                                const past = isPast(appt);
                                return (
                                    <div key={appt._id} className="appt-card bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-4">
                                        <div className="flex items-center gap-4">
                                            {/* Date block */}
                                            <div className="shrink-0 w-14 h-14 bg-blue-600 rounded-xl flex flex-col items-center justify-center text-white shadow-md shadow-blue-200">
                                                <span className="text-base font-bold leading-none">{new Date(appt.appointment_date).getDate().toString().padStart(2,"0")}</span>
                                                <span className="text-[10px] font-medium opacity-80">{new Date(appt.appointment_date).toLocaleString("en-GB",{month:"short"})}</span>
                                                <span className="text-[10px] opacity-70">{new Date(appt.appointment_date).getFullYear()}</span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <p className="font-bold text-slate-800 text-sm">{appt.doctor_id?.name || "Doctor"}</p>
                                                    {appt.doctor_id?.specialization && (
                                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{appt.doctor_id.specialization}</span>
                                                    )}
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${sc.color}`}>{sc.icon} {sc.label}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1"><FaHospital size={9} className="text-slate-400"/>{appt.hospital_id?.hospital_name||"—"}</span>
                                                    <span className="flex items-center gap-1"><FaClock size={9} className="text-slate-400"/>{appt.start_time} – {appt.end_time}</span>
                                                    {appt.hospital_id?.hospital_address && <span className="flex items-center gap-1"><FaMapMarkerAlt size={9} className="text-slate-400"/>{appt.hospital_id.hospital_address}</span>}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button onClick={() => { setSelectedAppt(appt); setShowModal(true); }}
                                                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition">
                                                    <FaEye size={10}/> View
                                                </button>
                                                {["PENDING","SCHEDULED"].includes(appt.appointment_status) && !past && (
                                                    <>
                                                        {pendingReschedules.has(appt._id) ? (
                                                            <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 text-xs font-semibold rounded-lg">
                                                                <FaHourglassHalf size={9}/> Pending
                                                            </span>
                                                        ) : (
                                                            <button onClick={() => handleReschedule(appt)}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm shadow-blue-200">
                                                                <FaSyncAlt size={9}/> Reschedule
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleCancel(appt)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-lg transition">
                                                            <FaBan size={9}/> Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
                                <p className="text-xs text-slate-400 font-medium">
                                    Showing <span className="text-slate-600 font-semibold">{(page-1)*PER_PAGE+1}</span>–<span className="text-slate-600 font-semibold">{Math.min(page*PER_PAGE,filtered.length)}</span> of <span className="text-slate-600 font-semibold">{filtered.length}</span> appointments
                                </p>
                                <div className="flex items-center gap-1">
                                    <button className="pg-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}
                                        style={{ width:30, height:30, borderRadius:8, border:"1.5px solid #e2e8f0", background:page===1?"#f8fafc":"#fff", color:page===1?"#cbd5e1":"#475569", cursor:page===1?"not-allowed":"pointer", fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
                                    {getPages().map((item,idx) =>
                                        item==="…" ? (
                                            <span key={`d${idx}`} style={{width:30,textAlign:"center",fontSize:12,color:"#94a3b8"}}>…</span>
                                        ) : (
                                            <button key={item} className="pg-btn" onClick={() => setPage(item)}
                                                style={{ width:30, height:30, borderRadius:8, border:page===item?"2px solid #2563eb":"1.5px solid #e2e8f0", background:page===item?"#2563eb":"#fff", color:page===item?"#fff":"#475569", cursor:"pointer", fontWeight:700, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                                {item}
                                            </button>
                                        )
                                    )}
                                    <button className="pg-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}
                                        style={{ width:30, height:30, borderRadius:8, border:"1.5px solid #e2e8f0", background:page===totalPages?"#f8fafc":"#fff", color:page===totalPages?"#cbd5e1":"#475569", cursor:page===totalPages?"not-allowed":"pointer", fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Detail Modal */}
            {showModal && selectedAppt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backdropFilter:"blur(8px)", background:"rgba(15,23,42,0.60)" }} onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5 flex justify-between items-start">
                            <div>
                                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Appointment Details</p>
                                <h2 className="text-white font-bold text-lg">{selectedAppt.doctor_id?.name||"Doctor"}</h2>
                                {selectedAppt.doctor_id?.specialization && <p className="text-blue-200 text-sm mt-0.5">{selectedAppt.doctor_id.specialization}</p>}
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition">✕</button>
                        </div>
                        <div className={`px-6 py-2 flex items-center gap-2 text-xs font-semibold ${statusConfig[selectedAppt.appointment_status]?.color||""}`} style={{ borderBottom:"1px solid #f1f5f9" }}>
                            {statusConfig[selectedAppt.appointment_status]?.icon} Status: {statusConfig[selectedAppt.appointment_status]?.label}
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-3">
                            {[
                                { label:"Date",     icon:<FaCalendarAlt size={12} className="text-blue-500"/>, value:formatDate(selectedAppt.appointment_date) },
                                { label:"Time",     icon:<FaClock size={12} className="text-blue-500"/>,        value:`${selectedAppt.start_time} – ${selectedAppt.end_time}` },
                                { label:"Hospital", icon:<FaHospital size={12} className="text-blue-500"/>,     value:selectedAppt.hospital_id?.hospital_name||"—" },
                                { label:"Doctor",   icon:<FaUserMd size={12} className="text-blue-500"/>,      value:selectedAppt.doctor_id?.name||"—" },
                                { label:"Address",  icon:<FaMapMarkerAlt size={12} className="text-blue-500"/>,value:selectedAppt.hospital_id?.hospital_address||"—" },
                                { label:"Phone",    icon:<FaHospital size={12} className="text-blue-500"/>,    value:selectedAppt.hospital_id?.hospital_phone||"—" },
                            ].map(({ label, icon, value }) => (
                                <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">{icon} {label}</p>
                                    <p className="text-sm font-semibold text-slate-700">{value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 pb-6 flex flex-col gap-3">
                            {["PENDING","SCHEDULED"].includes(selectedAppt.appointment_status) && !isPast(selectedAppt) && (
                                <div className="flex gap-3">
                                    {pendingReschedules.has(selectedAppt._id) ? (
                                        <div className="flex-1 flex items-center justify-center gap-2 bg-amber-50 text-amber-600 border border-amber-200 py-2.5 rounded-xl text-sm font-semibold">
                                            <FaHourglassHalf size={13}/> Reschedule Request Sent
                                        </div>
                                    ) : (
                                        <button onClick={() => handleReschedule(selectedAppt)} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                                            <FaSyncAlt size={12}/> Reschedule
                                        </button>
                                    )}
                                    <button onClick={() => { setShowModal(false); handleCancel(selectedAppt); }} className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                                        <FaBan size={12}/> Cancel Appointment
                                    </button>
                                </div>
                            )}
                            <button onClick={() => setShowModal(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold transition">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showRescheduleModal && rescheduleAppt && (
                <RescheduleModal appt={rescheduleAppt} onClose={() => { setShowRescheduleModal(false); setRescheduleAppt(null); }} onConfirm={handleRescheduleConfirm}/>
            )}
        </div>
    );
};

export default MyAppointments;