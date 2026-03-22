import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Utensils, DollarSign, Phone, Star, ShieldCheck, ChevronLeft, Image as ImageIcon } from 'lucide-react';

export default function CookProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [cook, setCook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchCookData();
  }, [id, user]);

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
                <span className="flex items-center"><DollarSign className="w-4 h-4 mr-0.5 opacity-70" /> {cook.price_range} per meal</span>
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
          <div className="flex items-center bg-white px-4 py-2 border border-gray-200 rounded-lg shadow-sm">
            <Phone className="w-4 h-4 text-primary-600 mr-2" />
            <a href={`tel:${cook.contact.replace(/[^\d+]/g, '')}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
              {cook.contact}
            </a>
          </div>
        </div>

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
          <h2 className="text-xl font-bold text-gray-900 mb-6">Client Reviews ({reviews.length})</h2>
          
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
                        <div className="text-sm font-bold text-gray-900 leading-tight">{review.userId?.name || 'Anonymous User'}</div>
                        <div className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${review.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
