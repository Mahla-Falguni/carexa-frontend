import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHospital, FaUserMd, FaShieldAlt, FaHeartbeat, FaAward, FaUsers } from "react-icons/fa";

const About = () => {
  const navigate = useNavigate();

  const stats = [
    { value: "50,000+", label: "Patients Served", icon: <FaUsers /> },
    { value: "1,200+", label: "Verified Doctors", icon: <FaUserMd /> },
    { value: "300+", label: "Partner Hospitals", icon: <FaHospital /> },
    { value: "99.8%", label: "Uptime Reliability", icon: <FaShieldAlt /> },
  ];

  const values = [
    {
      icon: "❤️",
      title: "Patient First",
      desc: "Every decision we make starts with one question — is this good for the patient? Your wellbeing is the reason we exist.",
      color: "#e74c3c", bg: "#fff5f5",
    },
    {
      icon: "🔒",
      title: "Privacy & Trust",
      desc: "Your health data is personal. We use enterprise-grade encryption and follow strict HIPAA-aligned data practices.",
      color: "#2f80ed", bg: "#eef5ff",
    },
    {
      icon: "⚡",
      title: "Speed & Simplicity",
      desc: "Healthcare shouldn't be complicated. We've designed Carexa to be fast, intuitive, and accessible to everyone.",
      color: "#f39c12", bg: "#fff9ee",
    },
    {
      icon: "🌍",
      title: "Inclusive Care",
      desc: "Whether you're in a metro city or a small town, Carexa connects you to quality healthcare without barriers.",
      color: "#27ae60", bg: "#edfaf3",
    },
  ];

  const team = [
    { name: "Dr. Arjun Mehta", role: "Chief Medical Officer", initials: "AM", color: "#2f80ed" },
    { name: "Priya Desai", role: "CEO & Co-Founder", initials: "PD", color: "#27ae60" },
    { name: "Rohan Shah", role: "CTO", initials: "RS", color: "#8e44ad" },
    { name: "Kavya Nair", role: "Head of Patient Experience", initials: "KN", color: "#e67e22" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ab-root {
          font-family: 'DM Sans', sans-serif;
          color: #1a2f4a;
          background: #f0f4f8;
        }

        /* ── HERO ── */
        .ab-hero {
          background: linear-gradient(135deg, #0b1d3a 0%, #1a3a6e 55%, #2f80ed 100%);
          padding: 100px 80px 80px;
          position: relative;
          overflow: hidden;
          text-align: center;
        }
        .ab-hero::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          top: -180px; right: -100px;
        }
        .ab-hero::after {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
          bottom: -100px; left: -60px;
        }
        .ab-hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 20px;
          padding: 6px 18px;
          font-size: 12px; color: rgba(255,255,255,0.75);
          letter-spacing: 1px; text-transform: uppercase;
          margin-bottom: 24px;
          position: relative; z-index: 1;
        }
        .ab-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 54px; font-weight: 700;
          color: #fff; line-height: 1.1;
          margin-bottom: 20px;
          position: relative; z-index: 1;
        }
        .ab-hero-title span { color: #56aef8; }
        .ab-hero-sub {
          font-size: 17px; color: rgba(255,255,255,0.65);
          font-weight: 300; line-height: 1.7;
          max-width: 560px; margin: 0 auto 36px;
          position: relative; z-index: 1;
        }
        .ab-hero-btns {
          display: flex; gap: 14px; justify-content: center;
          position: relative; z-index: 1;
          flex-wrap: wrap;
        }
        .ab-btn-primary {
          padding: 13px 28px;
          background: linear-gradient(135deg, #1558b0, #2f80ed);
          color: #fff; border: none; border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(47,128,237,0.40);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ab-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(47,128,237,0.45); }
        .ab-btn-outline {
          padding: 13px 28px;
          background: rgba(255,255,255,0.08);
          color: #fff;
          border: 1.5px solid rgba(255,255,255,0.25);
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .ab-btn-outline:hover { background: rgba(255,255,255,0.15); }

        /* ── SHARED SECTION ── */
        .ab-section { padding: 72px 80px; }
        .ab-section.alt { background: #fff; }
        .ab-section-label {
          font-size: 11px; font-weight: 600;
          color: #2f80ed; text-transform: uppercase;
          letter-spacing: 1.5px; margin-bottom: 10px;
        }
        .ab-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px; font-weight: 700;
          color: #0b1d3a; margin-bottom: 14px;
          line-height: 1.2;
        }
        .ab-section-sub {
          font-size: 15px; color: #7a8fa6;
          font-weight: 300; line-height: 1.7;
          max-width: 560px;
        }
        .ab-section-head { margin-bottom: 48px; }
        .ab-section-head.center { text-align: center; }
        .ab-section-head.center .ab-section-sub { margin: 0 auto; }

        /* ── STATS ── */
        .ab-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .ab-stat {
          background: #fff;
          border-radius: 18px;
          padding: 28px 24px;
          border: 1.5px solid #e8f0f8;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ab-stat:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(11,29,58,0.08); }
        .ab-stat-icon {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #1558b0, #2f80ed);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; color: #fff;
          margin: 0 auto 14px;
          box-shadow: 0 6px 18px rgba(47,128,237,0.30);
        }
        .ab-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 32px; font-weight: 700;
          color: #0b1d3a; margin-bottom: 4px;
        }
        .ab-stat-label {
          font-size: 13px; color: #7a8fa6; font-weight: 400;
        }

        /* ── MISSION ── */
        .ab-mission-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .ab-mission-img {
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(11,29,58,0.14);
          position: relative;
        }
        .ab-mission-img img {
          width: 100%; height: 400px; object-fit: cover; display: block;
        }
        .ab-mission-img-badge {
          position: absolute; bottom: 20px; left: 20px;
          background: #fff;
          border-radius: 14px;
          padding: 12px 18px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 8px 24px rgba(11,29,58,0.12);
        }
        .ab-badge-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #1558b0, #2f80ed);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; color: #fff;
        }
        .ab-badge-val {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: #0b1d3a;
        }
        .ab-badge-lbl { font-size: 11px; color: #7a8fa6; }
        .ab-mission-text p {
          font-size: 15px; color: #5a7294;
          font-weight: 300; line-height: 1.8;
          margin-bottom: 18px;
        }
        .ab-mission-checks {
          display: flex; flex-direction: column; gap: 12px;
          margin-top: 24px;
        }
        .ab-check {
          display: flex; align-items: center; gap: 12px;
          font-size: 14px; color: #3d5170; font-weight: 400;
        }
        .ab-check-dot {
          width: 24px; height: 24px; flex-shrink: 0;
          background: linear-gradient(135deg, #1558b0, #2f80ed);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 11px;
          box-shadow: 0 3px 10px rgba(47,128,237,0.30);
        }

        /* ── VALUES ── */
        .ab-values {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .ab-value-card {
          background: #fff;
          border-radius: 18px;
          padding: 28px 22px;
          border: 1.5px solid #e8f0f8;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ab-value-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(11,29,58,0.08); }
        .ab-value-icon {
          width: 48px; height: 48px;
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          margin-bottom: 16px;
        }
        .ab-value-title {
          font-size: 15px; font-weight: 600;
          color: #0b1d3a; margin-bottom: 8px;
        }
        .ab-value-desc {
          font-size: 13px; color: #7a8fa6;
          font-weight: 300; line-height: 1.65;
        }

        /* ── TEAM ── */
        .ab-team {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .ab-team-card {
          background: #fff;
          border-radius: 18px;
          padding: 28px 20px;
          border: 1.5px solid #e8f0f8;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ab-team-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(11,29,58,0.08); }
        .ab-team-avatar {
          width: 68px; height: 68px;
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 600; color: #fff;
          margin: 0 auto 14px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        .ab-team-name {
          font-size: 15px; font-weight: 600; color: #0b1d3a;
          margin-bottom: 4px;
        }
        .ab-team-role {
          font-size: 12px; color: #7a8fa6; font-weight: 300;
        }
        .ab-team-badge {
          display: inline-block;
          margin-top: 10px;
          font-size: 11px;
          background: #eef5ff;
          color: #2f80ed;
          border-radius: 20px;
          padding: 3px 12px;
          font-weight: 500;
        }

        /* ── CTA ── */
        .ab-cta {
          background: linear-gradient(135deg, #0b1d3a 0%, #1a3a6e 55%, #2f80ed 100%);
          padding: 72px 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .ab-cta::before {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          top: -150px; right: -100px;
        }
        .ab-cta-title {
          font-family: 'Playfair Display', serif;
          font-size: 40px; font-weight: 700;
          color: #fff; margin-bottom: 14px;
          position: relative; z-index: 1;
        }
        .ab-cta-sub {
          font-size: 16px; color: rgba(255,255,255,0.60);
          font-weight: 300; margin-bottom: 32px;
          position: relative; z-index: 1;
        }
        .ab-cta-btns {
          display: flex; gap: 14px; justify-content: center;
          position: relative; z-index: 1; flex-wrap: wrap;
        }

        @media (max-width: 1024px) {
          .ab-stats { grid-template-columns: repeat(2, 1fr); }
          .ab-values { grid-template-columns: repeat(2, 1fr); }
          .ab-team { grid-template-columns: repeat(2, 1fr); }
          .ab-mission-grid { grid-template-columns: 1fr; gap: 36px; }
        }
        @media (max-width: 768px) {
          .ab-hero { padding: 70px 24px 60px; }
          .ab-hero-title { font-size: 36px; }
          .ab-section { padding: 52px 24px; }
          .ab-cta { padding: 52px 24px; }
          .ab-cta-title { font-size: 28px; }
        }
        @media (max-width: 480px) {
          .ab-stats { grid-template-columns: 1fr 1fr; }
          .ab-values { grid-template-columns: 1fr; }
          .ab-team { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="ab-root">

        {/* ── HERO ── */}
        <section className="ab-hero">
          <div className="ab-hero-tag">🏥 About Carexa</div>
          <h1 className="ab-hero-title">Healthcare Made <span>Human</span><br />Again.</h1>
          <p className="ab-hero-sub">
            Carexa was built with a simple belief — that every patient deserves fast, affordable, and trustworthy access to healthcare. We're on a mission to make that a reality across India.
          </p>
          <div className="ab-hero-btns">
            <button className="ab-btn-primary" onClick={() => navigate("/register")}>Get Started Free</button>
            <button className="ab-btn-outline" onClick={() => navigate("/contact")}>Contact Us</button>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="ab-section">
          <div className="ab-section-head center">
            <p className="ab-section-label">Our Impact</p>
            <h2 className="ab-section-title">Trusted by thousands<br />across India</h2>
          </div>
          <div className="ab-stats">
            {stats.map((s) => (
              <div className="ab-stat" key={s.label}>
                <div className="ab-stat-icon">{s.icon}</div>
                <div className="ab-stat-value">{s.value}</div>
                <div className="ab-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MISSION ── */}
        <section className="ab-section alt">
          <div className="ab-mission-grid">
            <div className="ab-mission-img">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
                alt="Healthcare team"
              />
              <div className="ab-mission-img-badge">
                <div className="ab-badge-icon"><FaAward /></div>
                <div>
                  <div className="ab-badge-val">Est. 2022</div>
                  <div className="ab-badge-lbl">Founded in India</div>
                </div>
              </div>
            </div>
            <div className="ab-mission-text">
              <p className="ab-section-label">Our Mission</p>
              <h2 className="ab-section-title">Connecting patients<br />with the right care</h2>
              <p>We started Carexa after seeing firsthand how difficult it was for people to navigate the healthcare system — long wait times, confusing processes, and no central place to manage health information.</p>
              <p>Today, Carexa bridges the gap between patients, doctors, and hospitals with a seamless digital platform that puts the patient in control of their health journey.</p>
              <div className="ab-mission-checks">
                {["ABDM-aligned digital health records", "Real-time appointment booking", "Verified doctors & hospitals only", "Available across 50+ cities in India"].map(t => (
                  <div className="ab-check" key={t}>
                    <span className="ab-check-dot">✓</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="ab-section">
          <div className="ab-section-head center">
            <p className="ab-section-label">What We Stand For</p>
            <h2 className="ab-section-title">Our Core Values</h2>
            <p className="ab-section-sub">These aren't just words on a wall — they guide every feature we build and every decision we make.</p>
          </div>
          <div className="ab-values">
            {values.map((v) => (
              <div className="ab-value-card" key={v.title}>
                <div className="ab-value-icon" style={{ background: v.bg }}>{v.icon}</div>
                <div className="ab-value-title">{v.title}</div>
                <div className="ab-value-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="ab-section alt">
          <div className="ab-section-head center">
            <p className="ab-section-label">The People Behind Carexa</p>
            <h2 className="ab-section-title">Meet Our Team</h2>
            <p className="ab-section-sub">A passionate group of doctors, technologists, and healthcare advocates united by one goal.</p>
          </div>
          <div className="ab-team">
            {team.map((m) => (
              <div className="ab-team-card" key={m.name}>
                <div className="ab-team-avatar" style={{ background: `linear-gradient(135deg, ${m.color}cc, ${m.color})` }}>
                  {m.initials}
                </div>
                <div className="ab-team-name">{m.name}</div>
                <div className="ab-team-role">{m.role}</div>
                <span className="ab-team-badge">Carexa Team</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ab-cta">
          <h2 className="ab-cta-title">Ready to take control<br />of your health?</h2>
          <p className="ab-cta-sub">Join 50,000+ patients already using Carexa to manage their healthcare.</p>
          <div className="ab-cta-btns">
            <button className="ab-btn-primary" onClick={() => navigate("/register")}>Create Free Account</button>
            <button className="ab-btn-outline" onClick={() => navigate("/services")}>Explore Services</button>
          </div>
        </section>

      </div>
    </>
  );
};

export default About;