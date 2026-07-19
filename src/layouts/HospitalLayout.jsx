import { useState } from "react";
import { Outlet } from "react-router-dom";
import HospitalFooter from "../components/Hospital/HospitalFooter";
import HospitalHeader from "../components/Hospital/HospitalHeader";
import HospitalSidebar from "../components/Hospital/HospitalSidebar";

const HospitalLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  return (
    <div className="flex">

      {/* Sidebar */}
      <HospitalSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main Content */}
      <div className="flex-1">

        {/* Header with Toggle Button */}
        <HospitalHeader isOpen={isOpen} setIsOpen={setIsOpen} onSearch={setGlobalSearch} />

        <div className="p-6">
          <Outlet context={{ globalSearch }} />
        </div>
        
        {/* Footer */}
        <HospitalFooter />

      </div>
    </div>
  );
};

export default HospitalLayout;

