import { createContext, useContext, useState, useEffect } from "react";
import { useAxios } from "./useAxios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const axios = useAxios();
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const fetchUserData = async () => {
    if (!sessionStorage.getItem("token")) {
      setLoading(false);
      setIsLoggedIn(false);
      setUserData(null);
      return;
    }

    try {
      var headers = { Authorization: `Bearer ${sessionStorage.getItem("token")}` };
      const response = await axios.get("users/me", { headers });
      setIsLoggedIn(true);
      setUserData(response);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoggedIn(false);
      setUserData(null);
      sessionStorage.removeItem("token"); // Clear invalid token
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []); // Run once on mount

  const logout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    sessionStorage.removeItem("token");
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      setIsLoggedIn, 
      userData, 
      setUserData, 
      fetchUserData,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
