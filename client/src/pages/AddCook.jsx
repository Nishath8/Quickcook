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
    contact: '',
    dietary_preferences: [],
    sample_menu: '',
    availability: {
      "Mon": [], "Tue": [], "Wed": [], "Thu": [], "Fri": [], "Sat": [], "Sun": []
    }
  });

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'dietary_preferences') {
      const updatedDiet = checked 
        ? [...formData.dietary_preferences, value]
        : formData.dietary_preferences.filter(d => d !== value);
      setFormData(prev => ({ ...prev, dietary_preferences: updatedDiet }));
    } else if (name.startsWith('avail_')) {
      const [_, day, slot] = name.split('_');
      const dayAvail = formData.availability[day] || [];
      const updatedDayAvail = checked 
        ? [...dayAvail, slot]
        : dayAvail.filter(s => s !== slot);
      setFormData(prev => ({
        ...prev,
        availability: { ...prev.availability, [day]: updatedDayAvail }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
    <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in-up">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-serif font-bold text-[#1A1917]">
          Register your services
        </h1>
        <p className="text-[#6E6C67] mt-3 text-lg font-light italic">
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
          <div className="p-10 text-center bg-white rounded-3xl border border-[#E5E0D8] shadow-sm">
            <div className="w-20 h-20 bg-[#FBF0DF] rounded-full flex items-center justify-center mx-auto mb-6">
              <ChefHat className="w-10 h-10 text-[#C17B2A]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#1A1917] mb-3">Sign in to continue</h2>
            <p className="text-[#6E6C67] mb-8 text-sm leading-relaxed max-w-sm mx-auto">
              We securely link your profile to your Google account so you can update your menu and manage reviews later without a password.
            </p>
            <button 
              onClick={() => gLogin()}
              className="bg-[#1A1917] hover:bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center mx-auto transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <div className="bg-white p-1.5 rounded-full mr-3 shrink-0 shadow-sm">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              </div>
              Continue with Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-10 rounded-3xl border border-[#E5E0D8] shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-2 block">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all placeholder-[#A8A69F] text-[#1A1917] bg-[#F7F4EE]/30"
                  placeholder="Chef Name"
                />
              </div>

              <div>
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-2 block">City / Area</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all placeholder-[#A8A69F] text-[#1A1917] bg-[#F7F4EE]/30"
                  placeholder="e.g. Indiranagar"
                />
              </div>

              <div>
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-2 block">Price Range</label>
                <select
                  name="price_range"
                  required
                  value={formData.price_range}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all text-[#1A1917] bg-[#F7F4EE]/30"
                >
                  <option value="">Select range</option>
                  <option value="₹250 - ₹500">₹250 - ₹500 (Value)</option>
                  <option value="₹500 - ₹1,000">₹500 - ₹1,000 (Standard)</option>
                  <option value="₹1,000 - ₹2,000">₹1,000 - ₹2,000 (Premium)</option>
                  <option value="₹2,000+">₹2,000+ (Elite)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-2 block">Cuisine Specialties</label>
                <input
                  type="text"
                  name="cuisine"
                  required
                  value={formData.cuisine}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all placeholder-[#A8A69F] text-[#1A1917] bg-[#F7F4EE]/30"
                  placeholder="e.g. Italian, Thai, Desi"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-2 block">Public Phone Number</label>
                <input
                  type="tel"
                  name="contact"
                  required
                  pattern="[+\d\s\-()]+"
                  title="Please enter a valid phone number"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all placeholder-[#A8A69F] text-[#1A1917] bg-[#F7F4EE]/30"
                  placeholder="+91 ...."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-4 block">Dietary Offerings</label>
                <div className="flex flex-wrap gap-4">
                  {['Veg', 'Non-Veg', 'Vegan', 'Jain'].map(diet => (
                    <label key={diet} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        name="dietary_preferences"
                        value={diet}
                        checked={formData.dietary_preferences.includes(diet)}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <div className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                        formData.dietary_preferences.includes(diet) 
                        ? 'bg-[#1A6B4A] border-[#1A6B4A] text-white shadow-md' 
                        : 'bg-white border-[#E5E0D8] text-[#6E6C67] hover:border-[#1A6B4A]'
                      }`}>
                        {diet}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-4 block">Availability Slots</label>
                <div className="overflow-x-auto bg-[#F7F4EE]/30 rounded-2xl p-4 border border-[#E5E0D8]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 text-[10px] text-[#A8A69F] uppercase">Day</th>
                        {['Morning', 'Afternoon', 'Evening'].map(slot => (
                          <th key={slot} className="p-2 text-[10px] text-[#A8A69F] uppercase text-center">{slot}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <tr key={day} className="border-t border-[#E5E0D8]/30">
                          <td className="p-2 text-xs font-bold text-[#1A1917]">{day}</td>
                          {['Morning', 'Afternoon', 'Evening'].map(slot => (
                            <td key={slot} className="p-2 text-center">
                              <label className="inline-block p-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name={`avail_${day}_${slot}`}
                                  checked={(formData.availability[day] || []).includes(slot)}
                                  onChange={handleChange}
                                  className="w-4 h-4 accent-[#1A6B4A] rounded cursor-pointer"
                                />
                              </label>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-2 block">Sample Menu / Specialities</label>
                <textarea
                  name="sample_menu"
                  value={formData.sample_menu}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-5 py-4 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all placeholder-[#A8A69F] text-[#1A1917] bg-[#F7F4EE]/30 resize-none"
                  placeholder="e.g. Traditional Bengali Fish Curry, South Indian Breakfast Thali..."
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#1A6B4A] hover:bg-[#2D8C60] text-white py-4.5 rounded-2xl font-bold flex justify-center items-center transition-all shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Creating Profile...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
