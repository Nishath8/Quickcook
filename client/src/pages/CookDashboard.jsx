import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChefHat, Image as ImageIcon, UploadCloud, Link as LinkIcon, Camera, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

export default function CookDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'dietary_preferences') {
      const updatedDiet = checked 
        ? [...(formData.dietary_preferences || []), value]
        : (formData.dietary_preferences || []).filter(d => d !== value);
      setFormData(prev => ({ ...prev, dietary_preferences: updatedDiet }));
    } else if (name.startsWith('avail_')) {
      const [_, day, slot] = name.split('_');
      const dayAvail = (formData.availability && formData.availability[day]) || [];
      const updatedDayAvail = checked 
        ? [...dayAvail, slot]
        : dayAvail.filter(s => s !== slot);
      setFormData(prev => ({
        ...prev,
        availability: { ...(prev.availability || {}), [day]: updatedDayAvail }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

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
          contact: myCook.contact || '',
          dietary_preferences: myCook.dietary_preferences || [],
          sample_menu: myCook.sample_menu || '',
          availability: myCook.availability || {
            "Mon": [], "Tue": [], "Wed": [], "Thu": [], "Fri": [], "Sat": [], "Sun": []
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setProfileUploading(true);
    const form = new FormData();
    form.append('image', file);

    try {
      const uploadRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/cooks/upload`,
        form,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      
      const newImageUrl = uploadRes.data.imageUrl;
      
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/cooks/profile/${profile._id}`,
        { profileImage: newImageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProfile({ ...profile, profileImage: newImageUrl });
      setMessage({ text: 'Profile photo updated!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Upload failed', type: 'error' });
    } finally {
      setProfileUploading(false);
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

  const handleDeleteImage = async (urlToDelete) => {
    if (!window.confirm('Are you sure you want to remove this masterpiece from your gallery?')) return;
    
    const updatedImages = profile.images.filter(url => url !== urlToDelete);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/cooks/profile/${profile._id}`,
        { images: updatedImages },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile({ ...profile, images: updatedImages });
      setMessage({ text: 'Image removed from gallery', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to delete image', type: 'error' });
    }
  };

  const handleMoveImage = async (index, direction) => {
    const newImages = [...profile.images];
    if (direction === 'left' && index > 0) {
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    } else if (direction === 'right' && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    } else {
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/cooks/profile/${profile._id}`,
        { images: newImages },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile({ ...profile, images: newImages });
    } catch (err) {
      setMessage({ text: 'Failed to reorder images', type: 'error' });
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

      {/* Vouch Request Section (New) */}
      <div className="mb-12 bg-green-50 border border-green-100 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-green-900 mb-2 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Boost your reputation with Vouches
          </h3>
          <p className="text-green-700 text-sm leading-relaxed max-w-xl">
            Ask past clients to vouch for your cooking. Profiles with 3+ vouches get 5x more inquiries in Indiranagar and Koramangala.
          </p>
        </div>
        <button 
          onClick={() => {
            const text = `Hi! I'm listing my services on Quickcook. Since I've cooked for you before, would you mind vouching for me here? ${window.location.origin}/cook/${profile._id}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          }}
          className="bg-[#1A6B4A] hover:bg-[#2D8C60] text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-3 shrink-0"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          Request on WhatsApp
        </button>
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
        <form onSubmit={handleUpdate} className="lg:col-span-2">
          <div className="bg-white p-10 rounded-[32px] border border-[#E5E0D8] shadow-sm">
            <h2 className="text-2xl font-serif font-bold text-[#1A1917] mb-10 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#F7F4EE] flex items-center justify-center text-sm font-sans">01</span>
              Profile Info
            </h2>

            {/* Profile Photo Upload */}
            <div className="mb-10 flex flex-col sm:flex-row items-center gap-6 p-6 bg-[#F7F4EE]/30 rounded-3xl border border-[#E5E0D8]">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-white flex items-center justify-center text-3xl font-serif text-[#1A6B4A]">
                  {profile.profileImage ? (
                    <img src={getImageUrl(profile.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    profile.name?.charAt(0).toUpperCase() || 'C'
                  )}
                </div>
                {profileUploading && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-[#1A1917] mb-1">Your Profile Photo</h4>
                <p className="text-xs text-[#6E6C67] mb-4">This photo will be displayed on your card and profile page.</p>
                <input
                  type="file"
                  id="profile-image-upload"
                  onChange={handleProfilePhotoUpload}
                  className="hidden"
                  accept="image/*"
                />
                <label 
                  htmlFor="profile-image-upload"
                  className="inline-flex items-center px-4 py-2 bg-white border border-[#E5E0D8] rounded-xl text-xs font-bold text-[#1A1917] cursor-pointer hover:bg-gray-50 transition-all shadow-sm active:scale-95 gap-2"
                >
                  <Camera className="w-4 h-4 text-[#1A6B4A]" />
                  {profile.profileImage ? 'Change Photo' : 'Upload Photo'}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="sm:col-span-2">
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-3 block">Professional Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4.5 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all text-[#1A1917] bg-[#F7F4EE]/20 font-medium"
                />
              </div>

              <div>
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-3 block">City / Neighborhood</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4.5 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all text-[#1A1917] bg-[#F7F4EE]/20 font-medium"
                />
              </div>

              <div>
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-3 block">Verified Specialties</label>
                <input
                  type="text"
                  name="cuisine"
                  value={formData.cuisine || ''}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4.5 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all text-[#1A1917] bg-[#F7F4EE]/20 font-medium"
                />
              </div>

              <div>
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-3 block">Public Contact</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact || ''}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4.5 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all text-[#1A1917] bg-[#F7F4EE]/20 font-medium"
                />
              </div>

              <div>
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-3 block">Price Indicator</label>
                <select
                  name="price_range"
                  value={formData.price_range || ''}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4.5 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all text-[#1A1917] bg-[#F7F4EE]/20 font-medium"
                >
                  <option value="">Select range</option>
                  <option value="₹250 - ₹500">₹250 - ₹500 (Value)</option>
                  <option value="₹500 - ₹1,000">₹500 - ₹1,000 (Standard)</option>
                  <option value="₹1,000 - ₹2,000">₹1,000 - ₹2,000 (Premium)</option>
                  <option value="₹2,000+">₹2,000+ (Elite)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-4 block">Dietary Specialties</label>
                <div className="flex flex-wrap gap-4">
                  {['Veg', 'Non-Veg', 'Vegan', 'Jain'].map(diet => (
                    <label key={diet} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        name="dietary_preferences"
                        value={diet}
                        checked={formData.dietary_preferences?.includes(diet)}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <div className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                        formData.dietary_preferences?.includes(diet) 
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
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-2 block">Sample Menu / Featured Dishes</label>
                <textarea
                  name="sample_menu"
                  value={formData.sample_menu || ''}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-6 py-4.5 border border-[#E5E0D8] rounded-2xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all text-[#1A1917] bg-[#F7F4EE]/20 font-medium resize-none"
                  placeholder="Tell clients what you cook best..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[#6E6C67] text-[11px] font-bold uppercase tracking-widest mb-4 block">Weekly Schedule</label>
                <div className="overflow-x-auto bg-[#F7F4EE]/40 rounded-3xl p-6 border border-[#E5E0D8]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="pb-4 text-[10px] text-[#A8A69F] uppercase tracking-widest">Day</th>
                        {['Morning', 'Afternoon', 'Evening'].map(slot => (
                          <th key={slot} className="pb-4 text-[10px] text-[#A8A69F] uppercase tracking-widest text-center">{slot}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <tr key={day} className="border-t border-[#E5E0D8]/40">
                          <td className="py-3 text-xs font-bold text-[#1A1917]">{day}</td>
                          {['Morning', 'Afternoon', 'Evening'].map(slot => (
                            <td key={slot} className="py-3 text-center">
                              <label className="inline-block p-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name={`avail_${day}_${slot}`}
                                  checked={(formData.availability && formData.availability[day] || []).includes(slot)}
                                  onChange={handleInputChange}
                                  className="w-5 h-5 accent-[#1A6B4A] rounded-lg cursor-pointer"
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
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-12 bg-[#1A1917] hover:bg-black text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-3 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Commit Changes'}
              {!saving && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>}
            </button>
          </div>
        </form>

        {/* Portfolio / Images */}
        <div className="lg:col-span-1">
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
                  <UploadCloud className="w-5 h-5 mx-auto text-[#6E6C67] group-hover:text-[#1A6B4A] mb-2" />
                  <span className="text-xs font-bold text-[#6E6C67] group-hover:text-[#1A1917]">
                    {uploadFile ? uploadFile.name : 'Choose Masterpiece'}
                  </span>
                </div>
              </label>

              <button
                onClick={handleImageUpload}
                disabled={!uploadFile || uploading}
                className="w-full bg-[#1A6B4A] text-white p-4.5 rounded-2xl font-bold text-sm shadow-md hover:bg-[#2D8C60] transition-all active:scale-[0.98] disabled:opacity-40"
              >
                {uploading ? 'Uploading...' : 'Publish Photo'}
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-[#E5E0D8]">
              <div className="grid grid-cols-2 gap-4">
                {profile.images && profile.images.length > 0 ? profile.images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl border border-[#E5E0D8] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow group relative">
                    <img 
                      src={getImageUrl(img)} 
                      alt={`Food ${i}`} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-2">
                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleDeleteImage(img)}
                          className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                          title="Remove Image"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      
                      <div className="flex justify-center gap-2">
                        {i > 0 && (
                          <button 
                            onClick={() => handleMoveImage(i, 'left')}
                            className="p-1.5 bg-white/20 text-white rounded-lg hover:bg-white/40 backdrop-blur-md transition-colors"
                            title="Move Earlier"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                          </button>
                        )}
                        {i < profile.images.length - 1 && (
                          <button 
                            onClick={() => handleMoveImage(i, 'right')}
                            className="p-1.5 bg-white/20 text-white rounded-lg hover:bg-white/40 backdrop-blur-md transition-colors"
                            title="Move Later"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
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
