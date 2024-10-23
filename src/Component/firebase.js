import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; 
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOiydYy1R3va-5Bw7WG7kbeFJrX4oOVQA",
  authDomain: "online-exam-dashboard-1417f.firebaseapp.com",
  databaseURL: "https://online-exam-dashboard-1417f-default-rtdb.firebaseio.com",
  projectId: "online-exam-dashboard-1417f",
  storageBucket: "online-exam-dashboard-1417f.appspot.com",
  messagingSenderId: "321538145599",
  appId: "1:321538145599:web:f404468be344048d3d678a",
  measurementId: "G-1K66136Y6V"
};

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };
