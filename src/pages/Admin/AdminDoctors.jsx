import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaUserMd, FaEnvelope, FaPhone, FaRupeeSign,
  FaHospital, FaSearch, FaEye, FaTrash
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminDoctors = () => {

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ── PAGINATION ──────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const getDoctors = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/adminapi/get_doctors",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDoctors(res.data.doctors || []);
    } catch (error) {
      console.log("Fetch doctors error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getDoctors(); }, []);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Doctor?",
      text: "This doctor will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete"
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(
        `http://localhost:5000/adminapi/delete-doctor/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
      setDoctors(doctors.filter(d => d._id !== id));
    } catch (error) {
      Swal.fire("Error", "Failed to delete doctor", "error");
    }
  };

  const filtered = doctors.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.hospital_id?.hospital_name?.toLowerCase().includes(q)
    );
  });

  // ── PAGINATION LOGIC ────────────────────────────
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSearch = (val) => { setSearchQuery(val); setCurrentPage(1); };

  const getPageNumbers = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
      .reduce((acc, p, idx, arr) => {
        if (idx > 0 && arr[idx - 1] !== p - 1) acc.push("...");
        acc.push(p);
        return acc;
      }, []);
  };

  const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Loading doctors...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        .doc-page { font-family: 'DM Sans', sans-serif; }
        .page-title { font-family: 'Playfair Display', serif; }
        .doc-card { transition: all 0.2s ease; }
        .doc-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
        .btn-view   { background: linear-gradient(135deg, #2563eb, #4f46e5); transition: all 0.2s; }
        .btn-view:hover   { box-shadow: 0 4px 15px rgba(79,70,229,0.35); transform: translateY(-1px); }
        .btn-delete { background: linear-gradient(135deg, #dc2626, #b91c1c); transition: all 0.2s; }
        .btn-delete:hover { box-shadow: 0 4px 15px rgba(220,38,38,0.3);  transform: translateY(-1px); }
        .modal-overlay { backdrop-filter: blur(6px); background: rgba(15,23,42,0.6); }
        .avatar-ring { background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 3px; border-radius: 9999px; }
      `}</style>

      <div className="doc-page max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title text-3xl text-slate-800 mb-1">All Doctors</h1>
            <p className="text-slate-500 text-sm">{doctors.length} doctors registered across all hospitals</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">
              {specializations.length} Specializations
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 mb-6">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search by name, specialization, hospital..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100">
            <FaUserMd className="text-slate-300 mb-4" size={48} />
            <p className="text-slate-600 font-semibold text-lg">No doctors found</p>
            <p className="text-slate-400 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <>
            {/* ── Cards Grid (paginated) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginated.map((doctor) => (
                <div key={doctor._id} className="doc-card bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                  {/* Card Top Banner */}
                  <div className="h-24 bg-gradient-to-r  relative">
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
                    </div>
                  </div>

                  {/* Avatar — pulls up enough to fully cover the banner bottom edge */}
                  <div className="flex justify-center -mt-14 mb-3">
                    <div className="avatar-ring">
                      {doctor.img ? (
                        <img
                          src={`http://localhost:5000/uploads/${doctor.img}`}
                          alt={doctor.name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-white"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                          <FaUserMd className="text-blue-500" size={28} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 text-center">

                    {/* Name & Specialization */}
                    <h3 className="text-base font-bold text-slate-800 leading-tight">{doctor.name}</h3>
                    <span className="inline-block mt-1 px-3 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                      {doctor.specialization}
                    </span>

                    {/* Hospital */}
                    {doctor.hospital_id?.hospital_name && (
                      <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-slate-400">
                        <FaHospital size={10} />
                        <span>{doctor.hospital_id.hospital_name}</span>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-slate-100 my-3"></div>

                    {/* Info */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FaEnvelope size={10} className="text-slate-400 shrink-0" />
                        <span className="truncate">{doctor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FaPhone size={10} className="text-slate-400 shrink-0" />
                        <span>{doctor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FaRupeeSign size={10} className="text-slate-400 shrink-0" />
                        <span><strong className="text-slate-700">₹{doctor.consultation_fee}</strong> consultation</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => { setSelectedDoctor(doctor); setShowModal(true); }}
                        className="btn-view flex-1 flex items-center justify-center gap-1.5 text-white py-2 rounded-xl text-xs font-semibold"
                      >
                        <FaEye size={11} /> View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── PAGINATION ── */}
            {totalPages > 1 && (
              <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-4 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} doctors
                </p>
                <div className="flex items-center gap-1.5">

                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 text-sm rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >&#8249;</button>

                  {getPageNumbers().map((item, idx) =>
                    item === "..." ? (
                      <span key={"dots-" + idx} className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm">&#8230;</span>
                    ) : (
                      <button key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded transition ${
                          currentPage === item
                            ? "border-2 border-slate-800 text-slate-800 bg-white font-semibold"
                            : "border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500"
                        }`}
                      >{item}</button>
                    )
                  )}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white text-sm rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >&#8250;</button>

                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Modal */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5 flex justify-between items-center">
              <div>
                <h2 className="text-white font-bold text-base">Doctor Details</h2>
                <p className="text-blue-200 text-xs mt-0.5">Full profile information</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white text-lg">✕</button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center pt-6 pb-2">
              {selectedDoctor.img ? (
                <img
                  src={`http://localhost:5000/uploads/${selectedDoctor.img}`}
                  alt={selectedDoctor.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 shadow"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-4 border-blue-50">
                  <FaUserMd className="text-blue-500" size={28} />
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-800 mt-3">{selectedDoctor.name}</h3>
              <span className="px-3 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100 mt-1">
                {selectedDoctor.specialization}
              </span>
            </div>

            {/* Info */}
            <div className="px-6 pb-6 space-y-3 mt-3">
              {[
                { icon: <FaEnvelope size={12} className="text-blue-400" />, label: "Email",    value: selectedDoctor.email },
                { icon: <FaPhone size={12} className="text-blue-400" />,   label: "Phone",    value: selectedDoctor.phone },
                { icon: <FaRupeeSign size={12} className="text-blue-400" />, label: "Fee",    value: `₹${selectedDoctor.consultation_fee}` },
                { icon: <FaHospital size={12} className="text-blue-400" />, label: "Hospital", value: selectedDoctor.hospital_id?.hospital_name || "—" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {icon}
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm text-slate-700 font-semibold">{value}</p>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold transition mt-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;