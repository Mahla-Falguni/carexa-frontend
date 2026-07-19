import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getImageUrl, handleImageError } from "../../utils/imageUtils";
import {
  FaHospital, FaUserMd, FaCalendarCheck, FaFileMedical,
  FaArrowRight, FaHeartbeat, FaWalking, FaExchangeAlt,
  FaCalendarAlt, FaClock, FaStethoscope, FaMapMarkerAlt,
  FaPhone, FaCheckCircle, FaBan, FaSyncAlt, FaSpinner,
  FaStar, FaComments, FaTimesCircle
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

// ─── config ───────────────────────────────────────────────────────────────────
const BASE = "https://carexa-backend.vercel.app/api";
const hdrs = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("UserToken")}` } });
const fmt  = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—";

// ─── badge ────────────────────────────────────────────────────────────────────
const BADGE = {
  SCHEDULED:   { bg:"#dbeafe", color:"#1d4ed8", label:"Scheduled",   icon:<FaCalendarCheck size={8}/> },
  PENDING:     { bg:"#fef3c7", color:"#b45309", label:"Pending",     icon:<FaClock size={8}/> },
  COMPLETED:   { bg:"#d1fae5", color:"#065f46", label:"Completed",   icon:<FaCheckCircle size={8}/> },
  CANCELLED:   { bg:"#fee2e2", color:"#b91c1c", label:"Cancelled",   icon:<FaBan size={8}/> },
  RESCHEDULED: { bg:"#ede9fe", color:"#5b21b6", label:"Rescheduled", icon:<FaSyncAlt size={8}/> },
  APPROVED:    { bg:"#d1fae5", color:"#065f46", label:"Approved",    icon:<FaCheckCircle size={8}/> },
  REJECTED:    { bg:"#fee2e2", color:"#b91c1c", label:"Rejected",    icon:<FaTimesCircle size={8}/> },
};
const Badge = ({ status }) => {
  const c = BADGE[status] || { bg:"#f1f5f9", color:"#475569", label:status||"—", icon:null };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:20, fontSize:10, fontWeight:700, background:c.bg, color:c.color, whiteSpace:"nowrap" }}>
      {c.icon} {c.label}
    </span>
  );
};

// ─── stars ────────────────────────────────────────────────────────────────────
const Stars = ({ n }) => (
  <span style={{ display:"inline-flex", gap:2 }}>
    {[1,2,3,4,5].map(i => <FaStar key={i} size={11} style={{ color:i<=n?"#f59e0b":"#e2e8f0" }}/>)}
  </span>
);

// ─── animated number ──────────────────────────────────────────────────────────
const AnimNum = ({ to, color }) => {
  const [v, setV] = useState(0);
  const r = useRef(null);
  useEffect(() => {
    if (!to) { setV(0); return; }
    let s = null;
    const fn = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 700, 1);
      setV(Math.floor(p * to));
      if (p < 1) r.current = requestAnimationFrame(fn); else setV(to);
    };
    r.current = requestAnimationFrame(fn);
    return () => cancelAnimationFrame(r.current);
  }, [to]);
  return <span style={{ color }}>{v}</span>;
};

// ─── empty state ─────────────────────────────────────────────────────────────
const Empty = ({ icon, text }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px", gap:10, color:"#cbd5e1", textAlign:"center" }}>
    <div style={{ fontSize:32, opacity:.5 }}>{icon}</div>
    <p style={{ margin:0, fontSize:13, color:"#94a3b8" }}>{text}</p>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
const UserDashboard = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const globalSearch  = outletContext.globalSearch || "";
  const name     = localStorage.getItem("Name") || "Patient";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);
  const h        = new Date().getHours();
  const greeting = h<12 ? "Good morning" : h<17 ? "Good afternoon" : "Good evening";

  // ── all state in one place ────────────────────────────────────────────────
  const [profile,      setProfile]      = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [hospitals,    setHospitals]    = useState([]);
  const [caseHist,     setCaseHist]     = useState([]);
  const [visits,       setVisits]       = useState([]);
  const [reschedules,  setReschedules]  = useState([]);
  const [feedbacks,    setFeedbacks]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [activeTab,    setActiveTab]    = useState("appts");

  // ── fetch all endpoints in parallel ──────────────────────────────────────
  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [profR, apptR, hospR, histR, visitR, rescR, feedR] = await Promise.allSettled([
        axios.get(`${BASE}/get-profile`,            hdrs()),
        axios.get(`${BASE}/MyAppointment`,          hdrs()),
        axios.get(`${BASE}/getHospitals`,           hdrs()),
        axios.get(`${BASE}/my-case-histories`,      hdrs()),
        axios.get(`${BASE}/my-visits`,              hdrs()),
        axios.get(`${BASE}/my-reschedule-requests`, hdrs()),
        axios.get(`${BASE}/my-feedbacks`,           hdrs()),
      ]);

      if (profR.status  === "fulfilled") setProfile(profR.value.data.user);
      if (apptR.status  === "fulfilled") setAppointments(apptR.value.data.appointments   || []);
      if (hospR.status  === "fulfilled") setHospitals(hospR.value.data.hospitals         || []);
      if (histR.status  === "fulfilled") setCaseHist(histR.value.data.histories          || []);
      if (visitR.status === "fulfilled") setVisits(visitR.value.data.visits              || []);
      if (rescR.status  === "fulfilled") setReschedules(rescR.value.data.requests        || []);
      if (feedR.status  === "fulfilled") setFeedbacks(feedR.value.data.feedbacks         || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── derived values ────────────────────────────────────────────────────────
  const q = globalSearch.trim().toLowerCase();
  const cnt   = (s) => appointments.filter(a => a.appointment_status === s).length;
  const today = new Date(); today.setHours(0,0,0,0);
  const upcoming = appointments
    .filter(a => ["SCHEDULED","RESCHEDULED","PENDING"].includes(a.appointment_status) && new Date(a.appointment_date) >= today)
    .sort((a,b) => new Date(a.appointment_date) - new Date(b.appointment_date));
  const recentAppts = [...appointments]
    .filter(a => !q || (a.doctor_id?.name||"").toLowerCase().includes(q) || (a.hospital_id?.hospital_name||"").toLowerCase().includes(q) || (a.doctor_id?.specialization||"").toLowerCase().includes(q))
    .sort((a,b) => new Date(b.createdAt||b.appointment_date) - new Date(a.createdAt||a.appointment_date))
    .slice(0,5);
  const filteredHospitals = hospitals.filter(h => !q || (h.hospital_name||"").toLowerCase().includes(q) || (h.location||"").toLowerCase().includes(q));
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s,f) => s+(f.rating||0), 0) / feedbacks.length).toFixed(1)
    : null;

  // ── loading screen ────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", gap:16, fontFamily:"'DM Sans',sans-serif", color:"#94a3b8" }}>
      <FaSpinner size={32} style={{ animation:"spin .8s linear infinite", color:"#2f80ed" }}/>
      <p style={{ margin:0, fontSize:14 }}>Loading your dashboard…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Playfair+Display:wght@700&display=swap');
        .ud *, .ud *::before, .ud *::after { box-sizing:border-box; }
        .ud { font-family:'DM Sans',sans-serif; color:#1a2f4a; }
        @keyframes spin   { to{ transform:rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.6} }
        .fade-up  { animation:fadeUp .22s ease forwards; }
        .hov-lift { transition:all .18s ease; }
        .hov-lift:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(11,29,58,0.09)!important; }
        .hov-act  { transition:all .18s ease; }
        .hov-act:hover  { transform:translateY(-4px); box-shadow:0 16px 36px rgba(0,0,0,0.16)!important; }
        .hov-row  { transition:background .12s; }
        .hov-row:hover  { background:#f8fbff!important; }
        .ud-tbl   { width:100%; border-collapse:collapse; }
        .ud-tbl th { text-align:left; padding:10px 18px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#94a3b8; background:#fafafa; border-bottom:1px solid #f1f5f9; }
        .ud-tbl td { padding:12px 18px; font-size:13px; border-bottom:1px solid #fafafa; vertical-align:middle; }
        .ud-tbl tr:last-child td { border-bottom:none; }
        .ud-tab   { padding:8px 14px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600; color:#64748b; cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; border-bottom:2.5px solid transparent; margin-bottom:-1px; transition:all .15s; white-space:nowrap; }
        .ud-tab.on{ color:#2f80ed; border-bottom-color:#2f80ed; background:#eff6ff; }
        .ud-tab:hover:not(.on){ background:#f8fafc; color:#334155; }
        .ud-sec   { font-family:'Playfair Display',serif; font-size:19px; font-weight:700; color:#0b1d3a; margin:0 0 14px; }
        .ud-link  { font-size:12px; font-weight:600; color:#2f80ed; background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; }
        .ud-link:hover { text-decoration:underline; color:#1558b0; }
        @media(max-width:1024px){ .g2{grid-template-columns:1fr!important;} .g4{grid-template-columns:repeat(2,1fr)!important;} }
        @media(max-width:640px) { .hide-sm{display:none!important;} .g4{grid-template-columns:1fr!important;} .bnr-name{font-size:24px!important;} }
      `}</style>

      <div className="ud fade-up">

        {/* ────────────────────── BANNER ─────────────────────────────────── */}
        <div style={{ background:"linear-gradient(135deg,#0b1d3a 0%,#1a3a6e 55%,#2f80ed 100%)", borderRadius:20, padding:"36px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:24, marginBottom:28, position:"relative", overflow:"hidden", boxShadow:"0 8px 32px rgba(47,128,237,0.22)" }}>
          <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"rgba(255,255,255,0.05)", top:-80, right:-60, pointerEvents:"none" }}/>
          <div style={{ position:"absolute", width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.04)", bottom:-50, left:200, pointerEvents:"none" }}/>

          {/* Left */}
          <div style={{ position:"relative", zIndex:1, flex:1 }}>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.55)", margin:"0 0 6px", letterSpacing:.5 }}>{greeting} ☀️</p>
            <h1 className="bnr-name" style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:700, color:"#fff", margin:"0 0 10px", lineHeight:1.2 }}>
              Welcome back,<br/><span style={{ color:"#56aef8" }}>{profile?.patient_name || name}</span>
            </h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.60)", fontWeight:300, maxWidth:400, lineHeight:1.6, margin:"0 0 20px" }}>
              Manage your healthcare journey — appointments, records and more, all in one place.
            </p>
            {/* live pills */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[
                [`${appointments.length} Appointments`, "rgba(255,255,255,0.10)"],
                [`${upcoming.length} Upcoming`,          "rgba(86,174,248,0.25)"],
                [`${hospitals.length} Hospitals`,        "rgba(255,255,255,0.10)"],
                [`${caseHist.length} Case Records`,      "rgba(255,255,255,0.10)"],
              ].map(([lbl, bg]) => (
                <span key={lbl} style={{ display:"inline-flex", alignItems:"center", background:bg, border:"1px solid rgba(255,255,255,0.15)", borderRadius:20, padding:"5px 13px", fontSize:12, color:"rgba(255,255,255,0.85)", fontWeight:500 }}>
                  {lbl}
                </span>
              ))}
            </div>
          </div>

          {/* Right avatar */}
          <div className="hide-sm" style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
            <div style={{ width:72, height:72, background:"linear-gradient(135deg,#2f80ed,#56aef8)", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:700, color:"#fff", boxShadow:"0 8px 24px rgba(47,128,237,0.40)", letterSpacing:1 }}>
              {initials}
            </div>
            <div style={{ color:"#fff" }}>
              <span style={{ fontSize:15, fontWeight:600, display:"block", marginBottom:3 }}>{profile?.patient_name || name}</span>
              {profile?.patient_email && <span style={{ fontSize:11, display:"block", color:"rgba(255,255,255,0.50)", marginBottom:6 }}>{profile.patient_email}</span>}
              <span style={{ fontSize:11, background:"rgba(47,128,237,0.35)", borderRadius:20, padding:"2px 10px", color:"#a8d4ff", border:"1px solid rgba(47,128,237,0.40)" }}>Patient</span>
            </div>
          </div>
        </div>

        {/* ─────────────────── STAT CARDS ────────────────────────────────── */}
        <p className="ud-sec">Health Overview</p>
        <div className="g4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
          {[
            { label:"Total Appointments", value:appointments.length,   sub:`${cnt("COMPLETED")} completed`,       color:"#2f80ed", bg:"#eef5ff", icon:<FaCalendarCheck/>, to:"/userdashboard/appointments" },
            { label:"Available Hospitals", value:hospitals.length,      sub:"With active subscriptions",           color:"#0ea5e9", bg:"#f0f9ff", icon:<FaHospital/>,      to:"/userdashboard/hospitals"    },
            { label:"Case Histories",      value:caseHist.length,       sub:`${visits.length} visit records`,      color:"#8b5cf6", bg:"#f5f3ff", icon:<FaFileMedical/>,   to:"/userdashboard/medical-records"      },
            { label:"My Feedbacks",        value:feedbacks.length,      sub:avgRating ? `Avg ${avgRating} ★` : "No ratings yet", color:"#f59e0b", bg:"#fffbeb", icon:<FaStar/>, to:"/userdashboard/appointments" },
          ].map(s => (
            <div key={s.label} className="hov-lift" onClick={() => navigate(s.to)}
              style={{ background:"#fff", borderRadius:16, padding:"20px", border:"1.5px solid #e8f0f8", cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ width:44, height:44, borderRadius:13, background:s.bg, color:s.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:19 }}>{s.icon}</div>
                <FaArrowRight size={10} style={{ color:"#cbd5e1", marginTop:3 }}/>
              </div>
              <div style={{ fontSize:30, fontWeight:800, lineHeight:1, marginBottom:4 }}><AnimNum to={s.value} color={s.color}/></div>
              <div style={{ fontSize:13, fontWeight:600, color:"#3d5170", marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:11, color:"#a0b0c8" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Appointment status bar */}
        <div style={{ display:"flex", gap:10, marginBottom:28, flexWrap:"wrap" }}>
          {[
            { label:"Scheduled",   val:cnt("SCHEDULED"),   color:"#1d4ed8", bg:"#dbeafe" },
            { label:"Pending",     val:cnt("PENDING"),     color:"#b45309", bg:"#fef3c7" },
            { label:"Completed",   val:cnt("COMPLETED"),   color:"#065f46", bg:"#d1fae5" },
            { label:"Cancelled",   val:cnt("CANCELLED"),   color:"#b91c1c", bg:"#fee2e2" },
            { label:"Rescheduled", val:cnt("RESCHEDULED"), color:"#5b21b6", bg:"#ede9fe" },
          ].map(p => (
            <div key={p.label} style={{ flex:1, minWidth:110, background:"#fff", border:"1.5px solid #e8f0f8", borderRadius:14, padding:"12px 16px", boxShadow:"0 1px 4px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize:22, fontWeight:800, color:p.color }}>{p.val}</div>
              <div style={{ fontSize:11, color:"#64748b", fontWeight:500 }}>{p.label}</div>
              <div style={{ height:4, borderRadius:2, background:"#f1f5f9", marginTop:6, overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:2, background:p.color, width:`${appointments.length ? (p.val/appointments.length)*100 : 0}%`, transition:"width .6s ease" }}/>
              </div>
            </div>
          ))}
        </div>

        {/* ─────────────────── QUICK ACTIONS ─────────────────────────────── */}
        <p className="ud-sec">Quick Actions</p>
        <div className="g4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
          {[
            { label:"Find Hospitals",   desc:"Browse hospitals near you",      icon:<FaHospital/>,      bg:"linear-gradient(135deg,#1558b0,#2f80ed)", to:"/userdashboard/hospitals"    },
            { label:"Book Appointment", desc:"Schedule your next visit",        icon:<FaCalendarCheck/>, bg:"linear-gradient(135deg,#6c3483,#8e44ad)", to:"/userdashboard/appointments" },
            { label:"Medical Records",  desc:"Case history & visit logs",       icon:<FaFileMedical/>,   bg:"linear-gradient(135deg,#b85c10,#e67e22)", to:"/userdashboard/medical-records"      },
            { label:"Find Doctors",     desc:"Search verified specialists",     icon:<FaUserMd/>,        bg:"linear-gradient(135deg,#1a7a45,#27ae60)", to:"/userdashboard/hospitals"    },
          ].map(a => (
            <button key={a.label} className="hov-act"
              style={{ background:a.bg, borderRadius:16, padding:"24px 20px", display:"flex", flexDirection:"column", gap:10, cursor:"pointer", border:"none", textAlign:"left", position:"relative", overflow:"hidden", boxShadow:"0 4px 16px rgba(0,0,0,0.10)" }}
              onClick={() => navigate(a.to)}>
              <div style={{ position:"absolute", width:90, height:90, borderRadius:"50%", background:"rgba(255,255,255,0.10)", bottom:-22, right:-14, pointerEvents:"none" }}/>
              <FaArrowRight size={12} style={{ position:"absolute", top:18, right:18, color:"rgba(255,255,255,0.40)" }}/>
              <div style={{ width:42, height:42, background:"rgba(255,255,255,0.18)", borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"#fff" }}>{a.icon}</div>
              <span style={{ fontSize:15, fontWeight:600, color:"#fff" }}>{a.label}</span>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.70)", fontWeight:300, lineHeight:1.4 }}>{a.desc}</span>
            </button>
          ))}
        </div>

        {/* ─────────────────── MAIN 2-COL GRID ───────────────────────────── */}
        <div className="g2" style={{ display:"grid", gridTemplateColumns:"1.55fr 1fr", gap:20, marginBottom:20 }}>

          {/* ── LEFT: tabbed data table ── */}
          <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #e8f0f8", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
            {/* tab strip */}
            <div style={{ display:"flex", gap:2, padding:"14px 18px 0", borderBottom:"1px solid #f1f5f9", overflowX:"auto" }}>
              {[
                ["appts",    `Appointments (${recentAppts.length})`],
                ["upcoming", `Upcoming (${upcoming.length})`],
                ["history",  `Case History (${caseHist.length})`],
                ["visits",   `Visits (${visits.length})`],
              ].map(([id, lbl]) => (
                <button key={id} className={`ud-tab${activeTab===id?" on":""}`} onClick={() => setActiveTab(id)}>{lbl}</button>
              ))}
            </div>

            {/* ── Appointments ── */}
            {activeTab === "appts" && (
              recentAppts.length === 0
                ? <Empty icon={<FaCalendarCheck/>} text="No appointments yet. Book your first visit!"/>
                : <div style={{ overflowX:"auto" }}>
                    <table className="ud-tbl">
                      <thead><tr><th>Doctor</th><th>Hospital</th><th>Date</th><th>Status</th></tr></thead>
                      <tbody>
                        {recentAppts.map(a => (
                          <tr key={a._id} className="hov-row">
                            <td>
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#8b5cf6,#6d28d9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", flexShrink:0 }}>
                                  {(a.doctor_id?.name||"D")[0].toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{a.doctor_id?.name ? ` ${a.doctor_id.name}` : "—"}</div>
                                  <div style={{ fontSize:11, color:"#94a3b8" }}>{a.doctor_id?.specialization||""}</div>
                                </div>
                              </div>
                            </td>
                            <td><div style={{ fontSize:12, color:"#475569", maxWidth:130, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.hospital_id?.hospital_name||"—"}</div></td>
                            <td>
                              <div style={{ fontSize:12, color:"#475569" }}>{fmt(a.appointment_date)}</div>
                              <div style={{ fontSize:11, color:"#94a3b8" }}>{a.start_time||""}</div>
                            </td>
                            <td><Badge status={a.appointment_status}/></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
            )}

            {/* ── Upcoming ── */}
            {activeTab === "upcoming" && (
              upcoming.length === 0
                ? <Empty icon={<FaCalendarAlt/>} text="No upcoming appointments"/>
                : <div style={{ padding:16, display:"flex", flexDirection:"column", gap:10 }}>
                    {upcoming.map(a => {
                      const d = new Date(a.appointment_date);
                      const isToday = d.toDateString() === today.toDateString();
                      return (
                        <div key={a._id} style={{ display:"flex", gap:12, alignItems:"center", padding:14, background:isToday?"#eff6ff":"#fafcff", borderRadius:12, border:`1.5px solid ${isToday?"#bfdbfe":"#e8f0f8"}` }}>
                          <div style={{ width:46, height:46, borderRadius:12, background:"linear-gradient(135deg,#2f80ed,#1d4ed8)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, flexShrink:0 }}>
                            <span style={{ fontSize:9, opacity:.8 }}>{d.toLocaleDateString("en-IN",{month:"short"})}</span>
                            <span style={{ fontSize:19, lineHeight:1 }}>{d.getDate()}</span>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{a.doctor_id?.name ? ` ${a.doctor_id.name}` : "—"}</div>
                            <div style={{ fontSize:11, color:"#64748b", display:"flex", alignItems:"center", gap:8, marginTop:2, flexWrap:"wrap" }}>
                              {a.doctor_id?.specialization && <span style={{ display:"flex", alignItems:"center", gap:3 }}><FaStethoscope size={9}/>{a.doctor_id.specialization}</span>}
                              {a.start_time && <span style={{ display:"flex", alignItems:"center", gap:3 }}><FaClock size={9}/>{a.start_time}{a.end_time?` – ${a.end_time}`:""}</span>}
                            </div>
                            {a.hospital_id?.hospital_name && (
                              <div style={{ fontSize:11, color:"#94a3b8", display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
                                <FaHospital size={9}/> {a.hospital_id.hospital_name}
                              </div>
                            )}
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                            <Badge status={a.appointment_status}/>
                            {isToday && <span style={{ fontSize:9, fontWeight:700, color:"#1d4ed8", background:"#dbeafe", borderRadius:4, padding:"2px 6px", animation:"pulse 2s infinite" }}>TODAY</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
            )}

            {/* ── Case History ── */}
            {activeTab === "history" && (
              caseHist.length === 0
                ? <Empty icon={<FaFileMedical/>} text="No case history records yet"/>
                : <div style={{ overflowX:"auto" }}>
                    <table className="ud-tbl">
                      <thead><tr><th>Diagnosis</th><th>Doctor</th><th>Hospital</th><th>Date</th></tr></thead>
                      <tbody>
                        {caseHist.slice(0,5).map((h, i) => (
                          <tr key={h._id||i} className="hov-row">
                            <td>
                              <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{h.diagnosis||"—"}</div>
                              {h.medications && <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>💊 {h.medications.length>40?h.medications.slice(0,40)+"…":h.medications}</div>}
                            </td>
                            <td style={{ fontSize:12, color:"#475569" }}>{h.doctor_id?.name?` ${h.doctor_id.name}`:"—"}</td>
                            <td style={{ fontSize:12, color:"#475569", maxWidth:120, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{h.hospital_id?.hospital_name||"—"}</td>
                            <td style={{ fontSize:12, color:"#64748b" }}>{fmt(h.case_history_date||h.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
            )}

            {/* ── Visits ── */}
            {activeTab === "visits" && (
              visits.length === 0
                ? <Empty icon={<FaWalking/>} text="No visit records logged yet"/>
                : <div style={{ overflowX:"auto" }}>
                    <table className="ud-tbl">
                      <thead><tr><th>Diagnosis</th><th>Doctor</th><th>Symptoms</th><th>Date</th></tr></thead>
                      <tbody>
                        {visits.slice(0,5).map((v, i) => (
                          <tr key={v._id||i} className="hov-row">
                            <td>
                              <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{v.diagnosis||"—"}</div>
                              {v.treatment && <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>Rx: {v.treatment.length>30?v.treatment.slice(0,30)+"…":v.treatment}</div>}
                            </td>
                            <td style={{ fontSize:12, color:"#475569" }}>{v.doctor_id?.name?` ${v.doctor_id.name}`:"—"}</td>
                            <td style={{ fontSize:12, color:"#475569", maxWidth:120, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{v.symptoms||"—"}</td>
                            <td style={{ fontSize:12, color:"#64748b" }}>{fmt(v.visit_date||v.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
            )}

            {/* tab footer */}
            <div style={{ padding:"10px 18px", borderTop:"1px solid #f8fafc", display:"flex", justifyContent:"flex-end" }}>
              <button className="ud-link" onClick={() => navigate(["history","visits"].includes(activeTab)?"/userdashboard/medical-records":"/userdashboard/appointments")}>
                View all →
              </button>
            </div>
          </div>

          {/* ── RIGHT column ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Profile card */}
            {profile && (
              <div style={{ background:"linear-gradient(135deg,#0b1d3a,#1a3a6e)", borderRadius:16, padding:20, color:"#fff" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:"linear-gradient(135deg,#2f80ed,#56aef8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:700, color:"#fff", flexShrink:0 }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700 }}>{profile.patient_name}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:1 }}>{profile.patient_email||""}</div>
                    <span style={{ fontSize:10, background:"rgba(47,128,237,0.35)", borderRadius:20, padding:"2px 8px", color:"#a8d4ff", marginTop:4, display:"inline-block" }}>Patient</span>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[
                    { icon:<FaPhone size={10}/>,        val:profile.patient_phone||"—",   lbl:"Phone" },
                    { icon:<FaCalendarAlt size={10}/>,  val:profile.patient_dob?fmt(profile.patient_dob):"—", lbl:"DOB" },
                    { icon:<FaUserMd size={10}/>,       val:profile.patient_gender||"—",  lbl:"Gender" },
                    { icon:<FaMapMarkerAlt size={10}/>, val:profile.patient_address?(profile.patient_address.length>18?profile.patient_address.slice(0,18)+"…":profile.patient_address):"—", lbl:"Address" },
                  ].map(f => (
                    <div key={f.lbl} style={{ background:"rgba(255,255,255,0.08)", borderRadius:10, padding:"10px 12px" }}>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", display:"flex", alignItems:"center", gap:4, marginBottom:3 }}>{f.icon} {f.lbl}</div>
                      <div style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>{f.val}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/userdashboard/profile")}
                  style={{ width:"100%", marginTop:12, padding:9, background:"rgba(255,255,255,0.12)", color:"#fff", border:"1px solid rgba(255,255,255,0.20)", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  Edit Profile
                </button>
              </div>
            )}

            {/* Reschedule requests */}
            <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #e8f0f8", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ padding:"14px 18px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:30, height:30, borderRadius:9, background:"#fdf4ff", color:"#a855f7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}><FaExchangeAlt/></div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>Reschedule Requests</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{reschedules.length} total</div>
                  </div>
                </div>
              </div>
              {reschedules.length === 0
                ? <Empty icon={<FaExchangeAlt/>} text="No reschedule requests"/>
                : <>
                    {reschedules.slice(0,3).map((r,i) => (
                      <div key={r._id||i} style={{ padding:"12px 18px", borderBottom:"1px solid #fafafa", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:"#334155", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {r.appointment_id?.doctor_id?.name ? ` ${r.appointment_id.doctor_id.name}` : r.reason?.slice(0,30)||"Request"}
                          </div>
                          <div style={{ fontSize:11, color:"#94a3b8", marginTop:1 }}>{fmt(r.createdAt)}</div>
                        </div>
                        <Badge status={r.status}/>
                      </div>
                    ))}
                    {reschedules.length > 3 && (
                      <div style={{ padding:"8px 18px", textAlign:"right" }}>
                        <button className="ud-link" onClick={() => navigate("/userdashboard/appointments")}>+{reschedules.length-3} more →</button>
                      </div>
                    )}
                  </>
              }
            </div>

            {/* Feedbacks */}
            {feedbacks.length > 0 && (
              <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #e8f0f8", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ padding:"14px 18px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:30, height:30, borderRadius:9, background:"#fffbeb", color:"#f59e0b", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}><FaComments/></div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>My Feedbacks</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{avgRating ? `Avg ${avgRating} ★ · ` : ""}{feedbacks.length} submitted</div>
                  </div>
                </div>
                {feedbacks.slice(0,2).map((f,i) => (
                  <div key={f._id||i} style={{ padding:"12px 18px", borderBottom:"1px solid #fafafa" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:"#334155" }}>{f.doctor_id?.name?` ${f.doctor_id.name}`:"—"}</div>
                      <Stars n={f.rating}/>
                    </div>
                    <div style={{ fontSize:11, color:"#64748b", lineHeight:1.5 }}>
                      {f.feedback_text?.length>60?f.feedback_text.slice(0,60)+"…":f.feedback_text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─────────────────── HOSPITALS GRID ────────────────────────────── */}
        {hospitals.length > 0 && (
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <p className="ud-sec" style={{ margin:0 }}>Available Hospitals</p>
              <button className="ud-link" onClick={() => navigate("/userdashboard/hospitals")}>View all →</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:14, marginBottom:28 }}>
              {hospitals.slice(0,4).map((h, i) => (
                <div key={h._id||i} className="hov-lift" onClick={() => navigate("/userdashboard/hospitals")}
                  style={{ background:"#fff", borderRadius:16, border:"1.5px solid #e8f0f8", overflow:"hidden", cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                  <img 
                    src={getImageUrl(h.hospital_img, 'hospital')} 
                    alt="" 
                    onError={(e) => handleImageError(e, 'hospital')}
                    style={{ width:"100%", height:90, objectFit:"cover" }}/>
                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#0b1d3a", marginBottom:5 }}>{h.hospital_name||"—"}</div>
                    {h.hospital_address && (
                      <div style={{ fontSize:11, color:"#94a3b8", display:"flex", alignItems:"center", gap:4, marginBottom:3 }}>
                        <FaMapMarkerAlt size={9}/> {h.hospital_address.length>45?h.hospital_address.slice(0,45)+"…":h.hospital_address}
                      </div>
                    )}
                    {h.hospital_phone && (
                      <div style={{ fontSize:11, color:"#94a3b8", display:"flex", alignItems:"center", gap:4 }}>
                        <FaPhone size={9}/> {h.hospital_phone}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ─────────────────── HEALTH TIPS ───────────────────────────────── */}
        <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #e8f0f8", padding:"20px 24px", marginBottom:24, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <FaHeartbeat style={{ color:"#e74c3c", fontSize:18 }}/>
            <p className="ud-sec" style={{ margin:0 }}>Health Tips</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:12 }}>
            {[
              { icon:"💧", title:"Stay Hydrated",  text:"Drink at least 8 glasses of water daily.",            bg:"#eef5ff", color:"#2f80ed" },
              { icon:"🏃", title:"Daily Exercise", text:"30 minutes of moderate activity reduces disease risk.", bg:"#edfaf3", color:"#27ae60" },
              { icon:"😴", title:"Quality Sleep",  text:"Aim for 7–9 hours of sleep for immune support.",      bg:"#fff7ee", color:"#e67e22" },
              { icon:"🥦", title:"Balanced Diet",  text:"Eat fruits, vegetables, and whole grains daily.",     bg:"#f5eeff", color:"#8e44ad" },
            ].map(t => (
              <div key={t.title} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:14, background:"#f8fafc", borderRadius:12, border:"1px solid #edf2f8" }}>
                <div style={{ width:34, height:34, flexShrink:0, borderRadius:9, background:t.bg, color:t.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{t.icon}</div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:"#1a2f4a", margin:"0 0 3px" }}>{t.title}</p>
                  <p style={{ fontSize:12, color:"#7a8fa6", fontWeight:300, lineHeight:1.5, margin:0 }}>{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        

      </div>
    </>
  );
};

export default UserDashboard;