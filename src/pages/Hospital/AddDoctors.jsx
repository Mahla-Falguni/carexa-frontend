import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import {
    FaUserMd, FaEnvelope, FaPhone, FaStethoscope,
    FaClock, FaRupeeSign, FaCamera, FaArrowLeft, FaPlus
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AddDoctors = () => {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        consultation_fee: "",
        experience_years: "",
        role: "DOCTOR"
    });

    const [img, setImg] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImg(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("HospitalToken");
            const data = new FormData();

            for (let key in formData) {
                data.append(key, formData[key]);
            }
            if (img) data.append("img", img);

            const res = await axios.post(
                "http://localhost:5000/hospitalapi/add-doctor-employee",
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Swal.fire({
                icon: "success",
                title: "Doctor Added!",
                text: res.data.message || "Doctor has been added successfully.",
                timer: 1800,
                showConfirmButton: false
            });

            setFormData({ name: "", email: "", phone: "", specialization: "", consultation_fee: "", experience_years: "", role: "DOCTOR" });
            setImg(null);
            setPreview(null);

        } catch (error) {
            Swal.fire("Error", error?.response?.data?.message || "Failed to add doctor", "error");
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { label: "Doctor Name",      name: "name",             type: "text",   placeholder: "e.g. Dr. Rahul Shah",   icon: <FaUserMd /> },
        { label: "Email Address",    name: "email",            type: "email",  placeholder: "doctor@email.com",      icon: <FaEnvelope /> },
        { label: "Phone Number",     name: "phone",            type: "text",   placeholder: "+91 XXXXX XXXXX",       icon: <FaPhone /> },
        { label: "Specialization",   name: "specialization",   type: "text",   placeholder: "e.g. Cardiologist",     icon: <FaStethoscope /> },
        { label: "Experience (Yrs)", name: "experience_years", type: "number", placeholder: "e.g. 5",                icon: <FaClock /> },
        { label: "Consultation Fee", name: "consultation_fee", type: "number", placeholder: "e.g. 500",              icon: <FaRupeeSign /> },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 p-6 flex items-center justify-center">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
                .add-doctor { font-family: 'DM Sans', sans-serif; }
                .page-title { font-family: 'Playfair Display', serif; }
                .field-input { transition: all 0.2s ease; }
                .field-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); outline: none; }
                .submit-btn { background: linear-gradient(135deg, #1d4ed8, #4f46e5); transition: all 0.2s; }
                .submit-btn:hover { background: linear-gradient(135deg, #1e40af, #4338ca); transform: translateY(-1px); box-shadow: 0 8px 25px rgba(79,70,229,0.35); }
                .submit-btn:disabled { opacity: 0.6; transform: none; }
                .back-btn:hover { background: #f1f5f9; }
            `}</style>

            <div className="add-doctor w-full max-w-2xl">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="back-btn flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium mb-6 px-3 py-2 rounded-lg transition"
                >
                    <FaArrowLeft size={12} /> Back
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-8 py-7 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }}>
                        </div>
                        <div className="relative flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <FaUserMd className="text-white" size={22} />
                            </div>
                            <div>
                                <h1 className="page-title text-2xl text-white font-bold">Add New Doctor</h1>
                                <p className="text-blue-200 text-sm mt-0.5">Register a doctor to your hospital</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">

                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-4 border-blue-50 shadow-sm">
                                        <FaUserMd size={32} className="text-blue-400" />
                                    </div>
                                )}
                                <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl cursor-pointer shadow-lg transition">
                                    <FaCamera size={13} />
                                    <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                                </label>
                            </div>
                            <p className="text-xs text-slate-400 mt-3 font-medium">Click camera to upload doctor photo</p>
                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* Fields Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                                {fields.map(({ label, name, type, placeholder, icon }) => (
                                    <div key={name}>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                            {label}
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                                {icon}
                                            </span>
                                            <input
                                                type={type}
                                                name={name}
                                                value={formData[name]}
                                                placeholder={placeholder}
                                                onChange={handleChange}
                                                required={name !== "experience_years"}
                                                className="field-input w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 bg-slate-50"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="submit-btn flex-1 flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus size={13} /> Add Doctor
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition"
                                >
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

export default AddDoctors;