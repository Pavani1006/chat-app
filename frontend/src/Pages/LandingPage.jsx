import { FiShield, FiZap, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full bg-[#050509] text-white flex flex-col">

      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 py-12 relative overflow-hidden">
        
        {/* soft background lights */}
        <div className="absolute w-[500px] h-[500px] bg-purple-700 opacity-20 blur-[220px] rounded-full -top-56 -left-36 pointer-events-none" />
        <div className="absolute w-[420px] h-[420px] bg-blue-600 opacity-20 blur-[220px] rounded-full bottom-0 right-0 pointer-events-none" />

        <div className="relative z-10 grid gap-14 lg:grid-cols-2 items-center max-w-6xl w-full">
          
          {/* LEFT CONTENT */}
          <section>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Stay connected with{" "}
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-md">
                Connectly
              </span>
            </h1>

            <p className="mt-5 text-gray-300 text-base md:text-lg max-w-xl leading-relaxed">
              A modern chat platform designed to make conversations effortless —
              fast, secure, and built for the people who matter the most.
            </p>

            {/* CTA buttons */}
            <div className="mt-9 flex flex-wrap items-center gap-4">

              {/* ⭐ Better looking Get Started button ONLY change */}
              <Link
  to="/login"
  className="px-8 py-3 text-base font-semibold rounded-full border border-purple-500 text-purple-300 hover:bg-purple-600/20 hover:border-purple-400 hover:text-white shadow-[0_0_10px_rgba(168,85,247,0.4)] hover:shadow-[0_0_16px_rgba(168,85,247,0.7)] transition-all duration-300"
>
  Get Started
</Link>



              <Link
                to="/signup"
                className="text-sm md:text-base text-gray-300 hover:text-white underline underline-offset-4"
              >
                New here? Create an account
              </Link>
            </div>
          </section>

          {/* RIGHT IMAGE */}
          <section className="flex justify-center lg:justify-end">
            <div className="relative w-[260px] sm:w-[330px] md:w-[400px] lg:w-[440px]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-purple-600/30 via-transparent to-indigo-500/30 blur-2xl pointer-events-none" />
              <div className="relative rounded-3xl bg-[#11111a] border border-white/10 p-4 shadow-[0_0_28px_rgba(0,0,0,0.6)]">
                <img
                  src="/public/img1.jpg"
                  alt="Chat illustration"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </section>
        </div>

        {/* FEATURES */}
       {/* FEATURES - align with Get Started */}
<section className="relative z-10 mt-12 max-w-6xl w-full px-2 sm:px-0 lg:pl-1">

          <h2 className="text-xl md:text-2xl font-semibold mb-7 text-center lg:text-left">
            What makes Connectly special?
          </h2>

          <div className="grid gap-7 md:grid-cols-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition">
              <div className="flex items-center gap-3 mb-3">
                <FiZap className="text-yellow-300 text-xl" />
                <h3 className="font-semibold text-base">Instant Messaging</h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Messages appear the moment you hit send. No refresh, no delay.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition">
              <div className="flex items-center gap-3 mb-3">
                <FiShield className="text-green-400 text-xl" />
                <h3 className="font-semibold text-base">Protected login system</h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Passwords are securely encrypted and user accounts are protected with authentication.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition">
              <div className="flex items-center gap-3 mb-3">
                <FiUsers className="text-blue-300 text-xl" />
                <h3 className="font-semibold text-base">Built for your circle</h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Designed for friends, teammates and small communities to stay close.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-4 text-center text-xs text-gray-500 border-t border-white/5">
        © {new Date().getFullYear()} Connectly — 💬 Talk • 😄 Laugh • 🤝 Share • 🔁 Repeat
      </footer>

    </div>
  );
};

export default LandingPage;
