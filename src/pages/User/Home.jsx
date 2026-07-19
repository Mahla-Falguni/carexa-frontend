import { Link, useNavigate } from "react-router-dom";
import {
    FaHospital, FaUserMd, FaCalendarCheck, FaShieldAlt,
    FaArrowRight, FaStar, FaCheckCircle, FaHeartbeat,
    FaAmbulance, FaFlask, FaStethoscope, FaUserShield,
    FaUserNurse, FaUsers, FaTimes, FaSignInAlt
} from "react-icons/fa";
import { useState } from "react";

const Home = () => {
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [homeSearch, setHomeSearch]       = useState("");
    const navigate = useNavigate();

    const handleHomeSearchSubmit = (e) => {
        e.preventDefault();
        if (homeSearch.trim()) {
            const token = localStorage.getItem("UserToken");
            const targetPath = token ? "/userdashboard/hospitals" : "/hospitals";
            navigate(`${targetPath}?search=${encodeURIComponent(homeSearch.trim())}`);
        }
    };

    const roles = [
        
        {
            key: "hospital",
            title: "Hospital Admin",
            subtitle: "Hospital Management",
            icon: <FaHospital size={28} />,
            description: "Manage your hospital, doctors, appointments and patient records.",
            gradient: "from-blue-600 to-blue-800",
            bg: "bg-blue-50",
            border: "border-blue-200",
            badge: "bg-blue-100 text-blue-700",
            path: "/hospitallogin",
        },
        {
            key: "patient",
            title: "Patient",
            subtitle: "Book Appointments",
            icon: <FaUsers size={28} />,
            description: "Book appointments, view medical records and manage your health journey.",
            gradient: "from-emerald-500 to-emerald-700",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            badge: "bg-emerald-100 text-emerald-700",
            path: "/login",
        },
        {
            key: "staff",
            title: "Hospital Staff",
            subtitle: "Doctors, Nurses & Receptionists",
            icon: <FaUserNurse size={28} />,
            description: "Access patient schedules, appointments and hospital operations.",
            gradient: "from-violet-600 to-violet-800",
            bg: "bg-violet-50",
            border: "border-violet-200",
            badge: "bg-violet-100 text-violet-700",
            path: "/staff-login",
        },
    ];

    const stats = [
        { value: "500+",    label: "Registered Hospitals" },
        { value: "2,000+",  label: "Expert Doctors" },
        { value: "50,000+", label: "Happy Patients" },
        { value: "98%",     label: "Satisfaction Rate" },
    ];

    const features = [
        { icon: <FaHospital size={28} />,      title: "Multiple Hospitals", desc: "Browse and compare hospitals across cities with detailed profiles, ratings, and available services.", color: "from-blue-500 to-blue-600" },
        { icon: <FaUserMd size={28} />,         title: "Expert Doctors",     desc: "Connect with verified, experienced specialists across every medical field and book instantly.",           color: "from-indigo-500 to-indigo-600" },
        { icon: <FaCalendarCheck size={28} />,  title: "Easy Appointments",  desc: "Schedule, reschedule, or cancel appointments in seconds from any device, anywhere.",                    color: "from-violet-500 to-violet-600" },
        { icon: <FaShieldAlt size={28} />,      title: "Secure & Private",   desc: "Your medical data is encrypted and protected. We never share your information.",                        color: "from-emerald-500 to-emerald-600" },
    ];

    const services = [
        { icon: <FaCalendarCheck size={22} />, title: "Online Appointment",   desc: "Book instantly, skip the wait.",          bg: "bg-blue-50",    text: "text-blue-600" },
        { icon: <FaStethoscope size={22} />,   title: "Doctor Consultation",  desc: "Connect with verified specialists.",       bg: "bg-indigo-50",  text: "text-indigo-600" },
        { icon: <FaFlask size={22} />,         title: "Lab Reports",          desc: "View and share test results easily.",      bg: "bg-violet-50",  text: "text-violet-600" },
        { icon: <FaAmbulance size={22} />,     title: "Emergency Care",       desc: "Locate nearest emergency units.",          bg: "bg-red-50",     text: "text-red-500" },
        { icon: <FaHeartbeat size={22} />,     title: "Health Monitoring",    desc: "Track your health over time.",             bg: "bg-pink-50",    text: "text-pink-600" },
        { icon: <FaHospital size={22} />,      title: "Hospital Info",        desc: "Explore facilities and ratings.",          bg: "bg-emerald-50", text: "text-emerald-600" },
    ];

    const steps = [
        { num: "01", title: "Create Your Account", desc: "Sign up in minutes. No complicated forms — just your basic info to get started." },
        { num: "02", title: "Find a Doctor",        desc: "Search by specialization, hospital, or location. Read reviews and check availability." },
        { num: "03", title: "Book Appointment",     desc: "Choose a time slot that works for you and confirm your booking instantly." },
    ];

    const testimonials = [
        { name: "Priya Sharma", role: "Patient", text: "Carexa made it incredibly easy to find a specialist and book an appointment the same day. Highly recommended!", rating: 5 },
        { name: "Rahul Mehta",  role: "Patient", text: "The interface is so clean and easy. I rescheduled my appointment in under a minute. Amazing experience!",        rating: 5 },
        { name: "Anjali Patel", role: "Patient", text: "Finally a healthcare platform that actually works well. Found the perfect doctor within minutes.",               rating: 5 },
    ];

    return (
        <div className="min-h-screen bg-white">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap');
                body, * { font-family: 'DM Sans', sans-serif; }
                .display-font { font-family: 'Playfair Display', serif; }
                .hero-gradient { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1e40af 100%); }
                .feature-card { transition: all 0.25s ease; }
                .feature-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.12); }
                .service-card { transition: all 0.2s ease; }
                .service-card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
                .cta-gradient { background: linear-gradient(135deg, #1e40af, #1d4ed8, #2563eb); }
                .stat-card { border-left: 3px solid #3b82f6; }
                .hero-dot { background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%); }
                @keyframes fadeUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
                .fade-up   { animation: fadeUp 0.7s ease forwards; }
                .fade-up-2 { animation: fadeUp 0.7s 0.15s ease both; }
                .fade-up-3 { animation: fadeUp 0.7s 0.3s  ease both; }
                @keyframes modalIn { from { opacity:0; transform: scale(0.95) translateY(16px); } to { opacity:1; transform: scale(1) translateY(0); } }
                .modal-animate { animation: modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
                .role-card { transition: all 0.2s ease; cursor: pointer; }
                .role-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
                .role-card:hover .role-arrow { transform: translateX(4px); }
                .role-arrow { transition: transform 0.2s; }
            `}</style>

            {/* ── HERO ── */}
            <section className="hero-gradient min-h-screen flex items-center relative overflow-hidden">
                <div className="absolute top-20 right-10 w-80 h-80 rounded-full hero-dot opacity-30 pointer-events-none"></div>
                <div className="absolute bottom-10 left-5 w-64 h-64 rounded-full hero-dot opacity-20 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 py-24 w-full">
                    <div className="max-w-3xl">
                        <div className="fade-up inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm font-medium mb-8">
                            <FaHeartbeat size={12} />
                            Trusted by 50,000+ patients across India
                        </div>
                        <h1 className="fade-up-2 display-font text-5xl md:text-7xl text-white font-bold leading-tight mb-6">
                            Your Health,<br />
                            <span className="text-blue-400">Our Priority.</span>
                        </h1>
                        <p className="fade-up-3 text-slate-300 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                            Carexa connects you with top hospitals and verified doctors. Book appointments, manage your health records, and get care — all in one place.
                        </p>
                        {/* ── HERO SEARCH BAR ── */}
                        <form onSubmit={handleHomeSearchSubmit} className="fade-up-3 mb-8 max-w-xl flex gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl">
                            <input
                                type="text"
                                value={homeSearch}
                                onChange={(e) => setHomeSearch(e.target.value)}
                                placeholder="Search hospitals by name, city or location..."
                                className="w-full bg-transparent px-4 py-3 text-white placeholder-slate-300 text-sm outline-none"
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold text-sm transition shrink-0 flex items-center gap-2">
                                Search Hospitals
                            </button>
                        </form>
                        <div className="fade-up-3 flex flex-wrap gap-4">
                            <Link to="/register"
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-xl font-semibold text-base transition shadow-lg shadow-blue-500/30">
                                Get Started Free <FaArrowRight size={14} />
                            </Link>
                            {/* ── ROLE LOGIN BUTTON ── */}
                            <button
                                onClick={() => setShowRoleModal(true)}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-base transition backdrop-blur-sm">
                                <FaSignInAlt size={15} /> Sign In
                            </button>
                            <Link to="/guest-hospitalrequest"
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-base transition backdrop-blur-sm">
                                Register Hospital
                            </Link>
                        </div>
                        <div className="fade-up-3 flex flex-wrap gap-6 mt-12">
                            {["Verified Doctors", "Secure Platform", "24/7 Support"].map(t => (
                                <div key={t} className="flex items-center gap-2 text-slate-400 text-sm">
                                    <FaCheckCircle size={13} className="text-emerald-400" /> {t}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="bg-slate-900 py-14">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map(({ value, label }) => (
                        <div key={label} className="stat-card bg-slate-800 rounded-2xl p-6">
                            <p className="display-font text-3xl font-bold text-white mb-1">{value}</p>
                            <p className="text-slate-400 text-sm">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Why Choose Carexa</p>
                        <h2 className="display-font text-4xl md:text-5xl text-slate-900 font-bold mb-4">Everything you need for<br />better healthcare</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">One platform for all your healthcare needs.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map(({ icon, title, desc, color }) => (
                            <div key={title} className="feature-card bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg`}>{icon}</div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Simple Process</p>
                        <h2 className="display-font text-4xl md:text-5xl text-slate-900 font-bold mb-4">How Carexa Works</h2>
                        <p className="text-slate-500 text-lg">Three simple steps to better healthcare</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map(({ num, title, desc }, i) => (
                            <div key={num} className="relative text-center">
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 to-slate-200"></div>
                                )}
                                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                                    <span className="display-font text-white font-bold text-lg">{num}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
                                <p className="text-slate-500 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SERVICES ── */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Our Services</p>
                        <h2 className="display-font text-4xl md:text-5xl text-slate-900 font-bold mb-4">Comprehensive Healthcare Services</h2>
                        <p className="text-slate-500 text-lg max-w-xl mx-auto">Everything you need to manage your health.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map(({ icon, title, desc, bg, text }) => (
                            <div key={title} className="service-card bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-start gap-4">
                                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center ${text} shrink-0`}>{icon}</div>
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
                                    <p className="text-slate-500 text-sm">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Patient Stories</p>
                        <h2 className="display-font text-4xl md:text-5xl text-slate-900 font-bold mb-4">What Our Patients Say</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map(({ name, role, text, rating }) => (
                            <div key={name} className="feature-card bg-white rounded-2xl p-7 shadow-sm border border-slate-100">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(rating)].map((_, i) => <FaStar key={i} className="text-amber-400" size={14} />)}
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-6 italic">"{text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">{name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{name}</p>
                                        <p className="text-slate-400 text-xs">{role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-gradient py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}>
                </div>
                <div className="max-w-3xl mx-auto text-center relative">
                    <p className="text-blue-300 font-semibold text-sm uppercase tracking-widest mb-4">Join Carexa Today</p>
                    <h2 className="display-font text-4xl md:text-5xl text-white font-bold mb-6">
                        Ready to Take Control<br />of Your Health?
                    </h2>
                    <p className="text-blue-200 text-lg mb-10">
                        Join over 50,000 patients who trust Carexa for their healthcare needs.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/register"
                            className="flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-base hover:bg-blue-50 transition shadow-xl">
                            Create Free Account <FaArrowRight size={14} />
                        </Link>
                        <button onClick={() => setShowRoleModal(true)}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold text-base transition">
                            <FaSignInAlt size={14} /> Sign In
                        </button>
                    </div>
                </div>
            </section>

            {/* ── ROLE LOGIN MODAL ── */}
            {showRoleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backdropFilter: "blur(10px)", background: "rgba(10,20,40,0.70)" }}
                    onClick={() => setShowRoleModal(false)}>
                    <div className="modal-animate bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-8 py-6 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-sm">🏥</div>
                                    <span className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Carexa</span>
                                </div>
                                <p className="text-slate-300 text-sm">Select your role to continue</p>
                            </div>
                            <button onClick={() => setShowRoleModal(false)}
                                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
                                <FaTimes size={15} />
                            </button>
                        </div>

                        {/* Role Cards */}
                        <div className="p-6 grid grid-cols-2 gap-4">
                            {roles.map((role) => (
                                <div key={role.key}
                                    className={`role-card ${role.bg} border ${role.border} rounded-2xl p-5 flex flex-col gap-3`}
                                    onClick={() => { setShowRoleModal(false); navigate(role.path); }}>

                                    {/* Icon + Badge */}
                                    <div className="flex items-start justify-between">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${role.gradient} rounded-xl flex items-center justify-center text-white shadow-md`}>
                                            {role.icon}
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${role.badge}`}>
                                            Login
                                        </span>
                                    </div>

                                    {/* Text */}
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base">{role.title}</h3>
                                        <p className="text-xs font-medium text-slate-500 mb-1">{role.subtitle}</p>
                                        <p className="text-xs text-slate-500 leading-relaxed">{role.description}</p>
                                    </div>

                                    {/* Arrow */}
                                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 mt-auto">
                                        Continue <FaArrowRight size={10} className="role-arrow" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6 text-center">
                            <p className="text-slate-400 text-xs">
                                Don't have an account?{" "}
                                <Link to="/register" className="text-blue-600 font-semibold hover:underline"
                                    onClick={() => setShowRoleModal(false)}>
                                    Sign up as Patient
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;