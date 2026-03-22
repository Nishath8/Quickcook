import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChefHat, Image as ImageIcon, UploadCloud, Link as LinkIcon, Camera } from 'lucide-react';

export default function CookDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchMyProfile();
  }, [user]);

  const fetchMyProfile = async () => {
    try {
      // Find cook profile matching this user via search or custom endpoint
      // We will search all cooks because we don't have a specific `GET /cooks/my-profile` endpoint, 
      // but wait, MongoDB _id is needed.
      // Actually, since `/admin/cooks` returns all Cooks but requires no admin token on GET right now?
      // Wait, `/cooks` returns approved cooks. We should fetch all cooks.
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/cooks`);
      // Find cook profile matching this user. Ensure we compare as strings.
      const myCook = res.data.find(c => c.userId?.toString() === user.id?.toString());
      
      if (myCook) {
        setProfile(myCook);
        setFormData({
          name: myCook.name,
          location: myCook.location,
          cuisine: myCook.cuisine,
          price_range: myCook.price_range || '',
          contact: myCook.contact || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/cooks/profile/${profile._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    
    setUploading(true);
    const form = new FormData();
    form.append('image', uploadFile);

    try {
      const uploadRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/cooks/upload`,
        form,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      
      const newImageUrl = uploadRes.data.imageUrl;
      const newImagesArray = [...(profile.images || []), newImageUrl];
      
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/cooks/profile/${profile._id}`,
        { images: newImagesArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProfile({ ...profile, images: newImagesArray });
      setUploadFile(null);
      setMessage({ text: 'Image uploaded successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Upload failed', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Loading dashboard...</div>;

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center animate-fade-in-up">
        <ChefHat className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Cook Profile Found</h2>
        <p className="text-gray-500 mb-6">You don't have an active cook profile linked to this Google account.</p>
        <button onClick={() => navigate('/add')} className="btn-primary">
          List your services
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Provider Dashboard</h1>
        <p className="text-gray-500 mt-2">Manage your cook profile, update availability, and upload proof of work.</p>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 border rounded-lg font-medium text-sm flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: Edits */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Profile Information</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
                  <input type="text" value={formData.cuisine} onChange={e => setFormData({...formData, cuisine: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <input type="text" value={formData.price_range} onChange={e => setFormData({...formData, price_range: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. ₹380–480 / meal" required />
                </div>
              </div>
              <button type="submit" disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors mt-2 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Images */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-primary-500" /> Image Portfolio
            </h2>
            <p className="text-sm text-gray-500 mb-4">Upload pictures of your dishes to attract more clients.</p>
            
            <form onSubmit={handleImageUpload} className="mb-6 space-y-3">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
              />
              <button 
                type="submit" 
                disabled={!uploadFile || uploading}
                className="w-full bg-[#1C1A17] hover:bg-black text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {uploading ? 'Uploading...' : <><UploadCloud className="w-4 h-4 mr-2"/> Upload Photo</>}
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2">
              {profile.images && profile.images.map((imgUrl, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group">
                  <img src={`${import.meta.env.VITE_API_BASE_URL}${imgUrl}`} alt="dish" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {(!profile.images || profile.images.length === 0) && (
              <div className="text-center bg-gray-50 py-6 rounded-lg border border-dashed border-gray-200">
                <p className="text-xs text-gray-400">No images uploaded yet</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
