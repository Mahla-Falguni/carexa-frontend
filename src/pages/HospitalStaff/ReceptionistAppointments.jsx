import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    FaCalendarAlt, FaClock, FaUserAlt, FaSearch,
    FaCheckCircle, FaBan, FaHourglassHalf, FaSyncAlt,
    FaEye, FaRupeeSign, FaMoneyBillWave, FaQrcode,
    FaCreditCard, FaReceipt, FaPrint, FaTimes,
    FaUserMd, FaPhone, FaEnvelope, FaMapMarkerAlt,
    FaFilter, FaStethoscope
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

const BASE = "https://carexa-backend.vercel.app/staffapi";
const hdrs = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("StaffToken")}` } });
const COLOR = "#2563eb";

const fmt = (d) => d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const fmtFull = (d) => d
    ? new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "—";

const STATUS_CFG = {
    PENDING: { label: "Pending", bg: "#fef3c7", color: "#b45309", border: "#fde68a", icon: <FaHourglassHalf size={10} /> },
    SCHEDULED: { label: "Scheduled", bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd", icon: <FaCalendarAlt size={10} /> },
    COMPLETED: { label: "Completed", bg: "#d1fae5", color: "#065f46", border: "#6ee7b7", icon: <FaCheckCircle size={10} /> },
    CANCELLED: { label: "Cancelled", bg: "#fee2e2", color: "#b91c1c", border: "#fca5a5", icon: <FaBan size={10} /> },
    RESCHEDULED: { label: "Rescheduled", bg: "#ede9fe", color: "#5b21b6", border: "#c4b5fd", icon: <FaSyncAlt size={10} /> },
};

const PAY_METHODS = [
    { key: "CASH", label: "Cash", icon: <FaMoneyBillWave size={18} />, color: "#059669", bg: "#ecfdf5" },
    { key: "UPI", label: "UPI / QR", icon: <FaQrcode size={18} />, color: "#7c3aed", bg: "#f5f3ff" },
    { key: "CARD", label: "Card", icon: <FaCreditCard size={18} />, color: "#0891b2", bg: "#ecfeff" },
    { key: "OTHER", label: "Other", icon: <FaRupeeSign size={18} />, color: "#d97706", bg: "#fffbeb" },
];

const Badge = ({ status }) => {
    const s = STATUS_CFG[status] || STATUS_CFG.PENDING;
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full border"
            style={{ background: s.bg, color: s.color, borderColor: s.border }}>
            {s.icon} {s.label}
        </span>
    );
};

// ── Receipt component ─────────────────────────────────────────────────────────
const Receipt = ({ payment, onClose }) => {
    const receiptRef = useRef();
    const p = payment;
    const hospitalName = p?.hospital_id?.hospital_name || localStorage.getItem("HospitalName") || "Hospital";
    const receiptNo = `RCP-${p?._id?.slice(-8).toUpperCase()}`;
    const payMethod = PAY_METHODS.find(m => m.key === p?.payment_method);

    // ── shared styles (used in both preview AND print) ──
    const S = {
        // section wrapper
        section: { marginBottom: 0, padding: "14px 0", borderBottom: "1px solid #f1f5f9" },
        sectionLast: { padding: "14px 0 0" },
        // section label
        sLabel: { fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 },
        // key-value row
        row: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 },
        key: { fontSize: 13, color: "#64748b", fontWeight: 500 },
        val: { fontSize: 13, color: "#0f172a", fontWeight: 700, textAlign: "right", maxWidth: "55%" },
    };

    // ── Section helper ──
    const Section = ({ label, icon, last = false, children }) => (
        <div style={last ? { ...S.section, ...S.sectionLast } : S.section}>
            <div style={S.sLabel}>{icon && <span style={{ color: COLOR }}>{icon}</span>}{label}</div>
            {children}
        </div>
    );

    const Row = ({ label, value, valueColor }) => value ? (
        <div style={S.row}>
            <span style={S.key}>{label}</span>
            <span style={{ ...S.val, color: valueColor || "#0f172a" }}>{value}</span>
        </div>
    ) : null;

    // ── Print handler — inlines all styles explicitly ──
    const handlePrint = () => {
        const w = window.open("", "_blank");
        w.document.write(`<!DOCTYPE html><html><head><title>Receipt ${receiptNo}</title>
        <style>
            *{box-sizing:border-box;margin:0;padding:0}
            body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;display:flex;justify-content:center;padding:30px 16px;color:#1e293b}
            .card{background:#fff;width:420px;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12)}
            .top{background:linear-gradient(135deg,#2563eb,#1e40af);padding:24px;text-align:center}
            .top h1{color:#fff;font-size:22px;font-weight:800;margin-bottom:3px}
            .top p{color:rgba(255,255,255,0.75);font-size:12px}
            .badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);color:#fff;border-radius:30px;padding:5px 16px;font-size:11px;font-weight:700;margin-top:12px}
            .amt-box{margin:20px 24px;background:#ecfdf5;border:2px solid #6ee7b7;border-radius:14px;padding:20px;text-align:center}
            .amt-num{font-size:36px;font-weight:900;color:#059669}
            .amt-via{font-size:12px;color:#64748b;margin-top:4px;font-weight:600}
            .body{padding:0 24px 20px}
            .section{border-bottom:1px solid #f1f5f9;padding:14px 0}
            .section:last-child{border:none;padding-bottom:0}
            .sec-label{font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:10px}
            .row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:7px}
            .row:last-child{margin-bottom:0}
            .k{font-size:13px;color:#64748b;font-weight:500}
            .v{font-size:13px;color:#0f172a;font-weight:700;text-align:right;max-width:55%}
            .v.green{color:#059669}
            .footer{margin:16px 24px 20px;padding-top:16px;border-top:1px dashed #e2e8f0;text-align:center}
            .footer p{font-size:12px;color:#64748b;margin-bottom:4px}
            .rno{font-size:10px;color:#94a3b8;margin-top:6px}
        </style></head><body><div class="card">
            <div class="top">
                <h1>${hospitalName}</h1>
                <p>${p?.hospital_id?.hospital_address || ""}</p>
                <div class="badge">✓ Payment Confirmed</div>
            </div>
            <div class="amt-box">
                <div class="amt-num">₹${Number(p?.amount || 0).toLocaleString("en-IN")}</div>
                <div class="amt-via">via ${payMethod?.label || p?.payment_method}</div>
            </div>
            <div class="body">
                <div class="section">
                    <div class="sec-label">Patient Details</div>
                    <div class="row"><span class="k">Name</span><span class="v">${p?.patient_id?.patient_name || "—"}</span></div>
                    ${p?.patient_id?.patient_phone ? `<div class="row"><span class="k">Phone</span><span class="v">${p.patient_id.patient_phone}</span></div>` : ""}
                    ${p?.patient_id?.patient_email ? `<div class="row"><span class="k">Email</span><span class="v">${p.patient_id.patient_email}</span></div>` : ""}
                </div>
                <div class="section">
                    <div class="sec-label">Doctor Details</div>
                    <div class="row"><span class="k">Name</span><span class="v">${p?.doctor_id?.name || "—"}</span></div>
                    <div class="row"><span class="k">Specialization</span><span class="v">${p?.doctor_id?.specialization || "—"}</span></div>
                    <div class="row"><span class="k">Consultation Fee</span><span class="v green">₹${p?.doctor_id?.consultation_fee?.toLocaleString("en-IN") || "—"}</span></div>
                </div>
                <div class="section">
                    <div class="sec-label">Appointment Details</div>
                    <div class="row"><span class="k">Date</span><span class="v">${new Date(p?.appointment_id?.appointment_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                    <div class="row"><span class="k">Time</span><span class="v">${p?.appointment_id?.start_time} – ${p?.appointment_id?.end_time}</span></div>
                </div>
                <div class="section">
                    <div class="sec-label">Payment Details</div>
                    <div class="row"><span class="k">Method</span><span class="v">${payMethod?.label || p?.payment_method}</span></div>
                    <div class="row"><span class="k">Date &amp; Time</span><span class="v">${new Date(p?.payment_date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
                    ${p?.transaction_id ? `<div class="row"><span class="k">Txn ID</span><span class="v">${p.transaction_id}</span></div>` : ""}
                    ${p?.upi_id ? `<div class="row"><span class="k">UPI ID</span><span class="v">${p.upi_id}</span></div>` : ""}
                    ${p?.notes ? `<div class="row"><span class="k">Notes</span><span class="v">${p.notes}</span></div>` : ""}
                </div>
            </div>
            <div class="footer">
                <p>Thank you for choosing <strong>${hospitalName}</strong>!</p>
                ${p?.hospital_id?.hospital_phone ? `<p>📞 ${p.hospital_id.hospital_phone}</p>` : ""}
                <div class="rno">Receipt No: ${receiptNo}</div>
            </div>
        </div></body></html>`);
        w.document.close();
        w.print();
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(10px)", background: "rgba(15,23,42,0.75)" }}
            onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,0.25)", width: "100%", maxWidth: 440, overflow: "hidden", maxHeight: "92vh", display: "flex", flexDirection: "column" }}
                onClick={e => e.stopPropagation()}>

                {/* ── Modal top bar ── */}
                <div style={{ background: "linear-gradient(135deg,#2563eb,#1e40af)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FaReceipt size={16} color="#fff" />
                        </div>
                        <div>
                            <p style={{ color: "#fff", fontWeight: 800, fontSize: 15, margin: 0 }}>Payment Receipt</p>
                            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, margin: 0, fontWeight: 500 }}>{receiptNo}</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={handlePrint}
                            style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito,sans-serif" }}>
                            <FaPrint size={11} /> Print
                        </button>
                        <button onClick={onClose}
                            style={{ width: 36, height: 36, background: "rgba(255,255,255,0.12)", border: "none", color: "rgba(255,255,255,0.7)", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FaTimes size={14} />
                        </button>
                    </div>
                </div>

                {/* ── Scrollable receipt body ── */}
                <div ref={receiptRef} style={{ overflowY: "auto", flex: 1 }}>

                    {/* Hospital header strip */}
                    <div style={{ background: "linear-gradient(135deg,#1e40af,#1d4ed8)", padding: "20px 24px", textAlign: "center" }}>
                        <p style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: "0 0 3px" }}>{hospitalName}</p>
                        {p?.hospital_id?.hospital_address && (
                            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, margin: "0 0 10px" }}>{p.hospital_id.hospital_address}</p>
                        )}
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 30, padding: "5px 16px", fontSize: 11, fontWeight: 700 }}>
                            <FaCheckCircle size={10} /> Payment Confirmed
                        </div>
                    </div>

                    {/* Amount box */}
                    <div style={{ margin: "20px 24px 0", background: "#ecfdf5", border: "2px solid #6ee7b7", borderRadius: 16, padding: "18px 20px", textAlign: "center" }}>
                        <p style={{ fontSize: 38, fontWeight: 900, color: "#059669", margin: 0, lineHeight: 1 }}>
                            ₹{Number(p?.amount || 0).toLocaleString("en-IN")}
                        </p>
                        <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, margin: "6px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                            <span style={{ color: payMethod?.color || "#64748b" }}>{payMethod?.icon}</span>
                            via {payMethod?.label || p?.payment_method}
                        </p>
                    </div>

                    {/* Receipt sections */}
                    <div style={{ padding: "4px 24px 24px" }}>

                        <Section label="Patient Details" icon={<FaUserAlt size={10} />}>
                            <Row label="Name" value={p?.patient_id?.patient_name} />
                            <Row label="Phone" value={p?.patient_id?.patient_phone} />
                            <Row label="Email" value={p?.patient_id?.patient_email} />
                        </Section>

                        <Section label="Doctor Details" icon={<FaStethoscope size={10} />}>
                            <Row label="Name" value={p?.doctor_id?.name} />
                            <Row label="Specialization" value={p?.doctor_id?.specialization} />
                            <Row label="Consultation Fee" value={p?.doctor_id?.consultation_fee ? `₹${p.doctor_id.consultation_fee.toLocaleString("en-IN")}` : null} valueColor="#059669" />
                        </Section>

                        <Section label="Appointment Details" icon={<FaCalendarAlt size={10} />}>
                            <Row label="Date" value={fmt(p?.appointment_id?.appointment_date)} />
                            <Row label="Time" value={`${p?.appointment_id?.start_time || "—"} – ${p?.appointment_id?.end_time || ""}`} />
                        </Section>

                        <Section label="Payment Details" icon={<FaRupeeSign size={10} />} last>
                            <Row label="Method" value={payMethod?.label || p?.payment_method} />
                            <Row label="Date & Time" value={new Date(p?.payment_date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
                            {p?.transaction_id && <Row label="Txn ID" value={p.transaction_id} />}
                            {p?.upi_id && <Row label="UPI ID" value={p.upi_id} />}
                            {p?.notes && <Row label="Notes" value={p.notes} />}
                        </Section>

                        {/* Footer */}
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed #e2e8f0", textAlign: "center" }}>
                            <p style={{ fontSize: 13, color: "#475569", fontWeight: 600, margin: "0 0 4px" }}>
                                Thank you for choosing <span style={{ color: COLOR }}>{hospitalName}</span>!
                            </p>
                            {p?.hospital_id?.hospital_phone && (
                                <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 6px" }}>
                                    📞 {p.hospital_id.hospital_phone}
                                </p>
                            )}
                            <p style={{ fontSize: 10, color: "#cbd5e1", fontWeight: 600, margin: 0, letterSpacing: "0.04em" }}>
                                Receipt No: {receiptNo}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Payment Modal ─────────────────────────────────────────────────────────────
const PaymentModal = ({ appt, existingPayment, onClose, onSuccess }) => {
    const [method, setMethod] = useState("CASH");
    // ✅ FIX 1: use != null so fee=0 is valid; Number() converts cleanly
    const fee = appt?.doctor_id?.consultation_fee;
    const [amount, setAmount] = useState(fee != null && fee !== "" ? String(fee) : "");
    const [upiId, setUpiId] = useState("");
    const [txnId, setTxnId] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    // ✅ FIX 2: if appt data arrives after initial render, sync amount
    useEffect(() => {
        const f = appt?.doctor_id?.consultation_fee;
        if (f != null && f !== "" && (amount === "" || amount === "0")) {
            setAmount(String(f));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appt?.doctor_id?.consultation_fee]);


    const onFocus = e => (e.target.style.borderColor = COLOR);
    const onBlur = e => (e.target.style.borderColor = "#e2e8f0");
    const inp = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "Nunito,sans-serif", color: "#0f172a", background: "#f8fafc", outline: "none" };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0)
            return Swal.fire("Invalid", "Please enter a valid amount", "warning");

        setSaving(true);
        try {
            const res = await axios.post(`${BASE}/reception/record-payment`, {
                appointment_id: appt._id,
                amount: Number(amount),
                payment_method: method,
                upi_id: method === "UPI" ? upiId : undefined,
                transaction_id: txnId || undefined,
                notes
            }, hdrs());

            onSuccess(res.data.payment);
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed to record payment", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(8px)", background: "rgba(15,23,42,0.65)" }}
            onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ background: `linear-gradient(135deg, ${COLOR}, #1e40af)` }}
                    className="px-6 py-5 flex items-start justify-between">
                    <div>
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Record Payment</p>
                        <h2 className="text-white font-bold text-lg">{appt?.patient_id?.patient_name}</h2>
                        <p className="text-blue-200 text-xs mt-1">
                             {appt?.doctor_id?.name} · {appt?.doctor_id?.specialization}
                        </p>
                    </div>
                    <button onClick={onClose}
                        style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "rgba(255,255,255,0.7)", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FaTimes size={14} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                    {/* Appt summary */}
                    <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", margin: "0 0 2px" }}>Date</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>{fmt(appt?.appointment_date)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", margin: "0 0 2px" }}>Time</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>{appt?.start_time} – {appt?.end_time}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", margin: "0 0 2px" }}>Consultation Fee</p>
                            {appt?.doctor_id?.consultation_fee != null && appt?.doctor_id?.consultation_fee !== "" ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: "#059669", margin: 0 }}>
                                        ₹{Number(appt.doctor_id.consultation_fee).toLocaleString("en-IN")}
                                    </p>
                                    {/* ✅ FIX 3: Quick-fill button if user cleared the amount field */}
                                    <button type="button"
                                        onClick={() => setAmount(String(appt.doctor_id.consultation_fee))}
                                        style={{ fontSize: 10, fontWeight: 700, color: "#059669", background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: 6, padding: "2px 7px", cursor: "pointer", fontFamily: "Nunito,sans-serif" }}>
                                        Use
                                    </button>
                                </div>
                            ) : (
                                <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, margin: 0, fontStyle: "italic" }}>Not set — enter manually</p>
                            )}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Payment Method</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                            {PAY_METHODS.map(m => (
                                <div key={m.key} onClick={() => setMethod(m.key)}
                                    style={{
                                        border: `2px solid ${method === m.key ? m.color : "#e2e8f0"}`,
                                        borderRadius: 12, padding: "14px 8px", textAlign: "center",
                                        cursor: "pointer", transition: "all 0.15s",
                                        background: method === m.key ? m.bg : "#fff",
                                        boxShadow: method === m.key ? `0 0 0 3px ${m.color}20` : "none"
                                    }}>
                                    <div style={{ color: method === m.key ? m.color : "#94a3b8", marginBottom: 6 }}>{m.icon}</div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: method === m.key ? m.color : "#64748b", margin: 0 }}>{m.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Amount */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                            Amount (₹) *
                        </label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                            placeholder="Enter amount" min="1" required style={inp} onFocus={onFocus} onBlur={onBlur} />
                    </div>

                    {/* UPI ID — shown only for UPI */}
                    {method === "UPI" && (
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                                UPI ID / QR Code ID
                            </label>
                            <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                                placeholder="e.g. patient@upi" style={inp} onFocus={onFocus} onBlur={onBlur} />
                        </div>
                    )}

                    {/* Transaction ID */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                            Transaction / Reference ID (optional)
                        </label>
                        <input type="text" value={txnId} onChange={e => setTxnId(e.target.value)}
                            placeholder="e.g. TXN123456" style={inp} onFocus={onFocus} onBlur={onBlur} />
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                            Notes (optional)
                        </label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)}
                            placeholder="Any remarks…" rows={2}
                            style={{ ...inp, resize: "none" }} onFocus={onFocus} onBlur={onBlur} />
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 12 }}>
                        <button type="button" onClick={onClose}
                            style={{ flex: 1, background: "#f1f5f9", border: "none", color: "#64748b", borderRadius: 12, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito,sans-serif" }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            style={{ flex: 1, background: `linear-gradient(135deg, #059669, #047857)`, border: "none", color: "#fff", borderRadius: 12, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito,sans-serif", opacity: saving ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            {saving ? "Recording…" : <><FaCheckCircle size={13} /> Record Payment</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const ReceptionistAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [selected, setSelected] = useState(null);   // detail modal
    const [payAppt, setPayAppt] = useState(null);   // payment modal
    const [receipt, setReceipt] = useState(null);   // receipt modal
    const [paidIds, setPaidIds] = useState(new Set()); // track paid appt ids
    const [page, setPage] = useState(1);
    const PER_PAGE = 5;

    const onFocus = (e) => {
        e.target.style.borderColor = COLOR;
    };

    const onBlur = (e) => {
        e.target.style.borderColor = "#e2e8f0";
    };

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${BASE}/reception/all-appointments`, hdrs());
            setAppointments(data.appointments || []);
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: "error", title: "Failed to load appointments" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAppointments(); }, []);

    const counts = {
        ALL: appointments.length,
        PENDING: appointments.filter(a => a.appointment_status === "PENDING").length,
        SCHEDULED: appointments.filter(a => a.appointment_status === "SCHEDULED").length,
        COMPLETED: appointments.filter(a => a.appointment_status === "COMPLETED").length,
        CANCELLED: appointments.filter(a => a.appointment_status === "CANCELLED").length,
        RESCHEDULED: appointments.filter(a => a.appointment_status === "RESCHEDULED").length,
    };

    const filtered = appointments.filter(a => {
        const matchFilter = filter === "ALL" || a.appointment_status === filter;
        const q = search.toLowerCase();
        return matchFilter && (
            !q ||
            (a.patient_id?.patient_name || "").toLowerCase().includes(q) ||
            (a.patient_id?.patient_email || "").toLowerCase().includes(q) ||
            (a.patient_id?.patient_phone || "").includes(q) ||
            (a.doctor_id?.name || "").toLowerCase().includes(q) ||
            (a.doctor_id?.specialization || "").toLowerCase().includes(q)
        );
    });

    // Reset to page 1 whenever search or filter changes
    useEffect(() => { setPage(1); }, [search, filter]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const handlePaymentSuccess = (payment) => {
        setPaidIds(prev => new Set([...prev, payment.appointment_id?._id || payment.appointment_id]));
        setPayAppt(null);
        setReceipt(payment);
        fetchAppointments(); // refresh statuses
    };

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                .appt-row { transition: background 0.12s; }
                .appt-row:hover { background: #f8fafc; }
                .tab-btn { transition: all 0.15s; cursor: pointer; border: none; font-family: Nunito,sans-serif; }
                .stat-card { transition: all 0.15s; cursor: pointer; }
                .stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
                .pay-btn { transition: all 0.15s; }
                .pay-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(5,150,105,0.3); }
            `}</style>

            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>All Appointments</h1>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>
                        {appointments.length} total · Manage appointments and record payments
                    </p>
                </div>
                <button onClick={fetchAppointments}
                    style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "1.5px solid #e2e8f0", color: "#64748b", borderRadius: 12, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito,sans-serif", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLOR; e.currentTarget.style.color = COLOR; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
                    <MdRefresh size={14} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            {/* ── Stat Cards ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginBottom: 24 }}>
                {[
                    { key: "ALL", label: "Total", accent: "#2563eb", bg: "#eff6ff" },
                    { key: "PENDING", label: "Pending", accent: "#d97706", bg: "#fffbeb" },
                    { key: "SCHEDULED", label: "Scheduled", accent: "#0891b2", bg: "#ecfeff" },
                    { key: "COMPLETED", label: "Completed", accent: "#059669", bg: "#ecfdf5" },
                    { key: "CANCELLED", label: "Cancelled", accent: "#dc2626", bg: "#fef2f2" },
                    { key: "RESCHEDULED", label: "Rescheduled", accent: "#7c3aed", bg: "#f5f3ff" },
                ].map(({ key, label, accent, bg }) => (
                    <div key={key} className="stat-card" onClick={() => setFilter(key)}
                        style={{
                            background: "#fff", borderRadius: 14, padding: "14px 16px",
                            border: filter === key ? `2px solid ${accent}` : "1.5px solid #f1f5f9",
                            boxShadow: filter === key ? `0 0 0 3px ${accent}15` : "0 1px 4px rgba(0,0,0,0.05)",
                        }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: 3 }}>{counts[key]}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: accent }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* ── Search + Filter ── */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #f1f5f9", padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <FaSearch size={12} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input placeholder="Search by patient, doctor, phone or specialization…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "Nunito,sans-serif", color: "#334155", background: "#f8fafc", outline: "none" }}
                        onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {["ALL", "PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"].map(s => (
                        <button key={s} className="tab-btn" onClick={() => setFilter(s)}
                            style={{ padding: "7px 14px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: filter === s ? COLOR : "#f1f5f9", color: filter === s ? "#fff" : "#64748b", border: filter === s ? `1px solid ${COLOR}` : "1px solid #e2e8f0" }}>
                            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Table ── */}
            {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 240, background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9" }}>
                    <div style={{ textAlign: "center" }}>
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading appointments…</p>
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220, background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", gap: 8 }}>
                    <FaCalendarAlt size={36} style={{ color: "#e2e8f0" }} />
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>No appointments found</p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>{search ? `No results for "${search}"` : "No appointments match the selected filter"}</p>
                </div>
            ) : (
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                    {/* Table head */}
                    <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 1fr 130px 110px 120px 160px", gap: 0, background: "#f8fafc", borderBottom: "1px solid #f1f5f9", padding: "10px 20px" }}>
                        {["#", "Patient", "Doctor", "Date", "Time", "Status", "Actions"].map(h => (
                            <p key={h} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{h}</p>
                        ))}
                    </div>

                    {paginated.map((appt, i) => {
                        const rowIndex = (page - 1) * PER_PAGE + i + 1;
                        const isPaid = paidIds.has(appt._id) || appt.appointment_status === "COMPLETED";
                        const canPay = ["SCHEDULED", "PENDING", "RESCHEDULED"].includes(appt.appointment_status);

                        return (
                            <div key={appt._id} className="appt-row"
                                style={{ display: "grid", gridTemplateColumns: "36px 1fr 1fr 130px 110px 120px 160px", padding: "14px 20px", borderBottom: "1px solid #f8fafc", alignItems: "center", gap: 0 }}>

                                {/* # */}
                                <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, margin: 0 }}>{rowIndex}</p>

                                {/* Patient */}
                                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${COLOR}, #1d4ed8)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                                        {(appt.patient_id?.patient_name || "P")[0].toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {appt.patient_id?.patient_name || "—"}
                                        </p>
                                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "1px 0 0", fontWeight: 500 }}>
                                            {appt.patient_id?.patient_phone || appt.patient_id?.patient_email || ""}
                                        </p>
                                    </div>
                                </div>

                                {/* Doctor */}
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: "#334155", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                         {appt.doctor_id?.name || "—"}
                                    </p>
                                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "1px 0 0", fontWeight: 500 }}>
                                        {appt.doctor_id?.specialization || ""}
                                        {appt.doctor_id?.consultation_fee ? ` · ₹${appt.doctor_id.consultation_fee}` : ""}
                                    </p>
                                </div>

                                {/* Date */}
                                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#475569", fontWeight: 600 }}>
                                    <FaCalendarAlt size={10} color="#94a3b8" />{fmt(appt.appointment_date)}
                                </div>

                                {/* Time */}
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#334155" }}>
                                    <FaClock size={9} color="#94a3b8" />{appt.start_time}
                                </span>

                                {/* Status */}
                                <Badge status={appt.appointment_status} />

                                {/* Actions */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {/* View */}
                                    <button onClick={() => setSelected(appt)}
                                        style={{ width: 32, height: 32, borderRadius: 9, background: "#eff6ff", border: "none", color: COLOR, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                        <FaEye size={13} />
                                    </button>

                                    {/* Pay */}
                                    {canPay && !isPaid ? (
                                        <button className="pay-btn" onClick={() => setPayAppt(appt)}
                                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 9, background: "linear-gradient(135deg,#059669,#047857)", border: "none", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito,sans-serif" }}>
                                            <FaRupeeSign size={10} /> Collect
                                        </button>
                                    ) : appt.appointment_status === "COMPLETED" ? (
                                        <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 9, background: "#ecfdf5", color: "#059669", fontSize: 11, fontWeight: 700, border: "1px solid #6ee7b7" }}>
                                            <FaCheckCircle size={10} /> Paid
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}

                    {/* ── Pagination footer ── */}
                    <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, margin: 0 }}>
                            Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} appointments
                        </p>
                        {totalPages > 1 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {/* Prev */}
                                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                                    style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e2e8f0", background: page === 1 ? "#f8fafc" : "#fff", color: page === 1 ? "#cbd5e1" : "#475569", cursor: page === 1 ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    ‹
                                </button>

                                {/* Page numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                                    .reduce((acc, n, idx, arr) => {
                                        if (idx > 0 && arr[idx - 1] !== n - 1) acc.push("…");
                                        acc.push(n);
                                        return acc;
                                    }, [])
                                    .map((item, idx) =>
                                        item === "…" ? (
                                            <span key={`dot-${idx}`} style={{ width: 32, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>…</span>
                                        ) : (
                                            <button key={item} onClick={() => setPage(item)}
                                                style={{ width: 32, height: 32, borderRadius: 8, border: page === item ? `2px solid ${COLOR}` : "1.5px solid #e2e8f0", background: page === item ? COLOR : "#fff", color: page === item ? "#fff" : "#475569", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito,sans-serif" }}>
                                                {item}
                                            </button>
                                        )
                                    )
                                }

                                {/* Next */}
                                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                                    style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e2e8f0", background: page === totalPages ? "#f8fafc" : "#fff", color: page === totalPages ? "#cbd5e1" : "#475569", cursor: page === totalPages ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    ›
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Detail Modal ── */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backdropFilter: "blur(8px)", background: "rgba(15,23,42,0.65)" }}
                    onClick={() => setSelected(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div style={{ background: `linear-gradient(135deg, ${COLOR}, #1e40af)` }} className="px-6 py-5 flex items-start justify-between">
                            <div>
                                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Appointment Details</p>
                                <h2 className="text-white font-bold text-lg">{selected.patient_id?.patient_name}</h2>
                                <p className="text-blue-200 text-xs mt-0.5">{selected.patient_id?.patient_phone}</p>
                            </div>
                            <button onClick={() => setSelected(null)} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "rgba(255,255,255,0.7)", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FaTimes size={14} />
                            </button>
                        </div>

                        <div style={{ padding: "0 24px 8px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div className="py-2"><Badge status={selected.appointment_status} /></div>
                            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                                Booked {new Date(selected.createdAt).toLocaleDateString("en-IN")}
                            </p>
                        </div>

                        <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {/* Patient */}
                            <div style={{ gridColumn: "1 / -1", background: "#f8fafc", borderRadius: 12, padding: "14px 16px", borderLeft: "3px solid #2563eb" }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: COLOR, textTransform: "uppercase", margin: "0 0 8px" }}>Patient</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    {[
                                        [<FaUserAlt size={10} />, selected.patient_id?.patient_name],
                                        [<FaPhone size={10} />, selected.patient_id?.patient_phone],
                                        [<FaEnvelope size={10} />, selected.patient_id?.patient_email],
                                        [<FaMapMarkerAlt size={10} />, selected.patient_id?.patient_address],
                                    ].filter(([, v]) => v).map(([icon, val], i) => (
                                        <p key={i} style={{ fontSize: 12, color: "#334155", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                                            <span style={{ color: "#94a3b8" }}>{icon}</span>{val}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Doctor */}
                            <div style={{ background: "#f5f3ff", borderRadius: 12, padding: "14px 16px", borderLeft: "3px solid #7c3aed" }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", margin: "0 0 8px" }}>Doctor</p>
                                <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: "0 0 3px" }}> {selected.doctor_id?.name}</p>
                                <p style={{ fontSize: 11, color: "#64748b", fontWeight: 500, margin: "0 0 3px" }}>{selected.doctor_id?.specialization}</p>
                                <p style={{ fontSize: 12, fontWeight: 700, color: "#059669", margin: 0 }}>₹{selected.doctor_id?.consultation_fee?.toLocaleString("en-IN")}</p>
                            </div>

                            {/* Appointment */}
                            <div style={{ background: "#ecfeff", borderRadius: 12, padding: "14px 16px", borderLeft: "3px solid #0891b2" }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: "#0891b2", textTransform: "uppercase", margin: "0 0 8px" }}>Appointment</p>
                                <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
                                    <FaCalendarAlt size={11} color="#0891b2" />{fmt(selected.appointment_date)}
                                </p>
                                <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
                                    <FaClock size={10} color="#94a3b8" />{selected.start_time} – {selected.end_time}
                                </p>
                            </div>
                        </div>

                        <div style={{ padding: "0 24px 24px", display: "flex", gap: 12 }}>
                            {["SCHEDULED", "PENDING", "RESCHEDULED"].includes(selected.appointment_status) && !paidIds.has(selected._id) && (
                                <button onClick={() => { setSelected(null); setPayAppt(selected); }}
                                    style={{ flex: 1, background: "linear-gradient(135deg,#059669,#047857)", border: "none", color: "#fff", borderRadius: 12, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                    <FaRupeeSign size={12} /> Collect Payment
                                </button>
                            )}
                            <button onClick={() => setSelected(null)}
                                style={{ flex: 1, background: "#f1f5f9", border: "none", color: "#64748b", borderRadius: 12, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito,sans-serif" }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Payment Modal ── */}
            {payAppt && (
                <PaymentModal
                    appt={payAppt}
                    onClose={() => setPayAppt(null)}
                    onSuccess={handlePaymentSuccess}
                />
            )}

            {/* ── Receipt Modal ── */}
            {receipt && (
                <Receipt
                    payment={receipt}
                    onClose={() => setReceipt(null)}
                />
            )}
        </div>
    );
};

export default ReceptionistAppointments;