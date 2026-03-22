import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, Star, MessageSquare, Trash2 } from 'lucide-react';

export default function ReviewModal({ cook, onClose }) {
  const { user, token } = useAuth();
  const isAdmin = localStorage.getItem('adminAuth') === 'true';
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [writeMode, setWriteMode] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [cook._id]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/reviews/${cook._id}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/reviews/${reviewId}`);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/reviews`,
        { cookId: cook._id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment('');
      setRating(5);
      setWriteMode(false);
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-[#E5E0D8] animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#F7F4EE] flex justify-between items-center bg-[#F7F4EE]/50">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#1A1917]">{cook.name}'s Reviews</h2>
            <p className="text-sm text-[#6E6C67] mt-1 font-light italic">{cook.cuisine} • {cook.location}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 text-[#A8A69F] hover:text-[#1A1917] rounded-full hover:bg-white transition-all shadow-sm active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-white custom-scrollbar relative">
          
          {/* Write Mode Overlay */}
          {writeMode && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-[110] p-8 flex flex-col animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-[#1A1917]">Your Experience</h3>
                <button 
                  onClick={() => setWriteMode(false)}
                  className="p-2 text-[#A8A69F] hover:text-[#1A1917] rounded-full hover:bg-[#F7F4EE] transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 flex-1">
                {error && <div className="p-4 text-xs font-bold text-[#7B3322] bg-[#FAECE7] rounded-xl border border-[#F2DDD7]">{error}</div>}
                
                <div className="bg-[#F7F4EE] p-6 rounded-2xl border border-[#E5E0D8]">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#A8A69F] mb-4">Rating</label>
                  <div className="flex space-x-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-all hover:scale-125 active:scale-90"
                      >
                        <Star className={`w-10 h-10 ${rating >= star ? 'text-[#C17B2A] fill-current' : 'text-[#D1D0CB]'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#A8A69F] mb-3 px-1">Describe your meal</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 w-full rounded-2xl border-2 border-[#F7F4EE] focus:border-[#1A6B4A] outline-none transition-all p-6 text-lg bg-[#F7F4EE]/30 placeholder-[#A8A69F] resize-none"
                    placeholder="Was the spices right? How was the service?"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#1A6B4A] hover:bg-[#2D8C60] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-green-100 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? 'Publishing your review...' : 'Share Review'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Review List Header / Write Trigger */}
          <div className="flex items-center justify-between pb-6 border-b border-[#F7F4EE]">
            <h3 className="text-2xl font-serif font-bold text-[#1A1917]">Voice of Clients <span className="text-[#A8A69F] font-normal text-base ml-2">({reviews.length})</span></h3>
            {user ? (
              <button 
                onClick={() => setWriteMode(true)}
                className="bg-[#1A1917] hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Write a Review
              </button>
            ) : (
              <p className="text-[#A8A69F] text-xs font-medium italic">Sign in to leave a review</p>
            )}
          </div>
            
            {loading ? (
              <div className="space-y-4">
                <div className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
                <div className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border-2 border-dashed border-[#E5E0D8]">
                <p className="text-[#A8A69F] font-serif italic">No stories shared yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-white p-6 rounded-2xl border border-[#E5E0D8] hover:border-[#1A6B4A]/30 transition-all group relative">
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteReview(review._id)}
                        className="absolute top-4 right-4 p-2 text-[#A8A69F] hover:text-[#7B3322] hover:bg-[#FAECE7] rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Review (Admin Only)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {review.userId?.avatar ? (
                          <img src={review.userId.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-[#E5E0D8]" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#F7F4EE] flex items-center justify-center border border-[#E5E0D8]">
                            <span className="text-xs text-[#1A1917] font-bold uppercase">{review.userId?.name?.charAt(0) || '?'}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-[#1A1917]">{review.userId?.name || 'Quickcook Client'}</p>
                          <div className="flex items-center mt-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-3 h-3 ${review.rating >= star ? 'text-[#C17B2A] fill-current' : 'text-[#E5E0D8]'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8A69F]">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    
                    {review.comment && (
                      <p className="text-sm text-[#3D3C39] leading-relaxed font-light italic pl-12 border-l-2 border-[#1A6B4A]/10 ml-4 py-1">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

      </div>
    </div>
  );
}
