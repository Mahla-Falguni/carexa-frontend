import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import Swal from "sweetalert2";

const AdminLogin = () => {
    const navigate = useNavigate();
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                "http://localhost:5000/adminapi/admin_login",
                { admin_email: loginData.email, admin_pass: loginData.password }
            );

            if (response.data.token) {
                localStorage.setItem("adminToken", response.data.token);
                localStorage.setItem("AdminName", response.data.admin.admin_name);

                Swal.fire({
                    icon: "success", title: "Login Successful", text: "Welcome Admin",
                    timer: 1800, showConfirmButton: false
                });

                navigate("/admin");
            }
        } catch (error) {
            const message = error?.response?.data?.message || "Login failed";
            Swal.fire({ icon: "error", title: "Login Failed", text: message });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-4 relative overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .login-page { font-family:'DM Sans',sans-serif; }
                .page-title { font-family:'Playfair Display',serif; }
                .field-input { transition:all 0.2s; }
                .field-input:focus-within { border-color:#60a5fa; box-shadow:0 0 0 3px rgba(96,165,250,0.15); }
                .login-btn { background:linear-gradient(135deg,#2563eb,#4f46e5); transition:all 0.2s; }
                .login-btn:hover { background:linear-gradient(135deg,#1d4ed8,#4338ca); transform:translateY(-1px); box-shadow:0 8px 25px rgba(79,70,229,0.4); }
                .login-btn:disabled { opacity:0.6; transform:none; }
                .bg-orb { position:absolute; border-radius:9999px; filter:blur(80px); opacity:0.15; }
            `}</style>

            <div className="bg-orb w-96 h-96 bg-blue-500 -top-20 -left-20"/>
            <div className="bg-orb w-80 h-80 bg-indigo-600 -bottom-10 -right-10"/>
            <div className="bg-orb w-64 h-64 bg-cyan-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>

            <div className="login-page relative w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"/>

                    <div className="p-8">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                                <FaShieldAlt className="text-white" size={26}/>
                            </div>
                            <h1 className="page-title text-2xl text-white font-bold">Admin Portal</h1>
                            <p className="text-slate-400 text-sm mt-1">Sign in to your admin account</p>
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                            <div className="field-input flex items-center border border-white/10 rounded-xl px-4 py-3 bg-white/5">
                                <FaEnvelope className="text-slate-400 shrink-0" size={14}/>
                                <input
                                    type="email" name="email" placeholder="admin@email.com"
                                    onChange={handleChange} onKeyDown={handleKeyDown}
                                    className="w-full outline-none ml-3 bg-transparent text-white text-sm placeholder-slate-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                            <div className="field-input flex items-center border border-white/10 rounded-xl px-4 py-3 bg-white/5">
                                <FaLock className="text-slate-400 shrink-0" size={14}/>
                                <input
                                    type={showPassword ? "text" : "password"} name="password"
                                    placeholder="Enter your password"
                                    onChange={handleChange} onKeyDown={handleKeyDown}
                                    className="w-full outline-none ml-3 bg-transparent text-white text-sm placeholder-slate-500"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-white transition ml-2">
                                    {showPassword ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}
                                </button>
                            </div>
                        </div>

                        {/* Remember + Forgot */}
                        <div className="flex justify-between items-center mb-6">
                            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                                <input type="checkbox" className="accent-blue-500"/>
                                Remember me
                            </label>
                            {/* ✅ Wired to /admin/forgot-password */}
                            <Link to="/admin/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition">
                                Forgot password?
                            </Link>
                        </div>

                        <button onClick={handleLogin} disabled={loading}
                            className="login-btn w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
                            {loading
                                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Signing in…</>
                                : "Sign In"
                            }
                        </button>
                    </div>
                </div>

                <p className="text-center text-slate-500 text-xs mt-6">
                    Hospital Management System &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;