import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaHospital, FaUserMd, FaCalendarCheck, FaClock,
  FaRedo, FaClipboardList, FaChartBar, FaExchangeAlt,
  FaLayerGroup, FaCheckCircle, FaTimesCircle, FaEye,
  FaArrowUp, FaArrowDown, FaBell, FaSearch, FaEllipsisV,
  FaCalendarAlt, FaUser, FaMapMarkerAlt
} from "react-icons/fa";
import { MdRefresh, MdTrendingUp } from "react-icons/md";

const BASE  = "http://localhost:5000/adminapi";
const hdrs  = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } });
const fmt   = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtT  = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

// ─── Status badge ─────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const map = {
    SCHEDULED:   { cls: "badge-blue",    label: "Scheduled"   },
    COMPLETED:   { cls: "badge-green",   label: "Completed"   },
    CANCELLED:   { cls: "badge-red",     label: "Cancelled"   },
    PENDING:     { cls: "badge-amber",   label: "Pending"     },
    RESCHEDULED: { cls: "badge-purple",  label: "Rescheduled" },
    APPROVED:    { cls: "badge-green",   label: "Approved"    },
    REJECTED:    { cls: "badge-red",     label: "Rejected"    },
    ACTIVE:      { cls: "badge-green",   label: "Active"      },
    INACTIVE:    { cls: "badge-slate",   label: "Inactive"    },
    AVAILABLE:   { cls: "badge-green",   label: "Available"   },
    BOOKED:      { cls: "badge-blue",    label: "Booked"      },
  };
  const c = map[status] || { cls: "badge-slate", label: status || "—" };
  return <span className={`badge ${c.cls}`}>{c.label}</span>;
};

// ─── Mini sparkline bar ───────────────────────────────────────────────────────
const MiniBar = ({ values = [], color = "#3b82f6" }) => {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 32 }}>
      {values.map((v, i) => (
        <div key={i} style={{
          flex: 1, background: color, opacity: 0.15 + (v / max) * 0.7,
          height: `${Math.max(4, (v / max) * 32)}px`, borderRadius: 2,
          transition: "height 0.4s ease"
        }}/>
      ))}
    </div>
  );
};

