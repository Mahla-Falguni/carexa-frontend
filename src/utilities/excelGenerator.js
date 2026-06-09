import ExcelJS from "exceljs";

const generateAppointmentExcel = async (appointments) => {

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Appointments");

    worksheet.columns = [
        { header: "Patient Name", key: "patient_name", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "phone", width: 20 },
        { header: "Doctor", key: "doctor", width: 25 },
        { header: "Specialization", key: "specialization", width: 25 },
        { header: "Date", key: "date", width: 20 },
        { header: "Start Time", key: "start_time", width: 20 },
        { header: "End Time", key: "end_time", width: 20 },
        { header: "Status", key: "status", width: 20 }
    ];

    appointments.forEach((appointment) => {

        worksheet.addRow({
            patient_name: appointment.patient_id?.patient_name || "",
            email: appointment.patient_id?.patient_email || "",
            phone: appointment.patient_id?.patient_phone || "",
            doctor: appointment.doctor_id?.name || "",
            specialization: appointment.doctor_id?.specialization || "",
            date: appointment.appointment_date,
            start_time: appointment.appointment_start_time,
            end_time: appointment.appointment_end_time,
            status: appointment.appointment_status
        });

    });

    return workbook;
};

export default generateAppointmentExcel;