import axios from "axios";

export default axios.create({
  baseURL: process.env.REACT_APP_API,
  headers: {
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
