// ─────────────────────────────────────────────────────────────────────────────
//  AdminResetPassword.jsx
//  Route: /admin/reset-password/:token
//  Admin clicks the link from console → validates token → sets new password
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";

const BASE = "http://localhost:5000/adminapi";

const AdminResetPassword = () => {
    const { token }    = useParams();
    const navigate     = useNavigate();

    const [status,   setStatus]   = useState("loading"); // "loading"|"valid"|"invalid"|"done"
    const [name,     setName]     = useState("");
    const [errMsg,   setErrMsg]   = useState("");
    const [password, setPassword] = useState("");
    const [confirm,  setConfirm]  = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [saving,   setSaving]   = useState(false);

    // ── Validate token on mount ───────────────────────────────────────────────
    useEffect(() => {
        if (!token) { setStatus("invalid"); setErrMsg("No reset token found."); return; }

        axios.get(`${BASE}/verify-reset-token/${token}`)
            .then(res => {
                if (res.data.valid) {
                    setName(res.data.admin_name || "Admin");
                    setStatus("valid");
                } else {
                    setErrMsg(res.data.message || "Invalid link");
                    setStatus("invalid");
                }
            })
            .catch(err => {
                setErrMsg(err?.response?.data?.message || "Invalid or expired link");
                setStatus("invalid");
            });
    }, [token]);

    // ── Password strength ─────────────────────────────────────────────────────
    const strength = (() => {
        if (!password) return { score: 0, label: "", color: "rgba(255,255,255,0.1)" };
        let s = 0;
        if (password.length >= 6)  s++;
        if (password.length >= 10) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        const map = [
            { label: "", color: "rgba(255,255,255,0.1)" },
            { label: "Weak",       color: "#ef4444" },
            { label: "Fair",       color: "#f59e0b" },
            { label: "Good",       color: "#3b82f6" },
            { label: "Strong",     color: "#10b981" },
            { label: "Very Strong",color: "#059669" },
        ];
        return { score: s, ...map[s] };
    })();

    const handleReset = async (e) => {
        e.preventDefault();
        if (password.length < 6)
            return Swal.fire("Too short", "Password must be at least 6 characters", "warning");
        if (password !== confirm)
            return Swal.fire("Mismatch", "Passwords do not match", "warning");

        setSaving(true);
        try {
            await axios.post(`${BASE}/reset-password/${token}`, {
                new_password:     password,
                confirm_password: confirm
            });
            setStatus("done");
            Swal.fire({
                icon:  "success",
                title: "Password Updated! 🎉",
                text:  "Your admin password has been reset. Redirecting to login…",
                timer: 2500,
                showConfirmButton: false,
                background: "#1e293b",
                color: "#fff"
            });
            setTimeout(() => navigate("/adminlogin"), 2600);
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed to reset password", "error");
        } finally {
            setSaving(false);
        }
    };

    const match = confirm ? password === confirm : null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-4 relative overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .arp-page  { font-family:'DM Sans',sans-serif; }
                .arp-title { font-family:'Playfair Display',serif; }
                .bg-orb { position:absolute; border-radius:9999px; filter:blur(80px); opacity:0.15; }
                .arp-field { transition:all 0.2s; }
                .arp-field:focus-within { border-color:#60a5fa; box-shadow:0 0 0 3px rgba(96,165,250,0.15); }
                .arp-btn { background:linear-gradient(135deg,#2563eb,#4f46e5); transition:all 0.2s; }
                .arp-btn:hover:not(:disabled) { background:linear-gradient(135deg,#1d4ed8,#4338ca); transform:translateY(-1px); box-shadow:0 8px 25px rgba(79,70,229,0.4); }
                .arp-btn:disabled { opacity:0.6; transform:none; cursor:not-allowed; }
                .spinner-sm { width:16px; height:16px; border:2px solid rgba(255,255,255,0.35); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }
                .spinner-lg { width:36px; height:36px; border:3px solid rgba(96,165,250,0.2); border-top-color:#60a5fa; border-radius:50%; animation:spin 0.8s linear infinite; }
                @keyframes spin { to { transform:rotate(360deg); } }
            `}</style>

            <div className="bg-orb w-96 h-96 bg-blue-500 -top-20 -left-20"/>
            <div className="bg-orb w-80 h-80 bg-indigo-600 -bottom-10 -right-10"/>
            <div className="bg-orb w-64 h-64 bg-cyan-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>

            <div className="arp-page relative w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"/>

                    <div className="p-8">

                        {/* Icon */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                                <FaShieldAlt className="text-white" size={26}/>
                            </div>
                            <h1 className="arp-title text-2xl text-white font-bold">
                                {status === "loading" ? "Verifying Link…"
                                : status === "invalid" ? "Link Invalid"
                                : status === "done"    ? "Password Updated"
                                : "Set New Password"}
                            </h1>
                            <p className="text-slate-400 text-sm mt-1 text-center">
                                {status === "valid" ? `Welcome back, ${name}` : "Admin Portal"}
                            </p>
                        </div>

                        {/* ── LOADING ── */}
                        {status === "loading" && (
                            <div className="flex flex-col items-center gap-4 py-6">
                                <div className="spinner-lg"/>
                                <p className="text-slate-400 text-sm">Validating your reset link…</p>
                            </div>
                        )}

                        {/* ── INVALID ── */}
                        {status === "invalid" && (
                            <div className="space-y-4">
                                <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-5 text-center">
                                    <div className="text-4xl mb-3">⏰</div>
                                    <p className="text-red-300 font-semibold text-sm mb-1">This link is invalid or expired</p>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        {errMsg || "Admin reset links are valid for 15 minutes only."}
                                    </p>
                                </div>
                                <Link to="/admin/forgot-password"
                                    className="arp-btn w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold"
                                    style={{ textDecoration:"none" }}>
                                    Request a New Link
                                </Link>
                                <div className="flex justify-center">
                                    <Link to="/adminlogin" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-400 transition">
                                        <FaArrowLeft size={11}/> Back to Sign In
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* ── DONE ── */}
                        {status === "done" && (
                            <div className="space-y-4 text-center">
                                <div className="text-5xl mb-2">🎉</div>
                                <p className="text-white font-semibold">Password reset successfully!</p>
                                <p className="text-slate-400 text-sm">Redirecting to admin login…</p>
                                <Link to="/adminlogin"
                                    className="arp-btn w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold mt-4"
                                    style={{ textDecoration:"none" }}>
                                    → Sign In Now
                                </Link>
                            </div>
                        )}

                        {/* ── VALID FORM ── */}
                        {status === "valid" && (
                            <form onSubmit={handleReset} className="space-y-4">

                                {/* New password */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                        New Password
                                    </label>
                                    <div className="arp-field flex items-center border border-white/10 rounded-xl px-4 py-3 bg-white/5">
                                        <FaLock className="text-slate-400 shrink-0" size={14}/>
                                        <input
                                            type={showPass ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full outline-none ml-3 bg-transparent text-white text-sm placeholder-slate-500"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPass(p => !p)} className="text-slate-400 hover:text-white transition ml-2">
                                            {showPass ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}
                                        </button>
                                    </div>

                                    {/* Strength bar */}
                                    {password && (
                                        <div className="mt-2">
                                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-300"
                                                    style={{ width:`${(strength.score/5)*100}%`, background: strength.color }}/>
                                            </div>
                                            <p className="text-right text-[11px] font-semibold mt-1" style={{ color: strength.color }}>
                                                {strength.label}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm password */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="arp-field flex items-center border border-white/10 rounded-xl px-4 py-3 bg-white/5">
                                        <FaLock className="text-slate-400 shrink-0" size={14}/>
                                        <input
                                            type={showConf ? "text" : "password"}
                                            placeholder="Re-enter new password"
                                            value={confirm}
                                            onChange={e => setConfirm(e.target.value)}
                                            className="w-full outline-none ml-3 bg-transparent text-white text-sm placeholder-slate-500"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowConf(p => !p)} className="text-slate-400 hover:text-white transition ml-2">
                                            {showConf ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}
                                        </button>
                                    </div>

                                    {/* Match indicator */}
                                    {confirm && (
                                        <p className="text-[11px] font-semibold mt-1.5" style={{ color: match ? "#10b981" : "#ef4444" }}>
                                            {match ? "✓ Passwords match" : "✗ Passwords do not match"}
                                        </p>
                                    )}
                                </div>

                                <button type="submit" className="arp-btn w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold"
                                    disabled={saving || !password || !confirm || password !== confirm}>
                                    {saving
                                        ? <><div className="spinner-sm"/> Resetting…</>
                                        : "Reset Admin Password"
                                    }
                                </button>

                                <div className="flex justify-center pt-1">
                                    <Link to="/adminlogin" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-400 transition">
                                        <FaArrowLeft size={11}/> Back to Sign In
                                    </Link>
                                </div>
                            </form>
                        )}

                    </div>
                </div>

                <p className="text-center text-slate-500 text-xs mt-6">
                    Hospital Management System &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default AdminResetPassword;