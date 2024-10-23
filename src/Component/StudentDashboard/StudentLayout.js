import React, { useState } from "react";
import StudentMenu from "./StudentMenu";
import StudentDashboard from "./StudentDashboard";
import StudentExam from "./StudentExam";
import StudentAnswer from "./StudentAnswer";
import StudentSetting from "./StudentSetting";

function StudentLayout() {
  const [studentActivePage, setStudentActivePage] = useState("dashboard");

  const studentRenderContent = () => {
    switch (studentActivePage) {
      case "exam":
        return <StudentExam />;
        case "setting":
        return <StudentSetting />;
      case "answer" :
        return <StudentAnswer/>
      case "dashboard":
      default:
        return <StudentDashboard />;
    }
  };
  return (
    <div>
      <StudentMenu
        studentActivePage={studentActivePage}
        setStudentActivePage={setStudentActivePage}
      />
      {studentRenderContent ()}
    </div>
  );
}

export default StudentLayout;
