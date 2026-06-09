import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    FaTimes, FaChevronDown, FaChevronUp,
    FaTachometerAlt, FaCalendarAlt, FaLayerGroup,
    FaExchangeAlt, FaUserCircle, FaSignOutAlt,
    FaUserMd, FaClipboardList, FaFileMedical,
    FaUserNurse, FaRupeeSign, FaCreditCard,
    FaCommentAlt,
} from "react-icons/fa";

const StaffSidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const staffName = localStorage.getItem("StaffName") || "Staff Panel";
    const role = localStorage.getItem("StaffRole") || "";

    const [openMenus, setOpenMenus] = useState({ appointments: false });
    const toggleMenu = (key) => setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

    const isActive = (path) => location.pathname === path;
    const isGroupActive = (paths) => paths.some((p) => location.pathname === p);

    const linkClass = (path) =>
        `flex items-center gap-2 px-4 py-2 rounded-lg transition duration-200 text-sm ${isActive(path)
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`;

    const parentClass = (active) =>
        `flex justify-between items-center w-full px-4 py-2 rounded-lg transition duration-200 cursor-pointer text-sm font-medium ${active
            ? "bg-blue-700 text-white"
            : "text-gray-200 hover:bg-gray-700 hover:text-white"
        }`;

    const subMenuClass = "ml-3 mt-1 space-y-1 border-l border-gray-700 pl-3";

    const handleLogout = () => {
        localStorage.clear();
        navigate("/staff-login");
    };

    const roleLabel = {
        DOCTOR: "Doctor",
        RECEPTIONIST: "Receptionist",
        NURSE: "Nurse",
    }[role] || "Staff";

    const roleIcon = {
        DOCTOR: <FaUserMd size={12} />,
        RECEPTIONIST: <FaClipboardList size={12} />,
        NURSE: <FaUserNurse size={12} />,
    }[role] || <FaUserCircle size={12} />;

    return (
        <>
            <style>{`
                .staff-sidebar-scroll::-webkit-scrollbar { display: none; }
            `}</style>

            <div className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 z-40 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-700">
                    <div>
                        <h2 className="text-base font-bold text-white leading-tight truncate max-w-[170px]">
                            {staffName}
                        </h2>
                        <span className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 bg-blue-600/30 border border-blue-600/40 text-blue-300 text-xs font-semibold rounded-full">
                            {roleIcon} {roleLabel}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-xl hover:text-red-400 transition ml-2 shrink-0"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Scrollable Menu */}
                <div
                    className="flex-1 overflow-y-auto p-4 staff-sidebar-scroll"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    <ul className="space-y-1">

                        {/* Dashboard */}
                        <li>
                            <Link to="/staff-dashboard" onClick={() => setIsOpen(false)}
                                className={linkClass("/staff-dashboard")}>
                                <FaTachometerAlt /> <span>Dashboard</span>
                            </Link>
                        </li>

                        {/* Your Account */}
                        <li>
                            <Link to="/staff-dashboard/account" onClick={() => setIsOpen(false)}
                                className={linkClass("/staff-dashboard/account")}>
                                <FaUserCircle /> <span>Your Account</span>
                            </Link>
                        </li>

                        {/* Section label */}
                        <li className="pt-2 pb-1">
                            <p className="text-xs text-gray-500 uppercase px-4 tracking-widest">
                                Applications
                            </p>
                        </li>

                        {/* DOCTOR MENU */}
                        {role === "DOCTOR" && (
                            <>
                                <li>
                                    <button
                                        onClick={() => toggleMenu("appointments")}
                                        className={parentClass(isGroupActive([
                                            "/staff-dashboard/appointments",
                                            "/staff-dashboard/appointments/today",
                                        ]))}>
                                        <span className="flex items-center gap-2">
                                            <FaCalendarAlt /> Appointments
                                        </span>
                                        {openMenus.appointments ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                                    </button>
                                    {openMenus.appointments && (
                                        <ul className={subMenuClass}>
                                            <li>
                                                <Link to="/staff-dashboard/appointments" onClick={() => setIsOpen(false)}
                                                    className={linkClass("/staff-dashboard/appointments")}>
                                                    All Appointments
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/staff-dashboard/appointments/today" onClick={() => setIsOpen(false)}
                                                    className={linkClass("/staff-dashboard/appointments/today")}>
                                                    Today's Appointments
                                                </Link>
                                            </li>
                                        </ul>
                                    )}
                                </li>

                                <li>
                                    <Link to="/staff-dashboard/my-slots" onClick={() => setIsOpen(false)}
                                        className={linkClass("/staff-dashboard/my-slots")}>
                                        <FaLayerGroup /> <span>My Slots</span>
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/staff-dashboard/reschedule-requests" onClick={() => setIsOpen(false)}
                                        className={linkClass("/staff-dashboard/reschedule-requests")}>
                                        <FaExchangeAlt /> <span>Reschedule Requests</span>
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/staff-dashboard/patient-history" onClick={() => setIsOpen(false)}
                                        className={linkClass("/staff-dashboard/patient-history")}>
                                        <FaFileMedical /> <span>Patient History</span>
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/staff-dashboard/doctor-payments" onClick={() => setIsOpen(false)}
                                        className={linkClass("/staff-dashboard/doctor-payments")}>
                                        <FaCreditCard /> <span>Payments</span>
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/staff-dashboard/feedback" onClick={() => setIsOpen(false)}
                                        className={linkClass("/staff-dashboard/feedback")}>
                                        <FaCommentAlt />
                                        <span>Feedback</span>
                                    </Link>
                                </li>
                            </>
                        )}

                        {/* RECEPTIONIST MENU */}
                        {role === "RECEPTIONIST" && (
                            <>
                                <li>
                                    <Link to="/staff-dashboard/all-appts" onClick={() => setIsOpen(false)}
                                        className={linkClass("/staff-dashboard/all-appts")}>
                                        <FaCalendarAlt /> <span>Appointments</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/staff-dashboard/payments" onClick={() => setIsOpen(false)}
                                        className={linkClass("/staff-dashboard/payments")}>
                                        <FaRupeeSign /> <span>Payments</span>
                                    </Link>
                                </li>
                            </>
                        )}

                        {/* NURSE MENU */}
                        {role === "NURSE" && (
                            <>
                                <li>
                                    <Link to="/staff-dashboard/appointments" onClick={() => setIsOpen(false)}
                                        className={linkClass("/staff-dashboard/appointments")}>
                                        <FaCalendarAlt /> <span>Appointments</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/staff-dashboard/patient-history" onClick={() => setIsOpen(false)}
                                        className={linkClass("/staff-dashboard/patient-history")}>
                                        <FaFileMedical /> <span>Patient Records</span>
                                    </Link>
                                </li>
                            </>
                        )}

                    </ul>
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-gray-700">
                    <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-600 hover:text-white transition duration-200">
                        <FaSignOutAlt /> <span>Log Out</span>
                    </button>
                </div>

            </div>
        </>
    );
};

export default StaffSidebar;