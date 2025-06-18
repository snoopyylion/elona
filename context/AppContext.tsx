"use client";

import { createContext, useState, useContext } from 'react';
import { UserResponse } from '@/types/user';

interface AppContextType {
  currentUser: UserResponse | null;
  token: string | null;
  handleLogout: () => void;
  // other global state...
}

export const AppContext = createContext<AppContextType>({
  currentUser: null,
  token: null,
  handleLogout: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    // remove from localStorage, etc.
  };

  return (
    <AppContext.Provider value={{ currentUser, token, handleLogout }}>
      {children}
    </AppContext.Provider>
  );
};
