import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    FaHospital, FaEnvelope, FaLock, FaPhone,
    FaMapMarkerAlt, FaCamera, FaArrowLeft, FaPaperPlane
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const GuestHospitalRequest = () => {

    const [formData, setFormData] = useState({
        hospital_name: "",
        hospital_email: "",
        hospital_pass: "",
        hospital_address: "",
        hospital_phone: "",
    });

    const [hospitalImg, setHospitalImg] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setHospitalImg(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append("hospital_name",    formData.hospital_name);
            data.append("hospital_email",   formData.hospital_email);
            data.append("hospital_pass",    formData.hospital_pass);
            data.append("hospital_address", formData.hospital_address);
            data.append("hospital_phone",   formData.hospital_phone);
            if (hospitalImg) data.append("hospital_img", hospitalImg);

            const res = await axios.post(
                "https://carexa-backend.vercel.app/guestapi/hospital-request",
                data
            );

            Swal.fire({
                icon: "success",
                title: "Request Sent!",
                text: res.data.message || "Your hospital registration request has been submitted. We'll review it shortly.",
                timer: 3000,
                showConfirmButton: false
            });

            setFormData({ hospital_name: "", hospital_email: "", hospital_pass: "", hospital_address: "", hospital_phone: "" });
            setHospitalImg(null);
            setPreview(null);

        } catch (error) {
            Swal.fire("Error", error?.response?.data?.message || "Failed to send hospital request", "error");
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { label: "Hospital Name",  name: "hospital_name",  type: "text",     placeholder: "e.g. City General Hospital", icon: <FaHospital /> },
        { label: "Email Address",  name: "hospital_email", type: "email",    placeholder: "hospital@email.com",          icon: <FaEnvelope /> },
        { label: "Password",       name: "hospital_pass",  type: "password", placeholder: "Set a secure password",       icon: <FaLock /> },
        { label: "Phone Number",   name: "hospital_phone", type: "text",     placeholder: "+91 XXXXX XXXXX",             icon: <FaPhone /> },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex items-center justify-center p-6 relative overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .req-page   { font-family: 'DM Sans', sans-serif; }
                .page-title { font-family: 'Playfair Display', serif; }
                .field-input { transition: all 0.2s ease; }
                .field-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); outline: none; }
                .submit-btn { background: linear-gradient(135deg, #2563eb, #4f46e5); transition: all 0.2s; }
                .submit-btn:hover { background: linear-gradient(135deg, #1d4ed8, #4338ca); transform: translateY(-1px); box-shadow: 0 8px 25px rgba(79,70,229,0.4); }
                .submit-btn:disabled { opacity: 0.6; transform: none; }
                .bg-orb { position: absolute; border-radius: 9999px; filter: blur(80px); opacity: 0.06; pointer-events: none; }
                .upload-zone { transition: all 0.2s; border: 2px dashed rgba(255,255,255,0.15); }
                .upload-zone:hover { border-color: #60a5fa; background: rgba(96,165,250,0.05); }
            `}</style>

            {/* Background orbs */}
            <div className="bg-orb w-96 h-96 bg-blue-500 -top-20 -left-20"></div>
            <div className="bg-orb w-80 h-80 bg-indigo-600 -bottom-10 -right-10"></div>

            <div className="req-page w-full max-w-2xl relative">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition"
                >
                    <FaArrowLeft size={12} /> Back
                </button>

                {/* Card */}
                <div className="bg-white border border-slate-100 shadow-lg rounded-2xl shadow-2xl overflow-hidden">

                    {/* Top accent */}
                    <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500"></div>

                    <div className="p-8">

                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                                <FaHospital className="text-white" size={20} />
                            </div>
                            <div>
                                <h1 className="page-title text-2xl text-slate-800 font-bold">Hospital Registration</h1>
                                <p className="text-slate-500 text-sm mt-0.5">Submit a request to join our network</p>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center">
                                        <FaHospital size={30} className="text-blue-300" />
                                    </div>
                                )}
                                <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl cursor-pointer shadow-lg transition">
                                    <FaCamera size={13} />
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>
                            <p className="text-xs text-slate-400 mt-3">Click camera to upload hospital image</p>
                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* Fields Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                {fields.map(({ label, name, type, placeholder, icon }) => (
                                    <div key={name}>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                            {label}
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{icon}</span>
                                            <input
                                                type={type}
                                                name={name}
                                                value={formData[name]}
                                                placeholder={placeholder}
                                                onChange={handleChange}
                                                required
                                                className="field-input w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 bg-slate-50"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Address — full width */}
                            <div className="mb-8">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Address
                                </label>
                                <div className="relative">
                                    <FaMapMarkerAlt className="absolute left-3 top-3 text-slate-400 text-sm" />
                                    <textarea
                                        name="hospital_address"
                                        placeholder="Full hospital address..."
                                        value={formData.hospital_address}
                                        onChange={handleChange}
                                        rows={3}
                                        required
                                        className="field-input w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 bg-slate-50 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="submit-btn w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FaPaperPlane size={13} /> Send Registration Request
                                    </>
                                )}
                            </button>

                        </form>

                        <p className="text-center text-slate-400 text-xs mt-4">
                            Your request will be reviewed by our admin team within 24 hours.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestHospitalRequest;