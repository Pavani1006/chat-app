import axios from "axios";

export const backendUrl = "https://connectly-backend-dkbq.onrender.com";

export const axiosInstance = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true,
});
