import { Search, MapPin, Utensils } from 'lucide-react';

export default function Filters({ filters, onFilterChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
  return (
    <div className="search-section w-full mb-8">
      <div className="search-inner flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
        <div className="search-field flex-1 h-[52px]">
          <svg viewBox="0 0 16 16" fill="none"><path d="M7 1C4.79 1 3 2.79 3 5c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="5" r="1.2" stroke="currentColor" strokeWidth="1.2"/></svg>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium h-full"
            placeholder="Area (e.g. Indiranagar)"
          />
        </div>
        <div className="search-field flex-1 h-[52px]">
          <svg viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <input
            type="text"
            name="cuisine"
            value={filters.cuisine}
            onChange={handleChange}
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium h-full"
            placeholder="Cuisine (e.g. Italian)"
          />
        </div>
        <div className="search-field flex-1 h-[52px]">
          <Utensils className="w-4 h-4 text-[#A8A69F]" />
          <select
            name="dietary"
            value={filters.dietary || ''}
            onChange={handleChange}
            className="bg-transparent border-none outline-none text-sm text-[#1A1917] flex-1 cursor-pointer h-full"
          >
            <option value="">Dietary: All</option>
            <option value="Veg">Veg Only</option>
            <option value="Non-Veg">Non-Veg</option>
            <option value="Vegan">Vegan</option>
            <option value="Jain">Jain</option>
          </select>
        </div>
        <div className="search-field flex-1 h-[52px]">
          <svg viewBox="0 0 16 16" fill="none"><path d="M8 1v14M4 5h8M4 10h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <select
            name="price_range"
            value={filters.price_range || ''}
            onChange={handleChange}
            className="bg-transparent border-none outline-none text-sm text-[#1A1917] flex-1 cursor-pointer h-full"
          >
            <option value="">Price: Any</option>
            <option value="₹250 - ₹500">₹250 - ₹500</option>
            <option value="₹500 - ₹1,000">₹500 - ₹1,000</option>
            <option value="₹1,000 - ₹2,000">₹1,000 - ₹2,000</option>
            <option value="₹2,000+">₹2,000+</option>
          </select>
        </div>
      </div>
    </div>
  );
}
