import { useState } from 'react';
import axios from 'axios';
import { ChefHat, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

export default function AddCook() {
  const { user, login, token } = useAuth();
  
  const gLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      login({ access_token: codeResponse.access_token }).catch(err => alert(err.message));
    },
    onError: (error) => console.log('Login Failed:', error)
  });

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    cuisine: '',
    price_range: '',
    contact: ''
  });

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/cooks`, 
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus('success');
      setMessage(response.data.message || 'Cook added successfully!');
      setFormData({ name: '', location: '', cuisine: '', price_range: '', contact: '' });
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to add cook. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--ink)'}}>
          Register your services
        </h1>
        <p style={{color: 'var(--ink4)', marginTop: '8px', fontSize: '16px'}}>
          Join the marketplace and let clients find you easily.
        </p>
      </div>

      <div style={{backgroundColor: 'var(--cream)', borderRadius: '24px', padding: '32px', border: '1px solid #E5E0D8'}}>
        
        {status === 'success' && (
          <div className="bg-green-50 p-4 mb-6 rounded-xl flex items-center border border-green-100">
            <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0" />
            <p className="text-sm text-green-800 font-medium">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 p-4 mb-6 rounded-xl flex items-center border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 shrink-0" />
            <p className="text-sm text-red-800 font-medium">{message}</p>
          </div>
        )}

        {!user ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E0D8]">
            <ChefHat className="w-16 h-16 mx-auto mb-4" color="var(--ink4)" />
            <h2 style={{fontSize: '20px', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '8px'}}>Sign in to continue</h2>
            <p style={{color: 'var(--ink4)', marginBottom: '24px', fontSize: '14px'}}>
              We securely link your profile to your Google account so you can update your menu, track views, and manage reviews later without a password.
            </p>
            <button 
              onClick={() => gLogin()}
              style={{
                backgroundColor: 'var(--ink)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#000'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--ink)'}
            >
              <div className="bg-white p-1 rounded-full mr-3 shrink-0">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              </div>
              Sign in with Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-2xl border border-[#E5E0D8]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label style={{color: 'var(--ink3)', fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block'}}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[var(--ink)] focus:border-[var(--ink)] outline-none transition-all placeholder-gray-400 text-gray-900"
                  placeholder="e.g. Gordon Ramsay"
                />
              </div>

              <div>
                <label style={{color: 'var(--ink3)', fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block'}}>Location</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[var(--ink)] focus:border-[var(--ink)] outline-none transition-all placeholder-gray-400 text-gray-900"
                  placeholder="e.g. Koramangala, Bengaluru"
                />
              </div>

              <div>
                <label style={{color: 'var(--ink3)', fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block'}}>Price Range</label>
                <select
                  name="price_range"
                  required
                  value={formData.price_range}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[var(--ink)] focus:border-[var(--ink)] outline-none transition-all text-gray-900 bg-white"
                >
                  <option value="" disabled>Select a range</option>
                  <option value="$">$ (Inexpensive)</option>
                  <option value="$$">$$ (Moderate)</option>
                  <option value="$$$">$$$ (Expensive)</option>
                  <option value="$$$$">$$$$ (Very Expensive)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label style={{color: 'var(--ink3)', fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block'}}>Cuisine Specialties</label>
                <input
                  type="text"
                  name="cuisine"
                  required
                  value={formData.cuisine}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[var(--ink)] focus:border-[var(--ink)] outline-none transition-all placeholder-gray-400 text-gray-900"
                  placeholder="e.g. Italian, Continental, Baking"
                />
              </div>

              <div className="sm:col-span-2">
                <label style={{color: 'var(--ink3)', fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block'}}>Phone Number</label>
                <input
                  type="tel"
                  name="contact"
                  required
                  pattern="[+\d\s\-()]+"
                  title="Please enter a valid phone number"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[var(--ink)] focus:border-[var(--ink)] outline-none transition-all placeholder-gray-400 text-gray-900"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>

            <div className="pt-4 mt-2">
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  backgroundColor: 'var(--green)',
                  color: 'white',
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'opacity 0.2s',
                  opacity: status === 'loading' ? 0.7 : 1,
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer'
                }}
              >
                {status === 'loading' ? 'Submitting...' : 'Submit Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
