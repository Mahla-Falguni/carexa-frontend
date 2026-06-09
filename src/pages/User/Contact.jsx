import React, { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaHeadset, FaCheckCircle } from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1500);
  };

  const contactCards = [
    { icon: <FaEnvelope />, label: "Email Us", value: "info@carexa.com", sub: "We reply within 2 hours", color: "#2f80ed", bg: "#eef5ff" },
    { icon: <FaPhone />, label: "Call Us", value: "+91 98765 43210", sub: "Mon–Sat, 9AM–6PM IST", color: "#27ae60", bg: "#edfaf3" },
    { icon: <FaHeadset />, label: "Live Support", value: "Chat with us", sub: "Available 24/7 for patients", color: "#8e44ad", bg: "#f5eeff" },
    { icon: <FaMapMarkerAlt />, label: "Office", value: "Surat, Gujarat", sub: "Ring Road, Surat 395002", color: "#e67e22", bg: "#fff7ee" },
  ];

  const faqs = [
    { q: "How do I book an appointment?", a: "Go to your dashboard, click 'Book Appointment', search for a doctor or hospital, pick a slot, and confirm. It takes under 2 minutes." },
    { q: "Is my health data secure?", a: "Absolutely. All data is encrypted at rest and in transit using AES-256. We follow ABDM guidelines and never sell your data." },
    { q: "Can I cancel or reschedule an appointment?", a: "Yes, appointments can be cancelled or rescheduled up to 2 hours before the scheduled time from your dashboard." },
    { q: "Is Carexa free to use?", a: "Carexa offers a free Basic plan with core features. Premium plans (Care+ and Family) unlock advanced features like unlimited records and priority booking." },
    { q: "How do I add family members to my account?", a: "Upgrade to the Family plan and go to Profile > Family Members to add up to 6 members with individual health profiles." },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ct-root {
          font-family: 'DM Sans', sans-serif;
          color: #1a2f4a;
          background: #f0f4f8;
        }

        /* HERO */
        .ct-hero {
          background: linear-gradient(135deg, #0b1d3a 0%, #1a3a6e 55%, #2f80ed 100%);
          padding: 100px 80px 80px;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .ct-hero::before {
          content: ''; position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          background: rgba(255,255,255,0.04);
          top: -180px; right: -100px;
        }
        .ct-hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 20px; padding: 6px 18px;
          font-size: 12px; color: rgba(255,255,255,0.75);
          letter-spacing: 1px; text-transform: uppercase;
          margin-bottom: 24px; position: relative; z-index: 1;
        }
        .ct-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 54px; font-weight: 700; color: #fff;
          line-height: 1.1; margin-bottom: 20px;
          position: relative; z-index: 1;
        }
        .ct-hero-title span { color: #56aef8; }
        .ct-hero-sub {
          font-size: 17px; color: rgba(255,255,255,0.65);
          font-weight: 300; line-height: 1.7;
          max-width: 520px; margin: 0 auto;
          position: relative; z-index: 1;
        }

        /* CONTACT CARDS */
        .ct-section { padding: 72px 80px; }
        .ct-section.alt { background: #fff; }
        .ct-section-label {
          font-size: 11px; font-weight: 600; color: #2f80ed;
          text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;
        }
        .ct-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px; font-weight: 700; color: #0b1d3a;
          margin-bottom: 12px; line-height: 1.2;
        }
        .ct-section-sub {
          font-size: 15px; color: #7a8fa6; font-weight: 300; line-height: 1.7;
          max-width: 520px;
        }
        .ct-section-head { margin-bottom: 40px; }
        .ct-section-head.center { text-align: center; }
        .ct-section-head.center .ct-section-sub { margin: 0 auto; }

        .ct-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        .ct-card {
          background: #fff;
          border-radius: 18px;
          padding: 26px 22px;
          border: 1.5px solid #e8f0f8;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex; flex-direction: column; gap: 10px;
        }
        .ct-card:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(11,29,58,0.08); }
        .ct-card-icon {
          width: 50px; height: 50px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }
        .ct-card-label { font-size: 12px; color: #a0b0c8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .ct-card-value { font-size: 16px; font-weight: 600; color: #0b1d3a; }
        .ct-card-sub { font-size: 12px; color: #7a8fa6; font-weight: 300; }

        /* FORM + MAP GRID */
        .ct-main-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 32px;
          align-items: start;
        }
        .ct-form-card {
          background: #fff;
          border-radius: 20px;
          padding: 36px 32px;
          border: 1.5px solid #e8f0f8;
          box-shadow: 0 4px 20px rgba(11,29,58,0.05);
        }
        .ct-form-title {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 700; color: #0b1d3a;
          margin-bottom: 6px;
        }
        .ct-form-sub { font-size: 13px; color: #7a8fa6; font-weight: 300; margin-bottom: 28px; }

        .ct-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .ct-field { margin-bottom: 16px; }
        .ct-label {
          display: block; font-size: 12px; font-weight: 500;
          color: #3d5170; margin-bottom: 7px; letter-spacing: 0.3px;
        }
        .ct-input, .ct-select, .ct-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #d8e4f0;
          border-radius: 11px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: #1a2f4a;
          background: #fff; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ct-input::placeholder, .ct-textarea::placeholder { color: #b0c0d4; }
        .ct-input:focus, .ct-select:focus, .ct-textarea:focus {
          border-color: #2f80ed;
          box-shadow: 0 0 0 4px rgba(47,128,237,0.10);
        }
        .ct-textarea { resize: vertical; min-height: 120px; }

        .ct-submit {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #1558b0, #2f80ed);
          color: #fff; border: none; border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 500;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(47,128,237,0.35);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 8px;
        }
        .ct-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(47,128,237,0.40); }
        .ct-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .ct-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ct-success {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 24px; text-align: center; gap: 14px;
        }
        .ct-success-icon { font-size: 52px; color: #27ae60; }
        .ct-success-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: #0b1d3a;
        }
        .ct-success-sub { font-size: 14px; color: #7a8fa6; font-weight: 300; line-height: 1.6; }

        /* RIGHT INFO */
        .ct-info-panel { display: flex; flex-direction: column; gap: 20px; }
        .ct-info-card {
          background: #fff;
          border-radius: 18px;
          padding: 24px;
          border: 1.5px solid #e8f0f8;
        }
        .ct-info-title {
          font-size: 15px; font-weight: 600; color: #0b1d3a;
          margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
        }
        .ct-hours { display: flex; flex-direction: column; gap: 10px; }
        .ct-hour-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 13px;
        }
        .ct-hour-day { color: #3d5170; font-weight: 400; }
        .ct-hour-time { color: #7a8fa6; font-weight: 300; }
        .ct-hour-badge {
          font-size: 11px; background: #edfaf3;
          color: #27ae60; border-radius: 20px;
          padding: 2px 10px; font-weight: 500;
        }
        .ct-hour-badge.closed { background: #fff5f5; color: #e74c3c; }
        .ct-map-placeholder {
          width: 100%; height: 180px;
          background: linear-gradient(135deg, #eef5ff, #e8f0f8);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 8px;
          border: 1.5px solid #d8e4f0;
        }
        .ct-map-icon { font-size: 32px; opacity: 0.4; }
        .ct-map-text { font-size: 13px; color: #a0b0c8; font-weight: 300; }

        /* FAQ */
        .ct-faqs { display: flex; flex-direction: column; gap: 12px; }
        .ct-faq {
          background: #fff;
          border-radius: 14px;
          border: 1.5px solid #e8f0f8;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .ct-faq:hover { box-shadow: 0 6px 20px rgba(11,29,58,0.06); }
        .ct-faq-q {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px;
          cursor: pointer;
          font-size: 14px; font-weight: 500; color: #0b1d3a;
          user-select: none;
        }
        .ct-faq-chevron {
          font-size: 12px; color: #a0b0c8;
          transition: transform 0.25s;
          flex-shrink: 0;
        }
        .ct-faq-chevron.open { transform: rotate(180deg); color: #2f80ed; }
        .ct-faq-a {
          padding: 0 22px;
          font-size: 13px; color: #7a8fa6;
          font-weight: 300; line-height: 1.7;
          max-height: 0; overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s;
        }
        .ct-faq-a.open {
          max-height: 200px;
          padding-bottom: 18px;
        }

        @media (max-width: 1024px) {
          .ct-cards { grid-template-columns: repeat(2, 1fr); }
          .ct-main-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .ct-hero { padding: 70px 24px 60px; }
          .ct-hero-title { font-size: 36px; }
          .ct-section { padding: 52px 24px; }
          .ct-field-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .ct-cards { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="ct-root">

        {/* HERO */}
        <section className="ct-hero">
          <div className="ct-hero-tag">📞 Contact Us</div>
          <h1 className="ct-hero-title">We're here to <span>help you</span></h1>
          <p className="ct-hero-sub">Whether you have a question, need support, or want to partner with us — our team is always ready to assist.</p>
        </section>

        {/* CONTACT CARDS */}
        <section className="ct-section">
          <div className="ct-section-head center">
            <p className="ct-section-label">Get In Touch</p>
            <h2 className="ct-section-title">Multiple ways to reach us</h2>
          </div>
          <div className="ct-cards">
            {contactCards.map((c) => (
              <div className="ct-card" key={c.label}>
                <div className="ct-card-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                <div className="ct-card-label">{c.label}</div>
                <div className="ct-card-value">{c.value}</div>
                <div className="ct-card-sub">{c.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FORM + INFO */}
        <section className="ct-section alt">
          <div className="ct-section-head">
            <p className="ct-section-label">Send a Message</p>
            <h2 className="ct-section-title">Let's talk</h2>
            <p className="ct-section-sub">Fill in the form and our team will get back to you within a few hours.</p>
          </div>
          <div className="ct-main-grid">

            {/* FORM */}
            <div className="ct-form-card">
              {submitted ? (
                <div className="ct-success">
                  <FaCheckCircle className="ct-success-icon" />
                  <div className="ct-success-title">Message Sent!</div>
                  <p className="ct-success-sub">Thank you for reaching out. Our team will respond to <strong>{formData.email}</strong> within 2 hours.</p>
                </div>
              ) : (
                <>
                  <div className="ct-form-title">Send us a message</div>
                  <div className="ct-form-sub">We read every message and respond promptly.</div>
                  <form onSubmit={handleSubmit}>
                    <div className="ct-field-row">
                      <div>
                        <label className="ct-label">Full Name</label>
                        <input className="ct-input" name="name" placeholder="Your full name" value={formData.name} onChange={handleChange} required />
                      </div>
                      <div>
                        <label className="ct-label">Email Address</label>
                        <input className="ct-input" type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="ct-field">
                      <label className="ct-label">Subject</label>
                      <select className="ct-select" name="subject" value={formData.subject} onChange={handleChange} required>
                        <option value="">Select a topic</option>
                        <option>Appointment Help</option>
                        <option>Technical Support</option>
                        <option>Account & Billing</option>
                        <option>Hospital / Doctor Partnership</option>
                        <option>General Enquiry</option>
                      </select>
                    </div>
                    <div className="ct-field">
                      <label className="ct-label">Message</label>
                      <textarea className="ct-textarea" name="message" placeholder="Tell us how we can help…" value={formData.message} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="ct-submit" disabled={loading}>
                      {loading ? <><div className="ct-spinner" /> Sending…</> : "→  Send Message"}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* RIGHT INFO */}
            <div className="ct-info-panel">
              <div className="ct-info-card">
                <div className="ct-info-title"><FaClock style={{ color: "#2f80ed" }} /> Support Hours</div>
                <div className="ct-hours">
                  {[
                    { day: "Monday – Friday", time: "9:00 AM – 8:00 PM", open: true },
                    { day: "Saturday", time: "9:00 AM – 6:00 PM", open: true },
                    { day: "Sunday", time: "Closed", open: false },
                    { day: "24/7 Emergency Chat", time: "Always available", open: true },
                  ].map(h => (
                    <div className="ct-hour-row" key={h.day}>
                      <span className="ct-hour-day">{h.day}</span>
                      <span className={`ct-hour-badge ${h.open ? '' : 'closed'}`}>{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ct-info-card">
                <div className="ct-info-title"><FaMapMarkerAlt style={{ color: "#e67e22" }} /> Our Office</div>
                <div className="ct-map-placeholder">
                  <div className="ct-map-icon">📍</div>
                  <div className="ct-map-text">Ring Road, Surat, Gujarat 395002</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ */}
        <section className="ct-section">
          <div className="ct-section-head center">
            <p className="ct-section-label">FAQ</p>
            <h2 className="ct-section-title">Frequently Asked Questions</h2>
            <p className="ct-section-sub">Quick answers to the questions patients ask us most often.</p>
          </div>
          <div className="ct-faqs">
            {faqs.map((f, i) => (
              <div className="ct-faq" key={i}>
                <div className="ct-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className={`ct-faq-chevron ${openFaq === i ? 'open' : ''}`}>▼</span>
                </div>
                <div className={`ct-faq-a ${openFaq === i ? 'open' : ''}`}>{f.a}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
};

export default Contact;