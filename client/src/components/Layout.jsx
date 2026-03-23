import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChefHat, PlusCircle, Home, ShieldCheck, LogOut, Menu, X, LayoutDashboard, Search } from 'lucide-react';
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

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed inset-0 z-[150] md:hidden transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Backdrop Backdrop Blur */}
        <div 
          className={`absolute inset-0 bg-[#1A1917]/20 backdrop-blur-sm transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        <div 
          className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-[400px] bg-gradient-to-br from-[#FCFBF9] to-[#F7F4EE] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-md border-b border-[#E5E0D8]/50">
             <Link className="nav-logo" to="/" onClick={() => setMobileMenuOpen(false)}>
              <div className="nav-logo-mark scale-90">
                <svg viewBox="0 0 18 18" fill="none"><path d="M9 2C6.24 2 4 4.24 4 7c0 2 1.2 3.73 2.93 4.55L6 15h6l-.93-3.45A5 5 0 0 0 14 7c0-2.76-2.24-5-5-5z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 15h4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
              <span className="font-serif text-xl tracking-tight">Quickcook</span>
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2.5 bg-[#F7F4EE] hover:bg-[#E5E0D8] rounded-full transition-colors active:scale-90"
            >
              <X className="w-5 h-5 text-[#1A1917]" />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
            <Link 
              className={`flex items-center gap-4 text-base font-bold p-4.5 rounded-[20px] transition-all duration-300 ${location.pathname === '/' ? 'bg-[#1A1917] text-white shadow-xl' : 'text-[#1A1917] hover:bg-white/60 border border-transparent hover:border-[#E5E0D8]/30'}`}
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontFamily: 'var(--sans)', transitionDelay: mobileMenuOpen ? '100ms' : '0ms', opacity: mobileMenuOpen ? 1 : 0, transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)' }}
            >
              <Search className={`w-5 h-5 ${location.pathname === '/' ? 'text-white' : 'text-[#A8A69F]'}`} />
              Find a cook
            </Link>

            <Link 
              className={`flex items-center gap-4 text-base font-bold p-4.5 rounded-[20px] transition-all duration-300 ${location.pathname === '/add' ? 'bg-[#1A1917] text-white shadow-xl' : 'text-[#1A1917] hover:bg-white/60 border border-transparent hover:border-[#E5E0D8]/30'}`}
              to="/add" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontFamily: 'var(--sans)', transitionDelay: mobileMenuOpen ? '150ms' : '0ms', opacity: mobileMenuOpen ? 1 : 0, transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)' }}
            >
              <PlusCircle className={`w-5 h-5 ${location.pathname === '/add' ? 'text-white' : 'text-[#A8A69F]'}`} />
              Add Your Services
            </Link>

            {user && (
              <Link 
                className={`flex items-center gap-4 text-base font-bold p-4.5 rounded-[20px] transition-all duration-300 ${location.pathname === '/dashboard' ? 'bg-[#1A1917] text-white shadow-xl' : 'text-[#1A1917] hover:bg-white/60 border border-transparent hover:border-[#E5E0D8]/30'}`}
                to="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontFamily: 'var(--sans)', transitionDelay: mobileMenuOpen ? '200ms' : '0ms', opacity: mobileMenuOpen ? 1 : 0, transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)' }}
              >
                <LayoutDashboard className={`w-5 h-5 ${location.pathname === '/dashboard' ? 'text-white' : 'text-[#A8A69F]'}`} />
                Provider Dashboard
              </Link>
            )}

            <Link 
              className={`flex items-center gap-4 text-base font-bold p-4.5 rounded-[20px] transition-all duration-300 ${location.pathname === '/admin' ? 'bg-[#1A1917] text-white shadow-xl' : 'text-[#1A1917] hover:bg-white/60 border border-transparent hover:border-[#E5E0D8]/30'}`}
              to="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontFamily: 'var(--sans)', transitionDelay: mobileMenuOpen ? '250ms' : '0ms', opacity: mobileMenuOpen ? 1 : 0, transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)' }}
            >
              <ShieldCheck className={`w-5 h-5 ${location.pathname === '/admin' ? 'text-white' : 'text-[#A8A69F]'}`} />
              Admin Panel
            </Link>
            
            <div 
              className="pt-6 mt-auto border-t border-[#E5E0D8]/40 p-6 bg-white/30 backdrop-blur-sm rounded-t-[32px] transition-all duration-500"
              style={{ transitionDelay: mobileMenuOpen ? '300ms' : '0ms', opacity: mobileMenuOpen ? 1 : 0, transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)' }}
            >
              {!user ? (
                <button 
                  onClick={() => { gLogin(); setMobileMenuOpen(false); }}
                  className="w-full bg-[#1A1917] text-white p-4.5 rounded-[20px] font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all hover:bg-[#2D2C28]"
                  style={{ fontFamily: 'var(--sans)' }}
                >
                  <div className="bg-white p-1 rounded-full flex items-center justify-center shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                  </div>
                  Sign in with Google
                </button>
              ) : (
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-3 text-[#7B3322] font-bold p-4.5 rounded-[20px] hover:bg-[#FAECE7] transition-all"
                  style={{ fontFamily: 'var(--sans)' }}
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
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
