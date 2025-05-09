import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import RegistrationForm from "./pages/auth/RegistrationForm";
import RegisterCat from "./components/cats/RegisterCat";
import LostCats from "./components/cats/LostCats";
import FoundCats from "./components/cats/FoundCats";
import HomePage from "./pages/home/HomePage";
import { ContactUs } from "./pages/contact/ContactPage";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import "./i18n";
import ProfilePage from "./pages/profile/ProfilePage";
import GpsCollars from "./pages/shop/GpsCollars";
import PaymentSuccess from "./pages/PaymentSuccess";
import { CartProvider } from "./contexts/CartContext";
import "bootstrap/dist/css/bootstrap.css";
import "./styles/global.css";
import { useAuth } from "./contexts/AuthProvider";
import { AppProviders } from "./contexts/AppProviders";
import NotificationBar from "./components/common/NotificationBar";

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

function App() {
  return (
    <CartProvider>
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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
    </CartProvider>
  );
}

root.render(
  <BrowserRouter
    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
  >
    <AppProviders>
      <>
        <NotificationBar />
        <App />
      </>
    </AppProviders>
  </BrowserRouter>
);

export default App;
