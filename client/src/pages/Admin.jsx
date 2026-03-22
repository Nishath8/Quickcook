import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('adminAuth') === 'true';
  });
  const [password, setPassword] = useState('');

  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const assignToMe = async (id) => {
    if (!user) return alert("Please sign in with Google first!");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/cooks/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!response.ok) throw new Error('Failed to assign cook');
      
      setCooks((prev) => prev.map(c => c._id === id ? { ...c, userId: user.id } : c));
      alert("Cook linked to your account! You can now use the Dashboard.");
    } catch (err) {
      alert(err.message);
    }
  };

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
        <div style={{ backgroundColor: 'var(--cream)', borderRadius: '24px', padding: '40px', border: '1px solid #E5E0D8' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--ink)', textAlign: 'center', marginBottom: '8px' }}>Admin Dashboard</h2>
          <p className="text-center text-sm mb-6" style={{color: 'var(--ink4)'}}>Restricted access. Please log in.</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label style={{ color: 'var(--ink3)', fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[var(--ink)] focus:border-[var(--ink)] outline-none transition-all placeholder-gray-400 text-gray-900 bg-white"
                placeholder="Enter admin password"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-2"
              style={{
                backgroundColor: 'var(--ink)',
                color: 'white',
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 'bold',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#000'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--ink)'}
            >
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8">Loading cooks...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--ink)' }}>Admin Table</h1>
        <button
          onClick={() => {
            localStorage.removeItem('adminAuth');
            setIsLoggedIn(false);
          }}
          className="text-sm px-5 py-2 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors border border-gray-200"
        >
          Logout
        </button>
      </div>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full block sm:table">
            <thead className="bg-gray-50 hidden sm:table-header-group">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Location & Cuisine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Contact & Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white block sm:table-row-group divide-y divide-gray-200">
              {cooks.map((cook) => (
                editingId === cook._id ? (
                  <tr key={cook._id} className="block sm:table-row bg-blue-50 border-b-4 sm:border-b-0 border-blue-100 pb-4 sm:pb-0">
                    <td className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4 align-top">
                      <div className="sm:hidden text-xs font-bold text-gray-500 uppercase mb-1">Name</div>
                      <input
                        className="w-full p-2 border border-blue-200 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm text-sm"
                        value={editData.name}
                        onChange={(e) => handleEditChange(e, 'name')}
                        placeholder="Name"
                      />
                    </td>
                    <td className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4 align-top">
                      <div className="sm:hidden text-xs font-bold text-gray-500 uppercase mb-1">Location & Cuisine</div>
                      <div className="flex flex-col space-y-2">
                         <input
                           className="w-full p-2 border border-blue-200 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm text-sm"
                           value={editData.location}
                           onChange={(e) => handleEditChange(e, 'location')}
                           placeholder="Location"
                         />
                         <input
                           className="w-full p-2 border border-blue-200 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm text-sm"
                           value={editData.cuisine}
                           onChange={(e) => handleEditChange(e, 'cuisine')}
                           placeholder="Cuisine"
                         />
                      </div>
                    </td>
                    <td className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4 align-top">
                       <div className="sm:hidden text-xs font-bold text-gray-500 uppercase mb-1">Contact & Price</div>
                       <div className="flex flex-col space-y-2">
                         <input
                           className="w-full p-2 border border-blue-200 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm text-sm"
                           value={editData.contact}
                           onChange={(e) => handleEditChange(e, 'contact')}
                           placeholder="Contact Info"
                         />
                         <select
                           className="w-full p-2 border border-blue-200 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm bg-white text-sm"
                           value={editData.price_range}
                           onChange={(e) => handleEditChange(e, 'price_range')}
                         >
                           <option value="" disabled>Price Range</option>
                           <option value="$">$ (Inexpensive)</option>
                           <option value="$$">$$ (Moderate)</option>
                           <option value="$$$">$$$ (Expensive)</option>
                           <option value="$$$$">$$$$ (Very Expensive)</option>
                         </select>
                       </div>
                    </td>
                    <td className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4 align-top">
                      <div className="sm:hidden text-xs font-bold text-gray-500 uppercase mb-1">Status</div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cook.status === 'approved' ? 'bg-green-100 text-green-800'
                          : cook.status === 'denied' ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {cook.status}
                      </span>
                    </td>
                    <td className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4 align-top">
                      <div className="flex sm:justify-end space-x-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => saveEdit(cook._id)}
                          className="flex-1 sm:flex-none text-center text-white hover:bg-green-700 font-medium bg-green-600 px-3 py-2 sm:py-1 rounded-md transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 sm:flex-none text-center text-gray-600 hover:text-white hover:bg-gray-600 font-medium bg-gray-200 px-3 py-2 sm:py-1 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={cook._id} className="block sm:table-row hover:bg-gray-50 transition-colors border-b-4 sm:border-b-0 border-gray-100 pb-4 sm:pb-0">
                    <td className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4 align-top">
                      <div className="sm:hidden text-xs font-bold text-gray-500 uppercase mb-1">Name</div>
                      <div className="text-sm font-medium text-gray-900">{cook.name}</div>
                    </td>
                    <td className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4 align-top">
                      <div className="sm:hidden text-xs font-bold text-gray-500 uppercase mb-1">Location & Cuisine</div>
                      <div className="text-sm font-medium text-gray-800">{cook.location}</div>
                      <div className="text-xs text-gray-400 mt-1">{cook.cuisine}</div>
                    </td>
                    <td className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4 align-top">
                      <div className="sm:hidden text-xs font-bold text-gray-500 uppercase mb-1">Contact & Price</div>
                      <div className="text-sm text-gray-800">{cook.contact || <span className="italic text-gray-400">No contact provided</span>}</div>
                      <div className="text-xs text-gray-400 mt-1">{cook.price_range || <span className="italic">No price provided</span>}</div>
                    </td>
                    <td className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4 align-top">
                      <div className="sm:hidden text-xs font-bold text-gray-500 uppercase mb-1">Status</div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cook.status === 'approved' ? 'bg-green-100 text-green-800'
                          : cook.status === 'denied' ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {cook.status}
                      </span>
                    </td>
                    <td className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4 align-top">
                      <div className="flex sm:justify-end space-x-2 mt-2 sm:mt-0">
                        {cook.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateCookStatus(cook._id, 'approved')}
                              className="flex-1 sm:flex-none text-center text-green-600 hover:text-green-900 font-medium bg-green-50 px-3 py-2 sm:py-1 rounded-md transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateCookStatus(cook._id, 'denied')}
                              className="flex-1 sm:flex-none text-center text-red-600 hover:text-red-900 font-medium bg-red-50 px-3 py-2 sm:py-1 rounded-md transition-colors"
                            >
                              Deny
                            </button>
                          </>
                        )}
                        {cook.status === 'approved' && (
                          <>
                            <button
                              onClick={() => handleEditClick(cook)}
                              className="flex-1 sm:flex-none text-center text-blue-600 hover:text-white hover:bg-blue-600 font-medium bg-blue-50 px-3 py-2 sm:py-1 rounded-md transition-colors"
                            >
                              Edit
                            </button>
                            <button
                               onClick={() => deleteCookFn(cook._id)}
                               className="flex-1 sm:flex-none text-center text-gray-600 hover:text-white hover:bg-gray-800 font-medium bg-gray-100 px-3 py-2 sm:py-1 rounded-md transition-colors"
                             >
                               Delete
                             </button>
                             {!cook.userId && (
                               <button
                                 onClick={() => assignToMe(cook._id)}
                                 className="flex-1 sm:flex-none text-center text-amber-600 hover:text-white hover:bg-amber-600 font-medium bg-amber-50 px-3 py-2 sm:py-1 rounded-md transition-colors border border-amber-100"
                               >
                                 Link to My Account
                               </button>
                             )}
                           </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
        {cooks.length === 0 && (
          <div className="text-center py-8 text-gray-500">No cooks found.</div>
        )}
      </div>
    </div>
  );
}
