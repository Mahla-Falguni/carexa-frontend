import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FaHospital, FaEnvelope } from "react-icons/fa";

const BASE = "http://localhost:5000/hospitalapi";

const HospitalForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim())
            return Swal.fire("Missing", "Please enter your hospital email", "warning");

        setLoading(true);
        try {
            const { data } = await axios.post(`${BASE}/forgot-password`, { hospital_email: email });
            setDone({ hospital_name: data.hospital_name });
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed to generate reset link", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-4 relative overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
                .fp-page { font-family: 'DM Sans', sans-serif; }
                .brand-font { font-family: 'Playfair Display', serif; }
                .field-wrap { transition: all 0.2s; }
                .field-wrap:focus-within { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,0.15); }
                .fp-btn { background: linear-gradient(135deg, #2563eb, #4f46e5); transition: all 0.2s; }
                .fp-btn:hover:not(:disabled) { background: linear-gradient(135deg, #1d4ed8, #4338ca); transform: translateY(-1px); }
                .fp-btn:disabled { opacity: 0.6; transform: none; }
                .bg-orb { position: absolute; border-radius: 9999px; filter: blur(80px); opacity: 0.12; pointer-events: none; }
                .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="bg-orb w-96 h-96 bg-blue-500 -top-20 -left-20"></div>
            <div className="bg-orb w-80 h-80 bg-indigo-600 -bottom-10 -right-10"></div>

            <div className="fp-page relative w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>

                    <div className="p-8">
                        {/* Icon + Title */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                                <FaHospital className="text-white" size={26} />
                            </div>
                            <h1 className="brand-font text-2xl text-white font-bold">
                                {!done ? "Forgot Password?" : "Check Your Email"}
                            </h1>
                            <p className="text-slate-400 text-sm mt-1 text-center">
                                {!done
                                    ? "Enter your hospital email to receive a reset link"
                                    : `Hi ${done.hospital_name}! A password reset link has been sent to your email.`}
                            </p>
                        </div>

                        {!done ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                        Hospital Email
                                    </label>
                                    <div className="field-wrap flex items-center border border-white/10 rounded-xl px-4 py-3 bg-white/5">
                                        <FaEnvelope className="text-slate-400 shrink-0" size={14} />
                                        <input
                                            type="email"
                                            placeholder="hospital@email.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full outline-none ml-3 bg-transparent text-white text-sm placeholder-slate-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="fp-btn w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold">
                                    {loading ? <><div className="spinner" /> Sending…</> : "🔗 Send Reset Link"}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                {/* Success box */}
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                                    <div className="text-3xl mb-2">✅</div>
                                    <p className="text-green-400 text-sm font-semibold mb-1">Reset link sent successfully</p>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Please check your inbox and click the reset link to set a new password.
                                        The link expires in <span className="text-white font-semibold">15 minutes</span>.
                                    </p>
                                </div>

                                <p className="text-center text-amber-400 text-xs">
                                    ⚠️ Do not share the link with anyone.
                                </p>

                                <button
                                    onClick={() => { setDone(null); setEmail(""); }}
                                    className="w-full py-3 rounded-xl text-sm font-semibold text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition">
                                    ← Try another email
                                </button>
                            </div>
                        )}

                        <p className="text-center text-slate-500 text-xs mt-6">
                            Remembered it?{" "}
                            <Link to="/hospitallogin" className="text-blue-400 hover:text-blue-300 transition font-medium">
                                Back to Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-xs mt-6">
                    Hospital Management System &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default HospitalForgotPassword;