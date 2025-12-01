import { useState } from "react";
import { authStore } from "../store/authStore";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = authStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen w-full bg-[#050509] text-white flex items-center justify-center px-6">

      {/* Center box */}
      <div className="relative bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_35px_rgba(147,51,234,0.45)] rounded-2xl p-10 w-full max-w-md">

        {/* background glowing lights */}
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-purple-700/30 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-indigo-500/30 blur-3xl rounded-full"></div>

        {/* content */}
        <div className="relative z-10">

          {/* Title + tagline */}
          <h2 className="text-4xl font-bold text-center mb-2">Welcome Back</h2>
          <p className="text-center text-gray-300 mb-8 text-sm">
            Login to continue your conversations on <span className="text-purple-400">Connectly</span>
          </p>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 mb-1 text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1 text-sm">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Purple button (small but premium) */}
            <button
              type="submit"
              className="w-full py-2 font-semibold rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-600 shadow-[0_0_18px_rgba(168,85,247,0.6)] transition-all"
            >
              Login
            </button>
          </form>

          {/* Features under box — NOT same as landing */}
          <ul className="mt-6 text-gray-400 text-xs space-y-1 text-center">
            <li>💬 Fast messaging · 🔐 Secure login · ⚡ 24/7 available</li>
          </ul>

          {/* Signup link */}
          <p className="mt-6 text-center text-gray-300 text-sm">
            Don't have an account?{" "}
            <a href="/signup" className="text-purple-400 hover:underline font-semibold">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
