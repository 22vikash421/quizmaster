import React, { useEffect, useState } from "react";
import "./TeacherUser.css";
import { db } from "../firebase";
import { ref, set, onValue, remove, update } from "firebase/database";

function TeacherUser() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    id: "",
    email: "",
    password: "",
    semester: "",
    faculties: "",
    role: "Student",
  });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    // Fetch users from Firebase when component loads
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsers(Object.values(data)); // Convert data object to array
      }
    });
  }, []);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (
      newUser.name &&
      newUser.id &&
      newUser.email &&
      newUser.password &&
      newUser.semester &&
      newUser.faculties
    ) {
      const userId = newUser.id;

      // If editing an existing user, update the user in Firebase
      if (editIndex !== null) {
        const updates = {};
        updates[`/users/${userId}`] = newUser;
        update(ref(db), updates);
        setEditIndex(null);
      } else {
        // Add a new user to Firebase
        set(ref(db, `users/${userId}`), newUser);
      }

      // Reset form fields and close modal
      setNewUser({
        name: "",
        id: "",
        email: "",
        password: "",
        semester: "",
        faculties: "",
        role: "Student",
      });
      setShowModal(false);
    }
  };

  const handleEdit = (index) => {
    setNewUser(users[index]);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleDelete = (userId) => {
    // Delete the user from Firebase
    remove(ref(db, `users/${userId}`));
  };

  const filteredUsers = users.filter(
    (user) =>
      user.role === "Student" &&
      ((user.name &&
        user.name.toLowerCase().includes(search.toLowerCase())) ||
        (user.id && user.id.toLowerCase().includes(search.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase())) ||
        (user.semester &&
          user.semester.toLowerCase().includes(search.toLowerCase())) ||
        (user.faculties &&
          user.faculties.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="TeacherUser">
      <div className="user-table-container">
        <div className="Teacher-dash-nav">
          <h3>Students List</h3>
          <ol>
            <li>
              <a href="/TeacherDashboard/">Dashboard</a>
            </li>
            <li>Students List</li>
          </ol>
        </div>
        <div className="user-search">
          <input
            type="text"
            placeholder="Search Student"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="Teacheruser-add-btn"
            onClick={() => setShowModal(true)}
          >
            Add Student
          </button>
        </div>

        {/* Users Table */}
        <div className="user-table">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Email</th>
                <th>Semester</th>
                <th>Faculties</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={index}>
                    <td>{user.name}</td>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>{user.semester}</td>
                    <td>{user.faculties}</td>
                    <td>{user.role}</td>
                    <td>
                      <button onClick={() => handleEdit(index)}>Edit</button>
                      <button onClick={() => handleDelete(user.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No Student found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <h2>{editIndex !== null ? "Edit Student" : "Add Student"}</h2>
            <form onSubmit={handleAddUser}>
              <input
                className="modal-input"
                type="text"
                placeholder="Student Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                required
              />
              <input
                className="modal-input"
                type="text"
                placeholder="Student ID"
                value={newUser.id}
                onChange={(e) =>
                  setNewUser({ ...newUser, id: e.target.value })
                }
                required
              />
              <input
                className="modal-input"
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                required
              />
              <input
                className="modal-input"
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                required
              />
              <select
                className="modal-input"
                id="semester"
                value={newUser.semester}
                onChange={(e) =>
                  setNewUser({ ...newUser, semester: e.target.value })
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
              <select
                className="modal-input"
                value={newUser.faculties}
                onChange={(e) =>
                  setNewUser({ ...newUser, faculties: e.target.value })
                }
                required
              >
                <option value="" disabled>
                  Select Faculties
                </option>
                <option value="Computing Skills">Computing Skills</option>
                <option value="Electrical Skills">Electrical Skills</option>
                <option value="Manufacturing Skills">Manufacturing Skills</option>
                <option value="Automotive Skills">Automotive Skills</option>
                <option value="RAC Skills">RAC Skills</option>
                <option value="Healthcare Skills">Healthcare Skills</option>
              </select>
              <button type="submit" className="modal-sub-btn">
                {editIndex !== null ? "Edit Student" : "Add Student"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherUser;
