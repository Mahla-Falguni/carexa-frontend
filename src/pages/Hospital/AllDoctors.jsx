import axios from "axios";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getImageUrl, handleImageError } from "../../utils/imageUtils";
import {
    FaUserMd, FaTrash, FaEdit, FaPlus,
    FaSearch, FaEnvelope, FaPhone, FaRupeeSign,
    FaTimes, FaSave
} from "react-icons/fa";
import { Link } from "react-router-dom";

const AllDoctors = () => {

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Edit modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editDoctor, setEditDoctor] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", specialization: "", consultation_fee: "" });
    const [editImg, setEditImg] = useState(null);
    const [editPreview, setEditPreview] = useState(null);
    const [saving, setSaving] = useState(false);

    // ── PAGINATION ──────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const token = localStorage.getItem("HospitalToken");

    const getAllDoctors = async () => {
        try {
            const res = await axios.get(
                "https://carexa-backend.vercel.app/hospitalapi/getAllDoctors",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDoctors(res.data.doctors || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { getAllDoctors(); }, []);

    const handleEditOpen = (doctor) => {
        setEditDoctor(doctor);
        setEditForm({
            name:             doctor.name             || "",
            email:            doctor.email            || "",
            phone:            doctor.phone            || "",
            specialization:   doctor.specialization   || "",
            consultation_fee: doctor.consultation_fee || ""
        });
        setEditPreview(getImageUrl(doctor.img, 'doctor'));
        setEditImg(null);
        setShowEditModal(true);
    };

    const handleEditSave = async () => {
        setSaving(true);
        try {
            const data = new FormData();
            Object.keys(editForm).forEach(k => data.append(k, editForm[k]));
            data.append("role", "DOCTOR");
            if (editImg) data.append("img", editImg);

            await axios.post(
                `https://carexa-backend.vercel.app/hospitalapi/update-doctor-profile/${editDoctor._id}`,
                data,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );

            Swal.fire({ icon: "success", title: "Updated!", timer: 1500, showConfirmButton: false });
            setShowEditModal(false);
            getAllDoctors();
        } catch (error) {
            Swal.fire("Error", error?.response?.data?.message || "Update failed", "error");
        } finally {
            setSaving(false);
        }
    };

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
                `https://carexa-backend.vercel.app/hospitalapi/delete-doctor/${id}`,
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
            d.email?.toLowerCase().includes(q)
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
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .doc-page   { font-family: 'DM Sans', sans-serif; }
                .page-title { font-family: 'Playfair Display', serif; }
                .card-row   { transition: all 0.15s ease; border-left: 3px solid transparent; }
                .card-row:hover { background: #eff6ff; border-left-color: #3b82f6; }
                .btn-edit   { background: linear-gradient(135deg, #d97706, #b45309); transition: all 0.2s; }
                .btn-edit:hover   { box-shadow: 0 4px 12px rgba(217,119,6,0.3); transform: translateY(-1px); }
                .btn-delete { background: linear-gradient(135deg, #dc2626, #b91c1c); transition: all 0.2s; }
                .btn-delete:hover { box-shadow: 0 4px 12px rgba(220,38,38,0.3); transform: translateY(-1px); }
                .modal-overlay { backdrop-filter: blur(6px); background: rgba(15,23,42,0.6); }
                .field-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); outline: none; }
                .add-btn { background: linear-gradient(135deg, #2563eb, #4f46e5); transition: all 0.2s; }
                .add-btn:hover { box-shadow: 0 6px 20px rgba(79,70,229,0.35); transform: translateY(-1px); }
            `}</style>

            <div className="doc-page max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="page-title text-3xl text-slate-800 mb-1">All Doctors</h1>
                        <p className="text-slate-500 text-sm">{doctors.length} doctors registered at your hospital</p>
                    </div>
                    <Link
                        to="/hospital-dashboard/adddoctors"
                        className="add-btn flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold self-start"
                    >
                        <FaPlus size={12} /> Add Doctor
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                    {/* Search */}
                    <div className="px-6 py-4 border-b border-slate-100">
                        <div className="relative max-w-sm">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                            <input
                                type="text"
                                placeholder="Search by name, specialization..."
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <FaUserMd className="text-slate-300 mb-4" size={40} />
                            <p className="text-slate-500 font-semibold">No doctors found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialization</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee</th>
                                        <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {/* ── Use paginated instead of filtered ── */}
                                    {paginated.map((doctor, index) => (
                                        <tr key={doctor._id} className="card-row">

                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>

                                            {/* Doctor */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                        <img
                                                            src={getImageUrl(doctor.img, 'doctor')}
                                                            alt={doctor.name}
                                                            onError={e => handleImageError(e, 'doctor')}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 shrink-0"
                                                        />
                                                    <p className="text-sm font-semibold text-slate-700">{doctor.name}</p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <FaEnvelope size={11} className="text-slate-400" />
                                                    {doctor.email}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <FaPhone size={11} className="text-slate-400" />
                                                    {doctor.phone}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                                                    {doctor.specialization}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                                                    <FaRupeeSign size={11} className="text-slate-400" />
                                                    {doctor.consultation_fee}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEditOpen(doctor)}
                                                        className="btn-edit flex items-center gap-1.5 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                                                    >
                                                        <FaEdit size={11} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(doctor._id)}
                                                        className="btn-delete flex items-center gap-1.5 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                                                    >
                                                        <FaTrash size={11} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── PAGINATION ── */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
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

                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && editDoctor && (
                <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

                        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-white font-bold text-base">Edit Doctor</h2>
                                <p className="text-amber-100 text-xs mt-0.5">Update doctor details</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="text-white/60 hover:text-white text-lg">✕</button>
                        </div>

                        {/* Avatar */}
                        <div className="flex justify-center pt-6 pb-2">
                            <div className="relative">
                                {editPreview ? (
                                    <img src={editPreview} alt="preview" className="w-20 h-20 rounded-full object-cover border-4 border-amber-100 shadow" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-50">
                                        <FaUserMd className="text-blue-400" size={28} />
                                    </div>
                                )}
                                <label className="absolute -bottom-1 -right-1 bg-amber-500 hover:bg-amber-600 text-white p-1.5 rounded-xl cursor-pointer shadow transition">
                                    <FaSave size={11} />
                                    <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setEditImg(f); setEditPreview(URL.createObjectURL(f)); } }} className="hidden" />
                                </label>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {[
                                { label: "Name",           name: "name",             type: "text" },
                                { label: "Email",          name: "email",            type: "email" },
                                { label: "Phone",          name: "phone",            type: "text" },
                                { label: "Specialization", name: "specialization",   type: "text" },
                                { label: "Fee (₹)",        name: "consultation_fee", type: "number" },
                            ].map(({ label, name, type }) => (
                                <div key={name}>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
                                    <input
                                        type={type}
                                        value={editForm[name]}
                                        onChange={e => setEditForm({ ...editForm, [name]: e.target.value })}
                                        className="field-input w-full border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 bg-slate-50 transition"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={handleEditSave}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
                            >
                                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaSave size={13} />}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 py-2.5 rounded-xl text-sm font-semibold transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllDoctors;