import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('adminAuth') === 'true';
  });

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };
  const [password, setPassword] = useState('');

  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Feature State
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Bulk Upload State
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkData, setBulkData] = useState([]); // Now an array of objects
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleBulkUpload = async () => {
    if (bulkData.length === 0) return;
    
    try {
      setUploadLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/bulk-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cooks: bulkData }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Bulk upload failed');

      alert(result.message);
      setBulkData([]);
      setShowBulkUpload(false);
      fetchCooks();
    } catch (err) {
      alert(err.message || 'Bulk upload failed. Please check your data.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        // Map alternate headers to schema fields
        const mappedData = json.map(row => {
          const findVal = (keys) => {
            const key = Object.keys(row).find(k => keys.includes(k.trim().toLowerCase()));
            return key ? row[key] : undefined;
          };

          return {
            name: findVal(['name', 'full name', 'cook name', 'provider']),
            location: findVal(['location', 'area', 'city', 'locality']),
            cuisine: findVal(['cuisine', 'specialty', 'type', 'food']),
            contact: findVal(['contact', 'phone', 'whatsapp', 'mobile']),
            price_range: findVal(['price', 'rate', 'price range', 'budget']),
            dietary_preferences: findVal(['dietary', 'veg/non-veg', 'pref']) ? [findVal(['dietary', 'veg/non-veg', 'pref'])] : ['Veg']
          };
        }).filter(item => item.name && item.location && item.cuisine);

        if (mappedData.length === 0) {
          alert("Could not find any valid cook data. Please ensure headers like 'Name', 'Location', and 'Cuisine' exist.");
        } else {
          setBulkData(mappedData);
          alert(`Success! Parsed ${mappedData.length} records. Please review the preview below before confirming.`);
        }
      } catch (err) {
        alert("Failed to parse file: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const copyTemplate = () => {
    const template = [
      {
        "name": "Meera Krishnan",
        "location": "Indiranagar",
        "cuisine": "South Indian",
        "price_range": "₹250 - ₹500",
        "contact": "+91 9876543210",
        "dietary_preferences": ["Veg"],
        "availability": {
          "Mon": ["Morning", "Afternoon"],
          "Tue": ["Afternoon"]
        }
      }
    ];
    setBulkData(JSON.stringify(template, null, 2));
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
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="text-sm px-6 py-2.5 bg-[#1A6B4A] hover:bg-[#2D8C60] text-white font-semibold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Bulk Upload
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('adminAuth');
              setIsLoggedIn(false);
            }}
            className="text-sm px-6 py-2.5 hover:bg-[#FAECE7] text-[#7B3322] font-semibold rounded-xl transition-all border border-[#F2DDD7] bg-white shadow-sm active:scale-95"
          >
            Logout Admin
          </button>
        </div>
      </div>

      {showBulkUpload && (
        <div className="mb-10 p-8 bg-white rounded-[24px] border border-[#E5E0D8] shadow-sm animate-fade-in-up">
          <div className="flex justify-between items-start mb-10 pb-6 border-b border-[#F7F4EE]">
            <div>
              <h3 className="text-2xl font-serif font-bold text-[#1A1917]">Bulk Data Import</h3>
              <p className="text-[#6E6C67] mt-1 max-w-lg">Upload an Excel or CSV file. We'll automatically detect headers like <strong>Name, Location, Cuisine, and Contact</strong>.</p>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".xlsx,.xls,.csv" 
              className="hidden" 
            />
            
            <button 
              onClick={() => fileInputRef.current.click()}
              className="px-6 py-3 bg-[#F7F4EE] hover:bg-[#E5E0D8] text-[#1A1917] font-bold rounded-xl transition-all flex items-center gap-3 border border-[#E5E0D8]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              Select Excel/CSV File
            </button>
          </div>

          {bulkData.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-[#1A6B4A] bg-[#E4F2EA] px-4 py-1.5 rounded-full">
                  Preview: {bulkData.length} cooks ready
                </span>
                <button 
                  onClick={() => setBulkData([])}
                  className="text-xs font-bold text-[#7B3322] hover:underline"
                >
                  Clear Selection
                </button>
              </div>
              
              <div className="border border-[#E5E0D8] rounded-xl overflow-hidden mb-8 max-h-60 overflow-y-auto bg-[#FDFCFB]">
                <table className="min-w-full text-xs">
                  <thead className="bg-[#F7F4EE] sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-[#6E6C67]">Name</th>
                      <th className="px-4 py-3 text-left font-bold text-[#6E6C67]">Location</th>
                      <th className="px-4 py-3 text-left font-bold text-[#6E6C67]">Cuisine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7F4EE]">
                    {bulkData.slice(0, 50).map((c, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2.5 font-bold text-[#1A1917]">{c.name}</td>
                        <td className="px-4 py-2.5 text-[#6E6C67]">{c.location}</td>
                        <td className="px-4 py-2.5 text-[#6E6C67]">{c.cuisine}</td>
                      </tr>
                    ))}
                    {bulkData.length > 50 && (
                      <tr className="bg-[#F7F4EE]/30">
                        <td colSpan="3" className="px-4 py-2.5 text-center text-[#A8A69F] italic font-medium">...and {bulkData.length - 50} more records</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowBulkUpload(false)}
                  className="px-8 py-3 text-sm font-bold text-[#6E6C67] hover:bg-[#F7F4EE] rounded-xl transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handleBulkUpload}
                  disabled={uploadLoading}
                  className="px-10 py-3 bg-[#1A1917] text-white text-sm font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center gap-3"
                >
                  {uploadLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  )}
                  {uploadLoading ? 'Processing...' : 'Approve & Import Now'}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 border-2 border-dashed border-[#E5E0D8] rounded-2xl flex flex-col items-center justify-center bg-[#FDFCFB]">
              <div className="w-12 h-12 bg-[#F7F4EE] rounded-full flex items-center justify-center text-[#A8A69F] mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm0 0h2a2 2 0 002-2M9 17v-2m6 10v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </div>
              <p className="text-sm font-bold text-[#1A1917]">No file selected</p>
              <p className="text-xs text-[#A8A69F] mt-1">Upload an XLSX or CSV to get started</p>
            </div>
          )}
        </div>
      )}

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
                <tr key={cook._id} className={`${editingId === cook._id ? 'bg-[#F7F4EE]/50' : 'hover:bg-[#FCFBF9]'} transition-colors group`}>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#F7F4EE] border border-[#E5E0D8] shrink-0">
                        {cook.profileImage ? (
                          <img src={getImageUrl(cook.profileImage)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#A8A69F]">{cook.name?.charAt(0)}</div>
                        )}
                      </div>
                      {editingId === cook._id ? (
                        <input 
                          value={editData.name} 
                          onChange={(e) => handleEditChange(e, 'name')}
                          className="w-full px-3 py-2 border border-[#E5E0D8] rounded-lg focus:ring-1 focus:ring-[#1A6B4A] outline-none text-sm font-bold bg-white"
                        />
                      ) : (
                        <div className="text-base font-bold text-[#1A1917] group-hover:text-[#1A6B4A] transition-colors">{cook.name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {editingId === cook._id ? (
                      <div className="space-y-2">
                        <input 
                          value={editData.location} 
                          onChange={(e) => handleEditChange(e, 'location')}
                          className="w-full px-3 py-2 border border-[#E5E0D8] rounded-lg focus:ring-1 focus:ring-[#1A6B4A] outline-none text-sm bg-white"
                          placeholder="Location"
                        />
                        <input 
                          value={editData.cuisine} 
                          onChange={(e) => handleEditChange(e, 'cuisine')}
                          className="w-full px-3 py-2 border border-[#E5E0D8] rounded-lg focus:ring-1 focus:ring-[#1A6B4A] outline-none text-xs bg-white italic"
                          placeholder="Cuisine"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-medium text-[#3D3C39]">{cook.location}</div>
                        <div className="text-xs text-[#A8A69F] mt-1 italic">{cook.cuisine}</div>
                      </>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    {editingId === cook._id ? (
                      <div className="space-y-2">
                        <input 
                          value={editData.contact} 
                          onChange={(e) => handleEditChange(e, 'contact')}
                          className="w-full px-3 py-2 border border-[#E5E0D8] rounded-lg focus:ring-1 focus:ring-[#1A6B4A] outline-none text-sm bg-white"
                          placeholder="Contact"
                        />
                        <select
                          name="price_range"
                          value={editData.price_range}
                          onChange={(e) => handleEditChange(e, 'price_range')}
                          className="w-full px-4 py-2 bg-white border border-[#E5E0D8] rounded-xl focus:ring-1 focus:ring-[#1A6B4A]"
                        >
                          <option value="₹250 - ₹500">₹250 - ₹500 (Value)</option>
                          <option value="₹500 - ₹1,000">₹500 - ₹1,000 (Standard)</option>
                          <option value="₹1,000 - ₹2,000">₹1,000 - ₹2,000 (Premium)</option>
                          <option value="₹2,000+">₹2,000+ (Elite)</option>
                        </select>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-[#3D3C39] font-medium">{cook.contact || 'No contact'}</div>
                        <div className="text-xs text-[#A8A69F] mt-1">{cook.price_range || 'No price'}</div>
                      </>
                    )}
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
                      {editingId === cook._id ? (
                        <>
                          <button
                            onClick={() => saveEdit(cook._id)}
                            className="bg-[#1A6B4A] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#2D8C60] transition-all shadow-md active:scale-95"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-white text-[#6E6C67] border border-[#E5E0D8] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#F7F4EE] transition-all active:scale-95"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
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
