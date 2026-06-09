import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FaCalendarAlt, FaClock, FaArrowLeft, FaSave } from "react-icons/fa";

const TIME_SLOTS = [
    "9:00 AM", "9:30 AM",
    "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM",
    "1:00 PM",  "1:30 PM",
    "2:00 PM",  "2:30 PM",
    "3:00 PM",  "3:30 PM",
    "4:00 PM",  "4:30 PM",
    "5:00 PM",  "5:30 PM",
];

const days   = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const months = [
    { value: "01", label: "January" },  { value: "02", label: "February" },
    { value: "03", label: "March" },    { value: "04", label: "April" },
    { value: "05", label: "May" },      { value: "06", label: "June" },
    { value: "07", label: "July" },     { value: "08", label: "August" },
    { value: "09", label: "September"}, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" }
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 3 }, (_, i) => String(currentYear + i));

const EditSlot = () => {

    const { id }      = useParams();
    const navigate    = useNavigate();
    const token       = localStorage.getItem("HospitalToken");

    const [formData, setFormData] = useState({
        appointment_date: "",
        start_time: "",
        end_time: ""
    });

    const [dateParts, setDateParts] = useState({ day: "", month: "", year: "" });
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);

    // Convert 24hr to 12hr for matching TIME_SLOTS
    const convertTo12Hour = (time) => {
        if (!time) return "";
        const [hour, minute] = time.split(":");
        let h = parseInt(hour);
        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12;
        h = h ? h : 12;
        return `${h}:${minute} ${ampm}`;
    };

    const getSlot = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/hospitalapi/get-slot/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const slot = res.data.slot;
            const dateStr = slot.appointment_date?.split("T")[0] || "";

            // Pre-fill date parts
            if (dateStr) {
                const [y, m, d] = dateStr.split("-");
                setDateParts({ day: d, month: m, year: y });
            }

            setFormData({
                appointment_date: dateStr,
                start_time: slot.start_time || convertTo12Hour(slot.start_time),
                end_time:   slot.end_time   || convertTo12Hour(slot.end_time),
            });
        } catch (error) {
            console.log("Error fetching slot", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { getSlot(); }, []);

    const handleDatePartChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...dateParts, [name]: value };
        setDateParts(updated);
        if (updated.day && updated.month && updated.year) {
            setFormData(prev => ({ ...prev, appointment_date: `${updated.year}-${updated.month}-${updated.day}` }));
        }
    };

    const handleStartTimeChange = (e) => {
        const selected = e.target.value;
        const index    = TIME_SLOTS.indexOf(selected);
        const autoEnd  = index !== -1 && index + 1 < TIME_SLOTS.length ? TIME_SLOTS[index + 1] : "";
        setFormData({ ...formData, start_time: selected, end_time: autoEnd });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post(
                `http://localhost:5000/hospitalapi/update-slot/${id}`,
                {
                    appointment_date: formData.appointment_date,
                    start_time:       formData.start_time,
                    end_time:         formData.end_time
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire({ icon: "success", title: "Slot Updated!", timer: 1500, showConfirmButton: false });
            navigate("/hospital-dashboard/slots");
        } catch {
            Swal.fire({ icon: "error", title: "Error", text: "Failed to update slot" });
        } finally {
            setSaving(false);
        }
    };

    const selectClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-slate-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition";

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading slot...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6 flex items-center justify-center">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .edit-page  { font-family: 'DM Sans', sans-serif; }
                .page-title { font-family: 'Playfair Display', serif; }
                .save-btn   { background: linear-gradient(135deg,#2563eb,#4f46e5); transition: all 0.2s; }
                .save-btn:hover { background: linear-gradient(135deg,#1d4ed8,#4338ca); transform: translateY(-1px); box-shadow: 0 8px 25px rgba(79,70,229,0.35); }
                .save-btn:disabled { opacity: 0.6; transform: none; }
                .back-btn:hover { background: #f1f5f9; }
            `}</style>

            <div className="edit-page w-full max-w-2xl">

                {/* Back button */}
                <button onClick={() => navigate(-1)}
                    className="back-btn flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium mb-6 px-3 py-2 rounded-lg transition">
                    <FaArrowLeft size={12} /> Back to Slots
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                    {/* Banner */}
                    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-8 py-6 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }}>
                        </div>
                        <div className="relative flex items-center gap-4">
                            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                                <FaCalendarAlt className="text-white" size={18} />
                            </div>
                            <div>
                                <p className="page-title text-xl text-white font-bold">Edit Appointment Slot</p>
                                <p className="text-blue-200 text-xs mt-0.5">Update the date and time for this slot</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Date */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FaCalendarAlt size={11} className="text-blue-500" /> Appointment Date
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <select name="day" value={dateParts.day} onChange={handleDatePartChange} className={selectClass} required>
                                        <option value="">Day</option>
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <select name="month" value={dateParts.month} onChange={handleDatePartChange} className={selectClass} required>
                                        <option value="">Month</option>
                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                    <select name="year" value={dateParts.year} onChange={handleDatePartChange} className={selectClass} required>
                                        <option value="">Year</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Time Row */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <FaClock size={11} className="text-blue-500" /> Start Time
                                    </label>
                                    <select value={formData.start_time} onChange={handleStartTimeChange} className={selectClass} required>
                                        <option value="">Select Start Time</option>
                                        {TIME_SLOTS.map(slot => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <FaClock size={11} className="text-blue-500" /> End Time
                                    </label>
                                    <select value={formData.end_time}
                                        onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                        className={selectClass} required>
                                        <option value="">Select End Time</option>
                                        {TIME_SLOTS.map(slot => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Current values display */}
                            {formData.start_time && formData.end_time && formData.appointment_date && (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Selected Slot Preview</p>
                                    <p className="text-sm text-slate-700">
                                        <span className="font-semibold">Date:</span>{" "}
                                        {new Date(formData.appointment_date).toLocaleDateString("en-GB")}
                                    </p>
                                    <p className="text-sm text-slate-700 mt-1">
                                        <span className="font-semibold">Time:</span>{" "}
                                        {formData.start_time} — {formData.end_time}
                                    </p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={saving}
                                    className="save-btn flex-1 flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <><FaSave size={13} /> Update Slot</>
                                    )}
                                </button>
                                <button type="button" onClick={() => navigate(-1)}
                                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition">
                                    Cancel
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditSlot;