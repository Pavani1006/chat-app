import { useState } from "react";
import toast from "react-hot-toast";
import { authStore } from "../store/authStore";
import { Link } from "react-router-dom";

const SignUpPage = () => {
  const { signup } = authStore();
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");

  const validate = () => {
    if (!username.trim()) return toast.error("Username required");
    if (!email.trim()) return toast.error("Email required");
    if (!password.trim()) return toast.error("Password required");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) signup({ username, email, password });
  };

  return (
    <div className="min-h-screen w-full bg-[#050509] text-white flex items-center justify-center px-6">

      {/* BIG COMBINED BOX */}
      <div className="relative flex flex-col lg:flex-row w-full max-w-4xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-[0_0_35px_rgba(147,51,234,0.45)] rounded-2xl overflow-hidden">

        {/* GLOWING BACKGROUND */}
        <div className="absolute -top-28 -left-28 w-72 h-72 bg-purple-700/25 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-28 -right-28 w-72 h-72 bg-indigo-600/25 blur-3xl rounded-full"></div>

        {/* LEFT IMAGE */}
        <div className="relative hidden lg:flex items-center justify-center w-1/2 p-8">
          <img
            src="/public/img1.jpg"
            alt="Signup Illustration"
            className="rounded-2xl shadow-[0_0_25px_rgba(147,51,234,0.45)]"
          />
        </div>

        {/* RIGHT FORM BOX */}
        <div className="relative z-10 w-full lg:w-1/2 p-10">
          <h2 className="text-4xl font-bold text-center mb-2">Create Account</h2>
          <p className="text-center text-gray-300 mb-8 text-sm">
            Join <span className="text-purple-400 font-semibold">Connectly</span> and chat instantly 🚀
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-gray-300 text-sm">Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-300 text-sm">Email Address</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-300 text-sm">Password</label>
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition"
              />
            </div>

            {/* SIGNUP BUTTON */}
            <button
              type="submit"
              className="w-full py-2 font-semibold text-white rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 shadow-[0_0_18px_rgba(168,85,247,0.6)] transition-all duration-300"
            >
              Sign Up
            </button>
          </form>

          {/* SAME BOTTOM LINE AS LOGIN */}
          <p className="mt-6 text-center text-gray-400 text-xs">
            💬 Fast messaging · 🔐 Secure Registration · ⚡ 24/7 available
          </p>

          <p className="mt-6 text-center text-gray-300 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 hover:underline font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
