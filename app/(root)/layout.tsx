'use client';

import React, { useContext } from 'react';
import Footer from '@/components/Footer';
import NewNavbar from '@/components/Navbar';
import { AppContext } from '@/context/AppContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, token, handleLogout } = useContext(AppContext);

  return (
    <main className="bg-gray-50 dark:bg-black transition-colors duration-300">
      <NewNavbar
        currentUser={currentUser}
        isAuthenticated={!!token}
        onLogout={handleLogout}
      />
      {children}
      <Footer />
    </main>
  );
}
