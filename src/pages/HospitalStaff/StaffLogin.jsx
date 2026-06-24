import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
    FaUserMd, FaUserNurse, FaConciergeBell, FaUsers,
    FaHeartbeat, FaArrowRight, FaArrowLeft,
    FaEye, FaEyeSlash, FaCheckCircle, FaLock, FaKey
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const roles = [
    { key: "DOCTOR",       label: "Doctor",        icon: <FaUserMd size={26} />,       desc: "Physicians & Specialists",   gradient: "from-blue-600 to-blue-800",   bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700"   },
    { key: "NURSE",        label: "Nurse",          icon: <FaUserNurse size={26} />,    desc: "Nursing Staff",              gradient: "from-emerald-500 to-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200",text: "text-emerald-700"},
    { key: "RECEPTIONIST", label: "Receptionist",   icon: <FaConciergeBell size={26} />,desc: "Front Desk Staff",           gradient: "from-violet-600 to-violet-800",bg: "bg-violet-50",  border: "border-violet-200", text: "text-violet-700" },
    { key: "EMPLOYEE",     label: "Employee",       icon: <FaUsers size={26} />,        desc: "General Hospital Staff",     gradient: "from-amber-500 to-orange-600", bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700"  },
    { key: "STAFF",        label: "Support Staff",  icon: <FaUsers size={26} />,        desc: "Lab, Admin & Others",        gradient: "from-rose-500 to-rose-700",    bg: "bg-rose-50",    border: "border-rose-200",   text: "text-rose-700"   },
    { key: "OTHER",        label: "Other",          icon: <FaHeartbeat size={26} />,    desc: "Other Hospital Roles",       gradient: "from-slate-600 to-slate-800",  bg: "bg-slate-50",   border: "border-slate-200",  text: "text-slate-700"  },
];

// steps: 1 = pick role, 2 = login form, 3 = set password (first time)
const StaffLogin = () => {
    const [step, setStep]               = useState(1);
    const [selectedRole, setSelectedRole] = useState(null);
    const [email, setEmail]             = useState("");
    const [password, setPassword]       = useState("");
    const [showPass, setShowPass]       = useState(false);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState("");

    // Step 3 — set password
    const [pendingStaffId, setPendingStaffId] = useState(null);
    const [newPassword, setNewPassword]       = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew]               = useState(false);
    const [showConfirm, setShowConfirm]       = useState(false);
    const [setPwLoading, setSetPwLoading]     = useState(false);

    const navigate = useNavigate();

    const activeRole = roles.find(r => r.key === selectedRole?.key);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setError("");
        setStep(2);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        if (!email || !password) return setError("Please enter your email and password.");
        setLoading(true);
        try {
            const res = await axios.post("https://carexa-backend.vercel.app/staffapi/staff-login", { email, password });
            const data = res.data;

            // ── First time — no password set yet ──
            if (data.requiresPasswordSetup) {
                setPendingStaffId(data.staffId);
                setStep(3);
                setLoading(false);
                return;
            }

            // ── Role mismatch ──
            if (data.staff.role !== selectedRole.key) {
                setError(`This account is registered as ${data.staff.role}, not ${selectedRole.label}. Please select the correct role.`);
                setLoading(false);
                return;
            }

            saveAndRedirect(data.token, data.staff);
        } catch (err) {
            setError(err?.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSetPassword = async (e) => {
        e.preventDefault();
        setError("");
        if (newPassword !== confirmPassword) return setError("Passwords do not match.");
        if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
        setSetPwLoading(true);
        try {
            const res = await axios.post("https://carexa-backend.vercel.app/staffapi/set-password", {
                staffId: pendingStaffId,
                newPassword,
                confirmPassword
            });

            const { token, staff } = res.data;

            // Role check after setting password
            if (staff.role !== selectedRole.key) {
                setError(`This account is registered as ${staff.role}, not ${selectedRole.label}.`);
                setSetPwLoading(false);
                return;
            }

            Swal.fire({
                icon: "success",
                title: "Password Created!",
                text: "You're now logged in.",
                timer: 1500,
                showConfirmButton: false
            }).then(() => saveAndRedirect(token, staff));
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to set password.");
        } finally {
            setSetPwLoading(false);
        }
    };

    const saveAndRedirect = (token, staff) => {
        localStorage.setItem("StaffToken", token);
        localStorage.setItem("StaffName",  staff.name);
        localStorage.setItem("StaffRole",  staff.role);
        localStorage.setItem("StaffId",    staff._id);
        Swal.fire({
            icon: "success",
            title: `Welcome, ${staff.name}!`,
            html: `<p>Logged in as <b>${staff.role}</b></p><p style="color:#666;font-size:13px;margin-top:4px">${staff.hospital?.hospital_name || ""}</p>`,
            timer: 1800, showConfirmButton: false
        }).then(() => navigate("/staff-dashboard"));
    };

    const goBack = () => {
        setStep(s => s - 1);
        setError("");
        if (step === 2) { setEmail(""); setPassword(""); }
        if (step === 3) { setNewPassword(""); setConfirmPassword(""); }
    };

    const getTitle = () => {
        if (step === 1) return "Staff Portal";
        if (step === 2) return `${selectedRole?.label} Login`;
        return "Create Your Password";
    };
    const getSubtitle = () => {
        if (step === 1) return "Select your role to continue";
        if (step === 2) return "Enter your credentials";
        return "Set a password for your account";
    };

    const pwStrength = (pw) => {
        if (!pw) return null;
        if (pw.length < 6) return { label: "Too short", color: "bg-red-500", w: "w-1/4" };
        if (pw.length < 8)  return { label: "Weak",      color: "bg-orange-400", w: "w-2/4" };
        if (pw.length < 12) return { label: "Good",      color: "bg-yellow-400", w: "w-3/4" };
        return { label: "Strong", color: "bg-emerald-500", w: "w-full" };
    };
    const strength = pwStrength(newPassword);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');
                * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .display { font-family: 'Playfair Display', serif; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
                .anim { animation: fadeUp 0.35s ease forwards; }
                @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
                .fade { animation: fadeIn 0.25s ease forwards; }
                .role-card { transition: all 0.18s ease; cursor: pointer; border: 2px solid transparent; }
                .role-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.18); }
                .glass-input { background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.13); border-radius: 12px; padding: 13px 16px 13px 46px; font-size: 14px; color: #fff; width: 100%; outline: none; transition: border-color 0.2s, background 0.2s; }
                .glass-input::placeholder { color: rgba(255,255,255,0.35); }
                .glass-input:focus { border-color: rgba(99,179,237,0.6); background: rgba(255,255,255,0.09); }
            `}</style>

            {/* bg blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-10"
                style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none opacity-10"
                style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />

            <div className="w-full max-w-2xl anim">
                {/* Brand */}
                <div className="text-center mb-7">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg text-base">🏥</div>
                        <span className="display text-white text-xl font-bold">Carexa</span>
                    </div>
                    <h1 className="display text-3xl text-white font-bold mb-1">{getTitle()}</h1>
                    <p className="text-slate-400 text-sm">{getSubtitle()}</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[1,2,3].map(s => (
                        <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? "w-8 bg-blue-400" : s < step ? "w-4 bg-blue-600" : "w-4 bg-white/15"}`} />
                    ))}
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

                    {/* ── STEP 1: ROLE ── */}
                    {step === 1 && (
                        <div className="p-6 fade">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {roles.map(role => (
                                    <div key={role.key}
                                        className={`role-card ${role.bg} ${role.border} rounded-2xl p-4 flex flex-col items-center text-center gap-2.5`}
                                        onClick={() => handleRoleSelect(role)}>
                                        <div className={`w-12 h-12 bg-gradient-to-br ${role.gradient} rounded-xl flex items-center justify-center text-white shadow-md`}>
                                            {role.icon}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${role.text}`}>{role.label}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{role.desc}</p>
                                        </div>
                                        <span className={`flex items-center gap-1 text-xs font-semibold ${role.text}`}>
                                            Continue <FaArrowRight size={9} />
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
                                <Link to="/" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition">
                                    <FaArrowLeft size={11} /> Back to Home
                                </Link>
                                <p className="text-slate-500 text-xs">
                                    Hospital Admin?{" "}
                                    <Link to="/hospital-dashboard/hospitallogin" className="text-blue-400 hover:text-blue-300 font-medium">Login here</Link>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: LOGIN FORM ── */}
                    {step === 2 && activeRole && (
                        <div className="p-8 fade">
                            {/* Role badge */}
                            <div className="flex items-center gap-3 mb-6 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                                <div className={`w-10 h-10 bg-gradient-to-br ${activeRole.gradient} rounded-xl flex items-center justify-center text-white shadow-md shrink-0`}>
                                    {activeRole.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold text-sm">{activeRole.label}</p>
                                    <p className="text-slate-400 text-xs truncate">{activeRole.desc}</p>
                                </div>
                                <button onClick={goBack} className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition shrink-0">
                                    Change <FaArrowLeft size={9} />
                                </button>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                                    <div className="relative">
                                        <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={17} />
                                        <input type="email" placeholder="your.email@hospital.com"
                                            value={email} onChange={e => setEmail(e.target.value)}
                                            className="glass-input" required />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                                        <input type={showPass ? "text" : "password"} placeholder="Enter your password"
                                            value={password} onChange={e => setPassword(e.target.value)}
                                            className="glass-input pr-12" required />
                                        <button type="button" onClick={() => setShowPass(v => !v)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                                            {showPass ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>
                                )}

                                <button type="submit" disabled={loading}
                                    className={`w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 bg-gradient-to-r ${activeRole.gradient} hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg mt-1`}>
                                    {loading
                                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
                                        : <><FaCheckCircle size={14} /> Sign In as {activeRole.label}</>
                                    }
                                </button>
                            </form>

                            <p className="text-slate-500 text-xs text-center mt-5">
                                First time? Enter your email — we'll help you create a password.
                            </p>
                        </div>
                    )}

                    {/* ── STEP 3: SET PASSWORD ── */}
                    {step === 3 && activeRole && (
                        <div className="p-8 fade">
                            <div className="flex items-center gap-3 mb-6 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-400/20">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                                    <FaKey size={18} />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">Create Your Password</p>
                                    <p className="text-blue-300 text-xs">Your account was found. Set a password to proceed.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSetPassword} className="space-y-4">
                                {/* New Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                                        <input type={showNew ? "text" : "password"} placeholder="Min 6 characters"
                                            value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                            className="glass-input pr-12" required />
                                        <button type="button" onClick={() => setShowNew(v => !v)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                                            {showNew ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                                        </button>
                                    </div>
                                    {/* Strength bar */}
                                    {newPassword && strength && (
                                        <div className="mt-2">
                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.w}`} />
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">{strength.label}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                                        <input type={showConfirm ? "text" : "password"} placeholder="Re-enter password"
                                            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                            className="glass-input pr-12" required />
                                        <button type="button" onClick={() => setShowConfirm(v => !v)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                                            {showConfirm ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                                        </button>
                                    </div>
                                    {confirmPassword && newPassword && (
                                        <p className={`text-xs mt-1.5 ${confirmPassword === newPassword ? "text-emerald-400" : "text-red-400"}`}>
                                            {confirmPassword === newPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                                        </p>
                                    )}
                                </div>

                                {error && (
                                    <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>
                                )}

                                <button type="submit" disabled={setPwLoading || newPassword !== confirmPassword || newPassword.length < 6}
                                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg mt-1">
                                    {setPwLoading
                                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
                                        : <><FaCheckCircle size={14} /> Create Password & Sign In</>
                                    }
                                </button>

                                <button type="button" onClick={goBack}
                                    className="w-full py-2.5 text-slate-400 hover:text-white text-sm flex items-center justify-center gap-1.5 transition">
                                    <FaArrowLeft size={11} /> Back to Login
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffLogin;