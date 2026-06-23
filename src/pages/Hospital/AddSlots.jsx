import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaCalendarAlt, FaUserMd, FaClock, FaPlus, FaExclamationTriangle } from "react-icons/fa";

const TIME_SLOTS = [
    "9:00 AM", "9:30 AM",
    "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM",
    "1:00 PM", "1:30 PM",
    "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM",
    "4:00 PM", "4:30 PM",
    "5:00 PM", "5:30 PM",
];

const AddAppointmentSlot = () => {

    const [doctors, setDoctors]             = useState([]);
    const [existingSlots, setExistingSlots] = useState([]);
    const [loading, setLoading]             = useState(false);
    const [formData, setFormData]           = useState({
        doctor_id: "", appointment_date: "", start_time: "", end_time: ""
    });

    useEffect(() => { fetchDoctors(); }, []);

    useEffect(() => {
        if (formData.doctor_id && formData.appointment_date) {
            fetchExistingSlots(formData.doctor_id, formData.appointment_date);
        } else {
            setExistingSlots([]);
        }
    }, [formData.doctor_id, formData.appointment_date]);

    const fetchDoctors = async () => {
        try {
            const res = await axios.get(
                "https://carexa-backend.vercel.app/hospitalapi/getAllDoctors",
                { headers: { Authorization: `Bearer ${localStorage.getItem("HospitalToken")}` } }
            );
            setDoctors(res.data.doctors || []);
        } catch (error) {
            console.log("Error fetching doctors:", error);
        }
    };

    const fetchExistingSlots = async (doctorId, date) => {
        try {
            const res = await axios.get(
                `http://localhost:5000/hospitalapi/get-slots-by-doctor?doctor_id=${doctorId}&date=${date}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("HospitalToken")}` } }
            );
            setExistingSlots(res.data.slots || []);
        } catch (error) {
            setExistingSlots([]);
        }
    };

    const isSlotTaken = (time) => existingSlots.some(slot => slot.start_time === time);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStartTimeChange = (e) => {
        const selected = e.target.value;
        if (isSlotTaken(selected)) {
            Swal.fire({ icon: "warning", title: "Slot Already Exists", text: `A slot at ${selected} already exists for this doctor on this date.` });
            setFormData(prev => ({ ...prev, start_time: "", end_time: "" }));
            return;
        }
        const index = TIME_SLOTS.indexOf(selected);
        const autoEnd = index !== -1 && index + 1 < TIME_SLOTS.length ? TIME_SLOTS[index + 1] : "";
        setFormData(prev => ({ ...prev, start_time: selected, end_time: autoEnd }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSlotTaken(formData.start_time)) {
            Swal.fire({ icon: "warning", title: "Slot Already Exists", text: `A slot at ${formData.start_time} already exists for this doctor on this date.` });
            return;
        }
        setLoading(true);
        try {
            await axios.post(
                "http://localhost:5000/hospitalapi/create-appointment-slots",
                formData,
                { headers: { Authorization: `Bearer ${localStorage.getItem("HospitalToken")}` } }
            );
            Swal.fire({ icon: "success", title: "Slot Created!", text: "Appointment slot added successfully.", timer: 1500, showConfirmButton: false });
            setFormData({ doctor_id: "", appointment_date: "", start_time: "", end_time: "" });
            setExistingSlots([]);
        } catch (error) {
            Swal.fire({ icon: "warning", title: "Slot Already Exists", text: error?.response?.data?.message || "Failed to create slot" });
        } finally {
            setLoading(false);
        }
    };

    const selectClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-slate-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .slot-page  { font-family: 'DM Sans', sans-serif; }
                .page-title { font-family: 'Playfair Display', serif; }
                .submit-btn { background: linear-gradient(135deg, #2563eb, #4f46e5); transition: all 0.2s; }
                .submit-btn:hover { background: linear-gradient(135deg, #1d4ed8, #4338ca); transform: translateY(-1px); box-shadow: 0 8px 25px rgba(79,70,229,0.35); }
                .submit-btn:disabled { opacity: 0.6; transform: none; }
            `}</style>

            <div className="slot-page max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="page-title text-3xl text-slate-800 mb-1">Add Appointment Slot</h1>
                    <p className="text-slate-500 text-sm">Create a new appointment slot for a doctor</p>
                </div>

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
                                <p className="text-white font-semibold">New Appointment Slot</p>
                                <p className="text-blue-200 text-xs mt-0.5">Select a doctor, date and time to create a slot</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Doctor Select */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FaUserMd size={11} className="text-blue-500" /> Select Doctor
                                </label>
                                <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} className={selectClass} required>
                                    <option value="">Choose Doctor</option>
                                    {doctors.map((doc) => (
                                        <option key={doc._id} value={doc._id}>
                                            {doc.name} — {doc.specialization}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date — Calendar Picker */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FaCalendarAlt size={11} className="text-blue-500" /> Appointment Date
                                </label>
                                <input
                                    type="date"
                                    name="appointment_date"
                                    value={formData.appointment_date}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={handleChange}
                                    className={selectClass}
                                    required
                                />
                            </div>

                            {/* Existing Slots Warning */}
                            {existingSlots.length > 0 && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                    <FaExclamationTriangle className="text-amber-500 shrink-0 mt-0.5" size={14} />
                                    <div>
                                        <p className="text-amber-700 font-semibold text-sm mb-2">
                                            Already created slots for this doctor on this date:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {existingSlots.map((slot, i) => (
                                                <span key={i} className="px-3 py-1 bg-amber-200 text-amber-800 text-xs font-semibold rounded-full">
                                                    {slot.start_time} – {slot.end_time}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Time Row */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <FaClock size={11} className="text-blue-500" /> Start Time
                                    </label>
                                    <select name="start_time" value={formData.start_time} onChange={handleStartTimeChange} className={selectClass} required>
                                        <option value="">Select Start Time</option>
                                        {TIME_SLOTS.map((slot) => (
                                            <option key={slot} value={slot} disabled={isSlotTaken(slot)} style={isSlotTaken(slot) ? { color: "#aaa" } : {}}>
                                                {slot}{isSlotTaken(slot) ? " — Taken" : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <FaClock size={11} className="text-blue-500" /> End Time
                                    </label>
                                    <select name="end_time" value={formData.end_time} onChange={handleChange} className={selectClass} required>
                                        <option value="">Select End Time</option>
                                        {TIME_SLOTS.map((slot) => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="submit-btn flex items-center gap-2 text-white px-8 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus size={12} /> Add Slot
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddAppointmentSlot;