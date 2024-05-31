import { jwtDecode } from "jwt-decode";

export const useToken = () => {
  const token = sessionStorage.getItem("token");
  if (!token) return null;
  return jwtDecode(token);
};
