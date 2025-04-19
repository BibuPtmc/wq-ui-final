import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API,
  headers: {
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
