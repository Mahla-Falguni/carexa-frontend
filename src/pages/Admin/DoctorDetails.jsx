import { useEffect, useState } from "react";
import axios from "axios";
import { getImageUrl, handleImageError } from "../../utils/imageUtils";
import { useParams } from "react-router-dom";
import { FaUserMd } from "react-icons/fa";

const DoctorDetails = () => {

  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);

  const getDoctor = async () => {
    try {

        console.log("Doctor ID:", id);

      const token = localStorage.getItem("adminToken");

      const res = await axios.get(
        `https://carexa-backend.vercel.app/adminapi/get_doctors/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(res.data);
      

      setDoctor(res.data.doctor);

    } catch (error) {
      console.log("Doctor fetch error:", error);
    }
  };

  useEffect(() => {
    getDoctor();
  }, []);

  if (!doctor) {
    return <p className="p-10 text-lg">Loading doctor details...</p>;
  }

  return (
    <div className="p-10 bg-gray-50 min-h-screen">

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">

        <div className="flex items-center gap-8">

          {/* Doctor Image */}
            <img
              src={getImageUrl(doctor.img, 'doctor')}
              alt="doctor"
              onError={e => handleImageError(e, 'doctor')}
              className="w-40 h-40 rounded-full object-cover"
            />

          {/* Basic Info */}
          <div>
            <h2 className="text-3xl font-bold">{doctor.name}</h2>

            <p className="text-blue-600 font-medium mt-1">
              {doctor.specialization}
            </p>

            <span className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              {doctor.role}
            </span>
          </div>

        </div>

        {/* Details Section */}
        <div className="grid md:grid-cols-2 gap-6 mt-10 text-gray-700">

          <div>
            <h4 className="font-semibold">Email</h4>
            <p>{doctor.email}</p>
          </div>

          <div>
            <h4 className="font-semibold">Phone</h4>
            <p>{doctor.phone}</p>
          </div>


          <div>
            <h4 className="font-semibold">Consultation Fee</h4>
            <p>₹{doctor.consultation_fee}</p>
          </div>

          <div>
            <h4 className="font-semibold">Status</h4>
            <p>{doctor.status}</p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DoctorDetails;