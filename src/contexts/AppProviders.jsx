import React from "react";
import { AxiosProvider } from "./AxiosContext";
import { AuthProvider } from "./AuthProvider";
import { UserProvider } from "./UserContext";
import { CatsProvider } from "./CatsContext";
import { CatSearchProvider } from "./CatSearchContext";
import { ProductProvider } from "./ProductContext";
import { LanguageProvider } from "./LanguageContext";
import { NotificationProvider } from "./NotificationContext";

export const AppProviders = ({ children }) => {
  // Créer une référence pour stocker la fonction de déconnexion
  const logoutRef = React.useRef(null);

  return (
    <NotificationProvider>
      <LanguageProvider>
        <AxiosProvider onLogout={() => logoutRef.current?.()}>
          <AuthProvider onLogoutRef={logoutRef}>
            <CatsProvider>
              <UserProvider>
                <CatSearchProvider>
                  <ProductProvider>{children}</ProductProvider>
                </CatSearchProvider>
              </UserProvider>
            </CatsProvider>
          </AuthProvider>
        </AxiosProvider>
      </LanguageProvider>
    </NotificationProvider>
  );
};
