import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaUserInjured, FaFileMedical, FaWalking, FaPlus, FaTimes,
  FaChevronRight, FaCalendarAlt, FaClock, FaPhone, FaEnvelope,
  FaPills, FaNotesMedical, FaHeartbeat, FaStethoscope, FaEdit,
  FaSpinner, FaSearch, FaChevronDown, FaChevronUp,
  FaCalendarCheck, FaCheckCircle, FaLayerGroup, FaBan, FaSyncAlt
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

const BASE  = "http://localhost:5000/staffapi";
const hdrs  = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("StaffToken")}` } });
const COLOR = "#2563eb";
const iCls  = "w-full px-3 py-2.5 rounded-xl text-sm text-slate-700 outline-none placeholder-slate-400 transition";
const iSty  = { background: "#f8fafc", border: "1.5px solid #e2e8f0" };
const fmt   = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const Spin = () => (
  <div className="flex items-center justify-center py-16">
    <FaSpinner className="animate-spin text-2xl" style={{ color: COLOR }} />
  </div>
);

const Empty = ({ icon, msg, sub }) => (
  <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
    <div className="text-5xl opacity-15">{icon}</div>
    <p className="text-sm font-semibold text-slate-500">{msg}</p>
    {sub && <p className="text-xs text-slate-400 text-center max-w-xs">{sub}</p>}
  </div>
);

const groupSlotsByDate = (slots) => {
  const map = {};
  slots.forEach(s => {
    const key = s.appointment_date ? new Date(s.appointment_date).toDateString() : "Unknown Date";
    if (!map[key]) map[key] = [];
    map[key].push(s);
  });
  return Object.entries(map).sort(([a], [b]) => new Date(a) - new Date(b));
};

const apptStatusCfg = (status) => ({
  SCHEDULED:   { bg: "#dbeafe", color: "#1d4ed8", label: "Scheduled",   icon: <FaCalendarCheck size={9} /> },
  PENDING:     { bg: "#fef3c7", color: "#b45309", label: "Pending",     icon: <FaClock size={9} /> },
  COMPLETED:   { bg: "#d1fae5", color: "#065f46", label: "Completed",   icon: <FaCheckCircle size={9} /> },
  CANCELLED:   { bg: "#fee2e2", color: "#b91c1c", label: "Cancelled",   icon: <FaBan size={9} /> },
  RESCHEDULED: { bg: "#ede9fe", color: "#5b21b6", label: "Rescheduled", icon: <FaSyncAlt size={9} /> },
}[status] || { bg: "#f1f5f9", color: "#475569", label: status || "—", icon: null });

// ── Follow-up card ────────────────────────────────────────────────────────────
const FollowUpCard = ({ appt, idx, expanded, onToggle, isUpcoming }) => {
  const s        = apptStatusCfg(appt.appointment_status);
  const apptDate = new Date(appt.appointment_date);
  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const isToday  = apptDate.toDateString() === today.toDateString();
  const isTom    = apptDate.toDateString() === tomorrow.toDateString();
  const dayLabel = isToday ? "Today" : isTom ? "Tmrw" : apptDate.toLocaleDateString("en-IN", { weekday: "short" });

  return (
    <div className="bg-white rounded-2xl border overflow-hidden"
      style={{
        borderColor: isUpcoming && isToday ? COLOR : "#f1f5f9",
        boxShadow:   isUpcoming && isToday ? `0 0 0 2px ${COLOR}20` : "0 1px 6px rgba(0,0,0,0.04)",
      }}>
      <div className="hist-row flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={() => onToggle(expanded ? null : idx)}>
        <div className="shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white text-center font-bold"
          style={{ background: isUpcoming ? `linear-gradient(135deg, ${COLOR}, #1e40af)` : "#94a3b8" }}>
          <span className="text-[10px] leading-none">{dayLabel}</span>
          <span className="text-xl leading-none mt-0.5">{apptDate.getDate()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-slate-800 text-sm font-bold">
              {appt.start_time}{appt.end_time ? ` – ${appt.end_time}` : ""}
            </p>
            {isToday && isUpcoming && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 animate-pulse">
                TODAY
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
            <FaCalendarAlt size={9} /> {fmt(appt.appointment_date)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full border"
            style={{ background: s.bg, color: s.color, borderColor: s.color + "30" }}>
            {s.icon} {s.label}
          </span>
          {expanded ? <FaChevronUp size={11} className="text-slate-400" /> : <FaChevronDown size={11} className="text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4 border-t border-slate-50">
          <div className="grid grid-cols-2 gap-3 mt-3">
            {[
              { label: "Date",     value: fmt(appt.appointment_date),                                         color: COLOR,     icon: <FaCalendarAlt size={10} /> },
              { label: "Time",     value: `${appt.start_time}${appt.end_time ? ` – ${appt.end_time}` : ""}`, color: "#7c3aed", icon: <FaClock size={10} /> },
              { label: "Status",   value: s.label,                                                            color: s.color,   icon: s.icon },
              { label: "Hospital", value: appt.hospital_id?.hospital_name || "—",                             color: "#059669", icon: null },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="p-3 rounded-xl" style={{ background: "#f8fafc", borderLeft: `3px solid ${color}30` }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-1 flex items-center gap-1" style={{ color }}>
                  {icon} {label}
                </p>
                <p className="text-slate-700 text-xs font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const PatientHistory = () => {
  const [patients,      setPatients]      = useState([]);
  const [patientsLoad,  setPatientsLoad]  = useState(true);
  const [selected,      setSelected]      = useState(null);
  const [activeTab,     setActiveTab]     = useState("history");
  const [histories,     setHistories]     = useState([]);
  const [histLoad,      setHistLoad]      = useState(false);
  const [visits,        setVisits]        = useState([]);
  const [visitsLoad,    setVisitsLoad]    = useState(false);
  const [followUps,     setFollowUps]     = useState([]);
  const [followUpsLoad, setFollowUpsLoad] = useState(false);
  const [allMyAppts,    setAllMyAppts]    = useState([]);
  const [search,        setSearch]        = useState("");
  const [expandedHist,  setExpandedHist]  = useState(null);
  const [expandedVisit, setExpandedVisit] = useState(null);
  const [expandedFU,    setExpandedFU]    = useState(null);

  const [showHistModal,  setShowHistModal]  = useState(false);
  const [editHist,       setEditHist]       = useState(null);
  const [histForm,       setHistForm]       = useState({ diagnosis: "", medications: "", notes: "" });
  const [histSaving,     setHistSaving]     = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitForm,      setVisitForm]      = useState({ symptoms: "", diagnosis: "", treatment: "", visit_date: "" });
  const [visitSaving,    setVisitSaving]    = useState(false);

  const [showFollowUp, setShowFollowUp] = useState(false);
  const [mySlots,      setMySlots]      = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingSlot,  setBookingSlot]  = useState(false);
  const [slotSearch,   setSlotSearch]   = useState("");

  const now = new Date();

  useEffect(() => { loadPatients(); }, []);

  // ✅ FIXED: forEach callback was never closed — missing }); before setPatients
  // ✅ FIXED: setPatients(unique) was inside the forEach, now correctly outside it
  const loadPatients = async () => {
    setPatientsLoad(true);
    try {
      const { data } = await axios.get(`${BASE}/my-appointments`, hdrs());
      const appts = data.appointments || [];
      setAllMyAppts(appts);

      const seen   = new Set();
      const unique = [];

      appts.forEach(a => {
        const p = a.patient_id;
        if (p && p._id && !seen.has(p._id)) {
          seen.add(p._id);
          unique.push({
            ...p,
            lastVisit:  a.appointment_date,
            lastStatus: a.appointment_status,
            lastApptId: a._id,
            totalAppts: appts.filter(x => x.patient_id?._id === p._id).length,
          });
        }
      }); // ✅ forEach closed here

      setPatients(unique); // ✅ now outside forEach
      return appts;
    } catch {
      Swal.fire({ icon: "error", title: "Failed to load patients" });
      return [];
    } finally {
      setPatientsLoad(false);
    }
  };

  useEffect(() => {
    if (!selected) return;
    loadHistory(selected._id);
    loadVisits(selected._id);
    loadFollowUps(selected._id, allMyAppts);
  }, [selected]);

  const loadHistory = async (pid) => {
    setHistLoad(true);
    try {
      const { data } = await axios.get(`${BASE}/patient-history/${pid}`, hdrs());
      setHistories(data.histories || []);
    } catch { setHistories([]); }
    finally { setHistLoad(false); }
  };

  const loadVisits = async (pid) => {
    setVisitsLoad(true);
    try {
      const { data } = await axios.get(`${BASE}/my-patient-visits`, hdrs());
      setVisits((data.visits || []).filter(v => v.patient_id?._id === pid || v.patient_id === pid));
    } catch { setVisits([]); }
    finally { setVisitsLoad(false); }
  };

  const loadFollowUps = async (pid, appts) => {
    setFollowUpsLoad(true);
    try {
      let src = appts?.length ? appts : allMyAppts;
      if (!src.length) {
        const { data } = await axios.get(`${BASE}/my-appointments`, hdrs());
        src = data.appointments || [];
        setAllMyAppts(src);
      }
      const filtered = src
        .filter(a => a.patient_id?._id === pid || a.patient_id === pid)
        .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
      setFollowUps(filtered);
    } catch { setFollowUps([]); }
    finally { setFollowUpsLoad(false); }
  };

  const openFollowUpModal = async () => {
    setShowFollowUp(true); setSelectedSlot(null); setSlotSearch(""); setSlotsLoading(true);
    try {
      const { data } = await axios.get(`${BASE}/my-slots`, hdrs());
      setMySlots((data.slots || []).filter(s => s.slot_status === "AVAILABLE" && new Date(s.appointment_date) >= now));
    } catch {
      Swal.fire({ icon: "error", title: "Failed to load slots" });
      setShowFollowUp(false);
    } finally { setSlotsLoading(false); }
  };

  const handleBookFollowUp = async () => {
    if (!selectedSlot) return;
    setBookingSlot(true);
    try {
      await axios.post(`${BASE}/book-followup`, { patient_id: selected._id, slotId: selectedSlot._id }, hdrs());
      setShowFollowUp(false); setSelectedSlot(null);
      Swal.fire({
        icon: "success", title: "Follow-up Booked!",
        html: `<p>Scheduled for <b>${fmt(selectedSlot.appointment_date)}</b> at <b>${selectedSlot.start_time}</b>.</p>`,
        timer: 2200, showConfirmButton: false,
      });
      const appts = await loadPatients();
      loadFollowUps(selected._id, appts);
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Failed to book", "error");
    } finally { setBookingSlot(false); }
  };

  const filteredSlots = mySlots.filter(s =>
    !slotSearch ||
    fmt(s.appointment_date).toLowerCase().includes(slotSearch.toLowerCase()) ||
    (s.start_time || "").toLowerCase().includes(slotSearch.toLowerCase())
  );
  const groupedSlots = groupSlotsByDate(filteredSlots);
  const today0       = new Date(new Date().setHours(0, 0, 0, 0));
  const upcomingFU   = followUps.filter(a => new Date(a.appointment_date) >= today0 && !["CANCELLED", "COMPLETED"].includes(a.appointment_status));
  const pastFU       = followUps.filter(a => new Date(a.appointment_date) < today0  ||  ["CANCELLED", "COMPLETED"].includes(a.appointment_status));
  const filteredPats = patients.filter(p => {
    const q = search.toLowerCase();
    return !q || (p.patient_name || "").toLowerCase().includes(q) || (p.patient_email || "").toLowerCase().includes(q) || (p.patient_phone || "").includes(q);
  });

  const onFocus = e => (e.target.style.borderColor = COLOR);
  const onBlur  = e => (e.target.style.borderColor = "#e2e8f0");

  const submitHistory = async (e) => {
    e.preventDefault(); setHistSaving(true);
    try {
      if (editHist) {
        await axios.put(`${BASE}/update-case-history`, { historyId: editHist._id, ...histForm }, hdrs());
        Swal.fire({ icon: "success", title: "Updated!", timer: 1400, showConfirmButton: false });
      } else {
        await axios.post(`${BASE}/add-case-history`, { patient_id: selected._id, appointment_id: selected.lastApptId, ...histForm }, hdrs());
        Swal.fire({ icon: "success", title: "Added!", timer: 1400, showConfirmButton: false });
      }
      setShowHistModal(false); setEditHist(null); setHistForm({ diagnosis: "", medications: "", notes: "" });
      loadHistory(selected._id);
    } catch (err) { Swal.fire({ icon: "error", title: err?.response?.data?.message || "Failed to save" }); }
    finally { setHistSaving(false); }
  };

  const submitVisit = async (e) => {
    e.preventDefault(); setVisitSaving(true);
    try {
      await axios.post(`${BASE}/add-patient-visit`, { patient_id: selected._id, ...visitForm, visit_date: visitForm.visit_date || undefined }, hdrs());
      Swal.fire({ icon: "success", title: "Visit logged!", timer: 1400, showConfirmButton: false });
      setShowVisitModal(false); setVisitForm({ symptoms: "", diagnosis: "", treatment: "", visit_date: "" });
      loadVisits(selected._id);
    } catch (err) { Swal.fire({ icon: "error", title: err?.response?.data?.message || "Failed to save" }); }
    finally { setVisitSaving(false); }
  };

  const Modal = ({ title, subtitle, onClose, onSubmit, saving, submitLabel, submitIcon, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(8px)", background: "rgba(15,23,42,0.65)" }} onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-slate-800 font-bold text-base">{title}</h3>
            {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition">
            <FaTimes size={14} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {children}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition" style={{ background: `linear-gradient(135deg, ${COLOR}, #1d4ed8)` }}>
              {saving ? <><FaSpinner className="animate-spin" size={12} /> Saving…</> : <>{submitIcon} {submitLabel}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const TA = ({ label, fieldKey, value, onChange, required = false, placeholder, icon, rows = 2 }) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
        <span style={{ color: COLOR }}>{icon}</span>{label}
      </label>
      <textarea rows={rows} required={required} value={value}
        onChange={e => onChange(fieldKey, e.target.value)}
        placeholder={placeholder}
        className={`${iCls} resize-none`} style={iSty} onFocus={onFocus} onBlur={onBlur} />
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        .ph-root * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
        .fade-up  { animation:fadeUp  0.2s ease forwards; }
        .slide-in { animation:slideIn 0.2s ease forwards; }
        .pat-card { transition:all 0.15s ease; }
        .pat-card:hover { transform:translateY(-1px); }
        .hist-row { transition:background 0.15s; }
        .hist-row:hover { background:#f8fafc; }
        .slot-card { border:2px solid #e2e8f0; border-radius:12px; padding:11px 14px; cursor:pointer; transition:all 0.15s; }
        .slot-card:hover    { border-color:#2563eb; background:#eff6ff; }
        .slot-card.selected { border-color:#2563eb; background:#eff6ff; box-shadow:0 0 0 3px rgba(37,99,235,0.12); }
        .sec-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#94a3b8; margin-bottom:10px; display:flex; align-items:center; gap:6px; }
        .sec-label::after { content:''; flex:1; height:1px; background:#f1f5f9; }
      `}</style>

      <div className="ph-root fade-up flex gap-5" style={{ minHeight: "80vh" }}>

        {/* ── LEFT: patient list ───────────────────────────────────────── */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-slate-800 text-lg font-bold" style={{ fontFamily: "'Playfair Display',serif" }}>My Patients</h2>
              <p className="text-slate-400 text-xs">{patients.length} patient{patients.length !== 1 ? "s" : ""}</p>
            </div>
            <button onClick={loadPatients} type="button" className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 transition border border-slate-200 bg-white">
              <MdRefresh size={15} className={patientsLoad ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="relative">
            <FaSearch size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input placeholder="Search patients…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm text-slate-700 outline-none placeholder-slate-400"
              style={iSty} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto pr-0.5" style={{ maxHeight: "72vh" }}>
            {patientsLoad ? <Spin /> : filteredPats.length === 0 ? (
              <Empty icon={<FaUserInjured />} msg="No patients found" />
            ) : filteredPats.map((p, i) => (
              <div key={p._id || i} role="button" tabIndex={0}
                onClick={() => { setSelected(p); setActiveTab("history"); setExpandedHist(null); setExpandedVisit(null); setExpandedFU(null); }}
                onKeyDown={e => e.key === "Enter" && setSelected(p)}
                className="pat-card text-left p-3.5 rounded-2xl border cursor-pointer"
                style={{
                  background:  selected?._id === p._id ? `${COLOR}08` : "#fff",
                  borderColor: selected?._id === p._id ? COLOR : "#e2e8f0",
                  boxShadow:   selected?._id === p._id ? `0 0 0 1.5px ${COLOR}30` : "0 1px 4px rgba(0,0,0,0.04)",
                }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: `linear-gradient(135deg, ${COLOR}, #1d4ed8)` }}>
                    {(p.patient_name || "P")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-xs font-bold truncate">{p.patient_name || "—"}</p>
                    <p className="text-slate-400 text-[10px] truncate">{p.patient_email || p.patient_phone || ""}</p>
                  </div>
                  <FaChevronRight size={9} className="text-slate-300 shrink-0" />
                </div>
                <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400"><span className="font-bold text-slate-600">{p.totalAppts}</span> appts</span>
                  {p.lastVisit && <span className="text-[10px] text-slate-400">Last: {fmt(p.lastVisit)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: detail panel ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 rounded-2xl border border-slate-200 bg-white" style={{ minHeight: 400 }}>
              <FaUserInjured size={44} className="opacity-15" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600">No patient selected</p>
                <p className="text-xs text-slate-400 mt-1">Choose a patient from the left panel</p>
              </div>
            </div>
          ) : (
            <div className="slide-in space-y-4">

              {/* Banner */}
              <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLOR} 0%, #1e40af 100%)` }}>
                <div className="absolute right-0 top-0 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: "#fff", transform: "translate(30%,-40%)" }} />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)" }}>
                    {(selected.patient_name || "P")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-xl font-bold" style={{ fontFamily: "'Playfair Display',serif" }}>{selected.patient_name}</h3>
                    <div className="flex flex-wrap gap-4 mt-1.5">
                      {selected.patient_phone && <span className="flex items-center gap-1 text-white/70 text-xs"><FaPhone size={9} /> {selected.patient_phone}</span>}
                      {selected.patient_email && <span className="flex items-center gap-1 text-white/70 text-xs"><FaEnvelope size={9} /> {selected.patient_email}</span>}
                      {selected.patient_gender && <span className="text-white/60 text-xs capitalize">{selected.patient_gender}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button type="button" onClick={openFollowUpModal}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition"
                      style={{ background: "#fff", color: COLOR, boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>
                      <FaCalendarCheck size={11} /> Book Follow-up
                    </button>
                    <button type="button" onClick={() => { setShowHistModal(true); setEditHist(null); setHistForm({ diagnosis: "", medications: "", notes: "" }); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition"
                      style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }}>
                      <FaPlus size={10} /> Case History
                    </button>
                    <button type="button" onClick={() => { setShowVisitModal(true); setVisitForm({ symptoms: "", diagnosis: "", treatment: "", visit_date: "" }); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition"
                      style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }}>
                      <FaPlus size={10} /> Log Visit
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {[
                  { id: "history",   label: "Case History",    icon: <FaFileMedical size={12} />,   count: histories.length,  badge: null },
                  { id: "visits",    label: "Patient Visits",  icon: <FaWalking size={12} />,        count: visits.length,     badge: null },
                  { id: "followups", label: "Follow-up Appts", icon: <FaCalendarCheck size={12} />, count: followUps.length,  badge: upcomingFU.length || null },
                ].map(tab => (
                  <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition relative"
                    style={activeTab === tab.id
                      ? { background: COLOR, color: "#fff", boxShadow: `0 4px 14px ${COLOR}40` }
                      : { background: "#fff", color: "#64748b", border: "1.5px solid #e2e8f0" }}>
                    {tab.icon} {tab.label}
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: activeTab === tab.id ? "rgba(255,255,255,0.22)" : "#f1f5f9", color: activeTab === tab.id ? "#fff" : "#64748b" }}>
                      {tab.count}
                    </span>
                    {tab.badge && activeTab !== tab.id && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Case History */}
              {activeTab === "history" && (
                <div className="space-y-3">
                  {histLoad ? <Spin /> : histories.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-2">
                      <Empty icon={<FaFileMedical />} msg="No case history yet" sub="Click '+ Case History' to add one" />
                    </div>
                  ) : histories.map((h, i) => (
                    <div key={h._id || i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                      <div className="hist-row flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setExpandedHist(expandedHist === i ? null : i)}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${COLOR}12`, color: COLOR }}><FaFileMedical size={13} /></div>
                          <div className="min-w-0">
                            <p className="text-slate-800 text-sm font-bold truncate">{h.diagnosis || "—"}</p>
                            <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                              <FaCalendarAlt size={9} />
                              {h.appointment_id?.appointment_date ? fmt(h.appointment_id.appointment_date) : fmt(h.createdAt)}
                              {h.appointment_id?.start_time && ` · ${h.appointment_id.start_time}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <button type="button" onClick={e => { e.stopPropagation(); setEditHist(h); setHistForm({ diagnosis: h.diagnosis || "", medications: h.medications || "", notes: h.notes || "" }); setShowHistModal(true); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition">
                            <FaEdit size={12} />
                          </button>
                          {expandedHist === i ? <FaChevronUp size={11} className="text-slate-400" /> : <FaChevronDown size={11} className="text-slate-400" />}
                        </div>
                      </div>
                      {expandedHist === i && (
                        <div className="px-5 pb-5 grid sm:grid-cols-3 gap-3 border-t border-slate-50">
                          {[
                            { l: "Diagnosis",   v: h.diagnosis   || "—", c: "#dc2626", icon: <FaStethoscope size={10} /> },
                            { l: "Medications", v: h.medications || "—", c: "#d97706", icon: <FaPills size={10} /> },
                            { l: "Notes",       v: h.notes       || "—", c: "#059669", icon: <FaNotesMedical size={10} /> },
                          ].map(f => (
                            <div key={f.l} className="p-3 rounded-xl mt-3" style={{ background: "#f8fafc", borderLeft: `3px solid ${f.c}40` }}>
                              <p className="text-xs font-bold mb-1.5 flex items-center gap-1" style={{ color: f.c }}>{f.icon} {f.l}</p>
                              <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">{f.v}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Patient Visits */}
              {activeTab === "visits" && (
                <div className="space-y-3">
                  {visitsLoad ? <Spin /> : visits.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-2">
                      <Empty icon={<FaWalking />} msg="No visits logged yet" sub="Click '+ Log Visit' to add one" />
                    </div>
                  ) : visits.map((v, i) => (
                    <div key={v._id || i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                      <div className="hist-row flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setExpandedVisit(expandedVisit === i ? null : i)}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#7c3aed12", color: "#7c3aed" }}><FaWalking size={13} /></div>
                          <div className="min-w-0">
                            <p className="text-slate-800 text-sm font-bold truncate">{v.diagnosis || "—"}</p>
                            <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5"><FaClock size={9} /> {fmt(v.visit_date || v.createdAt)}</p>
                          </div>
                        </div>
                        {expandedVisit === i ? <FaChevronUp size={11} className="text-slate-400 shrink-0 ml-2" /> : <FaChevronDown size={11} className="text-slate-400 shrink-0 ml-2" />}
                      </div>
                      {expandedVisit === i && (
                        <div className="px-5 pb-5 grid sm:grid-cols-3 gap-3 border-t border-slate-50">
                          {[
                            { l: "Symptoms",  v: v.symptoms  || "—", c: "#7c3aed", icon: <FaHeartbeat size={10} /> },
                            { l: "Diagnosis", v: v.diagnosis || "—", c: "#dc2626", icon: <FaStethoscope size={10} /> },
                            { l: "Treatment", v: v.treatment || "—", c: "#059669", icon: <FaPills size={10} /> },
                          ].map(f => (
                            <div key={f.l} className="p-3 rounded-xl mt-3" style={{ background: "#f8fafc", borderLeft: `3px solid ${f.c}40` }}>
                              <p className="text-xs font-bold mb-1.5 flex items-center gap-1" style={{ color: f.c }}>{f.icon} {f.l}</p>
                              <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">{f.v}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-up Appointments */}
              {activeTab === "followups" && (
                <div className="space-y-4">
                  {followUpsLoad ? <Spin /> : followUps.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-2">
                      <Empty icon={<FaCalendarCheck />} msg="No appointments yet" sub="Book a follow-up using the 'Book Follow-up' button above" />
                    </div>
                  ) : (
                    <>
                      {upcomingFU.length > 0 && (
                        <div>
                          <div className="sec-label"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block shrink-0" /> Upcoming · {upcomingFU.length}</div>
                          <div className="space-y-3">
                            {upcomingFU.map((appt, i) => (
                              <FollowUpCard key={appt._id || i} appt={appt} idx={`up-${i}`} expanded={expandedFU === `up-${i}`} onToggle={setExpandedFU} isUpcoming={true} />
                            ))}
                          </div>
                        </div>
                      )}
                      {pastFU.length > 0 && (
                        <div>
                          <div className="sec-label"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block shrink-0" /> Past &amp; Completed · {pastFU.length}</div>
                          <div className="space-y-3">
                            {pastFU.map((appt, i) => (
                              <FollowUpCard key={appt._id || i} appt={appt} idx={`past-${i}`} expanded={expandedFU === `past-${i}`} onToggle={setExpandedFU} isUpcoming={false} />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Case History Modal */}
      {showHistModal && (
        <Modal title={editHist ? "Edit Case History" : "Add Case History"} subtitle={`Patient: ${selected?.patient_name}`}
          onClose={() => { setShowHistModal(false); setEditHist(null); }} onSubmit={submitHistory}
          saving={histSaving} submitLabel={editHist ? "Update History" : "Save History"} submitIcon={<FaFileMedical size={12} />}>
          <TA label="Diagnosis *"   fieldKey="diagnosis"   value={histForm.diagnosis}   onChange={(k,v)=>setHistForm(p=>({...p,[k]:v}))} required placeholder="Enter diagnosis…"        icon={<FaStethoscope size={12}/>}/>
          <TA label="Medications *" fieldKey="medications" value={histForm.medications} onChange={(k,v)=>setHistForm(p=>({...p,[k]:v}))} required placeholder="Medications prescribed…" icon={<FaPills size={12}/>}/>
          <TA label="Notes"         fieldKey="notes"       value={histForm.notes}       onChange={(k,v)=>setHistForm(p=>({...p,[k]:v}))}         placeholder="Additional notes…"        icon={<FaNotesMedical size={12}/>} rows={3}/>
        </Modal>
      )}

      {/* Visit Modal */}
      {showVisitModal && (
        <Modal title="Log Patient Visit" subtitle={`Patient: ${selected?.patient_name}`}
          onClose={() => setShowVisitModal(false)} onSubmit={submitVisit}
          saving={visitSaving} submitLabel="Log Visit" submitIcon={<FaWalking size={12} />}>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Visit Date</label>
            <input type="date" value={visitForm.visit_date} onChange={e => setVisitForm(f => ({ ...f, visit_date: e.target.value }))} className={iCls} style={iSty} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <TA label="Symptoms *"  fieldKey="symptoms"  value={visitForm.symptoms}  onChange={(k,v)=>setVisitForm(p=>({...p,[k]:v}))} required placeholder="Describe symptoms…" icon={<FaHeartbeat size={12}/>}/>
          <TA label="Diagnosis *" fieldKey="diagnosis" value={visitForm.diagnosis} onChange={(k,v)=>setVisitForm(p=>({...p,[k]:v}))} required placeholder="Enter diagnosis…"   icon={<FaStethoscope size={12}/>}/>
          <TA label="Treatment *" fieldKey="treatment" value={visitForm.treatment} onChange={(k,v)=>setVisitForm(p=>({...p,[k]:v}))} required placeholder="Treatment plan…"    icon={<FaPills size={12}/>}/>
        </Modal>
      )}

      {/* Follow-up Booking Modal */}
      {showFollowUp && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(8px)", background: "rgba(15,23,42,0.65)" }} onClick={() => setShowFollowUp(false)}>
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: "88vh" }} onClick={e => e.stopPropagation()}>
            <div style={{ background: `linear-gradient(135deg, ${COLOR}, #1e40af)` }} className="px-6 py-5 flex items-start justify-between shrink-0">
              <div>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Book Follow-up Appointment</p>
                <h2 className="text-white font-bold text-lg">{selected.patient_name}</h2>
                <p className="text-blue-200 text-xs mt-1 flex items-center gap-3">
                  {selected.patient_phone && <span><FaPhone size={9} className="inline mr-1" />{selected.patient_phone}</span>}
                  {selected.patient_email && <span><FaEnvelope size={9} className="inline mr-1" />{selected.patient_email}</span>}
                </p>
              </div>
              <button onClick={() => setShowFollowUp(false)} className="text-white/60 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition ml-4">
                <FaTimes size={16} />
              </button>
            </div>
            <div className="px-6 pt-5 pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                <FaSearch size={12} className="text-slate-400 shrink-0" />
                <input placeholder="Search by date or time…" value={slotSearch} onChange={e => setSlotSearch(e.target.value)}
                  className="bg-transparent w-full text-sm text-slate-600 placeholder-slate-400 outline-none" />
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                <FaLayerGroup size={9} className="inline mr-1" />
                {filteredSlots.length} available slot{filteredSlots.length !== 1 ? "s" : ""} — select one for the follow-up
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {slotsLoading ? (
                <div className="flex items-center justify-center py-12"><FaSpinner className="animate-spin text-2xl" style={{ color: COLOR }} /></div>
              ) : groupedSlots.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
                  <FaCalendarAlt size={36} className="opacity-20" />
                  <p className="text-sm font-semibold text-slate-500">No available slots</p>
                  <p className="text-xs text-slate-400 text-center">Ask your hospital admin to add appointment slots for you.</p>
                </div>
              ) : groupedSlots.map(([dateStr, slots]) => (
                <div key={dateStr} className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FaCalendarAlt size={11} style={{ color: COLOR }} />
                    <p className="text-xs font-bold text-slate-700">{new Date(dateStr).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                    <div className="flex-1 h-px bg-slate-100 ml-1" />
                    <span className="text-[10px] text-slate-400 font-medium">{slots.length} slot{slots.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map(slot => {
                      const isSel = selectedSlot?._id === slot._id;
                      return (
                        <div key={slot._id} className={`slot-card ${isSel ? "selected" : ""}`} onClick={() => setSelectedSlot(isSel ? null : slot)}>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSel ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
                              {isSel && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <FaClock size={9} className="text-slate-400" />
                          </div>
                          <p className="text-sm font-bold text-slate-800">{slot.start_time}</p>
                          {slot.end_time && <p className="text-[10px] text-slate-400 mt-0.5">until {slot.end_time}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 shrink-0">
              {selectedSlot && (
                <div className="flex items-center gap-3 mb-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <FaCheckCircle size={14} style={{ color: COLOR }} className="shrink-0" />
                  <div className="flex-1 text-sm">
                    <span className="font-semibold text-blue-800">Selected: </span>
                    <span className="text-blue-700">
                      {new Date(selectedSlot.appointment_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                      {" · "}{selectedSlot.start_time}{selectedSlot.end_time ? ` – ${selectedSlot.end_time}` : ""}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowFollowUp(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold transition">Cancel</button>
                <button onClick={handleBookFollowUp} disabled={!selectedSlot || bookingSlot}
                  className="flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: !selectedSlot || bookingSlot ? "#93c5fd" : `linear-gradient(135deg, ${COLOR}, #1d4ed8)` }}>
                  {bookingSlot ? <><FaSpinner className="animate-spin" size={12} /> Booking…</> : <><FaCalendarCheck size={12} /> Confirm Follow-up</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientHistory;