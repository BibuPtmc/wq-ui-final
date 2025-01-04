import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./Navbar";
import Footer from "./Footer";
import RegistrationForm from "./register/RegistrationForm";
import RegisterCat from "./RegisterCat";
import LostCats from "./LostCats";
import FoundCats from "./FoundCats";
import HomePage from "./HomePage";
import { ContactUs } from "./ContactPage";
import LoginPage from "./LoginPage";
import ProfilePage from "./ProfilePage";
import GpsCollars from './pages/GpsCollars';
import MatchingPage from './pages/MatchingPage';
import "bootstrap/dist/css/bootstrap.css";
import "./../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider, useAuth } from "./hooks/authProvider";

const container = document.getElementById("root");
const root = createRoot(container);

// Composant pour protéger les routes qui nécessitent une connexion
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <div style={{ flex: 1 }}>
            <NavBar />
            <Routes>
              <Route exact path="/" element={<HomePage />} />
              <Route path="/register" element={<RegistrationForm />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/registerCat" 
                element={
                  <ProtectedRoute>
                    <RegisterCat />
                  </ProtectedRoute>
                } 
              />
              <Route path="/foundCats" element={<FoundCats />} />
              <Route path="/lostCats" element={<LostCats />} />
              <Route path="/gps-collars" element={<GpsCollars />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/matching" 
                element={
                  <ProtectedRoute>
                    <MatchingPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

root.render(<App />);
