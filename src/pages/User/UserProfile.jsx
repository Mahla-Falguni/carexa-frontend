import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { getImageUrl, handleImageError } from "../../utils/imageUtils";
import {
    FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
    FaCalendarAlt, FaVenusMars, FaCamera, FaSave,
    FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaEdit
} from "react-icons/fa";

const UserProfile = () => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const fileRef = useRef();

    const [form, setForm] = useState({
        patient_name: "", patient_email: "", patient_phone: "",
        patient_dob: "", patient_gender: "", patient_address: ""
    });

    const [passForm, setPassForm] = useState({
        current_password: "", new_password: "", confirm_password: ""
    });
    const [showPass, setShowPass] = useState({
        current: false, new: false, confirm: false
    });
    const [passStrength, setPassStrength] = useState(0);

    const token = localStorage.getItem("UserToken");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.get("https://carexa-backend.vercel.app/api/get-profile", { headers });
            const u = res.data.user;
            setUser(u);
            setForm({
                patient_name: u.patient_name || "",
                patient_email: u.patient_email || "",
                patient_phone: u.patient_phone || "",
                patient_dob: u.patient_dob || "",
                patient_gender: u.patient_gender || "",
                patient_address: u.patient_address || ""
            });
        } catch (err) {
            console.log("Profile fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (imageFile) fd.append("patient_img", imageFile);

            const res = await axios.post(
                "https://carexa-backend.vercel.app/api/update-profile", fd,
                { headers: { ...headers, "Content-Type": "multipart/form-data" } }
            );
            setUser(res.data.user);
            setImageFile(null);
            Swal.fire({ icon: "success", title: "Profile Updated!", timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Update failed", "error");
        } finally { setSaving(false); }
    };

    const getStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };

    const handlePasswordChange = async () => {
        if (passForm.new_password !== passForm.confirm_password)
            return Swal.fire("Error", "New passwords do not match", "error");
        if (passForm.new_password.length < 6)
            return Swal.fire("Error", "Password must be at least 6 characters", "error");
        setSaving(true);
        try {
            await axios.post("https://carexa-backend.vercel.app/api/change-password", {
                current_password: passForm.current_password,
                new_password: passForm.new_password
            }, { headers });
            Swal.fire({ icon: "success", title: "Password Changed!", timer: 1500, showConfirmButton: false });
            setPassForm({ current_password: "", new_password: "", confirm_password: "" });
            setPassStrength(0);
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed to change password", "error");
        } finally { setSaving(false); }
    };

    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
    const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const avatarUrl = preview
        ? preview
        : getImageUrl(user?.patient_img, 'user');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 p-4 md:p-8">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .profile-page { font-family: 'DM Sans', sans-serif; }
                .page-title   { font-family: 'Playfair Display', serif; }
                .tab-btn { transition: all 0.2s; }
                .input-field { width: 100%; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 16px 10px 40px; font-size: 14px; color: #334155; background: #f8fafc; outline: none; transition: all 0.2s; }
                .input-field:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,0.15); background: white; }
                .save-btn { background: linear-gradient(135deg,#2563eb,#4f46e5); transition: all 0.2s; }
                .save-btn:hover { background: linear-gradient(135deg,#1d4ed8,#4338ca); box-shadow: 0 6px 20px rgba(79,70,229,0.35); transform: translateY(-1px); }
                .avatar-ring { box-shadow: 0 0 0 4px white, 0 0 0 6px #bfdbfe; }
            `}</style>

            <div className="profile-page max-w-4xl mx-auto">

                {/* ── Profile Hero Card ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    <div className="h-15 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 relative">
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                    </div>

                    <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-4">

                            {/* Avatar */}
                            <div className="relative w-fit">
                                <img src={avatarUrl} alt="avatar"
                                    onError={e => handleImageError(e, 'user')}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white avatar-ring" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-white avatar-ring flex items-center justify-center">
                                        <span className="text-white text-3xl font-bold">
                                            {user?.patient_name?.charAt(0)?.toUpperCase() || "P"}
                                        </span>
                                    </div>
                                )}
                                <button onClick={() => fileRef.current.click()}
                                    className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center border-2 border-white transition shadow-md">
                                    <FaCamera size={12} className="text-white" />
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </div>

                            {/* Name + Email */}
                            <div className="flex-1 sm:ml-4 mt-2 sm:mt-0">
                                <h2 className="page-title text-2xl text-slate-800 font-bold">{user?.patient_name || "—"}</h2>
                                <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
                                    <FaEnvelope size={11} /> {user?.patient_email || "—"}
                                </p>
                            </div>

                            <div className="shrink-0">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${user?.patient_status === "INACTIVE"
                                        ? "bg-red-50 text-red-600 border-red-200"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    }`}>
                                    <FaCheckCircle size={10} />
                                    {user?.patient_status === "INACTIVE" ? "Inactive Account" : "Active Account"}
                                </span>
                            </div>
                        </div>

                        {/* Quick stats */}
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
                            {[
                                { label: "Phone", value: user?.patient_phone || "—", icon: <FaPhone size={12} className="text-blue-500" /> },
                                { label: "Gender", value: user?.patient_gender || "—", icon: <FaVenusMars size={12} className="text-violet-500" /> },
                                { label: "Address", value: user?.patient_address || "—", icon: <FaMapMarkerAlt size={12} className="text-rose-500" /> },
                            ].map(({ label, value, icon }) => (
                                <div key={label} className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">{icon} {label}</div>
                                    <p className="text-sm font-semibold text-slate-700 truncate">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="flex gap-2 mb-6">
                    {[
                        { key: "profile", label: "Edit Profile", icon: <FaEdit size={13} /> },
                        { key: "password", label: "Change Password", icon: <FaLock size={12} /> },
                    ].map(({ key, label, icon }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`tab-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border ${activeTab === key
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                }`}>
                            {icon} {label}
                        </button>
                    ))}
                </div>

                {/* ── EDIT PROFILE TAB ── */}
                {activeTab === "profile" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                        <h3 className="text-base font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <FaUser className="text-blue-500" size={14} /> Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={13} />
                                    <input type="text" value={form.patient_name}
                                        onChange={e => setForm({ ...form, patient_name: e.target.value })}
                                        className="input-field" placeholder="Your full name" />
                                </div>
                            </div>

                            {/* Email (read-only) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={13} />
                                    <input type="email" value={form.patient_email} readOnly
                                        className="input-field opacity-60 cursor-not-allowed" />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                                <div className="relative">
                                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={13} />
                                    <input type="text" value={form.patient_phone}
                                        onChange={e => setForm({ ...form, patient_phone: e.target.value })}
                                        className="input-field" placeholder="+91 98765 43210" />
                                </div>
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date of Birth</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={13} />
                                    <input type="date" value={form.patient_dob}
                                        onChange={e => setForm({ ...form, patient_dob: e.target.value })}
                                        className="input-field" />
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                                <div className="relative">
                                    <FaVenusMars className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={13} />
                                    <select value={form.patient_gender}
                                        onChange={e => setForm({ ...form, patient_gender: e.target.value })}
                                        className="input-field appearance-none">
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Address</label>
                                <div className="relative">
                                    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={13} />
                                    <input type="text" value={form.patient_address}
                                        onChange={e => setForm({ ...form, patient_address: e.target.value })}
                                        className="input-field" placeholder="Your address" />
                                </div>
                            </div>

                        </div>

                        {/* Photo upload area */}
                        <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                <FaCamera className="text-blue-500" size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-700">Profile Photo</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {imageFile ? imageFile.name : "Click the camera icon on your avatar to change photo"}
                                </p>
                            </div>
                            {imageFile && (
                                <button onClick={() => { setImageFile(null); setPreview(null); }}
                                    className="text-xs text-red-500 hover:text-red-600 font-semibold">
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button onClick={handleSave} disabled={saving}
                                className="save-btn flex items-center gap-2 text-white px-8 py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
                                {saving
                                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                                    : <><FaSave size={13} /> Save Changes</>
                                }
                            </button>
                            <button onClick={fetchProfile}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl text-sm font-semibold transition">
                                Reset
                            </button>
                        </div>
                    </div>
                )}

                {/* ── CHANGE PASSWORD TAB ── */}
                {activeTab === "password" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                        <h3 className="text-base font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <FaLock className="text-blue-500" size={14} /> Change Password
                        </h3>

                        <div className="max-w-md space-y-5">

                            {/* Current Password */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={13} />
                                    <input type={showPass.current ? "text" : "password"}
                                        value={passForm.current_password}
                                        onChange={e => setPassForm({ ...passForm, current_password: e.target.value })}
                                        className="input-field" style={{ paddingRight: "40px" }} placeholder="Enter current password" />
                                    <button onClick={() => setShowPass(p => ({ ...p, current: !p.current }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPass.current ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={13} />
                                    <input type={showPass.new ? "text" : "password"}
                                        value={passForm.new_password}
                                        onChange={e => {
                                            setPassForm({ ...passForm, new_password: e.target.value });
                                            setPassStrength(getStrength(e.target.value));
                                        }}
                                        className="input-field" style={{ paddingRight: "40px" }} placeholder="Enter new password" />
                                    <button onClick={() => setShowPass(p => ({ ...p, new: !p.new }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPass.new ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                    </button>
                                </div>
                                {passForm.new_password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= passStrength ? strengthColor[passStrength] : "bg-slate-200"}`} />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-medium ${passStrength <= 1 ? "text-red-500" :
                                                passStrength === 2 ? "text-orange-500" :
                                                    passStrength === 3 ? "text-yellow-600" : "text-emerald-600"
                                            }`}>{strengthLabel[passStrength]}</p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={13} />
                                    <input type={showPass.confirm ? "text" : "password"}
                                        value={passForm.confirm_password}
                                        onChange={e => setPassForm({ ...passForm, confirm_password: e.target.value })}
                                        style={{ paddingRight: "40px" }}
                                        className={`input-field ${passForm.confirm_password && passForm.new_password !== passForm.confirm_password
                                                ? "border-red-300" : passForm.confirm_password && passForm.new_password === passForm.confirm_password
                                                    ? "border-emerald-300" : ""
                                            }`}
                                        placeholder="Re-enter new password" />
                                    <button onClick={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPass.confirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                    </button>
                                </div>
                                {passForm.confirm_password && passForm.new_password !== passForm.confirm_password && (
                                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                )}
                                {passForm.confirm_password && passForm.new_password === passForm.confirm_password && (
                                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                        <FaCheckCircle size={10} /> Passwords match
                                    </p>
                                )}
                            </div>

                            <button onClick={handlePasswordChange} disabled={saving}
                                className="save-btn flex items-center gap-2 text-white px-8 py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
                                {saving
                                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...</>
                                    : <><FaLock size={12} /> Update Password</>
                                }
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default UserProfile;