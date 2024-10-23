import React from "react";
import "./StudentMenu.css";
import logo from "../../Image/logo.png";
import { LuLayoutDashboard } from "react-icons/lu";
// import { FaRegUser } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { IoIosPaper } from "react-icons/io";
import { FcAnswers } from "react-icons/fc";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { ref, remove } from "firebase/database"; // Import remove function for Firebase Realtime Database
import { db } from "../firebase"; // Import your Firebase database instance

function StudentMenu({ studentActivePage, setStudentActivePage }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const loggedInUserId = Cookies.get("loggedInUserId");

    if (loggedInUserId) {
      // Remove the user from Firebase logged-in users (optional)
      await remove(ref(db, `loggedInUsers/${loggedInUserId}`));

      // Clear cookies
      Cookies.remove("loggedInUserId");
      Cookies.remove("role");

      // Redirect to login page
      navigate("/");
    }
  };

  return (
    <>
      <div className="StudentHeader">
        <div className="StudentProfilebar">
          <div className="StudentLogo">
            <img src={logo} alt="logo" />
          </div>
          <div>
            <CgProfile className="CgProfile" />
          </div>
        </div>
        <div className="StudentSidebar">
          <div className="StudentNavbar">
            <ul>
              <li
                className={studentActivePage === "dashboard" ? "active" : ""}
                onClick={() => {
                  console.log("Dashboard clicked"); // Add this for debugging
                  setStudentActivePage("dashboard");
                }}
              >
                <LuLayoutDashboard className="StudentIcon" />
              </li>
              <li
                className={studentActivePage === "exam" ? "active" : ""}
                onClick={() => {
                  console.log("Exam clicked"); // Add this for debugging
                  setStudentActivePage("exam");
                }}
              >
                <IoIosPaper className="StudentIcon" />
              </li>
              <li
                className={studentActivePage === "answer" ? "active" : ""}
                onClick={() => {
                  console.log("Answer clicked"); // Add this for debugging
                  setStudentActivePage("answer");
                }}
              >
                <FcAnswers className="StudentIcon" />
              </li>
              <li
                className={studentActivePage === "setting" ? "active" : ""}
                onClick={() => {
                  console.log("Settings clicked"); // Add this for debugging
                  setStudentActivePage("setting");
                }}
              >
                <IoSettingsOutline className="StudentIcon" />
              </li>
              <li onClick={handleLogout}>
                <IoIosLogOut className="StudentIcon" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentMenu;
