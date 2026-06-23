import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FaCalendarCheck, FaClock, FaCheckCircle, FaCalendarAlt,
    FaRedo, FaLayerGroup, FaSyncAlt, FaBan, FaHospital
} from "react-icons/fa";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from "recharts";

const ChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: "#fff", borderRadius: 10, padding: "8px 14px",
                fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                border: "1px solid #e2e8f0"
            }}>
                <p style={{ color: "#94a3b8", marginBottom: 2 }}>{label}</p>
                <p style={{ fontWeight: 700, color: "#2563eb" }}>{payload[0].value} appointments</p>
            </div>
        );
    }
    return null;
};

const statusStyle = (status) => ({
    SCHEDULED:   { bg: "#dbeafe", color: "#1d4ed8", label: "Scheduled" },
    PENDING:     { bg: "#fef3c7", color: "#b45309", label: "Pending" },
    COMPLETED:   { bg: "#d1fae5", color: "#065f46", label: "Completed" },
    CANCELLED:   { bg: "#fee2e2", color: "#b91c1c", label: "Cancelled" },
    RESCHEDULED: { bg: "#ede9fe", color: "#5b21b6", label: "Rescheduled" },
}[status] || { bg: "#f1f5f9", color: "#475569", label: status || "—" });

// ✅ FIX: default week now uses real day names but 0 counts (not dummy data)
const EMPTY_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => ({
    day,
    appointments: 0
}));

