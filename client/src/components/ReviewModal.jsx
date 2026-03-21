import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, Star, MessageSquare } from 'lucide-react';

export default function ReviewModal({ cook, onClose }) {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{cook.name}'s Reviews</h2>
            <p className="text-sm text-gray-500">{cook.cuisine} • {cook.location}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
          
          {/* Write a Review Section */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-primary-500" />
              Write a Review
            </h3>
            {user ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">{error}</div>}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star className={`w-7 h-7 ${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2 text-sm"
                    placeholder="Describe your experience with this cook..."
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 bg-white rounded-md border border-dashed border-gray-300">
                <p className="text-gray-500 text-sm">Please sign in with Google to leave a review!</p>
              </div>
            )}
          </div>

          {/* Reviews List Section */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 px-1">Recent Reviews ({reviews.length})</h3>
            
            {loading ? (
              <p className="text-center text-gray-500 py-4 animate-pulse">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-100">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {review.userId?.avatar ? (
                          <img src={review.userId.avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-xs text-primary-700 font-bold">{review.userId?.name?.charAt(0) || '?'}</span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">{review.userId?.name || 'Anonymous User'}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3.5 h-3.5 ${review.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    
                    {review.comment && <p className="text-sm text-gray-600 mt-2">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
