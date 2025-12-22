import { useState } from "react";
import { authStore } from "../store/authStore";
import imageCompression from "browser-image-compression";
import { RxCross2 } from "react-icons/rx";
import { FiEdit2 } from "react-icons/fi";

const ProfilePage = () => {
  const { loggedUser, updateProfile } = authStore();
  const [openPopup, setOpenPopup] = useState(false);

  const avatarUrl =
    loggedUser.profilepic && loggedUser.profilepic !== ""
      ? loggedUser.profilepic
      : "/avatar.avif";

  const handleUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onload = () => {
        const newPic = reader.result;
        authStore.setState({
          loggedUser: { ...loggedUser, profilepic: newPic },
        });
        setOpenPopup(false);
        updateProfile({ profilepic: newPic });
      };
    } catch (error) {
      console.log("Compression error:", error);
    }
  };

  const handleDelete = () => {
    authStore.setState({
      loggedUser: { ...loggedUser, profilepic: null },
    });
    setOpenPopup(false);
    updateProfile({ profilepic: null });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-gradient-to-r from-gray-500 to-gray-800 rounded-2xl shadow-2xl p-12 w-full max-w-xl relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-400 opacity-20 rounded-full z-0 animate-pulse"></div>
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-pink-400 opacity-20 rounded-full z-0 animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center gap-6">

          {/* Avatar + Edit Icon */}
          <div className="relative group">
            <img
              src={avatarUrl}
              onError={(e) => (e.target.src = "/avatar.avif")}
              alt="Profile"
              className="w-36 h-36 rounded-full border-2 border-blue-400 shadow-lg object-cover cursor-pointer"
              onClick={() => setOpenPopup(true)}
            />

            {/* Pencil Edit Button */}
            <button
              onClick={() => setOpenPopup(true)}
              className="absolute bottom-2 right-2 w-9 h-9 rounded-full
                         bg-[#3D76E9] hover:bg-[#3367CC]
                         flex items-center justify-center
                         shadow-lg transition"
            >
              <FiEdit2 className="text-white text-lg" />
            </button>
          </div>

          <h2 className="text-3xl font-bold text-white text-center">
            {loggedUser.username}
          </h2>

          <p className="text-gray-200 text-lg text-center tracking-wide">
            {loggedUser.email}
          </p>
        </div>
      </div>

      {openPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-[#242631] rounded-3xl p-8 w-[420px] flex flex-col items-center gap-6 relative shadow-[0_0_25px_rgba(0,0,0,0.45)]">

            <button
              onClick={() => setOpenPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
            >
              <RxCross2 />
            </button>

            <img
              src={avatarUrl}
              onError={(e) => (e.target.src = "/avatar.avif")}
              alt="Profile Preview"
              className="w-44 h-44 rounded-full object-cover shadow-xl border-2 border-[#607dff]"
            />

            <label
              htmlFor="popup-upload"
              className="w-full py-3 rounded-xl text-center font-medium text-lg cursor-pointer shadow-md
                         bg-[#3D76E9] hover:bg-[#3367CC] text-white transition"
            >
              Change Photo
              <input
                id="popup-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleUpdate}
              />
            </label>

            <button
              onClick={handleDelete}
              className="w-full py-3 rounded-xl font-medium text-lg shadow-md
                         bg-[#3A3D4F] hover:bg-[#4B4F63] text-gray-200 transition"
            >
              Remove Photo
            </button>

            <button
              onClick={() => setOpenPopup(false)}
              className="text-gray-300 hover:text-white pt-2 text-base transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
