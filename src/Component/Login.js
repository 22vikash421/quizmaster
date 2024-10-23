import React, { useEffect, useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import logo from "../Image/logo.png";
import { db } from "./firebase"; // Import Firebase database instance
import { ref, set, get, update, child } from "firebase/database"; // Import Firebase database functions
import Cookies from "js-cookie"; // Import js-cookie

function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  // Add default admin user if not present in Firebase Realtime Database
  useEffect(() => {
    const dbRef = ref(db);
    get(child(dbRef, "users/Admin")).then((snapshot) => {
      if (!snapshot.exists()) {
        // If Admin user does not exist, create it
        set(ref(db, "users/Admin"), {
          name: "Administration",
          id: "Admin",
          email: "admin@gmail.com",
          password: "Admin@123",
          role: "Admin",
        });
      }
    });
  }, []);

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dbRef = ref(db);
  
    if (isSignUp) {
      // Temporary closure of the sign-up functionality
      alert("Sign-up is temporarily disabled. Please try again later.");
      return;
  
      // Uncomment the following code when sign-up is enabled again.
      /*
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
  
      // Check if user already exists in Firebase
      const snapshot = await get(child(dbRef, `users`));
      const users = snapshot.val() || {};
      const userExists = Object.values(users).some((user) => user.email === email);
  
      if (userExists) {
        alert("User already exists. Please login.");
        return;
      }
  
      // Save new user to Firebase
      const newUser = {
        email,
        password,
        role: "Student", // Default role for new users
        faculties: "",
        subject: "",
        semester: "",
      };
      const userId = email.replace(/[^a-zA-Z0-9]/g, ""); // Define userId here
      await set(ref(db, `users/${userId}`), newUser);
      alert("Sign up successful. Please login.");
      toggleForm();
      */
    } else {
      // Fetch user from Firebase on login
      const snapshot = await get(child(dbRef, `users`));
      const users = snapshot.val() || {};
  
      // Find the user based on email and password
      const user = Object.values(users).find(
        (user) => user.email === email && user.password === password
      );
  
      if (user) {
        const loginTime = new Date().toISOString();
        const userId = user.id; // Get userId from the user object
  
        // Create logged-in user details
        const loggedInUser = {
          name: user.name || "Unknown",
          id: userId, // Use userId defined earlier
          email: user.email || "",
          faculties: user.faculties || "",
          subject: user.subject || "",
          semester: user.semester || "",
          role: user.role || "",
          loginTime,
        };
  
        // Save the logged-in user details to Firebase under a unique key
        await set(ref(db, `loggedInUsers/${userId}`), loggedInUser);
  
        // Update login time in Firebase
        await update(ref(db, `users/${userId}`), { loginTime });
  
        // Set user session in cookies
        Cookies.set('loggedInUserId', userId, { expires: 1 }); // Store userId in cookie for 1 day
        Cookies.set('role', user.role, { expires: 1 }); // Store user role in cookie for 1 day
  
        // Redirect based on user role
        if (user.role === "Admin") {
          navigate("/AdminDashboard/");
        } else if (user.role === "Student") {
          navigate("/StudentDashboard/");
        } else if (user.role === "Teacher") {
          navigate("/TeacherDashboard/");
        }
      } else {
        alert("Invalid login credentials");
      }
    }
  };
  


  return (
    <div className={`LoginPage ${isSignUp ? "sign-up-mode" : ""}`}>
      <div className="LoginContainer">
        <div className="Login-co1">
          <h3>{isSignUp ? "Create an Account" : "Login to Your Account"}</h3>
          <p>
            {isSignUp
              ? "Please enter your details to sign up"
              : "Please enter your details to login"}
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
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
                required
              />
            </div>
            {isSignUp && (
              <div className="form-div">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <button type="submit">{isSignUp ? "Sign Up" : "Login"}</button>
          </form>
        </div>
        <div className="login-co2">
          <img src={logo} alt="logo" className="loginLogo"></img>
          <h1>{isSignUp ? "Welcome back!" : "Hello Friend!"}</h1>
          <p>
            {isSignUp
              ? "Enter your personal details to access the site"
              : "Register with your personal details to access the site."}
          </p>
          <button onClick={toggleForm}>{isSignUp ? "Login" : "Sign up"}</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
