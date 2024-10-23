import React, { useEffect, useState } from "react";
import { getDatabase, ref, get, update } from "firebase/database";
import "./TeacherAnswer.css";

function TeacherAnswer() {
  const [answers, setAnswers] = useState({}); // All answer sheets as an object with paperId as key
  const [papers, setPapers] = useState([]); // All papers
  const [manualMarks, setManualMarks] = useState({}); // To store manual marks for one-line answers
  const [selectedSubject, setSelectedSubject] = useState(null); // Track selected subject
  const [selectedPaper, setSelectedPaper] = useState(null); // Track selected paper

  useEffect(() => {
    const db = getDatabase();

    // Fetch papers and answer sheets data from Firebase
    const fetchData = async () => {
      const paperRef = ref(db, "papers/");
      const answersRef = ref(db, "answerSheets/");

      try {
        // Get papers and answer sheets from Firebase
        const paperSnapshot = await get(paperRef);
        const answersSnapshot = await get(answersRef);

        const paperData = paperSnapshot.val();
        const answerData = answersSnapshot.val();

        if (paperData) setPapers(Object.values(paperData));
        if (answerData) {
          setAnswers(answerData); // Store answer sheets as an object with paperId as keys
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  // Group papers by subject
  const groupBySubject = () => {
    const subjects = {};
    papers.forEach((paper) => {
      const subject = paper.faculties;
      if (!subjects[subject]) {
        subjects[subject] = [];
      }
      subjects[subject].push(paper);
    });
    return subjects;
  };

  // Function to verify MCQ answers automatically
  const verifyAnswer = (questionIndex, studentAnswer, correctAnswer) => {
    if (!correctAnswer) return "No correct answer available";
    return studentAnswer === correctAnswer ? "Correct" : "Incorrect";
  };

  // Handle manual checking of one-line answers
  const handleManualCheck = (studentId, questionIndex, status) => {
    setManualMarks((prevMarks) => ({
      ...prevMarks,
      [studentId]: {
        ...prevMarks[studentId],
        [questionIndex]: status,
      },
    }));
  };

  // Handle publishing results
  const handlePublishResults = async (studentId, paperId) => {
    const db = getDatabase();
    const sheetRef = ref(db, `answerSheets/${paperId}/${studentId}`);

    // Initialize total marks and obtained marks
    let totalMarks = 0;
    let obtainedMarks = 0;

    const sheetData = answers[paperId][studentId];

    if (!sheetData) {
      alert("No answer sheet found for this student.");
      return;
    }

    Object.entries(sheetData.answers || {}).forEach(([key, value]) => {
      const questionIndex = parseInt(key);
      const question = selectedPaper.questions?.[questionIndex];

      // Check if the question exists
      if (question) {
        // Increment total marks for each question
        totalMarks += 1; // Assuming 1 mark for each question

        // Check and increment obtained marks for MCQ answers
        if (value.mcqAnswer === question.correctAnswer) {
          obtainedMarks += 1; // Increment if the answer is correct
        }

        // Add marks for manual checks of one-line answers
        if (manualMarks[studentId] && manualMarks[studentId][questionIndex]) {
          if (manualMarks[studentId][questionIndex] === "Correct") {
            obtainedMarks += 1; // Add to obtained marks for correct manual check
          }
          // No need to decrement for incorrect; only add for correct
        }
      }
    });

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

    try {
      // Update answer sheet with results
      await update(sheetRef, {
        status: "Published",
        result: {
          studentDetails: {
            studentId,
            studentName: sheetData.studentName,
          },
          totalMarks,
          obtainedMarks,
          percentage,
          declarationDate: new Date().toISOString(), // Current date and time
        },
      });
      alert("Results published successfully!");
    } catch (error) {
      console.error("Error publishing results: ", error);
    }
  };

  const subjects = groupBySubject();

  return (
    <div className="TeacherAnswer">
      <div className="TeacherAnswer-C1">
        <h2 className="TeacherAnswer-h2">Subjects and Papers</h2>
        <ul>
          {Object.keys(subjects).map((subject, idx) => (
            <li key={idx}>
              <button
                onClick={() => {
                  setSelectedSubject(subject);
                  setSelectedPaper(null);
                }}
              >
                {subject} - {subjects[subject].length} paper(s)
              </button>
            </li>
          ))}
        </ul>

        {/* Show papers for selected subject */}
        {selectedSubject && !selectedPaper && (
          <>
            <h3>Papers for {selectedSubject}</h3>
            {subjects[selectedSubject].map((paper, paperIdx) => (
              <div key={paperIdx} className="paper-sheet">
                <h3>
                  Paper ID: {paper.SCode} | Teacher: {paper.STeacher}
                </h3>
                <h4>Exam Date: {new Date(paper.examDate).toLocaleString()}</h4>
                <button onClick={() => setSelectedPaper(paper)}>
                  View Answer Sheets
                </button>
              </div>
            ))}
          </>
        )}

        {/* Show answer sheets for selected paper */}
        {selectedPaper && (
          <>
            <h3>Answer Sheets for Paper: {selectedPaper.SCode}</h3>
            {answers[selectedPaper.SCode] ? (
              Object.entries(answers[selectedPaper.SCode]).map(
                ([studentId, sheet]) => (
                  <div key={studentId} className="answer-sheet">
                    <h4>
                      Student:{" "}
                      {sheet.studentName
                        ? `${sheet.studentName} (${studentId})`
                        : "Student details not available"}
                    </h4>

                    {/* Map through answers in the answer sheet */}
                    {Object.entries(sheet.answers || {}).map(([key, value]) => {
                      const questionIndex = parseInt(key);
                      const question = selectedPaper.questions?.[questionIndex];

                      if (!question) {
                        return (
                          <div key={key} className="answer-card">
                            <h4>
                              Question {questionIndex + 1}: No question
                              available
                            </h4>
                          </div>
                        );
                      }

                      return (
                        <div key={key} className="answer-card">
                          <h4>
                            Question {questionIndex + 1}:{" "}
                            {question.questionText}
                          </h4>

                          {/* MCQ Answer Auto-check */}
                          {value.mcqAnswer && (
                            <p>
                              <strong>MCQ Answer:</strong> {value.mcqAnswer} (
                              <span
                                className={
                                  verifyAnswer(
                                    questionIndex,
                                    value.mcqAnswer,
                                    question.correctAnswer
                                  ) === "Correct"
                                    ? "correct"
                                    : "incorrect"
                                }
                              >
                                {verifyAnswer(
                                  questionIndex,
                                  value.mcqAnswer,
                                  question.correctAnswer
                                )}
                              </span>
                              )
                            </p>
                          )}

                          {/* One-line Text Answer Manual-check */}
                          {value.textAnswer && (
                            <div>
                              <p>
                                <strong>Text Answer:</strong> {value.textAnswer}
                              </p>
                              <label>
                                <strong>Manual Check:</strong>
                                <select
                                  value={
                                    manualMarks[studentId]?.[questionIndex] ||
                                    "Pending"
                                  }
                                  onChange={(e) =>
                                    handleManualCheck(
                                      studentId,
                                      questionIndex,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Correct">Correct</option>
                                  <option value="Incorrect">Incorrect</option>
                                </select>
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <p>
                      <strong>Submitted At:</strong>{" "}
                      {new Date(sheet.submittedAt).toLocaleString()}
                    </p>

                    {/* Publish Button */}
                    <button
                      onClick={() =>
                        handlePublishResults(studentId, selectedPaper.SCode)
                      }
                    >
                      Publish Results
                    </button>
                  </div>
                )
              )
            ) : (
              <p>No answer sheets found for this paper.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TeacherAnswer;
