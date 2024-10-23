import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./Component/Login";
import AdminLayout from "./Component/AdminDashboard/AdminLayout";
import StudentLayout from "./Component/StudentDashboard/StudentLayout";
import TeacherLayout from "./Component/TeacherDashboard/TeacherLayout";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* This is the Login to Dashboard Pages  */}
          <Route path="/" element={<Login />} />

          {/* This is the Admin Dashboard Pages and Routings */}
          <Route path="/AdminDashboard/*" element={<AdminLayout />} />

          {/* This is the Teacher Dashboard Pages and Routings */}
          <Route path="/TeacherDashboard/*" element={<TeacherLayout />} />


          {/* This is the Student Dashboard Pages and Routings */}
          <Route path="/StudentDashboard/*" element={<StudentLayout />} />

        </Routes>
      </Router>
    </>
  );
}

export default App;
