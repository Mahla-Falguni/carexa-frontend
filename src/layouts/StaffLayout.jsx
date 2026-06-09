import { useState } from "react";
import { Outlet } from "react-router-dom";
import StaffSidebar from "../components/Staff/StaffSidebar";
import StaffHeader from "../components/Staff/StaffHeader";
import StaffFooter from "../components/Staff/StaffFooter";

const StaffLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <StaffSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsOpen(false)} />
      )}

      <div className="flex flex-col min-h-screen">
        <StaffHeader isOpen={isOpen} setIsOpen={setIsOpen} onSearch={setGlobalSearch} />

        <main className="flex-1 p-6">
          <Outlet context={{ globalSearch }} />
        </main>

        <StaffFooter />
      </div>
    </div>
  );
};

export default StaffLayout;