import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { saveWalletAddress, getWalletAddress, clearWalletAddress } from '../utils/storage.ts';

interface AuthContextType {
  isAuthenticated: boolean;
  walletAddress: string | null;
  setAuthenticated: (authenticated: boolean, address?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Check for existing session on mount using storage utility
  useEffect(() => {
    const storedAddress = getWalletAddress();
    
    if (storedAddress) {
      setIsAuthenticated(true);
      setWalletAddress(storedAddress);
    }
  }, []);

  const setAuthenticated = (authenticated: boolean, address?: string) => {
    setIsAuthenticated(authenticated);
    
    if (authenticated && address) {
      setWalletAddress(address);
      saveWalletAddress(address);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setWalletAddress(null);
    clearWalletAddress();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        walletAddress, 
        setAuthenticated, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
