import { useState, useEffect } from 'react';
import axios from 'axios';
import CookCard from '../components/CookCard';
import Filters from '../components/Filters';
import { ChefHat, AlertCircle } from 'lucide-react';

export default function Home() {
  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ location: '', cuisine: '' });

  // Debounce effect to avoid too many API calls
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (filters.location) params.append('location', filters.location);
        if (filters.cuisine) params.append('cuisine', filters.cuisine);

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cooks?${params.toString()}`);
        setCooks(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch cooks. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchData();
    }, 400); // 400ms debounce

    return () => clearTimeout(debounceTimer);
  }, [filters]);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Find Your Perfect Cook
        </h1>
        <p className="mt-3 text-lg text-gray-500 max-w-2xl">
          Discover talented local professionals who can craft the perfect meal for your taste and budget.
        </p>
      </div>

      <Filters filters={filters} onFilterChange={setFilters} />

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 flex items-start rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ChefHat className="w-12 h-12 text-primary-200 animate-bounce" />
          <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading cooks...</p>
        </div>
      ) : cooks.length === 0 && !error ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 border-dashed">
          <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No cooks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your location or cuisine filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cooks.map((cook) => (
            <CookCard key={cook._id} cook={cook} />
          ))}
        </div>
      )}
    </div>
  );
}