// ─── Animated counter ─────────────────────────────────────────────────────────
const AnimCount = ({ target, color }) => {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let start = null;
    const dur = 900;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / dur, 1);
      setVal(Math.floor(prog * target));
      if (prog < 1) raf.current = requestAnimationFrame(step);
      else setVal(target);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return <span style={{ color }}>{val.toLocaleString()}</span>;
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("AdminName") || "Admin";

  // ── state ──────────────────────────────────────────────────────────────────
  const [stats,        setStats]        = useState({});
  const [hospitals,    setHospitals]    = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [slots,        setSlots]        = useState([]);
  const [requests,     setRequests]     = useState([]);
  const [reschedules,  setReschedules]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [search,       setSearch]       = useState("");
  const [activeTab,    setActiveTab]    = useState("appointments");

  // ── fetch all ──────────────────────────────────────────────────────────────
  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [statsRes, hospsRes, docsRes, apptsRes, slotsRes, reqsRes, rescRes] =
        await Promise.allSettled([
          axios.get(`${BASE}/Dashboard-status`,     hdrs()),
          axios.get(`${BASE}/get_hospitals`,        hdrs()),
          axios.get(`${BASE}/get_doctors`,          hdrs()),
          axios.get(`${BASE}/all-appointments`,     hdrs()),
          axios.get(`${BASE}/All-Appointment-Slots`,hdrs()),
          axios.get(`${BASE}/HospitalRequests`,     hdrs()),
          axios.get(`${BASE}/reschedule-requests`,  hdrs()),
        ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value.data.stats || {});
      if (hospsRes.status === "fulfilled") setHospitals(hospsRes.value.data.hospitals || []);
      if (docsRes.status  === "fulfilled") setDoctors(docsRes.value.data.doctors || []);
      if (apptsRes.status === "fulfilled") setAppointments(apptsRes.value.data.appointments || []);
      if (slotsRes.status === "fulfilled") setSlots(slotsRes.value.data.slots || []);
      if (reqsRes.status  === "fulfilled") setRequests(reqsRes.value.data.data || []);
      if (rescRes.status  === "fulfilled") setReschedules(rescRes.value.data.rescheduleRequests || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── derived stats ──────────────────────────────────────────────────────────
  const apptStatus = (s) => appointments.filter(a => a.appointment_status === s).length;
  const slotStatus = (s) => slots.filter(sl => sl.slot_status === s).length;
  const reqStatus  = (s) => requests.filter(r => r.request_status === s).length;
  const rescStatus = (s) => reschedules.filter(r => r.status === s).length;

  // weekly sparkline — count appts per last 7 days
  const sparkline = (() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d;
    });
    return days.map(day => appointments.filter(a => {
      const d = new Date(a.appointment_date || a.createdAt);
      return d.toDateString() === day.toDateString();
    }).length);
  })();

  // recent 5 appointments
  const recentAppts = [...appointments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // recent 5 hospital requests
  const recentReqs = [...requests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // search filter across doctors
  const filteredDoctors = doctors.filter(d => {
    const q = search.toLowerCase();
    return !q || (d.name||"").toLowerCase().includes(q) ||
      (d.specialization||"").toLowerCase().includes(q) ||
      (d.hospital_id?.hospital_name||"").toLowerCase().includes(q);
  }).slice(0, 6);

  const filteredHospitals = hospitals.filter(h => {
    const q = search.toLowerCase();
    return !q || (h.hospital_name||"").toLowerCase().includes(q) ||
      (h.hospital_address||"").toLowerCase().includes(q);
  }).slice(0, 6);

  const filteredAppts = appointments.filter(a => {
    const q = search.toLowerCase();
    return !q ||
      (a.patient_id?.patient_name||"").toLowerCase().includes(q) ||
      (a.doctor_id?.name||"").toLowerCase().includes(q) ||
      (a.hospital_id?.hospital_name||"").toLowerCase().includes(q) ||
      (a.appointment_status||"").toLowerCase().includes(q);
  }).slice(0, 6);

  // ── stat cards config ──────────────────────────────────────────────────────
  const STAT_CARDS = [
    { key: "hospitals",    label: "Total Hospitals",      value: hospitals.length,                            color: "#3b82f6", bg: "#eff6ff", icon: <FaHospital/>,      route: "/admin/AdminHospitals",     spark: [3,4,4,5,5,6,hospitals.length] },
    { key: "doctors",      label: "Total Doctors",        value: doctors.length,                              color: "#8b5cf6", bg: "#f5f3ff", icon: <FaUserMd/>,         route: "/admin/AdminDoctors",        spark: [2,5,5,7,8,9,doctors.length] },
    { key: "appointments", label: "Scheduled",            value: apptStatus("SCHEDULED"),                     color: "#0ea5e9", bg: "#f0f9ff", icon: <FaCalendarCheck/>,  route: "/admin/AdminAllAppointments",spark: sparkline },
    { key: "pending",      label: "Pending Appts",        value: apptStatus("PENDING"),                       color: "#f59e0b", bg: "#fffbeb", icon: <FaClock/>,           route: "/admin/AdminAllAppointments",spark: [1,2,2,3,3,2,apptStatus("PENDING")] },
    { key: "slots",        label: "Total Slots",          value: slots.length,                                color: "#10b981", bg: "#f0fdf4", icon: <FaLayerGroup/>,      route: "/admin/AdminAppointmentSlots",spark: [4,6,5,8,7,9,slots.length] },
    { key: "requests",     label: "Hospital Requests",    value: requests.length,                             color: "#ef4444", bg: "#fef2f2", icon: <FaClipboardList/>,   route: "/admin/HospitalRequests",    spark: [1,1,2,2,3,3,requests.length] },
    { key: "reschedules",  label: "Reschedule Requests",  value: reschedules.length,                          color: "#ec4899", bg: "#fdf2f8", icon: <FaExchangeAlt/>,    route: "/admin/AdminRescheduleRequests",spark: [0,1,1,2,1,2,reschedules.length] },
    { key: "available",    label: "Available Slots",      value: slotStatus("AVAILABLE"),                     color: "#14b8a6", bg: "#f0fdfa", icon: <FaChartBar/>,        route: "/admin/AdminAppointmentSlots",spark: [2,3,4,5,4,5,slotStatus("AVAILABLE")] },
  ];

  if (loading) return (
    <div className="dash-loader">
      <div className="spin-ring"/>
      <p>Loading dashboard…</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .adm-dash { font-family: 'DM Sans', sans-serif; background: #f8fafc; min-height: 100vh; padding: 28px; }

        /* ── loader ── */
        .dash-loader { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; gap:16px; background:#f8fafc; font-family:'DM Sans',sans-serif; color:#94a3b8; }
        .spin-ring { width:44px; height:44px; border:3px solid #e2e8f0; border-top-color:#3b82f6; border-radius:50%; animation:spin .8s linear infinite; }
        @keyframes spin { to{ transform:rotate(360deg); } }

        /* ── page header ── */
        .dash-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:28px; flex-wrap:wrap; }
        .dash-greeting { font-size:24px; font-weight:700; color:#0f172a; margin:0 0 4px; }
        .dash-sub { font-size:13px; color:#64748b; margin:0; font-weight:400; }
        .dash-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .refresh-btn { display:flex; align-items:center; gap:6px; padding:8px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:10px; font-size:12px; font-weight:600; color:#475569; cursor:pointer; transition:all .15s; font-family:'DM Sans',sans-serif; }
        .refresh-btn:hover { background:#f8fafc; border-color:#cbd5e1; }
        .refreshing { opacity:.6; pointer-events:none; }
        .search-wrap { position:relative; }
        .search-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:13px; pointer-events:none; }
        .search-inp { padding:8px 12px 8px 34px; border:1px solid #e2e8f0; background:#fff; border-radius:10px; font-size:13px; font-family:'DM Sans',sans-serif; color:#334155; outline:none; width:220px; transition:border-color .15s; }
        .search-inp:focus { border-color:#3b82f6; box-shadow:0 0 0 3px #3b82f620; }

        /* ── stat cards ── */
        .stat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px; margin-bottom:28px; }
        .stat-card { background:#fff; border:1px solid #f1f5f9; border-radius:16px; padding:20px; cursor:pointer; transition:all .2s; position:relative; overflow:hidden; }
        .stat-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,0.08); border-color:#e2e8f0; }
        .stat-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; }
        .stat-icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
        .stat-badge { font-size:10px; font-weight:700; padding:3px 7px; border-radius:20px; display:flex; align-items:center; gap:3px; background:#f0fdf4; color:#16a34a; }
        .stat-value { font-size:32px; font-weight:800; line-height:1; margin-bottom:4px; letter-spacing:-1px; }
        .stat-label { font-size:12px; color:#64748b; font-weight:500; }
        .stat-spark { margin-top:12px; }

        /* ── section header ── */
        .sec-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:8px; }
        .sec-title { font-size:16px; font-weight:700; color:#0f172a; margin:0; }
        .sec-link { font-size:12px; font-weight:600; color:#3b82f6; cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:4px; }
        .sec-link:hover { color:#1d4ed8; text-decoration:underline; }

        /* ── summary pills row ── */
        .summary-row { display:flex; gap:10px; margin-bottom:28px; flex-wrap:wrap; }
        .sum-pill { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #f1f5f9; border-radius:12px; padding:10px 16px; flex:1; min-width:140px; cursor:pointer; transition:all .15s; }
        .sum-pill:hover { border-color:#e2e8f0; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
        .sum-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .sum-val { font-size:20px; font-weight:800; color:#0f172a; }
        .sum-lbl { font-size:11px; color:#64748b; font-weight:500; }

        /* ── grid layout ── */
        .main-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
        .main-grid-3 { display:grid; grid-template-columns:2fr 1fr; gap:20px; margin-bottom:20px; }
        @media(max-width:900px) { .main-grid,.main-grid-3 { grid-template-columns:1fr; } }

        /* ── card ── */
        .card { background:#fff; border:1px solid #f1f5f9; border-radius:16px; overflow:hidden; }
        .card-head { padding:16px 20px; border-bottom:1px solid #f8fafc; display:flex; align-items:center; justify-content:space-between; }
        .card-body { padding:0; }
        .card-icon { width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }

        /* ── table ── */
        .dash-table { width:100%; border-collapse:collapse; }
        .dash-table th { text-align:left; padding:10px 20px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#94a3b8; background:#fafafa; border-bottom:1px solid #f1f5f9; }
        .dash-table td { padding:12px 20px; font-size:13px; border-bottom:1px solid #fafafa; vertical-align:middle; }
        .dash-table tr:last-child td { border-bottom:none; }
        .dash-table tbody tr { transition:background .12s; }
        .dash-table tbody tr:hover { background:#fafcff; }

        /* ── badges ── */
        .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:20px; font-size:10px; font-weight:700; }
        .badge-blue   { background:#dbeafe; color:#1d4ed8; }
        .badge-green  { background:#d1fae5; color:#065f46; }
        .badge-red    { background:#fee2e2; color:#b91c1c; }
        .badge-amber  { background:#fef3c7; color:#b45309; }
        .badge-purple { background:#ede9fe; color:#5b21b6; }
        .badge-slate  { background:#f1f5f9; color:#475569; }

        /* ── avatar ── */
        .av { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#fff; flex-shrink:0; }

        /* ── mini progress ── */
        .prog-bar { height:5px; border-radius:3px; background:#f1f5f9; overflow:hidden; margin-top:6px; }
        .prog-fill { height:100%; border-radius:3px; transition:width .5s ease; }

        /* ── tab bar ── */
        .tab-bar { display:flex; gap:4px; padding:16px 20px 0; border-bottom:1px solid #f1f5f9; }
        .tab-btn { padding:8px 14px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600; color:#64748b; cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; border-bottom:2px solid transparent; margin-bottom:-1px; transition:all .15s; }
        .tab-btn.active { color:#3b82f6; border-bottom-color:#3b82f6; background:#eff6ff; }
        .tab-btn:hover:not(.active) { background:#f8fafc; color:#334155; }

        /* ── empty state ── */
        .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; color:#cbd5e1; gap:8px; }
        .empty-state p { font-size:13px; color:#94a3b8; margin:0; }

        /* ── quick stat list ── */
        .qs-item { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-bottom:1px solid #fafafa; }
        .qs-item:last-child { border-bottom:none; }
        .qs-label { font-size:13px; color:#475569; font-weight:500; display:flex; align-items:center; gap:8px; }
        .qs-val { font-size:14px; font-weight:700; color:#0f172a; }

        /* ── dot bullet ── */
        .dot { width:8px; height:8px; border-radius:50%; display:inline-block; flex-shrink:0; }

        /* ── info chip ── */
        .chip { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:6px; font-size:11px; font-weight:600; background:#f1f5f9; color:#475569; }

        /* ── hover row button ── */
        .row-btn { padding:5px 10px; border-radius:8px; font-size:11px; font-weight:700; border:1px solid #e2e8f0; background:#fff; color:#475569; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .12s; }
        .row-btn:hover { background:#f0f9ff; border-color:#bae6fd; color:#0284c7; }

        .text-truncate { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px; display:inline-block; }
        .fw-600 { font-weight:600; }
        .c-slate { color:#475569; }
        .c-muted { color:#94a3b8; }
        .fs-12 { font-size:12px; }
        .gap-2 { display:flex; align-items:center; gap:8px; }
      `}</style>

      <div className="adm-dash">

        {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
        <div className="dash-header">
          <div>
            <h1 className="dash-greeting">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {adminName} 👋</h1>
            <p className="dash-sub">Here's what's happening across your hospital network today · {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</p>
          </div>
          <div className="dash-actions">
            <div className="search-wrap">
              <FaSearch className="search-icon"/>
              <input className="search-inp" placeholder="Search hospitals, doctors…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <button className={`refresh-btn${refreshing ? " refreshing" : ""}`} onClick={() => fetchAll(true)}>
              <MdRefresh size={14} style={{ animation: refreshing ? "spin .6s linear infinite" : "none" }}/> Refresh
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ─────────────────────────────────────────────────────── */}
        <div className="stat-grid">
          {STAT_CARDS.map(card => (
            <div key={card.key} className="stat-card" onClick={() => navigate(card.route)}>
              <div className="stat-card-top">
                <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
                  {card.icon}
                </div>
                <span className="stat-badge">
                  <MdTrendingUp size={10}/> Live
                </span>
              </div>
              <div className="stat-value"><AnimCount target={card.value} color={card.color}/></div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-spark">
                <MiniBar values={card.spark} color={card.color}/>
              </div>
            </div>
          ))}
        </div>

        {/* ── SUMMARY PILLS ──────────────────────────────────────────────────── */}
        <div className="summary-row">
          {[
            { label:"Completed Appts",   val: apptStatus("COMPLETED"),  color:"#10b981" },
            { label:"Cancelled Appts",   val: apptStatus("CANCELLED"),  color:"#ef4444" },
            { label:"Rescheduled",       val: apptStatus("RESCHEDULED"),color:"#8b5cf6" },
            { label:"Pending Requests",  val: reqStatus("PENDING"),     color:"#f59e0b" },
            { label:"Approved Requests", val: reqStatus("APPROVED"),    color:"#10b981" },
            { label:"Pending Reschedule",val: rescStatus("PENDING"),    color:"#ec4899" },
            { label:"Booked Slots",      val: slotStatus("BOOKED"),     color:"#3b82f6" },
          ].map(p => (
            <div key={p.label} className="sum-pill">
              <div className="sum-dot" style={{ background: p.color }}/>
              <div>
                <div className="sum-val">{p.val}</div>
                <div className="sum-lbl">{p.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── ROW 1: Appointments table + Quick stats ─────────────────────── */}
        <div className="main-grid-3">

          {/* Recent Appointments */}
          <div className="card">
            <div className="card-head">
              <div className="gap-2">
                <div className="card-icon" style={{ background:"#eff6ff", color:"#3b82f6" }}><FaCalendarCheck size={13}/></div>
                <div>
                  <div className="sec-title">Recent Appointments</div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginTop:1 }}>Latest {recentAppts.length} bookings</div>
                </div>
              </div>
              <button className="sec-link" onClick={() => navigate("/admin/AdminAllAppointments")}>
                View all →
              </button>
            </div>
            <div className="card-body">
              {recentAppts.length === 0 ? (
                <div className="empty-state"><FaCalendarAlt size={28}/><p>No appointments yet</p></div>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Hospital</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAppts.map(a => (
                        <tr key={a._id}>
                          <td>
                            <div className="gap-2">
                              <div className="av" style={{ background:"linear-gradient(135deg,#3b82f6,#6366f1)", width:30, height:30, fontSize:11 }}>
                                {(a.patient_id?.patient_name||"P")[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="fw-600" style={{ fontSize:13, color:"#0f172a" }}>{a.patient_id?.patient_name||"—"}</div>
                                <div className="c-muted fs-12">{a.patient_id?.patient_phone||""}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize:13, fontWeight:600, color:"#334155" }}>
                              {a.doctor_id?.name ? ` ${a.doctor_id.name}` : "—"}
                            </div>
                            <div className="c-muted fs-12">{a.doctor_id?.specialization||""}</div>
                          </td>
                          <td>
                            <div className="c-slate fs-12 text-truncate">{a.hospital_id?.hospital_name||"—"}</div>
                          </td>
                          <td>
                            <div className="c-slate fs-12">{fmt(a.appointment_date)}</div>
                            <div className="c-muted" style={{ fontSize:11 }}>{a.start_time||""}</div>
                          </td>
                          <td><Badge status={a.appointment_status}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats sidebar */}
          <div className="card">
            <div className="card-head">
              <div className="gap-2">
                <div className="card-icon" style={{ background:"#faf5ff", color:"#8b5cf6" }}><FaChartBar size={13}/></div>
                <div className="sec-title">Appointment Breakdown</div>
              </div>
            </div>
            <div className="card-body">
              {[
                { label:"Scheduled",   val: apptStatus("SCHEDULED"),   total: appointments.length, color:"#3b82f6" },
                { label:"Completed",   val: apptStatus("COMPLETED"),   total: appointments.length, color:"#10b981" },
                { label:"Pending",     val: apptStatus("PENDING"),     total: appointments.length, color:"#f59e0b" },
                { label:"Cancelled",   val: apptStatus("CANCELLED"),   total: appointments.length, color:"#ef4444" },
                { label:"Rescheduled", val: apptStatus("RESCHEDULED"), total: appointments.length, color:"#8b5cf6" },
                { label:"No Show",     val: apptStatus("NO_SHOW"),     total: appointments.length, color:"#94a3b8" },
              ].map(s => (
                <div key={s.label} className="qs-item">
                  <div className="qs-label">
                    <div className="dot" style={{ background: s.color }}/>
                    {s.label}
                  </div>
                  <div style={{ textAlign:"right", minWidth:80 }}>
                    <div className="qs-val" style={{ color: s.color }}>{s.val}</div>
                    <div className="prog-bar">
                      <div className="prog-fill" style={{ width: `${s.total ? (s.val/s.total)*100 : 0}%`, background: s.color }}/>
                    </div>
                  </div>
                </div>
              ))}

              {/* Slot breakdown */}
              <div style={{ padding:"12px 20px 4px", borderTop:"1px solid #f1f5f9", marginTop:4 }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:"#94a3b8", marginBottom:8 }}>Slot Status</div>
              </div>
              {[
                { label:"Available", val: slotStatus("AVAILABLE"), color:"#10b981" },
                { label:"Booked",    val: slotStatus("BOOKED"),    color:"#3b82f6" },
                { label:"Cancelled", val: slotStatus("CANCELLED"), color:"#ef4444" },
              ].map(s => (
                <div key={s.label} className="qs-item">
                  <div className="qs-label">
                    <div className="dot" style={{ background: s.color }}/>
                    {s.label}
                  </div>
                  <div className="qs-val" style={{ color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 2: Tabbed table (Hospitals / Doctors / Requests) ─────────── */}
        <div className="card" style={{ marginBottom:20 }}>
          <div className="tab-bar">
            {[
              { id:"appointments", label:`Appointments (${filteredAppts.length})` },
              { id:"hospitals",    label:`Hospitals (${filteredHospitals.length})` },
              { id:"doctors",      label:`Doctors (${filteredDoctors.length})` },
              { id:"requests",     label:`Hospital Requests (${recentReqs.length})` },
              { id:"reschedules",  label:`Reschedules (${reschedules.length})` },
            ].map(tab => (
              <button key={tab.id}
                className={`tab-btn${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Appointments tab ── */}
          {activeTab === "appointments" && (
            <div style={{ overflowX:"auto" }}>
              {filteredAppts.length === 0 ? (
                <div className="empty-state"><FaCalendarAlt size={28}/><p>No appointments match your search</p></div>
              ) : (
                <table className="dash-table">
                  <thead><tr>
                    <th>#</th><th>Patient</th><th>Doctor</th><th>Hospital</th>
                    <th>Date &amp; Time</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {filteredAppts.map((a, i) => (
                      <tr key={a._id}>
                        <td className="c-muted fs-12">{i+1}</td>
                        <td>
                          <div className="gap-2">
                            <div className="av" style={{ background:"linear-gradient(135deg,#3b82f6,#6366f1)", width:30, height:30, fontSize:11 }}>
                              {(a.patient_id?.patient_name||"P")[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-600" style={{ fontSize:13, color:"#0f172a" }}>{a.patient_id?.patient_name||"—"}</div>
                              <div className="c-muted fs-12">{a.patient_id?.patient_email||""}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-600 fs-12">{a.doctor_id?.name ? ` ${a.doctor_id.name}` : "—"}</div>
                          <div className="c-muted" style={{ fontSize:11 }}>{a.doctor_id?.specialization||""}</div>
                        </td>
                        <td><div className="c-slate fs-12">{a.hospital_id?.hospital_name||"—"}</div></td>
                        <td>
                          <div className="c-slate fs-12">{fmt(a.appointment_date)}</div>
                          <div className="c-muted" style={{ fontSize:11 }}>{a.start_time||""}{a.end_time ? ` – ${a.end_time}` : ""}</div>
                        </td>
                        <td><Badge status={a.appointment_status}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Hospitals tab ── */}
          {activeTab === "hospitals" && (
            <div style={{ overflowX:"auto" }}>
              {filteredHospitals.length === 0 ? (
                <div className="empty-state"><FaHospital size={28}/><p>No hospitals match your search</p></div>
              ) : (
                <table className="dash-table">
                  <thead><tr><th>#</th><th>Hospital</th><th>Email</th><th>Phone</th><th>Address</th><th>Status</th></tr></thead>
                  <tbody>
                    {filteredHospitals.map((h, i) => (
                      <tr key={h._id}>
                        <td className="c-muted fs-12">{i+1}</td>
                        <td>
                          <div className="gap-2">
                            {h.hospital_img
                              ? <img src={`http://localhost:5000/uploads/${h.hospital_img}`} alt="" style={{ width:30, height:30, borderRadius:"50%", objectFit:"cover", border:"2px solid #e2e8f0" }}/>
                              : <div className="av" style={{ background:"linear-gradient(135deg,#0ea5e9,#0284c7)", width:30, height:30, fontSize:11 }}>{(h.hospital_name||"H")[0].toUpperCase()}</div>
                            }
                            <div className="fw-600" style={{ fontSize:13, color:"#0f172a" }}>{h.hospital_name||"—"}</div>
                          </div>
                        </td>
                        <td><div className="c-slate fs-12">{h.hospital_email||"—"}</div></td>
                        <td><div className="c-slate fs-12">{h.hospital_phone||"—"}</div></td>
                        <td>
                          <div className="gap-2 c-slate" style={{ fontSize:12, maxWidth:200 }}>
                            <FaMapMarkerAlt size={10} style={{ color:"#94a3b8", flexShrink:0 }}/>{h.hospital_address||"—"}
                          </div>
                        </td>
                        <td><Badge status={h.hospital_status||"ACTIVE"}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Doctors tab ── */}
          {activeTab === "doctors" && (
            <div style={{ overflowX:"auto" }}>
              {filteredDoctors.length === 0 ? (
                <div className="empty-state"><FaUserMd size={28}/><p>No doctors match your search</p></div>
              ) : (
                <table className="dash-table">
                  <thead><tr><th>#</th><th>Doctor</th><th>Specialization</th><th>Hospital</th><th>Phone</th><th>Fee</th><th>Status</th></tr></thead>
                  <tbody>
                    {filteredDoctors.map((d, i) => (
                      <tr key={d._id}>
                        <td className="c-muted fs-12">{i+1}</td>
                        <td>
                          <div className="gap-2">
                            {d.img
                              ? <img src={`http://localhost:5000/uploads/${d.img}`} alt="" style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", border:"2px solid #e2e8f0" }}/>
                              : <div className="av" style={{ background:"linear-gradient(135deg,#8b5cf6,#6d28d9)", width:32, height:32, fontSize:12 }}>{(d.name||"D")[0].toUpperCase()}</div>
                            }
                            <div>
                              <div className="fw-600" style={{ fontSize:13, color:"#0f172a" }}> {d.name||"—"}</div>
                              <div className="c-muted fs-12">{d.email||""}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="chip">{d.specialization||"—"}</span>
                        </td>
                        <td><div className="c-slate fs-12">{d.hospital_id?.hospital_name||"—"}</div></td>
                        <td><div className="c-slate fs-12">{d.phone||"—"}</div></td>
                        <td><div className="fw-600 fs-12" style={{ color:"#0f172a" }}>₹{d.consultation_fee||"—"}</div></td>
                        <td><Badge status={d.status||"ACTIVE"}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Hospital Requests tab ── */}
          {activeTab === "requests" && (
            <div style={{ overflowX:"auto" }}>
              {recentReqs.length === 0 ? (
                <div className="empty-state"><FaClipboardList size={28}/><p>No hospital requests</p></div>
              ) : (
                <table className="dash-table">
                  <thead><tr><th>#</th><th>Hospital</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead>
                  <tbody>
                    {recentReqs.map((r, i) => (
                      <tr key={r._id}>
                        <td className="c-muted fs-12">{i+1}</td>
                        <td>
                          <div className="gap-2">
                            <div className="av" style={{ background:"linear-gradient(135deg,#0ea5e9,#0369a1)", width:30, height:30, fontSize:11 }}>{(r.hospital_name||"H")[0].toUpperCase()}</div>
                            <div className="fw-600" style={{ fontSize:13, color:"#0f172a" }}>{r.hospital_name||"—"}</div>
                          </div>
                        </td>
                        <td><div className="c-slate fs-12">{r.hospital_email||"—"}</div></td>
                        <td><div className="c-slate fs-12">{r.hospital_phone||"—"}</div></td>
                        <td><Badge status={r.request_status}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Reschedule Requests tab ── */}
          {activeTab === "reschedules" && (
            <div style={{ overflowX:"auto" }}>
              {reschedules.length === 0 ? (
                <div className="empty-state"><FaExchangeAlt size={28}/><p>No reschedule requests</p></div>
              ) : (
                <table className="dash-table">
                  <thead><tr><th>#</th><th>Doctor</th><th>Hospital</th><th>Original Date</th><th>Reason</th><th>Status</th></tr></thead>
                  <tbody>
                    {reschedules.slice(0,6).map((r, i) => (
                      <tr key={r._id}>
                        <td className="c-muted fs-12">{i+1}</td>
                        <td>
                          <div className="fw-600 fs-12">{r.appointment_id?.doctor_id?.name ? ` ${r.appointment_id.doctor_id.name}` : "—"}</div>
                          <div className="c-muted" style={{ fontSize:11 }}>{r.appointment_id?.doctor_id?.specialization||""}</div>
                        </td>
                        <td><div className="c-slate fs-12">{r.appointment_id?.hospital_id?.hospital_name||"—"}</div></td>
                        <td><div className="c-slate fs-12">{r.appointment_id?.appointment_date ? fmt(r.appointment_id.appointment_date) : "—"}</div></td>
                        <td>
                          <div className="c-slate fs-12" style={{ maxWidth:200, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }} title={r.reason}>
                            {r.reason||<span style={{ color:"#cbd5e1", fontStyle:"italic" }}>No reason</span>}
                          </div>
                        </td>
                        <td><Badge status={r.status}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tab footer */}
          <div style={{ padding:"12px 20px", borderTop:"1px solid #f8fafc", display:"flex", justifyContent:"flex-end" }}>
            <button className="sec-link" onClick={() => navigate(
              activeTab === "hospitals"   ? "/admin/AdminHospitals" :
              activeTab === "doctors"     ? "/admin/AdminDoctors" :
              activeTab === "requests"    ? "/admin/HospitalRequests" :
              activeTab === "reschedules" ? "/admin/AdminRescheduleRequests" :
              "/admin/AdminAllAppointments"
            )}>
              View full list →
            </button>
          </div>
        </div>

        {/* ── ROW 3: Slot breakdown + Reschedule summary ────────────────────── */}
        <div className="main-grid">

          {/* Appointment Slots */}
          <div className="card">
            <div className="card-head">
              <div className="gap-2">
                <div className="card-icon" style={{ background:"#f0fdf4", color:"#10b981" }}><FaLayerGroup size={13}/></div>
                <div>
                  <div className="sec-title">Appointment Slots Overview</div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginTop:1 }}>{slots.length} total slots across all doctors</div>
                </div>
              </div>
              <button className="sec-link" onClick={() => navigate("/admin/AdminAppointmentSlots")}>View all →</button>
            </div>
            <div className="card-body">
              {[
                { label:"Available", val: slotStatus("AVAILABLE"), color:"#10b981", bg:"#f0fdf4" },
                { label:"Booked",    val: slotStatus("BOOKED"),    color:"#3b82f6", bg:"#eff6ff" },
                { label:"Cancelled", val: slotStatus("CANCELLED"), color:"#ef4444", bg:"#fef2f2" },
              ].map(s => (
                <div key={s.label} style={{ padding:"14px 20px", borderBottom:"1px solid #fafafa" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <div className="gap-2">
                      <div className="dot" style={{ background: s.color, width:10, height:10 }}/>
                      <span style={{ fontSize:13, fontWeight:600, color:"#334155" }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize:14, fontWeight:800, color: s.color }}>{s.val}</span>
                  </div>
                  <div className="prog-bar">
                    <div className="prog-fill" style={{ width:`${slots.length ? (s.val/slots.length)*100 : 0}%`, background: s.color }}/>
                  </div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginTop:4 }}>
                    {slots.length ? `${((s.val/slots.length)*100).toFixed(1)}% of total slots` : "No data"}
                  </div>
                </div>
              ))}

              {/* Recent slots */}
              {slots.slice(0,3).map((sl, i) => (
                <div key={sl._id||i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", borderBottom:"1px solid #fafafa" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:"#334155" }}>{sl.doctor_id?.name ? ` ${sl.doctor_id.name}` : "—"}</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{fmt(sl.appointment_date)} · {sl.start_time||"—"}</div>
                  </div>
                  <Badge status={sl.slot_status||"AVAILABLE"}/>
                </div>
              ))}
            </div>
          </div>

          {/* Reschedule Requests */}
          <div className="card">
            <div className="card-head">
              <div className="gap-2">
                <div className="card-icon" style={{ background:"#fdf4ff", color:"#a855f7" }}><FaExchangeAlt size={13}/></div>
                <div>
                  <div className="sec-title">Reschedule Requests</div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginTop:1 }}>{rescStatus("PENDING")} pending approval</div>
                </div>
              </div>
              <button className="sec-link" onClick={() => navigate("/admin/AdminRescheduleRequests")}>View all →</button>
            </div>
            <div className="card-body">
              {/* status summary */}
              {[
                { label:"Pending",  val: rescStatus("PENDING"),  color:"#f59e0b" },
                { label:"Approved", val: rescStatus("APPROVED"), color:"#10b981" },
                { label:"Rejected", val: rescStatus("REJECTED"), color:"#ef4444" },
              ].map(s => (
                <div key={s.label} className="qs-item">
                  <div className="qs-label"><div className="dot" style={{ background: s.color }}/>{s.label}</div>
                  <div className="qs-val" style={{ color: s.color }}>{s.val}</div>
                </div>
              ))}
              <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:4 }}>
                {reschedules.slice(0, 4).map((r, i) => (
                  <div key={r._id||i} style={{ padding:"10px 20px", borderBottom:"1px solid #fafafa", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:"#334155" }}>
                        {r.appointment_id?.doctor_id?.name ? ` ${r.appointment_id.doctor_id.name}` : "—"}
                      </div>
                      <div style={{ fontSize:11, color:"#94a3b8", marginTop:2, maxWidth:160, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {r.reason || "No reason provided"}
                      </div>
                    </div>
                    <Badge status={r.status}/>
                  </div>
                ))}
                {reschedules.length === 0 && (
                  <div className="empty-state" style={{ padding:24 }}>
                    <FaExchangeAlt size={22}/><p>No reschedule requests</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        

      </div>
    </>
  );
};

export default AdminDashboard;