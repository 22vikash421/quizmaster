import React, { useEffect, useState } from "react";
import "./TeacherDashboard.css";
import { FaUser } from "react-icons/fa6";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns"; // To format the date
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { db } from "../firebase";
import { ref, onValue, get, child } from "firebase/database";
import Cookies from "js-cookie"; // Import js-cookie

ChartJS.register(ArcElement, Tooltip, Legend);

function TeacherDashboard() {
  const [loginUserName, setLoginUserName] = useState("");
  const [loginUserId, setLoginUserId] = useState("");
  const [loginUserRole, setLoginUserRole] = useState("");
  const [loginUserSubject, setLoginUserSubject] = useState("");
  const [papers, setPapers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    // Get the logged-in user ID from cookies
    const storedLoginUserId = Cookies.get("loggedInUserId");

    if (storedLoginUserId) {
      const dbRef = ref(db, `loggedInUsers/${storedLoginUserId}`);

      // Fetch user data based on ID
      onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          const loggedInUser = snapshot.val();
          if (loggedInUser && loggedInUser.role === "Teacher") {
            setLoginUserName(loggedInUser.name || "");
            setLoginUserId(loggedInUser.id || "");
            setLoginUserRole(loggedInUser.role || "");
            setLoginUserSubject(loggedInUser.subject || "");
          } else {
            console.log("Logged in user is not a teacher");
          }
        } else {
          console.log("No logged-in user found");
        }
      });
    } else {
      console.log("No logged-in user ID found in cookies");
    }
  }, []);

  useEffect(() => {
    // Fetch students from Firebase
    const fetchStudents = async () => {
      const dbRef = ref(db);
      try {
        const studentsSnapshot = await get(child(dbRef, "users"));
        const usersData = studentsSnapshot.val() || {};

        // Filter out students from the fetched users
        const filteredStudents = Object.values(usersData).filter(
          (user) => user.role === "Student"
        );
        setStudents(filteredStudents);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    // Fetch papers from Firebase
    const fetchPapers = async () => {
      const dbRef = ref(db);
      try {
        const papersSnapshot = await get(child(dbRef, "papers"));
        const papersData = papersSnapshot.val() || {};

        // Convert the papers object to an array
        const papersArray = Object.values(papersData);

        setPapers(papersArray);
      } catch (error) {
        console.error("Error fetching papers:", error);
      }
    };

    fetchStudents();
    fetchPapers();
  }, []);

  const formatDate = (date) => format(date, "yyyy-MM-dd");

  const getExamForDate = (date) => {
    const formattedDate = formatDate(date);

    return papers.filter((paper) => {
      // Check if examDate exists and is valid
      if (paper.examDate) {
        try {
          const paperDate = new Date(paper.examDate);

          if (!isNaN(paperDate.getTime())) {
            return formatDate(paperDate) === formattedDate;
          }
        } catch (error) {
          console.error("Invalid exam date:", paper.examDate, error);
          return false; // Exclude this paper if the date is invalid
        }
      }
      return false; // Exclude papers without a valid examDate
    });
  };

  // Calendar tile content (exam names)
  const tileContent = ({ date }) => {
    const examsOnDate = getExamForDate(date);
    return (
      <div>
        {examsOnDate.length > 0 &&
          examsOnDate.map((exam) => (
            <p key={exam.SCode} className="exam-tile">
              {exam.SName}
            </p>
          ))}
      </div>
    );
  };

  // Data for the pie chart
  const pieData = {
    labels: ["Students", "Papers Created"],
    datasets: [
      {
        data: [students.length, papers.length],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  return (
    <div className="TeacherPage">
      <div className="Teacher-c1">
        <div className="Teacher-dash-nav">
          <h3>Teacher Dashboard</h3>
          <ol>
            <li>
              <a href="/TeacherDashboard/">Dashboard</a>
            </li>
            <li>Teacher Dashboard</li>
          </ol>
        </div>
        <div className="CardContainer-ProfileBar">
          <div className="Teacher-CardContainer">
            <div className="CardContainer-Profilebox">
              <FaUser className="FaUser-Profilebox" />
            </div>
            <div className="CardContainer-ProfileName">
              <p className="ProfileName-TeacherId">#{loginUserId}</p>
              <h4>{loginUserName}</h4>
              <p>
                <b>Role :-</b> {loginUserRole}
              </p>
              <p>
                <b>Subject :-</b> <span>{loginUserSubject}</span>
              </p>
            </div>
            <div className="CardContainer-ProfileEdit">
              <a href="/">Edit</a>
            </div>
          </div>
        </div>
        <div className="Teacher-calendra-pie-box">
          <div className="Teacher-calendar">
            <h4>Calendar</h4>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent} // Display exams on tiles
            />
            <p>Selected Date: {selectedDate.toDateString()}</p>
          </div>
          <div className="pie-chart">
            <h4>Distribution of Students and Papers</h4>
            <Pie data={pieData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
