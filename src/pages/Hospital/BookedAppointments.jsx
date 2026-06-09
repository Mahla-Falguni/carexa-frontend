import axios from "axios";
import { useState, useEffect } from "react";
import { FaCalendarCheck, FaEye, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BookedAppointments = () => {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const getAppointments = async () => {
        try {

            const token = localStorage.getItem("HospitalToken");

            const res = await axios.get(
                "http://localhost:5000/hospitalapi/get-allbooked-appointments",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log("Appointments:", res.data);

            setAppointments(res.data.appointments || []);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAppointments();
    }, []);

    const getAppointmentTime = (appointment) => {
        if (
            appointment?.start_time &&
            appointment?.end_time
        ) {
            return `${appointment.start_time} - ${appointment.end_time}`;
        }

        return "N/A";
    };

    const handleView = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this appointment?"
        );

        if (!confirmDelete) return;

        try {

            const token = localStorage.getItem("HospitalToken");

            await axios.delete(
                `http://localhost:5000/hospitalapi/delete-appointment/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAppointments(
                appointments.filter((app) => app._id !== id)
            );

            alert("Appointment Deleted Successfully");

        } catch (error) {

            console.log(error);
            alert("Error deleting appointment");

        }
    };

    const downloadExcel = () => {

        const excelData = appointments.map((appointment) => ({
            Patient_Name:
                appointment.patient_id?.patient_name || "N/A",

            Patient_Email:
                appointment.patient_id?.patient_email || "N/A",

            Patient_Phone:
                appointment.patient_id?.patient_phone || "N/A",

            Doctor_Name:
                appointment.doctor_id?.name || "N/A",

            Specialization:
                appointment.doctor_id?.specialization || "N/A",

            Date:
                appointment.appointment_date
                    ? new Date(
                        appointment.appointment_date
                    ).toLocaleDateString("en-IN")
                    : "N/A",

            Start_Time:
                appointment.start_time || "N/A",

            End_Time:
                appointment.end_time || "N/A",

            Status:
                appointment.appointment_status || "N/A"
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Booked Appointments"
        );

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });

        const fileData = new Blob(
            [excelBuffer],
            {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        );

        const currentDate =
            new Date().toISOString().split("T")[0];

        saveAs(
            fileData,
            `Booked_Appointments_${currentDate}.xlsx`
        );
    };

    const getStatusColor = (status) => {

        switch (status) {

            case "COMPLETED":
                return "bg-green-100 text-green-700";

            case "CANCELLED":
                return "bg-red-100 text-red-700";

            case "PENDING":
                return "bg-yellow-100 text-yellow-700";

            case "RESCHEDULED":
                return "bg-blue-100 text-blue-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (

        <div className="p-6 bg-gray-100 min-h-screen">

            <div className="bg-white shadow-lg rounded-xl p-6">

                <div className="flex justify-between items-center mb-6">

                    <div className="flex items-center gap-3">

                        <FaCalendarCheck className="text-green-600 text-xl" />

                        <div>
                            <h1 className="text-2xl font-bold">
                                Booked Appointments
                            </h1>

                            <p className="text-gray-500 text-sm">
                                Total Appointments : {appointments.length}
                            </p>
                        </div>

                    </div>

                    <button
                        onClick={downloadExcel}
                        disabled={appointments.length === 0}
                        className={`px-4 py-2 rounded text-white ${appointments.length === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        Export Excel
                    </button>

                </div>

                {loading ? (

                    <p className="text-center text-gray-500">
                        Loading Appointments...
                    </p>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full border border-gray-200">

                            <thead className="bg-gray-100">

                                <tr>
                                    <th className="p-3 text-left">
                                        Patient Name
                                    </th>

                                    <th className="p-3 text-left">
                                        Doctor
                                    </th>

                                    <th className="p-3 text-left">
                                        Specialization
                                    </th>

                                    <th className="p-3 text-left">
                                        Date
                                    </th>

                                    <th className="p-3 text-left">
                                        Time
                                    </th>

                                    <th className="p-3 text-left">
                                        Status
                                    </th>

                                    <th className="p-3 text-center">
                                        Actions
                                    </th>
                                </tr>

                            </thead>

                            <tbody>

                                {appointments.length > 0 ? (

                                    appointments.map((appointment) => (

                                        <tr
                                            key={appointment._id}
                                            className="border-t hover:bg-gray-50"
                                        >

                                            <td className="p-3">
                                                {appointment.patient_id?.patient_name || "N/A"}
                                            </td>

                                            <td className="p-3">
                                                {appointment.doctor_id?.name || "N/A"}
                                            </td>

                                            <td className="p-3">
                                                {appointment.doctor_id?.specialization || "N/A"}
                                            </td>

                                            <td className="p-3">
                                                {
                                                    appointment.appointment_date
                                                        ? new Date(
                                                            appointment.appointment_date
                                                        ).toLocaleDateString("en-IN")
                                                        : "N/A"
                                                }
                                            </td>

                                            <td className="p-3">
                                                {getAppointmentTime(appointment)}
                                            </td>

                                            <td className="p-3">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                                                        appointment.appointment_status
                                                    )}`}
                                                >
                                                    {appointment.appointment_status}
                                                </span>

                                            </td>

                                            <td className="p-3 text-center">

                                                <button
                                                    onClick={() => handleView(appointment)}
                                                    className="text-blue-500 hover:text-blue-700 mr-4"
                                                >
                                                    <FaEye />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            appointment._id
                                                        )
                                                    }
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <FaTrash />
                                                </button>

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="text-center p-5 text-gray-500"
                                        >
                                            No Appointments Found
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {showModal && selectedAppointment && (

                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">

                        <h2 className="text-xl font-bold mb-4">
                            Appointment Details
                        </h2>

                        <p>
                            <strong>Patient:</strong>{" "}
                            {selectedAppointment.patient_id?.patient_name || "N/A"}
                        </p>

                        <p>
                            <strong>Email:</strong>{" "}
                            {selectedAppointment.patient_id?.patient_email || "N/A"}
                        </p>

                        <p>
                            <strong>Phone:</strong>{" "}
                            {selectedAppointment.patient_id?.patient_phone || "N/A"}
                        </p>

                        <p>
                            <strong>Doctor:</strong>{" "}
                            {selectedAppointment.doctor_id?.name || "N/A"}
                        </p>

                        <p>
                            <strong>Specialization:</strong>{" "}
                            {selectedAppointment.doctor_id?.specialization || "N/A"}
                        </p>

                        <p>
                            <strong>Date:</strong>{" "}
                            {
                                selectedAppointment.appointment_date
                                    ? new Date(
                                        selectedAppointment.appointment_date
                                    ).toLocaleDateString("en-IN")
                                    : "N/A"
                            }
                        </p>

                        <p>
                            <strong>Time:</strong>{" "}
                            {getAppointmentTime(selectedAppointment)}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {selectedAppointment.appointment_status || "N/A"}
                        </p>

                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-5 bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Close
                        </button>

                    </div>

                </div>

            )}

        </div>

    );
};

export default BookedAppointments;