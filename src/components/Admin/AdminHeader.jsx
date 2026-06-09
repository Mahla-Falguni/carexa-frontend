import { useState } from "react";
import { FaBars, FaBell, FaSearch, FaUserCircle, FaSignOutAlt, FaUserCog, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminHeader = ({ isOpen, setIsOpen }) => {

    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const navigate = useNavigate();

    const adminName  = localStorage.getItem("AdminName")  || "Admin";

    const notifications = [
        { msg: "New hospital registration request",  time: "2 min ago",  color: "bg-blue-500" },
        { msg: "Doctor added to Care Hospital",       time: "15 min ago", color: "bg-emerald-500" },
        { msg: "New appointment booked",              time: "1 hr ago",   color: "bg-amber-500" },
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate("/adminlogin");
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                .header-font { font-family: 'DM Sans', sans-serif; }
                .search-input:focus { outline: none; }
                .dropdown { animation: dropIn 0.15s ease; transform-origin: top right; }
                @keyframes dropIn { from { opacity: 0; transform: scale(0.95) translateY(-8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                .header-btn { transition: all 0.15s ease; }
                .header-btn:hover { background: #f1f5f9; }
            `}</style>

            <header className="header-font bg-white border-b border-slate-100 shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-30">

                {/* LEFT — Toggle + Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="header-btn w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-blue-600"
                    >
                        <FaBars size={17} />
                    </button>

                    <div className="hidden sm:block">
                        <h1 className="text-base font-semibold text-slate-800 leading-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-xs text-slate-400">Hospital Management System</p>
                    </div>
                </div>

                {/* CENTER — Search */}
                <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-blue-300 px-3 py-2 rounded-xl w-72 transition">
                    <FaSearch className="text-slate-400 shrink-0" size={13} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search hospitals, doctors..."
                        className="search-input bg-transparent w-full text-sm text-slate-600 placeholder-slate-400"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                            <FaTimes size={11} />
                        </button>
                    )}
                </div>

                {/* RIGHT — Notifications + Profile */}
                <div className="flex items-center gap-2">

                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                            className="header-btn relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-blue-600"
                        >
                            <FaBell size={17} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="dropdown absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                                        {notifications.length} new
                                    </span>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {notifications.map((n, i) => (
                                        <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition cursor-pointer">
                                            <div className={`w-2 h-2 ${n.color} rounded-full mt-1.5 shrink-0`}></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-700 leading-snug">{n.msg}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-3 border-t border-slate-100">
                                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium w-full text-center">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                            className="header-btn flex items-center gap-2 px-3 py-2 rounded-xl"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-white text-xs font-bold">
                                    {adminName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold text-slate-700 leading-tight">{adminName}</p>
                                <p className="text-xs text-slate-400">Super Admin</p>
                            </div>
                        </button>

                        {/* Profile Dropdown */}
                        {showProfile && (
                            <div className="dropdown absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">

                                {/* Profile Header */}
                                <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <p className="text-sm font-semibold text-slate-800">{adminName}</p>
                                    <p className="text-xs text-slate-400">Super Admin</p>
                                </div>

                                <div className="p-2">
                                    <button
                                        onClick={() => { navigate("/admin/account"); setShowProfile(false); }}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition"
                                    >
                                        <FaUserCog size={13} className="text-slate-400" />
                                        Your Account
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition mt-1"
                                    >
                                        <FaSignOutAlt size={13} />
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </header>

            {/* Click outside to close dropdowns */}
            {(showNotifications || showProfile) && (
                <div
                    className="fixed inset-0 z-20"
                    onClick={() => { setShowNotifications(false); setShowProfile(false); }}
                />
            )}
        </>
    );
};

export default AdminHeader;