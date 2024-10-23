import React, { useEffect, useState } from "react";
import "./AdminUser.css";
import { db } from "../firebase"; // Import Firebase database instance
import { ref, set, get, update, remove } from "firebase/database"; // Import Firebase database functions

function AdminUser() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    id: "",
    email: "",
    password: "",
    subject: "",
    faculties: "",
    role: "Teacher", // Default role
  });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await get(ref(db, "users"));
      const usersData = snapshot.val() || {};
      setUsers(Object.values(usersData));
    };
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
  
    if (newUser.name && newUser.id && newUser.email && newUser.password && newUser.subject && newUser.faculties) {
      const userId = newUser.id;  // Use Teacher ID as Firebase key
  
      if (editIndex !== null) {
        // Update the existing user
        await update(ref(db, `users/${userId}`), newUser);  // Update in Firebase
        const updatedUsers = [...users];
        updatedUsers[editIndex] = newUser;  // Update locally
        setUsers(updatedUsers);
        setEditIndex(null);  // Reset edit state
      } else {
        // Add new user
        await set(ref(db, `users/${userId}`), newUser);  // Add to Firebase
        setUsers([...users, newUser]);  // Add locally
      }
  
      // Reset form and close modal
      setNewUser({
        name: "",
        id: "",
        email: "",
        password: "",
        subject: "",
        faculties: "",
        role: "Teacher",
      });
      setShowModal(false);
    }
  };
  

  const handleEdit = (index) => {
    setNewUser(users[index]);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    const userId = users[index].id; // Get Teacher ID
    await remove(ref(db, `users/${userId}`)); // Remove from Firebase
    const updatedUsers = users.filter((_, i) => i !== index);
    setUsers(updatedUsers);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.role === "Teacher" &&
      (
        (user.name && user.name.toLowerCase().includes(search.toLowerCase())) ||
        (user.id && user.id.toLowerCase().includes(search.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase())) ||
        (user.faculties && user.faculties.toLowerCase().includes(search.toLowerCase())) ||
        (user.subject && user.subject.toLowerCase().includes(search.toLowerCase()))
      )
  );

  return (
    <div className="AdminUser">
      <div className="user-table-container">
        <div className="Admin-dash-nav">
          <h3>Teachers list</h3>
          <ol>
            <li>
              <a href="/AdminDashboard/">Dashboard</a>
            </li>
            <li>Teacher List</li>
          </ol>
        </div>
        <div className="user-search">
          <input
            type="text"
            placeholder="Search Teachers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="Adminuser-add-btn"
            onClick={() => {
              setNewUser({
                name: "",
                id: "",
                email: "",
                password: "",
                subject: "",
                faculties: "",
                role: "Teacher",
              });
              setShowModal(true);
            }}
          >
            Add Teacher
          </button>
        </div>

        {/* Users Table */}
        <div className="user-table">
          <table>
            <thead>
              <tr>
                <th>Teacher Name</th>
                <th>Teacher ID</th>
                <th>Email</th>
                <th>Subject</th>
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
                    <td>{user.subject}</td>
                    <td>{user.faculties}</td>
                    <td>{user.role}</td>
                    <td>
                      <button onClick={() => handleEdit(index)}>Edit</button>
                      <button onClick={() => handleDelete(index)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No teachers found</td>
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
            <h2>{editIndex !== null ? "Edit Teacher" : "Add Teacher"}</h2>
            <form onSubmit={handleAddUser}>
              <input
                className="modal-input"
                type="text"
                placeholder="Teacher Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
              <input
                className="modal-input"
                type="text"
                placeholder="Teacher ID"
                value={newUser.id}
                onChange={(e) => setNewUser({ ...newUser, id: e.target.value })}
                required
              />
              <input
                className="modal-input"
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              <input
                className="modal-input"
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
              <input
                className="modal-input"
                type="text"
                placeholder="Subject"
                value={newUser.subject}
                onChange={(e) => setNewUser({ ...newUser, subject: e.target.value })}
                required
              />
              <select
                className="modal-input"
                value={newUser.faculties}
                onChange={(e) => setNewUser({ ...newUser, faculties: e.target.value })}
                required
              >
                <option value="" disabled>Select Faculties</option>
                <option value="Computing Skills">Computing Skills</option>
                <option value="Electrical Skills">Electrical Skills</option>
                <option value="Manufacturing Skills">Manufacturing Skills</option>
                <option value="Automotive Skills">Automotive Skills</option>
                <option value="RAC Skills">RAC Skills</option>
                <option value="Healthcare Skills">Healthcare Skills</option>
              </select>
              <button type="submit" className="modal-sub-btn">
                {editIndex !== null ? "Update Teacher" : "Add Teacher"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUser;
