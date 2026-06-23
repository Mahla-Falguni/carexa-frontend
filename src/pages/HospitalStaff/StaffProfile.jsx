import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    FaUserMd, FaEnvelope, FaPhone, FaHospital,
    FaMapMarkerAlt, FaEdit, FaSave, FaTimes,
    FaLock, FaEye, FaEyeSlash, FaCamera, FaCheckCircle
} from "react-icons/fa";

const BASE_URL = "https://carexa-backend.vercel.app/";

const StaffProfile = () => {
    const [staff,        setStaff]        = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [editing,      setEditing]      = useState(false);
    const [saving,       setSaving]       = useState(false);
    const [activeTab,    setActiveTab]    = useState("profile"); // "profile" | "password"

    // Edit form
    const [form, setForm] = useState({ name: "", phone: "" });
    const [imgFile, setImgFile] = useState(null);
    const [imgPreview, setImgPreview] = useState(null);

    // Password form
    const [pwForm, setPwForm]   = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [showPw, setShowPw]   = useState({ current: false, new: false, confirm: false });
    const [pwSaving, setPwSaving] = useState(false);

    const token   = localStorage.getItem("StaffToken");
    const headers = { Authorization: `Bearer ${token}` };

    // ── Fetch profile ─────────────────────────────────────────────────────────
    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/staffapi/staff-profile`, { headers });
            const s = res.data.staff;
            setStaff(s);
            setForm({ name: s.name || "", phone: s.phone || "" });
        } catch (err) {
            console.log("Profile fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    // ── Image picker ──────────────────────────────────────────────────────────
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImgFile(file);
        setImgPreview(URL.createObjectURL(file));
    };

    // ── Save profile ──────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("name",  form.name);
            formData.append("phone", form.phone);
            if (imgFile) formData.append("img", imgFile);

            await axios.put(`${BASE_URL}/staffapi/update-own-profile`, formData, {
                headers: { ...headers, "Content-Type": "multipart/form-data" }
            });

            Swal.fire({ icon: "success", title: "Profile Updated!", timer: 1500, showConfirmButton: false });
            setEditing(false);
            setImgFile(null);
            setImgPreview(null);
            fetchProfile();
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setSaving(false);
        }
    };

    // ── Change password ───────────────────────────────────────────────────────
    const handlePasswordChange = async () => {
        if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword)
            return Swal.fire("Missing Fields", "Please fill all password fields.", "warning");
        if (pwForm.newPassword !== pwForm.confirmPassword)
            return Swal.fire("Mismatch", "New passwords do not match.", "warning");
        if (pwForm.newPassword.length < 6)
            return Swal.fire("Too Short", "Password must be at least 6 characters.", "warning");

        setPwSaving(true);
        try {
            await axios.post(`${BASE_URL}/staffapi/change-password`, pwForm, { headers });
            Swal.fire({ icon: "success", title: "Password Changed!", timer: 1500, showConfirmButton: false });
            setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed to change password", "error");
        } finally {
            setPwSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditing(false);
        setImgFile(null);
        setImgPreview(null);
        if (staff) setForm({ name: staff.name || "", phone: staff.phone || "" });
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const roleColor = {
        DOCTOR:       { bg: "#eff6ff", color: "#1d4ed8" },
        RECEPTIONIST: { bg: "#ecfdf5", color: "#065f46" },
        NURSE:        { bg: "#fdf2f8", color: "#be185d" },
    }[staff?.role] || { bg: "#f1f5f9", color: "#475569" };

    const statusColor = staff?.status === "ACTIVE"
        ? { bg: "#ecfdf5", color: "#059669", dot: "#10b981" }
        : { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" };

    const avatarSrc = imgPreview
        ? imgPreview
        : staff?.img
        ? `${BASE_URL}/uploads/${staff.img}`
        : null;

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
            <div style={{ textAlign: "center" }}>
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading profile…</p>
            </div>
        </div>
    );

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif", maxWidth: 1000, margin: "0 auto" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                .tab-btn { transition: all 0.15s; cursor: pointer; border: none; background: none; font-family: Nunito, sans-serif; }
                .inp { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; font-size: 14px; font-family: Nunito, sans-serif; color: #0f172a; background: #f8fafc; transition: border 0.15s; outline: none; }
                .inp:focus { border-color: #2563eb; background: #fff; }
                .inp:disabled { color: #94a3b8; background: #f8fafc; cursor: default; }
                .save-btn { background: linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; border:none; border-radius:12px; padding:11px 28px; font-size:14px; font-weight:700; cursor:pointer; font-family:Nunito,sans-serif; transition:all 0.15s; }
                .save-btn:hover { box-shadow: 0 6px 20px rgba(37,99,235,0.35); transform: translateY(-1px); }
                .save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
                .cancel-btn { background:#f1f5f9; color:#64748b; border:none; border-radius:12px; padding:11px 20px; font-size:14px; font-weight:700; cursor:pointer; font-family:Nunito,sans-serif; transition:all 0.15s; }
                .cancel-btn:hover { background: #e2e8f0; }
            `}</style>

            {/* ── Page Title ── */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>My Profile</h1>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>
                    Manage your personal information and security settings
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" }}>

                {/* ── LEFT: Profile Card ── */}
                <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>

                    {/* Cover */}
                    <div style={{
                        height: 90,
                        background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)"
                    }} />

                    {/* Avatar */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 24px 24px", marginTop: -44 }}>
                        <div style={{ position: "relative" }}>
                            <div style={{
                                width: 88, height: 88, borderRadius: "50%",
                                border: "4px solid #fff",
                                background: avatarSrc ? "transparent" : "linear-gradient(135deg, #2563eb, #7c3aed)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
                            }}>
                                {avatarSrc
                                    ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <span style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>
                                        {(staff?.name || "S")[0].toUpperCase()}
                                      </span>
                                }
                            </div>
                            {editing && (
                                <label style={{
                                    position: "absolute", bottom: 2, right: 2,
                                    width: 26, height: 26, borderRadius: "50%",
                                    background: "#2563eb", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    border: "2px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                                }}>
                                    <FaCamera size={11} color="#fff" />
                                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                                </label>
                            )}
                        </div>

                        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "12px 0 4px", textAlign: "center" }}>
                            {staff?.name}
                        </h2>
                        {staff?.specialization && (
                            <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, margin: "0 0 10px", textAlign: "center" }}>
                                {staff.specialization}
                            </p>
                        )}

                        {/* Role badge */}
                        <span style={{
                            background: roleColor.bg, color: roleColor.color,
                            padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 10
                        }}>
                            {staff?.role}
                        </span>

                        {/* Status */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: statusColor.bg, color: statusColor.color,
                            padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700
                        }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor.dot }} />
                            {staff?.status}
                        </div>

                        {/* Info rows */}
                        <div style={{ width: "100%", marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                            {[
                                { icon: <FaEnvelope size={12} color="#2563eb" />, value: staff?.email || "—" },
                                { icon: <FaPhone size={12} color="#059669" />,    value: staff?.phone || "—" },
                                { icon: <FaHospital size={12} color="#7c3aed" />, value: staff?.hospital_id?.hospital_name || "—" },
                                { icon: <FaMapMarkerAlt size={12} color="#d97706" />, value: staff?.hospital_id?.hospital_address || "—" },
                            ].map(({ icon, value }, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        {icon}
                                    </div>
                                    <p style={{ fontSize: 12, color: "#475569", margin: 0, fontWeight: 500, lineHeight: 1.5, paddingTop: 4, wordBreak: "break-word" }}>
                                        {value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Tabs ── */}
                <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>

                    {/* Tab Header */}
                    <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "0 24px" }}>
                        {[
                            { key: "profile",  label: "Profile Information", icon: <FaUserMd size={12} /> },
                            { key: "password", label: "Change Password",      icon: <FaLock size={12} /> },
                        ].map(t => (
                            <button key={t.key} className="tab-btn"
                                onClick={() => setActiveTab(t.key)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 7,
                                    padding: "16px 4px", marginRight: 28,
                                    fontSize: 13, fontWeight: 700,
                                    color: activeTab === t.key ? "#2563eb" : "#94a3b8",
                                    borderBottom: activeTab === t.key ? "2px solid #2563eb" : "2px solid transparent",
                                    marginBottom: -1
                                }}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: 28 }}>

                        {/* ── Profile Tab ── */}
                        {activeTab === "profile" && (
                            <>
                                {/* Header row */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                                    <div>
                                        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>Personal Information</h3>
                                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>Update your name and phone number</p>
                                    </div>
                                    {!editing ? (
                                        <button onClick={() => setEditing(true)} style={{
                                            display: "flex", alignItems: "center", gap: 7,
                                            background: "#eff6ff", color: "#2563eb",
                                            border: "1px solid #bfdbfe", borderRadius: 10,
                                            padding: "9px 18px", fontSize: 13, fontWeight: 700,
                                            cursor: "pointer", fontFamily: "Nunito, sans-serif"
                                        }}>
                                            <FaEdit size={12} /> Edit Profile
                                        </button>
                                    ) : (
                                        <div style={{ display: "flex", gap: 10 }}>
                                            <button className="cancel-btn" onClick={cancelEdit}>
                                                <FaTimes size={11} style={{ marginRight: 6 }} /> Cancel
                                            </button>
                                            <button className="save-btn" onClick={handleSave} disabled={saving}>
                                                {saving ? "Saving…" : <><FaSave size={11} style={{ marginRight: 6 }} /> Save Changes</>}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Form Grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                                    {/* Name */}
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                                            Full Name
                                        </label>
                                        <input className="inp" value={form.name} disabled={!editing}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                                            Phone Number
                                        </label>
                                        <input className="inp" value={form.phone} disabled={!editing}
                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                            placeholder="Your phone number"
                                        />
                                    </div>

                                    {/* Email (read-only) */}
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                                            Email Address
                                        </label>
                                        <input className="inp" value={staff?.email || ""} disabled placeholder="Email" />
                                    </div>

                                    {/* Role (read-only) */}
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                                            Role
                                        </label>
                                        <input className="inp" value={staff?.role || ""} disabled />
                                    </div>

                                    {/* Specialization (read-only) */}
                                    {staff?.specialization && (
                                        <div>
                                            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                                                Specialization
                                            </label>
                                            <input className="inp" value={staff.specialization} disabled />
                                        </div>
                                    )}

                                    {/* Consultation Fee (read-only) */}
                                    {staff?.consultation_fee != null && (
                                        <div>
                                            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                                                Consultation Fee
                                            </label>
                                            <input className="inp" value={`₹ ${staff.consultation_fee}`} disabled />
                                        </div>
                                    )}
                                </div>

                                {/* Hospital Info */}
                                {staff?.hospital_id && (
                                    <div style={{ marginTop: 24, background: "#f8fafc", borderRadius: 14, border: "1px solid #f1f5f9", padding: "18px 20px" }}>
                                        <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>
                                            Hospital Details
                                        </p>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                                            {[
                                                { label: "Hospital Name",    value: staff.hospital_id.hospital_name    || "—" },
                                                { label: "Address",          value: staff.hospital_id.hospital_address || "—" },
                                                { label: "Phone",            value: staff.hospital_id.hospital_phone   || "—" },
                                            ].map(({ label, value }) => (
                                                <div key={label}>
                                                    <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, margin: "0 0 2px" }}>{label}</p>
                                                    <p style={{ fontSize: 13, color: "#0f172a", fontWeight: 700, margin: 0 }}>{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── Password Tab ── */}
                        {activeTab === "password" && (
                            <>
                                <div style={{ marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>Change Password</h3>
                                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                        Use a strong password of at least 6 characters
                                    </p>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 460 }}>
                                    {[
                                        { key: "currentPassword",  label: "Current Password",  show: "current" },
                                        { key: "newPassword",      label: "New Password",       show: "new" },
                                        { key: "confirmPassword",  label: "Confirm New Password", show: "confirm" },
                                    ].map(({ key, label, show }) => (
                                        <div key={key}>
                                            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                                                {label}
                                            </label>
                                            <div style={{ position: "relative" }}>
                                                <input
                                                    className="inp"
                                                    type={showPw[show] ? "text" : "password"}
                                                    value={pwForm[key]}
                                                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                                                    placeholder={`Enter ${label.toLowerCase()}`}
                                                    style={{ paddingRight: 44 }}
                                                />
                                                <button
                                                    onClick={() => setShowPw(s => ({ ...s, [show]: !s[show] }))}
                                                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}
                                                >
                                                    {showPw[show] ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button className="save-btn" onClick={handlePasswordChange} disabled={pwSaving}
                                        style={{ marginTop: 4, alignSelf: "flex-start" }}>
                                        {pwSaving ? "Updating…" : <><FaCheckCircle size={12} style={{ marginRight: 7 }} /> Update Password</>}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffProfile;