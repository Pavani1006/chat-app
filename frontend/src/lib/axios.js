import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://connectly-backend-dkbq.onrender.com",
  withCredentials: true,
});
