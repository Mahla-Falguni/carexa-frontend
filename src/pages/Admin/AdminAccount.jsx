import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    FaUserShield, FaEdit, FaSave, FaTimes,
    FaLock, FaEnvelope, FaUser, FaPhone, FaCheckCircle, FaShieldAlt
} from "react-icons/fa";

const AdminAccount = () => {

    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        admin_name: "",
        admin_email: "",
        admin_phone: ""
    });

    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: ""
    });

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const token = localStorage.getItem("adminToken");

    const fetchProfile = async () => {
        try {
            const res = await axios.get(
                "https://carexa-backend.vercel.app/adminapi/get-admin-profile",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const a = res.data.admin;
            setAdmin(a);
            setFormData({
                admin_name:  a.admin_name  || "",
                admin_email: a.admin_email || "",
                admin_phone: a.admin_phone || ""
            });
        } catch (error) {
            console.log("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            await axios.post(
                "https://carexa-backend.vercel.app/adminapi/update-admin-profile",
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            localStorage.setItem("AdminName", formData.admin_name);

            Swal.fire({ icon: "success", title: "Profile Updated!", timer: 1500, showConfirmButton: false });
            setEditMode(false);
            fetchProfile();

        } catch (error) {
            Swal.fire("Error", error?.response?.data?.message || "Update failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.new_password !== passwordData.confirm_password) {
            return Swal.fire("Error", "New passwords do not match", "error");
        }
        if (passwordData.new_password.length < 6) {
            return Swal.fire("Error", "Password must be at least 6 characters", "error");
        }
        try {
            await axios.post(
                "https://carexa-backend.vercel.app/adminapi/change-admin-password",
                { old_password: passwordData.old_password, new_password: passwordData.new_password },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire({ icon: "success", title: "Password Changed!", timer: 1500, showConfirmButton: false });
            setShowPasswordModal(false);
            setPasswordData({ old_password: "", new_password: "", confirm_password: "" });

        } catch (error) {
            Swal.fire("Error", error?.response?.data?.message || "Failed to change password", "error");
        }
    };

    const getInitials = (name) => {
        if (!name) return "A";
        return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading profile...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .account-page { font-family: 'DM Sans', sans-serif; }
                .page-title   { font-family: 'Playfair Display', serif; }
                .banner-bg    { background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #312e81 100%); }
                .input-focus:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); outline: none; }
                .btn-primary  { background: linear-gradient(135deg, #2563eb, #4f46e5); transition: all 0.2s; }
                .btn-primary:hover { background: linear-gradient(135deg, #1d4ed8, #4338ca); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,0.35); }
                .modal-overlay { backdrop-filter: blur(6px); background: rgba(15,23,42,0.6); }
                .strength-bar { height: 4px; border-radius: 2px; transition: width 0.3s, background 0.3s; }
            `}</style>

            <div className="account-page max-w-4xl mx-auto">

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="page-title text-3xl text-slate-800 mb-1">Account Settings</h1>
                    <p className="text-slate-500 text-sm">Manage your admin profile and security</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT — Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                            

                            <div className="flex flex-col items-center  pb-6 px-6">
                                {/* Avatar with initials */}
                                <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                    <span className="text-white text-2xl font-bold">
                                        {getInitials(admin?.admin_name)}
                                    </span>
                                </div>

                                <h2 className="text-xl font-bold mt-3 text-slate-800 text-center">
                                    {admin?.admin_name}
                                </h2>
                                <p className="text-slate-400 text-sm">{admin?.admin_email}</p>

                                {/* Status Badge */}
                                <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
                                    admin?.Admin_status === "ACTIVE"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-red-50 text-red-600 border-red-200"
                                }`}>
                                    <FaCheckCircle size={10} />
                                    {admin?.Admin_status || "ACTIVE"}
                                </span>

                                {/* Quick info */}
                                <div className="w-full mt-5 space-y-2">
                                    {admin?.admin_phone && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <FaPhone size={11} className="text-blue-400" />
                                            <span>{admin.admin_phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <FaEnvelope size={11} className="text-blue-400" />
                                        <span className="truncate">{admin?.admin_email}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {!editMode ? (
                                    <div className="w-full mt-6 space-y-2">
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="btn-primary w-full flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
                                        >
                                            <FaEdit size={13} /> Edit Profile
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full mt-6 space-y-2">
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={saving}
                                            className="btn-primary w-full flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                                        >
                                            <FaSave size={13} />
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                        <button
                                            onClick={() => { setEditMode(false); fetchProfile(); }}
                                            className="w-full flex items-center justify-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                                        >
                                            <FaTimes size={12} /> Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Profile Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <FaUserShield className="text-blue-600" size={15} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 text-sm">Admin Information</h3>
                                    <p className="text-slate-400 text-xs">Your registered admin details</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {[
                                    { label: "Full Name",     name: "admin_name",  type: "text",  icon: <FaUser size={13} className="text-slate-400" /> },
                                    { label: "Email Address", name: "admin_email", type: "email", icon: <FaEnvelope size={13} className="text-slate-400" /> },
                                    { label: "Phone Number",  name: "admin_phone", type: "text",  icon: <FaPhone size={13} className="text-slate-400" /> },
                                ].map(({ label, name, type, icon }) => (
                                    <div key={name}>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                                            {label}
                                        </label>
                                        {editMode ? (
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
                                                <input
                                                    type={type}
                                                    name={name}
                                                    value={formData[name]}
                                                    onChange={handleChange}
                                                    className="input-focus w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 bg-slate-50 transition"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                {icon}
                                                <span className="text-sm text-slate-700 font-medium">
                                                    {admin?.[name] || <span className="text-slate-300 italic">Not provided</span>}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                                    <FaShieldAlt className="text-amber-500" size={15} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 text-sm">Security</h3>
                                    <p className="text-slate-400 text-xs">Manage your account security</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200">
                                        <FaLock className="text-slate-500" size={12} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">Password</p>
                                        <p className="text-xs text-slate-400">Keep your account secure</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-semibold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
                                >
                                    Update
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Change Password Modal ── */}
            {showPasswordModal && (
                <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

                        <div className="banner-bg px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                    <FaLock className="text-white" size={14} />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-base">Change Password</h2>
                                    <p className="text-blue-200 text-xs">Keep your account secure</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPasswordModal(false)} className="text-white/60 hover:text-white transition">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {[
                                { label: "Current Password",     key: "old_password",     show: showOld,     toggle: () => setShowOld(!showOld) },
                                { label: "New Password",         key: "new_password",     show: showNew,     toggle: () => setShowNew(!showNew) },
                                { label: "Confirm New Password", key: "confirm_password", show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
                            ].map(({ label, key, show, toggle }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
                                    <div className="relative">
                                        <input
                                            type={show ? "text" : "password"}
                                            placeholder={`Enter ${label.toLowerCase()}`}
                                            value={passwordData[key]}
                                            onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                                            className="input-focus w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-16 text-sm text-slate-700 bg-slate-50 transition"
                                        />
                                        <button type="button" onClick={toggle}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium">
                                            {show ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Password strength */}
                            {passwordData.new_password && (
                                <div>
                                    <div className="flex gap-1 mt-1">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className={`flex-1 strength-bar ${
                                                passwordData.new_password.length >= i * 3
                                                    ? i <= 1 ? "bg-red-400" : i <= 2 ? "bg-amber-400" : i <= 3 ? "bg-blue-400" : "bg-emerald-500"
                                                    : "bg-slate-200"
                                            }`} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {passwordData.new_password.length < 4 ? "Too short" : passwordData.new_password.length < 7 ? "Weak" : passwordData.new_password.length < 10 ? "Good" : "Strong"}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={handleChangePassword}
                                className="btn-primary flex-1 text-white py-2.5 rounded-xl text-sm font-semibold">
                                Update Password
                            </button>
                            <button onClick={() => setShowPasswordModal(false)}
                                className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 py-2.5 rounded-xl text-sm font-semibold transition">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAccount;