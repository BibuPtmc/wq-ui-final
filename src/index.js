import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./Navbar";
import Footer from "./Footer";
import RegistrationForm from "./register/RegistrationForm";
import RegisterCat from "./RegisterCat";
import FoundCats from "./FoundCats";
import HomePage from "./HomePage";
import { ContactUs } from "./ContactPage";
import LoginPage from "./LoginPage";
import ProfilePage from "./ProfilePage";
import "bootstrap/dist/css/bootstrap.css";
import "./../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./hooks/authProvider";

const container = document.getElementById("root");
const root = createRoot(container);

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
              <Route path="/registerCat" element={<RegisterCat />} />
              <Route path="/foundCats" element={<FoundCats />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

root.render(<App />);
