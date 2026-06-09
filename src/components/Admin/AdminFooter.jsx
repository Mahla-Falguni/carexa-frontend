import { FaHospital, FaHeart, FaShieldAlt, FaEnvelope } from "react-icons/fa";

const AdminFooter = () => {
    const year = new Date().getFullYear();

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
                .footer-font  { font-family: 'DM Sans', sans-serif; }
                .brand-font   { font-family: 'Playfair Display', serif; }
                .footer-link  { transition: color 0.15s; }
                .footer-link:hover { color: #60a5fa; }
            `}</style>

            <footer className="footer-font bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-t border-slate-800 mt-auto">

                {/* Main Footer Row */}
                <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* Brand */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <FaHospital className="text-white" size={12} />
                        </div>
                        <span className="brand-font text-lg text-white tracking-tight">Carexa</span>
                        <span className="text-slate-600 text-sm hidden sm:inline">|</span>
                        <span className="text-slate-400 text-xs hidden sm:inline">Admin Panel</span>
                    </div>

                    {/* Copyright */}
                    <p className="text-slate-400 text-xs flex items-center gap-1.5">
                        © {year} Carexa. Designed and Developed by Survivor Infotech 
                        <FaHeart className="text-red-400" size={10} />
                    </p>

                    {/* Right Links */}
                    <div className="flex items-center gap-5 text-xs text-slate-400">
                        <a href="#" className="footer-link flex items-center gap-1.5">
                            <FaShieldAlt size={10} /> Privacy
                        </a>
                        <a href="#" className="footer-link flex items-center gap-1.5">
                            <FaEnvelope size={10} /> Support
                        </a>
                        <span className="text-slate-600">v1.0.0</span>
                    </div>

                </div>

            </footer>
        </>
    );
};

export default AdminFooter;