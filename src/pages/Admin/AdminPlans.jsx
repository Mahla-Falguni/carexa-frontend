import { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { getImageUrl, handleImageError } from "../../utils/imageUtils";
import Swal from "sweetalert2";
import {
    FaLayerGroup, FaPlus, FaEdit, FaTrash, FaEye,
    FaRupeeSign, FaClock, FaCheckCircle, FaSearch,
    FaSave, FaTimes, FaHospital, FaToggleOn, FaToggleOff,
    FaCalendarAlt, FaEnvelope, FaMapMarkerAlt
} from "react-icons/fa";

const AdminPlans = () => {

    const { globalSearch = "" } = useOutletContext() || {};
    const [plans, setPlans]               = useState([]);
    const [planStats, setPlanStats]       = useState({});
    const [loading, setLoading]           = useState(true);
    const [searchQuery, setSearchQuery]   = useState("");
    const [showAddModal, setShowAddModal]     = useState(false);
    const [showEditModal, setShowEditModal]   = useState(false);
    const [showViewModal, setShowViewModal]   = useState(false);
    const [showHospitalsModal, setShowHospitalsModal] = useState(false);
    const [selectedPlan, setSelectedPlan]     = useState(null);
    const [planHospitals, setPlanHospitals]   = useState([]);
    const [hospitalsLoading, setHospitalsLoading] = useState(false);
    const [saving, setSaving]             = useState(false);

    const [addForm, setAddForm] = useState({ plan_name: "", plan_duration: "", plan_price: "" });
    const [editForm, setEditForm] = useState({ plan_name: "", plan_duration: "", plan_price: "" });

    const token = localStorage.getItem("adminToken");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const [plansRes, statsRes] = await Promise.all([
                axios.get("https://carexa-backend.vercel.app/planapi/get-all-plans", { headers }),
                axios.get("https://carexa-backend.vercel.app/planapi/plan-stats", { headers }),
            ]);
            setPlans(plansRes.data.plans || []);

            const statsMap = {};
            (statsRes.data.stats || []).forEach(s => {
                statsMap[s.plan_id] = s.hospital_count;
            });
            setPlanStats(statsMap);
        } catch (error) {
            console.log("Error fetching plans:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlans(); }, []);

    // ── CREATE ──
    const handleCreate = async () => {
        if (!addForm.plan_name || !addForm.plan_duration || !addForm.plan_price)
            return Swal.fire("Error", "All fields are required", "error");
        setSaving(true);
        try {
            await axios.post("https://carexa-backend.vercel.app/planapi/create-plan", addForm, { headers });
            Swal.fire({ icon: "success", title: "Plan Created!", timer: 1500, showConfirmButton: false });
            setShowAddModal(false);
            setAddForm({ plan_name: "", plan_duration: "", plan_price: "" });
            fetchPlans();
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.error || "Failed to create plan", "error");
        } finally { setSaving(false); }
    };

    // ── UPDATE ──
    const handleUpdate = async () => {
        setSaving(true);
        try {
            await axios.post(`https://carexa-backend.vercel.app/planapi/update-plan/${selectedPlan._id}`, editForm, { headers });
            Swal.fire({ icon: "success", title: "Plan Updated!", timer: 1500, showConfirmButton: false });
            setShowEditModal(false);
            fetchPlans();
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.error || "Failed to update plan", "error");
        } finally { setSaving(false); }
    };

    // ── DELETE ──
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Plan?", text: "This plan will be permanently removed.",
            icon: "warning", showCancelButton: true,
            confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Delete"
        });
        if (!confirm.isConfirmed) return;
        try {
            await axios.delete(`https://carexa-backend.vercel.app/planapi/delete-plan/${id}`, { headers });
            Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
            setPlans(plans.filter(p => p._id !== id));
        } catch { Swal.fire("Error", "Failed to delete plan", "error"); }
    };

    // ── TOGGLE STATUS ──
    const handleToggleStatus = async (plan) => {
        try {
            const res = await axios.put(
                `https://carexa-backend.vercel.app/planapi/toggle-status/${plan._id}`,
                {}, { headers }
            );
            setPlans(plans.map(p => p._id === plan._id ? { ...p, plan_status: res.data.plan.plan_status } : p));
        } catch {
            Swal.fire("Error", "Failed to update status", "error");
        }
    };

    // ── VIEW HOSPITALS FOR A PLAN ──
    const handleViewHospitals = async (plan) => {
        setSelectedPlan(plan);
        setShowHospitalsModal(true);
        setHospitalsLoading(true);
        try {
            const res = await axios.get(
                `https://carexa-backend.vercel.app/planapi/hospitals-by-plan/${plan._id}`,
                { headers }
            );
            setPlanHospitals(res.data.subscriptions || []);
        } catch {
            setPlanHospitals([]);
        } finally {
            setHospitalsLoading(false);
        }
    };

    const openEdit = (plan) => {
        setSelectedPlan(plan);
        setEditForm({ plan_name: plan.plan_name, plan_duration: plan.plan_duration, plan_price: plan.plan_price });
        setShowEditModal(true);
    };

    const filtered = plans.filter(p => {
        const q = (globalSearch || searchQuery).toLowerCase();
        return p.plan_name?.toLowerCase().includes(q);
    });

    const statusBadge = (status) =>
        status === "ACTIVE"
            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
            : "bg-red-100 text-red-600 border-red-200";

    const planColor = (idx) => [
        { bg: "from-blue-500 to-indigo-600" },
        { bg: "from-violet-500 to-purple-600" },
        { bg: "from-emerald-500 to-teal-600" },
        { bg: "from-amber-500 to-orange-600" },
    ][idx % 4];

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading plans...</p>
            </div>
        </div>
    );

    const ModalOverlay = ({ children, onClose }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(8px)", background: "rgba(15,23,42,0.65)" }}
            onClick={onClose}>
            <div onClick={e => e.stopPropagation()} className="w-full flex justify-center">{children}</div>
        </div>
    );

    const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 bg-slate-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 p-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .plans-page { font-family: 'DM Sans', sans-serif; }
                .page-title { font-family: 'Playfair Display', serif; }
                .plan-card  { transition: all 0.2s ease; }
                .plan-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.10); }
                .card-row   { transition: all 0.15s; border-left: 3px solid transparent; }
                .card-row:hover { background: #eff6ff; border-left-color: #3b82f6; }
                .add-btn    { background: linear-gradient(135deg,#2563eb,#4f46e5); transition: all 0.2s; }
                .add-btn:hover { box-shadow: 0 6px 20px rgba(79,70,229,0.35); transform: translateY(-1px); }
                .save-btn   { background: linear-gradient(135deg,#2563eb,#4f46e5); transition: all 0.2s; }
                .save-btn:hover { background: linear-gradient(135deg,#1d4ed8,#4338ca); }
                .btn-edit   { background: linear-gradient(135deg,#d97706,#b45309); transition: all 0.2s; }
                .btn-edit:hover   { box-shadow: 0 4px 12px rgba(217,119,6,0.3); transform: translateY(-1px); }
                .btn-delete { background: linear-gradient(135deg,#dc2626,#b91c1c); transition: all 0.2s; }
                .btn-delete:hover { box-shadow: 0 4px 12px rgba(220,38,38,0.3); transform: translateY(-1px); }
                .hosp-card  { transition: all 0.15s; }
                .hosp-card:hover { background: #eff6ff; transform: translateX(3px); }
            `}</style>

            <div className="plans-page max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="page-title text-3xl text-slate-800 mb-1">Health Plans</h1>
                        <p className="text-slate-500 text-sm">{plans.length} plans · {Object.values(planStats).reduce((a,b) => a+b, 0)} hospital subscriptions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                            <input type="text" placeholder="Search plans..."
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
                        </div>
                        <button onClick={() => setShowAddModal(true)}
                            className="add-btn flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0">
                            <FaPlus size={12} /> Add New Plan
                        </button>
                    </div>
                </div>

                {/* Plan Cards Grid */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
                        <FaLayerGroup className="text-slate-300 mb-4" size={40} />
                        <p className="text-slate-500 font-semibold">No plans found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                        {filtered.map((plan, idx) => {
                            const c = planColor(idx);
                            const hospitalCount = planStats[plan._id] || 0;
                            return (
                                <div key={plan._id} className="plan-card bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                                    {/* Gradient banner */}
                                    <div className={`bg-gradient-to-r ${c.bg} p-5 relative overflow-hidden`}>
                                        <div className="absolute inset-0 opacity-10"
                                            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                                        <div className="relative flex justify-between items-start">
                                            <div>
                                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                                                    <FaLayerGroup className="text-white" size={18} />
                                                </div>
                                                <h3 className="text-white font-bold text-base leading-tight">{plan.plan_name}</h3>
                                            </div>
                                            <button
                                                onClick={() => handleToggleStatus(plan)}
                                                title={plan.plan_status === "ACTIVE" ? "Deactivate" : "Activate"}
                                                className="mt-1 focus:outline-none"
                                            >
                                                {plan.plan_status === "ACTIVE"
                                                    ? <FaToggleOn size={28} className="text-emerald-300 drop-shadow" />
                                                    : <FaToggleOff size={28} className="text-white/40" />
                                                }
                                            </button>
                                        </div>
                                        <span className={`mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge(plan.plan_status)} bg-white/90`}>
                                            <FaCheckCircle size={9} /> {plan.plan_status}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1 text-2xl font-bold text-slate-800">
                                                <FaRupeeSign size={16} className="text-slate-500" />
                                                {plan.plan_price}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                <FaClock size={10} />
                                                {plan.plan_duration} mo
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-400 mb-4">Added {new Date(plan.added_date).toLocaleDateString("en-GB")}</p>

                                        <div className="flex gap-2 mb-2">
                                            <button onClick={() => { setSelectedPlan(plan); setShowViewModal(true); }}
                                                className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-xl text-xs font-semibold transition">
                                                <FaEye size={11} /> View
                                            </button>
                                            <button onClick={() => openEdit(plan)}
                                                className="btn-edit flex-1 flex items-center justify-center gap-1 text-white py-2 rounded-xl text-xs font-semibold">
                                                <FaEdit size={11} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(plan._id)}
                                                className="btn-delete w-9 flex items-center justify-center text-white rounded-xl text-xs">
                                                <FaTrash size={11} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleViewHospitals(plan)}
                                            className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-xl text-xs font-semibold transition border border-blue-100"
                                        >
                                            <FaHospital size={11} />
                                            {hospitalCount} Hospital{hospitalCount !== 1 ? "s" : ""} Subscribed
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Subscribed Hospitals Section ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                            <FaHospital className="text-blue-600" size={15} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-slate-800 text-sm">Hospitals Subscribed to Plans</h2>
                            <p className="text-slate-400 text-xs mt-0.5">All hospitals that have selected a health plan</p>
                        </div>
                    </div>

                    <SubscribedHospitalsList token={token} />
                </div>
            </div>

            {/* ── ADD MODAL ── */}
            {showAddModal && (
                <ModalOverlay onClose={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ width: "min(680px, 95vw)" }}>
                        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-8 py-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-white font-bold text-lg">Add New Plan</h2>
                                <p className="text-blue-200 text-sm mt-0.5">Create a health plan for patients</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="text-white/60 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition"><FaTimes /></button>
                        </div>
                        <div className="px-8 py-7">
                            <div className="grid grid-cols-3 gap-5">
                                {[
                                    { label: "Plan Name",         name: "plan_name",     type: "text",   placeholder: "e.g. Basic Health Plan" },
                                    { label: "Duration (months)", name: "plan_duration", type: "number", placeholder: "e.g. 3" },
                                    { label: "Price (₹)",         name: "plan_price",    type: "number", placeholder: "e.g. 999" },
                                ].map(({ label, name, type, placeholder }) => (
                                    <div key={name}>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
                                        <input type={type} value={addForm[name]} placeholder={placeholder}
                                            onChange={e => setAddForm({ ...addForm, [name]: e.target.value })}
                                            className={inputClass} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-8 pb-7 flex gap-3">
                            <button onClick={handleCreate} disabled={saving}
                                className="save-btn flex items-center justify-center gap-2 text-white px-8 py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
                                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaSave size={13} />}
                                {saving ? "Creating..." : "Create Plan"}
                            </button>
                            <button onClick={() => setShowAddModal(false)}
                                className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-8 py-3 rounded-xl text-sm font-semibold transition">
                                Cancel
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* ── EDIT MODAL ── */}
            {showEditModal && selectedPlan && (
                <ModalOverlay onClose={() => setShowEditModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ width: "min(680px, 95vw)" }}>
                        <div className={`bg-gradient-to-r ${planColor(plans.indexOf(selectedPlan)).bg} px-8 py-6 flex justify-between items-center`}>
                            <div>
                                <h2 className="text-white font-bold text-lg">Edit Plan</h2>
                                <p className="text-white/70 text-sm mt-0.5">{selectedPlan.plan_name}</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="text-white/60 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition"><FaTimes /></button>
                        </div>
                        <div className="mx-8 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-6">
                            <div><p className="text-xs text-slate-400">Price</p><p className="text-lg font-bold text-slate-700">₹{selectedPlan.plan_price}</p></div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div><p className="text-xs text-slate-400">Duration</p><p className="text-lg font-bold text-slate-700">{selectedPlan.plan_duration} mo</p></div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div>
                                <p className="text-xs text-slate-400">Status</p>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBadge(selectedPlan.plan_status)}`}>{selectedPlan.plan_status}</span>
                            </div>
                        </div>
                        <div className="px-8 py-7">
                            <div className="grid grid-cols-3 gap-5">
                                {[
                                    { label: "Plan Name",         name: "plan_name",     type: "text" },
                                    { label: "Duration (months)", name: "plan_duration", type: "number" },
                                    { label: "Price (₹)",         name: "plan_price",    type: "number" },
                                ].map(({ label, name, type }) => (
                                    <div key={name}>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
                                        <input type={type} value={editForm[name]}
                                            onChange={e => setEditForm({ ...editForm, [name]: e.target.value })}
                                            className={inputClass} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-8 pb-7 flex gap-3">
                            <button onClick={handleUpdate} disabled={saving}
                                className="save-btn flex items-center justify-center gap-2 text-white px-8 py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
                                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaSave size={13} />}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button onClick={() => setShowEditModal(false)}
                                className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-8 py-3 rounded-xl text-sm font-semibold transition">
                                Cancel
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* ── VIEW MODAL ── */}
            {showViewModal && selectedPlan && (
                <ModalOverlay onClose={() => setShowViewModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ width: "min(600px, 95vw)" }}>
                        <div className={`bg-gradient-to-r ${planColor(plans.indexOf(selectedPlan)).bg} px-8 py-7 relative overflow-hidden`}>
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                            <div className="relative flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                        <FaLayerGroup className="text-white" size={22} />
                                    </div>
                                    <h2 className="text-white font-bold text-2xl">{selectedPlan.plan_name}</h2>
                                    <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge(selectedPlan.plan_status)} bg-white/90`}>
                                        <FaCheckCircle size={10} /> {selectedPlan.plan_status}
                                    </span>
                                </div>
                                <button onClick={() => setShowViewModal(false)} className="text-white/60 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition ml-4"><FaTimes /></button>
                            </div>
                            <div className="mt-5 flex items-end gap-1">
                                <span className="text-white/70 text-lg">₹</span>
                                <span className="text-5xl font-bold text-white">{selectedPlan.plan_price}</span>
                                <span className="text-white/60 text-base mb-1 ml-1">/ {selectedPlan.plan_duration} mo</span>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {[
                                    { label: "Plan Name",  value: selectedPlan.plan_name },
                                    { label: "Duration",   value: `${selectedPlan.plan_duration} month${selectedPlan.plan_duration > 1 ? "s" : ""}` },
                                    { label: "Price",      value: `₹${selectedPlan.plan_price}` },
                                    { label: "Per Month",  value: `₹${Math.round(selectedPlan.plan_price / selectedPlan.plan_duration)}` },
                                    { label: "Status",     value: selectedPlan.plan_status },
                                    { label: "Date Added", value: new Date(selectedPlan.added_date).toLocaleDateString("en-GB") },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
                                        <p className="text-sm font-bold text-slate-700">{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { setShowViewModal(false); openEdit(selectedPlan); }}
                                    className="btn-edit flex items-center justify-center gap-2 text-white px-8 py-3 rounded-xl text-sm font-semibold">
                                    <FaEdit size={13} /> Edit Plan
                                </button>
                                <button onClick={() => setShowViewModal(false)}
                                    className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-8 py-3 rounded-xl text-sm font-semibold transition">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* ── HOSPITALS FOR THIS PLAN MODAL ── */}
            {showHospitalsModal && selectedPlan && (
                <ModalOverlay onClose={() => setShowHospitalsModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ width: "min(640px, 95vw)", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>

                        <div className={`bg-gradient-to-r ${planColor(plans.indexOf(selectedPlan)).bg} px-6 py-5 flex justify-between items-center shrink-0`}>
                            <div>
                                <h2 className="text-white font-bold text-base">Subscribed Hospitals</h2>
                                <p className="text-white/70 text-xs mt-0.5">{selectedPlan.plan_name} — {planHospitals.length} hospital{planHospitals.length !== 1 ? "s" : ""}</p>
                            </div>
                            <button onClick={() => setShowHospitalsModal(false)} className="text-white/60 hover:text-white text-lg"><FaTimes /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            {hospitalsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : planHospitals.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <FaHospital className="text-slate-300 mb-3" size={36} />
                                    <p className="text-slate-500 font-semibold">No hospitals subscribed</p>
                                    <p className="text-slate-400 text-sm mt-1">No hospital has selected this plan yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {planHospitals.map((sub, i) => {
                                        const h = sub.hospital_id;
                                        return (
                                            <div key={i} className="hosp-card flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <img src={getImageUrl(h?.hospital_img, 'hospital')}
                                                        alt={h?.hospital_name || "Hospital"}
                                                        onError={e => handleImageError(e, 'hospital')}
                                                        className="w-12 h-12 rounded-xl object-cover border-2 border-blue-100 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-700 truncate">{h?.hospital_name || "—"}</p>
                                                    <div className="flex flex-wrap gap-3 mt-1">
                                                        {h?.hospital_email && (
                                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                                <FaEnvelope size={9} /> {h.hospital_email}
                                                            </span>
                                                        )}
                                                        {h?.hospital_address && (
                                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                                <FaMapMarkerAlt size={9} /> {h.hospital_address}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                                        <FaCalendarAlt size={9} />
                                                        {new Date(sub.subscribed_date || sub.createdAt).toLocaleDateString("en-GB")}
                                                    </p>
                                                    <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${
                                                        sub.status === "ACTIVE"
                                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                            : "bg-red-100 text-red-600 border-red-200"
                                                    }`}>
                                                        {sub.status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="px-5 py-4 border-t border-slate-100 shrink-0">
                            <button onClick={() => setShowHospitalsModal(false)}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold transition">
                                Close
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}
        </div>
    );
};

// ── Subscribed Hospitals List (full list below cards) ──
const SubscribedHospitalsList = ({ token }) => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // ── changed from 8 → 5 ──
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get("https://carexa-backend.vercel.app/planapi/all-subscriptions",
                    { headers: { Authorization: `Bearer ${token}` } });
                setSubscriptions(res.data.subscriptions || []);
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const filtered = subscriptions.filter(s =>
        s.hospital_id?.hospital_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.plan_id?.plan_name?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };

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
        <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div>
            <div className="px-6 py-3 border-b border-slate-100">
                <div className="relative max-w-sm">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input type="text" placeholder="Search hospital or plan..."
                        value={search} onChange={e => handleSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50" />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <FaHospital className="text-slate-300 mb-3" size={36} />
                    <p className="text-slate-500 font-semibold">No subscriptions found</p>
                    <p className="text-slate-400 text-sm mt-1">No hospital has subscribed to any plan yet</p>
                </div>
            ) : (
                <div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {["#","Hospital","Plan","Price","Duration","Subscribed On","Status"].map(h => (
                                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginated.map((sub, i) => (
                                    <tr key={sub._id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 text-sm text-slate-400">{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                    <img src={getImageUrl(sub.hospital_id?.hospital_img, 'hospital')}
                                                        onError={e => handleImageError(e, 'hospital')}
                                                        className="w-8 h-8 rounded-lg object-cover shrink-0" alt="" />
                                                <p className="text-sm font-semibold text-slate-700">{sub.hospital_id?.hospital_name || "—"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-indigo-600">{sub.plan_id?.plan_name || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                            ₹{sub.plan_id?.plan_price || "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                                                <FaClock size={9} /> {sub.plan_id?.plan_duration} mo
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(sub.subscribed_date || sub.createdAt).toLocaleDateString("en-GB")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                                                sub.status === "ACTIVE"
                                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                    : "bg-red-100 text-red-600 border-red-200"
                                            }`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-xs text-slate-400 font-medium">
                                Showing <span className="text-slate-600 font-semibold">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}</span>–<span className="text-slate-600 font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of <span className="text-slate-600 font-semibold">{filtered.length}</span> subscriptions
                            </p>
                            <div className="flex items-center gap-1">

                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1.5 px-3 h-9 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-xs font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                                >&#8249; Prev</button>

                                <div className="flex items-center gap-1 mx-1">
                                    {getPageNumbers().map((item, idx) =>
                                        item === "..." ? (
                                            <span key={"dots-" + idx} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm select-none">&#8230;</span>
                                        ) : (
                                            <button key={item}
                                                onClick={() => setCurrentPage(item)}
                                                className={`w-9 h-9 flex items-center justify-center text-xs font-semibold rounded-lg transition shadow-sm ${
                                                    currentPage === item
                                                        ? "bg-blue-600 text-white border border-blue-600 shadow-blue-200 shadow-md"
                                                        : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                                                }`}
                                            >{item}</button>
                                        )
                                    )}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1.5 px-3 h-9 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-xs font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                                >Next &#8250;</button>

                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPlans;