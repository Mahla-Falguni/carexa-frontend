import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const BASE = "http://localhost:5000/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim())
            return Swal.fire("Missing", "Please enter your email address", "warning");

        setLoading(true);
        try {
            const { data } = await axios.post(`${BASE}/forgot-password`, { patient_email: email });

            // Build the reset URL using the token returned from the API
            const resetUrl = `${window.location.origin}/reset-password/${data.resetToken}`;
            setDone({ resetUrl, patient_name: data.patient_name });

        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed to generate reset link", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .fp-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f0f4f8;
                    font-family: 'DM Sans', sans-serif;
                    padding: 24px;
                }

                .fp-card {
                    background: #fff;
                    border-radius: 24px;
                    box-shadow: 0 8px 40px rgba(11,29,58,0.10);
                    padding: 48px 44px;
                    width: 100%;
                    max-width: 440px;
                }

                .fp-icon-wrap {
                    width: 64px; height: 64px;
                    background: #eff6ff;
                    border-radius: 18px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 28px;
                    margin: 0 auto 24px;
                }

                .fp-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 26px;
                    font-weight: 700;
                    color: #0b1d3a;
                    text-align: center;
                    margin-bottom: 8px;
                }

                .fp-sub {
                    font-size: 14px;
                    color: #7a8fa6;
                    text-align: center;
                    font-weight: 300;
                    line-height: 1.6;
                    margin-bottom: 32px;
                }

                .fp-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: #3d5170;
                    margin-bottom: 8px;
                }

                .fp-field {
                    position: relative;
                    margin-bottom: 24px;
                }

                .fp-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 16px;
                    color: #a0b0c8;
                    pointer-events: none;
                }

                .fp-input {
                    width: 100%;
                    padding: 13px 16px 13px 44px;
                    border: 1.5px solid #d8e4f0;
                    border-radius: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    color: #1a2f4a;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .fp-input::placeholder { color: #b0c0d4; }
                .fp-input:focus {
                    border-color: #2f80ed;
                    box-shadow: 0 0 0 4px rgba(47,128,237,0.10);
                }

                .fp-btn {
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
                }
                .fp-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(47,128,237,0.38); }
                .fp-btn:disabled { opacity: 0.65; cursor: not-allowed; }

                .fp-back {
                    text-align: center;
                    margin-top: 22px;
                    font-size: 13px;
                    color: #7a8fa6;
                }
                .fp-back a { color: #2f80ed; font-weight: 500; text-decoration: none; }
                .fp-back a:hover { text-decoration: underline; }

                /* Success box */
                .fp-success {
                    background: #f0fdf4;
                    border: 1.5px solid #86efac;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                }
                .fp-success-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: #065f46;
                    margin-bottom: 6px;
                    display: flex; align-items: center; gap: 8px;
                }
                .fp-success-sub {
                    font-size: 13px;
                    color: #047857;
                    margin-bottom: 16px;
                    line-height: 1.5;
                }
                .fp-url-box {
                    background: #fff;
                    border: 1.5px solid #d1fae5;
                    border-radius: 10px;
                    padding: 12px 14px;
                    font-size: 12px;
                    font-family: monospace;
                    color: #065f46;
                    word-break: break-all;
                    margin-bottom: 12px;
                    line-height: 1.5;
                }
                .fp-copy-btn {
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    width: 100%;
                    padding: 10px;
                    background: #059669;
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'DM Sans', sans-serif;
                    transition: background 0.15s;
                }
                .fp-copy-btn:hover { background: #047857; }

                .fp-warning {
                    font-size: 11px;
                    color: #d97706;
                    text-align: center;
                    margin-top: 10px;
                    display: flex; align-items: center; justify-content: center; gap: 5px;
                }

                .spinner {
                    width: 18px; height: 18px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="fp-root">
                <div className="fp-card">
                    <div className="fp-icon-wrap">🔐</div>

                    {!done ? (
                        <>
                            <h2 className="fp-title">Forgot Password?</h2>
                            <p className="fp-sub">
                                Enter your registered email address and we'll generate a secure reset link for you.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <label className="fp-label">Email Address</label>
                                <div className="fp-field">
                                    <span className="fp-icon">✉️</span>
                                    <input
                                        type="email"
                                        className="fp-input"
                                        placeholder="Enter your registered email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className="fp-btn" disabled={loading}>
                                    {loading
                                        ? <><div className="spinner" /> Generating link…</>
                                        : "🔗  Generate Reset Link"
                                    }
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h2 className="fp-title">Check Your Email</h2>
                            <p className="fp-sub">
                                Hi <strong>{done.patient_name}</strong>! A password reset link has been sent to your email. It is valid for <strong>15 minutes</strong>.
                            </p>

                            <div className="fp-success">
                                <div className="fp-success-title">
                                    ✅ Reset link sent successfully
                                </div>
                                <p className="fp-success-sub">
                                    Please check your inbox and click the reset link to set a new password. The link expires in <strong>15 minutes</strong>.
                                </p>
                                <p className="fp-warning">
                                    ⚠️ Do not share the link with anyone.
                                </p>
                            </div>

                            <button
                                className="fp-btn"
                                style={{ marginTop: 10, background: "#f1f5f9", color: "#475569", boxShadow: "none" }}
                                onClick={() => { setDone(null); setEmail(""); }}>
                                ← Try another email
                            </button>
                        </>
                    )}

                    <p className="fp-back">
                        Remembered it? <Link to="/login">Back to Sign In</Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;