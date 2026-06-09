import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    FaRupeeSign, FaCheckCircle, FaClock, FaTimesCircle,
    FaSearch, FaReceipt, FaPrint, FaTimes, FaFilter,
    FaMoneyBillWave, FaQrcode, FaCreditCard,
    FaUserAlt, FaStethoscope, FaCalendarAlt,
    FaPhone, FaEnvelope, FaDownload, FaEye,
    FaChartLine, FaArrowUp, FaHospital
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

const BASE  = "http://localhost:5000/staffapi";
const hdrs  = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("StaffToken")}` } });

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";
const fmtFull = (d) => d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const METHOD_CFG = {
    CASH:  { label: "Cash",    icon: <FaMoneyBillWave size={13}/>, color: "#059669", bg: "#ecfdf5", border: "#6ee7b7" },
    UPI:   { label: "UPI",     icon: <FaQrcode size={13}/>,        color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
    CARD:  { label: "Card",    icon: <FaCreditCard size={13}/>,    color: "#0891b2", bg: "#ecfeff", border: "#67e8f9" },
    OTHER: { label: "Other",   icon: <FaRupeeSign size={13}/>,     color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
};

const STATUS_CFG = {
    PAID:    { label: "Paid",    icon: <FaCheckCircle size={10}/>,  color: "#059669", bg: "#d1fae5", border: "#6ee7b7" },
    PENDING: { label: "Pending", icon: <FaClock size={10}/>,        color: "#b45309", bg: "#fef3c7", border: "#fde68a" },
    FAILED:  { label: "Failed",  icon: <FaTimesCircle size={10}/>,  color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
};

// ── Receipt Modal ─────────────────────────────────────────────────────────────
const ReceiptModal = ({ payment, onClose }) => {
    const receiptRef = useRef();
    const hospitalName = localStorage.getItem("HospitalName") || payment?.hospital_id?.hospital_name || "Hospital";
    const receiptNo = `RCP-${payment?._id?.slice(-8).toUpperCase()}`;
    const method = METHOD_CFG[payment?.payment_method] || METHOD_CFG.OTHER;

    const handlePrint = () => {
        const content = receiptRef.current.innerHTML;
        const w = window.open("", "_blank");
        w.document.write(`
            <html><head><title>Receipt ${receiptNo}</title>
            <style>
                * { box-sizing:border-box; }
                body { font-family:'Georgia',serif; margin:0; padding:24px; color:#1e293b; background:#f8fafc; }
                .wrap { max-width:420px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.12); }
                .top { background:linear-gradient(135deg,#1e3a5f,#2563eb); color:#fff; padding:28px 28px 20px; text-align:center; }
                .top h1 { margin:0 0 4px; font-size:22px; font-family:'Georgia',serif; letter-spacing:0.5px; }
                .top p  { margin:0; font-size:12px; opacity:0.7; }
                .badge { display:inline-block; background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.3); border-radius:20px; padding:4px 14px; font-size:11px; font-weight:700; margin-top:10px; letter-spacing:0.5px; }
                .amt-box { margin:20px 24px; background:#f0fdf4; border:2px solid #86efac; border-radius:12px; padding:18px; text-align:center; }
                .amt-box .num { font-size:36px; font-weight:900; color:#059669; font-family:'Georgia',serif; }
                .amt-box .lbl { font-size:12px; color:#64748b; margin-top:2px; }
                .body { padding:0 24px 24px; }
                .sec { margin-bottom:16px; padding-bottom:16px; border-bottom:1px dashed #e2e8f0; }
                .sec:last-child { border:none; margin:0; padding:0; }
                .sec-title { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin:0 0 10px; }
                .row { display:flex; justify-content:space-between; margin-bottom:6px; font-size:12px; }
                .row .k { color:#64748b; }
                .row .v { font-weight:700; color:#0f172a; text-align:right; max-width:60%; word-break:break-word; }
                .footer { text-align:center; padding:16px 24px; background:#f8fafc; border-top:1px solid #e2e8f0; font-size:11px; color:#94a3b8; }
                .rcpt-no { font-size:10px; color:#cbd5e1; text-align:center; margin-top:6px; }
                @media print { body { padding:0; background:#fff; } .wrap { box-shadow:none; } }
            </style></head>
            <body>${content}</body></html>
        `);
        w.document.close();
        setTimeout(() => w.print(), 300);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ backdropFilter:"blur(12px)", background:"rgba(15,23,42,0.80)" }}
            onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                style={{ maxHeight:"90vh", display:"flex", flexDirection:"column" }}
                onClick={e => e.stopPropagation()}>

                {/* Modal toolbar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100"
                    style={{ background:"linear-gradient(135deg,#1e3a5f,#2563eb)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <FaReceipt size={15} color="#fff"/>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Payment Receipt</p>
                            <p className="text-blue-200 text-xs">{receiptNo}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition"
                            style={{ background:"rgba(255,255,255,0.18)", color:"#fff", border:"1px solid rgba(255,255,255,0.3)" }}>
                            <FaPrint size={11}/> Print
                        </button>
                        <button onClick={onClose}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                            style={{ background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.7)", border:"none" }}>
                            <FaTimes size={13}/>
                        </button>
                    </div>
                </div>

                {/* Scrollable receipt */}
                <div className="overflow-y-auto flex-1">
                    <div ref={receiptRef}>
                        <div className="wrap">
                            {/* Header */}
                            <div className="top">
                                <h1>{hospitalName}</h1>
                                <p>{payment?.hospital_id?.hospital_address || ""}</p>
                                <div className="badge">✓ Payment Confirmed</div>
                            </div>

                            {/* Amount */}
                            <div className="px-6 pt-5">
                                <div className="amt-box">
                                    <div className="num">₹{Number(payment?.amount || 0).toLocaleString("en-IN")}</div>
                                    <div className="lbl">via {method.label}</div>
                                </div>
                            </div>

                            <div className="body">
                                {/* Patient */}
                                <div className="sec">
                                    <p className="sec-title">Patient Details</p>
                                    <div className="row"><span className="k">Name</span><span className="v">{payment?.patient_id?.patient_name || "—"}</span></div>
                                    <div className="row"><span className="k">Phone</span><span className="v">{payment?.patient_id?.patient_phone || "—"}</span></div>
                                    <div className="row"><span className="k">Email</span><span className="v">{payment?.patient_id?.patient_email || "—"}</span></div>
                                </div>

                                {/* Doctor */}
                                <div className="sec">
                                    <p className="sec-title">Doctor Details</p>
                                    <div className="row"><span className="k">Name</span><span className="v"> {payment?.doctor_id?.name || "—"}</span></div>
                                    <div className="row"><span className="k">Specialization</span><span className="v">{payment?.doctor_id?.specialization || "—"}</span></div>
                                    <div className="row"><span className="k">Consultation Fee</span><span className="v">₹{payment?.doctor_id?.consultation_fee?.toLocaleString("en-IN") || "—"}</span></div>
                                </div>

                                {/* Appointment */}
                                <div className="sec">
                                    <p className="sec-title">Appointment Details</p>
                                    <div className="row"><span className="k">Date</span><span className="v">{fmt(payment?.appointment_id?.appointment_date)}</span></div>
                                    <div className="row"><span className="k">Time</span><span className="v">{payment?.appointment_id?.start_time} – {payment?.appointment_id?.end_time}</span></div>
                                </div>

                                {/* Payment */}
                                <div className="sec">
                                    <p className="sec-title">Payment Details</p>
                                    <div className="row"><span className="k">Method</span><span className="v">{method.label}</span></div>
                                    <div className="row"><span className="k">Date & Time</span><span className="v">{fmtFull(payment?.payment_date)}</span></div>
                                    {payment?.transaction_id && <div className="row"><span className="k">Txn ID</span><span className="v">{payment.transaction_id}</span></div>}
                                    {payment?.upi_id && <div className="row"><span className="k">UPI ID</span><span className="v">{payment.upi_id}</span></div>}
                                    {payment?.notes && <div className="row"><span className="k">Notes</span><span className="v">{payment.notes}</span></div>}
                                    {payment?.recorded_by?.name && <div className="row"><span className="k">Recorded by</span><span className="v">{payment.recorded_by.name}</span></div>}
                                </div>

                                <div className="footer">
                                    Thank you for choosing {hospitalName}!<br/>
                                    {payment?.hospital_id?.hospital_phone && `📞 ${payment.hospital_id.hospital_phone}`}
                                </div>
                                <div className="rcpt-no">Receipt No: {receiptNo}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const ReceptionistPayments = () => {
    const [payments,    setPayments]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [search,      setSearch]      = useState("");
    const [methodFilter,setMethodFilter]= useState("ALL");
    const [receipt,     setReceipt]     = useState(null);
    const [page,        setPage]        = useState(1);
    const PER_PAGE = 8;

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${BASE}/reception/payments`, hdrs());
            setPayments(data.payments || []);
        } catch (err) {
            console.error(err);
            Swal.fire({ icon:"error", title:"Failed to load payments", text: err?.response?.data?.message || "Server error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPayments(); }, []);
    useEffect(() => { setPage(1); }, [search, methodFilter]);

    // ── Stats ──────────────────────────────────────────────────────────────
    const totalRevenue  = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const todayRevenue  = payments.filter(p => new Date(p.payment_date).toDateString() === new Date().toDateString())
                                  .reduce((s, p) => s + (p.amount || 0), 0);
    const cashCount     = payments.filter(p => p.payment_method === "CASH").length;
    const upiCount      = payments.filter(p => p.payment_method === "UPI").length;

    // ── Filter ─────────────────────────────────────────────────────────────
    const filtered = payments.filter(p => {
        const matchMethod = methodFilter === "ALL" || p.payment_method === methodFilter;
        const q = search.toLowerCase();
        return matchMethod && (!q ||
            (p.patient_id?.patient_name  || "").toLowerCase().includes(q) ||
            (p.patient_id?.patient_phone || "").includes(q) ||
            (p.patient_id?.patient_email || "").toLowerCase().includes(q) ||
            (p.doctor_id?.name           || "").toLowerCase().includes(q) ||
            (p.transaction_id            || "").toLowerCase().includes(q) ||
            (p.upi_id                    || "").toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div style={{ fontFamily:"'Nunito',sans-serif", minHeight:"100vh" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700&display=swap');
                .pay-root * { font-family:'Nunito',sans-serif; box-sizing:border-box; }
                @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
                .fade-up { animation:fadeUp 0.25s ease forwards; }
                .stat-card { transition:all 0.18s; }
                .stat-card:hover { transform:translateY(-3px); box-shadow:0 10px 30px rgba(0,0,0,0.10)!important; }
                .pay-row { transition:background 0.12s; border-left:3px solid transparent; }
                .pay-row:hover { background:#f8fafc; border-left-color:#2563eb; }
                .filter-pill { transition:all 0.15s; cursor:pointer; }
                .receipt-btn { transition:all 0.15s; }
                .receipt-btn:hover { transform:translateY(-1px); box-shadow:0 4px 14px rgba(37,99,235,0.25); }
                .page-btn { transition:all 0.12s; }
                .page-btn:hover:not(:disabled) { border-color:#2563eb!important; color:#2563eb!important; }
            `}</style>

            <div className="pay-root fade-up" style={{ maxWidth:1200, margin:"0 auto", padding:"0 0 40px" }}>

                {/* ── Header ─────────────────────────────────────────────── */}
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
                    <div>
                        <p style={{ fontSize:12, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 4px" }}>
                            Receptionist · Finance
                        </p>
                        <h1 style={{ fontSize:28, fontWeight:900, color:"#0f172a", margin:0, fontFamily:"'Playfair Display',serif" }}>
                            Payment Records
                        </h1>
                        <p style={{ fontSize:13, color:"#64748b", margin:"4px 0 0", fontWeight:500 }}>
                            {payments.length} total transactions · ₹{totalRevenue.toLocaleString("en-IN")} collected
                        </p>
                    </div>
                    <button onClick={fetchPayments}
                        style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", border:"1.5px solid #e2e8f0", color:"#475569", borderRadius:14, padding:"10px 20px", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor="#2563eb"; e.currentTarget.style.color="#2563eb"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.color="#475569"; }}>
                        <MdRefresh size={15} className={loading ? "animate-spin" : ""}/> Refresh
                    </button>
                </div>

                {/* ── Stat Cards ──────────────────────────────────────────── */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
                    {[
                        {
                            label:"Total Revenue",
                            value:`₹${totalRevenue.toLocaleString("en-IN")}`,
                            sub:`${payments.length} transactions`,
                            color:"#2563eb", bg:"linear-gradient(135deg,#1e3a5f,#2563eb)",
                            icon:<FaChartLine size={20} color="#fff"/>
                        },
                        {
                            label:"Today's Collection",
                            value:`₹${todayRevenue.toLocaleString("en-IN")}`,
                            sub:"collected today",
                            color:"#059669", bg:"linear-gradient(135deg,#065f46,#059669)",
                            icon:<FaArrowUp size={20} color="#fff"/>
                        },
                        {
                            label:"Cash Payments",
                            value:cashCount,
                            sub:"transactions",
                            color:"#d97706", bg:"linear-gradient(135deg,#92400e,#d97706)",
                            icon:<FaMoneyBillWave size={20} color="#fff"/>
                        },
                        {
                            label:"UPI / Digital",
                            value:upiCount,
                            sub:"transactions",
                            color:"#7c3aed", bg:"linear-gradient(135deg,#4c1d95,#7c3aed)",
                            icon:<FaQrcode size={20} color="#fff"/>
                        },
                    ].map((s, i) => (
                        <div key={i} className="stat-card" style={{ borderRadius:18, padding:"20px 22px", background:s.bg, boxShadow:"0 4px 16px rgba(0,0,0,0.12)", position:"relative", overflow:"hidden" }}>
                            <div style={{ position:"absolute", right:18, top:18, width:42, height:42, borderRadius:12, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                {s.icon}
                            </div>
                            <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.7)", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 8px" }}>{s.label}</p>
                            <p style={{ fontSize:24, fontWeight:900, color:"#fff", margin:"0 0 2px", lineHeight:1 }}>{s.value}</p>
                            <p style={{ fontSize:11, color:"rgba(255,255,255,0.6)", margin:0, fontWeight:500 }}>{s.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ── Filters + Search ────────────────────────────────────── */}
                <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid #f1f5f9", padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap", boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
                    {/* Search */}
                    <div style={{ position:"relative", flex:1, minWidth:220 }}>
                        <FaSearch size={12} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }}/>
                        <input
                            placeholder="Search by patient, doctor, transaction ID…"
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{ width:"100%", paddingLeft:36, paddingRight:14, paddingTop:10, paddingBottom:10, borderRadius:12, border:"1.5px solid #e2e8f0", fontSize:13, fontFamily:"Nunito,sans-serif", color:"#334155", background:"#f8fafc", outline:"none" }}
                            onFocus={e => e.target.style.borderColor="#2563eb"}
                            onBlur={e => e.target.style.borderColor="#e2e8f0"}
                        />
                    </div>

                    {/* Method filter pills */}
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {[
                            { key:"ALL",  label:"All Methods", color:"#2563eb" },
                            { key:"CASH", label:"Cash",         color:"#059669" },
                            { key:"UPI",  label:"UPI",          color:"#7c3aed" },
                            { key:"CARD", label:"Card",         color:"#0891b2" },
                            { key:"OTHER",label:"Other",        color:"#d97706" },
                        ].map(f => (
                            <button key={f.key} className="filter-pill" onClick={() => setMethodFilter(f.key)}
                                style={{
                                    padding:"7px 16px", borderRadius:10, fontSize:12, fontWeight:700, border:"none",
                                    background: methodFilter === f.key ? f.color : "#f1f5f9",
                                    color:      methodFilter === f.key ? "#fff"   : "#64748b",
                                    boxShadow:  methodFilter === f.key ? `0 3px 10px ${f.color}40` : "none",
                                    fontFamily:"Nunito,sans-serif"
                                }}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Table ──────────────────────────────────────────────── */}
                {loading ? (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:280, background:"#fff", borderRadius:20, border:"1.5px solid #f1f5f9", gap:14 }}>
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                        <p style={{ color:"#94a3b8", fontSize:13, fontWeight:600 }}>Loading payments…</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:260, background:"#fff", borderRadius:20, border:"1.5px solid #f1f5f9", gap:10 }}>
                        <FaReceipt size={40} style={{ color:"#e2e8f0" }}/>
                        <p style={{ fontSize:15, fontWeight:700, color:"#64748b", margin:0 }}>No payments found</p>
                        <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>{search ? `No results for "${search}"` : "No payments recorded yet"}</p>
                    </div>
                ) : (
                    <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>

                        {/* Table head */}
                        <div style={{ display:"grid", gridTemplateColumns:"40px 1.8fr 1.4fr 100px 110px 120px 90px 120px", gap:0, background:"#f8fafc", borderBottom:"1px solid #f1f5f9", padding:"11px 22px" }}>
                            {["#","Patient","Doctor","Date","Time","Amount","Method","Receipt"].map(h => (
                                <p key={h} style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em", margin:0 }}>{h}</p>
                            ))}
                        </div>

                        {paginated.map((p, i) => {
                            const rowIdx = (page - 1) * PER_PAGE + i + 1;
                            const mCfg   = METHOD_CFG[p.payment_method] || METHOD_CFG.OTHER;
                            const sCfg   = STATUS_CFG[p.payment_status]  || STATUS_CFG.PAID;

                            return (
                                <div key={p._id} className="pay-row"
                                    style={{ display:"grid", gridTemplateColumns:"40px 1.8fr 1.4fr 100px 110px 120px 90px 120px", padding:"14px 22px", borderBottom:"1px solid #f8fafc", alignItems:"center", gap:0 }}>

                                    {/* # */}
                                    <p style={{ fontSize:12, color:"#94a3b8", fontWeight:700, margin:0 }}>{rowIdx}</p>

                                    {/* Patient */}
                                    <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                                        <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#1e3a5f,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", flexShrink:0 }}>
                                            {(p.patient_id?.patient_name || "P")[0].toUpperCase()}
                                        </div>
                                        <div style={{ minWidth:0 }}>
                                            <p style={{ fontSize:13, fontWeight:700, color:"#0f172a", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                                                {p.patient_id?.patient_name || "—"}
                                            </p>
                                            <p style={{ fontSize:11, color:"#94a3b8", margin:"1px 0 0", fontWeight:500 }}>
                                                {p.patient_id?.patient_phone || p.patient_id?.patient_email || ""}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Doctor */}
                                    <div style={{ minWidth:0 }}>
                                        <p style={{ fontSize:13, fontWeight:700, color:"#334155", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                                            {p.doctor_id?.name || "—"}
                                        </p>
                                        <p style={{ fontSize:11, color:"#94a3b8", margin:"1px 0 0", fontWeight:500 }}>
                                            {p.doctor_id?.specialization || ""}
                                        </p>
                                    </div>

                                    {/* Date */}
                                    <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#475569", fontWeight:600 }}>
                                        <FaCalendarAlt size={9} color="#94a3b8"/>{fmt(p.payment_date)}
                                    </div>

                                    {/* Time */}
                                    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:700, color:"#334155" }}>
                                        {fmtTime(p.payment_date)}
                                    </span>

                                    {/* Amount */}
                                    <p style={{ fontSize:15, fontWeight:900, color:"#059669", margin:0 }}>
                                        ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                                    </p>

                                    {/* Method */}
                                    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:8, fontSize:11, fontWeight:700, background:mCfg.bg, color:mCfg.color, border:`1px solid ${mCfg.border}` }}>
                                        {mCfg.icon} {mCfg.label}
                                    </span>

                                    {/* Receipt */}
                                    <button className="receipt-btn" onClick={() => setReceipt(p)}
                                        style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:10, background:"linear-gradient(135deg,#1e3a5f,#2563eb)", border:"none", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>
                                        <FaReceipt size={10}/> Receipt
                                    </button>
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        <div style={{ padding:"12px 22px", background:"#f8fafc", borderTop:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                            <p style={{ fontSize:12, color:"#94a3b8", fontWeight:600, margin:0 }}>
                                Showing {filtered.length === 0 ? 0 : (page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} payments
                            </p>

                            {totalPages > 1 && (
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                    <button className="page-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}
                                        style={{ width:32, height:32, borderRadius:8, border:"1.5px solid #e2e8f0", background:page===1?"#f8fafc":"#fff", color:page===1?"#cbd5e1":"#475569", cursor:page===1?"not-allowed":"pointer", fontWeight:700, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                        ‹
                                    </button>

                                    {Array.from({ length:totalPages }, (_,i) => i+1)
                                        .filter(n => n===1 || n===totalPages || Math.abs(n-page)<=1)
                                        .reduce((acc,n,idx,arr) => { if(idx>0 && arr[idx-1]!==n-1) acc.push("…"); acc.push(n); return acc; }, [])
                                        .map((item, idx) =>
                                            item === "…" ? (
                                                <span key={`d${idx}`} style={{ width:32, textAlign:"center", fontSize:13, color:"#94a3b8" }}>…</span>
                                            ) : (
                                                <button key={item} className="page-btn" onClick={() => setPage(item)}
                                                    style={{ width:32, height:32, borderRadius:8, border:page===item?"2px solid #2563eb":"1.5px solid #e2e8f0", background:page===item?"#2563eb":"#fff", color:page===item?"#fff":"#475569", cursor:"pointer", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Nunito,sans-serif" }}>
                                                    {item}
                                                </button>
                                            )
                                        )
                                    }

                                    <button className="page-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}
                                        style={{ width:32, height:32, borderRadius:8, border:"1.5px solid #e2e8f0", background:page===totalPages?"#f8fafc":"#fff", color:page===totalPages?"#cbd5e1":"#475569", cursor:page===totalPages?"not-allowed":"pointer", fontWeight:700, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                        ›
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Receipt Modal ── */}
            {receipt && <ReceiptModal payment={receipt} onClose={() => setReceipt(null)}/>}
        </div>
    );
};

export default ReceptionistPayments;