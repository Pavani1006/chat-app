import { Link } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import { FaSignOutAlt } from "react-icons/fa";
import { authStore } from "../store/authStore";

const Navbar = () => {
  const { logout, loggedUser } = authStore();
  return (
    <nav className="bg-gradient-to-r from-blue-950 to-purple-950 px-5 py-1 flex items-center justify-between shadow-lg lg:px-6">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="text-white text-2xl hover:text-blue-200 transition flex shadow-md"
          title="Messages"
        >
          <span className="p-2 font-bold">
            <FiMessageSquare className="text-4xl text-purple-600 animate-pulse bg-blue-900 p-2 rounded-lg" />
          </span>
          <span className="text-2xl py-2 font-bold text-purple-500 tracking-wide drop-shadow-lg select-none">
            ChatApp
          </span>
        </Link>
      </div>
      {loggedUser && (
        <div className="flex items-center gap-8">
          <Link
            to="/profile"
            className="flex flex-row items-center text-white hover:text-blue-200 transition text-xl"
            title="Profile"
          >
            <img
              src={loggedUser.profilepic}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-xs ml-2">Profile</span>
          </Link>
          <button
            className="flex flex-row items-center text-white hover:text-red-300 transition text-xl"
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
