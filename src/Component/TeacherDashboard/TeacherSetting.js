import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Import Firebase instance
import { ref, get, update } from "firebase/database"; // Import Firebase functions
import Cookies from "js-cookie";// For cookie management
import "./TeacherSetting.css";

function TeacherSetting() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");


    useEffect(() => {
        // Check if user is logged in through cookies
        const loggedInUserId = Cookies.get("loggedInUserId");

        if (loggedInUserId) {
            // Fetch the current admin details from Firebase
            const userRef = ref(db, `users/${loggedInUserId}`);

            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setEmail(userData.email);
                    setName(userData.name || "Teacher");
                    setRole(userData.role);
                } else {
                    console.log("No user data available");
                }
            });
        } else {
            // Redirect to login if not logged in
            window.location.href = "/"; // Navigate to login if no cookie found
        }
    }, []);

    const handleSaveChanges = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }


        const loggedInUserId = Cookies.get("loggedInUserId");  // Get logged-in user's ID from cookies

        if (loggedInUserId) {
            // Prepare updated user data
            const updatedUser = {
                email,
                name,
                role, // Keep the role unchanged
            };

            // If the user entered a new password, include it in the update
            if (password) {
                updatedUser.password = password;
            }

            // Update the user details in Firebase
            const userRef = ref(db, `users/${loggedInUserId}`);
            update(userRef, updatedUser)
                .then(() => {
                    alert("Profile updated successfully!");
                })
                .catch((error) => {
                    console.error("Error updating profile:", error);
                });
        }
    };

    return (
        <div className="TeacherSetting">
            <div className="TeacherSetting-c1">
                <div className="Teacher-dash-nav">
                    <h3>Profile Settings</h3>
                    <ol>
                        <li>
                            <a href="/TeacherDashboard/">Dashboard</a>
                        </li>
                        <li>Profile</li>
                    </ol>
                </div>
                <div className="Teacher-Profile_form">
                    <h2>Teacher Profile Settings</h2>
                    <form className="ProfileForm" onSubmit={handleSaveChanges}>
                        <div className="form-div">
                            <label>Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-div">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-div">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-div">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-div">
                            <label>Role</label>
                            <input type="text" value={role} disabled />
                        </div>

                        <button type="submit">Save Changes</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default TeacherSetting;
