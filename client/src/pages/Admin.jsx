import { useState, useEffect } from 'react';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('adminAuth') === 'true';
  });
  const [password, setPassword] = useState('');

  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Feature State
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (isLoggedIn) {
      fetchCooks();
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsLoggedIn(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Incorrect password');
    }
  };

  const deleteCookFn = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this cook profile?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/cooks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete cook');
      
      setCooks((prevCooks) => prevCooks.filter((cook) => cook._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (cook) => {
    setEditingId(cook._id);
    setEditData({
      name: cook.name || '',
      location: cook.location || '',
      cuisine: cook.cuisine || '',
      contact: cook.contact || '',
      price_range: cook.price_range || '',
    });
  };

  const handleEditChange = (e, field) => {
    setEditData({ ...editData, [field]: e.target.value });
  };

  const saveEdit = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/cooks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!response.ok) throw new Error('Failed to update cook details');
      
      setCooks((prevCooks) =>
        prevCooks.map((cook) =>
          cook._id === id ? { ...cook, ...editData } : cook
        )
      );
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchCooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/cooks`);
      if (!response.ok) throw new Error('Failed to fetch cooks');
      const data = await response.json();
      setCooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCookStatus = async (id, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/cooks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(`Failed to ${status} cook`);
      
      setCooks((prevCooks) =>
        prevCooks.map((cook) =>
          cook._id === id ? { ...cook, status } : cook
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="bg-white rounded-[24px] p-10 border border-[#E5E0D8] shadow-sm animate-fade-in-up">
          <h2 className="text-3xl font-serif font-bold text-[#1A1917] text-center mb-2">Admin Panel</h2>
          <p className="text-center text-sm mb-8 text-[#A8A69F]">Restricted access. Please authenticate.</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[#6E6C67] text-xs font-semibold mb-2 block uppercase tracking-wider">Security Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 border border-[#E5E0D8] rounded-xl focus:ring-1 focus:ring-[#1A6B4A] focus:border-[#1A6B4A] outline-none transition-all placeholder-[#A8A69F] text-[#1A1917] bg-[#F7F4EE]"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#1A1917] hover:bg-black text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-20 font-serif text-xl animate-pulse">Loading applications...</div>;
  if (error) return <div className="text-red-500 text-center py-20">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fade-in-up">
      <div className="flex justify-between items-end mb-10 border-b border-[#E5E0D8] pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#1A1917]">Moderation Table</h1>
          <p className="text-[#6E6C67] mt-2">Manage cook applications and profile verification status.</p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('adminAuth');
            setIsLoggedIn(false);
          }}
          className="text-sm px-6 py-2.5 hover:bg-[#F7F4EE] text-[#1A1917] font-semibold rounded-xl transition-all border border-[#E5E0D8] shadow-sm active:scale-95"
        >
          Logout Admin
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-[#E5E0D8]">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#E5E0D8]">
          <table className="min-w-full">
            <thead className="bg-[#F7F4EE]">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-bold text-[#6E6C67] uppercase tracking-widest border-b border-[#E5E0D8]">Name</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-[#6E6C67] uppercase tracking-widest border-b border-[#E5E0D8]">Location & Cuisine</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-[#6E6C67] uppercase tracking-widest border-b border-[#E5E0D8]">Details</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-[#6E6C67] uppercase tracking-widest border-b border-[#E5E0D8]">Status</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-[#6E6C67] uppercase tracking-widest border-b border-[#E5E0D8]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F4EE]">
              {cooks.map((cook) => (
                <tr key={cook._id} className="hover:bg-[#FCFBF9] transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-base font-bold text-[#1A1917] group-hover:text-[#1A6B4A] transition-colors">{cook.name}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium text-[#3D3C39]">{cook.location}</div>
                    <div className="text-xs text-[#A8A69F] mt-1 italic">{cook.cuisine}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-[#3D3C39] font-medium">{cook.contact || 'No contact'}</div>
                    <div className="text-xs text-[#A8A69F] mt-1">{cook.price_range || 'No price'}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 inline-flex text-[10px] leading-5 font-bold rounded-full uppercase tracking-tighter shadow-sm border ${
                        cook.status === 'approved' ? 'bg-[#E4F2EA] text-[#1A6B4A] border-[#CEEBDC]'
                        : cook.status === 'denied' ? 'bg-[#FAECE7] text-[#7B3322] border-[#F2DDD7]'
                        : 'bg-[#FBF0DF] text-[#C17B2A] border-[#F5E6CC]'
                      }`}
                    >
                      {cook.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-3">
                      {cook.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateCookStatus(cook._id, 'approved')}
                            className="bg-[#1A6B4A] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#2D8C60] transition-all shadow-md active:scale-95"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateCookStatus(cook._id, 'denied')}
                            className="bg-white text-[#7B3322] border border-[#F2DDD7] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#FAECE7] transition-all active:scale-95"
                          >
                            Deny
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleEditClick(cook)}
                        className="text-[#3D3C39] hover:text-[#1A1917] p-2 hover:bg-[#F7F4EE] rounded-lg transition-all"
                        title="Edit Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      
                      <button
                        onClick={() => deleteCookFn(cook._id)}
                        className="text-[#7B3322]/40 hover:text-[#7B3322] p-2 hover:bg-[#FAECE7] rounded-lg transition-all"
                        title="Delete Permanently"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {cooks.length === 0 && (
          <div className="text-center py-20 text-[#A8A69F] font-serif italic">No cook applications found in the archives.</div>
        )}
      </div>
    </div>
  );
}
