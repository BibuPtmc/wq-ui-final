import React from 'react';
import { AxiosProvider } from './AxiosContext';
import { AuthProvider } from '../hooks/authProvider';
import { UserProvider } from './UserContext';
import { CatsProvider } from './CatsContext';
import { CatSearchProvider } from './CatSearchContext';
import { ProductProvider } from './ProductContext';
import { LanguageProvider } from './LanguageContext';

// Composant qui combine tous les providers de l'application
import { NotificationProvider } from './NotificationContext';

export const AppProviders = ({ children }) => {
  return (
    <NotificationProvider>
      <LanguageProvider>
        <AxiosProvider>
          <AuthProvider>
            <CatsProvider>
              <UserProvider>
                <CatSearchProvider>
                  <ProductProvider>
                    {children}
                  </ProductProvider>
                </CatSearchProvider>
              </UserProvider>
            </CatsProvider>
          </AuthProvider>
        </AxiosProvider>
      </LanguageProvider>
    </NotificationProvider>
  );
};
