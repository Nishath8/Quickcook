import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChefHat, PlusCircle, Home, ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const { user, login, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const gLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      login({ access_token: codeResponse.access_token }).catch(err => alert(err.message));
    },
    onError: (error) => console.log('Login Failed:', error)
  });

  return (
    <div className="min-h-screen flex flex-col pt-[60px]">
      {/* Navbar */}
      <nav className="custom-nav fixed top-0 left-0 right-0 z-[100]">
        <Link className="nav-logo" to="/" onClick={() => setMobileMenuOpen(false)}>
          <div className="nav-logo-mark">
            <svg viewBox="0 0 18 18" fill="none"><path d="M9 2C6.24 2 4 4.24 4 7c0 2 1.2 3.73 2.93 4.55L6 15h6l-.93-3.45A5 5 0 0 0 14 7c0-2.76-2.24-5-5-5z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 15h4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </div>
          <span className="font-serif">Quickcook</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-2">
          <Link className="nav-link" to="/">Find a cook</Link>
          <Link className="nav-link" to="/add">Add Cook</Link>
          {user && <Link className="nav-link" to="/dashboard">Dashboard</Link>}
          <Link className="nav-link" to="/admin">Admin</Link>
          
          <div className="flex items-center h-full ml-4 border-l border-[#E5E0D8] pl-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-[#E5E0D8] shadow-sm hover:scale-110 transition-transform cursor-pointer"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={logout}
                  className="p-2 text-[#A8A69F] hover:text-[#7B3322] hover:bg-[#FAECE7] rounded-lg transition-all"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => gLogin()}
                className="bg-[#1A1917] hover:bg-black text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md"
              >
                <div className="bg-white p-1 rounded-full flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                </div>
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center space-x-3">
          {!user && (
            <button 
              onClick={() => gLogin()}
              className="bg-[#1A1917] p-2 rounded-lg text-white"
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            </button>
          )}
          {user && (
            <img 
              src={user.avatar} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full border border-[#E5E0D8]"
              referrerPolicy="no-referrer"
            />
          )}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#1A1917] hover:bg-[#F7F4EE] rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[150] md:hidden animate-in fade-in slide-in-from-right duration-300">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-bottom border-[#E5E0D8]">
               <Link className="nav-logo" to="/" onClick={() => setMobileMenuOpen(false)}>
                <div className="nav-logo-mark">
                  <svg viewBox="0 0 18 18" fill="none"><path d="M9 2C6.24 2 4 4.24 4 7c0 2 1.2 3.73 2.93 4.55L6 15h6l-.93-3.45A5 5 0 0 0 14 7c0-2.76-2.24-5-5-5z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 15h4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
                </div>
                <span className="font-serif">Quickcook</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2"><X className="w-8 h-8" /></button>
            </div>
            
            <div className="flex flex-col p-6 space-y-2">
              <Link className="text-2xl font-serif font-bold text-[#1A1917] p-4 hover:bg-[#F7F4EE] rounded-2xl transition-colors" to="/" onClick={() => setMobileMenuOpen(false)}>Find a cook</Link>
              <Link className="text-2xl font-serif font-bold text-[#1A1917] p-4 hover:bg-[#F7F4EE] rounded-2xl transition-colors" to="/add" onClick={() => setMobileMenuOpen(false)}>Add Your Services</Link>
              {user && <Link className="text-2xl font-serif font-bold text-[#1A1917] p-4 hover:bg-[#F7F4EE] rounded-2xl transition-colors" to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Provider Dashboard</Link>}
              <Link className="text-2xl font-serif font-bold text-[#1A1917] p-4 hover:bg-[#F7F4EE] rounded-2xl transition-colors" to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
              
              {!user && (
                <button 
                  onClick={() => { gLogin(); setMobileMenuOpen(false); }}
                  className="mt-4 bg-[#1A1917] text-white p-5 rounded-2xl font-black text-center"
                >
                  Sign in with Google
                </button>
              )}

              {user && (
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="mt-8 text-[#7B3322] font-black p-4 flex items-center gap-2 border-t border-[#E5E0D8]"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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
