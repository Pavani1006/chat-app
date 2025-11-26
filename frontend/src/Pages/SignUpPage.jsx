import { useState } from "react";
import toast from "react-hot-toast";
import { authStore } from "../store/authStore";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup } = authStore();

  const validateCredentials = () => {
    if (!username.trim()) return toast.error("Full name is required");
    if (!email.trim()) return toast.error("Email is required");
    // if (!/^[^\s@]+@[a-zA-Z0-9-]{3,}\.[a-zA-Z]{2,}$/.test(email)) return toast.error("Invalid email format");
    if (!password) return toast.error("Password is required");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateCredentials()) return signup({ username, email, password });
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="rounded-2xl shadow-2xl p-8 w-full max-w-md bg-gradient-to-r from-gray-500 to-gray-800 relative overflow-hidden">
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-blue-400 opacity-20 rounded-full z-0 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-400 opacity-20 rounded-full z-0 animate-pulse"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-center text-white mb-6 drop-shadow-lg">
            Sign Up
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-200 mb-1" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full px-4 py-2 border border-gray-400 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-gray-200 mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-2 border border-gray-400 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-gray-200 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2 border border-gray-400 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-purple-600 transition transform hover:scale-105"
            >
              Sign Up
            </button>
          </form>
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-400 opacity-30"></div>
            <span className="mx-2 text-gray-300 text-xs">or</span>
            <div className="flex-grow h-px bg-gray-400 opacity-30"></div>
          </div>
          <p className="mt-6 text-center text-gray-300">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-400 font-semibold hover:underline"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
