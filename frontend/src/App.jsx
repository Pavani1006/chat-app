import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./Pages/HomePage";
import SignUpPage from "./Pages/SignUpPage";
import LoginPage from "./Pages/LoginPage";
import ProfilePage from "./Pages/ProfilePage";
import LandingPage from "./Pages/LandingPage";

import { Toaster } from "react-hot-toast";
import { authStore } from "./store/authStore";

function App() {
  const { loggedUser } = authStore();

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      {/* Navbar */}
      <div className="flex-none">
        <Navbar />
      </div>

      {/* Main content (scroll allowed) */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">

        <Routes>
          {/* Landing page always first */}
          <Route path="/" element={<LandingPage />} />

          {/* Home only when logged in */}
          <Route
            path="/home"
            element={loggedUser ? <HomePage /> : <Navigate to="/login" />}
          />

          {/* Auth routes */}
          <Route
            path="/signup"
            element={!loggedUser ? <SignUpPage /> : <Navigate to="/home" />}
          />
          <Route
            path="/login"
            element={!loggedUser ? <LoginPage /> : <Navigate to="/home" />}
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={loggedUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>

      {/* Toasts */}
      <Toaster toastOptions={{ duration: 1100 }} />
    </div>
  );
}

export default App;
