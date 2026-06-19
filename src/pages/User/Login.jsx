import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/login`,
        {
          patient_email: email,
          patient_pass: password,
        }
      );

      if (response.data.Token) {
        localStorage.setItem("UserToken", response.data.Token);
        localStorage.setItem("username", response.data.Name);

        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: `Welcome ${response.data.Name}`,
          timer: 2000,
          showConfirmButton: false,
        });

        const redirect = searchParams.get("redirect");
        navigate(redirect || "/UserDashboard");
      }
    } catch (error) {
      let message = "Login failed";
      if (error.response && error.response.data.Message)
        message = error.response.data.Message;
      Swal.fire({ icon: "error", title: "Login Failed", text: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #f0f4f8;
        }

        .login-left {
          width: 45%;
          position: relative;
          overflow: hidden;
        }
        .login-left img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        .login-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(160deg, rgba(11,29,58,0.82) 0%, rgba(21,88,176,0.60) 50%, rgba(47,128,237,0.30) 100%);
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 52px 52px 48px;
        }

        .brand { display: flex; align-items: center; gap: 14px; }
        .brand-icon {
          width: 48px; height: 48px;
          background: #2f80ed; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          box-shadow: 0 8px 24px rgba(47,128,237,0.45);
        }
        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 700; color: #fff; letter-spacing: 0.5px;
        }
        .left-bottom { color: #fff; }
        .left-quote {
          font-family: 'Playfair Display', serif;
          font-size: 32px; font-weight: 700; line-height: 1.25; margin-bottom: 14px;
        }
        .left-quote-sub {
          font-size: 14px; color: rgba(255,255,255,0.65); font-weight: 300;
          line-height: 1.6; max-width: 320px;
        }

        .login-right {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 48px;
        }
        .form-card { width: 100%; max-width: 420px; }

        .form-welcome {
          font-size: 13px; font-weight: 500; color: #2f80ed;
          text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;
        }
        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 30px; font-weight: 700; color: #0b1d3a; margin-bottom: 6px;
        }
        .form-subtitle {
          font-size: 14px; color: #7a8fa6; font-weight: 300; margin-bottom: 32px;
        }

        .google-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 12px 16px;
          border: 1.5px solid #d8e4f0; border-radius: 12px;
          background: #fff; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #1a2f4a;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 24px;
        }
        .google-btn:hover { border-color: #2f80ed; box-shadow: 0 0 0 4px rgba(47,128,237,0.08); }

        .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .divider-line { flex: 1; height: 1px; background: #e8f0f8; }
        .divider-text { font-size: 12px; color: #a0b0c8; font-weight: 400; white-space: nowrap; }

        .field-group { margin-bottom: 20px; }
        .field-label {
          display: block; font-size: 13px; font-weight: 500; color: #3d5170;
          margin-bottom: 8px; letter-spacing: 0.3px;
        }
        .field-wrap { position: relative; }
        .field-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          font-size: 16px; color: #a0b0c8; pointer-events: none;
        }
        .field-input {
          width: 100%; padding: 13px 16px 13px 44px;
          border: 1.5px solid #d8e4f0; border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1a2f4a;
          background: #fff; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input::placeholder { color: #b0c0d4; }
        .field-input:focus { border-color: #2f80ed; box-shadow: 0 0 0 4px rgba(47,128,237,0.10); }

        .pass-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #a0b0c8; font-size: 16px; padding: 4px; line-height: 1;
          transition: color 0.2s;
        }
        .pass-toggle:hover { color: #2f80ed; }

        .row-options {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 28px; margin-top: 4px;
        }
        .remember-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .remember-wrap input[type="checkbox"] { width: 16px; height: 16px; accent-color: #2f80ed; cursor: pointer; }
        .remember-label { font-size: 13px; color: #5a7294; font-weight: 400; }

        /* ── FORGOT PASSWORD link ── */
        .forgot-link {
          font-size: 13px; color: #2f80ed; font-weight: 500;
          text-decoration: none; transition: color 0.2s;
        }
        .forgot-link:hover { color: #1558b0; text-decoration: underline; }

        .submit-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #1558b0 0%, #2f80ed 100%);
          color: #fff; border: none; border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          cursor: pointer; letter-spacing: 0.3px;
          box-shadow: 0 6px 20px rgba(47,128,237,0.35);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(47,128,237,0.40); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .register-link {
          text-align: center; margin-top: 24px; font-size: 14px; color: #7a8fa6;
        }
        .register-link a { color: #2f80ed; font-weight: 500; text-decoration: none; transition: color 0.2s; }
        .register-link a:hover { color: #1558b0; text-decoration: underline; }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right { padding: 32px 24px; }
        }
      `}</style>

      <div className="login-root">

        {/* LEFT IMAGE PANEL */}
        <div className="login-left">
          <img
            src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=80"
            alt="Healthcare professional"
          />
          <div className="login-left-overlay">
            <div className="brand">
              <div className="brand-icon">🏥</div>
              <span className="brand-name">Carexa</span>
            </div>
            <div className="left-bottom">
              <p className="left-quote">
                Trusted care,<br />right at your fingertips.
              </p>
              <p className="left-quote-sub">
                Log in to manage your appointments, track your health records, and connect with doctors — all in one place.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="login-right">
          <div className="form-card">

            <p className="form-welcome">Patient Portal</p>
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">Sign in to continue to your health dashboard</p>

            <button className="google-btn" type="button">
              <span style={{ fontSize: 18 }}>🌐</span>
              Continue with Google
            </button>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or sign in with email</span>
              <div className="divider-line" />
            </div>

            {/* Email */}
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <div className="field-wrap">
                <span className="field-icon">✉️</span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="field-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <span className="field-icon">🔑</span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="field-input"
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass(p => !p)}
                  aria-label="Toggle password">
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="row-options">
              <label className="remember-wrap">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span className="remember-label">Remember me</span>
              </label>

              {/* ✅ Now routes to /forgot-password instead of href="#" */}
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button onClick={handleLogin} className="submit-btn" disabled={loading}>
              {loading
                ? <><div className="spinner" /> Signing in…</>
                : "→  Sign In"
              }
            </button>

            <p className="register-link">
              Don't have an account?{" "}
              <Link to="/register">Create one here</Link>
            </p>

          </div>
        </div>

      </div>
    </>
  );
};

export default Login;