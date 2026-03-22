import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Utensils, DollarSign, Phone, Star, ShieldCheck, ChevronLeft, Image as ImageIcon, Clock } from 'lucide-react';

export default function CookProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [cook, setCook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCookData();
  }, [id]);

  const fetchCookData = async () => {
    setLoading(true);
    try {
      const cookRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cooks/${id}`);
      setCook(cookRes.data);
      
      const reviewRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/reviews/${id}`);
      setReviews(reviewRes.data);
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-500 animate-pulse">Loading profile...</div>;
  if (error || !cook) return <div className="p-20 text-center text-red-500">{error}</div>;

  const initials = cook.name?.[0]?.toUpperCase() || 'C';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium">
        <ChevronLeft className="w-5 h-5 mr-1" /> Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-[#1C1A17] p-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center text-4xl font-bold shadow-lg shadow-black/20 shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold">{cook.name}</h1>
                {cook.status === 'approved' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Verified cook
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-300 font-medium">
                <span className="flex items-center"><Utensils className="w-4 h-4 mr-1.5 opacity-70" /> {cook.cuisine}</span>
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 opacity-70" /> {cook.location}</span>
                <span className="flex items-center"><DollarSign className="w-4 h-4 mr-0.5 opacity-70" /> {cook.price_range}</span>
                {cook.dietary_preferences?.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="opacity-50">•</span>
                    {cook.dietary_preferences.map(diet => (
                      <span key={diet} className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                        diet === 'Veg' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        diet === 'Non-Veg' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {diet}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-xl border border-white/10 shrink-0 text-center min-w-[120px]">
              <div className="text-yellow-400 flex justify-center mb-1 text-lg">
                {cook.averageRating > 0 ? '★'.repeat(Math.round(cook.averageRating)) + '☆'.repeat(5 - Math.round(cook.averageRating)) : '☆☆☆☆☆'}
              </div>
              <div className="font-bold text-xl">{cook.averageRating > 0 ? cook.averageRating.toFixed(1) : 'New'}</div>
              <div className="text-xs text-gray-400 mt-0.5">{cook.reviewCount} reviews</div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="border-b border-gray-100 bg-[#F8F6F2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center text-green-700 font-medium text-sm">
             <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
               <ShieldCheck className="w-4 h-4 text-green-600" />
             </div>
             Vouched by {cook.vouchCount} past clients
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => {
                const text = `Hi ${cook.name}! I saw your profile on Quickcook and I'm interested in your ${cook.cuisine} services for ${cook.location}. Could we discuss a recurring schedule?`;
                window.open(`https://wa.me/${cook.contact.replace(/[^\d]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex items-center justify-center bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Inquire on WhatsApp
            </button>
            <div className="flex items-center bg-white px-4 py-2 border border-gray-200 rounded-xl shadow-sm">
              <Phone className="w-4 h-4 text-gray-400 mr-2" />
              <a href={`tel:${cook.contact.replace(/[^\d+]/g, '')}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                {cook.contact}
              </a>
            </div>
          </div>
        </div>

        {/* Sample Menu Section */}
        {cook.sample_menu && (
          <div className="p-8 border-b border-gray-100 bg-[#FBF0DF]/10">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Utensils className="w-5 h-5 mr-2 text-[#C17B2A]" />
              Sample Menu & Specialities
            </h2>
            <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] text-[#3D3C39] leading-relaxed whitespace-pre-wrap italic shadow-sm">
              "{cook.sample_menu}"
            </div>
          </div>
        )}

        {/* Availability Section */}
        {cook.availability && Object.values(cook.availability).some(slots => slots.length > 0) && (
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary-500" />
              Weekly Availability
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                const slots = cook.availability[day] || [];
                return (
                  <div key={day} className={`p-3 rounded-xl border ${slots.length > 0 ? 'bg-white border-primary-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-40'}`}>
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-2">{day}</div>
                    <div className="space-y-1">
                      {slots.length > 0 ? slots.map(slot => (
                        <div key={slot} className="text-[10px] font-bold text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded text-center">
                          {slot}
                        </div>
                      )) : (
                        <div className="text-[10px] text-gray-300 italic text-center">—</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Images/Proof Section */}
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-primary-500" />
            Portfolio & Proof of Work
          </h2>
          
          {cook.images && cook.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {cook.images.map((imgUrl, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center relative group">
                  <img src={`${import.meta.env.VITE_API_BASE_URL}${imgUrl}`} alt={`Dish ${idx+1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>This cook hasn't uploaded any photos of their dishes yet.</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="p-8 bg-gray-50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Client Reviews ({reviews.length})</h2>
            {reviews.filter(r => r.isVouch).length > 0 && (
              <div className="flex items-center gap-2 bg-[#1A6B4A]/10 px-4 py-2 rounded-full border border-[#1A6B4A]/20">
                <ShieldCheck className="w-4 h-4 text-[#1A6B4A]" />
                <span className="text-xs font-bold text-[#1A6B4A] uppercase tracking-wider">{reviews.filter(r => r.isVouch).length} Verified Vouches</span>
              </div>
            )}
          </div>
          
          {/* Featured Vouches Grid (Horizontal Scroll) */}
          {reviews.filter(r => r.isVouch).length > 0 && (
            <div className="mb-10">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Featured Vouches</p>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {reviews.filter(r => r.isVouch).map((vouch) => (
                  <div key={vouch._id} className="min-w-[280px] bg-white p-6 rounded-3xl border border-green-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3">
                      <ShieldCheck className="w-5 h-5 text-green-500/20 group-hover:text-green-500/40 transition-colors" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                       {vouch.userId?.avatar ? (
                        <img src={vouch.userId.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-green-50 shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                          <span className="text-sm text-green-700 font-bold">{vouch.userId?.name?.charAt(0) || '?'}</span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-gray-900 leading-tight">{vouch.userId?.name || 'Quickcook Client'}</div>
                        <div className="text-[10px] text-gray-400">Verified Client</div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm italic leading-relaxed">"{vouch.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {review.userId?.avatar ? (
                        <img src={review.userId.avatar} alt="Avatar" className="w-8 h-8 rounded-full shadow-sm" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm text-primary-700 font-bold">{review.userId?.name?.charAt(0) || '?'}</span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-gray-900 leading-tight flex items-center gap-2">
                          {review.userId?.name || 'Anonymous User'}
                          {review.isVouch && (
                             <span className="inline-flex items-center bg-green-100 text-green-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase border border-green-200">
                               <ShieldCheck className="w-2.5 h-2.5 mr-0.5 fill-current" />
                               Vouch
                             </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${review.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-600 text-sm italic">"{review.comment}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
