import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    FaTimes, FaChevronDown, FaChevronUp,
    FaTachometerAlt, FaUserMd,
    FaCalendarAlt, FaExchangeAlt, FaCreditCard,
    FaCommentAlt, FaEnvelope, FaSignOutAlt, FaUserCircle,
    FaLayerGroup
} from "react-icons/fa";

const HospitalSidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const hospitalName = localStorage.getItem("HospitalName") || "Hospital Admin Panel";

    const [openMenus, setOpenMenus] = useState({
        doctors: false,
        departments: false,
        schedule: false,
        requests: false,
        payment: false,
    });

    const toggleMenu = (key) => {
        setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
    };

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
        navigate("/hospitallogin");
    };

    return (
        <>
            <style>{`
                .hospital-sidebar-scroll::-webkit-scrollbar { display: none; }
            `}</style>

            <div className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 z-40 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-700">
                    <h2 className="text-lg font-bold leading-tight text-white">
                        {hospitalName}
                    </h2>
                    <button onClick={() => setIsOpen(false)} className="text-xl hover:text-red-400 transition ml-2 shrink-0">
                        <FaTimes />
                    </button>
                </div>

                {/* Scrollable Menu */}
                <div
                    className="flex-1 overflow-y-auto p-4 hospital-sidebar-scroll"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    <ul className="space-y-1">

                        {/* Dashboard */}
                        <li>
                            <Link to="/hospital-dashboard" onClick={() => setIsOpen(false)} className={linkClass("/hospital-dashboard")}>
                                <FaTachometerAlt />
                                <span>Dashboard</span>
                            </Link>
                        </li>

                        {/* Your Account */}
                        <li>
                            <Link to="/hospital-dashboard/account" onClick={() => setIsOpen(false)} className={linkClass("/hospital-dashboard/account")}>
                                <FaUserCircle />
                                <span>Your Account</span>
                            </Link>
                        </li>

                        {/* My Plan */}
                        <li>
                            <Link to="/hospital-dashboard/plans" onClick={() => setIsOpen(false)} className={linkClass("/hospital-dashboard/plans")}>
                                <FaLayerGroup />
                                <span>My Plan</span>
                            </Link>
                        </li>

                        {/* Divider */}
                        <li className="pt-2 pb-1">
                            <p className="text-xs text-gray-500 uppercase px-4 tracking-widest">Applications</p>
                        </li>

                        {/* Doctor Dropdown */}
                        <li>
                            <button onClick={() => toggleMenu("doctors")}
                                className={parentClass(isGroupActive([
                                    "/hospital-dashboard/alldoctors",
                                    "/hospital-dashboard/adddoctors",
                                    "/hospital-dashboard/available-doctors"
                                ]))}>
                                <span className="flex items-center gap-2"><FaUserMd /> Doctor</span>
                                {openMenus.doctors ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                            </button>
                            {openMenus.doctors && (
                                <ul className={subMenuClass}>
                                    <li>
                                        <Link to="/hospital-dashboard/adddoctors" onClick={() => setIsOpen(false)} className={linkClass("/hospital-dashboard/adddoctors")}>
                                            Add Doctor
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/hospital-dashboard/alldoctors" onClick={() => setIsOpen(false)} className={linkClass("/hospital-dashboard/alldoctors")}>
                                            Doctor List
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/hospital-dashboard/available-doctors" onClick={() => setIsOpen(false)} className={linkClass("/hospital-dashboard/available-doctors")}>
                                            Available Doctors
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Schedule Dropdown */}
                        <li>
                            <button onClick={() => toggleMenu("schedule")}
                                className={parentClass(isGroupActive([
                                    "/hospital-dashboard/add-slots",
                                    "/hospital-dashboard/slots",
                                    "/hospital-dashboard/booked-appointments"
                                ]))}>
                                <span className="flex items-center gap-2"><FaCalendarAlt /> Schedule</span>
                                {openMenus.schedule ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                            </button>
                            {openMenus.schedule && (
                                <ul className={subMenuClass}>
                                    <li>
                                        <Link to="/hospital-dashboard/add-slots" onClick={() => setIsOpen(false)} className={linkClass("/hospital-dashboard/add-slots")}>
                                            Add Appointment Slots
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/hospital-dashboard/slots" onClick={() => setIsOpen(false)} className={linkClass("/hospital-dashboard/slots")}>
                                            Appointment Slots
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/hospital-dashboard/booked-appointments" onClick={() => setIsOpen(false)} className={linkClass("/hospital-dashboard/booked-appointments")}>
                                            Booked Appointments
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Requests Dropdown */}
                        <li>
                            <button onClick={() => toggleMenu("requests")}
                                className={parentClass(isGroupActive(["/hospital-dashboard/reschedule-requests"]))}>
                                <span className="flex items-center gap-2"><FaExchangeAlt /> Requests</span>
                                {openMenus.requests ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                            </button>
                            {openMenus.requests && (
                                <ul className={subMenuClass}>
                                    <li>
                                        <Link to="/hospital-dashboard/reschedule-requests" onClick={() => setIsOpen(false)} className={linkClass("/hospital-dashboard/reschedule-requests")}>
                                            Reschedule Appointment
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Payment Dropdown */}
                        <li>
                            <button
                                onClick={() => toggleMenu("payment")}
                                className={parentClass(isGroupActive(["/hospital-dashboard/all-payments"]))}
                            >
                                <span className="flex items-center gap-2">
                                    <FaCreditCard /> Payment
                                </span>
                                {openMenus.payment ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                            </button>
                            {openMenus.payment && (
                                <ul className={subMenuClass}>
                                    <li>
                                        <Link to="/hospital-dashboard/all-payments" onClick={() => setIsOpen(false)} className={linkClass("/hospital-dashboard/all-payments")}>
                                            Payments
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Feedback */}
                        <li>
                            <Link to="/hospital-dashboard/feedback" onClick={() => setIsOpen(false)} className={linkClass("/hospital-dashboard/feedback")}>
                                <FaCommentAlt />
                                <span>Feedback</span>
                            </Link>
                        </li>

                        {/* Mail */}
                        <li>
                            <Link to="/hospital-dashboard/mail" onClick={() => setIsOpen(false)} className={linkClass("/hospital-dashboard/mail")}>
                                <FaEnvelope />
                                <span>Mail</span>
                            </Link>
                        </li>

                    </ul>
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-gray-700">
                    <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-600 hover:text-white transition duration-200">
                        <FaSignOutAlt />
                        <span>Log Out</span>
                    </button>
                </div>

            </div>
        </>
    );
};

export default HospitalSidebar;