import { useState } from "react";
import toast from "react-hot-toast";
import { authStore } from "../store/authStore";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

const SignUpPage = () => {
  const { signup } = authStore();
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

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

      <div className="relative flex flex-col lg:flex-row w-full max-w-4xl
        bg-white/5 backdrop-blur-lg border border-white/10 
        shadow-[0_0_35px_rgba(147,51,234,0.20)] rounded-2xl overflow-hidden">

        {/* Corner glow */}
        <div className="absolute -top-14 -left-14 w-40 h-40 bg-purple-700/30 blur-2xl rounded-full"></div>
        <div className="absolute -bottom-14 -right-14 w-40 h-40 bg-indigo-600/30 blur-2xl rounded-full"></div>

        {/* Illustration */}
        <div className="hidden lg:flex items-center justify-center w-1/2 p-8">
          <img
            src="/public/Signup.png"
            alt="Signup"
            className="rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.35)]"
          />
        </div>

        {/* Form */}
        <div className="w-full lg:w-1/2 p-10 relative z-10">
          <h2 className="text-4xl font-bold text-center mb-2">Create Account</h2>
          <p className="text-center text-gray-300 mb-8 text-sm">
            Join <span className="text-purple-400 font-semibold">Connectly</span> now 🚀
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block mb-1 text-gray-300 text-sm">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-400
                text-white placeholder-gray-400 focus:border-purple-400 outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-gray-300 text-sm">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                autoComplete="email"
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-400
                text-white placeholder-gray-400 focus:border-purple-400 outline-none"
              />
            </div>

            {/* Password + Eye toggle */}
            {/* Password + Eye toggle */}
<div>
  <label className="block mb-1 text-gray-300 text-sm">Password</label>

  <div className="relative">
    <input
      type={showPwd ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Create password"
      autoComplete="new-password"
      required
      className="w-full px-4 py-2 pr-12 rounded-lg bg-white/10 border border-gray-400
      text-white placeholder-gray-400 focus:border-purple-400 outline-none"
    />

    <button
      type="button"
      onClick={() => setShowPwd(!showPwd)}
      className="absolute inset-y-0 right-3 flex items-center cursor-pointer 
      text-purple-300 hover:text-purple-200 transition"
    >
      {showPwd ? <FiEyeOff size={20} /> : <FiEye size={20} />}
    </button>
  </div>
</div>


            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2 font-semibold text-white rounded-full
              bg-gradient-to-r from-purple-600 to-indigo-500
              hover:from-purple-700 hover:to-indigo-600
              shadow-[0_0_18px_rgba(168,85,247,0.6)] transition-all"
            >
              Sign Up
            </button>
          </form>

          {/* Bottom text */}
          <p className="mt-6 text-center text-gray-400 text-xs">
            💬 Fast messaging · 🔐 Secure Signup · ⚡ Always available
          </p>

          <p className="mt-6 text-center text-gray-300 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
