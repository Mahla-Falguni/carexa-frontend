import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    FaTimes, FaChevronDown, FaChevronUp,
    FaTachometerAlt, FaHospital, FaUserMd,
    FaCalendarAlt, FaExchangeAlt,
    FaSignOutAlt, FaUserCircle,
    FaClipboardList
} from "react-icons/fa";

const AdminSidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const adminName = localStorage.getItem("AdminName") || "Admin Panel";

    const [openMenus, setOpenMenus] = useState({
        hospitals:    false,
        doctors:      false,
        appointments: false,
        requests:     false,
        plans:        false,
    });

    const toggleMenu = (key) => {
        setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const isActive      = (path)  => location.pathname === path;
    const isGroupActive = (paths) => paths.some(p => location.pathname === p);

    const linkClass = (path) =>
        `flex items-center gap-2 px-4 py-2 rounded-lg transition duration-200 text-sm ${
            isActive(path)
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`;

    const parentClass = (active) =>
        `flex justify-between items-center w-full px-4 py-2 rounded-lg transition duration-200 cursor-pointer text-sm font-medium ${
            active
                ? "bg-blue-700 text-white"
                : "text-gray-200 hover:bg-gray-700 hover:text-white"
        }`;

    const subMenuClass = "ml-3 mt-1 space-y-1 border-l border-gray-700 pl-3";

    const handleLogout = () => {
        localStorage.clear();
        navigate("/adminlogin");
    };

    return (
        <>
            <style>{`
                .admin-sidebar-scroll::-webkit-scrollbar { display: none; }
            `}</style>

            <div className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 z-40 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            }`}>

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-700">
                    <h2 className="text-lg font-bold leading-tight text-white">
                        {adminName}
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-xl hover:text-red-400 transition ml-2 shrink-0"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Scrollable Menu */}
                <div
                    className="flex-1 overflow-y-auto p-4 admin-sidebar-scroll"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    <ul className="space-y-1">

                        {/* Dashboard */}
                        <li>
                            <Link to="/admin" onClick={() => setIsOpen(false)} className={linkClass("/admin")}>
                                <FaTachometerAlt />
                                <span>Dashboard</span>
                            </Link>
                        </li>

                        {/* Your Account */}
                        <li>
                            <Link to="/admin/account" onClick={() => setIsOpen(false)} className={linkClass("/admin/account")}>
                                <FaUserCircle />
                                <span>Your Account</span>
                            </Link>
                        </li>

                        {/* Divider */}
                        <li className="pt-2 pb-1">
                            <p className="text-xs text-gray-500 uppercase px-4 tracking-widest">Applications</p>
                        </li>

                        {/* Plans Dropdown */}
                        <li>
                            <button
                                onClick={() => toggleMenu("plans")}
                                className={parentClass(isGroupActive(["/admin/plans", "/admin/selected-plans"]))}
                            >
                                <span className="flex items-center gap-2">
                                    <FaClipboardList />
                                    Plans
                                </span>
                                {openMenus.plans ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                            </button>
                            {openMenus.plans && (
                                <ul className={subMenuClass}>
                                    <li>
                                        <Link to="/admin/plans" onClick={() => setIsOpen(false)} className={linkClass("/admin/plans")}>
                                            All Plans
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Hospitals Dropdown */}
                        <li>
                            <button
                                onClick={() => toggleMenu("hospitals")}
                                className={parentClass(isGroupActive(["/admin/AdminHospitals", "/admin/hospital-requests"]))}
                            >
                                <span className="flex items-center gap-2">
                                    <FaHospital />
                                    Hospitals
                                </span>
                                {openMenus.hospitals ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                            </button>
                            {openMenus.hospitals && (
                                <ul className={subMenuClass}>
                                    <li>
                                        <Link to="/admin/AdminHospitals" onClick={() => setIsOpen(false)} className={linkClass("/admin/AdminHospitals")}>
                                            All Hospitals
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/hospital-requests" onClick={() => setIsOpen(false)} className={linkClass("/admin/hospital-requests")}>
                                            Hospital Requests
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Doctors Dropdown */}
                        <li>
                            <button
                                onClick={() => toggleMenu("doctors")}
                                className={parentClass(isGroupActive(["/admin/doctors", "/admin/hospital-doctors"]))}
                            >
                                <span className="flex items-center gap-2">
                                    <FaUserMd />
                                    Doctors
                                </span>
                                {openMenus.doctors ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                            </button>
                            {openMenus.doctors && (
                                <ul className={subMenuClass}>
                                    <li>
                                        <Link to="/admin/doctors" onClick={() => setIsOpen(false)} className={linkClass("/admin/doctors")}>
                                            All Doctors
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Schedule Dropdown */}
                        <li>
                            <button
                                onClick={() => toggleMenu("appointments")}
                                className={parentClass(isGroupActive([
                                    "/admin/slots",
                                    "/admin/all-appointments"
                                ]))}
                            >
                                <span className="flex items-center gap-2">
                                    <FaCalendarAlt />
                                    Schedule
                                </span>
                                {openMenus.appointments ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                            </button>
                            {openMenus.appointments && (
                                <ul className={subMenuClass}>
                                    <li>
                                        <Link to="/admin/slots" onClick={() => setIsOpen(false)} className={linkClass("/admin/slots")}>
                                            Appointment Slots
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/all-appointments" onClick={() => setIsOpen(false)} className={linkClass("/admin/all-appointments")}>
                                            All Appointments
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Requests Dropdown */}
                        <li>
                            <button
                                onClick={() => toggleMenu("requests")}
                                className={parentClass(isGroupActive(["/admin/reschedule-requests"]))}
                            >
                                <span className="flex items-center gap-2">
                                    <FaExchangeAlt />
                                    Requests
                                </span>
                                {openMenus.requests ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                            </button>
                            {openMenus.requests && (
                                <ul className={subMenuClass}>
                                    <li>
                                        <Link to="/admin/reschedule-requests" onClick={() => setIsOpen(false)} className={linkClass("/admin/reschedule-requests")}>
                                            Reschedule Requests
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>

                    </ul>
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-600 hover:text-white transition duration-200"
                    >
                        <FaSignOutAlt />
                        <span>Log Out</span>
                    </button>
                </div>

            </div>
        </>
    );
};

export default AdminSidebar;