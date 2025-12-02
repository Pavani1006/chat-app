import { useState } from "react";
import { authStore } from "../store/authStore";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const { login } = authStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen w-full bg-[#050509] text-white flex items-center justify-center px-6">

      <div className="relative flex flex-col lg:flex-row w-full max-w-4xl
        bg-white/5 backdrop-blur-lg border border-white/10 
        shadow-[0_0_35px_rgba(147,51,234,0.18)] rounded-2xl overflow-hidden">

        {/* corner lights */}
        <div className="absolute -top-14 -left-14 w-40 h-40 bg-purple-700/25 blur-2xl rounded-full"></div>
        <div className="absolute -bottom-14 -right-14 w-40 h-40 bg-indigo-600/25 blur-2xl rounded-full"></div>

        {/* illustration */}
        <div className="hidden lg:flex items-center justify-center w-1/2 p-8">
          <img
            src="/public/Login.png"
            alt="Login Illustration"
            className="rounded-xl shadow-[0_0_18px_rgba(147,51,234,0.35)]"
          />
        </div>

        {/* form */}
        <div className="relative w-full lg:w-1/2 p-10">
          <h2 className="text-4xl font-bold text-center mb-2">Welcome Back</h2>
          <p className="text-center text-gray-300 mb-8 text-sm">
            Login to <span className="text-purple-400 font-semibold">Connectly</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-gray-300 mb-1 text-sm">Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-400 
                text-white placeholder-gray-400 
                focus:border-purple-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1 text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-2 pr-11 rounded-lg bg-white/10 border border-gray-400 
                  text-white placeholder-gray-400 
                  focus:border-purple-400 outline-none"
                />
                <span
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-purple-300 hover:text-purple-200"
                >
                  {showPwd ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 font-semibold text-white rounded-full 
              bg-gradient-to-r from-purple-600 to-indigo-500
              border border-purple-300/40 hover:border-purple-300
              shadow-[0_0_18px_rgba(168,85,247,0.5)]
              hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] transition-all"
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400 text-xs">
            💬 Fast messaging · 🔐 Secure Login · ⚡ Always available
          </p>

          <p className="mt-6 text-center text-gray-300 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-400 hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
