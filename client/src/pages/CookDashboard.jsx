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
    <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in-up">
      <div className="mb-12 border-b border-[#E5E0D8] pb-10">
        <h1 className="text-5xl font-serif font-bold text-[#1A1917] mb-3">Provider Dashboard</h1>
        <p className="text-[#6E6C67] text-lg font-light tracking-wide italic">Manage your cook profile, update availability, and upload proof of work.</p>
      </div>

      {message.text && (
        <div className={`mb-10 p-5 rounded-2xl flex items-center border shadow-sm ${
          message.type === 'success' ? 'bg-[#E4F2EA] text-[#1A6B4A] border-[#CEEBDC]' : 'bg-[#FAECE7] text-[#7B3322] border-[#F2DDD7]'
        }`}>
          {message.type === 'success' ? <div className="bg-[#1A6B4A] p-1 rounded-full mr-3 text-white"><CheckCircle className="w-4 h-4" /></div> : <AlertCircle className="w-5 h-5 mr-3 shrink-0" />}
          <span className="font-semibold text-sm">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Info Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-10 rounded-[32px] border border-[#E5E0D8] shadow-sm">
            <h2 className="text-2xl font-serif font-bold text-[#1A1917] mb-10 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#F7F4EE] flex items-center justify-center text-sm font-sans">01</span>
              Secretariat / Profile Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="sm:col-span-2">
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-3 block">Professional Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4.5 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all text-[#1A1917] bg-[#F7F4EE]/20 font-medium"
                />
              </div>

              <div>
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-3 block">City / Neighborhood</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4.5 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all text-[#1A1917] bg-[#F7F4EE]/20 font-medium"
                />
              </div>

              <div>
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-3 block">Verified Specialties</label>
                <input
                  type="text"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4.5 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all text-[#1A1917] bg-[#F7F4EE]/20 font-medium"
                />
              </div>

              <div>
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-3 block">Public Contact</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4.5 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all text-[#1A1917] bg-[#F7F4EE]/20 font-medium"
                />
              </div>

              <div>
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-3 block">Price Indicator</label>
                <select
                  name="price_range"
                  value={formData.price_range}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4.5 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all text-[#1A1917] bg-[#F7F4EE]/20 font-medium"
                >
                  <option value="$">$ (Value)</option>
                  <option value="$$">$$ (Standard)</option>
                  <option value="$$$">$$$ (Premium)</option>
                  <option value="$$$$">$$$$ (Elite)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-12 bg-[#1A1917] hover:bg-black text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-3 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Commit Changes'}
              {!saving && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>}
            </button>
          </div>
        </div>

        {/* Portfolio / Images */}
        <div>
          <div className="bg-[#F7F4EE] p-8 rounded-[32px] border border-[#E5E0D8] sticky top-24">
            <h2 className="text-xl font-serif font-bold text-[#1A1917] mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-[#1A6B4A]" />
              </div>
              Portfolio Gallery
            </h2>
            <p className="text-[#6E6C67] text-sm mb-8 leading-relaxed font-light">
              Upload stunning pictures of your dishes to attract more discerning clients.
            </p>

            <div className="space-y-4">
              <input
                type="file"
                id="image-upload"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <label 
                htmlFor="image-upload"
                className="w-full flex items-center justify-center p-4 border-2 border-dashed border-[#E5E0D8] rounded-2xl cursor-pointer hover:border-[#1A6B4A] hover:bg-white transition-all group"
              >
                <div className="text-center">
                  <Upload className="w-5 h-5 mx-auto text-[#6E6C67] group-hover:text-[#1A6B4A] mb-2" />
                  <span className="text-xs font-bold text-[#6E6C67] group-hover:text-[#1A1917]">
                    {selectedFile ? selectedFile.name : 'Choose Masterpiece'}
                  </span>
                </div>
              </label>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploadLoading}
                className="w-full bg-[#1A6B4A] text-white p-4.5 rounded-2xl font-bold text-sm shadow-md hover:bg-[#2D8C60] transition-all active:scale-[0.98] disabled:opacity-40"
              >
                {uploadLoading ? 'Uploading...' : 'Publish Photo'}
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-[#E5E0D8]">
              <div className="grid grid-cols-2 gap-4">
                {profile.images && profile.images.length > 0 ? profile.images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl border border-[#E5E0D8] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow group relative">
                    <img 
                      src={`${import.meta.env.VITE_API_BASE_URL}${img}`} 
                      alt={`Food ${i}`} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )) : (
                  <div className="col-span-2 py-10 text-center border-2 border-dashed border-[#E5E0D8] rounded-2xl">
                    <p className="text-xs text-[#A8A69F] font-serif italic">Gallery empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
