import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Import Realtime Database instance
import { ref, set, onValue, update } from "firebase/database"; // Realtime Database functions
import "./TeacherCPaper.css";

function TeacherCPaper() {
  const [cpaper, setCPaper] = useState([]);
  const [search, setSearch] = useState("");
  const [newCPaper, setNewCPaper] = useState({
    SCode: "",
    SName: "",
    STeacher: "",
    faculties: "",
    semester: "",
    tQuestion: 0,
    examDuration: 0,
    examDate: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [viewPaper, setViewPaper] = useState(null);
  const [questionType, setQuestionType] = useState(""); // Track question type
  const [questions, setQuestions] = useState([]); // Track added questions
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    options: {
      A: "",
      B: "",
      C: "",
      D: "",
    },
    questionType: "",
    correctAnswer: "",
  });
  const [loggedInUser, setLoggedInUser] = useState({}); // Track logged-in user from Firebase

  // Fetch logged-in user data from Firebase Realtime Database
  useEffect(() => {
    const loggedInUserRef = ref(db, "loggedInUsers");

    // Fetch the loggedInUsers from Firebase
    onValue(loggedInUserRef, (snapshot) => {
      const userData = snapshot.val();

      if (userData) {
        // Loop through all users and find the logged-in teacher
        const teacher = Object.values(userData).find((user) => user.role === "Teacher");

        if (teacher) {
          // Set the logged-in teacher's data in the component state
          setLoggedInUser(teacher);

          // Update the newCPaper state with the teacher's name
          setNewCPaper((prevState) => ({
            ...prevState,
            STeacher: teacher.name, // Set teacher name
          }));
        } else {
          console.log("No teacher found in logged-in users");
        }
      } else {
        console.log("No logged-in users available");
      }
    });

    // Fetch stored papers from Realtime Database
    const fetchPapers = () => {
      const papersRef = ref(db, "papers");
      onValue(papersRef, (snapshot) => {
        const papersData = snapshot.val() || [];
        const filteredPapers = Object.values(papersData).filter(
          (paper) => paper.STeacher === loggedInUser.name
        );
        setCPaper(filteredPapers);
      });
    };

    // Call fetchPapers when loggedInUser is updated
    if (loggedInUser.name) {
      fetchPapers();
    }
  }, [loggedInUser.name]);

  // Save new paper to Realtime Database
  const handleCreatePaper = async (e) => {
    e.preventDefault();

    const { SCode, SName, STeacher, faculties, semester } = newCPaper;

    if (
      SCode?.trim() &&
      SName?.trim() &&
      STeacher?.trim() &&
      faculties?.trim() &&
      semester?.trim()
    ) {
      const paperWithQuestions = {
        ...newCPaper,
        questions,
        tQuestion: questions.length, // Set tQuestion to the number of questions
      };

      // Save to Realtime Database
      try {
        const paperRef = ref(db, `papers/${SCode}`);
        await set(paperRef, paperWithQuestions);

        // Update state after saving the paper
        setCPaper([...cpaper, paperWithQuestions]);
        setNewCPaper({
          SCode: "",
          SName: "",
          STeacher: loggedInUser.name || "",
          faculties: "",
          semester: "",
          tQuestion: 0,
          examDuration: 0,
          examDate: "",
        });
        setQuestions([]);
        setShowModal(false);
      } catch (error) {
        console.error("Error saving the paper:", error);
      }
    } else {
      alert("Please fill in all fields.");
    }
  };

  // Delete paper from Realtime Database
  const handleDelete = async (index) => {
    const updatedPapers = cpaper.filter((_, i) => i !== index);
    setCPaper(updatedPapers);

    const paperToDelete = cpaper[index];
    const paperRef = ref(db, `papers/${paperToDelete.SCode}`);
    await update(paperRef, { deleted: true });
  };

  const handleViewPaper = (index) => {
    const paper = cpaper[index];
    setViewPaper(paper);
    setQuestions(paper.questions || []);
  };

  const handleSaveEdit = async () => {
    const updatedPaper = {
      ...viewPaper,
      questions,
      tQuestion: questions.length,
    };

    const updatedPapers = cpaper.map((paper) =>
      paper.SCode === updatedPaper.SCode ? updatedPaper : paper
    );
    setCPaper(updatedPapers);

    const paperRef = ref(db, `papers/${updatedPaper.SCode}`);
    await update(paperRef, updatedPaper);

    setViewPaper(null);
    setQuestions([]);
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      alert("Please enter the question text.");
      return;
    }

    const newQuestion = { ...currentQuestion };
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);

    setViewPaper((prevState) => ({
      ...prevState,
      questions: updatedQuestions,
      tQuestion: updatedQuestions.length,
    }));

    setCurrentQuestion({
      questionText: "",
      options: { A: "", B: "", C: "", D: "" },
      questionType: "",
      correctAnswer: "",
    });
    setQuestionType("");
  };

  const filteredPapers = cpaper.filter(
    (paper) =>
      paper.SCode.toLowerCase().includes(search.toLowerCase()) ||
      paper.SName.toLowerCase().includes(search.toLowerCase()) ||
      paper.faculties.toLowerCase().includes(search.toLowerCase()) ||
      paper.semester.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="TeacherCPaper">
      <div className="cpaper-table-container">
        <div className="Teacher-dash-nav">
          <h3>Papers List</h3>
          <ol>
            <li>
              <a href="/TeacherDashboard/">Dashboard</a>
            </li>
            <li>Paper List</li>
          </ol>
        </div>
        <div className="cpaper-search">
          <input
            type="text"
            placeholder="Search Papers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="TeacherCPaper-add-btn"
            onClick={() => setShowModal(true)}
          >
            Add Paper
          </button>
        </div>

        {/* Papers Table */}
        <div className="cpaper-table">
          <table>
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Paper Name</th>
                <th>Subject Teacher</th>
                <th>Faculties</th>
                <th>Semester</th>
                <th>Total Questions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPapers.length > 0 ? (
                filteredPapers.map((paper, index) => (
                  <tr key={index}>
                    <td>{paper.SCode}</td>
                    <td>{paper.SName}</td>
                    <td>{paper.STeacher}</td>
                    <td>{paper.faculties}</td>
                    <td>{paper.semester}</td>
                    <td>{paper.tQuestion}</td>
                    <td>
                      <button onClick={() => handleViewPaper(index)}>
                        View
                      </button>
                      <button onClick={() => handleDelete(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No papers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Paper Modal */}
      {showModal && (
        <div className="cpaper-form-modal">
          <div className="cpaper-form-modal-content">
            <span
              className="cpaper-form-close"
              onClick={() => setShowModal(false)}
            >
              &times;
            </span>
            <h2>Add Paper</h2>
            <form onSubmit={handleCreatePaper}>
              {/* Paper Name and Code */}
              <div className="cpaper-form-group">
                <label htmlFor="paperName">Paper Name</label>
                <input
                  id="paperName"
                  className="cpaper-form-modal-input"
                  type="text"
                  placeholder="Enter Paper Name"
                  value={newCPaper.SName}
                  onChange={(e) =>
                    setNewCPaper({ ...newCPaper, SName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="cpaper-form-group">
                <label htmlFor="paperCode">Subject Code</label>
                <input
                  id="paperCode"
                  className="cpaper-form-modal-input"
                  type="text"
                  placeholder="Enter Subject Code"
                  value={newCPaper.SCode}
                  onChange={(e) =>
                    setNewCPaper({ ...newCPaper, SCode: e.target.value })
                  }
                  required
                />
              </div>
              {/* faculties and Semester */}
              <div className="cpaper-form-group">
                <label htmlFor="faculties">Faculties</label>
                <select
                  className="cpaper-form-modal-input"
                  id="faculties"
                  value={newCPaper.faculties}
                  onChange={(e) =>
                    setNewCPaper({ ...newCPaper, faculties: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    Select Faculties
                  </option>
                  <option value="Computing Skills">Computing Skills</option>
                  <option value="Electrical Skills">Electrical Skills</option>
                  <option value="Manufacturing Skills">
                    Manufacturing Skills
                  </option>
                  <option value="Automotive Skills">Automotive Skills</option>
                  <option value="RAC Skills">RAC Skills</option>
                  <option value="Healthcare Skills">Healthcare Skills</option>
                </select>
              </div>
              <div className="cpaper-form-group">
                <label htmlFor="semester">Semester</label>
                <select
                  className="cpaper-form-modal-input"
                  id="semester"
                  value={newCPaper.semester}
                  onChange={(e) =>
                    setNewCPaper({ ...newCPaper, semester: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    Select Semester
                  </option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
              </div>
              <button type="submit" className="cpaper-form-modal-sub-btn">
                Add Paper
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View/Edit Paper Modal */}
      {viewPaper && (
        <div className="Addquestion-view-modal">
          <div className="Addquestion-form-modal-content">
            <span
              className="Addquestion-form-close"
              onClick={() => setViewPaper(null)}
            >
              &times;
            </span>
            <h2>View/Edit Paper</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Paper Name */}
              <div className="AddQuestion-form-C1">
                <div className="Addquestion-form-group">
                  <label htmlFor="editPaperName">Paper Name</label>
                  <input
                    id="editPaperName"
                    className="Addquestion-form-modal-input"
                    type="text"
                    placeholder="Enter Paper Name"
                    value={viewPaper.SName}
                    onChange={(e) =>
                      setViewPaper({ ...viewPaper, SName: e.target.value })
                    }
                  />
                </div>
                {/* Paper Code */}
                <div className="Addquestion-form-group">
                  <label htmlFor="editPaperCode">Paper Code</label>
                  <input
                    id="editPaperCode"
                    className="Addquestion-form-modal-input"
                    type="text"
                    placeholder="Enter Paper Code"
                    value={viewPaper.SCode}
                    onChange={(e) =>
                      setViewPaper({ ...viewPaper, SCode: e.target.value })
                    }
                  />
                </div>
                {/* Exam Duration */}
                <div className="Addquestion-form-group">
                  <label htmlFor="examDuration">Exam Duration (minutes)</label>
                  <input
                    required
                    id="examDuration"
                    className="Addquestion-form-modal-input"
                    type="number"
                    placeholder="Enter exam duration"
                    value={viewPaper.examDuration}
                    onChange={(e) =>
                      setViewPaper({
                        ...viewPaper,
                        examDuration: e.target.value,
                      })
                    }
                  />
                </div>
                {/* Exam Date */}
                <div className="Addquestion-form-group">
                  <label htmlFor="examDate">Exam Date</label>
                  <input
                    id="examDate"
                    required
                    className="Addquestion-form-modal-input"
                    type="datetime-local"
                    value={viewPaper.examDate}
                    onChange={(e) =>
                      setViewPaper({ ...viewPaper, examDate: e.target.value })
                    }
                  />
                </div>
              </div>
              {/* Questions */}
              <div className="AddQuestion-form-C1">
                <div className="Addquestion-form-group1">
                  <label>Enter the Question</label>
                  <input
                    type="text"
                    className="Addquestion-form-group1-input"
                    value={currentQuestion.questionText}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        questionText: e.target.value,
                      })
                    }
                  />
                  {/* <input type="text" className="Addquestion-form-group1-input" ></input> */}
                </div>
                <div className="Addquestion-form-group1">
                  <label>Select Question Type</label>

                  <select
                    className="Addquestion-form-group1-input"
                    value={currentQuestion.questionType}
                    onChange={(e) => {
                      setCurrentQuestion({
                        ...currentQuestion,
                        questionType: e.target.value,
                      }); // Set question type in currentQuestion
                      setQuestionType(e.target.value); // Set question type in local state
                    }}
                  >
                    <option value="">Select The Type</option>
                    <option value="MCQ">MCQ</option>
                    <option value="OneLine">One Line</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>

              {(questionType === "MCQ" || questionType === "Both") && (
                <div className="AddQuestion-form-C1">
                  <div className="AddQuestion-form-Option">
                    <div className="AddQuestion-form-group2">
                      <label>Option A</label>
                      <input
                        type="text"
                        className="Addquestion-form-group2-input"
                        value={currentQuestion.options.A}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: {
                              ...currentQuestion.options,
                              A: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="AddQuestion-form-group2">
                      <label>Option B</label>
                      <input
                        type="text"
                        className="Addquestion-form-group2-input"
                        value={currentQuestion.options.B}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: {
                              ...currentQuestion.options,
                              B: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="AddQuestion-form-group2">
                      <label>Option C</label>
                      <input
                        type="text"
                        className="Addquestion-form-group2-input"
                        value={currentQuestion.options.C}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: {
                              ...currentQuestion.options,
                              C: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="AddQuestion-form-group2">
                      <label>Option D</label>

                      <input
                        type="text"
                        className="Addquestion-form-group2-input"
                        value={currentQuestion.options.D}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: {
                              ...currentQuestion.options,
                              D: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="Addquestion-form-group">
                    <label>Select Correct Answer</label>
                    <select
                      className="Addquestion-form-group1-input"
                      value={currentQuestion.correctAnswer}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          correctAnswer: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Correct Answer</option>
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                </div>
              )}
              <button
                className="add-paper-btn"
                type="button"
                onClick={handleAddQuestion}
              >
                Add Question
              </button>
              <button
                className="save-edit-btn"
                type="button"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherCPaper;
