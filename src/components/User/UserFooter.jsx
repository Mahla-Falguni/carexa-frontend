import React from 'react'

const UserFooter = () => {
  const year = new Date().getFullYear()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500&display=swap');

        .uf-root {
          background: #08045b;
          border-top: 1.5px solid #07294b;
          font-family: 'DM Sans', sans-serif;
        }

        .uf-top {
          max-width: 1200px;
          margin: 0 auto;
          padding: 36px 32px 28px;
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1fr;
          gap: 32px;
        }

        .uf-brand-col {}
        .uf-brand {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 14px;
        }
        .uf-brand-icon {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #1558b0, #2f80ed);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .uf-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
        }
        .uf-brand-desc {
          font-size: 13px;
          color: #e7eaed;
          line-height: 1.7;
          font-weight: 300;
          max-width: 230px;
        }
        .uf-socials {
          display: flex; gap: 10px;
          margin-top: 16px;
        }
        .uf-social-btn {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: #f0f4f8;
          border: none;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          text-decoration: none;
        }
        .uf-social-btn:hover {
          background: #dceaf8;
          transform: translateY(-2px);
        }

        .uf-col-title {
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 14px;
        }
        .uf-links {
          display: flex; flex-direction: column; gap: 9px;
        }
        .uf-link {
          font-size: 13px;
          color: #cfd4d8;
          text-decoration: none;
          font-weight: 300;
          transition: color 0.2s;
        }
        .uf-link:hover { color: #2f80ed; }

        .uf-contact-item {
          display: flex; align-items: flex-start; gap: 8px;
          font-size: 13px; color: #e4e6ea;
          font-weight: 300;
          margin-bottom: 9px;
          line-height: 1.4;
        }
        .uf-contact-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }

        /* Bottom bar */
        .uf-bottom {
          border-top: 1px solid #f0f4f8;
          padding: 16px 32px;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }
        .uf-copy {
          font-size: 12px;
          color: #a0b0c8;
          font-weight: 300;
        }
        .uf-copy span { color: #2f80ed; font-weight: 500; }

        .uf-badges {
          display: flex; align-items: center; gap: 10px;
        }
        .uf-badge {
          font-size: 11px;
          color: #a0b0c8;
          background: #f5f9ff;
          border: 1px solid #e0ecfa;
          border-radius: 20px;
          padding: 3px 10px;
          font-weight: 400;
        }

        @media (max-width: 768px) {
          .uf-top {
            grid-template-columns: 1fr 1fr;
            padding: 28px 20px 20px;
          }
          .uf-bottom { padding: 14px 20px; }
        }
        @media (max-width: 480px) {
          .uf-top { grid-template-columns: 1fr; }
        }
      `}</style>

      <footer className="uf-root">
        <div className="uf-top">

          {/* Brand column */}
          <div className="uf-brand-col">
            <div className="uf-brand">
              <div className="uf-brand-icon">🏥</div>
              <span className="uf-brand-name">Carexa</span>
            </div>
            <p className="uf-brand-desc">
              Your trusted patient portal for seamless healthcare management — appointments, records, and more.
            </p>
            <div className="uf-socials">
              <a href="#" className="uf-social-btn" aria-label="Facebook">📘</a>
              <a href="#" className="uf-social-btn" aria-label="Instagram">📸</a>
              <a href="#" className="uf-social-btn" aria-label="Twitter">🐦</a>
              <a href="#" className="uf-social-btn" aria-label="LinkedIn">💼</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="uf-col-title">Quick Links</p>
            <div className="uf-links">
              <a href="/UserDashboard" className="uf-link">Dashboard</a>
              <a href="/UserDashboard/appointments" className="uf-link">Appointments</a>
              <a href="/UserDashboard/hospitals" className="uf-link">Hospitals</a>
              <a href="/UserDashboard/medical-records" className="uf-link">Medical Records</a>
            </div>
          </div>

          {/* Support */}
          <div>
            <p className="uf-col-title">Support</p>
            <div className="uf-links">
              <a href="#" className="uf-link">Help Center</a>
              <a href="#" className="uf-link">Privacy Policy</a>
              <a href="#" className="uf-link">Terms of Service</a>
              <a href="#" className="uf-link">Accessibility</a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="uf-col-title">Contact Us</p>
            <div className="uf-contact-item">
              <span className="uf-contact-icon">✉️</span>
              info@carexa.com
            </div>
            <div className="uf-contact-item">
              <span className="uf-contact-icon">📞</span>
              +91 9726560648
            </div>
            <div className="uf-contact-item">
              <span className="uf-contact-icon">🕐</span>
              Mon – Sat, 9AM – 6PM
            </div>
            <div className="uf-contact-item">
              <span className="uf-contact-icon">📍</span>
              Gujarat, India
            </div>
          </div>

        </div>

        <div className="uf-bottom">
          <p className="uf-copy">
            © {year} <span>Carexa</span>. Designed and Develpoed bu Survivor Infotch. ❤️
          </p>
          <div className="uf-badges">
            <span className="uf-badge">🔒 HIPAA Compliant</span>
            <span className="uf-badge">✅ Verified Platform</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export default UserFooter