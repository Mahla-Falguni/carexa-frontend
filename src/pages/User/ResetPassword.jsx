import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

const BASE = "https://carexa-backend.vercel.app/api";

const ResetPassword = () => {
    const { token }    = useParams();
    const navigate     = useNavigate();

    const [status,   setStatus]   = useState("loading"); // "loading" | "valid" | "invalid" | "done"
    const [name,     setName]     = useState("");
    const [password, setPassword] = useState("");
    const [confirm,  setConfirm]  = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [saving,   setSaving]   = useState(false);
    const [errMsg,   setErrMsg]   = useState("");

    // ── Validate the token on mount ───────────────────────────────────────────
    useEffect(() => {
        if (!token) { setStatus("invalid"); return; }

        axios.get(`${BASE}/verify-reset-token/${token}`)
            .then(res => {
                if (res.data.valid) {
                    setName(res.data.patient_name || "");
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
        if (!password) return { score: 0, label: "", color: "#e2e8f0" };
        let s = 0;
        if (password.length >= 6)  s++;
        if (password.length >= 10) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        const map = [
            { label: "", color: "#e2e8f0" },
            { label: "Weak",      color: "#ef4444" },
            { label: "Fair",      color: "#f59e0b" },
            { label: "Good",      color: "#3b82f6" },
            { label: "Strong",    color: "#10b981" },
            { label: "Very Strong", color: "#059669" },
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
                title: "Password Reset! 🎉",
                text:  "Your password has been updated. You can now sign in.",
                timer: 2500,
                showConfirmButton: false
            });
            setTimeout(() => navigate("/login"), 2600);

        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed to reset password", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .rp-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f0f4f8;
                    font-family: 'DM Sans', sans-serif;
                    padding: 24px;
                }

                .rp-card {
                    background: #fff;
                    border-radius: 24px;
                    box-shadow: 0 8px 40px rgba(11,29,58,0.10);
                    padding: 48px 44px;
                    width: 100%;
                    max-width: 440px;
                }

                .rp-icon-wrap {
                    width: 64px; height: 64px;
                    border-radius: 18px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 28px;
                    margin: 0 auto 24px;
                }

                .rp-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 26px;
                    font-weight: 700;
                    color: #0b1d3a;
                    text-align: center;
                    margin-bottom: 8px;
                }

                .rp-sub {
                    font-size: 14px;
                    color: #7a8fa6;
                    text-align: center;
                    font-weight: 300;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }

                .rp-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: #3d5170;
                    margin-bottom: 8px;
                }

                .rp-field {
                    position: relative;
                    margin-bottom: 20px;
                }

                .rp-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 16px;
                    color: #a0b0c8;
                    pointer-events: none;
                }

                .rp-input {
                    width: 100%;
                    padding: 13px 44px 13px 44px;
                    border: 1.5px solid #d8e4f0;
                    border-radius: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    color: #1a2f4a;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .rp-input::placeholder { color: #b0c0d4; }
                .rp-input:focus {
                    border-color: #2f80ed;
                    box-shadow: 0 0 0 4px rgba(47,128,237,0.10);
                }

                .rp-toggle {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #a0b0c8;
                    font-size: 16px;
                    padding: 4px;
                    transition: color 0.2s;
                }
                .rp-toggle:hover { color: #2f80ed; }

                /* Strength bar */
                .strength-bar {
                    height: 5px;
                    border-radius: 100px;
                    background: #e2e8f0;
                    margin: -12px 0 16px;
                    overflow: hidden;
                }
                .strength-fill {
                    height: 100%;
                    border-radius: 100px;
                    transition: width 0.3s ease, background 0.3s ease;
                }
                .strength-label {
                    font-size: 11px;
                    font-weight: 600;
                    text-align: right;
                    margin: -14px 0 16px;
                }

                /* Match indicator */
                .match-msg {
                    font-size: 11px;
                    font-weight: 600;
                    margin: -14px 0 16px;
                }

                .rp-btn {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #1558b0 0%, #2f80ed 100%);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 15px;
                    font-weight: 500;
                    cursor: pointer;
                    box-shadow: 0 6px 20px rgba(47,128,237,0.30);
                    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    margin-top: 6px;
                }
                .rp-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(47,128,237,0.38); }
                .rp-btn:disabled { opacity: 0.65; cursor: not-allowed; }

                .rp-back {
                    text-align: center;
                    margin-top: 22px;
                    font-size: 13px;
                    color: #7a8fa6;
                }
                .rp-back a { color: #2f80ed; font-weight: 500; text-decoration: none; }
                .rp-back a:hover { text-decoration: underline; }

                /* Invalid state */
                .rp-error-box {
                    background: #fef2f2;
                    border: 1.5px solid #fca5a5;
                    border-radius: 14px;
                    padding: 24px;
                    text-align: center;
                }
                .rp-error-icon { font-size: 40px; margin-bottom: 12px; }
                .rp-error-title { font-size: 17px; font-weight: 700; color: #b91c1c; margin-bottom: 6px; }
                .rp-error-msg   { font-size: 13px; color: #dc2626; margin-bottom: 18px; line-height: 1.5; }

                /* Loading */
                .rp-loading {
                    display: flex; flex-direction: column; align-items: center; gap: 14px;
                    padding: 24px 0;
                }
                .rp-spinner {
                    width: 36px; height: 36px;
                    border: 3px solid #dbeafe;
                    border-top-color: #2f80ed;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* Done */
                .rp-done {
                    text-align: center;
                    padding: 12px 0;
                }
                .rp-done-icon { font-size: 52px; margin-bottom: 12px; }

                .spinner-sm {
                    width: 18px; height: 18px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
            `}</style>

            <div className="rp-root">
                <div className="rp-card">

                    {/* ── LOADING ── */}
                    {status === "loading" && (
                        <div className="rp-loading">
                            <div className="rp-spinner"/>
                            <p style={{ color:"#94a3b8", fontSize:14 }}>Validating your reset link…</p>
                        </div>
                    )}

                    {/* ── INVALID / EXPIRED ── */}
                    {status === "invalid" && (
                        <>
                            <div className="rp-icon-wrap" style={{ background:"#fef2f2" }}>⛔</div>
                            <h2 className="rp-title">Link Invalid</h2>
                            <div className="rp-error-box">
                                <div className="rp-error-icon">⏰</div>
                                <div className="rp-error-title">This link has expired or is invalid</div>
                                <div className="rp-error-msg">
                                    {errMsg || "Password reset links are valid for 15 minutes only."}
                                </div>
                                <Link to="/forgot-password" className="rp-btn" style={{ textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                                    🔗 Request a New Link
                                </Link>
                            </div>
                            <p className="rp-back"><Link to="/login">← Back to Sign In</Link></p>
                        </>
                    )}

                    {/* ── DONE ── */}
                    {status === "done" && (
                        <>
                            <div className="rp-icon-wrap" style={{ background:"#f0fdf4" }}>✅</div>
                            <h2 className="rp-title">Password Updated!</h2>
                            <div className="rp-done">
                                <div className="rp-done-icon">🎉</div>
                                <p style={{ color:"#475569", fontSize:14, lineHeight:1.6 }}>
                                    Your password has been reset successfully.<br/>Redirecting you to login…
                                </p>
                            </div>
                            <Link to="/login" className="rp-btn" style={{ textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                                → Sign In Now
                            </Link>
                        </>
                    )}

                    {/* ── VALID — RESET FORM ── */}
                    {status === "valid" && (
                        <>
                            <div className="rp-icon-wrap" style={{ background:"#eff6ff" }}>🔑</div>
                            <h2 className="rp-title">Set New Password</h2>
                            <p className="rp-sub">
                                {name ? `Hi ${name}! ` : ""}Create a strong new password for your account.
                            </p>

                            <form onSubmit={handleReset}>
                                {/* New password */}
                                <label className="rp-label">New Password</label>
                                <div className="rp-field">
                                    <span className="rp-icon">🔒</span>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        className="rp-input"
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                    <button type="button" className="rp-toggle" onClick={() => setShowPass(p => !p)}>
                                        {showPass ? "🙈" : "👁️"}
                                    </button>
                                </div>

                                {/* Strength bar */}
                                {password && (
                                    <>
                                        <div className="strength-bar">
                                            <div className="strength-fill" style={{ width:`${(strength.score/5)*100}%`, background: strength.color }}/>
                                        </div>
                                        <p className="strength-label" style={{ color: strength.color }}>{strength.label}</p>
                                    </>
                                )}

                                {/* Confirm password */}
                                <label className="rp-label">Confirm Password</label>
                                <div className="rp-field">
                                    <span className="rp-icon">🔒</span>
                                    <input
                                        type={showConf ? "text" : "password"}
                                        className="rp-input"
                                        placeholder="Re-enter new password"
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        required
                                    />
                                    <button type="button" className="rp-toggle" onClick={() => setShowConf(p => !p)}>
                                        {showConf ? "🙈" : "👁️"}
                                    </button>
                                </div>

                                {/* Match indicator */}
                                {confirm && (
                                    <p className="match-msg" style={{ color: confirm === password ? "#059669" : "#ef4444" }}>
                                        {confirm === password ? "✓ Passwords match" : "✗ Passwords do not match"}
                                    </p>
                                )}

                                <button type="submit" className="rp-btn" disabled={saving || !password || !confirm || password !== confirm}>
                                    {saving
                                        ? <><div className="spinner-sm"/> Resetting…</>
                                        : "🔐  Reset Password"
                                    }
                                </button>
                            </form>

                            <p className="rp-back">
                                Remembered it? <Link to="/login">Back to Sign In</Link>
                            </p>
                        </>
                    )}

                </div>
            </div>
        </>
    );
};

export default ResetPassword;