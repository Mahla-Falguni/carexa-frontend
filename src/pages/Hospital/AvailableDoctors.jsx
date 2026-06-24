import axios from "axios";
import { useEffect, useState } from "react";
import {
    FaUserMd, FaSearch, FaEnvelope, FaPhone,
    FaRupeeSign, FaCheckCircle
} from "react-icons/fa";

const AvailableDoctors = () => {

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const getAvailableDoctors = async () => {
        try {
            const token = localStorage.getItem("HospitalToken");
            const res = await axios.get(
                "https://carexa-backend.vercel.app/hospitalapi/get-available-doctors",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDoctors(res.data.doctors || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { getAvailableDoctors(); }, []);

    const filtered = doctors.filter(d => {
        const q = searchQuery.toLowerCase();
        return (
            d.name?.toLowerCase().includes(q) ||
            d.specialization?.toLowerCase().includes(q)
        );
    });

    const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading available doctors...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/10 p-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .avail-page { font-family: 'DM Sans', sans-serif; }
                .page-title { font-family: 'Playfair Display', serif; }
                .doc-card   { transition: all 0.2s ease; }
                .doc-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
                .avatar-ring { background: linear-gradient(135deg, #10b981, #0d9488); padding: 3px; border-radius: 9999px; }
            `}</style>

            <div className="avail-page max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="page-title text-3xl text-slate-800 mb-1">Available Doctors</h1>
                        <p className="text-slate-500 text-sm">
                            {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} currently available
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200 self-start">
                        <FaCheckCircle size={12} /> {doctors.length} Available
                    </span>
                </div>

                {/* Search + Stats */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                        <input
                            type="text"
                            placeholder="Search by name or specialization..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-slate-50"
                        />
                    </div>
                    <span className="text-xs text-slate-400 font-medium shrink-0">
                        {specializations.length} specialization{specializations.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Grid */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100">
                        <FaUserMd className="text-slate-300 mb-4" size={48} />
                        <p className="text-slate-600 font-semibold text-lg">No available doctors</p>
                        <p className="text-slate-400 text-sm mt-1">
                            {searchQuery ? "Try a different search term" : "No doctors are currently available"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map((doctor) => (
                            <div key={doctor._id} className="doc-card bg-white rounded-2xl shadow-sm border border-slate-100 p-5">

                                {/* Top — Avatar + Status */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="avatar-ring shrink-0">
                                        {doctor.img ? (
                                            <img
                                                src={`https://carexa-backend.vercel.app/uploads/${doctor.img}`}
                                                alt={doctor.name}
                                                onError={e => { e.target.onerror = null; e.target.src = "/doctor.png"; }}
                                                className="w-16 h-16 rounded-full object-cover border-3 border-white"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full border-3 border-white bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                                                <FaUserMd className="text-emerald-500" size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                        Active
                                    </span>
                                </div>

                                {/* Name + Specialization */}
                                <h3 className="text-base font-bold text-slate-800 leading-tight">{doctor.name}</h3>
                                <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                                    {doctor.specialization}
                                </span>

                                {/* Divider */}
                                <div className="border-t border-slate-100 my-3"></div>

                                {/* Info */}
                                <div className="space-y-1.5">
                                    {doctor.email && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <FaEnvelope size={10} className="text-slate-400 shrink-0" />
                                            <span className="truncate">{doctor.email}</span>
                                        </div>
                                    )}
                                    {doctor.phone && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <FaPhone size={10} className="text-slate-400 shrink-0" />
                                            <span>{doctor.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <FaRupeeSign size={10} className="text-slate-400 shrink-0" />
                                        <span><strong className="text-slate-700">₹{doctor.consultation_fee}</strong> consultation</span>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailableDoctors;