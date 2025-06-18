import React from 'react';
import { UserResponse } from '@/types/user';

interface NavbarProps {
  currentUser: UserResponse | null; // <--- this is the real fix
  onLogout?: () => void;
  isAuthenticated?: boolean;
}


const Navbar = ({ currentUser, onLogout, isAuthenticated = false }: NavbarProps) => {
    
  return (
    <div>
      <div className="nav-container flex justify-between items-center bg-white p-4 shadow-md border-b">
        <div className="nav-logo flex justify-center">
          <h1 className="text-2xl font-bold text-gray-800">Elona</h1>
        </div>
        
        <div className="nav-items flex items-center">
          {isAuthenticated && currentUser ? (
            // Authenticated user navigation
            <div className="flex items-center gap-6">
              <div className="user-info flex items-center gap-3">
                <div className="user-avatar bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            // Guest navigation
            <ul className="flex gap-6 text-gray-700">
              <li className="hover:text-blue-600 cursor-pointer font-medium transition-colors duration-200">
                Home
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;