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
      <div className="max-w-md mx-auto mt-20 bg-white p-8 border border-gray-100 shadow-sm rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
              placeholder="Enter admin password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8">Loading cooks...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem('adminAuth');
            setIsLoggedIn(false);
          }}
          className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Location & Cuisine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Contact & Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cooks.map((cook) => (
                editingId === cook._id ? (
                  <tr key={cook._id} className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">
                      <input
                        className="w-full p-2 border border-blue-200 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                        value={editData.name}
                        onChange={(e) => handleEditChange(e, 'name')}
                        placeholder="Name"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                      <div className="flex flex-col space-y-2">
                         <input
                           className="w-full p-2 border border-blue-200 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                           value={editData.location}
                           onChange={(e) => handleEditChange(e, 'location')}
                           placeholder="Location"
                         />
                         <input
                           className="w-full p-2 border border-blue-200 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                           value={editData.cuisine}
                           onChange={(e) => handleEditChange(e, 'cuisine')}
                           placeholder="Cuisine"
                         />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                       <div className="flex flex-col space-y-2">
                         <input
                           className="w-full p-2 border border-blue-200 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                           value={editData.contact}
                           onChange={(e) => handleEditChange(e, 'contact')}
                           placeholder="Contact Info"
                         />
                         <select
                           className="w-full p-2 border border-blue-200 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm bg-white"
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm align-top">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cook.status === 'approved' ? 'bg-green-100 text-green-800'
                          : cook.status === 'denied' ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {cook.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => saveEdit(cook._id)}
                          className="text-white hover:bg-green-700 font-medium bg-green-600 px-3 py-1 rounded-md transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:text-white hover:bg-gray-600 font-medium bg-gray-200 px-3 py-1 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={cook._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">{cook.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                      <div className="font-medium text-gray-800">{cook.location}</div>
                      <div className="text-xs text-gray-400 mt-1">{cook.cuisine}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                      <div className="text-gray-800">{cook.contact || <span className="italic text-gray-400">No contact provided</span>}</div>
                      <div className="text-xs text-gray-400 mt-1">{cook.price_range || <span className="italic">No price provided</span>}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm align-top">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cook.status === 'approved' ? 'bg-green-100 text-green-800'
                          : cook.status === 'denied' ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {cook.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                      <div className="flex justify-end space-x-2">
                        {cook.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateCookStatus(cook._id, 'approved')}
                              className="text-green-600 hover:text-green-900 font-medium bg-green-50 px-3 py-1 rounded-md transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateCookStatus(cook._id, 'denied')}
                              className="text-red-600 hover:text-red-900 font-medium bg-red-50 px-3 py-1 rounded-md transition-colors"
                            >
                              Deny
                            </button>
                          </>
                        )}
                        {cook.status === 'approved' && (
                          <>
                            <button
                              onClick={() => handleEditClick(cook)}
                              className="text-blue-600 hover:text-white hover:bg-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-md transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteCookFn(cook._id)}
                              className="text-gray-600 hover:text-white hover:bg-gray-800 font-medium bg-gray-100 px-3 py-1 rounded-md transition-colors"
                            >
                              Delete
                            </button>
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
