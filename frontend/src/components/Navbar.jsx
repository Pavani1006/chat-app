import { Link } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import { FaSignOutAlt } from "react-icons/fa";
import { authStore } from "../store/authStore";

const Navbar = () => {
  const { logout, loggedUser } = authStore();

  return (
    <nav className="bg-gradient-to-r from-blue-950 to-purple-950 px-5 py-2 flex items-center justify-between shadow-lg lg:px-6">
      
      {/* LOGO (updated premium version) */}
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 group" title="Messages">
          <div className="bg-[#13131a] p-2 rounded-lg shadow-[0_0_20px_rgba(147,51,234,0.45)]">
            <FiMessageSquare className="text-2xl text-purple-400 drop-shadow-[0_0_8px_rgba(147,51,234,0.9)] group-hover:scale-110 transition-transform duration-200" />
          </div>
          <span className="text-lg font-bold text-purple-400 tracking-wide drop-shadow-md hidden sm:block">
            Connectly
          </span>
        </Link>
      </div>

      {/* RIGHT — only if logged in */}
      {loggedUser && (
        <div className="flex items-center gap-8">
          <Link
            to="/profile"
            className="flex items-center text-white hover:text-blue-200 transition text-xl"
            title="Profile"
          >
            <img
              src={
                loggedUser.profilepic &&
                loggedUser.profilepic.trim() !== ""
                  ? loggedUser.profilepic
                  : "/avatar.avif"
              }
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-xs ml-2">Profile</span>
          </Link>

          <button
            className="flex items-center text-white hover:text-red-300 transition text-xl"
            title="Logout"
            onClick={logout}
          >
            <FaSignOutAlt />
            <span className="text-xs ml-2">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
