import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Home from './pages/User/Home'
import UserDashboard from './pages/User/UserDashboard'
import Login from './pages/User/Login'
import About from './pages/User/About'
import Contact from './pages/User/Contact'
import Service from './pages/User/Service'
import Register from './pages/User/Register'
import AdminLogin from './pages/Admin/AdminLogin'
import Hospitals from './pages/User/Hospitals'
import HospitalDoctors from './pages/User/HospitalDoctors'
import AdminLayout from './layouts/AdminLayout'
import HospitalLayout from './layouts/HospitalLayout'
import UserLayout from './layouts/UserLayout'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminHospitals from './pages/Admin/AdminHospitals'
import AddHospital from './pages/Admin/AddHospitals'
import HospitalRequests from './pages/Admin/HospitalRequests.JSX'
import HospitalLogin from './pages/Hospital/HospitalLogin'
import HospitalDashboard from './pages/Hospital/HospitalDashboard'
import GuestHospitalRequest from './pages/Guest/GuestHospitalRequest'
import AllDoctors from './pages/Hospital/AllDoctors'
import AvailableDoctors from './pages/Hospital/AvailableDoctors'
import AddDoctors from './pages/Hospital/AddDoctors'
import BookedAppointments from './pages/Hospital/BookedAppointments'
import AdminDoctors from './pages/Admin/AdminDoctors'
import DoctorDetails from './pages/Admin/DoctorDetails'
import AppointmentSlots from './pages/Hospital/HospitalAppointmentSlots'
import AddSlots from './pages/Hospital/AddSlots'
import EditSlot from './pages/Hospital/EditSlot'
import HospitalAccount from './pages/Hospital/HospitalAccount'
import RescheduleRequests from './pages/Hospital/RescheduleRequests'
import AdminAccount from './pages/Admin/AdminAccount'
import AdminAppointmentSlots from './pages/Admin/AdminAppointmentSlots'
import AdminAllAppointments from './pages/Admin/AdminAllAppointments'
import AdminRescheduleRequests from './pages/Admin/AdminRescheduleRequests'
import AdminPlans from './pages/Admin/AdminPlans'
import HospitalPlans from './pages/Hospital/HospitalPlans'
import PublicLayout from './layouts/PublicLayout'
import ScrollToTop from './components/ScrollToTop'
import UserProfile from './pages/User/UserProfile'
import MyAppointments from './pages/User/MyAppointments'
import StaffLogin from './pages/HospitalStaff/StaffLogin'
import StaffLayout from './layouts/StaffLayout'
import StaffDashboard from './pages/HospitalStaff/StaffDashboard'
import RescheduleRequest from './pages/HospitalStaff/RescheduleRequests'
import StaffProfile from './pages/HospitalStaff/StaffProfile'
import AllAppointments from './pages/HospitalStaff/AllAppointments'
import TodayAppointments from './pages/HospitalStaff/TodaysAppointments'
import MySlots from './pages/HospitalStaff/MySlots'
import PatientHistory from './pages/HospitalStaff/PatientHistory'
import MedicalRecords from './pages/User/MedicalRecords'
import ReceptionistAppointments from './pages/HospitalStaff/ReceptionistAppointments'
import ReceptionistPayments from './pages/HospitalStaff/ReceptionistPayments'
import PaymentReceiptModal from './pages/HospitalStaff/PaymentReceiptModal'
import DoctorPayments from './pages/HospitalStaff/DoctorPayments'
import HospitalAdminPayments from './pages/Hospital/Payments'
import Feedback from './pages/User/Feedback'
import HospitalFeedbacks from './pages/Hospital/HospitalFeedbacks'
import DoctorFeedbacks from './pages/HospitalStaff/DoctorFeedbacks'
import ForgotPassword from './pages/User/ForgotPasswoed'
import ResetPassword from './pages/User/ResetPassword'
import AdminForgotPassword from './pages/Admin/AdminForgotPassword'
import AdminResetPassword from './pages/Admin/AdminResetPassword'
import HospitalForgotPassword from './pages/Hospital/HospitalForgotPassword'
import HospitalResetPassword from './pages/Hospital/HospitalResetPassword'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        {/* ─── PUBLIC ROUTES (with Navbar + Footer, NO login required) ─── */}
        <Route element={<PublicLayout />}>
          <Route path="/"          element={<Home />} />
          <Route path="/about"     element={<About />} />
          <Route path="/contact"   element={<Contact />} />
          <Route path="/services"  element={<Service />} />
          {/* ✅ Hospitals list is public — anyone can browse */}
          <Route path="/hospitals" element={<Hospitals />} />
        </Route>

        {/* ─── AUTH PAGES (standalone — no navbar wrapper) ─── */}
        {/* ✅ Login is OUTSIDE PublicLayout so it has no extra navbar */}
        <Route path="/login"                        element={<Login />} />
        <Route path="/register"                     element={<Register />} />
        <Route path="/forgot-password"              element={<ForgotPassword />} />
        <Route path="/reset-password/:token"        element={<ResetPassword />} />

        {/* ─── USER ROUTES (protected — UserLayout checks token) ─── */}
        <Route path="/userdashboard" element={<UserLayout />}>
          <Route index                                    element={<UserDashboard />} />
          <Route path="hospitals"                         element={<Hospitals />} />
          {/* ✅ Doctors page is ONLY here — inside protected UserLayout */}
          <Route path="hospitals/:hospitalId/doctors"     element={<HospitalDoctors />} />
          <Route path="appointments"                      element={<MyAppointments />} />
          <Route path="profile"                           element={<UserProfile />} />
          <Route path="medical-records"                   element={<MedicalRecords />} />
          <Route path="feedback"                          element={<Feedback />} />
        </Route>

        {/* ─── ADMIN ROUTES ─── */}
        <Route path="adminlogin"                          element={<AdminLogin />} />
        <Route path="/admin/forgot-password"              element={<AdminForgotPassword />} />
        <Route path="/admin/reset-password/:token"        element={<AdminResetPassword />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index                    element={<AdminDashboard />} />
          <Route path="account"           element={<AdminAccount />} />
          <Route path="plans"             element={<AdminPlans />} />
          <Route path="adminhospitals"    element={<AdminHospitals />} />
          <Route path="add-hospital"      element={<AddHospital />} />
          <Route path="hospital-requests" element={<HospitalRequests />} />
          <Route path="doctors"           element={<AdminDoctors />} />
          <Route path="hospital-doctors/:id" element={<AdminDoctors />} />
          <Route path="doctor/:id"        element={<DoctorDetails />} />
          <Route path="slots"             element={<AdminAppointmentSlots />} />
          <Route path="all-appointments"  element={<AdminAllAppointments />} />
          <Route path="reschedule-requests" element={<AdminRescheduleRequests />} />
        </Route>

        {/* ─── HOSPITAL ROUTES ─── */}
        <Route path="hospitallogin"                       element={<HospitalLogin />} />
        <Route path="/hospital-forgot-password"           element={<HospitalForgotPassword />} />
        <Route path="/hospital-reset-password/:token"     element={<HospitalResetPassword />} />

        <Route path="/hospital-dashboard" element={<HospitalLayout />}>
          <Route index                        element={<HospitalDashboard />} />
          <Route path="account"               element={<HospitalAccount />} />
          <Route path="alldoctors"            element={<AllDoctors />} />
          <Route path="available-doctors"     element={<AvailableDoctors />} />
          <Route path="adddoctors"            element={<AddDoctors />} />
          <Route path="slots"                 element={<AppointmentSlots />} />
          <Route path="add-slots"             element={<AddSlots />} />
          <Route path="edit-slot/:id"         element={<EditSlot />} />
          <Route path="booked-appointments"   element={<BookedAppointments />} />
          <Route path="reschedule-requests"   element={<RescheduleRequests />} />
          <Route path="plans"                 element={<HospitalPlans />} />
          <Route path="all-payments"          element={<HospitalAdminPayments />} />
          <Route path="feedback"              element={<HospitalFeedbacks />} />
        </Route>

        {/* ─── STAFF ROUTES ─── */}
        <Route path="/staff-login" element={<StaffLogin />} />

        <Route path="/staff-dashboard" element={<StaffLayout />}>
          <Route index                        element={<StaffDashboard />} />
          <Route path="my-slots"              element={<MySlots />} />
          <Route path="reschedule"            element={<RescheduleRequest />} />
          <Route path="account"               element={<StaffProfile />} />
          <Route path="appointments"          element={<AllAppointments />} />
          <Route path="appointments/today"    element={<TodayAppointments />} />
          <Route path="reschedule-requests"   element={<RescheduleRequests />} />
          <Route path="patient-history"       element={<PatientHistory />} />
          <Route path="doctor-payments"       element={<DoctorPayments />} />
          <Route path="feedback"              element={<DoctorFeedbacks />} />
          <Route path="all-appts"             element={<ReceptionistAppointments />} />
          <Route path="payments"              element={<ReceptionistPayments />} />
          <Route path="payment-receipt"       element={<PaymentReceiptModal />} />
        </Route>

        {/* ─── GUEST ROUTES ─── */}
        <Route path="/guest-hospitalrequest" element={<GuestHospitalRequest />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App