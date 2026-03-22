import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChefHat, PlusCircle, Home, ShieldCheck, LogOut } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const { user, login, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5 mr-1" /> },
    { name: 'Add Cook', path: '/add', icon: <PlusCircle className="w-5 h-5 mr-1" /> },
    { name: 'Admin', path: '/admin', icon: <ShieldCheck className="w-5 h-5 mr-1" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="custom-nav">
        <Link className="nav-logo" to="/">
          <div className="nav-logo-mark">
            <svg viewBox="0 0 18 18" fill="none"><path d="M9 2C6.24 2 4 4.24 4 7c0 2 1.2 3.73 2.93 4.55L6 15h6l-.93-3.45A5 5 0 0 0 14 7c0-2.76-2.24-5-5-5z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 15h4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </div>
          Quickcook
        </Link>
        <div className="nav-right">
          <Link className="nav-link hidden sm:inline" to="/">Find a cook</Link>
          <Link className="nav-link" to="/add">Add Cook</Link>
          {user && <Link className="nav-link" to="/dashboard">Dashboard</Link>}
          <Link className="nav-link" to="/admin">Admin</Link>
          
          <div className="flex items-center h-full ml-2">
            {user ? (
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-4 h-full">
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={logout}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="border-l border-gray-200 pl-4 h-full flex items-center">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    login({ credential: credentialResponse.credential }).catch(err => alert(err.message));
                  }}
                  onError={() => console.log('Login Failed')}
                  shape="rectangular"
                  size="small"
                  type="standard"
                  theme="outline"
                  text="signin"
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="custom-footer mt-auto">
        <div className="footer-inner">
          <span className="footer-logo">Quickcook</span>
          <span className="footer-copy">© 2025 Quickcook · Bengaluru, India · Every cook is verified.</span>
        </div>
      </footer>
    </div>
  );
}
