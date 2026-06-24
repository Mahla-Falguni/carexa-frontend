import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    FaHospital, FaEdit, FaSave, FaTimes, FaLock,
    FaCamera, FaPhone, FaEnvelope, FaMapMarkerAlt,
    FaShieldAlt, FaCheckCircle, FaUserMd
} from "react-icons/fa";

const HospitalAccount = () => {

    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        hospital_name: "",
        hospital_email: "",
        hospital_phone: "",
        hospital_address: "",
    });

    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: ""
    });

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const token = localStorage.getItem("HospitalToken");

    const fetchProfile = async () => {
        try {
            const res = await axios.get(
                "https://carexa-backend.vercel.app/hospitalapi/get-hospital-profile",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const h = res.data.hospital;
            setHospital(h);
            setFormData({
                hospital_name: h.hospital_name || "",
                hospital_email: h.hospital_email || "",
                hospital_phone: h.hospital_phone || "",
                hospital_address: h.hospital_address || "",
            });
            setImagePreview(h.hospital_img
                ? `https://carexa-backend.vercel.app/uploads/${h.hospital_img}`
                : null);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            const data = new FormData();
            data.append("hospital_name", formData.hospital_name);
            data.append("hospital_email", formData.hospital_email);
            data.append("hospital_phone", formData.hospital_phone);
            data.append("hospital_address", formData.hospital_address);
            if (imageFile) data.append("hospital_img", imageFile);

            await axios.put(
                "https://carexa-backend.vercel.app/hospitalapi/update-hospital-profile",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            localStorage.setItem("HospitalName", formData.hospital_name);

            Swal.fire({
                icon: "success",
                title: "Profile Updated!",
                text: "Your hospital profile has been saved.",
                timer: 1800,
                showConfirmButton: false
            });

            setEditMode(false);
            setImageFile(null);
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
            await axios.put(
                "https://carexa-backend.vercel.app/hospitalapi/change-hospital-password",
                { old_password: passwordData.old_password, new_password: passwordData.new_password },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire({
                icon: "success",
                title: "Password Changed!",
                text: "Your password has been updated successfully.",
                timer: 1800,
                showConfirmButton: false
            });

            setShowPasswordModal(false);
            setPasswordData({ old_password: "", new_password: "", confirm_password: "" });

        } catch (error) {
            Swal.fire("Error", error?.response?.data?.message || "Failed to change password", "error");
        }
    };

    const getInitials = (name) => {
        if (!name) return "H";
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
                .page-title { font-family: 'Playfair Display', serif; }
                .card-hover { transition: all 0.2s ease; }
                .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
                .field-row { transition: background 0.15s; }
                .field-row:hover { background: #f8faff; }
                .avatar-ring { background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 3px; border-radius: 9999px; }
                .banner-bg { background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #312e81 100%); }
                .input-focus:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); outline: none; }
                .btn-primary { background: linear-gradient(135deg, #2563eb, #4f46e5); transition: all 0.2s; }
                .btn-primary:hover { background: linear-gradient(135deg, #1d4ed8, #4338ca); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,0.35); }
                .btn-danger { background: linear-gradient(135deg, #dc2626, #b91c1c); transition: all 0.2s; }
                .btn-danger:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(220,38,38,0.3); }
                .modal-overlay { backdrop-filter: blur(6px); background: rgba(15,23,42,0.6); }
                .strength-bar { height: 4px; border-radius: 2px; transition: width 0.3s, background 0.3s; }
            `}</style>

            <div className="account-page max-w-4xl mx-auto">

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="page-title text-3xl text-slate-800 mb-1">Account Settings</h1>
                    <p className="text-slate-500 text-sm">Manage your hospital profile and security settings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT — Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden card-hover">

                            {/* Banner */}
                            <div className="banner-bg h-24 relative">
                                <div className="absolute inset-0 opacity-10"
                                    style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }}>
                                </div>
                            </div>

                            {/* Avatar */}
                            <div className="flex flex-col items-center -mt-14 pb-6 px-6">
                                <div className="relative">
                                    <div className="avatar-ring">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Hospital"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-white"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                <span className="text-white text-2xl font-bold">
                                                    {getInitials(hospital?.hospital_name)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {editMode && (
                                        <label className="absolute bottom-1 right-1 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg border-2 border-white">
                                            <FaCamera size={11} />
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    )}
                                </div>

                                <h2 className="text-lg font-bold text-slate-800 mt-4 text-center leading-tight">
                                    {hospital?.hospital_name}
                                </h2>
                                <p className="text-slate-400 text-xs mt-1">{hospital?.hospital_email}</p>

                                {/* Status Badge */}
                                <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                                    <FaCheckCircle size={10} /> Active Account
                                </span>

                                {/* Quick Info */}
                                <div className="w-full mt-5 space-y-2">
                                    {hospital?.hospital_phone && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <FaPhone size={11} className="text-blue-400" />
                                            <span>{hospital.hospital_phone}</span>
                                        </div>
                                    )}
                                    {hospital?.hospital_address && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <FaMapMarkerAlt size={11} className="text-blue-400" />
                                            <span className="truncate">{hospital.hospital_address}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
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
                                            onClick={() => { setEditMode(false); setImageFile(null); fetchProfile(); }}
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
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 card-hover">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <FaHospital className="text-blue-600" size={15} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 text-sm">Hospital Information</h3>
                                    <p className="text-slate-400 text-xs">Your registered hospital details</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {[
                                    { label: "Hospital Name", name: "hospital_name", type: "text", icon: <FaHospital size={13} className="text-slate-400" /> },
                                    { label: "Email Address", name: "hospital_email", type: "email", icon: <FaEnvelope size={13} className="text-slate-400" /> },
                                    { label: "Phone Number", name: "hospital_phone", type: "text", icon: <FaPhone size={13} className="text-slate-400" /> },
                                    { label: "Address", name: "hospital_address", type: "text", icon: <FaMapMarkerAlt size={13} className="text-slate-400" /> },
                                ].map(({ label, name, type, icon }) => (
                                    <div key={name} className="field-row rounded-xl p-1">
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
                                                    {hospital?.[name] || <span className="text-slate-300 italic">Not provided</span>}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 card-hover">
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
                                        <p className="text-xs text-slate-400">Last changed recently</p>
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

                        {/* Modal Header */}
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
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-white/60 hover:text-white transition"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {[
                                { label: "Current Password", key: "old_password", show: showOld, toggle: () => setShowOld(!showOld) },
                                { label: "New Password", key: "new_password", show: showNew, toggle: () => setShowNew(!showNew) },
                                { label: "Confirm New Password", key: "confirm_password", show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
                            ].map(({ label, key, show, toggle }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                        {label}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={show ? "text" : "password"}
                                            placeholder={`Enter ${label.toLowerCase()}`}
                                            value={passwordData[key]}
                                            onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                                            className="input-focus w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-700 bg-slate-50 transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={toggle}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                                        >
                                            {show ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Password strength indicator */}
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

                        {/* Modal Footer */}
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={handleChangePassword}
                                className="btn-primary flex-1 text-white py-2.5 rounded-xl text-sm font-semibold"
                            >
                                Update Password
                            </button>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 py-2.5 rounded-xl text-sm font-semibold transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HospitalAccount;