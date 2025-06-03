import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout";
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
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import CatsManagement from "./pages/admin/CatsManagement";
import OrdersManagement from "./pages/admin/OrdersManagement";
import ProductsManagement from "./pages/admin/ProductsManagement";
import Reports from "./pages/admin/Reports";

const container = document.getElementById("root");
const root = createRoot(container);

// Composant pour protéger les routes qui nécessitent une connexion
const ProtectedRoute = ({ children, roles }) => {
  const { isLoggedIn, userData } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(userData?.role)) {
    // Redirection vers la page d'accueil si l'utilisateur n'a pas le bon rôle
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route
          path="/*"
          element={
            <PublicLayout>
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
            </PublicLayout>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminLayout>
                <Routes>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="users" element={<UsersManagement />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="products" element={<ProductsManagement />} />
                  <Route path="orders" element={<OrdersManagement />} />
                  <Route path="cats" element={<CatsManagement />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
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
