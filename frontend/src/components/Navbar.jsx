import { Link } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import { FaSignOutAlt } from "react-icons/fa";
import { authStore } from "../store/authStore";

const Navbar = () => {
  const { logout, loggedUser } = authStore();

  return (
    <nav className="bg-gradient-to-r from-blue-950 to-purple-950 px-5 py-2 flex items-center justify-between shadow-lg lg:px-6">

      {/* LOGO */}
      <Link to="/" className="flex items-center gap-2" title="Home">
        <FiMessageSquare className="text-3xl text-purple-300" />
        <span className="text-lg font-semibold text-purple-300 hidden sm:block">Connectly</span>
      </Link>

      {/* PROFILE + LOGOUT */}
      {loggedUser && (
        <div className="flex items-center gap-4">

          {/* profile pic */}
          <Link to="/profile" title="Profile">
            <img
              src={
                loggedUser.profilepic && loggedUser.profilepic.trim() !== ""
                  ? loggedUser.profilepic
                  : "/avatar.avif"
              }
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
            />
          </Link>

          {/* logout icon */}
          <button
            onClick={logout}
            title="Logout"
            className="text-white text-2xl hover:text-purple-300 transition"
          >
            <FaSignOutAlt />
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
