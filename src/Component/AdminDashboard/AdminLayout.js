import React, { useState } from "react";
import AdminMenu from "./AdminMenu";
import AdminDashboard from "./AdminDashboard";
import AdminUser from "./AdminUser";
import AdminSetting from "./AdminSetting";

function AdminLayout() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderContent = () => {
    switch (activePage) {
      case "users":
        return <AdminUser />;
      case "setting":
        return <AdminSetting />;
      case "dashboard":
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div>
      <AdminMenu activePage={activePage} setActivePage={setActivePage} />
      {renderContent()}
    </div>
  );
}

export default AdminLayout;
