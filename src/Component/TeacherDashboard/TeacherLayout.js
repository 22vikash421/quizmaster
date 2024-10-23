import React, { useState } from "react";
import TeacherMenu from "./TeacherMenu";
import TeacherDashboard from "./TeacherDashboard";
import TeacherUser from "./TeacherUser";
import TeacherCPaper from "./TeacherCPaper";
import TeacherSetting from "./TeacherSetting";
import TeacherAnswer from "./TeacherAnswer";

function TeacherLayout() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderContent = () => {
    switch (activePage) {
      case "users":
        return <TeacherUser />;
      case "Cpaper":
        return <TeacherCPaper />;
      case "AnswerSheet":
        return <TeacherAnswer/>
      case "Setting" :
        return<TeacherSetting/>
      case "dashboard":
      default:
        return <TeacherDashboard />;
    }
  };

  return (
    <div>
      <TeacherMenu activePage={activePage} setActivePage={setActivePage} />
      {renderContent()}
    </div>
  );
}

export default TeacherLayout;
