import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"; // Register chart.js components
import { ref, get } from "firebase/database"; // Import Firebase database functions
import { db } from "../firebase"; // Adjust the import path for your Firebase config
import "./AdminDashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend); // Register required components for Chart.js

function AdminDashboard() {
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [totalStaffs, setTotalStaffs] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPapers, setTotalPapers] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users from Firebase
        const usersSnapshot = await get(ref(db, "users"));
        const users = usersSnapshot.val() || {};

        const totalStaffsCount = Object.values(users).filter(
          (user) => user.role === "Teacher"
        ).length;
        const totalStudentsCount = Object.values(users).filter(
          (user) => user.role === "Student"
        ).length;

        // Fetch departments from Firebase
        const departmentsSnapshot = await get(ref(db, "departments"));
        const departments = departmentsSnapshot.val() || [];
        const totalDepartmentsCount = Object.keys(departments).length;

        // Fetch papers from Firebase
        const papersSnapshot = await get(ref(db, "papers"));
        const papersData = papersSnapshot.val() || {};

        // Convert the object to an array and count the papers
        const totalPapersCount = Object.keys(papersData).length;

        console.log("Total Papers:", totalPapersCount);

        // Update state
        setTotalDepartments(totalDepartmentsCount);
        setTotalStaffs(totalStaffsCount);
        setTotalStudents(totalStudentsCount);
        setTotalPapers(totalPapersCount);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };

    fetchData();
  }, []);

  // Data for the Pie Chart
  const pieData = {
    labels: ["Teachers", "Students"],
    datasets: [
      {
        label: "User Role Distribution",
        data: [totalStaffs, totalStudents], // Number of teachers and students
        backgroundColor: ["#007bff", "#28a745"],
        hoverBackgroundColor: ["#0056b3", "#1e7e34"],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };

  return (
    <div className="AdminPage">
      <div className="Admin-c1">
        <div className="Admin-dash-nav">
          <h3>Admin Dashboard</h3>
          <ol>
            <li>
              <a href="/AdminDashboard/">Dashboard</a>
            </li>
            <li>AdminDashboard</li>
          </ol>
        </div>
        <div className="Admin-cardContainer">
          <div className="Admin-card">
            Total Department
            <p>{totalDepartments}</p>
          </div>
          <div className="Admin-card">
            Total Staff
            <p>{totalStaffs}</p>
          </div>
          <div className="Admin-card">
            Total Student
            <p>{totalStudents}</p>
          </div>
          <div className="Admin-card">
            Total Paper
            <p>{totalPapers}</p>
          </div>
        </div>
        <div className="Admin-SContainer">
          <div className="Admin-calendar">
            <h4>Calendar</h4>
            <Calendar onChange={setSelectedDate} value={selectedDate} />
            <p>Selected Date: {selectedDate.toDateString()}</p>
          </div>

          {/* Pie Chart Section */}
          <div className="Admin-pieChart">
            <h4>User Role Distribution</h4>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
