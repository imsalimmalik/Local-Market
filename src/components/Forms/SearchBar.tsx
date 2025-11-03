import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  onToggleFilters?: () => void;
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = "Search shops or products...", onToggleFilters, categories, selectedCategory, onCategoryChange }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-44 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
        {categories && selectedCategory && onCategoryChange && (
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="absolute right-28 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 rounded-md text-sm px-2 py-1 pr-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Category"
            title="Category"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>
      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
      >
        Search
      </button>
      {onToggleFilters && (
        <button
          type="button"
          onClick={onToggleFilters}
          className="hidden absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
          aria-label="Toggle filters"
          title="Filters"
        >
          <Filter className="h-5 w-5" />
        </button>
      )}
    </form>
  );
};

export default SearchBar;