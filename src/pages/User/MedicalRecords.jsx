import { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import {
  FaFileMedical, FaWalking, FaCalendarCheck, FaStethoscope,
  FaPills, FaNotesMedical, FaHeartbeat, FaHospital, FaUserMd,
  FaCalendarAlt, FaClock, FaChevronDown, FaChevronUp,
  FaSpinner, FaCheckCircle, FaBan, FaSyncAlt, FaSearch,
  FaMapMarkerAlt, FaPhone,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

const BASE    = "https://carexa-backend.vercel.app/api";
const hdrs    = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("UserToken")}` } });
const ACCENT  = "#2563eb";
const PER_PAGE = 5;

const fmt     = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—";
const fmtFull = (d) => d ? new Date(d).toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" }) : "—";

const statusCfg = (s) => ({
  SCHEDULED:   { bg:"#dbeafe", color:"#1d4ed8", label:"Scheduled",   icon:<FaCalendarCheck size={9}/> },
  PENDING:     { bg:"#fef3c7", color:"#b45309", label:"Pending",     icon:<FaClock size={9}/> },
  COMPLETED:   { bg:"#d1fae5", color:"#065f46", label:"Completed",   icon:<FaCheckCircle size={9}/> },
  CANCELLED:   { bg:"#fee2e2", color:"#b91c1c", label:"Cancelled",   icon:<FaBan size={9}/> },
  RESCHEDULED: { bg:"#ede9fe", color:"#5b21b6", label:"Rescheduled", icon:<FaSyncAlt size={9}/> },
}[s] || { bg:"#f1f5f9", color:"#475569", label:s||"—", icon:null });

const Spin = () => (
  <div className="flex items-center justify-center py-12">
    <FaSpinner className="animate-spin text-2xl" style={{ color:ACCENT }}/>
  </div>
);

const Empty = ({ icon, title, sub }) => (
  <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
    <div className="text-4xl opacity-15">{icon}</div>
    <div className="text-center">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      {sub && <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">{sub}</p>}
    </div>
  </div>
);

const Badge = ({ status }) => {
  const c = statusCfg(status);
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full border"
      style={{ background:c.bg, color:c.color, borderColor:c.color+"30" }}>
      {c.icon} {c.label}
    </span>
  );
};

const SectionCard = ({ icon, iconBg, iconColor, title, subtitle, children, defaultOpen=false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden" style={{ boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
      <button type="button" onClick={() => setOpen(o=>!o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition text-left">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:iconBg, color:iconColor }}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-800 text-sm font-bold truncate">{title}</p>
          {subtitle && <p className="text-slate-400 text-xs mt-0.5 truncate">{subtitle}</p>}
        </div>
        {open ? <FaChevronUp size={11} className="text-slate-400 shrink-0"/> : <FaChevronDown size={11} className="text-slate-400 shrink-0"/>}
      </button>
      {open && <div className="border-t border-slate-50 px-4 pb-4">{children}</div>}
    </div>
  );
};

const InfoPill = ({ icon, label, value, color }) => (
  <div className="p-3 rounded-xl" style={{ background:"#f8fafc", borderLeft:`3px solid ${color}40` }}>
    <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5 flex items-center gap-1.5" style={{ color }}>{icon} {label}</p>
    <p className="text-slate-700 text-xs font-medium leading-relaxed whitespace-pre-wrap">{value||"—"}</p>
  </div>
);

// Pagination component
const Pagination = ({ page, totalPages, filtered, onPageChange }) => {
  if (totalPages <= 1) return null;
  const getPages = () => Array.from({length:totalPages},(_,i)=>i+1)
    .filter(n=>n===1||n===totalPages||Math.abs(n-page)<=1)
    .reduce((acc,n,idx,arr)=>{ if(idx>0&&arr[idx-1]!==n-1) acc.push("…"); acc.push(n); return acc; },[]);

  return (
    <div className="flex items-center justify-between mt-3 bg-white rounded-xl border border-slate-100 px-4 py-2.5" style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
      <p className="text-xs text-slate-400 font-medium">
        Showing <span className="text-slate-600 font-semibold">{(page-1)*PER_PAGE+1}</span>–<span className="text-slate-600 font-semibold">{Math.min(page*PER_PAGE,filtered)}</span> of <span className="text-slate-600 font-semibold">{filtered}</span>
      </p>
      <div className="flex items-center gap-1">
        <button disabled={page===1} onClick={() => onPageChange(p=>p-1)}
          style={{ width:28, height:28, borderRadius:7, border:"1.5px solid #e2e8f0", background:page===1?"#f8fafc":"#fff", color:page===1?"#cbd5e1":"#475569", cursor:page===1?"not-allowed":"pointer", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
        {getPages().map((item,idx) =>
          item==="…" ? (
            <span key={`d${idx}`} style={{width:28,textAlign:"center",fontSize:11,color:"#94a3b8"}}>…</span>
          ) : (
            <button key={item} onClick={() => onPageChange(item)}
              style={{ width:28, height:28, borderRadius:7, border:page===item?"2px solid #2563eb":"1.5px solid #e2e8f0", background:page===item?"#2563eb":"#fff", color:page===item?"#fff":"#475569", cursor:"pointer", fontWeight:700, fontSize:11, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {item}
            </button>
          )
        )}
        <button disabled={page===totalPages} onClick={() => onPageChange(p=>p+1)}
          style={{ width:28, height:28, borderRadius:7, border:"1.5px solid #e2e8f0", background:page===totalPages?"#f8fafc":"#fff", color:page===totalPages?"#cbd5e1":"#475569", cursor:page===totalPages?"not-allowed":"pointer", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
      </div>
    </div>
  );
};

const MedicalRecords = () => {
  const patientName = localStorage.getItem("Name") || "Patient";
  const outletContext = useOutletContext() || {};
  const globalSearch  = outletContext.globalSearch || "";

  const [activeTab,   setActiveTab]   = useState("history");
  const [search,      setSearch]      = useState("");
  const [histPage,    setHistPage]    = useState(1);
  const [visitPage,   setVisitPage]   = useState(1);
  const [apptPage,    setApptPage]    = useState(1);

  const [histories,   setHistories]   = useState([]);
  const [histLoad,    setHistLoad]    = useState(true);
  const [visits,      setVisits]      = useState([]);
  const [visitsLoad,  setVisitsLoad]  = useState(true);
  const [nextAppts,   setNextAppts]   = useState([]);
  const [apptLoad,    setApptLoad]    = useState(true);
  const [apptSummary, setApptSummary] = useState({ total:0, scheduled:0, completed:0, cancelled:0, rescheduled:0 });

  useEffect(() => { loadAll(); }, []);

  // Reset page when search or tab changes
  useEffect(() => { setHistPage(1); setVisitPage(1); setApptPage(1); }, [search, activeTab, globalSearch]);

  const loadAll = () => { loadHistories(); loadVisits(); loadAppointments(); };

  const loadHistories = async () => {
    setHistLoad(true);
    try { const { data } = await axios.get(`${BASE}/my-case-histories`, hdrs()); setHistories(data.histories||[]); }
    catch { setHistories([]); } finally { setHistLoad(false); }
  };

  const loadVisits = async () => {
    setVisitsLoad(true);
    try { const { data } = await axios.get(`${BASE}/my-visits`, hdrs()); setVisits(data.visits||[]); }
    catch { setVisits([]); } finally { setVisitsLoad(false); }
  };

  const loadAppointments = async () => {
    setApptLoad(true);
    try {
      const { data } = await axios.get(`${BASE}/MyAppointment`, hdrs());
      const appts = data.appointments||[];
      setApptSummary({ total:appts.length, scheduled:appts.filter(a=>a.appointment_status==="SCHEDULED").length, completed:appts.filter(a=>a.appointment_status==="COMPLETED").length, cancelled:appts.filter(a=>a.appointment_status==="CANCELLED").length, rescheduled:appts.filter(a=>a.appointment_status==="RESCHEDULED").length });
      const today = new Date(); today.setHours(0,0,0,0);
      setNextAppts(appts.filter(a=>["SCHEDULED","RESCHEDULED","PENDING"].includes(a.appointment_status)&&new Date(a.appointment_date)>=today).sort((a,b)=>new Date(a.appointment_date)-new Date(b.appointment_date)));
    } catch { setNextAppts([]); } finally { setApptLoad(false); }
  };

  const q = (globalSearch || search).trim().toLowerCase();

  const filteredHistories = histories.filter(h => !q||(h.diagnosis||"").toLowerCase().includes(q)||(h.medications||"").toLowerCase().includes(q)||(h.notes||"").toLowerCase().includes(q)||(h.doctor_id?.name||"").toLowerCase().includes(q)||(h.hospital_id?.hospital_name||"").toLowerCase().includes(q));
  const filteredVisits    = visits.filter(v => !q||(v.symptoms||"").toLowerCase().includes(q)||(v.diagnosis||"").toLowerCase().includes(q)||(v.treatment||"").toLowerCase().includes(q)||(v.doctor_id?.name||"").toLowerCase().includes(q));
  const filteredAppts     = nextAppts.filter(a => !q||(a.doctor_id?.name||"").toLowerCase().includes(q)||(a.doctor_id?.specialization||"").toLowerCase().includes(q)||(a.hospital_id?.hospital_name||"").toLowerCase().includes(q));

  // Paginated slices
  const histPages  = Math.ceil(filteredHistories.length/PER_PAGE);
  const visitPages = Math.ceil(filteredVisits.length/PER_PAGE);
  const apptPages  = Math.ceil(filteredAppts.length/PER_PAGE);

  const pagedHistories = filteredHistories.slice((histPage-1)*PER_PAGE, histPage*PER_PAGE);
  const pagedVisits    = filteredVisits.slice((visitPage-1)*PER_PAGE, visitPage*PER_PAGE);
  const pagedAppts     = filteredAppts.slice((apptPage-1)*PER_PAGE, apptPage*PER_PAGE);

  const TABS = [
    { id:"history",  label:"Case History",         icon:<FaFileMedical size={12}/>,   count:histories.length  },
    { id:"visits",   label:"Visit Records",         icon:<FaWalking size={12}/>,       count:visits.length     },
    { id:"upcoming", label:"Upcoming Appointments", icon:<FaCalendarCheck size={12}/>, count:nextAppts.length  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        .mr-root, .mr-root * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.2s ease forwards; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .fade-in { animation:fadeIn 0.15s ease forwards; }
        .tab-btn { transition:all 0.15s ease; }
        .stat-card { border-radius:12px; padding:12px 14px; border:1px solid #e2e8f0; background:#fff; }
      `}</style>

      <div className="mr-root fade-up w-full px-4 py-5 space-y-4">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-slate-400 text-xs font-medium mb-0.5">Medical Records</p>
            <h1 className="text-slate-800 text-xl font-bold leading-tight">{patientName}'s Health Summary</h1>
          </div>
          <button onClick={loadAll} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white transition hover:opacity-90"
            style={{ background:`linear-gradient(135deg,${ACCENT},#1d4ed8)` }}>
            <MdRefresh size={13}/> Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { label:"Total",       value:apptSummary.total,       color:"#2563eb" },
            { label:"Scheduled",   value:apptSummary.scheduled,   color:"#1d4ed8" },
            { label:"Completed",   value:apptSummary.completed,   color:"#065f46" },
            { label:"Cancelled",   value:apptSummary.cancelled,   color:"#b91c1c" },
            { label:"Rescheduled", value:apptSummary.rescheduled, color:"#5b21b6" },
          ].map((s,i) => (
            <div key={i} className="stat-card" style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <p className="text-xl font-bold" style={{ color:s.color }}>{apptLoad?"—":s.value}</p>
              <p className="text-slate-400 text-[10px] font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white" style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <FaSearch size={12} className="text-slate-400 shrink-0"/>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search records by diagnosis, doctor, hospital…"
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"/>
          {search && <button onClick={() => setSearch("")} className="text-xs text-slate-400 hover:text-slate-600 font-medium transition">Clear</button>}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className="tab-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
              style={activeTab===tab.id
                ? { background:ACCENT, color:"#fff", boxShadow:`0 4px 14px ${ACCENT}40` }
                : { background:"#fff", color:"#64748b", border:"1.5px solid #e2e8f0" }}>
              {tab.icon} {tab.label}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background:activeTab===tab.id?"rgba(255,255,255,0.22)":"#f1f5f9", color:activeTab===tab.id?"#fff":"#64748b" }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── CASE HISTORY ── */}
        {activeTab==="history" && (
          <div className="fade-in space-y-2.5">
            {histLoad ? <Spin/> : filteredHistories.length===0 ? (
              <div className="bg-white rounded-xl border border-slate-100 p-3">
                <Empty icon={<FaFileMedical/>} title="No case history found" sub={search?"Try a different search term":"Your doctor will add case records after your appointments"}/>
              </div>
            ) : (
              <>
                {pagedHistories.map((h,i) => (
                  <SectionCard key={h._id||i} icon={<FaFileMedical size={15}/>} iconBg={`${ACCENT}12`} iconColor={ACCENT}
                    title={h.diagnosis||"—"}
                    subtitle={`${h.doctor_id?.name?` ${h.doctor_id.name}`:""}${h.hospital_id?.hospital_name?` · ${h.hospital_id.hospital_name}`:""}${h.createdAt?` · ${fmt(h.createdAt)}`:""}`}
                    defaultOpen={i===0&&histPage===1}>
                    <div className="grid sm:grid-cols-3 gap-2.5 mt-3">
                      <InfoPill icon={<FaStethoscope size={9}/>} label="Diagnosis"   value={h.diagnosis}   color="#dc2626"/>
                      <InfoPill icon={<FaPills size={9}/>}       label="Medications" value={h.medications} color="#d97706"/>
                      <InfoPill icon={<FaNotesMedical size={9}/>}label="Notes"       value={h.notes}       color="#059669"/>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2.5 mt-2.5">
                      {h.doctor_id?.name && (
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold" style={{ background:`linear-gradient(135deg,${ACCENT},#1d4ed8)` }}>{h.doctor_id.name[0].toUpperCase()}</div>
                          <div className="min-w-0">
                            <p className="text-slate-800 text-xs font-semibold truncate"> {h.doctor_id.name}</p>
                            {h.doctor_id.specialization && <p className="text-slate-400 text-[10px] truncate">{h.doctor_id.specialization}</p>}
                          </div>
                        </div>
                      )}
                      {h.hospital_id?.hospital_name && (
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background:"#f0fdf4", color:"#059669" }}><FaHospital size={11}/></div>
                          <div className="min-w-0">
                            <p className="text-slate-800 text-xs font-semibold truncate">{h.hospital_id.hospital_name}</p>
                            {h.hospital_id.hospital_address && <p className="text-slate-400 text-[10px] truncate">{h.hospital_id.hospital_address}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-400 text-[10px] mt-2.5 flex items-center gap-1.5"><FaCalendarAlt size={9}/> Recorded on {fmtFull(h.case_history_date||h.createdAt)}</p>
                  </SectionCard>
                ))}
                <Pagination page={histPage} totalPages={histPages} filtered={filteredHistories.length} onPageChange={setHistPage}/>
              </>
            )}
          </div>
        )}

        {/* ── VISITS ── */}
        {activeTab==="visits" && (
          <div className="fade-in space-y-2.5">
            {visitsLoad ? <Spin/> : filteredVisits.length===0 ? (
              <div className="bg-white rounded-xl border border-slate-100 p-3">
                <Empty icon={<FaWalking/>} title="No visit records found" sub={search?"Try a different search term":"Your doctor will log visits after consultations"}/>
              </div>
            ) : (
              <>
                {pagedVisits.map((v,i) => (
                  <SectionCard key={v._id||i} icon={<FaWalking size={15}/>} iconBg="#7c3aed12" iconColor="#7c3aed"
                    title={v.diagnosis||"—"}
                    subtitle={`${v.doctor_id?.name?` ${v.doctor_id.name}`:""}${v.visit_date||v.createdAt?` · ${fmt(v.visit_date||v.createdAt)}`:""}`}
                    defaultOpen={i===0&&visitPage===1}>
                    <div className="grid sm:grid-cols-3 gap-2.5 mt-3">
                      <InfoPill icon={<FaHeartbeat size={9}/>}   label="Symptoms"  value={v.symptoms}  color="#7c3aed"/>
                      <InfoPill icon={<FaStethoscope size={9}/>} label="Diagnosis" value={v.diagnosis} color="#dc2626"/>
                      <InfoPill icon={<FaPills size={9}/>}       label="Treatment" value={v.treatment} color="#059669"/>
                    </div>
                    {v.doctor_id?.name && (
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 mt-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold" style={{ background:"linear-gradient(135deg,#7c3aed,#5b21b6)" }}>{v.doctor_id.name[0].toUpperCase()}</div>
                        <div className="min-w-0">
                          <p className="text-slate-800 text-xs font-semibold truncate"> {v.doctor_id.name}</p>
                          {v.doctor_id.specialization && <p className="text-slate-400 text-[10px] truncate">{v.doctor_id.specialization}</p>}
                        </div>
                      </div>
                    )}
                    <p className="text-slate-400 text-[10px] mt-2.5 flex items-center gap-1.5"><FaCalendarAlt size={9}/> Visit date: {fmtFull(v.visit_date||v.createdAt)}</p>
                  </SectionCard>
                ))}
                <Pagination page={visitPage} totalPages={visitPages} filtered={filteredVisits.length} onPageChange={setVisitPage}/>
              </>
            )}
          </div>
        )}

        {/* ── UPCOMING APPOINTMENTS ── */}
        {activeTab==="upcoming" && (
          <div className="fade-in space-y-2.5">
            {apptLoad ? <Spin/> : filteredAppts.length===0 ? (
              <div className="bg-white rounded-xl border border-slate-100 p-3">
                <Empty icon={<FaCalendarCheck/>} title="No upcoming appointments" sub={search?"Try a different search term":"You have no scheduled follow-up appointments right now"}/>
              </div>
            ) : (
              <>
                {pagedAppts.map((a,i) => {
                  const sc    = statusCfg(a.appointment_status);
                  const aDate = new Date(a.appointment_date);
                  const today = new Date(); today.setHours(0,0,0,0);
                  const isToday = aDate.toDateString()===today.toDateString();
                  return (
                    <div key={a._id||i} className="bg-white rounded-xl border overflow-hidden"
                      style={{ borderColor:isToday?ACCENT:"#e2e8f0", boxShadow:isToday?`0 0 0 2px ${ACCENT}20,0 2px 10px rgba(37,99,235,0.07)`:"0 1px 6px rgba(0,0,0,0.04)" }}>
                      {isToday && (
                        <div className="px-4 py-1.5 text-xs font-bold text-white flex items-center gap-2" style={{ background:`linear-gradient(90deg,${ACCENT},#1d4ed8)` }}>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"/> TODAY'S APPOINTMENT
                        </div>
                      )}
                      <div className="flex gap-3 p-4">
                        <div className="shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white font-bold" style={{ background:`linear-gradient(135deg,${ACCENT},#1d4ed8)` }}>
                          <span className="text-[9px] leading-tight opacity-80">{aDate.toLocaleDateString("en-IN",{month:"short"})}</span>
                          <span className="text-lg leading-none">{aDate.getDate()}</span>
                          <span className="text-[9px] leading-tight opacity-70">{aDate.getFullYear()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <p className="text-slate-800 text-sm font-bold">{a.start_time}{a.end_time?` – ${a.end_time}`:""}</p>
                            <Badge status={a.appointment_status}/>
                          </div>
                          <div className="space-y-1">
                            {a.doctor_id?.name && <p className="text-slate-600 text-xs flex items-center gap-1.5"><FaUserMd size={9} style={{color:ACCENT}}/>  {a.doctor_id.name}{a.doctor_id.specialization&&<span className="text-slate-400"> · {a.doctor_id.specialization}</span>}</p>}
                            {a.hospital_id?.hospital_name && <p className="text-slate-500 text-xs flex items-center gap-1.5"><FaHospital size={9} style={{color:"#059669"}}/> {a.hospital_id.hospital_name}</p>}
                            {a.hospital_id?.hospital_address && <p className="text-slate-400 text-xs flex items-center gap-1.5"><FaMapMarkerAlt size={9}/> {a.hospital_id.hospital_address}</p>}
                            {a.hospital_id?.hospital_phone && <p className="text-slate-400 text-xs flex items-center gap-1.5"><FaPhone size={9}/> {a.hospital_id.hospital_phone}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <Pagination page={apptPage} totalPages={apptPages} filtered={filteredAppts.length} onPageChange={setApptPage}/>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MedicalRecords;