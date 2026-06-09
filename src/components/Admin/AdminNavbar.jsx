import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    FaFacebook, FaInstagram, FaTwitter,
    FaHospital, FaBars, FaTimes, FaUserShield
} from 'react-icons/fa'

const AdminNavbar = () => {

    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { label: "Home",       path: "/" },
        { label: "About",      path: "/about" },
        { label: "Services",   path: "/services" },
        { label: "Contact",    path: "/contact" },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700;800&display=swap');
                .navbar-font { font-family: 'DM Sans', sans-serif; }
                .brand-font  { font-family: 'Playfair Display', serif; }
                .top-bar-link { transition: color 0.15s; }
                .top-bar-link:hover { color: #93c5fd; }
                .nav-link { position: relative; transition: color 0.2s; }
                .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #60a5fa; border-radius: 2px; transition: width 0.25s; }
                .nav-link:hover::after, .nav-link.active::after { width: 100%; }
                .nav-link.active { color: #93c5fd; }
                .login-btn { background: linear-gradient(135deg, #3b82f6, #6366f1); transition: all 0.2s; }
                .login-btn:hover { background: linear-gradient(135deg, #2563eb, #4f46e5); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }
                .mobile-link { transition: all 0.15s; border-left: 3px solid transparent; }
                .mobile-link:hover { border-left-color: #60a5fa; background: rgba(255,255,255,0.05); padding-left: 16px; }
                .mobile-link.active { border-left-color: #60a5fa; color: #93c5fd; }
                .navbar-shadow { box-shadow: 0 4px 30px rgba(0,0,0,0.3); }
            `}</style>

            {/* Top Bar */}
            <div className="navbar-font bg-slate-950 text-slate-400 text-xs border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
                    <p className="hidden sm:block">
                        🏥 <span className="text-slate-300">Carexa</span> — Advanced Hospital Management System
                    </p>
                    <div className="flex items-center gap-4 ml-auto">
                        <a href="#" className="top-bar-link flex items-center gap-1.5">
                            <FaFacebook size={12} /> <span className="hidden sm:inline">Facebook</span>
                        </a>
                        <a href="#" className="top-bar-link flex items-center gap-1.5">
                            <FaInstagram size={12} /> <span className="hidden sm:inline">Instagram</span>
                        </a>
                        <a href="#" className="top-bar-link flex items-center gap-1.5">
                            <FaTwitter size={12} /> <span className="hidden sm:inline">Twitter</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <nav className={`navbar-font sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-slate-900/95 backdrop-blur-md navbar-shadow"
                    : "bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900"
            }`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                            <FaHospital className="text-white" size={16} />
                        </div>
                        <span className="brand-font text-2xl text-white tracking-tight">
                            Carexa
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map(({ label, path }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`nav-link text-sm font-medium text-slate-300 hover:text-white ${isActive(path) ? "active" : ""}`}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            to="/AdminLogin"
                            className="login-btn flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
                        >
                            <FaUserShield size={13} /> Admin Login
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden text-slate-300 hover:text-white transition"
                    >
                        {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur px-6 py-4 space-y-1">
                        {navLinks.map(({ label, path }) => (
                            <Link
                                key={path}
                                to={path}
                                onClick={() => setMenuOpen(false)}
                                className={`mobile-link block text-sm font-medium text-slate-300 hover:text-white py-2.5 px-3 rounded-lg ${isActive(path) ? "active" : ""}`}
                            >
                                {label}
                            </Link>
                        ))}
                        <div className="pt-3 border-t border-slate-800 mt-3">
                            <Link
                                to="/AdminLogin"
                                onClick={() => setMenuOpen(false)}
                                className="login-btn flex items-center justify-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl w-full"
                            >
                                <FaUserShield size={13} /> Admin Login
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};

export default AdminNavbar;