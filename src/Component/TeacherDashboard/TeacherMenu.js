import React from "react";
import "./TeacherMenu.css";
import logo from "../../Image/logo.png";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaRegUser } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { IoIosPaper } from "react-icons/io";
import { IoIosCreate } from "react-icons/io";
import Cookies from "js-cookie"; // Import js-cookie to manage cookies
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import { ref, remove } from "firebase/database"; // Import remove from firebase/database for session removal
import { db } from "../firebase"; // Import your Firebase instance

function TeacherMenu({ activePage, setActivePage }) {
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
      <div className="TeacherHeader">
        <div className="TeacherProfilebar">
          <div className="TeacherLogo">
            <img src={logo} alt="logo" />
          </div>
          <div>
            <CgProfile className="CgProfile" />
          </div>
        </div>
        <div className="TeacherSidebar">
          <div className="TeacherNavbar">
            <ul>
              <li
                className={activePage === "dashboard" ? "active" : ""}
                onClick={() => setActivePage("dashboard")}
              >
                <LuLayoutDashboard className="TeacherIcon" />
              </li>
              <li
                className={activePage === "users" ? "active" : ""}
                onClick={() => setActivePage("users")}
              >
                <FaRegUser className="TeacherIcon" />
              </li>
              <li
                className={activePage === "Cpaper" ? "active" : ""}
                onClick={() => setActivePage("Cpaper")}
              >
                <IoIosCreate className="TeacherIcon" />
              </li>
              <li
                className={activePage === "AnswerSheet" ? "active" : ""}
                onClick={() => setActivePage("AnswerSheet")}
              >
                <IoIosPaper className="TeacherIcon" />
              </li>
              <li
                className={activePage === "Setting" ? "active" : ""}
                onClick={() => setActivePage("Setting")}
              >
                <IoSettingsOutline className="TeacherIcon" />
              </li>
              <li onClick={handleLogout}>
                <IoIosLogOut className="TeacherIcon" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default TeacherMenu;
