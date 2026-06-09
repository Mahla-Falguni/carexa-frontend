import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHospital, FaUserMd, FaCalendarCheck, FaFileMedical,
  FaAmbulance, FaPills, FaHeartbeat, FaShieldAlt, FaArrowRight
} from "react-icons/fa";

const Service = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const services = [
    {
      icon: <FaCalendarCheck />, category: "appointments",
      title: "Appointment Booking",
      desc: "Book confirmed appointments with verified doctors in real-time. No waiting, no calls — just instant scheduling.",
      color: "#2f80ed", bg: "#eef5ff",
      features: ["Instant confirmation", "SMS & email reminders", "Easy rescheduling"],
    },
    {
      icon: <FaUserMd />, category: "doctors",
      title: "Find Specialists",
      desc: "Search from 1,200+ verified specialist doctors across 40+ medical disciplines — filtered by location, rating, and availability.",
      color: "#27ae60", bg: "#edfaf3",
      features: ["40+ specializations", "Verified credentials", "Patient reviews"],
    },
    {
      icon: <FaHospital />, category: "hospitals",
      title: "Hospital Discovery",
      desc: "Explore top-rated hospitals near you with detailed profiles, available services, bed availability, and directions.",
      color: "#8e44ad", bg: "#f5eeff",
      features: ["300+ partner hospitals", "Real-time bed info", "Ratings & reviews"],
    },
    {
      icon: <FaFileMedical />, category: "records",
      title: "Digital Health Records",
      desc: "Securely store, access, and share your complete medical history — prescriptions, lab reports, and doctor notes.",
      color: "#e67e22", bg: "#fff7ee",
      features: ["Encrypted storage", "One-tap sharing", "Lifetime access"],
    },
    {
      icon: <FaHeartbeat />, category: "monitoring",
      title: "Health Monitoring",
      desc: "Track vital health metrics over time, set medication reminders, and receive personalised wellness insights.",
      color: "#e74c3c", bg: "#fff5f5",
      features: ["Vitals tracking", "Medication reminders", "Wellness insights"],
    },
    {
      icon: <FaAmbulance />, category: "emergency",
      title: "Emergency Assistance",
      desc: "One-tap SOS alert that notifies your emergency contacts and locates the nearest hospital with emergency care.",
      color: "#c0392b", bg: "#fff0f0",
      features: ["One-tap SOS", "Live location sharing", "Nearest ER locator"],
    },
    {
      icon: <FaPills />, category: "pharmacy",
      title: "Online Pharmacy",
      desc: "Order prescribed medicines and wellness products from licensed pharmacies with same-day delivery options.",
      color: "#16a085", bg: "#eafaf6",
      features: ["Licensed pharmacies", "Same-day delivery", "Auto-refill reminders"],
    },
    {
      icon: <FaShieldAlt />, category: "insurance",
      title: "Insurance Support",
      desc: "Understand and utilise your health insurance benefits. We assist with claims, pre-authorisation, and coverage queries.",
      color: "#2980b9", bg: "#eaf3fb",
      features: ["Cashless hospitals", "Claims assistance", "Coverage checker"],
    },
  ];

  const tabs = [
    { key: "all", label: "All Services" },
    { key: "appointments", label: "Appointments" },
    { key: "doctors", label: "Doctors" },
    { key: "records", label: "Records" },
    { key: "emergency", label: "Emergency" },
  ];

  const filtered = activeTab === "all" ? services : services.filter(s => s.category === activeTab);

  const plans = [
    {
      name: "Basic", price: "Free", period: "",
      desc: "For individuals getting started with digital health.",
      color: "#2f80ed",
      features: ["Appointment booking", "Doctor search", "Hospital finder", "Basic health records"],
      cta: "Get Started", primary: false,
    },
    {
      name: "Care+", price: "₹299", period: "/month",
      desc: "For patients who want complete health management.",
      color: "#0b1d3a",
      features: ["Everything in Basic", "Unlimited records storage", "Priority appointments", "Health monitoring", "24/7 chat support"],
      cta: "Start Free Trial", primary: true,
    },
    {
      name: "Family", price: "₹699", period: "/month",
      desc: "Manage health for your entire family in one account.",
      color: "#27ae60",
      features: ["Up to 6 family members", "Everything in Care+", "Emergency SOS", "Insurance support", "Dedicated health manager"],
      cta: "Choose Family", primary: false,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sv-root {
          font-family: 'DM Sans', sans-serif;
          color: #1a2f4a;
          background: #f0f4f8;
        }

        /* HERO */
        .sv-hero {
          background: linear-gradient(135deg, #0b1d3a 0%, #1a3a6e 55%, #2f80ed 100%);
          padding: 100px 80px 80px;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .sv-hero::before {
          content: ''; position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          background: rgba(255,255,255,0.04);
          top: -180px; right: -100px;
        }
        .sv-hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 20px; padding: 6px 18px;
          font-size: 12px; color: rgba(255,255,255,0.75);
          letter-spacing: 1px; text-transform: uppercase;
          margin-bottom: 24px; position: relative; z-index: 1;
        }
        .sv-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 54px; font-weight: 700; color: #fff;
          line-height: 1.1; margin-bottom: 20px;
          position: relative; z-index: 1;
        }
        .sv-hero-title span { color: #56aef8; }
        .sv-hero-sub {
          font-size: 17px; color: rgba(255,255,255,0.65);
          font-weight: 300; line-height: 1.7;
          max-width: 540px; margin: 0 auto 36px;
          position: relative; z-index: 1;
        }
        .sv-hero-pills {
          display: flex; gap: 12px; justify-content: center;
          flex-wrap: wrap; position: relative; z-index: 1;
        }
        .sv-pill {
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 20px; padding: 7px 18px;
          font-size: 13px; color: rgba(255,255,255,0.80);
        }

        /* SECTION */
        .sv-section { padding: 72px 80px; }
        .sv-section.alt { background: #fff; }
        .sv-section-label {
          font-size: 11px; font-weight: 600; color: #2f80ed;
          text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;
        }
        .sv-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px; font-weight: 700; color: #0b1d3a;
          margin-bottom: 12px; line-height: 1.2;
        }
        .sv-section-sub {
          font-size: 15px; color: #7a8fa6; font-weight: 300; line-height: 1.7;
          max-width: 520px;
        }
        .sv-section-head { margin-bottom: 40px; }
        .sv-section-head.center { text-align: center; }
        .sv-section-head.center .sv-section-sub { margin: 0 auto; }

        /* TABS */
        .sv-tabs {
          display: flex; gap: 8px; flex-wrap: wrap;
          margin-bottom: 36px;
        }
        .sv-tab {
          padding: 8px 20px;
          border-radius: 20px;
          border: 1.5px solid #d8e4f0;
          background: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 400;
          color: #5a7294; cursor: pointer;
          transition: all 0.2s;
        }
        .sv-tab:hover { border-color: #2f80ed; color: #2f80ed; }
        .sv-tab.active {
          background: linear-gradient(135deg, #1558b0, #2f80ed);
          color: #fff; border-color: transparent;
          box-shadow: 0 4px 14px rgba(47,128,237,0.30);
          font-weight: 500;
        }

        /* SERVICES GRID */
        .sv-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        .sv-card {
          background: #fff;
          border-radius: 18px;
          padding: 26px 22px;
          border: 1.5px solid #e8f0f8;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex; flex-direction: column; gap: 12px;
        }
        .sv-card:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(11,29,58,0.09); }
        .sv-card-icon {
          width: 50px; height: 50px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }
        .sv-card-title { font-size: 15px; font-weight: 600; color: #0b1d3a; }
        .sv-card-desc { font-size: 13px; color: #7a8fa6; font-weight: 300; line-height: 1.6; flex: 1; }
        .sv-card-features { display: flex; flex-direction: column; gap: 6px; }
        .sv-card-feat {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: #5a7294;
        }
        .sv-feat-dot {
          width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
        }
        .sv-card-link {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: gap 0.2s;
          margin-top: 4px;
        }
        .sv-card:hover .sv-card-link { gap: 10px; }

        /* PLANS */
        .sv-plans {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
          align-items: start;
        }
        .sv-plan {
          background: #fff;
          border-radius: 20px;
          padding: 32px 26px;
          border: 1.5px solid #e8f0f8;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .sv-plan:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(11,29,58,0.10); }
        .sv-plan.featured {
          background: linear-gradient(155deg, #0b1d3a 0%, #1a3a6e 60%, #1c4fa0 100%);
          border-color: transparent;
          box-shadow: 0 16px 48px rgba(11,29,58,0.25);
          transform: scale(1.03);
        }
        .sv-plan.featured:hover { transform: scale(1.03) translateY(-4px); }
        .sv-plan-badge {
          display: inline-block;
          font-size: 11px; font-weight: 600;
          background: linear-gradient(135deg, #2f80ed, #56aef8);
          color: #fff; border-radius: 20px;
          padding: 3px 12px; margin-bottom: 16px;
          letter-spacing: 0.5px;
        }
        .sv-plan-name {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700;
          margin-bottom: 6px;
        }
        .sv-plan-name.light { color: #fff; }
        .sv-plan-name.dark { color: #0b1d3a; }
        .sv-plan-desc {
          font-size: 13px; font-weight: 300; line-height: 1.6;
          margin-bottom: 20px;
        }
        .sv-plan-desc.light { color: rgba(255,255,255,0.60); }
        .sv-plan-desc.dark { color: #7a8fa6; }
        .sv-plan-price {
          display: flex; align-items: baseline; gap: 4px;
          margin-bottom: 6px;
        }
        .sv-plan-amount {
          font-family: 'Playfair Display', serif;
          font-size: 38px; font-weight: 700;
        }
        .sv-plan-amount.light { color: #fff; }
        .sv-plan-amount.dark { color: #0b1d3a; }
        .sv-plan-period {
          font-size: 14px; font-weight: 300;
        }
        .sv-plan-period.light { color: rgba(255,255,255,0.55); }
        .sv-plan-period.dark { color: #a0b0c8; }
        .sv-plan-divider {
          height: 1px; margin: 20px 0;
        }
        .sv-plan-divider.light { background: rgba(255,255,255,0.12); }
        .sv-plan-divider.dark { background: #e8f0f8; }
        .sv-plan-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 26px; }
        .sv-plan-feat {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px;
        }
        .sv-plan-feat.light { color: rgba(255,255,255,0.80); }
        .sv-plan-feat.dark { color: #3d5170; }
        .sv-plan-feat-icon {
          width: 20px; height: 20px; flex-shrink: 0;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px;
        }
        .sv-plan-feat-icon.light { background: rgba(255,255,255,0.15); color: #56aef8; }
        .sv-plan-feat-icon.dark { background: #eef5ff; color: #2f80ed; }
        .sv-plan-btn {
          width: 100%; padding: 13px;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          border: none;
        }
        .sv-plan-btn.primary {
          background: linear-gradient(135deg, #2f80ed, #56aef8);
          color: #fff;
          box-shadow: 0 6px 20px rgba(47,128,237,0.35);
        }
        .sv-plan-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(47,128,237,0.45); }
        .sv-plan-btn.secondary {
          background: linear-gradient(135deg, #1558b0, #2f80ed);
          color: #fff;
          box-shadow: 0 4px 14px rgba(47,128,237,0.25);
        }
        .sv-plan-btn.secondary:hover { transform: translateY(-1px); }

        /* CTA */
        .sv-cta {
          background: linear-gradient(135deg, #0b1d3a 0%, #1a3a6e 55%, #2f80ed 100%);
          padding: 72px 80px; text-align: center;
          position: relative; overflow: hidden;
        }
        .sv-cta::before {
          content: ''; position: absolute;
          width: 400px; height: 400px; border-radius: 50%;
          background: rgba(255,255,255,0.04);
          top: -150px; right: -100px;
        }
        .sv-cta-title {
          font-family: 'Playfair Display', serif;
          font-size: 40px; font-weight: 700; color: #fff;
          margin-bottom: 14px; position: relative; z-index: 1;
        }
        .sv-cta-sub {
          font-size: 16px; color: rgba(255,255,255,0.60);
          font-weight: 300; margin-bottom: 32px;
          position: relative; z-index: 1;
        }
        .sv-cta-btns { display: flex; gap: 14px; justify-content: center; position: relative; z-index: 1; flex-wrap: wrap; }
        .sv-btn-primary {
          padding: 13px 28px;
          background: linear-gradient(135deg, #1558b0, #2f80ed);
          color: #fff; border: none; border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; box-shadow: 0 6px 20px rgba(47,128,237,0.40);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .sv-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(47,128,237,0.45); }
        .sv-btn-outline {
          padding: 13px 28px;
          background: rgba(255,255,255,0.08); color: #fff;
          border: 1.5px solid rgba(255,255,255,0.25);
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: background 0.2s;
        }
        .sv-btn-outline:hover { background: rgba(255,255,255,0.15); }

        @media (max-width: 1024px) {
          .sv-grid { grid-template-columns: repeat(2, 1fr); }
          .sv-plans { grid-template-columns: 1fr; }
          .sv-plan.featured { transform: none; }
        }
        @media (max-width: 768px) {
          .sv-hero { padding: 70px 24px 60px; }
          .sv-hero-title { font-size: 36px; }
          .sv-section { padding: 52px 24px; }
          .sv-cta { padding: 52px 24px; }
          .sv-cta-title { font-size: 28px; }
        }
        @media (max-width: 480px) {
          .sv-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="sv-root">

        {/* HERO */}
        <section className="sv-hero">
          <div className="sv-hero-tag">⚕️ Our Services</div>
          <h1 className="sv-hero-title">Everything you need<br />for <span>better health</span></h1>
          <p className="sv-hero-sub">From finding the right doctor to managing your records — Carexa offers a complete suite of healthcare services in one platform.</p>
          <div className="sv-hero-pills">
            <span className="sv-pill">✅ 8 Core Services</span>
            <span className="sv-pill">🔒 HIPAA-aligned</span>
            <span className="sv-pill">📱 Available on all devices</span>
          </div>
        </section>

        {/* SERVICES */}
        <section className="sv-section">
          <div className="sv-section-head">
            <p className="sv-section-label">What We Offer</p>
            <h2 className="sv-section-title">Our Healthcare Services</h2>
            <p className="sv-section-sub">Every service is designed to remove friction from your healthcare experience.</p>
          </div>
          <div className="sv-tabs">
            {tabs.map(t => (
              <button key={t.key} className={`sv-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="sv-grid">
            {filtered.map((s) => (
              <div className="sv-card" key={s.title}>
                <div className="sv-card-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div className="sv-card-title">{s.title}</div>
                <div className="sv-card-desc">{s.desc}</div>
                <div className="sv-card-features">
                  {s.features.map(f => (
                    <div className="sv-card-feat" key={f}>
                      <span className="sv-feat-dot" style={{ background: s.color }} />
                      {f}
                    </div>
                  ))}
                </div>
                <button className="sv-card-link" style={{ color: s.color }} onClick={() => navigate("/register")}>
                  Get started <FaArrowRight size={11} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* PLANS */}
        <section className="sv-section alt">
          <div className="sv-section-head center">
            <p className="sv-section-label">Pricing</p>
            <h2 className="sv-section-title">Simple, transparent plans</h2>
            <p className="sv-section-sub">No hidden fees. No surprises. Choose the plan that fits your health needs.</p>
          </div>
          <div className="sv-plans">
            {plans.map((p) => {
              const isFeatured = p.primary;
              const c = isFeatured ? "light" : "dark";
              return (
                <div className={`sv-plan ${isFeatured ? 'featured' : ''}`} key={p.name}>
                  {isFeatured && <div className="sv-plan-badge">⭐ Most Popular</div>}
                  <div className={`sv-plan-name ${c}`}>{p.name}</div>
                  <div className={`sv-plan-desc ${c}`}>{p.desc}</div>
                  <div className="sv-plan-price">
                    <span className={`sv-plan-amount ${c}`}>{p.price}</span>
                    <span className={`sv-plan-period ${c}`}>{p.period}</span>
                  </div>
                  <div className={`sv-plan-divider ${c}`} />
                  <div className="sv-plan-features">
                    {p.features.map(f => (
                      <div className={`sv-plan-feat ${c}`} key={f}>
                        <span className={`sv-plan-feat-icon ${c}`}>✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                  <button
                    className={`sv-plan-btn ${isFeatured ? 'primary' : 'secondary'}`}
                    onClick={() => navigate("/register")}
                  >
                    {p.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="sv-cta">
          <h2 className="sv-cta-title">Start your health journey today</h2>
          <p className="sv-cta-sub">Join thousands of patients managing their health smarter with Carexa.</p>
          <div className="sv-cta-btns">
            <button className="sv-btn-primary" onClick={() => navigate("/register")}>Create Free Account</button>
            <button className="sv-btn-outline" onClick={() => navigate("/contact")}>Talk to Us</button>
          </div>
        </section>

      </div>
    </>
  );
};

export default Service;