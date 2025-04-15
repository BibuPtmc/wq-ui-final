import React from 'react';
import { AxiosProvider } from './AxiosContext';
import { AuthProvider } from '../hooks/authProvider';
import { UserProvider } from './UserContext';
import { CatsProvider } from './CatsContext';
import { CatSearchProvider } from './CatSearchContext';
import { ProductProvider } from './ProductContext';

// Composant qui combine tous les providers de l'application
export const AppProviders = ({ children }) => {
  return (
    <AxiosProvider>
      <AuthProvider>
        <UserProvider>
          <CatsProvider>
            <CatSearchProvider>
              <ProductProvider>
                {children}
              </ProductProvider>
            </CatSearchProvider>
          </CatsProvider>
        </UserProvider>
      </AuthProvider>
    </AxiosProvider>
  );
};
