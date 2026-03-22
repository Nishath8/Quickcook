import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import ReviewModal from './ReviewModal';

export default function CookCard({ cook }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
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
    <div className="cook-card overflow-hidden">
      {cook.status === 'approved' && (
        <div className="preview-tag ml-6 mt-6 mb-[-10px] w-max">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#1A6B4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Verified cook
        </div>
      )}
      
      <div className="card-body pb-0 pt-4">
        <div className="card-head">
          <div className={`av-circle ${getAvatarClass()}`}>{initials}</div>
          <div>
            <div className="card-name-text text-lg font-bold">{cook.name}</div>
            <div className="card-cuisine-text text-gray-500">{cook.cuisine}</div>
            <div className="v-badge" style={{marginTop:'4px'}}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#1A6B4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Background checked
            </div>
          </div>
        </div>
        
        {cook.vouchCount > 0 && (
          <div className="vouch-strip bg-green-50 rounded-lg p-2 flex items-center mb-4">
            <span className="vouches-text ml-2 text-green-800 text-sm font-medium">Vouched by {cook.vouchCount} past clients</span>
          </div>
        )}

        <div className="card-meta-grid text-sm text-gray-600 space-y-2 mb-4">
          <div className="cm flex items-center space-x-2"><svg className="w-4 h-4 text-gray-400" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.79 1 3 2.79 3 5c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="5" r="1.2" stroke="currentColor" strokeWidth="1.2"/></svg><span>{cook.location}</span></div>
        </div>

        <div className="card-stars flex items-center space-x-2 mb-4">
          <span className="text-yellow-500 text-sm tracking-widest">
            {cook.averageRating > 0 ? '★'.repeat(Math.round(cook.averageRating)) + '☆'.repeat(5 - Math.round(cook.averageRating)) : '☆☆☆☆☆'}
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {cook.averageRating > 0 ? cook.averageRating.toFixed(1) : 'New'}
          </span>
          <span className="text-sm text-gray-500">· {cook.reviewCount} reviews</span>
        </div>

        <div className="card-locked bg-[#F8F6F2] -mx-6 px-6 py-5 rounded-lg mb-4 text-sm mt-2">
          <div className="card-locked-fields flex w-full pb-2">
            <div className="flex-1">
              <div className="clf-label text-gray-500 mb-1">Price / meal</div>
              {user ? <div className="clf-value font-medium text-gray-900">{cook.price_range}</div> : <div className="clf-blur filter blur-sm select-none text-gray-300">₹380–480</div>}
            </div>
            <div className="flex-1">
              <div className="clf-label text-gray-500 mb-1">Contact</div>
              {user && cook.contact ? (
                <div className="clf-value text-gray-900">
                  <a href={`tel:${cook.contact.replace(/[^\d+]/g, '')}`}>{cook.contact}</a>
                </div>
              ) : (
                <div className="clf-blur filter blur-sm select-none text-gray-300">+91 98765</div>
              )}
            </div>
          </div>
          
          {!user && (
            <div className="mt-3 w-full">
              <button 
                className="btn-signin w-full bg-[#1C1A17] hover:bg-black text-white rounded-lg py-2.5 flex items-center justify-center font-medium transition-colors"
                onClick={() => gLogin()}
              >
                <div className="g-icon bg-white p-1 rounded-full mr-3 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                </div>
                Sign in with Google to view
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="card-foot flex space-x-3 w-full border-t border-gray-100 p-4">
        <button 
          className="flex-1 bg-[#1C1A17] hover:bg-black text-white py-2.5 rounded-lg text-sm font-semibold transition-colors outline-none"
          onClick={() => {
            if (!user) { gLogin(); return; }
            navigate(`/cook/${cook._id}`);
          }}
        >
          View profile
        </button>
        <button 
          className="flex-1 bg-white border border-[#E5E0D8] hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-sm transition-colors outline-none"
          onClick={() => {
            if (!user) { gLogin(); return; }
            setIsModalOpen(true);
          }}
        >
          Reviews ({cook.reviewCount})
        </button>
      </div>
      
      {isModalOpen && (
        <ReviewModal cook={cook} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
