import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'

const Register = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        patient_name: '',
        patient_email: '',
        patient_pass: ''
    })
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await axios.post(
                "https://carexa-backend.vercel.app/api/register", formData )
            Swal.fire({
                icon: "success",
                title: "Registration Successful",
                text: "Now login with your account",
                timer: 2000,
                showConfirmButton: false
            })
            navigate("/login")
        } catch (error) {
            let message = "Registration failed"
            if (error.response && error.response.data.Message) {
                message = error.response.data.Message
            }
            Swal.fire({ icon: "error", title: "Registration Failed", text: message })
            if (message.includes("already exists")) {
                setTimeout(() => navigate("/login"), 2000)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .reg-root {
                    min-height: 100vh;
                    display: flex;
                    font-family: 'DM Sans', sans-serif;
                    background: #f0f4f8;
                }

                /* LEFT PANEL */
                .reg-left {
                    width: 45%;
                    background: linear-gradient(145deg, #0b1d3a 0%, #1a3a6e 60%, #1558b0 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 60px 56px;
                    position: relative;
                    overflow: hidden;
                }

                .reg-left::before {
                    content: '';
                    position: absolute;
                    width: 420px; height: 420px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.04);
                    top: -100px; left: -100px;
                }
                .reg-left::after {
                    content: '';
                    position: absolute;
                    width: 280px; height: 280px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.05);
                    bottom: -80px; right: -60px;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 64px;
                    position: relative; z-index: 1;
                }

                .brand-icon {
                    width: 48px; height: 48px;
                    background: #2f80ed;
                    border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 22px;
                    box-shadow: 0 8px 24px rgba(47,128,237,0.45);
                }

                .brand-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 28px;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: 0.5px;
                }

                .left-heading {
                    font-family: 'Playfair Display', serif;
                    font-size: 40px;
                    font-weight: 700;
                    color: #fff;
                    line-height: 1.2;
                    margin-bottom: 20px;
                    position: relative; z-index: 1;
                }

                .left-sub {
                    font-size: 15px;
                    color: rgba(255,255,255,0.65);
                    line-height: 1.7;
                    max-width: 340px;
                    position: relative; z-index: 1;
                    font-weight: 300;
                }

                .perks {
                    margin-top: 48px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                    position: relative; z-index: 1;
                }

                .perk {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .perk-dot {
                    width: 36px; height: 36px; flex-shrink: 0;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.1);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 16px;
                }

                .perk-text {
                    font-size: 14px;
                    color: rgba(255,255,255,0.8);
                    font-weight: 400;
                }

                /* RIGHT PANEL */
                .reg-right {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 48px;
                }

                .form-card {
                    width: 100%;
                    max-width: 420px;
                }

                .form-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 30px;
                    font-weight: 700;
                    color: #0b1d3a;
                    margin-bottom: 6px;
                }

                .form-subtitle {
                    font-size: 14px;
                    color: #7a8fa6;
                    font-weight: 300;
                    margin-bottom: 36px;
                }

                .field-group {
                    margin-bottom: 22px;
                }

                .field-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: #3d5170;
                    margin-bottom: 8px;
                    letter-spacing: 0.3px;
                }

                .field-wrap {
                    position: relative;
                }

                .field-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 16px;
                    color: #a0b0c8;
                    pointer-events: none;
                }

                .field-input {
                    width: 100%;
                    padding: 13px 16px 13px 44px;
                    border: 1.5px solid #d8e4f0;
                    border-radius: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    color: #1a2f4a;
                    background: #fff;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }

                .field-input::placeholder { color: #b0c0d4; }

                .field-input:focus {
                    border-color: #2f80ed;
                    box-shadow: 0 0 0 4px rgba(47,128,237,0.10);
                }

                .pass-toggle {
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
                    line-height: 1;
                    transition: color 0.2s;
                }
                .pass-toggle:hover { color: #2f80ed; }

                .pass-hint {
                    font-size: 12px;
                    color: #a0b0c8;
                    margin-top: 5px;
                    font-weight: 300;
                }

                .divider {
                    height: 1px;
                    background: #e8f0f8;
                    margin: 28px 0;
                }

                .submit-btn {
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
                    letter-spacing: 0.3px;
                    box-shadow: 0 6px 20px rgba(47,128,237,0.35);
                    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 28px rgba(47,128,237,0.40);
                }
                .submit-btn:active:not(:disabled) { transform: translateY(0); }
                .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

                .login-link {
                    text-align: center;
                    margin-top: 24px;
                    font-size: 14px;
                    color: #7a8fa6;
                }

                .login-link a {
                    color: #2f80ed;
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .login-link a:hover { color: #1558b0; text-decoration: underline; }

                .spinner {
                    width: 18px; height: 18px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .reg-left { display: none; }
                    .reg-right { padding: 32px 24px; }
                }
            `}</style>

            <div className="reg-root">

                {/* LEFT PANEL */}
                <div className="reg-left">
                    <div className="brand">
                        <div className="brand-icon">🏥</div>
                        <span className="brand-name">Carexa</span>
                    </div>

                    <h1 className="left-heading">
                        Your Health,<br />Our Priority
                    </h1>
                    <p className="left-sub">
                        Join thousands of patients managing their healthcare journey with Carexa — simple, secure, and always with you.
                    </p>

                    <div className="perks">
                        <div className="perk">
                            <div className="perk-dot">📋</div>
                            <span className="perk-text">Book appointments with top doctors</span>
                        </div>
                        <div className="perk">
                            <div className="perk-dot">🏨</div>
                            <span className="perk-text">Access hospitals near you instantly</span>
                        </div>
                        <div className="perk">
                            <div className="perk-dot">🔒</div>
                            <span className="perk-text">Your records are always private & secure</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="reg-right">
                    <div className="form-card">
                        <h2 className="form-title">Create Account</h2>
                        <p className="form-subtitle">Register as a patient to get started</p>

                        <form onSubmit={handleSubmit}>

                            <div className="field-group">
                                <label className="field-label">Full Name</label>
                                <div className="field-wrap">
                                    <span className="field-icon">👤</span>
                                    <input
                                        type="text"
                                        name="patient_name"
                                        value={formData.patient_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        className="field-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field-group">
                                <label className="field-label">Email Address</label>
                                <div className="field-wrap">
                                    <span className="field-icon">✉️</span>
                                    <input
                                        type="email"
                                        name="patient_email"
                                        value={formData.patient_email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                        className="field-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field-group">
                                <label className="field-label">Password</label>
                                <div className="field-wrap">
                                    <span className="field-icon">🔑</span>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        name="patient_pass"
                                        value={formData.patient_pass}
                                        onChange={handleInputChange}
                                        placeholder="Create a strong password"
                                        className="field-input"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="pass-toggle"
                                        onClick={() => setShowPass(!showPass)}
                                        aria-label="Toggle password"
                                    >
                                        {showPass ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                <p className="pass-hint">Use at least 8 characters with a mix of letters & numbers</p>
                            </div>

                            <div className="divider" />

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading
                                    ? <><div className="spinner" /> Creating account…</>
                                    : '→  Create My Account'
                                }
                            </button>

                        </form>

                        <p className="login-link">
                            Already have an account?{' '}
                            <Link to="/login">Sign in here</Link>
                        </p>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Register