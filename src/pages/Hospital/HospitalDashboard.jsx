import React, { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import {
    FaUserMd, FaCalendarCheck, FaClock, FaRedo,
    FaBell, FaClipboardList, FaChartLine, FaCheckCircle,
    FaCalendarAlt, FaLayerGroup, FaHospital,
    FaSyncAlt, FaCircle
} from "react-icons/fa";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: "#fff", color: "#1e293b", borderRadius: 10,
                padding: "8px 14px", fontSize: 12,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
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

const HospitalDashboard = () => {
    const { globalSearch = "" } = useOutletContext() || {};
    const [stats, setStats]                 = useState(null);
    const [todayAppts, setTodayAppts]       = useState([]);
    const [weekly, setWeekly]               = useState([]);
    const [doctors, setDoctors]             = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [activities, setActivities]       = useState([]);
    const [loading, setLoading]             = useState(true);
    const [lastUpdated, setLastUpdated]     = useState(null);

    const hospitalName = localStorage.getItem("HospitalName") || "Hospital Admin";
    const token        = localStorage.getItem("HospitalToken");
    const headers      = { Authorization: `Bearer ${token}` };

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                "https://carexa-backend.vercel.app/hospitalapi/get-Dashboard-Status",
                { headers }
            );
            const d = res.data;
            setStats(d.stats);
            setTodayAppts(d.todayAppointments  || []);
            setWeekly(d.weeklyAppointments     || []);
            setDoctors(d.doctorAvailability    || []);
            setNotifications(d.notifications   || []);
            setActivities(d.activities         || []);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-400 text-sm">Loading dashboard…</p>
            </div>
        </div>
    );

    const statCards = [
        { label: "Total Doctors",       value: stats?.totalDoctors ?? 0,              icon: <FaUserMd size={18} />,        accent: "#2563eb", lightBg: "#eff6ff", sub: `${doctors.filter(d => d.available).length} available today` },
        { label: "Total Appointments",  value: stats?.totalAppointments ?? 0,         icon: <FaCalendarCheck size={18} />, accent: "#0891b2", lightBg: "#ecfeff", sub: `${stats?.totalScheduledAppointments ?? 0} scheduled` },
        { label: "Pending",             value: stats?.totalPendingAppointments ?? 0,  icon: <FaClock size={18} />,         accent: "#d97706", lightBg: "#fffbeb", sub: "Awaiting approval" },
        { label: "Reschedule Requests", value: stats?.totalRescheduleRequests ?? 0,   icon: <FaSyncAlt size={18} />,       accent: "#7c3aed", lightBg: "#f5f3ff", sub: "Need your review" },
        { label: "Completed",           value: stats?.totalCompletedAppointments ?? 0,icon: <FaCheckCircle size={18} />,   accent: "#059669", lightBg: "#ecfdf5", sub: "All time" },
        { label: "Available Slots",     value: stats?.totalAvailableSlots ?? 0,       icon: <FaLayerGroup size={18} />,    accent: "#db2777", lightBg: "#fdf2f8", sub: `of ${stats?.totalAppointmentSlots ?? 0} total` },
    ];

    const notifColors = {
        amber: { bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b", text: "#92400e" },
        blue:  { bg: "#eff6ff", border: "#bfdbfe", dot: "#2563eb", text: "#1e40af" },
        red:   { bg: "#fef2f2", border: "#fecaca", dot: "#dc2626", text: "#991b1b" },
        green: { bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a", text: "#14532d" },
    };

    const q = (globalSearch || "").trim().toLowerCase();
    const filteredTodayAppts = todayAppts.filter(a =>
        !q ||
        (a.patient || "").toLowerCase().includes(q) ||
        (a.doctor || "").toLowerCase().includes(q) ||
        (a.status || "").toLowerCase().includes(q)
    );
    const filteredDoctors = doctors.filter(d =>
        !q ||
        (d.name || "").toLowerCase().includes(q) ||
        (d.specialization || "").toLowerCase().includes(q)
    );

    return (
        <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Nunito', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                .stat-card  { transition: transform 0.18s ease, box-shadow 0.18s ease; }
                .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }
                .row-hover  { transition: background 0.12s; }
                .row-hover:hover { background: #f8fafc; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: #f1f5f9; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            `}</style>

            <div style={{ maxWidth: 1380, margin: "0 auto", padding: "32px 28px" }}>

                {/* ── Header ── */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 12,
                                background: "linear-gradient(135deg, #2563eb, #0891b2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
                            }}>
                                <FaHospital size={16} color="#fff" />
                            </div>
                            <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>
                                {hospitalName}
                            </p>
                        </div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
                            Dashboard Overview
                        </h1>
                        <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0", fontWeight: 500 }}>
                            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            {lastUpdated && (
                                <span style={{ marginLeft: 10, color: "#cbd5e1" }}>
                                    · Refreshed {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={fetchDashboard}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            background: "#fff", border: "1.5px solid #e2e8f0",
                            color: "#64748b", borderRadius: 12, padding: "10px 20px",
                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)", fontFamily: "Nunito, sans-serif"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
                    >
                        <FaRedo size={11} /> Refresh
                    </button>
                </div>

                {/* ── Stat Cards ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, marginBottom: 24 }}>
                    {statCards.map(({ label, value, icon, accent, lightBg, sub }) => (
                        <div key={label} className="stat-card" style={{
                            background: "#fff", borderRadius: 16,
                            border: "1.5px solid #f1f5f9",
                            padding: "20px 18px",
                            boxShadow: "0 1px 6px rgba(0,0,0,0.05)"
                        }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: lightBg, color: accent,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                marginBottom: 14
                            }}>
                                {icon}
                            </div>
                            <div style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: 4 }}>
                                {value}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 3 }}>
                                {label}
                            </div>
                            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{sub}</div>
                        </div>
                    ))}
                </div>

                {/* ── Chart + Notifications ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 20, marginBottom: 20 }}>

                    {/* Chart */}
                    <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", padding: "24px 26px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                            <div>
                                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>Appointments This Week</h3>
                                <p style={{ fontSize: 12, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>Daily appointment volume</p>
                            </div>
                            <span style={{
                                background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe",
                                borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700,
                                display: "flex", alignItems: "center", gap: 5
                            }}>
                                <FaChartLine size={10} /> Live
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={weekly} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                                <defs>
                                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "Nunito", fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "Nunito", fontWeight: 600 }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1.5 }} />
                                <Area type="monotone" dataKey="appointments"
                                    stroke="#2563eb" strokeWidth={2.5} fill="url(#blueGrad)"
                                    dot={{ fill: "#2563eb", r: 4, strokeWidth: 2, stroke: "#fff" }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Notifications */}
                    <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", padding: 22, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                            <div style={{ width: 36, height: 36, background: "#fffbeb", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FaBell size={14} color="#d97706" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>Notifications</h3>
                                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontWeight: 500 }}>{notifications.length} alerts</p>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {notifications.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "28px 0" }}>
                                    <FaCheckCircle size={26} color="#10b981" style={{ marginBottom: 8 }} />
                                    <p style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>All clear!</p>
                                    <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>No pending actions</p>
                                </div>
                            ) : notifications.map((n, i) => {
                                const c = notifColors[n.color] || notifColors.amber;
                                return (
                                    <div key={i} style={{
                                        background: c.bg, border: `1px solid ${c.border}`,
                                        borderRadius: 10, padding: "11px 13px",
                                        display: "flex", alignItems: "flex-start", gap: 9
                                    }}>
                                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, marginTop: 4, flexShrink: 0 }} />
                                        <p style={{ fontSize: 12, color: c.text, margin: 0, lineHeight: 1.5, fontWeight: 600 }}>
                                            {typeof n === "string" ? n : n.msg}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Bottom Grid ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 290px", gap: 20 }}>

                    {/* Today's Appointments */}
                    <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, background: "#eff6ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FaCalendarCheck size={14} color="#2563eb" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>Today's Appointments</h3>
                                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontWeight: 500 }}>{todayAppts.length} appointments today</p>
                            </div>
                        </div>
                        <div style={{ overflowY: "auto", maxHeight: 280 }}>
                            {filteredTodayAppts.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "36px 20px" }}>
                                    <FaCalendarAlt size={28} color="#cbd5e1" style={{ marginBottom: 8 }} />
                                    <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>No appointments found</p>
                                </div>
                            ) : filteredTodayAppts.map((a, i) => {
                                const s = statusStyle(a.status);
                                return (
                                    <div key={i} className="row-hover" style={{
                                        padding: "13px 22px", borderBottom: "1px solid #f8fafc",
                                        display: "flex", alignItems: "center", gap: 12
                                    }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: "50%", background: "#eff6ff",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 13, fontWeight: 800, color: "#2563eb", flexShrink: 0
                                        }}>
                                            {(a.patient || "P")[0].toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {a.patient}
                                            </p>
                                            <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontWeight: 500 }}>
                                                {a.doctor}{a.specialization ? ` · ${a.specialization}` : ""}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", margin: 0 }}>{a.time}</p>
                                            <span style={{
                                                display: "inline-block", marginTop: 4,
                                                background: s.bg, color: s.color,
                                                padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700
                                            }}>{s.label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, background: "#f5f3ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FaClipboardList size={14} color="#7c3aed" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>Recent Activity</h3>
                                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontWeight: 500 }}>Latest appointment events</p>
                            </div>
                        </div>
                        <div style={{ overflowY: "auto", maxHeight: 280 }}>
                            {activities.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "36px 20px" }}>
                                    <FaClipboardList size={28} color="#cbd5e1" style={{ marginBottom: 8 }} />
                                    <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>No recent activity</p>
                                </div>
                            ) : activities.map((act, i) => {
                                const s = statusStyle(typeof act === "string" ? "" : act.status);
                                const text = typeof act === "string" ? act : act.text;
                                return (
                                    <div key={i} className="row-hover" style={{
                                        padding: "13px 22px", borderBottom: "1px solid #f8fafc",
                                        display: "flex", alignItems: "flex-start", gap: 11
                                    }}>
                                        <div style={{
                                            width: 7, height: 7, borderRadius: "50%",
                                            background: act.status ? s.color : "#cbd5e1",
                                            marginTop: 5, flexShrink: 0
                                        }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 12, color: "#334155", margin: 0, lineHeight: 1.55, fontWeight: 600 }}>{text}</p>
                                            {act.time && <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontWeight: 500 }}>{act.time}</p>}
                                        </div>
                                        {act.status && (
                                            <span style={{
                                                background: s.bg, color: s.color,
                                                padding: "2px 8px", borderRadius: 6,
                                                fontSize: 10, fontWeight: 700, flexShrink: 0
                                            }}>{s.label}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Doctor Availability */}
                    <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, background: "#ecfeff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FaUserMd size={14} color="#0891b2" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>Doctors Today</h3>
                                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontWeight: 500 }}>
                                    {doctors.filter(d => d.available).length} of {doctors.length} available
                                </p>
                            </div>
                        </div>
                        <div style={{ overflowY: "auto", maxHeight: 280 }}>
                            {filteredDoctors.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "36px 20px" }}>
                                    <FaUserMd size={28} color="#cbd5e1" style={{ marginBottom: 8 }} />
                                    <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>No doctors found</p>
                                </div>
                            ) : filteredDoctors.map((doc, i) => (
                                <div key={i} className="row-hover" style={{
                                    padding: "13px 18px", borderBottom: "1px solid #f8fafc",
                                    display: "flex", alignItems: "center", gap: 11
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "50%", background: "#ecfeff",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 13, fontWeight: 800, color: "#0891b2", flexShrink: 0
                                    }}>
                                        {(doc.name || "D")[0].toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {doc.name}
                                        </p>
                                        {doc.specialization && (
                                            <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {doc.specialization}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 5,
                                        padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0,
                                        background: doc.available ? "#f0fdf4" : "#fef2f2",
                                        color: doc.available ? "#16a34a" : "#dc2626",
                                        border: `1px solid ${doc.available ? "#bbf7d0" : "#fecaca"}`
                                    }}>
                                        <FaCircle size={5} />
                                        {doc.available ? "Available" : "Busy"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalDashboard;