import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    FaStar, FaRegStar, FaSearch, FaCheckCircle,
    FaCalendarAlt, FaClock, FaStethoscope,
    FaHospital, FaTimes, FaEdit, FaFilter
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

const BASE  = "http://localhost:5000/api";
const hdrs  = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("UserToken")}` } });
const COLOR = "#2563eb";
const PER_PAGE = 5;

const fmt = (d) => d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

// ── Paginator ─────────────────────────────────────────────────────────────────
const Paginator = ({ page, totalPages, total, label, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
        .reduce((acc, n, idx, arr) => {
            if (idx > 0 && arr[idx - 1] !== n - 1) acc.push("…");
            acc.push(n); return acc;
        }, []);

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", flexWrap: "wrap", gap: 10 }}>
            <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, margin: 0 }}>
                Showing <span style={{ color: "#475569", fontWeight: 700 }}>{total === 0 ? 0 : (page - 1) * PER_PAGE + 1}</span>–
                <span style={{ color: "#475569", fontWeight: 700 }}>{Math.min(page * PER_PAGE, total)}</span> of{" "}
                <span style={{ color: "#475569", fontWeight: 700 }}>{total}</span> {label}
            </p>
            <div style={{ display: "flex", gap: 5 }}>
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

// ── Star Rating Input ─────────────────────────────────────────────────────────
const StarInput = ({ value, onChange, size = 28 }) => (
    <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => onChange(n)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2, transition: "transform 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                {n <= value ? <FaStar size={size} color="#f59e0b"/> : <FaRegStar size={size} color="#d1d5db"/>}
            </button>
        ))}
    </div>
);

// ── Star Display ──────────────────────────────────────────────────────────────
const Stars = ({ rating, size = 12 }) => (
    <div style={{ display: "flex", gap: 2 }}>
        {[1,2,3,4,5].map(n => (
            n <= rating
                ? <FaStar key={n} size={size} color="#f59e0b"/>
                : <FaRegStar key={n} size={size} color="#d1d5db"/>
        ))}
    </div>
);

// ── Submit Modal ──────────────────────────────────────────────────────────────
const FeedbackModal = ({ appt, onClose, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [text,   setText]   = useState("");
    const [saving, setSaving] = useState(false);

    const LABELS = { 1:"Poor", 2:"Fair", 3:"Good", 4:"Very Good", 5:"Excellent" };
    const COLORS = { 1:"#dc2626", 2:"#d97706", 3:"#0891b2", 4:"#059669", 5:"#7c3aed" };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return Swal.fire("Missing", "Please write your feedback", "warning");
        setSaving(true);
        try {
            const res = await axios.post(`${BASE}/submit-feedback`, {
                appointment_id: appt._id,
                rating,
                feedback_text: text.trim()
            }, hdrs());
            onSuccess(res.data.feedback);
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed to submit", "error");
        } finally { setSaving(false); }
    };

    const onFocus = e => (e.target.style.borderColor = COLOR);
    const onBlur  = e => (e.target.style.borderColor = "#e2e8f0");

    return (
        <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(8px)", background:"rgba(15,23,42,0.65)" }}
            onClick={onClose}>
            <div style={{ background:"#fff", borderRadius:20, boxShadow:"0 24px 64px rgba(0,0,0,0.2)", width:"100%", maxWidth:480, overflow:"hidden" }}
                onClick={e => e.stopPropagation()}>

                <div style={{ background:`linear-gradient(135deg, ${COLOR}, #1e40af)`, padding:"20px 24px", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                    <div>
                        <p style={{ color:"rgba(255,255,255,0.65)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 3px" }}>Submit Feedback</p>
                        <h2 style={{ color:"#fff", fontWeight:800, fontSize:17, margin:"0 0 3px" }}>{appt?.doctor_id?.name || "Doctor"}</h2>
                        <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, margin:0 }}>
                            {appt?.doctor_id?.specialization} · {fmt(appt?.appointment_date)} at {appt?.start_time}
                        </p>
                    </div>
                    <button onClick={onClose}
                        style={{ background:"rgba(255,255,255,0.12)", border:"none", color:"rgba(255,255,255,0.7)", width:32, height:32, borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <FaTimes size={14}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding:24 }}>
                    <div style={{ textAlign:"center", marginBottom:24 }}>
                        <p style={{ fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em", margin:"0 0 14px" }}>
                            Rate your experience
                        </p>
                        <StarInput value={rating} onChange={setRating} size={36}/>
                        <div style={{ marginTop:10, display:"inline-flex", alignItems:"center", gap:6, background:COLORS[rating]+"15", border:`1px solid ${COLORS[rating]}30`, borderRadius:20, padding:"4px 14px" }}>
                            <span style={{ fontSize:13, fontWeight:800, color:COLORS[rating] }}>{LABELS[rating]}</span>
                            <span style={{ fontSize:11, color:"#64748b" }}>({rating}/5)</span>
                        </div>
                    </div>

                    <div style={{ marginBottom:22 }}>
                        <label style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:8 }}>
                            Your Feedback *
                        </label>
                        <textarea value={text} onChange={e => setText(e.target.value)}
                            placeholder="Share your experience with the doctor and the appointment…"
                            rows={4} required
                            style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"1.5px solid #e2e8f0", fontSize:13, fontFamily:"Nunito,sans-serif", color:"#334155", background:"#f8fafc", outline:"none", resize:"vertical", boxSizing:"border-box" }}
                            onFocus={onFocus} onBlur={onBlur}/>
                        <p style={{ fontSize:11, color:"#94a3b8", margin:"5px 0 0" }}>{text.length} / 500 characters</p>
                    </div>

                    <div style={{ display:"flex", gap:12 }}>
                        <button type="button" onClick={onClose}
                            style={{ flex:1, background:"#f1f5f9", border:"none", color:"#64748b", borderRadius:12, padding:"11px 0", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving || !text.trim()}
                            style={{ flex:2, background:saving||!text.trim()?"#93c5fd":`linear-gradient(135deg, ${COLOR}, #1d4ed8)`, border:"none", color:"#fff", borderRadius:12, padding:"11px 0", fontSize:13, fontWeight:700, cursor:saving||!text.trim()?"not-allowed":"pointer", fontFamily:"Nunito,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                            {saving ? "Submitting…" : <><FaStar size={12}/> Submit Feedback</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const Feedback = () => {
    const [appointments, setAppointments] = useState([]);
    const [feedbacks,    setFeedbacks]    = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [search,       setSearch]       = useState("");
    const [tab,          setTab]          = useState("pending");
    const [modalAppt,    setModalAppt]    = useState(null);

    // ── Pagination state for each tab ────────────────────────────────────────
    const [pendingPage,   setPendingPage]   = useState(1);
    const [submittedPage, setSubmittedPage] = useState(1);

    const load = async () => {
        setLoading(true);
        try {
            const [apptRes, fbRes] = await Promise.all([
                axios.get(`${BASE}/MyAppointment`, hdrs()),
                axios.get(`${BASE}/my-feedbacks`,  hdrs()).catch(() => ({ data: { feedbacks: [] } }))
            ]);
            const completed = (apptRes.data.appointments || [])
                .filter(a => a.appointment_status === "COMPLETED");
            setAppointments(completed);
            setFeedbacks(fbRes.data.feedbacks || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // Reset pages when search or tab changes
    useEffect(() => { setPendingPage(1); setSubmittedPage(1); }, [search, tab]);

    const submittedApptIds = new Set(feedbacks.map(f =>
        typeof f.appointment_id === "object" ? f.appointment_id?._id : f.appointment_id
    ));

    const pendingFeedback = appointments.filter(a => !submittedApptIds.has(a._id));

    const q = search.toLowerCase();
    const filteredPending   = pendingFeedback.filter(a =>
        !q || (a.doctor_id?.name || "").toLowerCase().includes(q) || (a.hospital_id?.hospital_name || "").toLowerCase().includes(q)
    );
    const filteredSubmitted = feedbacks.filter(f =>
        !q || (f.doctor_id?.name || "").toLowerCase().includes(q) || (f.feedback_text || "").toLowerCase().includes(q)
    );

    // Paginated slices
    const pendingTotalPages   = Math.ceil(filteredPending.length   / PER_PAGE);
    const submittedTotalPages = Math.ceil(filteredSubmitted.length / PER_PAGE);
    const paginatedPending    = filteredPending.slice((pendingPage   - 1) * PER_PAGE, pendingPage   * PER_PAGE);
    const paginatedSubmitted  = filteredSubmitted.slice((submittedPage - 1) * PER_PAGE, submittedPage * PER_PAGE);

    const handleSuccess = () => {
        setModalAppt(null);
        Swal.fire({ icon:"success", title:"Feedback Submitted! 🎉", text:"Thank you for your feedback.", timer:2000, showConfirmButton:false });
        load();
    };

    const avgRating = feedbacks.length
        ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
        : 0;

    const onFocus = e => (e.target.style.borderColor = COLOR);
    const onBlur  = e => (e.target.style.borderColor = "#e2e8f0");

    return (
        <div style={{ fontFamily:"'Nunito', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
                .fb-card { transition: all 0.15s ease; }
                .fb-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
                .tab-btn { transition: all 0.15s; }
            `}</style>

            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
                <div>
                    <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>My Feedback</h1>
                    <p style={{ fontSize:13, color:"#94a3b8", margin:"4px 0 0", fontWeight:500 }}>
                        {pendingFeedback.length} pending · {feedbacks.length} submitted
                        {avgRating > 0 && ` · Avg rating ${avgRating}★`}
                    </p>
                </div>
                <button onClick={load}
                    style={{ display:"flex", alignItems:"center", gap:7, background:"#fff", border:"1.5px solid #e2e8f0", color:"#64748b", borderRadius:12, padding:"9px 18px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Nunito,sans-serif", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLOR; e.currentTarget.style.color = COLOR; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
                    <MdRefresh size={14}/> Refresh
                </button>
            </div>

            {/* Stat cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16, marginBottom:24 }}>
                {[
                    { label:"Completed Appointments", value:appointments.length,                          accent:"#2563eb", bg:"#eff6ff", icon:<FaCalendarAlt size={18}/> },
                    { label:"Pending Feedback",        value:pendingFeedback.length,                      accent:"#d97706", bg:"#fffbeb", icon:<FaEdit size={18}/> },
                    { label:"Average Rating",          value:avgRating > 0 ? `${avgRating} ★` : "—",     accent:"#f59e0b", bg:"#fffbeb", icon:<FaStar size={18}/> },
                ].map((s, i) => (
                    <div key={i} style={{ background:"#fff", borderRadius:16, padding:"18px 20px", border:"1.5px solid #f1f5f9", boxShadow:"0 1px 6px rgba(0,0,0,0.05)", display:"flex", alignItems:"center", gap:14 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:s.bg, color:s.accent, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            {s.icon}
                        </div>
                        <div>
                            <p style={{ fontSize:22, fontWeight:900, color:s.accent, margin:0, lineHeight:1 }}>{s.value}</p>
                            <p style={{ fontSize:11, fontWeight:700, color:"#64748b", margin:"3px 0 0" }}>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Tabs */}
            <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #f1f5f9", padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:12, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ position:"relative", flex:1 }}>
                    <FaSearch size={12} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }}/>
                    <input placeholder="Search by doctor or hospital…" value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width:"100%", paddingLeft:36, paddingRight:14, paddingTop:9, paddingBottom:9, borderRadius:10, border:"1.5px solid #e2e8f0", fontSize:13, fontFamily:"Nunito,sans-serif", color:"#334155", background:"#f8fafc", outline:"none" }}
                        onFocus={onFocus} onBlur={onBlur}/>
                </div>
                {["pending","submitted"].map(t => (
                    <button key={t} className="tab-btn" onClick={() => setTab(t)}
                        style={{ padding:"8px 18px", borderRadius:10, fontSize:12, fontWeight:700, fontFamily:"Nunito,sans-serif", cursor:"pointer", border:tab===t?`1px solid ${COLOR}`:"1px solid #e2e8f0", background:tab===t?COLOR:"#f1f5f9", color:tab===t?"#fff":"#64748b" }}>
                        {t === "pending" ? `Pending (${pendingFeedback.length})` : `Submitted (${feedbacks.length})`}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:200, background:"#fff", borderRadius:18, border:"1.5px solid #f1f5f9" }}>
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                </div>

            ) : tab === "pending" ? (
                filteredPending.length === 0 ? (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:200, background:"#fff", borderRadius:18, border:"1.5px solid #f1f5f9", gap:10 }}>
                        <FaCheckCircle size={36} style={{ color:"#10b981" }}/>
                        <p style={{ fontSize:14, fontWeight:700, color:"#64748b" }}>
                            {search ? `No results for "${search}"` : "All feedback submitted! 🎉"}
                        </p>
                        <p style={{ fontSize:12, color:"#94a3b8" }}>Complete appointments to leave feedback</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            {paginatedPending.map(appt => (
                                <div key={appt._id} className="fb-card"
                                    style={{ background:"#fff", borderRadius:16, border:"1.5px solid #f1f5f9", padding:"18px 20px", boxShadow:"0 1px 6px rgba(0,0,0,0.05)", display:"flex", alignItems:"center", gap:16 }}>

                                    <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg, ${COLOR}, #1d4ed8)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, color:"#fff", flexShrink:0 }}>
                                        {(appt.doctor_id?.name || "D")[0].toUpperCase()}
                                    </div>

                                    <div style={{ flex:1, minWidth:0 }}>
                                        <p style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>
                                            {appt.doctor_id?.name || "—"}
                                        </p>
                                        <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                                            <span style={{ fontSize:11, color:"#94a3b8", fontWeight:500, display:"flex", alignItems:"center", gap:4 }}>
                                                <FaStethoscope size={9}/>{appt.doctor_id?.specialization}
                                            </span>
                                            <span style={{ fontSize:11, color:"#94a3b8", fontWeight:500, display:"flex", alignItems:"center", gap:4 }}>
                                                <FaCalendarAlt size={9}/>{fmt(appt.appointment_date)}
                                            </span>
                                            <span style={{ fontSize:11, color:"#94a3b8", fontWeight:500, display:"flex", alignItems:"center", gap:4 }}>
                                                <FaClock size={9}/>{appt.start_time}
                                            </span>
                                            <span style={{ fontSize:11, color:"#94a3b8", fontWeight:500, display:"flex", alignItems:"center", gap:4 }}>
                                                <FaHospital size={9}/>{appt.hospital_id?.hospital_name}
                                            </span>
                                        </div>
                                    </div>

                                    <button onClick={() => setModalAppt(appt)}
                                        style={{ display:"flex", alignItems:"center", gap:7, background:`linear-gradient(135deg, #f59e0b, #d97706)`, border:"none", color:"#fff", borderRadius:12, padding:"10px 18px", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"Nunito,sans-serif", flexShrink:0 }}>
                                        <FaStar size={12}/> Give Feedback
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Pending Pagination */}
                        <Paginator
                            page={pendingPage}
                            totalPages={pendingTotalPages}
                            total={filteredPending.length}
                            label="pending appointments"
                            onPageChange={setPendingPage}
                        />
                    </>
                )

            ) : (
                /* Submitted tab */
                filteredSubmitted.length === 0 ? (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:200, background:"#fff", borderRadius:18, border:"1.5px solid #f1f5f9", gap:10 }}>
                        <FaStar size={36} style={{ color:"#e2e8f0" }}/>
                        <p style={{ fontSize:14, fontWeight:700, color:"#64748b" }}>No feedback submitted yet</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            {paginatedSubmitted.map(fb => (
                                <div key={fb._id} className="fb-card"
                                    style={{ background:"#fff", borderRadius:16, border:"1.5px solid #f1f5f9", padding:"18px 20px", boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
                                    <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                                        <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg, ${COLOR}, #1d4ed8)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:"#fff", flexShrink:0 }}>
                                            {(fb.doctor_id?.name || "D")[0].toUpperCase()}
                                        </div>
                                        <div style={{ flex:1, minWidth:0 }}>
                                            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                                                <p style={{ fontSize:14, fontWeight:800, color:"#0f172a", margin:0 }}>
                                                    {fb.doctor_id?.name || "—"}
                                                </p>
                                                <Stars rating={fb.rating}/>
                                                <span style={{ fontSize:11, fontWeight:700, color:"#f59e0b" }}>{fb.rating}/5</span>
                                            </div>
                                            <p style={{ fontSize:11, color:"#94a3b8", fontWeight:500, margin:"0 0 10px", display:"flex", gap:12, flexWrap:"wrap" }}>
                                                <span>{fb.doctor_id?.specialization}</span>
                                                <span>{fmt(fb.appointment_id?.appointment_date || fb.feedback_date)}</span>
                                                <span>{fb.hospital_id?.hospital_name}</span>
                                            </p>
                                            <div style={{ background:"#f8fafc", borderRadius:10, padding:"12px 14px", borderLeft:`3px solid ${COLOR}30` }}>
                                                <p style={{ fontSize:13, color:"#475569", fontWeight:500, margin:0, lineHeight:1.6 }}>
                                                    "{fb.feedback_text}"
                                                </p>
                                            </div>
                                            <p style={{ fontSize:10, color:"#94a3b8", margin:"8px 0 0", fontWeight:500 }}>
                                                Submitted on {fmt(fb.feedback_date || fb.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submitted Pagination */}
                        <Paginator
                            page={submittedPage}
                            totalPages={submittedTotalPages}
                            total={filteredSubmitted.length}
                            label="submitted feedbacks"
                            onPageChange={setSubmittedPage}
                        />
                    </>
                )
            )}

            {/* Modal */}
            {modalAppt && (
                <FeedbackModal
                    appt={modalAppt}
                    onClose={() => setModalAppt(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default Feedback;