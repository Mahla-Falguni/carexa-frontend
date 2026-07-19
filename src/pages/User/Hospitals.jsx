import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, useSearchParams, useOutletContext } from "react-router-dom";
import { getImageUrl, handleImageError } from "../../utils/imageUtils";

import {
  FaHospital, FaMapMarkerAlt, FaSearch, FaArrowRight, FaStar,
  FaPhone, FaEnvelope, FaTimes, FaCheckCircle, FaUserMd,
  FaClock, FaShieldAlt
} from "react-icons/fa";

const Hospitals = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const outletContext = useOutletContext() || {};
  const globalSearch = outletContext.globalSearch || "";

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingHospitalId, setPendingHospitalId] = useState(null);

  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("UserToken");

  useEffect(() => {
    const urlQuery = searchParams.get("search");
    if (urlQuery) setSearch(urlQuery);
  }, [searchParams]);

  // ── Fetch hospitals — no token needed for public view ────────────────────
  const getHospitals = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("UserToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get("https://carexa-backend.vercel.app/api/getHospitals", { headers });
      setHospitals(res.data?.hospitals || []);
    } catch (err) {
      setError("Failed to load hospitals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getHospitals(); }, []);

  // ── Book Now click ───────────────────────────────────────────────────────
  const handleBookNow = (hospitalId) => {

    const token = localStorage.getItem("UserToken");

    if (token) {

      // User logged in
      navigate(`/userdashboard/hospitals/${hospitalId}/doctors`);

    } else {

      // Save hospital id for redirect after login
      localStorage.setItem("pendingHospitalId", hospitalId);

      // Redirect to login page
      navigate("/login");
    }
  };

  // ── Details click ────────────────────────────────────────────────────────
  const handleDetails = (hospital) => {
    setSelectedHospital(hospital);
    setShowLoginPrompt(false);
    setShowModal(true);
  };

  const activeSearch = (globalSearch || search).trim().toLowerCase();

  const filtered = hospitals.filter((h) => {
    if (!activeSearch) return true;
    return (
      (h.hospital_name || "").toLowerCase().includes(activeSearch) ||
      (h.hospital_address || "").toLowerCase().includes(activeSearch) ||
      (h.hospital_city || "").toLowerCase().includes(activeSearch) ||
      (h.hospital_state || "").toLowerCase().includes(activeSearch) ||
      (h.hospital_email || "").toLowerCase().includes(activeSearch) ||
      (h.hospital_phone || "").includes(activeSearch)
    );
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .hp-root { font-family: 'DM Sans', sans-serif; color: #1a2f4a; min-height: 100vh; background: #f0f4f8; }

        /* Hero */
        .hp-hero { background: linear-gradient(135deg, #0b1d3a 0%, #1a3a6e 55%, #2f80ed 100%); padding: 52px 48px 60px; position: relative; overflow: hidden; }
        .hp-hero::before { content: ''; position: absolute; width: 400px; height: 400px; border-radius: 50%; background: rgba(255,255,255,0.04); top: -140px; right: -80px; }
        .hp-hero::after  { content: ''; position: absolute; width: 200px; height: 200px; border-radius: 50%; background: rgba(255,255,255,0.03); bottom: -60px; left: 30%; }
        .hp-hero-inner { position: relative; z-index: 1; max-width: 600px; }
        .hp-hero-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.18); border-radius: 20px; padding: 5px 16px; font-size: 12px; color: rgba(255,255,255,0.75); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 18px; }
        .hp-hero-title { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 700; color: #fff; line-height: 1.15; margin-bottom: 12px; }
        .hp-hero-title span { color: #56aef8; }
        .hp-hero-sub { font-size: 15px; color: rgba(255,255,255,0.60); font-weight: 300; line-height: 1.7; margin-bottom: 28px; }
        .hp-search-wrap { position: relative; max-width: 520px; }
        .hp-search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); font-size: 15px; color: #a0b0c8; pointer-events: none; }
        .hp-search { width: 100%; padding: 14px 20px 14px 48px; border-radius: 14px; border: 1.5px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.10); backdrop-filter: blur(8px); font-family: 'DM Sans', sans-serif; font-size: 14px; color: #fff; outline: none; transition: border-color 0.2s, background 0.2s; }
        .hp-search::placeholder { color: rgba(255,255,255,0.45); }
        .hp-search:focus { border-color: rgba(255,255,255,0.40); background: rgba(255,255,255,0.15); }
        .hp-hero-stats { display: flex; gap: 28px; margin-top: 28px; flex-wrap: wrap; }
        .hp-hero-stat-num { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #fff; }
        .hp-hero-stat-lbl { font-size: 12px; color: rgba(255,255,255,0.55); font-weight: 300; }
        .hp-hero-stat-div { width: 1px; height: 32px; background: rgba(255,255,255,0.15); }

        /* Body & Grid */
        .hp-body { padding: 36px 48px 56px; }
        .hp-results-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .hp-results-text { font-size: 14px; color: #7a8fa6; font-weight: 300; }
        .hp-results-text strong { color: #0b1d3a; font-weight: 600; }
        .hp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

        /* Cards */
        .hp-card { background: #fff; border-radius: 18px; border: 1.5px solid #e8f0f8; overflow: hidden; transition: transform 0.22s, box-shadow 0.22s; display: flex; flex-direction: column; }
        .hp-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(11,29,58,0.10); }
        .hp-card-img-wrap { position: relative; overflow: hidden; height: 175px; }
        .hp-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s; }
        .hp-card:hover .hp-card-img { transform: scale(1.06); }
        .hp-card-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(11,29,58,0.50) 0%, transparent 60%); }
        .hp-card-badge { position: absolute; top: 12px; left: 12px; background: linear-gradient(135deg, #1558b0, #2f80ed); color: #fff; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 500; box-shadow: 0 3px 10px rgba(47,128,237,0.35); }
        .hp-card-rating { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.95); border-radius: 20px; padding: 4px 10px; display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #f39c12; }
        .hp-card-body { padding: 18px 18px 16px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .hp-card-name { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #0b1d3a; line-height: 1.3; }
        .hp-card-addr { display: flex; align-items: flex-start; gap: 7px; font-size: 12px; color: #7a8fa6; font-weight: 300; line-height: 1.5; }
        .hp-addr-icon { color: #e74c3c; flex-shrink: 0; margin-top: 2px; font-size: 11px; }
        .hp-card-divider { height: 1px; background: #f0f4f8; margin: 4px 0; }
        .hp-card-btns { display: flex; gap: 8px; margin-top: 4px; }
        .hp-btn-view { flex: 1; padding: 9px 10px; border: 1.5px solid #d8e4f0; border-radius: 10px; background: #fff; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; color: #3d5170; cursor: pointer; transition: border-color 0.2s, color 0.2s, background 0.2s; display: flex; align-items: center; justify-content: center; gap: 5px; }
        .hp-btn-view:hover { border-color: #2f80ed; color: #2f80ed; background: #f0f7ff; }
        .hp-btn-book { flex: 1.2; padding: 9px 10px; background: linear-gradient(135deg, #1558b0, #2f80ed); color: #fff; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; box-shadow: 0 4px 14px rgba(47,128,237,0.28); transition: transform 0.15s, box-shadow 0.15s; display: flex; align-items: center; justify-content: center; gap: 5px; }
        .hp-btn-book:hover { transform: translateY(-1px); box-shadow: 0 7px 20px rgba(47,128,237,0.35); }

        /* Loading / Error / Empty */
        .hp-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; gap: 16px; }
        .hp-loader { width: 44px; height: 44px; border: 3px solid #e8f0f8; border-top-color: #2f80ed; border-radius: 50%; animation: hpspin 0.75s linear infinite; }
        @keyframes hpspin { to { transform: rotate(360deg); } }
        .hp-loading-text { font-size: 14px; color: #a0b0c8; font-weight: 300; }
        .hp-error { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; gap: 12px; text-align: center; }
        .hp-error-icon { font-size: 40px; opacity: 0.3; }
        .hp-error-text { font-size: 15px; color: #e74c3c; }
        .hp-retry { margin-top: 8px; padding: 10px 24px; background: linear-gradient(135deg, #1558b0, #2f80ed); color: #fff; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; }
        .hp-empty { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; gap: 12px; text-align: center; }
        .hp-empty-icon { font-size: 48px; opacity: 0.20; }
        .hp-empty-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #0b1d3a; }
        .hp-empty-sub { font-size: 14px; color: #a0b0c8; }

        /* Skeleton */
        .hp-skeleton-card { background: #fff; border-radius: 18px; border: 1.5px solid #e8f0f8; overflow: hidden; }
        .hp-skel { background: linear-gradient(90deg, #f0f4f8 25%, #e4ecf4 50%, #f0f4f8 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px; }
        @keyframes shimmer { to { background-position: -200% 0; } }
        .hp-skel-img { height: 175px; border-radius: 0; }
        .hp-skel-body { padding: 18px; display: flex; flex-direction: column; gap: 10px; }

        /* Modals shared */
        .modal-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(8px); background: rgba(11,29,58,0.60); }
        .modal-box { background: #fff; border-radius: 24px; width: 100%; max-width: 560px; overflow: hidden; box-shadow: 0 24px 64px rgba(11,29,58,0.20); animation: popIn 0.25s ease; }
        @keyframes popIn { from { opacity:0; transform: scale(0.95) translateY(12px); } to { opacity:1; transform: scale(1) translateY(0); } }
        .modal-img { width: 100%; height: 220px; object-fit: cover; }
        .modal-body { padding: 28px; }
        .modal-badge { display: inline-flex; align-items: center; gap: 6px; background: #eaf4ff; color: #2f80ed; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; }
        .modal-name { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #0b1d3a; margin-bottom: 16px; }
        .modal-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .modal-info-item { background: #f8fafc; border-radius: 12px; padding: 12px 14px; border: 1px solid #e8f0f8; }
        .modal-info-label { font-size: 11px; color: #a0b0c8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .modal-info-value { font-size: 13px; color: #1a2f4a; font-weight: 500; }
        .modal-btns { display: flex; gap: 10px; }
        .modal-btn-close { flex: 1; padding: 12px; border: 1.5px solid #d8e4f0; border-radius: 12px; background: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #3d5170; cursor: pointer; transition: background 0.2s; }
        .modal-btn-close:hover { background: #f0f4f8; }
        .modal-btn-book { flex: 1.5; padding: 12px; background: linear-gradient(135deg, #1558b0, #2f80ed); color: #fff; border: none; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 14px rgba(47,128,237,0.30); transition: transform 0.15s; }
        .modal-btn-book:hover { transform: translateY(-1px); }
        .modal-close-x { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.90); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #1a2f4a; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }

        /* Login prompt modal */
        .lp-box { background: #fff; border-radius: 24px; width: 100%; max-width: 420px; overflow: hidden; box-shadow: 0 24px 64px rgba(11,29,58,0.20); animation: popIn 0.25s ease; }
        .lp-header { background: linear-gradient(135deg, #0b1d3a, #1a3a6e); padding: 32px 28px 24px; text-align: center; }
        .lp-icon { width: 60px; height: 60px; background: rgba(255,255,255,0.12); border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 26px; }
        .lp-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .lp-sub { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.6; }
        .lp-body { padding: 24px 28px 28px; }
        .lp-benefits { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .lp-benefit { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #f8fafc; border-radius: 12px; border: 1px solid #e8f0f8; }
        .lp-benefit-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .lp-benefit-text { font-size: 13px; color: #3d5170; font-weight: 500; }
        .lp-benefit-sub  { font-size: 11px; color: #a0b0c8; margin-top: 1px; }
        .lp-btn-login { width: 100%; padding: 13px; background: linear-gradient(135deg, #1558b0, #2f80ed); color: #fff; border: none; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 16px rgba(47,128,237,0.30); transition: transform 0.15s; margin-bottom: 10px; }
        .lp-btn-login:hover { transform: translateY(-1px); }
        .lp-btn-register { width: 100%; padding: 12px; background: #fff; color: #1558b0; border: 1.5px solid #d8e4f0; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-bottom: 10px; }
        .lp-btn-register:hover { background: #f0f7ff; }
        .lp-btn-cancel { width: 100%; padding: 10px; background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #a0b0c8; cursor: pointer; }
        .lp-btn-cancel:hover { color: #3d5170; }

        @media (max-width: 1200px) { .hp-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 900px)  { .hp-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px)  {
          .hp-hero { padding: 36px 20px 44px; } .hp-hero-title { font-size: 30px; }
          .hp-body { padding: 24px 16px 40px; } .hp-grid { grid-template-columns: 1fr; }
          .modal-info-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="hp-root">

        {/* ── HERO ── */}
        <div className="hp-hero">
          <div className="hp-hero-inner">
            <div className="hp-hero-tag">🏥 Hospitals</div>
            <h1 className="hp-hero-title">Find the right<br /><span>hospital for you</span></h1>
            <p className="hp-hero-sub">
              Browse from {hospitals.length > 0 ? `${hospitals.length}+` : "hundreds of"} verified partner hospitals and book your appointment in minutes.
            </p>
            <div className="hp-search-wrap">
              <FaSearch className="hp-search-icon" />
              <input className="hp-search"
                placeholder="Search by hospital name or location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)} />
            </div>
            {hospitals.length > 0 && (
              <div className="hp-hero-stats">
                <div>
                  <div className="hp-hero-stat-num">{hospitals.length}+</div>
                  <div className="hp-hero-stat-lbl">Partner Hospitals</div>
                </div>
                <div className="hp-hero-stat-div" />
                <div>
                  <div className="hp-hero-stat-num">24/7</div>
                  <div className="hp-hero-stat-lbl">Emergency Care</div>
                </div>
                <div className="hp-hero-stat-div" />
                <div>
                  <div className="hp-hero-stat-num">100%</div>
                  <div className="hp-hero-stat-lbl">Verified</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="hp-body">

          {/* Loading skeletons */}
          {loading && (
            <div className="hp-grid">
              {[...Array(8)].map((_, i) => (
                <div className="hp-skeleton-card" key={i}>
                  <div className="hp-skel hp-skel-img" />
                  <div className="hp-skel-body">
                    <div className="hp-skel" style={{ height: 18, width: "70%" }} />
                    <div className="hp-skel" style={{ height: 13, width: "90%" }} />
                    <div className="hp-skel" style={{ height: 13, width: "55%" }} />
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <div className="hp-skel" style={{ height: 34, flex: 1 }} />
                      <div className="hp-skel" style={{ height: 34, flex: 1.2 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="hp-error">
              <div className="hp-error-icon">🏥</div>
              <p className="hp-error-text">{error}</p>
              <button className="hp-retry" onClick={getHospitals}>Try Again</button>
            </div>
          )}

          {/* Hospital cards */}
          {!loading && !error && (
            <>
              <div className="hp-results-bar">
                <p className="hp-results-text">
                  Showing <strong>{filtered.length}</strong> hospital{filtered.length !== 1 ? "s" : ""}
                  {search && <> for "<strong>{search}</strong>"</>}
                </p>
              </div>

              <div className="hp-grid">
                {filtered.length > 0 ? filtered.map((hospital) => (
                  <div className="hp-card" key={hospital._id}>
                    <div className="hp-card-img-wrap">
                      <img className="hp-card-img"
                        src={getImageUrl(hospital.hospital_img, 'hospital')}
                        alt={hospital.hospital_name}
                        onError={(e) => handleImageError(e, 'hospital')} />
                      <div className="hp-card-img-overlay" />
                      <div className="hp-card-badge">Verified ✓</div>
                      <div className="hp-card-rating"><FaStar size={10} /> 4.5</div>
                    </div>

                    <div className="hp-card-body">
                      <div className="hp-card-name">{hospital.hospital_name}</div>
                      <div className="hp-card-addr">
                        <FaMapMarkerAlt className="hp-addr-icon" />
                        {hospital.hospital_address}
                      </div>
                      <div className="hp-card-divider" />
                      <div className="hp-card-btns">
                        {/* Details — always visible, no login needed */}
                        <button className="hp-btn-view" onClick={() => handleDetails(hospital)}>
                          Details
                        </button>
                        {/* Book — triggers login prompt if not logged in */}
                        <button className="hp-btn-book" onClick={() => handleBookNow(hospital._id)}>
                          {isLoggedIn ? "Book Now" : "Book Now"} <FaArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="hp-empty">
                    <div className="hp-empty-icon">🏥</div>
                    <div className="hp-empty-title">No hospitals found</div>
                    <p className="hp-empty-sub">
                      {search ? `No results for "${search}".` : "No hospitals available."}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── HOSPITAL DETAILS MODAL ── */}
      {showModal && selectedHospital && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>

            <div style={{ position: "relative" }}>
              <img className="modal-img"
                src={getImageUrl(selectedHospital.hospital_img, 'hospital')}
                alt={selectedHospital.hospital_name}
                onError={(e) => handleImageError(e, 'hospital')} />
              <button className="modal-close-x" onClick={() => setShowModal(false)}>
                <FaTimes size={14} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-badge"><FaCheckCircle size={10} /> Verified Hospital</div>
              <div className="modal-name">{selectedHospital.hospital_name}</div>

              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <div className="modal-info-label">📍 Address</div>
                  <div className="modal-info-value">{selectedHospital.hospital_address || "—"}</div>
                </div>
                <div className="modal-info-item">
                  <div className="modal-info-label">📞 Phone</div>
                  <div className="modal-info-value">{selectedHospital.hospital_phone || "—"}</div>
                </div>
                <div className="modal-info-item">
                  <div className="modal-info-label">✉️ Email</div>
                  <div className="modal-info-value">{selectedHospital.hospital_email || "—"}</div>
                </div>
                <div className="modal-info-item">
                  <div className="modal-info-label">⭐ Rating</div>
                  <div className="modal-info-value" style={{ color: "#f39c12", fontWeight: 700 }}>4.5 / 5.0</div>
                </div>
              </div>

              <div className="modal-btns">
                <button className="modal-btn-close" onClick={() => setShowModal(false)}>Close</button>
                {/* Book from modal also checks login */}
                <button className="modal-btn-book"
                  onClick={() => handleBookNow(selectedHospital._id)}>
                  {isLoggedIn ? "Book Appointment" : "Login to Book"} <FaArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LOGIN PROMPT MODAL ── */}
      {showLoginPrompt && (
        <div className="modal-overlay" onClick={() => setShowLoginPrompt(false)}>
          <div className="lp-box" onClick={e => e.stopPropagation()}>

            <div className="lp-header">
              <div className="lp-icon">🔐</div>
              <div className="lp-title">Login to Book</div>
              <p className="lp-sub">
                Create a free account or log in to book appointments and manage your health records.
              </p>
            </div>

            <div className="lp-body">
              <div className="lp-benefits">
                <div className="lp-benefit">
                  <div className="lp-benefit-icon" style={{ background: "#eaf4ff" }}>
                    <FaUserMd size={14} color="#2f80ed" />
                  </div>
                  <div>
                    <div className="lp-benefit-text">Browse Doctors</div>
                    <div className="lp-benefit-sub">View all available doctors and their slots</div>
                  </div>
                </div>
                <div className="lp-benefit">
                  <div className="lp-benefit-icon" style={{ background: "#edf9f0" }}>
                    <FaClock size={14} color="#27ae60" />
                  </div>
                  <div>
                    <div className="lp-benefit-text">Instant Booking</div>
                    <div className="lp-benefit-sub">Book and manage appointments anytime</div>
                  </div>
                </div>
                <div className="lp-benefit">
                  <div className="lp-benefit-icon" style={{ background: "#fef9ec" }}>
                    <FaShieldAlt size={14} color="#f39c12" />
                  </div>
                  <div>
                    <div className="lp-benefit-text">Secure & Private</div>
                    <div className="lp-benefit-sub">Your health data stays protected</div>
                  </div>
                </div>
              </div>

              <button className="lp-btn-login"
                onClick={() => {
                  setShowLoginPrompt(false);
                  // After login, redirect back with hospital context
                  navigate(`/login?redirect=/userdashboard/hospitals/${pendingHospitalId}/doctors`);
                }}>
                Login to My Account
              </button>

              <button className="lp-btn-register"
                onClick={() => {
                  setShowLoginPrompt(false);
                  navigate("/register");
                }}>
                Create Free Account
              </button>

              <button className="lp-btn-cancel" onClick={() => setShowLoginPrompt(false)}>
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Hospitals;