// ─────────────────────────────────────────────────────────────────────────────
//  AdminForgotPassword.jsx
//  Route: /admin/forgot-password
//  Admin enters email → backend logs reset link to console
//  UI shows: "Reset link sent to your email"
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEnvelope, FaShieldAlt, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import Swal from "sweetalert2";

const BASE = "http://localhost:5000/adminapi";

export const AdminForgotPassword = () => {
    const [email,   setEmail]   = useState("");
    const [loading, setLoading] = useState(false);
    const [sent,    setSent]    = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim())
            return Swal.fire("Missing", "Please enter your admin email address", "warning");

        setLoading(true);
        try {
            await axios.post(`${BASE}/forgot-password`, { admin_email: email });
            setSent(true); // Always show "sent" — regardless of whether email exists
        } catch (err) {
            // Show the error message from the server (e.g. "No admin account found")
            Swal.fire("Error", err?.response?.data?.message || "Failed. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-4 relative overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .afp-page { font-family:'DM Sans',sans-serif; }
                .afp-title { font-family:'Playfair Display',serif; }
                .bg-orb { position:absolute; border-radius:9999px; filter:blur(80px); opacity:0.15; }
                .afp-input { transition:all 0.2s; }
                .afp-input:focus-within { border-color:#60a5fa; box-shadow:0 0 0 3px rgba(96,165,250,0.15); }
                .afp-btn { background:linear-gradient(135deg,#2563eb,#4f46e5); transition:all 0.2s; }
                .afp-btn:hover:not(:disabled) { background:linear-gradient(135deg,#1d4ed8,#4338ca); transform:translateY(-1px); box-shadow:0 8px 25px rgba(79,70,229,0.4); }
                .afp-btn:disabled { opacity:0.6; transform:none; cursor:not-allowed; }
                .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.35); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }
                @keyframes spin { to { transform:rotate(360deg); } }
            `}</style>

            <div className="bg-orb w-96 h-96 bg-blue-500 -top-20 -left-20"/>
            <div className="bg-orb w-80 h-80 bg-indigo-600 -bottom-10 -right-10"/>
            <div className="bg-orb w-64 h-64 bg-cyan-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>

            <div className="afp-page relative w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"/>

                    <div className="p-8">
                        {/* Icon */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                                <FaShieldAlt className="text-white" size={26}/>
                            </div>
                            <h1 className="afp-title text-2xl text-white font-bold">
                                {sent ? "Check Your Email" : "Forgot Password"}
                            </h1>
                            <p className="text-slate-400 text-sm mt-1 text-center">
                                {sent ? "Reset link sent successfully" : "Enter your admin email to reset your password"}
                            </p>
                        </div>

                        {!sent ? (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-5">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                        Admin Email Address
                                    </label>
                                    <div className="afp-input flex items-center border border-white/10 rounded-xl px-4 py-3 bg-white/5">
                                        <FaEnvelope className="text-slate-400 shrink-0" size={14}/>
                                        <input
                                            type="email"
                                            placeholder="admin@email.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full outline-none ml-3 bg-transparent text-white text-sm placeholder-slate-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="afp-btn w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold" disabled={loading}>
                                    {loading
                                        ? <><div className="spinner"/> Sending link…</>
                                        : "Send Reset Link"
                                    }
                                </button>
                            </form>
                        ) : (
                            /* ── Success state ── */
                            <div className="space-y-4">
                                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-5 text-center">
                                    <div className="flex justify-center mb-3">
                                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                            <FaCheckCircle size={22} className="text-emerald-400"/>
                                        </div>
                                    </div>
                                    <p className="text-emerald-300 font-semibold text-sm mb-1">Reset link sent!</p>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
                                        Please check your inbox.
                                    </p>
                                </div>

                                {/* Warning notice */}
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
                                    <FaExclamationTriangle size={13} className="text-amber-400 mt-0.5 shrink-0"/>
                                    <p className="text-amber-300/80 text-xs leading-relaxed">
                                        The link is valid for <strong className="text-amber-300">15 minutes</strong>. If you don't receive it, check your spam folder or try again.
                                    </p>
                                </div>

                                <button
                                    onClick={() => { setSent(false); setEmail(""); }}
                                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-400 border border-white/10 hover:bg-white/5 transition">
                                    ← Try another email
                                </button>
                            </div>
                        )}

                        {/* Back to login */}
                        <div className="mt-6 flex justify-center">
                            <Link to="/adminlogin" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-400 transition">
                                <FaArrowLeft size={11}/> Back to Admin Sign In
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-500 text-xs mt-6">
                    Hospital Management System &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default AdminForgotPassword;