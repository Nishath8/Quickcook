import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import ReviewModal from './ReviewModal';
import axios from 'axios';
import { CheckCircle, MapPin, Utensils, DollarSign, Phone, Star, Clock, User, BarChart3, ShieldCheck } from 'lucide-react';

export default function CookCard({ cook }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, login, token, updateUserHistory } = useAuth();
  const navigate = useNavigate();
  
  const isContacted = user?.contactedCooks?.includes(cook._id);

  const handleContactClick = async () => {
    if (!user || !token || isContacted) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/track-contact`,
        { cookId: cook._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (updateUserHistory) {
        updateUserHistory(res.data.contactedCooks);
      }
    } catch (err) {
      console.error('Failed to track contact:', err);
    }
  };
  
  const initials = cook.name?.[0]?.toUpperCase() || 'C';
  const getAvatarClass = () => {
    const code = initials.charCodeAt(0);
    if (code % 3 === 0) return 'av-teal';
    if (code % 3 === 1) return 'av-coral';
    return 'av-blue';
  };

  const gLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      login({ access_token: codeResponse.access_token }).catch(err => alert(err.message));
    },
    onError: (error) => console.log('Login Failed:', error)
  });

  return (
    <div className="cook-card overflow-hidden relative group bg-white border border-[#E5E0D8] rounded-[24px] transition-all hover:shadow-xl hover:translate-y-[-4px]">
      {isContacted && (
        <div className="absolute top-4 right-4 bg-[#1A6B4A] text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center shadow-md z-10 animate-in fade-in zoom-in duration-300">
          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
          CONTACTED
        </div>
      )}
      
      <div className="p-6">
        {/* Verified Top Badge */}
        {cook.status === 'approved' && (
          <div className="inline-flex items-center gap-2 bg-[#1A6B4A]/10 text-[#1A6B4A] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
            <CheckCircle className="w-3 h-3" />
            Verified cook
          </div>
        )}

        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-[#F7F4EE] flex items-center justify-center text-xl font-medium text-[#1A6B4A]">
            {cook.profileImage ? (
              <img src={`${import.meta.env.VITE_API_BASE_URL}${cook.profileImage}`} alt={cook.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#1A1917] leading-tight mb-1" style={{ fontFamily: 'var(--sans)' }}>{cook.name}</h3>
            <div className="text-[#6E6C67] text-sm font-light mb-2">{cook.cuisine}</div>
            <div className="inline-flex items-center gap-1.5 bg-[#1A6B4A]/5 text-[#1A6B4A] px-2.5 py-1 rounded-full text-[10px] font-bold">
              <CheckCircle className="w-3 h-3" />
              Background checked
            </div>
          </div>
        </div>

        {/* Vouch Bar - Only show if count > 0 */}
        {cook.vouchCount > 0 && (
          <div className="bg-[#E4F2EA] rounded-2xl px-4 py-3 flex items-center gap-3 mb-6">
            <div className="flex -space-x-2">
              {['R', 'S', 'A', 'P'].map((init, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[#E4F2EA] bg-[#1A6B4A] text-white text-[10px] flex items-center justify-center font-bold">
                  {init}
                </div>
              ))}
            </div>
            <span className="text-[#1A6B4A] text-sm font-bold">Vouched by {cook.vouchCount} {cook.vouchCount === 1 ? 'client' : 'clients'}</span>
          </div>
        )}

        {/* 2x2 Meta Grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-8 mt-2">
          <div className="flex items-center gap-3 text-[#1A1917]">
            <MapPin className="w-4 h-4 text-[#A8A69F]" />
            <span className="text-sm font-medium">{cook.location}</span>
          </div>
          <div className="flex items-center gap-3 text-[#1A1917]">
            <Clock className="w-4 h-4 text-[#A8A69F]" />
            <span className="text-sm font-medium">Daily, 7–10am</span>
          </div>
          <div className="flex items-center gap-3 text-[#1A1917]">
            <User className="w-4 h-4 text-[#A8A69F]" />
            <span className="text-sm font-medium">{cook.dietary_preferences?.[0] || 'Veg only'}</span>
          </div>
          <div className="flex items-center gap-3 text-[#1A1917]">
            <BarChart3 className="w-4 h-4 text-[#A8A69F]" />
            <span className="text-sm font-medium">~12 bookings/mo</span>
          </div>
        </div>

        {/* Rating Line */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex text-[#C17B2A]">
            {'★★★★★'.split('').map((s, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.round(cook.averageRating) ? 'fill-current' : 'text-[#E5E0D8]'}`} />
            ))}
          </div>
          <span className="text-lg font-bold text-[#1A1917]">{cook.averageRating > 0 ? cook.averageRating.toFixed(1) : 'New'}</span>
          <span className="text-sm text-[#A8A69F] font-medium">· {cook.reviewCount || 0} reviews</span>
        </div>

        {/* Pricing Overlay Block */}
        <div className="bg-[#F8F6F2] rounded-[24px] p-6 mb-4">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="text-[10px] font-bold text-[#A8A69F] uppercase tracking-wider mb-1">Price / meal</div>
              {user ? (
                <div className="text-base font-bold text-[#1A1917] whitespace-nowrap">{cook.price_range}</div>
              ) : (
                <div className="text-base font-bold text-[#1A1917] blur-sm select-none">₹380–480</div>
              )}
            </div>
            <div className="flex-1 text-right">
              <div className="text-[10px] font-bold text-[#A8A69F] uppercase tracking-wider mb-1">Contact</div>
              {user ? (
                <div className="text-base font-bold text-[#1A1917] whitespace-nowrap overflow-hidden text-ellipsis">
                  {cook.contact}
                </div>
              ) : (
                <div className="text-base font-bold text-[#1A1917] blur-sm select-none">+91 98765</div>
              )}
            </div>
          </div>

          {!user && (
            <button 
              onClick={() => gLogin()}
              className="w-full bg-[#1A1917] hover:bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
            >
              <div className="bg-white p-1.5 rounded-full shrink-0 shadow-sm">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              </div>
              Sign in with Google to view
            </button>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-4 mt-6">
          <button 
            onClick={() => {
              if (!user) { gLogin(); return; }
              navigate(`/cook/${cook._id}`);
            }}
            className="flex-1 bg-[#1A1917] hover:bg-black text-white py-4 rounded-2xl font-bold transition-all shadow-md active:scale-95"
          >
            View profile
          </button>
          <button 
            onClick={() => {
              if (!user) { gLogin(); return; }
              setIsModalOpen(true);
            }}
            className="flex-1 bg-white border border-[#E5E0D8] hover:bg-[#F7F4EE] text-[#1A1917] py-4 rounded-2xl font-bold transition-all active:scale-95"
          >
            Reviews ({cook.reviewCount || 0})
          </button>
        </div>
      </div>
      
      {isModalOpen && (
        <ReviewModal cook={cook} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
