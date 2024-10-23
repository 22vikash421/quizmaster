import React, { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import Cookies from "js-cookie"; // Import the js-cookie library
import "./StudentAnswer.css";

function StudentAnswer() {
  const [studentResults, setStudentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentId = Cookies.get("loggedInUserId"); // Retrieve student ID from cookies
  const userRole = Cookies.get("role"); // Retrieve user role from cookies

  useEffect(() => {
    const fetchStudentResults = async () => {
      const db = getDatabase();
      const answersRef = ref(db, `answerSheets/`);

      try {
        const snapshot = await get(answersRef);
        const data = snapshot.val();
        const results = [];

        // Loop through results and filter for the logged-in student
        for (let SCode in data) {
          const paperResults = data[SCode]; // Results of the paper
          const studentResult = paperResults[studentId]; // Results for the student

          if (studentResult) {
            const { result } = studentResult; // Extract the necessary data

            // Push the results to the results array
            results.push({
              SCode,
              studentName: result.studentName,
              totalMarks: result.totalMarks,
              obtainedMarks: result.obtainedMarks,
              percentage: result.percentage,
              declarationDate: result.declarationDate,
              status: studentResult.status, // Assuming status is relevant
            });
          }
        }

        setStudentResults(results);
      } catch (error) {
        console.error("Error fetching student results:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userRole === "Student" && studentId) {
      // Verify role and ID before fetching
      fetchStudentResults();
    } else {
      setLoading(false); // Stop loading if not a student
    }
  }, [studentId, userRole]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="StudentAnswer">
      <div className="StudentAnswer-c1">
        <h2>
          {studentResults.length ? studentResults[0].studentName : "Student"}{" "}
          Student Results
        </h2>
        {studentResults.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <div>
            <h3>Results by Paper:</h3>
            <ul>
              {studentResults.map((result) => (
                <li key={result.SCode}>
                  <strong>Paper ID:</strong> {result.SCode}
                  <br />
                  <strong>Obtained Marks:</strong> {result.obtainedMarks}/
                  {result.totalMarks}
                  <br />
                  <strong>Percentage:</strong> {result.percentage}%<br />
                  <strong>Declaration Date:</strong>{" "}
                  {new Date(result.declarationDate).toLocaleString()}
                  <br />
                  <strong>Status:</strong> {result.status}
                  <br />
                </li>
              ))}
            </ul>

            {/* Chart Visualization */}
            <h3>Results Overview</h3>
            <PieChart width={400} height={400}>
              <Pie
                data={studentResults.map((result) => ({
                  name: result.SCode,
                  value: result.obtainedMarks,
                }))}
                cx={200}
                cy={200}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {studentResults.map((result, index) => (
                  <Cell
                    key={index}
                    fill={`#${Math.floor(Math.random() * 16777215).toString(
                      16
                    )}`}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentAnswer;
