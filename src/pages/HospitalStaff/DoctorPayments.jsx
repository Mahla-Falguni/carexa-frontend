import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    FaRupeeSign, FaSearch, FaReceipt,
    FaMoneyBillWave, FaQrcode, FaCreditCard,
    FaCalendarAlt, FaUserAlt, FaStethoscope,
    FaChartLine, FaArrowUp, FaTrophy
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import PaymentReceiptModal from "./PaymentReceiptModal";

const BASE = "http://localhost:5000/staffapi";
const hdrs = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("StaffToken")}` } });

const fmt     = (d) => d ? new Date(d).toLocaleDateString("en-IN",  { day:"2-digit", month:"short", year:"numeric" }) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN",  { hour:"2-digit", minute:"2-digit" }) : "—";

const METHOD_CFG = {
    CASH:  { label:"Cash",  icon:<FaMoneyBillWave size={12}/>, color:"#059669", bg:"#ecfdf5", border:"#6ee7b7" },
    UPI:   { label:"UPI",   icon:<FaQrcode size={12}/>,        color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd" },
    CARD:  { label:"Card",  icon:<FaCreditCard size={12}/>,    color:"#0891b2", bg:"#ecfeff", border:"#67e8f9" },
    OTHER: { label:"Other", icon:<FaRupeeSign size={12}/>,     color:"#d97706", bg:"#fffbeb", border:"#fde68a" },
};

const PER_PAGE = 8;

export default function DoctorPayments() {
    const [payments,     setPayments]     = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [search,       setSearch]       = useState("");
    const [methodFilter, setMethodFilter] = useState("ALL");
    const [receipt,      setReceipt]      = useState(null);
    const [page,         setPage]         = useState(1);
    const [stats,        setStats]        = useState({ total:0, totalEarnings:0, todayEarnings:0 });

    // Doctor info from localStorage
    const doctorName = localStorage.getItem("StaffName") || "Doctor";

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${BASE}/doctor/my-payments`, hdrs());
            setPayments(data.payments || []);
            setStats({ total: data.total, totalEarnings: data.totalEarnings, todayEarnings: data.todayEarnings });
        } catch (err) {
            Swal.fire({ icon:"error", title:"Failed to load payments", text: err?.response?.data?.message });
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchPayments(); }, []);
    useEffect(() => { setPage(1); }, [search, methodFilter]);

    const cashCount   = payments.filter(p => p.payment_method === "CASH").length;
    const uniquePts   = new Set(payments.map(p => p.patient_id?._id).filter(Boolean)).size;

    const filtered = payments.filter(p => {
        const mOk = methodFilter === "ALL" || p.payment_method === methodFilter;
        const q   = search.toLowerCase();
        return mOk && (!q ||
            (p.patient_id?.patient_name  || "").toLowerCase().includes(q) ||
            (p.patient_id?.patient_phone || "").includes(q) ||
            (p.patient_id?.patient_email || "").toLowerCase().includes(q) ||
            (p.transaction_id            || "").toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

    return (
        <div style={{ fontFamily:"'Nunito',sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Lora:wght@600;700&display=swap');
                .dp-root * { font-family:'Nunito',sans-serif; box-sizing:border-box; }
                @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                .fade-up { animation:fadeUp 0.22s ease forwards; }
                .stat-g  { transition:all 0.18s; }
                .stat-g:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,0.14)!important; }
                .pay-row { transition:background 0.1s; border-left:3px solid transparent; }
                .pay-row:hover { background:#f8fafc!important; border-left-color:#059669; }
                .rcpt-btn { transition:all 0.15s; }
                .rcpt-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(5,150,105,0.25); }
                .pill { transition:all 0.12s; cursor:pointer; border:none; font-family:'Nunito',sans-serif; }
                .pg-btn { transition:all 0.12s; }
                .pg-btn:hover:not(:disabled) { border-color:#059669!important; color:#059669!important; }
            `}</style>

            <div className="dp-root fade-up" style={{ maxWidth:1200, margin:"0 auto", paddingBottom:40 }}>

                {/* Header */}
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
                    <div>
                        <p style={{ fontSize:11, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 4px" }}>Doctor · My Earnings</p>
                        <h1 style={{ fontSize:30, fontWeight:900, color:"#0f172a", margin:0, fontFamily:"'Lora',serif" }}>My Payment History</h1>
                        <p style={{ fontSize:13, color:"#64748b", margin:"4px 0 0", fontWeight:500 }}>
                            {stats.total} transactions · ₹{(stats.totalEarnings||0).toLocaleString("en-IN")} total
                        </p>
                    </div>
                    <button onClick={fetchPayments}
                        style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", border:"1.5px solid #e2e8f0", color:"#475569", borderRadius:14, padding:"10px 20px", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor="#059669"; e.currentTarget.style.color="#059669"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.color="#475569"; }}>
                        <MdRefresh size={15} className={loading?"animate-spin":""}/> Refresh
                    </button>
                </div>

                {/* Stat cards */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
                    {[
                        { label:"Total Earnings",     value:`₹${(stats.totalEarnings||0).toLocaleString("en-IN")}`, sub:`${stats.total} payments`, bg:"linear-gradient(135deg,#064e3b,#059669)", icon:<FaChartLine size={20} color="#fff"/> },
                        { label:"Today's Earnings",   value:`₹${(stats.todayEarnings||0).toLocaleString("en-IN")}`, sub:"collected today",          bg:"linear-gradient(135deg,#1e3a5f,#2563eb)", icon:<FaArrowUp size={20} color="#fff"/> },
                        { label:"Cash Collections",   value:cashCount,                                               sub:"cash payments",            bg:"linear-gradient(135deg,#78350f,#d97706)", icon:<FaMoneyBillWave size={20} color="#fff"/> },
                        { label:"Unique Patients",    value:uniquePts,                                               sub:"patients served",          bg:"linear-gradient(135deg,#312e81,#6d28d9)", icon:<FaUserAlt size={20} color="#fff"/> },
                    ].map((s,i) => (
                        <div key={i} className="stat-g" style={{ borderRadius:18, padding:"20px 22px", background:s.bg, boxShadow:"0 4px 18px rgba(0,0,0,0.14)", position:"relative", overflow:"hidden" }}>
                            <div style={{ position:"absolute", right:18, top:18, width:44, height:44, borderRadius:13, background:"rgba(255,255,255,0.13)", display:"flex", alignItems:"center", justifyContent:"center" }}>{s.icon}</div>
                            <p style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.65)", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 8px" }}>{s.label}</p>
                            <p style={{ fontSize:26, fontWeight:900, color:"#fff", margin:"0 0 2px", lineHeight:1 }}>{s.value}</p>
                            <p style={{ fontSize:11, color:"rgba(255,255,255,0.55)", margin:0 }}>{s.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid #f1f5f9", padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
                    <div style={{ position:"relative", flex:1, minWidth:200 }}>
                        <FaSearch size={12} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }}/>
                        <input placeholder="Search patient name, phone, txn ID…" value={search} onChange={e=>setSearch(e.target.value)}
                            style={{ width:"100%", paddingLeft:36, paddingRight:14, paddingTop:10, paddingBottom:10, borderRadius:12, border:"1.5px solid #e2e8f0", fontSize:13, fontFamily:"Nunito,sans-serif", color:"#334155", background:"#f8fafc", outline:"none" }}
                            onFocus={e=>e.target.style.borderColor="#059669"}
                            onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                        {[{k:"ALL",l:"All",c:"#059669"},{k:"CASH",l:"Cash",c:"#d97706"},{k:"UPI",l:"UPI",c:"#7c3aed"},{k:"CARD",l:"Card",c:"#0891b2"},{k:"OTHER",l:"Other",c:"#64748b"}].map(f => (
                            <button key={f.k} className="pill" onClick={()=>setMethodFilter(f.k)}
                                style={{ padding:"7px 14px", borderRadius:10, fontSize:11, fontWeight:700, background:methodFilter===f.k?f.c:"#f1f5f9", color:methodFilter===f.k?"#fff":"#64748b", boxShadow:methodFilter===f.k?`0 3px 10px ${f.c}40`:"none" }}>
                                {f.l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:280, background:"#fff", borderRadius:20, border:"1.5px solid #f1f5f9", gap:14 }}>
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"/>
                        <p style={{ color:"#94a3b8", fontSize:13 }}>Loading your payments…</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:240, background:"#fff", borderRadius:20, border:"1.5px solid #f1f5f9", gap:10 }}>
                        <FaReceipt size={40} style={{ color:"#e2e8f0" }}/>
                        <p style={{ fontSize:15, fontWeight:700, color:"#64748b", margin:0 }}>{search ? `No results for "${search}"` : "No payment records yet"}</p>
                    </div>
                ) : (
                    <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
                        {/* Head */}
                        <div style={{ display:"grid", gridTemplateColumns:"36px 2fr 1.2fr 1fr 100px 100px 130px 90px 110px", padding:"11px 20px", background:"#f0fdf4", borderBottom:"1px solid #dcfce7" }}>
                            {["#","Patient","Appointment Date","Time","Payment Date","Paid At","Amount","Method","Receipt"].map(h => (
                                <p key={h} style={{ fontSize:9, fontWeight:800, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.08em", margin:0 }}>{h}</p>
                            ))}
                        </div>

                        {paginated.map((p, i) => {
                            const mCfg = METHOD_CFG[p.payment_method] || METHOD_CFG.OTHER;
                            return (
                                <div key={p._id} className="pay-row"
                                    style={{ display:"grid", gridTemplateColumns:"36px 2fr 1.2fr 1fr 100px 100px 130px 90px 110px", padding:"13px 20px", borderBottom:"1px solid #f9fafb", alignItems:"center" }}>

                                    <p style={{ fontSize:11, color:"#94a3b8", fontWeight:700, margin:0 }}>{(page-1)*PER_PAGE+i+1}</p>

                                    {/* Patient */}
                                    <div style={{ display:"flex", alignItems:"center", gap:9, minWidth:0 }}>
                                        <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#064e3b,#059669)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", flexShrink:0 }}>
                                            {(p.patient_id?.patient_name||"P")[0].toUpperCase()}
                                        </div>
                                        <div style={{ minWidth:0 }}>
                                            <p style={{ fontSize:12, fontWeight:700, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.patient_id?.patient_name||"—"}</p>
                                            <p style={{ fontSize:10, color:"#94a3b8", margin:"1px 0 0" }}>
                                                {p.patient_id?.patient_phone||""}{p.patient_id?.patient_gender ? ` · ${p.patient_id.patient_gender}` : ""}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Appt date */}
                                    <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#475569", fontWeight:600 }}>
                                        <FaCalendarAlt size={9} color="#94a3b8"/>{fmt(p.appointment_id?.appointment_date)}
                                    </div>

                                    {/* Appt time */}
                                    <span style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:7, padding:"3px 8px", fontSize:10, fontWeight:700, color:"#166534" }}>
                                        {p.appointment_id?.start_time || "—"}
                                    </span>

                                    {/* Payment date */}
                                    <p style={{ fontSize:11, color:"#475569", fontWeight:600, margin:0 }}>{fmt(p.payment_date)}</p>

                                    {/* Payment time */}
                                    <span style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:7, padding:"3px 8px", fontSize:10, fontWeight:700, color:"#334155" }}>
                                        {fmtTime(p.payment_date)}
                                    </span>

                                    {/* Amount */}
                                    <p style={{ fontSize:16, fontWeight:900, color:"#059669", margin:0 }}>₹{Number(p.amount||0).toLocaleString("en-IN")}</p>

                                    {/* Method */}
                                    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:7, fontSize:10, fontWeight:700, background:mCfg.bg, color:mCfg.color, border:`1px solid ${mCfg.border}` }}>
                                        {mCfg.icon} {mCfg.label}
                                    </span>

                                    {/* Receipt */}
                                    <button className="rcpt-btn" onClick={() => setReceipt(p)}
                                        style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 11px", borderRadius:9, background:"linear-gradient(135deg,#064e3b,#059669)", border:"none", color:"#fff", fontSize:10, fontWeight:700, cursor:"pointer" }}>
                                        <FaReceipt size={9}/> Receipt
                                    </button>
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        <div style={{ padding:"12px 20px", background:"#f0fdf4", borderTop:"1px solid #dcfce7", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                            <p style={{ fontSize:12, color:"#6b7280", fontWeight:600, margin:0 }}>
                                Showing {filtered.length===0?0:(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,filtered.length)} of {filtered.length} payments
                            </p>
                            {totalPages > 1 && (
                                <div style={{ display:"flex", gap:5 }}>
                                    <button className="pg-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}
                                        style={{ width:30, height:30, borderRadius:8, border:"1.5px solid #d1fae5", background:page===1?"#f0fdf4":"#fff", color:page===1?"#86efac":"#475569", cursor:page===1?"not-allowed":"pointer", fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
                                    {Array.from({length:totalPages},(_,i)=>i+1).filter(n=>n===1||n===totalPages||Math.abs(n-page)<=1)
                                        .reduce((acc,n,idx,arr)=>{if(idx>0&&arr[idx-1]!==n-1)acc.push("…");acc.push(n);return acc;},[])
                                        .map((item,idx)=>item==="…"?(
                                            <span key={`d${idx}`} style={{width:30,textAlign:"center",fontSize:12,color:"#94a3b8",display:"flex",alignItems:"center",justifyContent:"center"}}>…</span>
                                        ):(
                                            <button key={item} className="pg-btn" onClick={()=>setPage(item)}
                                                style={{width:30,height:30,borderRadius:8,border:page===item?"2px solid #059669":"1.5px solid #d1fae5",background:page===item?"#059669":"#fff",color:page===item?"#fff":"#475569",cursor:"pointer",fontWeight:700,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                                {item}
                                            </button>
                                        ))}
                                    <button className="pg-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}
                                        style={{ width:30, height:30, borderRadius:8, border:"1.5px solid #d1fae5", background:page===totalPages?"#f0fdf4":"#fff", color:page===totalPages?"#86efac":"#475569", cursor:page===totalPages?"not-allowed":"pointer", fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {receipt && <PaymentReceiptModal payment={receipt} onClose={() => setReceipt(null)}/>}
        </div>
    );
}