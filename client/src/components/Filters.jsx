import { Search, MapPin, Utensils } from 'lucide-react';

export default function Filters({ filters, onFilterChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="search-section mx-[-1rem] sm:mx-[calc(-50vw+50%)] relative w-[100vw] mb-8">
      <div className="search-inner">
        <div className="search-field">
          <svg viewBox="0 0 16 16" fill="none"><path d="M7 1C4.79 1 3 2.79 3 5c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="5" r="1.2" stroke="currentColor" strokeWidth="1.2"/></svg>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Filter by area — Indiranagar, Koramangala…"
          />
        </div>
        <div className="search-field">
          <svg viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <input
            type="text"
            name="cuisine"
            value={filters.cuisine}
            onChange={handleChange}
            placeholder="Cuisine — South Indian, Bengali, Jain…"
          />
        </div>
      </div>
    </div>
  );
}
