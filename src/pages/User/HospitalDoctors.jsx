import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
    FaUserMd, FaArrowLeft, FaCalendarAlt, FaClock,
    FaSearch, FaStar, FaTimes, FaCheckCircle, FaPhone,
    FaEnvelope, FaBriefcase, FaGraduationCap, FaMapMarkerAlt
} from "react-icons/fa";

const HospitalDoctors = () => {
    const { hospitalId } = useParams();
    const navigate       = useNavigate();

    const [hospital,       setHospital]       = useState(null);
    const [doctors,        setDoctors]        = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [search,         setSearch]         = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [slots,          setSlots]          = useState([]);
    const [slotsLoading,   setSlotsLoading]   = useState(false);
    const [showSlotModal,  setShowSlotModal]  = useState(false);
    const [showDoctorModal,setShowDoctorModal]= useState(false);
    const [booking,        setBooking]        = useState(false);
    const [bookingSlotId,  setBookingSlotId]  = useState(null);

    const token    = localStorage.getItem("UserToken");
    const headers  = { Authorization: `Bearer ${token}` };

    // ── Auth guard — redirect to login if no token ───────────────────────
    useEffect(() => {
        if (!token) {
            navigate(`/login?redirect=/userdashboard/hospitals/${hospitalId}/doctors`, { replace: true });
        }
    }, [token, hospitalId, navigate]);

    useEffect(() => {
        if (token) fetchDoctors();
    }, [hospitalId, token]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const [hosRes, docRes] = await Promise.all([
                axios.get("https://carexa-backend.vercel.app/api/getHospitals"),
                axios.get(`https://carexa-backend.vercel.app/api/getDoctors/${hospitalId}`, { headers })
            ]);
            const hosp = hosRes.data?.hospitals?.find(h => h._id === hospitalId);
            setHospital(hosp || null);
            setDoctors(docRes.data?.doctors || []);
        } catch (err) {
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                // Token expired or invalid — redirect to login
                navigate(`/login?redirect=/userdashboard/hospitals/${hospitalId}/doctors`, { replace: true });
            }
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (e, doctor) => {
        e.stopPropagation();
        setSelectedDoctor(doctor);
        setShowDoctorModal(true);
    };

    const handleSelectDoctor = async (doctor) => {
        setSelectedDoctor(doctor);
        setShowSlotModal(true);
        setSlotsLoading(true);
        setSlots([]);
        setBookingSlotId(null);
        try {
            const res = await axios.get(
                `https://carexa-backend.vercel.app/api/view-slots/${hospitalId}/${doctor._id}`,
                { headers }
            );
            setSlots(res.data?.slots || []);
        } catch (err) {
            setSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleBookSlot = async (slot) => {
        if (bookingSlotId === slot._id) return;
        setBooking(true);
        setBookingSlotId(slot._id);
        try {
            await axios.post(
                "https://carexa-backend.vercel.app/api/Book-Appointment",
                { slotId: slot._id },
                { headers }
            );
            setShowSlotModal(false);
            Swal.fire({
                icon: "success",
                title: "Appointment Booked!",
                html: `<p>Your appointment with <b>${selectedDoctor.name}</b> is confirmed.</p>
                       <p style="margin-top:8px;color:#666;font-size:14px">
                         ${new Date(slot.appointment_date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })} at ${slot.start_time}
                       </p>`,
                confirmButtonColor: "#2f80ed",
                confirmButtonText: "View My Appointments"
            }).then(r => { if (r.isConfirmed) navigate("/userdashboard/appointments"); });
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Booking failed", "error");
        } finally {
            setBooking(false);
            setBookingSlotId(null);
        }
    };

    const filtered = doctors.filter(d =>
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
    };

    // Don't render anything if no token (redirect is happening)
    if (!token) return null;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                .hd-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f0f4f8; color: #1a2f4a; }
                .hd-hero { background: linear-gradient(135deg, #0b1d3a 0%, #1a3a6e 55%, #2f80ed 100%); padding: 36px 48px 44px; position: relative; overflow: hidden; }
                .hd-hero::before { content: ''; position: absolute; width: 300px; height: 300px; border-radius: 50%; background: rgba(255,255,255,0.04); top: -100px; right: -60px; }
                .hd-back { display: inline-flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.70); font-size: 13px; cursor: pointer; margin-bottom: 20px; transition: color 0.2s; border: none; background: none; }
                .hd-back:hover { color: #fff; }
                .hd-hosp-name { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #fff; margin-bottom: 6px; }
                .hd-sub { font-size: 14px; color: rgba(255,255,255,0.55); margin-bottom: 24px; }
                .hd-search-wrap { position: relative; max-width: 420px; }
                .hd-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #a0b0c8; pointer-events: none; }
                .hd-search { width: 100%; padding: 12px 16px 12px 44px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.10); backdrop-filter: blur(8px); font-family: 'DM Sans', sans-serif; font-size: 14px; color: #fff; outline: none; }
                .hd-search::placeholder { color: rgba(255,255,255,0.40); }
                .hd-search:focus { border-color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.15); }
                .hd-body { padding: 32px 48px 56px; }
                .hd-count { font-size: 14px; color: #7a8fa6; margin-bottom: 20px; }
                .hd-count strong { color: #0b1d3a; }
                .hd-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
                .hd-card { background: #fff; border-radius: 18px; border: 1.5px solid #e8f0f8; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
                .hd-card:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(11,29,58,0.10); border-color: #bfd8f8; }
                .hd-card-top { background: linear-gradient(135deg, #0b1d3a, #1a3a6e); padding: 24px 20px 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; position: relative; }
                .hd-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.3); }
                .hd-avatar-placeholder { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #1558b0, #2f80ed); display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.2); }
                .hd-name { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: #fff; text-align: center; }
                .hd-spec { font-size: 11px; color: #7dd3fc; font-weight: 500; background: rgba(255,255,255,0.10); padding: 3px 10px; border-radius: 20px; }
                .hd-rating { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #fbbf24; font-weight: 600; }
                .hd-card-body { padding: 14px 16px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
                .hd-info-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #5a7294; }
                .hd-info-icon { color: #2f80ed; flex-shrink: 0; }
                .hd-card-divider { height: 1px; background: #f0f4f8; margin: 4px 0; }
                .hd-card-btns { display: flex; gap: 8px; padding: 0 16px 16px; }
                .hd-btn-details { flex: 1; padding: 9px; border: 1.5px solid #d8e4f0; border-radius: 10px; background: #fff; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; color: #3d5170; cursor: pointer; transition: all 0.2s; }
                .hd-btn-details:hover { border-color: #2f80ed; color: #2f80ed; background: #f0f7ff; }
                .hd-btn-book { flex: 1.2; padding: 9px; background: linear-gradient(135deg, #1558b0, #2f80ed); color: #fff; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; box-shadow: 0 4px 12px rgba(47,128,237,0.25); transition: transform 0.15s; }
                .hd-btn-book:hover { transform: translateY(-1px); }
                .hd-empty { grid-column: 1/-1; text-align: center; padding: 60px 24px; }
                .hd-empty-icon { font-size: 48px; opacity: 0.2; margin-bottom: 12px; }
                .hd-empty-text { font-size: 16px; color: #7a8fa6; }
                .hd-loader { width: 44px; height: 44px; border: 3px solid #e8f0f8; border-top-color: #2f80ed; border-radius: 50%; animation: spin 0.75s linear infinite; margin: 80px auto; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .modal-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(8px); background: rgba(11,29,58,0.60); }
                @keyframes popIn { from { opacity:0; transform: scale(0.95) translateY(12px); } to { opacity:1; transform: scale(1) translateY(0); } }
                .doc-modal { background: #fff; border-radius: 24px; width: 100%; max-width: 500px; overflow: hidden; box-shadow: 0 24px 64px rgba(11,29,58,0.20); animation: popIn 0.25s ease; }
                .doc-modal-top { background: linear-gradient(135deg, #0b1d3a, #1a3a6e); padding: 28px 24px; display: flex; gap: 18px; align-items: center; position: relative; }
                .doc-modal-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.25); flex-shrink: 0; }
                .doc-modal-avatar-ph { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg,#1558b0,#2f80ed); display:flex; align-items:center; justify-content:center; border: 3px solid rgba(255,255,255,0.2); flex-shrink:0; }
                .doc-modal-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 4px; }
                .doc-modal-spec { font-size: 12px; color: #7dd3fc; background: rgba(255,255,255,0.10); padding: 3px 10px; border-radius: 20px; display: inline-block; margin-bottom: 8px; }
                .doc-modal-rating { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #fbbf24; font-weight: 600; }
                .doc-modal-close { position: absolute; top: 14px; right: 14px; width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.15); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; }
                .doc-modal-body { padding: 22px 24px; }
                .doc-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
                .doc-info-card { background: #f8fafc; border-radius: 12px; padding: 12px 14px; border: 1px solid #e8f0f8; }
                .doc-info-label { font-size: 10px; color: #a0b0c8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: flex; align-items: center; gap: 5px; }
                .doc-info-value { font-size: 13px; color: #1a2f4a; font-weight: 600; }
                .doc-modal-btns { display: flex; gap: 10px; }
                .doc-modal-btn-close { flex: 1; padding: 11px; border: 1.5px solid #d8e4f0; border-radius: 12px; background: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #3d5170; cursor: pointer; }
                .doc-modal-btn-close:hover { background: #f0f4f8; }
                .doc-modal-btn-book { flex: 1.5; padding: 11px; background: linear-gradient(135deg, #1558b0, #2f80ed); color: #fff; border: none; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 14px rgba(47,128,237,0.30); transition: transform 0.15s; }
                .doc-modal-btn-book:hover { transform: translateY(-1px); }
                .slot-box { background: #fff; border-radius: 24px; width: 100%; max-width: 560px; max-height: 85vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(11,29,58,0.20); animation: popIn 0.25s ease; }
                .slot-header { background: linear-gradient(135deg, #1558b0, #2f80ed); padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
                .slot-header-info { color: #fff; }
                .slot-header-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; }
                .slot-header-sub { font-size: 12px; color: rgba(255,255,255,0.70); margin-top: 3px; }
                .slot-close { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.20); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; }
                .slot-body { flex: 1; overflow-y: auto; padding: 20px; }
                .slot-loading { display: flex; justify-content: center; padding: 40px; }
                .slot-spin { width: 36px; height: 36px; border: 3px solid #e8f0f8; border-top-color: #2f80ed; border-radius: 50%; animation: spin 0.75s linear infinite; }
                .slot-empty { text-align: center; padding: 40px 20px; }
                .slot-empty-icon { font-size: 40px; opacity: 0.2; margin-bottom: 10px; }
                .slot-empty-text { color: #7a8fa6; font-size: 14px; }
                .slot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .slot-card { border: 1.5px solid #e8f0f8; border-radius: 14px; padding: 14px; transition: all 0.15s; }
                .slot-card:hover { border-color: #2f80ed; background: #f0f7ff; transform: translateY(-2px); }
                .slot-date { font-size: 12px; font-weight: 600; color: #2f80ed; display: flex; align-items: center; gap: 5px; margin-bottom: 6px; }
                .slot-time { font-size: 14px; font-weight: 700; color: #0b1d3a; display: flex; align-items: center; gap: 5px; }
                .slot-end-time { font-size: 11px; color: #7a8fa6; margin-top: 4px; }
                .slot-book-btn { width: 100%; margin-top: 10px; padding: 8px; background: linear-gradient(135deg, #1558b0, #2f80ed); color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; font-family: 'DM Sans', sans-serif; }
                .slot-book-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                @media (max-width: 1100px) { .hd-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (max-width: 768px) { .hd-grid { grid-template-columns: repeat(2, 1fr); } .hd-hero, .hd-body { padding-left: 20px; padding-right: 20px; } .slot-grid { grid-template-columns: 1fr; } .doc-info-grid { grid-template-columns: 1fr; } }
                @media (max-width: 480px) { .hd-grid { grid-template-columns: 1fr; } }
            `}</style>

            <div className="hd-root">

                {/* Hero */}
                <div className="hd-hero">
                    <button className="hd-back" onClick={() => navigate(-1)}>
                        <FaArrowLeft size={13} /> Back to Hospitals
                    </button>
                    <div className="hd-hosp-name">{hospital?.hospital_name || "Hospital Doctors"}</div>
                    <div className="hd-sub">Select a doctor to view available appointment slots</div>
                    <div className="hd-search-wrap">
                        <FaSearch className="hd-search-icon" size={14} />
                        <input className="hd-search" placeholder="Search doctor or specialization…"
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                {/* Body */}
                <div className="hd-body">
                    {loading ? (
                        <div className="hd-loader" />
                    ) : (
                        <>
                            <p className="hd-count">
                                <strong>{filtered.length}</strong> doctor{filtered.length !== 1 ? "s" : ""} available
                            </p>
                            <div className="hd-grid">
                                {filtered.length > 0 ? filtered.map(doctor => (
                                    <div className="hd-card" key={doctor._id}>
                                        <div className="hd-card-top">
                                            {doctor.img ? (
                                                <img className="hd-avatar"
                                                    src={`https://carexa-backend.vercel.app/uploads/${doctor.img}`}
                                                    alt={doctor.name}
                                                    onError={e => { e.target.style.display = "none"; }} />
                                            ) : (
                                                <div className="hd-avatar-placeholder">
                                                    <FaUserMd size={28} color="#fff" />
                                                </div>
                                            )}
                                            <div className="hd-name">{doctor.name}</div>
                                            {doctor.specialization && (
                                                <div className="hd-spec">{doctor.specialization}</div>
                                            )}
                                            <div className="hd-rating"><FaStar size={10} /> 4.5</div>
                                        </div>

                                        <div className="hd-card-body">
                                            {doctor.phone && (
                                                <div className="hd-info-row">
                                                    <FaPhone size={11} className="hd-info-icon" />
                                                    {doctor.phone}
                                                </div>
                                            )}
                                            {doctor.email && (
                                                <div className="hd-info-row">
                                                    <FaEnvelope size={11} className="hd-info-icon" />
                                                    {doctor.email}
                                                </div>
                                            )}
                                            {doctor.experience && (
                                                <div className="hd-info-row">
                                                    <FaBriefcase size={11} className="hd-info-icon" />
                                                    {doctor.experience} yrs experience
                                                </div>
                                            )}
                                            {doctor.qualification && (
                                                <div className="hd-info-row">
                                                    <FaGraduationCap size={11} className="hd-info-icon" />
                                                    {doctor.qualification}
                                                </div>
                                            )}
                                        </div>

                                        <div className="hd-card-divider" />

                                        <div className="hd-card-btns">
                                            <button className="hd-btn-details"
                                                onClick={(e) => handleViewDetails(e, doctor)}>
                                                Details
                                            </button>
                                            <button className="hd-btn-book"
                                                onClick={() => handleSelectDoctor(doctor)}>
                                                <FaCalendarAlt size={11} /> Book Now
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="hd-empty">
                                        <div className="hd-empty-icon">👨‍⚕️</div>
                                        <p className="hd-empty-text">
                                            {search
                                                ? `No doctors found for "${search}"`
                                                : "No doctors available in this hospital"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── DOCTOR DETAIL MODAL ── */}
            {showDoctorModal && selectedDoctor && (
                <div className="modal-overlay" onClick={() => setShowDoctorModal(false)}>
                    <div className="doc-modal" onClick={e => e.stopPropagation()}>
                        <div className="doc-modal-top">
                            {selectedDoctor.img ? (
                                <img className="doc-modal-avatar"
                                    src={`https://carexa-backend.vercel.app/uploads/${selectedDoctor.img}`}
                                    alt={selectedDoctor.name}
                                    onError={e => { e.target.style.display = "none"; }} />
                            ) : (
                                <div className="doc-modal-avatar-ph">
                                    <FaUserMd size={32} color="#fff" />
                                </div>
                            )}
                            <div>
                                <div className="doc-modal-name">{selectedDoctor.name}</div>
                                {selectedDoctor.specialization && (
                                    <div className="doc-modal-spec">{selectedDoctor.specialization}</div>
                                )}
                                <div className="doc-modal-rating"><FaStar size={11} /> 4.5 Rating</div>
                            </div>
                            <button className="doc-modal-close" onClick={() => setShowDoctorModal(false)}>
                                <FaTimes size={13} />
                            </button>
                        </div>

                        <div className="doc-modal-body">
                            <div className="doc-info-grid">
                                {[
                                    { label: "Phone",          icon: <FaPhone size={10} />,        value: selectedDoctor.phone          || "—" },
                                    { label: "Email",          icon: <FaEnvelope size={10} />,     value: selectedDoctor.email          || "—" },
                                    { label: "Specialization", icon: <FaUserMd size={10} />,       value: selectedDoctor.specialization || "—" },
                                    { label: "Qualification",  icon: <FaGraduationCap size={10}/>, value: selectedDoctor.qualification  || "—" },
                                    { label: "Experience",     icon: <FaBriefcase size={10} />,    value: selectedDoctor.experience ? `${selectedDoctor.experience} years` : "—" },
                                    { label: "Department",     icon: <FaMapMarkerAlt size={10} />, value: selectedDoctor.department     || "—" },
                                ].map(({ label, icon, value }) => (
                                    <div key={label} className="doc-info-card">
                                        <div className="doc-info-label">{icon} {label}</div>
                                        <div className="doc-info-value">{value}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="doc-modal-btns">
                                <button className="doc-modal-btn-close" onClick={() => setShowDoctorModal(false)}>
                                    Close
                                </button>
                                <button className="doc-modal-btn-book" onClick={() => {
                                    setShowDoctorModal(false);
                                    handleSelectDoctor(selectedDoctor);
                                }}>
                                    <FaCalendarAlt size={12} /> Book Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SLOT MODAL ── */}
            {showSlotModal && selectedDoctor && (
                <div className="modal-overlay" onClick={() => setShowSlotModal(false)}>
                    <div className="slot-box" onClick={e => e.stopPropagation()}>
                        <div className="slot-header">
                            <div className="slot-header-info">
                                <div className="slot-header-title">{selectedDoctor.name}</div>
                                <div className="slot-header-sub">
                                    {selectedDoctor.specialization || "General"} · Select an available slot
                                </div>
                            </div>
                            <button className="slot-close" onClick={() => setShowSlotModal(false)}>
                                <FaTimes size={14} />
                            </button>
                        </div>

                        <div className="slot-body">
                            {slotsLoading ? (
                                <div className="slot-loading"><div className="slot-spin" /></div>
                            ) : slots.length === 0 ? (
                                <div className="slot-empty">
                                    <div className="slot-empty-icon">📅</div>
                                    <p className="slot-empty-text">No available slots for this doctor</p>
                                </div>
                            ) : (
                                <div className="slot-grid">
                                    {slots.map(slot => (
                                        <div className="slot-card" key={slot._id}>
                                            <div className="slot-date">
                                                <FaCalendarAlt size={11} />
                                                {formatDate(slot.appointment_date)}
                                            </div>
                                            <div className="slot-time">
                                                <FaClock size={12} color="#2f80ed" />
                                                {slot.start_time}
                                            </div>
                                            {slot.end_time && (
                                                <div className="slot-end-time">Until {slot.end_time}</div>
                                            )}
                                            <button
                                                className="slot-book-btn"
                                                disabled={booking}
                                                onClick={() => handleBookSlot(slot)}>
                                                {booking && bookingSlotId === slot._id
                                                    ? <><div style={{ width:12, height:12, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} /> Booking...</>
                                                    : <><FaCheckCircle size={11} /> Book This Slot</>
                                                }
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HospitalDoctors;