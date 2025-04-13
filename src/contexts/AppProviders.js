import React from 'react';
import { AxiosProvider } from './AxiosContext';
import { AuthProvider } from '../hooks/authProvider';
import { CatsProvider } from './CatsContext';
import { CatSearchProvider } from './CatSearchContext';
import { ProductProvider } from './ProductContext';

// Composant qui combine tous les providers de l'application
export const AppProviders = ({ children }) => {
  return (
    <AxiosProvider>
      <AuthProvider>
        <CatsProvider>
          <CatSearchProvider>
            <ProductProvider>
              {children}
            </ProductProvider>
          </CatSearchProvider>
        </CatsProvider>
      </AuthProvider>
    </AxiosProvider>
  );
};
