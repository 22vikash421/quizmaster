import React, { useState, useEffect } from "react";
import { ref, get, set } from "firebase/database";
import { db } from "../firebase";
import Cookies from "js-cookie"; // Use js-cookie library for cookie management
import "./StudentExam.css";

function StudentExam() {
  const [studentDetails, setStudentDetails] = useState(null);
  const [examStartTimes, setExamStartTimes] = useState({});
  const [examAttempted, setExamAttempted] = useState({});

  const EXAM_DURATION_MINUTES = 0; // Set exam duration to 5 minutes

  const [availablePapers, setAvailablePapers] = useState([]);
  const [attemptedPapers, setAttemptedPapers] = useState([]);
  const [expiredPapers, setExpiredPapers] = useState([]);
  const [examDetails, setExamDetails] = useState(null);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_MINUTES * 60);
  const [answers, setAnswers] = useState({});

  // Fetch logged-in user details from Firebase and store in cookies
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const loggedInUserId = Cookies.get("loggedInUserId");
  
      if (!loggedInUserId) {
        console.error("No loggedInUserId found in cookies.");
        return;
      }
      
      try {
        const userRef = ref(db, `loggedInUsers/${loggedInUserId}`);
        const snapshot = await get(userRef);
  
        if (snapshot.exists()) {
          const userDetails = snapshot.val();
          console.log("Fetched student details:", userDetails);
          setStudentDetails(userDetails);
  
          // Save important details in cookies (if not already set)
          if (!Cookies.get("loggedInUserId")) {
            Cookies.set("loggedInUserId", loggedInUserId, { expires: 1 });
          }
  
          if (!Cookies.get("role")) {
            Cookies.set("role", userDetails.role, { expires: 1 });
          }
  
          // Fetch exam start times and attempted exams
          fetchExamData(loggedInUserId);
        } else {
          console.error("User not found in Firebase.");
        }
      } catch (error) {
        console.error("Error fetching logged-in user from Firebase:", error);
      }
    };
  
    const fetchExamData = async (userId) => {
      try {
        const startTimesRef = ref(db, `examStartTimes/${userId}`);
        const startTimesSnapshot = await get(startTimesRef);
        if (startTimesSnapshot.exists()) {
          setExamStartTimes(startTimesSnapshot.val());
        } else {
          console.error("No exam start times found.");
        }
  
        const attemptedRef = ref(db, `examAttempted/${userId}`);
        const attemptedSnapshot = await get(attemptedRef);
        if (attemptedSnapshot.exists()) {
          setExamAttempted(attemptedSnapshot.val());
        } else {
          console.error("No attempted exam data found.");
        }
      } catch (error) {
        console.error("Error fetching exam data from Firebase:", error);
      }
    };
  
    fetchLoggedInUser();
  }, []);
  
  useEffect(() => {
    let timer;
    
    if (isExamStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000); // Update every second
    } else if (timeLeft === 0 && isExamStarted) {
      handleAutoSubmit(); // Auto submit when timer runs out
    }
  
    return () => clearInterval(timer); // Cleanup timer on unmount
  }, [isExamStarted, timeLeft]);

  // Fetch papers from Firebase
  useEffect(() => {
    const fetchPapersFromFirebase = async () => {
      if (!studentDetails) return; // Fetch papers only if studentDetails is available

      try {
        const papersRef = ref(db, "papers");
        const snapshot = await get(papersRef);
        if (snapshot.exists()) {
          const papers = snapshot.val();
          categorizePapers(papers);
        } else {
          console.error("No papers found in Firebase.");
        }
      } catch (error) {
        console.error("Error fetching papers from Firebase:", error);
      }
    };

    const categorizePapers = (papers) => {
      const now = new Date();
      const available = [];
      const attempted = [];
      const expired = [];

      Object.keys(papers).forEach((key) => {
        const paper = papers[key];

        if (
          paper.faculties === studentDetails.faculties &&
          paper.semester === studentDetails.semester
        ) {
          const examDate = new Date(paper.examDate);
          const isAttempted = examAttempted[paper.SCode];
          const startTime = new Date(examStartTimes[paper.SCode]);

          if (isAttempted) {
            attempted.push(paper);
          } else if (examDate < now) {
            if (
              startTime &&
              now - startTime > EXAM_DURATION_MINUTES * 60 * 1000
            ) {
              expired.push(paper);
            } else if (
              !startTime ||
              now - examDate < EXAM_DURATION_MINUTES * 60 * 1000
            ) {
              available.push(paper);
            } else {
              expired.push(paper);
            }
          } else {
            available.push(paper);
          }
        }
      });

      setAvailablePapers(available);
      setAttemptedPapers(attempted);
      setExpiredPapers(expired);
    };

    fetchPapersFromFirebase();
  }, [examAttempted, examStartTimes, studentDetails]);

  const handleStartExam = async (paper) => {
    const now = new Date();
    const examDate = new Date(paper.examDate);

    if (now >= examDate) {
      const durationInMinutes = parseInt(paper.examDuration, 10);
      const updatedStartTimes = { ...examStartTimes, [paper.SCode]: now.toISOString() };

      // Save start time in Firebase
      const loggedInUserId = Cookies.get("loggedInUserId");
      const startTimesRef = ref(db, `examStartTimes/${loggedInUserId}`);
      await set(startTimesRef, updatedStartTimes);

      // Set local state
      setExamStartTimes(updatedStartTimes);
      setExamDetails(paper);
      setIsExamStarted(true);
      setTimeLeft(durationInMinutes * 60);
      setCurrentQuestion(1);
    } else {
      alert("The exam is not available yet. Please check the date and time.");
    }
  };

  // Function to handle MCQ answer changes
  const handleMCQAnswerChange = (questionIndex, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: { ...prev[questionIndex], mcqAnswer: answer },
    }));
    console.log("Updated MCQ Answers:", answers); // Debugging log
  };

  // Function to handle text answer changes (for one-line or textual answers)
  const handleTextAnswerChange = (questionIndex, event) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        textAnswer: event.target.value,
      },
    }));
    console.log("Updated Text Answers:", answers); // Debugging log
  };

  // Function to navigate to the previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // Function to navigate to the next question
  const handleNextQuestion = () => {
    if (currentQuestion < examDetails.tQuestion) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };


  const handleAutoSubmit = async () => {
    if (!examDetails || !examDetails.SCode) {
      alert("Error: Exam details are missing.");
      return;
    }

    if (!studentDetails || !studentDetails.id) {
      alert("Error: Student details are missing.");
      return;
    }

    const answerSheet = {
      paperId: examDetails.SCode,
      studentId: studentDetails.id,
      studentName: studentDetails.name || "Unknown Student",
      studentDetails: {
        faculties: studentDetails.faculties || "Unknown Faculty",
        semester: studentDetails.semester || "Unknown Semester",
      },
      answers: answers,
      submittedAt: new Date().toISOString(),
    };

    try {
      const answerSheetRef = ref(
        db,
        `answerSheets/${examDetails.SCode}/${studentDetails.id}`
      );
      await set(answerSheetRef, answerSheet);

      // Update attempted exams in Firebase
      const updatedAttemptedExams = {
        ...examAttempted,
        [examDetails.SCode]: new Date().toISOString(),
      };
      const attemptedExamRef = ref(
        db,
        `examAttempted/${studentDetails.id}`
      );
      await set(attemptedExamRef, updatedAttemptedExams);

      setExamAttempted(updatedAttemptedExams);
      alert("Exam submitted successfully!");
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("There was an error submitting your exam. Please try again.");
    }

    setIsExamStarted(false);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="StudentExamPage">
      <div className="StudentExamPage-C1">
        {!isExamStarted ? (
          <>
            <h2>Available Exams</h2>
            <div className="exam-list">
              {availablePapers.length > 0 ? (
                availablePapers.map((paper) => (
                  <div key={paper.paperId} className="exam-card">
                    <h3>{paper.SName}</h3>
                    <p>Total Questions: {paper.tQuestion}</p>
                    <p>
                      Exam Date: {new Date(paper.examDate).toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleStartExam(paper)}
                      disabled={examAttempted[paper.paperId]}
                    >
                      {examAttempted[paper.paperId]
                        ? "Exam Already Attempted"
                        : "Start Exam"}
                    </button>
                  </div>
                ))
              ) : (
                <p>No available exams.</p>
              )}
            </div>

            <h2>Attempted Exams</h2>
            <div className="exam-list">
              {attemptedPapers.length > 0 ? (
                attemptedPapers.map((paper) => (
                  <div key={paper.paperId} className="exam-card">
                    <h3>{paper.SName}</h3>
                    <p>
                      Attempted on:{" "}
                      {new Date(examAttempted[paper.SCode]).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p>No attempted exams.</p>
              )}
            </div>

            <h2>Expired Exams</h2>
            <div className="exam-list">
              {expiredPapers.length > 0 ? (
                expiredPapers.map((paper) => (
                  <div key={paper.paperId} className="exam-card">
                    <h3>{paper.SName}</h3>
                    <p>
                      Exam Date: {new Date(paper.examDate).toLocaleString()}
                    </p>
                    <p>This exam has expired and cannot be attempted.</p>
                  </div>
                ))
              ) : (
                <p>No expired exams.</p>
              )}
            </div>
          </>
        ) : (
          <div className="exam-section">
            <div className="exam-sidebar">
              <div className="timer">
                <p>Time Left: {formatTime(timeLeft)}</p>
              </div>
              <ul className="question-list">
                {Array.from({ length: examDetails.tQuestion }).map(
                  (_, index) => (
                    <li
                      key={index}
                      className={currentQuestion === index + 1 ? "active" : ""}
                    >
                      Question {index + 1}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="exam-content">
              <h3>{examDetails.questions[currentQuestion - 1].questionText}</h3>
              <div className="options">
                {examDetails.questions[currentQuestion - 1].questionType ===
                  "MCQ" ||
                  examDetails.questions[currentQuestion - 1].questionType ===
                  "Both"
                  ? Object.entries(
                    examDetails.questions[currentQuestion - 1].options
                  ).map(([key, value]) => (
                    <div key={key} className="Exam-Select-Option">
                      <input
                        className="Selcet-Option-Input"
                        type="radio"
                        id={key}
                        name={`question-${currentQuestion}`}
                        value={key}
                        checked={
                          answers[currentQuestion - 1]?.mcqAnswer === key
                        }
                        onChange={() =>
                          handleMCQAnswerChange(currentQuestion - 1, key)
                        }
                      />
                      <label className="Selcet-Option-label" htmlFor={key}>
                        {key}: {value}
                      </label>
                    </div>
                  ))
                  : null}

                {examDetails.questions[currentQuestion - 1].questionType ===
                  "OneLine" ||
                  examDetails.questions[currentQuestion - 1].questionType ===
                  "Both" ? (
                  <textarea
                    className="Selcet-Option-Textbox"
                    rows="3"
                    placeholder="Type your answer (10 words)"
                    value={answers[currentQuestion - 1]?.textAnswer || ""}
                    onChange={(event) =>
                      handleTextAnswerChange(currentQuestion - 1, event)
                    }
                  />
                ) : null}
              </div>

              <div className="question-navigation">
                {/* Show Previous button only if not on the first question */}
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestion === 1}
                >
                  Previous
                </button>

                {/* Conditionally show Next button or Submit button */}
                {currentQuestion < examDetails.tQuestion ? (
                  <button onClick={handleNextQuestion}>Next</button>
                ) : (
                  <button onClick={handleAutoSubmit}>Submit Exam</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentExam;
