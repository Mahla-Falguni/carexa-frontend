import { useRef } from "react";
import { FaReceipt, FaPrint, FaTimes, FaMoneyBillWave, FaQrcode, FaCreditCard, FaRupeeSign } from "react-icons/fa";

const METHOD_CFG = {
    CASH:  { label: "Cash",    icon: "💵", color: "#059669" },
    UPI:   { label: "UPI",     icon: "📱", color: "#7c3aed" },
    CARD:  { label: "Card",    icon: "💳", color: "#0891b2" },
    OTHER: { label: "Other",   icon: "💰", color: "#d97706" },
};

const fmt     = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—";
const fmtFull = (d) => d ? new Date(d).toLocaleString("en-IN",     { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const PaymentReceiptModal = ({ payment, onClose }) => {
    const receiptRef  = useRef();
    const hospitalName = localStorage.getItem("HospitalName") || payment?.hospital_id?.hospital_name || "Hospital";
    const receiptNo    = `RCP-${(payment?._id || "").slice(-8).toUpperCase()}`;
    const method       = METHOD_CFG[payment?.payment_method] || METHOD_CFG.OTHER;

    const handlePrint = () => {
        const content = receiptRef.current.innerHTML;
        const w = window.open("", "_blank");
        w.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Receipt ${receiptNo}</title>
    <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Source Sans 3', sans-serif;
            background: #f0f4f8;
            padding: 24px;
            color: #1e293b;
        }
        .page-wrap { max-width: 440px; margin: 0 auto; }

        /* ── Top band ── */
        .top-band {
            background: linear-gradient(135deg, #0f2242 0%, #1e3a6e 50%, #2563eb 100%);
            border-radius: 18px 18px 0 0;
            padding: 28px 28px 24px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .top-band::before {
            content: '';
            position: absolute;
            top: -30px; right: -30px;
            width: 120px; height: 120px;
            border-radius: 50%;
            background: rgba(255,255,255,0.06);
        }
        .top-band::after {
            content: '';
            position: absolute;
            bottom: -20px; left: -20px;
            width: 90px; height: 90px;
            border-radius: 50%;
            background: rgba(255,255,255,0.04);
        }
        .hospital-name {
            font-family: 'Lora', serif;
            font-size: 22px;
            font-weight: 700;
            color: #fff;
            letter-spacing: 0.3px;
            position: relative; z-index: 1;
        }
        .hospital-addr {
            font-size: 12px;
            color: rgba(255,255,255,0.6);
            margin-top: 4px;
            position: relative; z-index: 1;
        }
        .confirmed-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255,255,255,0.15);
            border: 1px solid rgba(255,255,255,0.25);
            border-radius: 20px;
            padding: 5px 14px;
            font-size: 11px;
            font-weight: 700;
            color: #fff;
            letter-spacing: 0.5px;
            margin-top: 12px;
            position: relative; z-index: 1;
        }

        /* ── Amount hero ── */
        .amount-hero {
            background: #fff;
            padding: 28px 28px 20px;
            text-align: center;
            border-left: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
        }
        .amount-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #94a3b8;
            margin-bottom: 8px;
        }
        .amount-value {
            font-family: 'Lora', serif;
            font-size: 48px;
            font-weight: 700;
            color: #059669;
            line-height: 1;
        }
        .amount-method {
            font-size: 13px;
            color: #64748b;
            margin-top: 8px;
            font-weight: 500;
        }

        /* ── Divider ── */
        .divider {
            display: flex;
            align-items: center;
            padding: 0 20px;
            background: #fff;
            border-left: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
        }
        .divider-line { flex: 1; height: 1px; background: #e2e8f0; }
        .divider-circle {
            width: 10px; height: 10px;
            border-radius: 50%;
            background: #f0f4f8;
            border: 1px solid #e2e8f0;
            margin: 0 -5px;
            flex-shrink: 0;
        }
        .dashed-line {
            flex: 1;
            border: none;
            border-top: 2px dashed #e2e8f0;
        }

        /* ── Sections ── */
        .body { background: #fff; padding: 0 28px 20px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
        .section { margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px dashed #e8edf2; }
        .section:last-child { border: none; margin-bottom: 0; padding-bottom: 0; }
        .section-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #94a3b8;
            margin: 18px 0 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .section-title::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 7px;
            font-size: 13px;
        }
        .info-key { color: #64748b; font-weight: 400; flex-shrink: 0; margin-right: 16px; }
        .info-val { font-weight: 600; color: #0f172a; text-align: right; word-break: break-word; max-width: 58%; }
        .info-val.green { color: #059669; }

        /* ── Receipt ID strip ── */
        .rcpt-strip {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 18px 18px;
            padding: 14px 28px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .rcpt-no  { font-size: 10px; color: #94a3b8; font-weight: 600; letter-spacing: 0.08em; }
        .thank-you { font-size: 11px; color: #64748b; font-style: italic; font-family: 'Lora', serif; }

        @media print {
            body { background: #fff; padding: 0; }
            .page-wrap { max-width: 100%; }
        }
    </style>
</head>
<body>
${content}
</body>
</html>`);
        w.document.close();
        setTimeout(() => w.print(), 400);
    };

    const p = payment;

    return (
        <div
            style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(12px)", background:"rgba(10,20,40,0.82)" }}
            onClick={onClose}
        >
            <div
                style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:480, overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.35)", maxHeight:"92vh", display:"flex", flexDirection:"column" }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Toolbar ── */}
                <div style={{ background:"linear-gradient(135deg,#0f2242,#2563eb)", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <FaReceipt size={16} color="#fff"/>
                        </div>
                        <div>
                            <p style={{ color:"#fff", fontWeight:700, fontSize:14, margin:0, fontFamily:"'Lora',serif" }}>Payment Receipt</p>
                            <p style={{ color:"rgba(255,255,255,0.55)", fontSize:11, margin:0, fontFamily:"monospace", letterSpacing:"0.05em" }}>{receiptNo}</p>
                        </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                        <button
                            onClick={handlePrint}
                            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}
                        >
                            <FaPrint size={11}/> Print
                        </button>
                        <button
                            onClick={onClose}
                            style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,0.10)", border:"none", color:"rgba(255,255,255,0.6)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
                        >
                            <FaTimes size={14}/>
                        </button>
                    </div>
                </div>

                {/* ── Scrollable receipt body ── */}
                <div style={{ overflowY:"auto", flex:1 }}>
                    <div ref={receiptRef}>
                        <div className="page-wrap">

                            {/* Top band */}
                            <div className="top-band">
                                <div className="hospital-name">{hospitalName}</div>
                                {p?.hospital_id?.hospital_address && (
                                    <div className="hospital-addr">{p.hospital_id.hospital_address}</div>
                                )}
                                <div className="confirmed-badge">✓ &nbsp;Payment Confirmed</div>
                            </div>

                            {/* Amount hero */}
                            <div className="amount-hero">
                                <div className="amount-label">Amount Paid</div>
                                <div className="amount-value">₹{Number(p?.amount || 0).toLocaleString("en-IN")}</div>
                                <div className="amount-method">{method.icon} &nbsp;via {method.label}</div>
                            </div>

                            {/* Tear divider */}
                            <div className="divider">
                                <div className="divider-circle"/>
                                <div className="dashed-line"/>
                                <div className="divider-circle"/>
                            </div>

                            {/* Body sections */}
                            <div className="body">
                                {/* Patient */}
                                <div className="section-title">👤 &nbsp;Patient Details</div>
                                <div className="section">
                                    <div className="info-row"><span className="info-key">Name</span><span className="info-val">{p?.patient_id?.patient_name || "—"}</span></div>
                                    <div className="info-row"><span className="info-key">Phone</span><span className="info-val">{p?.patient_id?.patient_phone || "—"}</span></div>
                                    <div className="info-row"><span className="info-key">Email</span><span className="info-val">{p?.patient_id?.patient_email || "—"}</span></div>
                                    {p?.patient_id?.patient_gender && <div className="info-row"><span className="info-key">Gender</span><span className="info-val" style={{ textTransform:"capitalize" }}>{p.patient_id.patient_gender}</span></div>}
                                </div>

                                {/* Doctor */}
                                <div className="section-title">🩺 &nbsp;Doctor Details</div>
                                <div className="section">
                                    <div className="info-row"><span className="info-key">Name</span><span className="info-val"> {p?.doctor_id?.name || "—"}</span></div>
                                    <div className="info-row"><span className="info-key">Specialization</span><span className="info-val">{p?.doctor_id?.specialization || "—"}</span></div>
                                    <div className="info-row"><span className="info-key">Consultation Fee</span><span className="info-val green">₹{p?.doctor_id?.consultation_fee?.toLocaleString("en-IN") || "—"}</span></div>
                                </div>

                                {/* Appointment */}
                                <div className="section-title">📅 &nbsp;Appointment Details</div>
                                <div className="section">
                                    <div className="info-row"><span className="info-key">Date</span><span className="info-val">{fmt(p?.appointment_id?.appointment_date)}</span></div>
                                    <div className="info-row"><span className="info-key">Time</span><span className="info-val">{p?.appointment_id?.start_time}{p?.appointment_id?.end_time ? ` – ${p.appointment_id.end_time}` : ""}</span></div>
                                    <div className="info-row"><span className="info-key">Status</span><span className="info-val">{p?.appointment_id?.appointment_status || "—"}</span></div>
                                </div>

                                {/* Payment */}
                                <div className="section-title">💳 &nbsp;Payment Details</div>
                                <div className="section">
                                    <div className="info-row"><span className="info-key">Method</span><span className="info-val">{method.icon} {method.label}</span></div>
                                    <div className="info-row"><span className="info-key">Date &amp; Time</span><span className="info-val">{fmtFull(p?.payment_date)}</span></div>
                                    {p?.transaction_id && <div className="info-row"><span className="info-key">Txn ID</span><span className="info-val" style={{ fontFamily:"monospace", fontSize:11 }}>{p.transaction_id}</span></div>}
                                    {p?.upi_id        && <div className="info-row"><span className="info-key">UPI ID</span><span className="info-val">{p.upi_id}</span></div>}
                                    {p?.recorded_by?.name && <div className="info-row"><span className="info-key">Recorded by</span><span className="info-val">{p.recorded_by.name}</span></div>}
                                    {p?.notes         && <div className="info-row"><span className="info-key">Notes</span><span className="info-val">{p.notes}</span></div>}
                                </div>
                            </div>

                            {/* Receipt strip */}
                            <div className="rcpt-strip">
                                <span className="rcpt-no">RECEIPT NO: {receiptNo}</span>
                                <span className="thank-you">Thank you! 🙏</span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentReceiptModal;