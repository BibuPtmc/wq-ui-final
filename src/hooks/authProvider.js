import { createContext, useContext, useState } from "react";
import { useAxios } from "./useAxios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const axios = useAxios();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchUserData = async () => {
    if (!sessionStorage.getItem("token")) {
      setLoading(false);
      setIsLoggedIn(false);
      return;
    }

    try {
      var headers = sessionStorage.getItem("token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
        : {};
      const response = await axios.get("users/me", { headers: headers });
      setIsLoggedIn(response);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    fetchUserData();
  }
  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
