import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminHeader from "../components/Admin/AdminHeader";
import AdminFooter from "../components/Admin/AdminFooter";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  return (
    <div className="flex">

      {/* Sidebar */}
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main Content */}
      <div className="flex-1">

        {/* Header with Toggle Button */}
        <AdminHeader isOpen={isOpen} setIsOpen={setIsOpen} onSearch={setGlobalSearch} />

        <div className="p-6">
          <Outlet context={{ globalSearch }} />
        </div>
        

        {/* Footer */}
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminLayout;