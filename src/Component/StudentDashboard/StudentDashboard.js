import React, { useEffect, useState } from "react";
import "./StudentDashboard.css";
import { FaUser } from "react-icons/fa6";
import { db } from "../firebase"; // Import your Firebase database instance
import { ref, onValue, get } from "firebase/database"; // Import necessary functions
import Cookies from "js-cookie"; // Import js-cookie
import Calendar from "react-calendar"; // Import react-calendar
import "react-calendar/dist/Calendar.css"; // Calendar styles
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ResponsiveContainer } from "recharts"; // Import ResponsiveContainer


function StudentDashboard() {
  const [loginUserName, setLoginUserName] = useState("");
  const [loginUserId, setLoginUserId] = useState("");
  const [loginUserRole, setLoginUserRole] = useState("");
  const [loginUserSemester, setLoginUserSemester] = useState("");
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [completedExams, setCompletedExams] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    // Fetch logged-in user ID from cookies
    const storedLoginUserId = Cookies.get("loggedInUserId");

    if (storedLoginUserId) {
      // Fetch the logged-in user from Firebase based on their ID
      const dbRef = ref(db, `loggedInUsers/${storedLoginUserId}`);

      onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          const loggedInUser = snapshot.val();

          setLoginUserName(loggedInUser.name || "");
          setLoginUserRole(loggedInUser.role === "Student");
          setLoginUserSemester(loggedInUser.semester || "");
          setLoginUserId(loggedInUser.id || "");
        } else {
          console.log("Logged-in user not found");
        }
      });

      // Fetch upcoming exams from "papers"
      const fetchUpcomingExams = async () => {
        const papersRef = ref(db, `papers/`);
        try {
          const snapshot = await get(papersRef);
          if (snapshot.exists()) {
            const papersData = snapshot.val();
            const currentDate = new Date();
            const upcoming = [];

            for (let paperId in papersData) {
              const paper = papersData[paperId];
              const examDate = new Date(paper.examDate);

              // Check if the exam date is in the future
              if (examDate >= currentDate) {
                upcoming.push({
                  SCode: paper.SCode,
                  subject: paper.SName,
                  examDate: paper.examDate,
                  totalMarks: paper.totalMarks || "N/A", // Add if total marks is stored
                });
              }
            }

            setUpcomingExams(upcoming);
          } else {
            console.log("No upcoming exams found.");
          }
        } catch (error) {
          console.error("Error fetching upcoming exams:", error);
        }
      };

      // Fetch completed exams from answerSheets
      const fetchCompletedExams = async () => {
        const answersRef = ref(db, `answerSheets/`);
        try {
          const snapshot = await get(answersRef);
          if (snapshot.exists()) {
            const answersData = snapshot.val();
            const completed = [];

            for (let SCode in answersData) {
              const paperResults = answersData[SCode];
              const studentResult = paperResults[storedLoginUserId]; // Results for the logged-in student

              if (studentResult) {
                const { result } = studentResult;

                completed.push({
                  SCode,
                  subject: result.subjectName, // Assuming subject name is stored
                  totalMarks: result.totalMarks,
                  obtainedMarks: result.obtainedMarks,
                  percentage: result.percentage,
                  declarationDate: result.declarationDate,
                });
              }
            }

            setCompletedExams(completed);
          } else {
            console.log("No completed exams found in answerSheets.");
          }
        } catch (error) {
          console.error("Error fetching completed exams:", error);
        }
      };

      fetchUpcomingExams();
      fetchCompletedExams();
    } else {
      console.log("No logged-in user ID found");
    }
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="StudentPage">
      <div className="Student-c1">
        <div className="Student-dash-nav">
          <h3>Student Dashboard</h3>
          <ol>
            <li>
              <a href="/StudentDashboard/">Dashboard</a>
            </li>
            <li>Student Dashboard</li>
          </ol>
        </div>
        <div className="Student-CardContainer">
          <div className="CardContainer-Profilebox">
            <FaUser className="FaUser-Profilebox" />
          </div>
          <div className="CardContainer-ProfileName">
            <p className="ProfileName-StudentId">#{loginUserId}</p>
            <h4>{loginUserName}</h4>
            <p>
              <b>Role :</b> {loginUserRole}
            </p>
            <p>
              <b>Semester :</b> <span>{loginUserSemester}</span>
            </p>
          </div>
          <div className="CardContainer-ProfileEdit">
            <a href="/">Edit</a>
          </div>
        </div>
        <div className="ExamCalendra-box">
          {/* Calendar and Exam List Section */}
          <div className="Student-ExamSection">
            <h3>Exam Schedule</h3>

            {/* Calendar */}
            <div className="ExamCalendar">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileClassName={({ date, view }) => {
                  // Highlight dates that have exams
                  const examDates = [...upcomingExams, ...completedExams].map(
                    (exam) =>
                      new Date(
                        exam.declarationDate || exam.examDate
                      ).toDateString()
                  );
                  return examDates.includes(date.toDateString())
                    ? "highlight"
                    : null;
                }}
              />
            </div>

            {/* List of Upcoming Exams */}
            <div className="ExamList">
              <h4>Upcoming Exams :</h4>
              {upcomingExams.length > 0 ? (
                <ul>
                  {upcomingExams.map((exam) => (
                    <li key={exam.SCode}>
                      <strong>{exam.subject}</strong> -{" "}
                      {new Date(exam.examDate).toLocaleDateString()}
                      <br />
                      <b>Total Marks:</b> {exam.totalMarks}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No upcoming exams.</p>
              )}

              {/* List of Completed Exams */}
              <h4>Completed Exams :</h4>
              {completedExams.length > 0 ? (
                <ul>
                  {completedExams.map((exam) => (
                    <li key={exam.SCode}>
                      <strong>{exam.subject}</strong> -{" "}
                      {new Date(exam.declarationDate).toLocaleDateString()}
                      <br />
                      <b>Total Marks:</b> {exam.totalMarks} |{" "}
                      <b>Obtained Marks:</b> {exam.obtainedMarks}
                      <br />
                      <b>Percentage:</b> {exam.percentage}%
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No completed exams.</p>
              )}
            </div>
          </div>
          <div className="CalendraChart">
            <h3>Results Overview</h3>
            {completedExams.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                {" "}
                {/* Full width, fixed height */}
                <PieChart>
                  <Pie
                    data={completedExams.map((exam) => ({
                      name: exam.subject,
                      value: exam.obtainedMarks,
                    }))}
                    cx="50%" // Center horizontally
                    cy="50%" // Center vertically
                    outerRadius="80%" // Use percentage for better responsiveness
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {completedExams.map((exam, index) => (
                      <Cell
                        key={index}
                        fill={`#${Math.floor(Math.random() * 16777215).toString(
                          16
                        )}`} // Random color
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>No exam results available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
