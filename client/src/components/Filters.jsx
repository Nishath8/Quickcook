import { Search, MapPin, Utensils } from 'lucide-react';

export default function Filters({ filters, onFilterChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        
        {/* Location Filter */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            placeholder="Filter by location..."
          />
        </div>

        {/* Cuisine Filter */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Utensils className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="cuisine"
            value={filters.cuisine}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            placeholder="Filter by cuisine..."
          />
        </div>

      </div>
    </div>
  );
}
