import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FaHospital, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const BASE = "http://localhost:5000/hospitalapi";

const HospitalResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState("loading");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errMsg, setErrMsg] = useState("");

    useEffect(() => {
        if (!token) { setStatus("invalid"); return; }
        axios.get(`${BASE}/verify-reset-token/${token}`)
            .then(res => {
                if (res.data.valid) { setName(res.data.hospital_name || ""); setStatus("valid"); }
                else { setErrMsg(res.data.message || "Invalid link"); setStatus("invalid"); }
            })
            .catch(err => {
                setErrMsg(err?.response?.data?.message || "Invalid or expired link");
                setStatus("invalid");
            });
    }, [token]);

    const handleReset = async (e) => {
        e.preventDefault();
        if (password.length < 6) return Swal.fire("Too short", "Password must be at least 6 characters", "warning");
        if (password !== confirm) return Swal.fire("Mismatch", "Passwords do not match", "warning");

        setSaving(true);
        try {
            await axios.post(`${BASE}/reset-password/${token}`, { new_password: password, confirm_password: confirm });
            setStatus("done");
            Swal.fire({ icon: "success", title: "Password Reset!", timer: 2500, showConfirmButton: false });
            setTimeout(() => navigate("/hospitallogin"), 2600);
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed to reset password", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-4">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
                .rp-page { font-family: 'DM Sans', sans-serif; }
                .brand-font { font-family: 'Playfair Display', serif; }
                .field-wrap { transition: all 0.2s; }
                .field-wrap:focus-within { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,0.15); }
                .rp-btn { background: linear-gradient(135deg, #2563eb, #4f46e5); transition: all 0.2s; }
                .rp-btn:hover:not(:disabled) { transform: translateY(-1px); }
                .rp-btn:disabled { opacity: 0.6; }
                .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation: spin 0.7s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="rp-page relative w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>

                    <div className="p-8">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                                <FaHospital className="text-white" size={26} />
                            </div>
                        </div>

                        {/* LOADING */}
                        {status === "loading" && (
                            <div className="flex flex-col items-center gap-4 py-8">
                                <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                                <p className="text-slate-400 text-sm">Validating your reset link…</p>
                            </div>
                        )}

                        {/* INVALID */}
                        {status === "invalid" && (
                            <div className="text-center space-y-4">
                                <h2 className="brand-font text-2xl text-white font-bold">Link Invalid</h2>
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                    <div className="text-3xl mb-2">⛔</div>
                                    <p className="text-red-400 text-sm font-semibold mb-1">This link has expired or is invalid</p>
                                    <p className="text-slate-400 text-xs">{errMsg || "Reset links are valid for 15 minutes only."}</p>
                                </div>
                                <Link to="/hospital-forgot-password"
                                    className="rp-btn w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold" style={{ textDecoration: "none" }}>
                                    🔗 Request a New Link
                                </Link>
                            </div>
                        )}

                        {/* DONE */}
                        {status === "done" && (
                            <div className="text-center space-y-4">
                                <h2 className="brand-font text-2xl text-white font-bold">Password Updated!</h2>
                                <div className="text-5xl">🎉</div>
                                <p className="text-slate-400 text-sm">Your password has been reset. Redirecting to login…</p>
                                <Link to="/hospitallogin"
                                    className="rp-btn w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold" style={{ textDecoration: "none" }}>
                                    → Sign In Now
                                </Link>
                            </div>
                        )}

                        {/* VALID FORM */}
                        {status === "valid" && (
                            <>
                                <h2 className="brand-font text-2xl text-white font-bold text-center mb-1">Set New Password</h2>
                                <p className="text-slate-400 text-sm text-center mb-6">
                                    {name ? `Hi ${name}! ` : ""}Create a strong new password for your hospital account.
                                </p>

                                <form onSubmit={handleReset} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                                        <div className="field-wrap flex items-center border border-white/10 rounded-xl px-4 py-3 bg-white/5">
                                            <FaLock className="text-slate-400 shrink-0" size={14} />
                                            <input
                                                type={showPass ? "text" : "password"}
                                                placeholder="Enter new password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full outline-none ml-3 bg-transparent text-white text-sm placeholder-slate-500"
                                                required
                                            />
                                            <button type="button" onClick={() => setShowPass(p => !p)} className="text-slate-400 hover:text-white ml-2">
                                                {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
                                        <div className="field-wrap flex items-center border border-white/10 rounded-xl px-4 py-3 bg-white/5">
                                            <FaLock className="text-slate-400 shrink-0" size={14} />
                                            <input
                                                type={showConf ? "text" : "password"}
                                                placeholder="Re-enter new password"
                                                value={confirm}
                                                onChange={e => setConfirm(e.target.value)}
                                                className="w-full outline-none ml-3 bg-transparent text-white text-sm placeholder-slate-500"
                                                required
                                            />
                                            <button type="button" onClick={() => setShowConf(p => !p)} className="text-slate-400 hover:text-white ml-2">
                                                {showConf ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                            </button>
                                        </div>
                                        {confirm && (
                                            <p className={`text-xs mt-1 font-semibold ${confirm === password ? "text-green-400" : "text-red-400"}`}>
                                                {confirm === password ? "✓ Passwords match" : "✗ Passwords do not match"}
                                            </p>
                                        )}
                                    </div>

                                    <button type="submit" disabled={saving || !password || !confirm || password !== confirm}
                                        className="rp-btn w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold mt-2">
                                        {saving ? <><div className="spinner" /> Resetting…</> : "🔐 Reset Password"}
                                    </button>
                                </form>
                            </>
                        )}

                        <p className="text-center text-slate-500 text-xs mt-6">
                            <Link to="/hospitallogin" className="text-blue-400 hover:text-blue-300 transition font-medium">
                                ← Back to Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalResetPassword;