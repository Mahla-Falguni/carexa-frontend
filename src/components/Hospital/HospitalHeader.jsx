import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaBars, FaBell, FaSearch, FaSignOutAlt, FaUserCog, FaTimes,
  FaUserMd, FaCalendarAlt, FaClock, FaHospital,
  FaSpinner, FaChevronRight, FaStethoscope,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";


const BASE        = "http://localhost:5000/hospitalapi";
const TOKEN_KEY   = "HospitalToken";
const NAME_KEY    = "HospitalName";
const LOGIN_ROUTE = "/hospitallogin";
const ACCENT      = "#0ea5e9";

const hdrs = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` },
});

// ─── helpers ──────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  SCHEDULED:   "bg-blue-100 text-blue-700",
  COMPLETED:   "bg-emerald-100 text-emerald-700",
  CANCELLED:   "bg-red-100 text-red-600",
  PENDING:     "bg-amber-100 text-amber-700",
  RESCHEDULED: "bg-purple-100 text-purple-700",
  ACTIVE:      "bg-emerald-100 text-emerald-700",
  INACTIVE:    "bg-slate-100 text-slate-500",
  SUSPENDED:   "bg-red-100 text-red-600",
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const useDebounce = (value, delay = 380) => {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
};

// ─────────────────────────────────────────────────────────────────────────────
const HospitalHeader = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const adminName    = localStorage.getItem(NAME_KEY)          || "Hospital Admin";
  const hospitalName = localStorage.getItem("HospitalOrgName") || "My Hospital";
  const initials     = adminName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  // ── dropdowns ──────────────────────────────────────────────────────────────
  const [showNotif,   setShowNotif]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // ── notifications ──────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([
    { msg: "New appointment pending approval",  time: "5 min ago",  dot: "bg-sky-500",     read: false },
    { msg: "New doctor added to your hospital", time: "20 min ago", dot: "bg-emerald-500", read: false },
    { msg: "Patient reschedule request",        time: "1 hr ago",   dot: "bg-amber-500",   read: false },
    { msg: "Slot booking confirmed",            time: "2 hrs ago",  dot: "bg-blue-500",    read: true  },
    { msg: "Hospital profile updated",          time: "Yesterday",  dot: "bg-slate-400",   read: true  },
  ]);
  const unread      = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));

  // ── search ─────────────────────────────────────────────────────────────────
  const [query,        setQuery]        = useState("");
  const [results,      setResults]      = useState({ doctors: [], appointments: [] });
  const [searching,    setSearching]    = useState(false);
  const [showDrop,     setShowDrop]     = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const wrapRef    = useRef(null);
  const debouncedQ = useDebounce(query, 380);

  // close on outside click
  useEffect(() => {
    const fn = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ⌘K shortcut
  useEffect(() => {
    const fn = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        wrapRef.current?.querySelector("input")?.focus();
      }
      if (e.key === "Escape") setShowDrop(false);
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  // trigger search
  useEffect(() => {
    if (!debouncedQ.trim() || debouncedQ.length < 2) {
      setResults({ doctors: [], appointments: [] });
      setShowDrop(false);
      return;
    }
    runSearch(debouncedQ.trim());
  }, [debouncedQ]);

 

  const runSearch = useCallback(async (q) => {
    setSearching(true);
    setShowDrop(true);
    const lq = q.toLowerCase();

    try {
      const [docRes, apptRes] = await Promise.allSettled([
        axios.get(`${BASE}/getAllDoctors`,               hdrs()),
        axios.get(`${BASE}/get-allbooked-appointments`,  hdrs()),
      ]);

      // doctors — your controller may return data.doctors or data.staff
      const rawDocs =
        docRes.status === "fulfilled"
          ? docRes.value.data.doctors ||
            docRes.value.data.staff   ||
            []
          : [];

      const matchedDocs = rawDocs.filter(d =>
        (d.name           || "").toLowerCase().includes(lq) ||
        (d.specialization || "").toLowerCase().includes(lq) ||
        (d.email          || "").toLowerCase().includes(lq) ||
        (d.phone          || "").includes(lq) ||
        (d.role           || "").toLowerCase().includes(lq)
      ).slice(0, 5);

      // appointments — your controller may return data.appointments or data
      const rawAppts =
        apptRes.status === "fulfilled"
          ? apptRes.value.data.appointments ||
            apptRes.value.data              ||
            []
          : [];

      const matchedAppts = rawAppts.filter(a =>
        (a.patient_id?.patient_name  || "").toLowerCase().includes(lq) ||
        (a.patient_id?.patient_phone || "").includes(lq)               ||
        (a.patient_id?.patient_email || "").toLowerCase().includes(lq) ||
        (a.doctor_id?.name           || "").toLowerCase().includes(lq) ||
        (a.appointment_status        || "").toLowerCase().includes(lq) ||
        (a.appointment_date ? fmt(a.appointment_date) : "").toLowerCase().includes(lq)
      ).slice(0, 6);

      setResults({ doctors: matchedDocs, appointments: matchedAppts });
    } catch (err) {
      console.error("HospitalHeader search error:", err.message);
      setResults({ doctors: [], appointments: [] });
    } finally {
      setSearching(false);
    }
  }, []);

  const clearSearch = () => {
    setQuery("");
    setShowDrop(false);
    setResults({ doctors: [], appointments: [] });
    setActiveFilter("ALL");
  };

  // ── logout ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Swal.fire({
      title: "Log out?",
      text: "You will be redirected to the login page.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, logout",
    }).then(r => {
      if (!r.isConfirmed) return;
      ["HospitalToken", "HospitalName", "HospitalId", "HospitalOrgName"]
        .forEach(k => localStorage.removeItem(k));
      navigate(LOGIN_ROUTE);
    });
  };

  // ── filter helpers ─────────────────────────────────────────────────────────
  const showDocs  = activeFilter === "ALL" || activeFilter === "DOCTORS";
  const showAppts = activeFilter === "ALL" || activeFilter === "APPOINTMENTS";
  const total     =
    (showDocs  ? results.doctors.length      : 0) +
    (showAppts ? results.appointments.length : 0);

  const TABS = [
    { id: "ALL",          label: "All",          count: results.doctors.length + results.appointments.length },
    { id: "DOCTORS",      label: "Doctors",      count: results.doctors.length      },
    { id: "APPOINTMENTS", label: "Appointments", count: results.appointments.length },
  ];

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .hosp-hdr * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
        @keyframes dropIn {
          from { opacity:0; transform:scale(.97) translateY(-6px); }
          to   { opacity:1; transform:scale(1)   translateY(0);    }
        }
        @keyframes fadeSlide {
          from { opacity:0; transform:translateY(4px); }
          to   { opacity:1; transform:translateY(0);   }
        }
        .drop-in    { animation:dropIn    .15s cubic-bezier(.16,1,.3,1) forwards; }
        .fade-slide { animation:fadeSlide .15s ease forwards; }
        .r-row      { transition:background .1s; }
        .r-row:hover{ background:#f0f9ff; }
        .s-box      { transition:border-color .2s,box-shadow .2s; }
        .s-box:focus-within {
          border-color:${ACCENT} !important;
          box-shadow:0 0 0 3px ${ACCENT}22;
        }
      `}</style>

      <header className="hosp-hdr bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between sticky top-0 z-30"
        style={{ boxShadow: "0 1px 12px rgba(14,165,233,0.07)" }}>

        {/* ── LEFT ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition shrink-0">
            <FaBars size={17} />
          </button>
          <div className="hidden sm:flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg,${ACCENT},#0284c7)` }}>
              <FaHospital size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 leading-tight truncate max-w-[200px]">
                {hospitalName}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Hospital Admin Panel</p>
            </div>
          </div>
        </div>

        {/* ── CENTER: Search ────────────────────────────────────────────── */}
        <div className="hidden md:block relative flex-1 max-w-lg mx-6" ref={wrapRef}>

          <div className="s-box flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
            style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd" }}>
            {searching
              ? <FaSpinner size={12} className="text-sky-400 animate-spin shrink-0" />
              : <FaSearch  size={12} className="text-sky-400 shrink-0" />}
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => { if (query.length >= 2) setShowDrop(true); }}
              placeholder="Search doctors, appointments…"
              className="bg-transparent w-full text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
            {query
              ? <button onClick={clearSearch} className="text-slate-300 hover:text-slate-500 transition shrink-0">
                  <FaTimes size={12} />
                </button>
              : <kbd className="hidden lg:flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-300 shrink-0"
                  style={{ border: "1px solid #e2e8f0", background: "#fff" }}>⌘K</kbd>
            }
          </div>

          {/* Dropdown */}
          {showDrop && query.length >= 2 && (
            <div className="drop-in absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white z-50 overflow-hidden"
              style={{ boxShadow: "0 20px 60px rgba(14,165,233,0.14),0 4px 16px rgba(0,0,0,0.08)", border: "1px solid #e0f2fe" }}>

              {/* Tabs */}
              <div className="flex items-center gap-1 px-3 pt-3 pb-2.5 border-b border-slate-50">
                {TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveFilter(tab.id)}
                    className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap transition shrink-0"
                    style={activeFilter === tab.id
                      ? { background: ACCENT, color: "#fff" }
                      : { background: "#f1f5f9", color: "#64748b" }}>
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="px-1 py-0.5 rounded text-[9px] font-bold"
                        style={{
                          background: activeFilter === tab.id ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                          color:      activeFilter === tab.id ? "#fff" : "#64748b",
                        }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
                <span className="ml-auto text-[10px] text-slate-400 pl-2 shrink-0">
                  {searching ? "Searching…" : `${total} result${total !== 1 ? "s" : ""}`}
                </span>
              </div>

              {/* Results */}
              {searching ? (
                <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
                  <FaSpinner className="animate-spin" size={16} style={{ color: ACCENT }} />
                  <span className="text-sm">Searching hospital records…</span>
                </div>
              ) : total === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10">
                  <FaSearch size={24} className="opacity-20" style={{ color: ACCENT }} />
                  <p className="text-sm font-semibold text-slate-600">No results for "{query}"</p>
                  <p className="text-xs text-slate-400">Try a name, specialization, phone or date</p>
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">

                  {/* Doctors */}
                  {showDocs && results.doctors.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <FaUserMd size={9} style={{ color: ACCENT }} /> Doctors &amp; Staff
                      </p>
                      {results.doctors.map((d, i) => (
                        <button key={d._id || i}
                          className="r-row fade-slide w-full flex items-center gap-3 px-4 py-3 text-left"
                          style={{ animationDelay: `${i * 25}ms` }}
                          onClick={() => { clearSearch(); navigate("/hospital-dashboard/doctors"); }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: `linear-gradient(135deg,${ACCENT},#0284c7)` }}>
                            {(d.name || "D")[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-800 text-xs font-semibold truncate">{d.name || "—"}</p>
                            <p className="text-slate-400 text-[10px] flex items-center gap-1.5 truncate">
                              <FaStethoscope size={8} />
                              {d.specialization || d.role || "—"}
                              {d.phone && <> · {d.phone}</>}
                              {d.consultation_fee != null && <> · ₹{d.consultation_fee}</>}
                            </p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[d.status] || "bg-slate-100 text-slate-500"}`}>
                            {d.status || "ACTIVE"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Appointments */}
                  {showAppts && results.appointments.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <FaCalendarAlt size={9} style={{ color: ACCENT }} /> Appointments
                      </p>
                      {results.appointments.map((a, i) => (
                        <button key={a._id || i}
                          className="r-row fade-slide w-full flex items-center gap-3 px-4 py-3 text-left"
                          style={{ animationDelay: `${(results.doctors.length + i) * 25}ms` }}
                          onClick={() => { clearSearch(); navigate("/hospital-dashboard/appointments"); }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: "linear-gradient(135deg,#d97706,#b45309)" }}>
                            {(a.patient_id?.patient_name || "A")[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-800 text-xs font-semibold truncate">
                              {a.patient_id?.patient_name || "—"}
                            </p>
                            <p className="text-slate-400 text-[10px] flex items-center gap-1.5 truncate">
                              <FaCalendarAlt size={8} /> {fmt(a.appointment_date)}
                              <FaClock size={8} /> {a.start_time}–{a.end_time}
                              {a.doctor_id?.name && <> · {a.doctor_id.name}</>}
                            </p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[a.appointment_status] || "bg-slate-100 text-slate-500"}`}>
                            {a.appointment_status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              {!searching && total > 0 && (
                <div className="px-4 py-2.5 border-t border-slate-50 flex items-center justify-between"
                  style={{ background: "#fafcff" }}>
                  <p className="text-[10px] text-slate-400">
                    Click a result to navigate ·{" "}
                    <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ border: "1px solid #e2e8f0" }}>Esc</kbd>{" "}
                    to close
                  </p>
                  <FaChevronRight size={9} className="text-slate-300" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">

          {/* Mobile search */}
          <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition">
            <FaSearch size={15} />
          </button>

          {/* Bell */}
          <div className="relative">
            <button onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition">
              <FaBell size={16} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full text-white font-bold"
                  style={{ background: "#ef4444", border: "2px solid #fff", fontSize: 8 }}>
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="drop-in absolute right-0 mt-2 w-80 bg-white rounded-2xl overflow-hidden z-50"
                style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.12)", border: "1px solid #e0f2fe" }}>
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between"
                  style={{ background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)" }}>
                  <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unread > 0 && (
                      <span className="px-2 py-0.5 text-white text-[10px] font-bold rounded-full"
                        style={{ background: ACCENT }}>{unread} new</span>
                    )}
                    {unread > 0 && (
                      <button onClick={markAllRead}
                        className="text-[10px] text-slate-400 hover:text-slate-600 font-medium transition">
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                  {notifications.map((n, i) => (
                    <div key={i}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-sky-50 cursor-pointer transition"
                      style={{ background: n.read ? "transparent" : "#f0f9ff" }}>
                      <div className={`w-2 h-2 ${n.dot} rounded-full mt-1.5 shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs truncate ${n.read ? "text-slate-500" : "text-slate-700 font-semibold"}`}>
                          {n.msg}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                      {!n.read && (
                        <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: ACCENT }} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-50">
                  <button className="w-full py-2 text-xs font-semibold rounded-xl hover:bg-sky-50 transition"
                    style={{ color: ACCENT }}>
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-sky-50 transition">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                style={{ background: `linear-gradient(135deg,${ACCENT},#0284c7)` }}>
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-700 leading-tight max-w-[120px] truncate">{adminName}</p>
                <p className="text-[10px] text-slate-400">Hospital Admin</p>
              </div>
            </button>

            {showProfile && (
              <div className="drop-in absolute right-0 mt-2 w-52 bg-white rounded-2xl overflow-hidden z-50"
                style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.12)", border: "1px solid #e0f2fe" }}>
                <div className="px-4 py-3.5 border-b border-slate-100"
                  style={{ background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: `linear-gradient(135deg,${ACCENT},#0284c7)` }}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{adminName}</p>
                      <p className="text-[10px] font-medium" style={{ color: ACCENT }}>Hospital Admin</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 space-y-0.5">
                  <button
                    onClick={() => { navigate("/hospital-dashboard/account"); setShowProfile(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-600 hover:bg-sky-50 rounded-xl transition">
                    <FaUserCog size={13} className="text-slate-400" /> My Account
                  </button>
                 
                  <div className="my-1 border-t border-slate-100" />
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition">
                    <FaSignOutAlt size={13} /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop */}
      {(showNotif || showProfile) && (
        <div className="fixed inset-0 z-20"
          onClick={() => { setShowNotif(false); setShowProfile(false); }} />
      )}
    </>
  );
};

export default HospitalHeader;