const StaffDashboard = () => {
    const [stats,       setStats]       = useState({});
    const [todayAppts,  setTodayAppts]  = useState([]);
    // ✅ FIX: initialize with empty week, replaced by real data on fetch
    const [weeklyData,  setWeeklyData]  = useState(EMPTY_WEEK);
    const [role,        setRole]        = useState(localStorage.getItem("StaffRole") || "");
    const [loading,     setLoading]     = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const staffName = localStorage.getItem("StaffName") || "Staff";

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                "https://carexa-backend.vercel.app/staffapi/my-dashboard",
                { headers: { Authorization: `Bearer ${localStorage.getItem("StaffToken")}` } }
            );
            const d = res.data;
            setStats(d.stats || {});
            setTodayAppts(d.todayAppointments || []);
            // ✅ FIX: use real weeklyAppointments from API, fall back to empty week
            setWeeklyData(d.weeklyAppointments?.length ? d.weeklyAppointments : EMPTY_WEEK);
            if (d.role) {
                setRole(d.role);
                localStorage.setItem("StaffRole", d.role);
            }
            setLastUpdated(new Date());
        } catch (err) {
            console.log("Dashboard Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    const doctorCards = [
        { label: "Total Assigned",   value: stats.totalAssigned       ?? 0, icon: <FaCalendarCheck size={18}/>, accent: "#2563eb", bg: "#eff6ff", sub: "All appointments" },
        { label: "Scheduled",        value: stats.totalScheduled      ?? 0, icon: <FaCalendarAlt size={18}/>,   accent: "#0891b2", bg: "#ecfeff", sub: "Confirmed" },
        { label: "Pending",          value: stats.totalPending        ?? 0, icon: <FaClock size={18}/>,         accent: "#d97706", bg: "#fffbeb", sub: "Awaiting action" },
        { label: "Completed",        value: stats.totalCompleted      ?? 0, icon: <FaCheckCircle size={18}/>,   accent: "#059669", bg: "#ecfdf5", sub: "Done" },
        { label: "Cancelled",        value: stats.totalCancelled      ?? 0, icon: <FaBan size={18}/>,           accent: "#dc2626", bg: "#fef2f2", sub: "Cancelled" },
        { label: "Available Slots",  value: stats.totalAvailableSlots ?? 0, icon: <FaLayerGroup size={18}/>,   accent: "#7c3aed", bg: "#f5f3ff", sub: `of ${stats.totalSlots ?? 0} total` },
    ];

    const receptionistCards = [
        { label: "Total Appointments",  value: stats.totalAppointments       ?? 0, icon: <FaCalendarCheck size={18}/>, accent: "#2563eb", bg: "#eff6ff", sub: "All time" },
        { label: "Scheduled",           value: stats.totalScheduled          ?? 0, icon: <FaCalendarAlt size={18}/>,   accent: "#0891b2", bg: "#ecfeff", sub: "Confirmed" },
        { label: "Pending",             value: stats.totalPending            ?? 0, icon: <FaClock size={18}/>,         accent: "#d97706", bg: "#fffbeb", sub: "Awaiting approval" },
        { label: "Completed",           value: stats.totalCompleted          ?? 0, icon: <FaCheckCircle size={18}/>,   accent: "#059669", bg: "#ecfdf5", sub: "Done" },
        { label: "Reschedule Requests", value: stats.totalRescheduleRequests ?? 0, icon: <FaSyncAlt size={18}/>,       accent: "#7c3aed", bg: "#f5f3ff", sub: "Pending review" },
    ];

    const statCards = role === "DOCTOR" ? doctorCards : receptionistCards;

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
            <div style={{ textAlign: "center" }}>
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading dashboard…</p>
            </div>
        </div>
    );

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                .sc { transition: transform 0.18s ease, box-shadow 0.18s ease; }
                .sc:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }
                .rh { transition: background 0.12s; }
                .rh:hover { background: #f8fafc; }
            `}</style>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>Dashboard</h1>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>
                        Welcome back, {staffName} · {role}
                        {lastUpdated && (
                            <span style={{ marginLeft: 10, color: "#cbd5e1" }}>
                                · Updated {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        )}
                    </p>
                </div>
                <button onClick={fetchDashboard} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: "#fff", border: "1.5px solid #e2e8f0", color: "#64748b",
                    borderRadius: 12, padding: "9px 18px", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "Nunito, sans-serif",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
                >
                    <FaRedo size={11}/> Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${statCards.length}, 1fr)`,
                gap: 16, marginBottom: 24
            }}>
                {statCards.map(({ label, value, icon, accent, bg, sub }) => (
                    <div key={label} className="sc" style={{
                        background: "#fff", borderRadius: 16,
                        border: "1.5px solid #f1f5f9", padding: "22px 20px",
                        boxShadow: "0 1px 6px rgba(0,0,0,0.05)"
                    }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, color: accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                            {icon}
                        </div>
                        <div style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: 4 }}>
                            {value}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{sub}</div>
                    </div>
                ))}
            </div>

            {/* Chart + Today's Appointments */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                {/* ✅ FIX: Chart now uses real weeklyData from API instead of hardcoded dummy data */}
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", padding: "24px 26px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>This Week</h3>
                            <p style={{ fontSize: 12, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                Daily appointment volume
                            </p>
                        </div>
                        <span style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700 }}>
                            7 days
                        </span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                            <defs>
                                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.12}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                            <XAxis
                                dataKey="day"
                                axisLine={false} tickLine={false}
                                tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "Nunito", fontWeight: 600 }}
                            />
                            <YAxis
                                axisLine={false} tickLine={false} allowDecimals={false}
                                tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "Nunito", fontWeight: 600 }}
                            />
                            <Tooltip content={<ChartTooltip/>} cursor={{ stroke: "#e2e8f0", strokeWidth: 1.5 }}/>
                            <Area
                                type="monotone" dataKey="appointments"
                                stroke="#2563eb" strokeWidth={2.5} fill="url(#g1)"
                                dot={{ fill: "#2563eb", r: 4, strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Today's Appointments */}
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                    <div style={{ padding: "20px 22px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, background: "#eff6ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FaCalendarCheck size={14} color="#2563eb"/>
                        </div>
                        <div>
                            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>Today's Appointments</h3>
                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontWeight: 500 }}>
                                {todayAppts.length} scheduled for today
                            </p>
                        </div>
                    </div>

                    <div style={{ overflowY: "auto", maxHeight: 290 }}>
                        {todayAppts.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                <FaCalendarAlt size={28} color="#cbd5e1" style={{ marginBottom: 10 }}/>
                                <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>No appointments today</p>
                            </div>
                        ) : todayAppts.map((a, i) => {
                            const s = statusStyle(a.appointment_status);
                            const patientName = a.patient_id?.patient_name || "Patient";
                            const doctorName  = a.doctor_id?.name || "";
                            return (
                                <div key={i} className="rh" style={{
                                    padding: "13px 22px", borderBottom: "1px solid #f8fafc",
                                    display: "flex", alignItems: "center", gap: 12
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "50%",
                                        background: "#eff6ff", display: "flex", alignItems: "center",
                                        justifyContent: "center", fontSize: 13, fontWeight: 800,
                                        color: "#2563eb", flexShrink: 0
                                    }}>
                                        {patientName[0].toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {patientName}
                                        </p>
                                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontWeight: 500 }}>
                                            {doctorName ? `${doctorName} · ` : ""}{a.start_time || "—"}
                                        </p>
                                    </div>
                                    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;