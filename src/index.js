import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import RegistrationForm from "./register/RegistrationForm";
import RegisterCat from "./components/cats/RegisterCat";
import LostCats from "./components/cats/LostCats";
import FoundCats from "./components/cats/FoundCats";
import HomePage from "./pages/home/HomePage";
import { ContactUs } from "./pages/contact/ContactPage";
import LoginPage from "./pages/auth/LoginPage";
import ProfilePage from "./pages/profile/ProfilePage";
import GpsCollars from './pages/shop/GpsCollars';
import PaymentSuccess from './pages/PaymentSuccess';
import { CartProvider } from './contexts/CartContext';
import "bootstrap/dist/css/bootstrap.css";
import "./../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "./hooks/authProvider";
import { AppProviders } from "./contexts/AppProviders";

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
    <AppProviders>
      <CartProvider>
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
                <Route path="/success" element={<PaymentSuccess />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AppProviders>
  );
};

root.render(<App />);
