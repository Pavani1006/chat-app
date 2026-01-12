import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://192.168.1.9:5000/api",
  withCredentials: true,
});
