import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FaHospital, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const HospitalLogin = () => {

    const [hospital_email, setHospitalEmail] = useState("");
    const [hospital_pass, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                "https://carexa-backend.vercel.app/hospitalapi/loginHospital",
                { hospital_email, hospital_pass }
            );

            if (response.data.token) {
                localStorage.setItem("HospitalToken", response.data.token);
                localStorage.setItem("HospitalName", response.data.hospital?.hospital_name || "Hospital");

                Swal.fire({
                    icon: "success",
                    title: "Login Successful",
                    text: "Welcome Hospital Admin",
                    timer: 1800,
                    showConfirmButton: false
                });

                navigate("/hospital-dashboard");
            }

        } catch (error) {
            const message = error?.response?.data?.message || "Login failed";
            Swal.fire({ icon: "error", title: "Login Failed", text: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-4 relative overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
                .login-page  { font-family: 'DM Sans', sans-serif; }
                .brand-font  { font-family: 'Playfair Display', serif; }
                .field-wrap  { transition: all 0.2s; }
                .field-wrap:focus-within { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,0.15); }
                .login-btn   { background: linear-gradient(135deg, #2563eb, #4f46e5); transition: all 0.2s; }
                .login-btn:hover { background: linear-gradient(135deg, #1d4ed8, #4338ca); transform: translateY(-1px); box-shadow: 0 8px 25px rgba(79,70,229,0.4); }
                .login-btn:disabled { opacity: 0.6; transform: none; }
                .bg-orb { position: absolute; border-radius: 9999px; filter: blur(80px); opacity: 0.12; pointer-events: none; }
            `}</style>

            {/* Background orbs */}
            <div className="bg-orb w-96 h-96 bg-blue-500 -top-20 -left-20"></div>
            <div className="bg-orb w-80 h-80 bg-indigo-600 -bottom-10 -right-10"></div>

            <div className="login-page relative w-full max-w-md">

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

                    {/* Top accent */}
                    <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>

                    <div className="p-8">

                        {/* Icon + Title */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                                <FaHospital className="text-white" size={26} />
                            </div>
                            <h1 className="brand-font text-2xl text-white font-bold">Hospital Portal</h1>
                            <p className="text-slate-400 text-sm mt-1">Sign in to manage your hospital</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Hospital Email
                                </label>
                                <div className="field-wrap flex items-center border border-white/10 rounded-xl px-4 py-3 bg-white/5">
                                    <FaEnvelope className="text-slate-400 shrink-0" size={14} />
                                    <input
                                        type="email"
                                        placeholder="hospital@email.com"
                                        value={hospital_email}
                                        onChange={e => setHospitalEmail(e.target.value)}
                                        className="w-full outline-none ml-3 bg-transparent text-white text-sm placeholder-slate-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Password
                                </label>
                                <div className="field-wrap flex items-center border border-white/10 rounded-xl px-4 py-3 bg-white/5">
                                    <FaLock className="text-slate-400 shrink-0" size={14} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={hospital_pass}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full outline-none ml-3 bg-transparent text-white text-sm placeholder-slate-500"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="text-slate-400 hover:text-white transition ml-2">
                                        {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot password */}
                            <div className="flex justify-end">
                                <Link to="/hospital-forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition">
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={loading}
                                className="login-btn w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Signing in...
                                    </>
                                ) : "Sign In"}
                            </button>

                        </form>

                        {/* Register link */}
                        <p className="text-center text-slate-500 text-xs mt-6">
                            New hospital?{" "}
                            <Link to="/hospital-request" className="text-blue-400 hover:text-blue-300 transition font-medium">
                                Register your hospital
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

export default HospitalLogin;