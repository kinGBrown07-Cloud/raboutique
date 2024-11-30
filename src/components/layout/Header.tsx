import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, User, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function Header() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button className="p-2 rounded-md text-gray-400 lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600">REMag</span>
            </Link>
          </div>

          <div className="flex-1 max-w-xl px-8 hidden lg:block">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="search"
                placeholder="Search listings..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <Bell className="h-6 w-6" />
                </button>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <img
                    src={user?.avatar || 'https://ui-avatars.com/api/?name=' + user?.name}
                    alt={user?.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="hidden md:block">{user?.name}</span>
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <User className="h-6 w-6" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}