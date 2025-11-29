import { FiMessageSquare, FiShield, FiZap, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
// import img1

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full bg-[#050509] text-white flex flex-col scrollbar-hide">

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-12 lg:px-20 py-10 relative overflow-hidden">
        {/* glow blobs */}
        <div className="absolute w-[450px] h-[450px] bg-purple-700 opacity-20 blur-[200px] rounded-full -top-40 -left-40" />
        <div className="absolute w-[380px] h-[380px] bg-blue-600 opacity-20 blur-[200px] rounded-full bottom-0 right-0" />

        <div className="relative z-10 grid gap-12 lg:grid-cols-2 items-center max-w-6xl w-full">
          {/* LEFT: logo + text */}
          <section>
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm mb-5">
              <FiMessageSquare className="text-purple-400" />
              <span className="text-gray-200">
                Real-time chat. Zero friction.
              </span>
            </div>

            {/* Logo */}
            <div className="bg-[#13131a] inline-flex p-5 rounded-3xl shadow-[0_0_35px_rgba(147,51,234,0.5)]">
              <FiMessageSquare className="text-[70px] text-purple-400 drop-shadow-[0_0_18px_rgba(147,51,234,0.9)]" />
            </div>

            <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-wide leading-tight">
              Chat smarter with{" "}
              <span className="text-purple-400">Connectly</span>
            </h1>

            <p className="mt-4 text-gray-300 text-base md:text-lg max-w-xl">
              Stay in touch with your friends, teams, and communities — all in
              one fast, minimal chat experience designed for real conversations.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="relative px-8 py-3 text-base font-semibold rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(147,51,234,0.6)] hover:scale-[1.05] active:scale-[0.97] transition-transform duration-200"
              >
                <span className="relative z-10">Get Started</span>
                <span className="absolute inset-0 rounded-full bg-white opacity-[0.05] blur-[6px]" />
              </Link>

              <Link
                to="/signup"
                className="text-sm md:text-base text-gray-300 hover:text-white underline underline-offset-4"
              >
                New here? Create an account
              </Link>
            </div>

            {/* Small badges */}
            <div className="mt-6 flex flex-wrap gap-6 text-xs md:text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <FiShield className="text-green-400" /> End-to-end style
                security
              </span>
              <span className="flex items-center gap-2">
                <FiZap className="text-yellow-300" /> Fast real-time messaging
              </span>
              <span className="flex items-center gap-2">
                <FiUsers className="text-blue-300" /> Built for your circle
              </span>
            </div>
          </section>

          {/* RIGHT: illustration */}
          <section className="flex justify-center lg:justify-end">
            <div className="relative w-[260px] sm:w-[320px] md:w-[380px] lg:w-[420px]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-purple-500/30 via-transparent to-blue-500/30 blur-3xl" />
              <div className="relative rounded-3xl bg-[#11111a] border border-white/10 p-4 shadow-[0_0_30px_rgba(0,0,0,0.7)]">
                <img
                  src="/public/img1.jpg"
                  alt="People chatting illustration"
                  className="w-full h-full object-contain rounded-2xl"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Features section */}
        <section className="relative z-10 mt-16 max-w-5xl w-full">
          <h2 className="text-xl md:text-2xl font-semibold mb-5">
            Why Connectly?
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiZap className="text-yellow-300 text-xl" />
                <h3 className="font-semibold text-sm md:text-base">
                  Blazing fast
                </h3>
              </div>
              <p className="text-xs md:text-sm text-gray-300">
                Built with real-time tech so your messages appear instantly —
                no refresh, no lag.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiShield className="text-green-400 text-xl" />
                <h3 className="font-semibold text-sm md:text-base">
                  Private by design
                </h3>
              </div>
              <p className="text-xs md:text-sm text-gray-300">
                Your chats stay yours. Secure auth and protected APIs behind the
                scenes.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiUsers className="text-blue-300 text-xl" />
                <h3 className="font-semibold text-sm md:text-base">
                  Made for your people
                </h3>
              </div>
              <p className="text-xs md:text-sm text-gray-300">
                One place for friends, teammates, or small communities to stay
                connected.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-500 border-t border-white/5">
        © {new Date().getFullYear()} Connectly. Built with ❤️ by you.
      </footer>
    </div>
  );
};

export default LandingPage;
