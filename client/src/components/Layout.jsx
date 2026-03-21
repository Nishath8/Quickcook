import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChefHat, PlusCircle, Home, ShieldCheck } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5 mr-1" /> },
    { name: 'Add Cook', path: '/add', icon: <PlusCircle className="w-5 h-5 mr-1" /> },
    { name: 'Admin', path: '/admin', icon: <ShieldCheck className="w-5 h-5 mr-1" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
                <div className="bg-primary-600 p-2 rounded-lg text-white">
                  <ChefHat className="w-6 h-6" />
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight">Quickcook</span>
              </Link>
            </div>

            {/* Nav Links */}
            <div className="flex space-x-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-primary-600'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {link.icon}
                    <span className="hidden sm:inline">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
