import { useState } from 'react';
import axios from 'axios';
import { ChefHat, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AddCook() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    cuisine: '',
    price_range: '',
    contact: ''
  });

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/cooks`, formData);
      setStatus('success');
      setMessage(response.data.message || 'Cook added successfully!');
      setFormData({
        name: '',
        location: '',
        cuisine: '',
        price_range: '',
        contact: ''
      });
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to add cook. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-4">
          <ChefHat className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Register a Cook
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Add a new cook to the marketplace so customers can find them.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Alerts */}
        {status === 'success' && (
          <div className="bg-green-50 p-4 flex items-center border-b border-green-100">
            <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <p className="text-sm text-green-800 font-medium">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 p-4 flex items-center border-b border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800 font-medium">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Name */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400 text-gray-900"
                placeholder="e.g. Gordon Ramsay"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400 text-gray-900"
                placeholder="e.g. City, Neighborhood"
              />
            </div>

            {/* Price Range */}
            <div>
              <label htmlFor="price_range" className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <select
                id="price_range"
                name="price_range"
                required
                value={formData.price_range}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
              >
                <option value="" disabled>Select a range</option>
                <option value="$">$ (Inexpensive)</option>
                <option value="$$">$$ (Moderate)</option>
                <option value="$$$">$$$ (Expensive)</option>
                <option value="$$$$">$$$$ (Very Expensive)</option>
              </select>
            </div>

            {/* Cuisine */}
            <div className="sm:col-span-2">
              <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine Specialties
              </label>
              <input
                type="text"
                id="cuisine"
                name="cuisine"
                required
                value={formData.cuisine}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400 text-gray-900"
                placeholder="e.g. Italian, Continental, Baking"
              />
            </div>

            {/* Contact */}
            <div className="sm:col-span-2">
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="contact"
                name="contact"
                required
                pattern="[+\d\s\-()]+"
                title="Please enter a valid phone number"
                value={formData.contact}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400 text-gray-900"
                placeholder="e.g. +1 234 567 8900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Record...
                </span>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
