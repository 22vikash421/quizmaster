import React from "react";
import "./AdminMenu.css";
import logo from "../../Image/logo.png";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaRegUser } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
// import { getAuth, signOut } from "firebase/auth"; // Import Firebase Auth functions
import { ref, remove } from "firebase/database"; // Import remove function for Firebase Realtime Database
import { db } from "../firebase"; // Import your Firebase database instance
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom

function AdminMenu({ activePage, setActivePage, userRole }) {

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
    <div className="AdminHeader">
      <div className="AdminProfilebar">
        <div className="AdminLogo">
          <img src={logo} alt="logo" />
        </div>
        <div>
          <CgProfile className="CgProfile" />
        </div>
      </div>
      <div className="AdminSidebar">
        <div className="AdminNavbar">
          <ul>
            <li
              className={activePage === "dashboard" ? "active" : ""}
              onClick={() => setActivePage("dashboard")}
            >
              <LuLayoutDashboard className="AdminIcon" />
            </li>
            <li
              className={activePage === "users" ? "active" : ""}
              onClick={() => setActivePage("users")}
            >
              <FaRegUser className="AdminIcon" />
            </li>
            <li
              className={activePage === "setting" ? "active" : ""}
              onClick={() => setActivePage("setting")}
            >
              <IoSettingsOutline className="AdminIcon" />
            </li>
            <li onClick={handleLogout}> {/* Attach the logout handler */}
              <IoIosLogOut className="AdminIcon" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminMenu;
