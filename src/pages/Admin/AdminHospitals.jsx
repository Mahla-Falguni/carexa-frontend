import { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { getImageUrl, handleImageError } from "../../utils/imageUtils";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaHospital, FaEye, FaSearch, FaTimes, FaSave, FaPhone,
  FaEnvelope, FaMapMarkerAlt, FaUserMd,
  FaToggleOn, FaToggleOff
} from "react-icons/fa";

const AdminHospitals = () => {

  const { globalSearch = "" } = useOutletContext() || {};
  const [hospitals, setHospitals]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [viewHospital, setViewHospital]   = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editHospital, setEditHospital]   = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    hospital_name: "", hospital_email: "", hospital_address: "", hospital_phone: ""
  });

  const navigate = useNavigate();
  const token    = localStorage.getItem("adminToken");

  const getHospitals = async () => {
    try {
      const res = await axios.get(
        "https://carexa-backend.vercel.app/adminapi/get_hospitals",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHospitals(res.data.hospitals || res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getHospitals(); }, []);

  const handleView = (hospital) => {
    setViewHospital(hospital);
    setShowViewModal(true);
  };

  const handleEditOpen = (hospital) => {
    setEditHospital(hospital);
    setEditForm({
      hospital_name:    hospital.hospital_name    || "",
      hospital_email:   hospital.hospital_email   || "",
      hospital_address: hospital.hospital_address || "",
      hospital_phone:   hospital.hospital_phone   || ""
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.post(
        `https://carexa-backend.vercel.app/adminapi/update-hospital/${editHospital._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({ icon: "success", title: "Updated!", timer: 1500, showConfirmButton: false });
      setShowEditModal(false);
      getHospitals();
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.message || "Update failed", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Hospital?", text: "This action cannot be undone.",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete"
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete(
        `https://carexa-backend.vercel.app/adminapi/delete-hospital/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
      setHospitals(hospitals.filter(h => h._id !== id));
    } catch (error) {
      Swal.fire("Error", "Failed to delete hospital", "error");
    }
  };

  // ── TOGGLE STATUS ──────────────────────────────────
  const handleToggleStatus = async (hospital) => {
    const newStatus = hospital.hospital_status === "INACTIVE" ? "ACTIVE" : "ACTIVE";
    const toggleTo  = hospital.hospital_status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await axios.put(
        `https://carexa-backend.vercel.app/adminapi/toggle-hospital-status/${hospital._id}`,
        { hospital_status: toggleTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHospitals(hospitals.map(h =>
        h._id === hospital._id ? { ...h, hospital_status: toggleTo } : h
      ));
    } catch (error) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const filtered = hospitals.filter(h => {
    const q = (globalSearch || searchQuery).toLowerCase();
    return (
      h.hospital_name?.toLowerCase().includes(q) ||
      h.hospital_email?.toLowerCase().includes(q) ||
      h.hospital_address?.toLowerCase().includes(q)
    );
  });

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        .admin-page { font-family: 'DM Sans', sans-serif; }
        .page-title { font-family: 'Playfair Display', serif; }
        .card-row { transition: all 0.15s ease; border-left: 3px solid transparent; }
        .card-row:hover { background: #eff6ff; border-left-color: #3b82f6; }
        .modal-overlay { backdrop-filter: blur(6px); background: rgba(15,23,42,0.6); }
        .btn-view   { background: linear-gradient(135deg, #16a34a, #15803d); }
        .btn-edit   { background: linear-gradient(135deg, #d97706, #b45309); }
        .btn-delete { background: linear-gradient(135deg, #dc2626, #b91c1c); }
        .btn-view:hover, .btn-edit:hover, .btn-delete:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .toggle-btn { transition: all 0.15s; }
        .toggle-btn:hover { transform: scale(1.1); }
      `}</style>

      <div className="admin-page max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="page-title text-3xl text-slate-800 mb-1">All Hospitals</h1>
            <p className="text-slate-500 text-sm">{hospitals.length} hospitals registered</p>
          </div>
          <button
            onClick={() => navigate("/admin/add-hospital")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            <FaHospital size={13} /> Add Hospital
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

          {/* Search bar */}
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="relative max-w-sm">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input type="text" placeholder="Search hospitals..."
                value={searchQuery} onChange={e => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
              />
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FaHospital className="text-slate-300 mb-4" size={40} />
              <p className="text-slate-500 font-semibold">No hospitals found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["No","Hospital Name","Email","Address","Status","Actions"].map(h => (
                      <th key={h} className={`px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === "Actions" ? "text-center" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map((hospital, index) => (
                    <tr key={hospital._id} className="card-row">

                      <td className="px-6 py-4 text-sm text-slate-400">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>

                      {/* Hospital Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <img src={getImageUrl(hospital.hospital_img, 'hospital')}
                              onError={e => handleImageError(e, 'hospital')}
                              className="w-8 h-8 rounded-full object-cover border-2 border-blue-100 shrink-0" alt="" />
                          <p className="text-sm font-semibold text-slate-700">{hospital.hospital_name}</p>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <FaEnvelope size={11} className="text-slate-400" />
                          {hospital.hospital_email}
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <FaMapMarkerAlt size={11} className="text-slate-400" />
                          {hospital.hospital_address}
                        </div>
                      </td>

                      {/* ── Status Toggle ── */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(hospital)}
                            className="toggle-btn focus:outline-none"
                            title={hospital.hospital_status === "INACTIVE" ? "Activate" : "Deactivate"}
                          >
                            {hospital.hospital_status === "INACTIVE"
                              ? <FaToggleOff size={30} className="text-slate-400" />
                              : <FaToggleOn  size={30} className="text-emerald-500" />
                            }
                          </button>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            hospital.hospital_status === "INACTIVE"
                              ? "bg-red-100 text-red-600 border-red-200"
                              : "bg-emerald-100 text-emerald-700 border-emerald-200"
                          }`}>
                            {hospital.hospital_status === "INACTIVE" ? "INACTIVE" : "ACTIVE"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/hospital-doctors/${hospital._id}`)}
                            className="btn-view flex items-center gap-1.5 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                          >
                            <FaUserMd size={11} /> Doctors
                          </button>
                          <button
                            onClick={() => handleView(hospital)}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                            <FaEye size={11} /> View
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} hospitals
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

        </div>
      </div>

      {/* ── VIEW MODAL ── */}
      {showViewModal && viewHospital && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5 flex justify-between items-center">
              <div>
                <h2 className="text-white font-bold text-base">Hospital Details</h2>
                <p className="text-blue-200 text-xs mt-0.5">Full hospital information</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-white/60 hover:text-white text-lg">✕</button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { icon: <FaHospital size={13} className="text-blue-500" />,      label: "Hospital Name", value: viewHospital.hospital_name },
                { icon: <FaEnvelope size={13} className="text-blue-500" />,      label: "Email",         value: viewHospital.hospital_email },
                { icon: <FaPhone size={13} className="text-blue-500" />,         label: "Phone",         value: viewHospital.hospital_phone || "—" },
                { icon: <FaMapMarkerAlt size={13} className="text-blue-500" />,  label: "Address",       value: viewHospital.hospital_address },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="mt-0.5">{icon}</div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{label}</p>
                    <p className="text-sm text-slate-700 font-semibold">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => setShowViewModal(false)}
                className="w-full bg-slate-100 text-slate-600 hover:bg-slate-200 py-2.5 rounded-xl text-sm font-semibold transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {showEditModal && editHospital && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-5 flex justify-between items-center">
              <div>
                <h2 className="text-white font-bold text-base">Edit Hospital</h2>
                <p className="text-amber-100 text-xs mt-0.5">Update hospital details</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-white/60 hover:text-white text-lg">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Hospital Name", name: "hospital_name",    type: "text" },
                { label: "Email",         name: "hospital_email",   type: "email" },
                { label: "Phone",         name: "hospital_phone",   type: "text" },
                { label: "Address",       name: "hospital_address", type: "text" },
              ].map(({ label, name, type }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
                  <input type={type} value={editForm[name]}
                    onChange={e => setEditForm({ ...editForm, [name]: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-slate-50"
                  />
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={handleEditSave}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                <FaSave size={13} /> Save Changes
              </button>
              <button onClick={() => setShowEditModal(false)}
                className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 py-2.5 rounded-xl text-sm font-semibold transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHospitals;