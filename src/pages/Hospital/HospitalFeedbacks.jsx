import { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import {
    FaStar, FaRegStar, FaSearch, FaUserAlt,
    FaCalendarAlt, FaUserMd, FaFilter, FaChartBar
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

const BASE  = "https://carexa-backend.vercel.app/hospitalapi";
const hdrs  = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("HospitalToken")}` } });
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

const HospitalFeedbacks = () => {
    const { globalSearch = "" } = useOutletContext() || {};
    const [feedbacks,    setFeedbacks]    = useState([]);
    const [avgRating,    setAvgRating]    = useState(0);
    const [ratingCounts, setRatingCounts] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [search,       setSearch]       = useState("");
    const [filterRating, setFilterRating] = useState(0);
    const [filterDoctor, setFilterDoctor] = useState("ALL");
    const [page,         setPage]         = useState(1);
    const PER_PAGE = 8;

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${BASE}/feedbacks`, hdrs());
            setFeedbacks(data.feedbacks || []);
            setAvgRating(data.avgRating || 0);
            setRatingCounts(data.ratingCounts || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);
    useEffect(() => { setPage(1); }, [search, filterRating, filterDoctor, globalSearch]);

    const total = feedbacks.length;

    // Unique doctors for filter dropdown
    const doctors = [...new Map(
        feedbacks
            .filter(f => f.doctor_id?.name)
            .map(f => [f.doctor_id._id, f.doctor_id])
    ).values()];

    const q        = (globalSearch || search).trim().toLowerCase();
    const filtered = feedbacks.filter(f => {
        const matchRating = filterRating === 0 || f.rating === filterRating;
        const matchDoctor = filterDoctor === "ALL" || f.doctor_id?._id === filterDoctor;
        return matchRating && matchDoctor && (!q ||
            (f.patient_id?.patient_name  || "").toLowerCase().includes(q) ||
            (f.doctor_id?.name           || "").toLowerCase().includes(q) ||
            (f.feedback_text             || "").toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

    const totalRatings = ratingCounts.reduce((s, r) => s + r.count, 0);

    const onFocus = e => (e.target.style.borderColor = COLOR);
    const onBlur  = e => (e.target.style.borderColor = "#e2e8f0");

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
                .fb-row { transition: background 0.12s; border-left: 3px solid transparent; }
                .fb-row:hover { background: #f8fafc !important; border-left-color: #f59e0b; }
                .pg-btn { transition: all 0.12s; }
                .pg-btn:hover:not(:disabled) { border-color: #2563eb !important; color: #2563eb !important; }
            `}</style>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0 }}>Patient Feedback</h1>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>
                        {total} reviews · Average {Number(avgRating).toFixed(1)} ★ from all doctors
                    </p>
                </div>
                <button onClick={load}
                    style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "1.5px solid #e2e8f0", color: "#64748b", borderRadius: 12, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito,sans-serif", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLOR; e.currentTarget.style.color = COLOR; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
                    <MdRefresh size={14}/> Refresh
                </button>
            </div>

            {/* ── Overview ── */}
            {!loading && total > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 200px", gap: 16, marginBottom: 24 }}>
                    {/* Avg score card */}
                    <div style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: 18, padding: "20px 24px", boxShadow: "0 4px 16px rgba(245,158,11,0.3)", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", right: 16, top: 16, opacity: 0.2 }}><FaStar size={48} color="#fff"/></div>
                        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Average Rating</p>
                        <p style={{ color: "#fff", fontSize: 40, fontWeight: 900, margin: 0, lineHeight: 1 }}>{Number(avgRating).toFixed(1)}</p>
                        <div style={{ marginTop: 6 }}><Stars rating={Math.round(avgRating)} size={14}/></div>
                        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, margin: "4px 0 0" }}>{total} reviews</p>
                    </div>

                    {/* Doctor count */}
                    <div style={{ background: "#fff", borderRadius: 18, padding: "20px 24px", border: "1.5px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Doctors Reviewed</p>
                        <p style={{ fontSize: 32, fontWeight: 900, color: COLOR, margin: 0, lineHeight: 1 }}>{doctors.length}</p>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>out of your staff</p>
                    </div>

                    {/* 5-star count */}
                    <div style={{ background: "#fff", borderRadius: 18, padding: "20px 24px", border: "1.5px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>5-Star Reviews</p>
                        <p style={{ fontSize: 32, fontWeight: 900, color: "#7c3aed", margin: 0, lineHeight: 1 }}>
                            {(ratingCounts.find(r => r.rating === 5)?.count) || 0}
                        </p>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
                            {total ? `${Math.round(((ratingCounts.find(r=>r.rating===5)?.count)||0)/total*100)}%` : "0%"} of total
                        </p>
                    </div>

                    {/* Rating bar chart */}
                    <div style={{ background: "#fff", borderRadius: 18, padding: "16px 18px", border: "1.5px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>Rating Breakdown</p>
                        {[5,4,3,2,1].map(r => {
                            const cnt = (ratingCounts.find(x => x.rating === r)?.count) || 0;
                            const pct = totalRatings ? Math.round((cnt / totalRatings) * 100) : 0;
                            return (
                                <div key={r} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", width: 10 }}>{r}</span>
                                    <FaStar size={8} color="#f59e0b"/>
                                    <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 100, height: 6, overflow: "hidden" }}>
                                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 100, background: RATING_COLOR[r] }}/>
                                    </div>
                                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, width: 20, textAlign: "right" }}>{cnt}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Search + Filters */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #f1f5f9", padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                    <FaSearch size={12} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}/>
                    <input placeholder="Search by patient, doctor or feedback…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "Nunito,sans-serif", color: "#334155", background: "#f8fafc", outline: "none" }}
                        onFocus={onFocus} onBlur={onBlur}/>
                </div>

                {/* Doctor filter */}
                <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)}
                    style={{ padding: "9px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 12, fontFamily: "Nunito,sans-serif", fontWeight: 700, color: "#64748b", background: "#f8fafc", outline: "none", cursor: "pointer" }}
                    onFocus={onFocus} onBlur={onBlur}>
                    <option value="ALL">All Doctors</option>
                    {doctors.map(d => <option key={d._id} value={d._id}> {d.name}</option>)}
                </select>

                {/* Rating filter */}
                <div style={{ display: "flex", gap: 8 }}>
                    {[0,5,4,3,2,1].map(r => (
                        <button key={r} onClick={() => setFilterRating(r)}
                            style={{ padding: "7px 12px", borderRadius: 10, fontSize: 11, fontWeight: 700, fontFamily: "Nunito,sans-serif", cursor: "pointer", border: filterRating === r ? `1px solid ${r === 0 ? COLOR : RATING_COLOR[r]}` : "1px solid #e2e8f0", background: filterRating === r ? (r === 0 ? COLOR : RATING_COLOR[r]) : "#f1f5f9", color: filterRating === r ? "#fff" : "#64748b" }}>
                            {r === 0 ? "All" : `${r} ★`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feedback table */}
            {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 220, background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9" }}>
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", gap: 10 }}>
                    <FaStar size={36} style={{ color: "#e2e8f0" }}/>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>
                        {search || filterRating || filterDoctor !== "ALL" ? "No feedback matches your filter" : "No feedback received yet"}
                    </p>
                </div>
            ) : (
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                    {/* Table head */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr 100px 1fr 80px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", padding: "10px 22px" }}>
                        {["Patient", "Doctor", "Date", "Feedback", "Rating"].map(h => (
                            <p key={h} style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{h}</p>
                        ))}
                    </div>

                    {paginated.map((fb, i) => (
                        <div key={fb._id} className="fb-row"
                            style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr 100px 1fr 80px", padding: "14px 22px", borderBottom: i < paginated.length-1 ? "1px solid #f8fafc" : "none", alignItems: "center", background: "#fff" }}>

                            {/* Patient */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${COLOR}, #1d4ed8)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                                    {(fb.patient_id?.patient_name || "P")[0].toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {fb.patient_id?.patient_name || "—"}
                                    </p>
                                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "1px 0 0" }}>{fb.patient_id?.patient_phone || ""}</p>
                                </div>
                            </div>

                            {/* Doctor */}
                            <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: "#334155", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                     {fb.doctor_id?.name || "—"}
                                </p>
                                <p style={{ fontSize: 11, color: "#94a3b8", margin: "1px 0 0" }}>{fb.doctor_id?.specialization || ""}</p>
                            </div>

                            {/* Date */}
                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#475569", fontWeight: 600 }}>
                                <FaCalendarAlt size={9} color="#94a3b8"/>{fmt(fb.feedback_date || fb.createdAt)}
                            </div>

                            {/* Feedback text */}
                            <p style={{ fontSize: 12, color: "#64748b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontStyle: "italic" }}>
                                "{fb.feedback_text}"
                            </p>

                            {/* Rating */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3 }}>
                                <Stars rating={fb.rating} size={11}/>
                                <span style={{ fontSize: 10, fontWeight: 800, color: RATING_COLOR[fb.rating] }}>
                                    {RATING_LABEL[fb.rating]}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    <div style={{ padding: "12px 22px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, margin: 0 }}>
                            Showing {filtered.length === 0 ? 0 : (page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} reviews
                        </p>
                        {totalPages > 1 && (
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
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HospitalFeedbacks;