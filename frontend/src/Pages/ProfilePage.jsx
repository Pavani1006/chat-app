import { useState } from "react";
import { authStore } from "../store/authStore";
import imageCompression from "browser-image-compression";

const ProfilePage = () => {
  const { loggedUser, updateProfile } = authStore();
  const [openPopup, setOpenPopup] = useState(false);

  // Avatar fallback from model
  const avatarUrl =
    loggedUser.profilepic && loggedUser.profilepic !== ""
      ? loggedUser.profilepic
      : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

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
      reader.onload = async () => {
        await updateProfile({ profilepic: reader.result });
        setOpenPopup(false);
      };
    } catch (error) {
      console.log("Compression error:", error);
    }
  };

  const handleDelete = async () => {
    await updateProfile({ profilepic: null });
    setOpenPopup(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-gradient-to-r from-gray-500 to-gray-800 rounded-2xl shadow-2xl p-12 w-full max-w-xl relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-400 opacity-20 rounded-full z-0 animate-pulse"></div>
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-pink-400 opacity-20 rounded-full z-0 animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <img
            src={avatarUrl}
            onError={(e) =>
              (e.target.src =
                "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y")
            }
            alt="Profile"
            className="w-36 h-36 rounded-full border-2 border-blue-400 shadow-lg object-cover cursor-pointer"
            onClick={() => setOpenPopup(true)}
          />

          <h2 className="text-3xl font-bold text-white text-center">
            {loggedUser.username}
          </h2>
          <p className="text-gray-200 text-lg text-center tracking-wide">
            {loggedUser.email}
          </p>
        </div>
      </div>

      {openPopup && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-6 w-[450px]">
            <img
              src={avatarUrl}
              onError={(e) =>
                (e.target.src =
                  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y")
              }
              alt="Profile Preview"
              className="w-64 h-64 rounded-full object-cover shadow-xl border-4 border-blue-400"
            />

            <label
              htmlFor="popup-upload"
              className="bg-blue-500 hover:bg-blue-600 text-white w-full text-center py-2 rounded-lg cursor-pointer text-lg"
            >
              Update Photo
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
              className="bg-red-500 hover:bg-red-600 text-white w-full py-2 rounded-lg text-lg"
            >
              Delete Photo
            </button>

            <button
              onClick={() => setOpenPopup(false)}
              className="text-gray-700 underline text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
