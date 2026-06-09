import { useState, useEffect } from "react";
import axios from "axios";
import {
    FaStar, FaRegStar, FaSearch, FaUserAlt,
    FaCalendarAlt, FaClock, FaFilter, FaChartBar
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

const BASE  = "http://localhost:5000/staffapi";
const hdrs  = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("StaffToken")}` } });
const COLOR = "#2563eb";

const fmt = (d) => d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const Stars = ({ rating, size = 13 }) => (
    <div style={{ display: "flex", gap: 2 }}>
        {[1,2,3,4,5].map(n => (
            n <= rating
                ? <FaStar key={n} size={size} color="#f59e0b"/>
                : <FaRegStar key={n} size={size} color="#d1d5db"/>
        ))}
    </div>
);

const RATING_COLOR = { 1:"#dc2626", 2:"#d97706", 3:"#0891b2", 4:"#059669", 5:"#7c3aed" };
const RATING_LABEL = { 1:"Poor", 2:"Fair", 3:"Good", 4:"Very Good", 5:"Excellent" };

const DoctorFeedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [search,    setSearch]    = useState("");
    const [filter,    setFilter]    = useState(0); // 0 = all
    const [page,      setPage]      = useState(1);
    const PER_PAGE = 6;

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${BASE}/my-feedbacks`, hdrs());
            setFeedbacks(data.feedbacks || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);
    useEffect(() => { setPage(1); }, [search, filter]);

    // Stats
    const total     = feedbacks.length;
    const avgRating = total ? (feedbacks.reduce((s, f) => s + f.rating, 0) / total) : 0;
    const ratingDist = [5,4,3,2,1].map(r => ({
        r,
        count: feedbacks.filter(f => f.rating === r).length,
        pct:   total ? Math.round((feedbacks.filter(f => f.rating === r).length / total) * 100) : 0
    }));

    const q        = search.toLowerCase();
    const filtered = feedbacks.filter(f => {
        const matchRating = filter === 0 || f.rating === filter;
        return matchRating && (!q ||
            (f.patient_id?.patient_name  || "").toLowerCase().includes(q) ||
            (f.feedback_text             || "").toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

    const onFocus = e => (e.target.style.borderColor = COLOR);
    const onBlur  = e => (e.target.style.borderColor = "#e2e8f0");

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
                .fb-card { transition: all 0.15s; border-left: 3px solid transparent; }
                .fb-card:hover { background: #f8fafc !important; border-left-color: #f59e0b; }
                .pg-btn { transition: all 0.12s; }
                .pg-btn:hover:not(:disabled) { border-color: #2563eb !important; color: #2563eb !important; }
            `}</style>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0 }}>Patient Feedback</h1>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>
                        {total} reviews · Average {avgRating.toFixed(1)} ★
                    </p>
                </div>
                <button onClick={load}
                    style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "1.5px solid #e2e8f0", color: "#64748b", borderRadius: 12, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito,sans-serif", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLOR; e.currentTarget.style.color = COLOR; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
                    <MdRefresh size={14}/> Refresh
                </button>
            </div>

            {/* ── Overview panel ── */}
            {!loading && total > 0 && (
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", padding: "20px 24px", marginBottom: 22, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", display: "grid", gridTemplateColumns: "200px 1fr", gap: 24, alignItems: "center" }}>
                    {/* Average score */}
                    <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 56, fontWeight: 900, color: "#f59e0b", margin: 0, lineHeight: 1 }}>
                            {avgRating.toFixed(1)}
                        </p>
                        <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
                            <Stars rating={Math.round(avgRating)} size={16}/>
                        </div>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "6px 0 0", fontWeight: 600 }}>
                            {total} review{total !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {/* Rating distribution */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {ratingDist.map(({ r, count, pct }) => (
                            <div key={r} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", width: 14, textAlign: "right", flexShrink: 0 }}>{r}</span>
                                <FaStar size={10} color="#f59e0b" style={{ flexShrink: 0 }}/>
                                <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 100, height: 8, overflow: "hidden" }}>
                                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 100, background: RATING_COLOR[r], transition: "width 0.4s ease" }}/>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", width: 28, textAlign: "right", flexShrink: 0 }}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search + Filter */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #f1f5f9", padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                    <FaSearch size={12} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}/>
                    <input placeholder="Search by patient or feedback content…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "Nunito,sans-serif", color: "#334155", background: "#f8fafc", outline: "none" }}
                        onFocus={onFocus} onBlur={onBlur}/>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {[0,5,4,3,2,1].map(r => (
                        <button key={r} onClick={() => setFilter(r)}
                            style={{ padding: "7px 12px", borderRadius: 10, fontSize: 11, fontWeight: 700, fontFamily: "Nunito,sans-serif", cursor: "pointer", border: filter === r ? `1px solid ${r === 0 ? COLOR : RATING_COLOR[r]}` : "1px solid #e2e8f0", background: filter === r ? (r === 0 ? COLOR : RATING_COLOR[r]) : "#f1f5f9", color: filter === r ? "#fff" : "#64748b" }}>
                            {r === 0 ? "All" : `${r} ★`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feedback list */}
            {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9" }}>
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", gap: 10 }}>
                    <FaStar size={36} style={{ color: "#e2e8f0" }}/>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>
                        {search || filter ? "No feedback matches your filter" : "No feedback received yet"}
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0, background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                    {paginated.map((fb, i) => (
                        <div key={fb._id} className="fb-card"
                            style={{ padding: "18px 22px", borderBottom: i < paginated.length - 1 ? "1px solid #f8fafc" : "none", background: "#fff" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                                {/* Patient avatar */}
                                <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${COLOR}, #1d4ed8)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                                    {(fb.patient_id?.patient_name || "P")[0].toUpperCase()}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {/* Top row */}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                                        <div>
                                            <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                                                {fb.patient_id?.patient_name || "Patient"}
                                            </p>
                                            <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontWeight: 500 }}>
                                                {fb.patient_id?.patient_phone && `${fb.patient_id.patient_phone} · `}
                                                {fmt(fb.appointment_id?.appointment_date || fb.feedback_date)}
                                                {fb.appointment_id?.start_time && ` at ${fb.appointment_id.start_time}`}
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                            <Stars rating={fb.rating}/>
                                            <span style={{ fontSize: 11, fontWeight: 800, color: RATING_COLOR[fb.rating], background: RATING_COLOR[fb.rating] + "15", borderRadius: 20, padding: "2px 10px" }}>
                                                {RATING_LABEL[fb.rating]}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Feedback text */}
                                    <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${RATING_COLOR[fb.rating]}50` }}>
                                        <p style={{ fontSize: 13, color: "#475569", fontWeight: 500, margin: 0, lineHeight: 1.65 }}>
                                            "{fb.feedback_text}"
                                        </p>
                                    </div>
                                    <p style={{ fontSize: 10, color: "#94a3b8", margin: "8px 0 0", fontWeight: 500 }}>
                                        Submitted {fmt(fb.feedback_date || fb.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ padding: "12px 22px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, margin: 0 }}>
                                Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}
                            </p>
                            <div style={{ display: "flex", gap: 6 }}>
                                <button className="pg-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}
                                    style={{ width:30, height:30, borderRadius:8, border:"1.5px solid #e2e8f0", background:page===1?"#f8fafc":"#fff", color:page===1?"#cbd5e1":"#475569", cursor:page===1?"not-allowed":"pointer", fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
                                {Array.from({length:totalPages},(_,i)=>i+1)
                                    .filter(n=>n===1||n===totalPages||Math.abs(n-page)<=1)
                                    .reduce((acc,n,idx,arr)=>{ if(idx>0&&arr[idx-1]!==n-1) acc.push("…"); acc.push(n); return acc; },[])
                                    .map((item,idx) =>
                                        item==="…" ? (
                                            <span key={`d${idx}`} style={{width:30,textAlign:"center",fontSize:12,color:"#94a3b8"}}>…</span>
                                        ) : (
                                            <button key={item} className="pg-btn" onClick={() => setPage(item)}
                                                style={{ width:30, height:30, borderRadius:8, border:page===item?"2px solid #2563eb":"1.5px solid #e2e8f0", background:page===item?"#2563eb":"#fff", color:page===item?"#fff":"#475569", cursor:"pointer", fontWeight:700, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                                {item}
                                            </button>
                                        )
                                    )
                                }
                                <button className="pg-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}
                                    style={{ width:30, height:30, borderRadius:8, border:"1.5px solid #e2e8f0", background:page===totalPages?"#f8fafc":"#fff", color:page===totalPages?"#cbd5e1":"#475569", cursor:page===totalPages?"not-allowed":"pointer", fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorFeedbacks;