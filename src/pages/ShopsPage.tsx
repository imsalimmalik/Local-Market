import React, { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import SearchBar from '../components/Forms/SearchBar';
import ShopCard from '../components/UI/ShopCard';
import { categories } from '../data/mockData';
import { Shop } from '../types';

const ShopsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5000/api/shops');
        if (!res.ok) throw new Error('Failed to load shops');
        const data = await res.json();
        const mapped: Shop[] = (data || []).map((s: any) => ({
          id: s._id || s.id,
          name: s.name,
          address: s.address,
          phone: s.phone,
          category: s.category || 'General',
          rating: 4.5,
          verified: false,
          image: s.logoUrl ? `http://localhost:5000${s.logoUrl}` : 'https://placehold.co/600x400?text=Shop',
          description: s.description || '',
          coordinates: { lat: 0, lng: 0 },
        }));
        setShops(mapped);
      } catch (e: any) {
        setError(e.message || 'Error loading shops');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredShops = shops.filter((shop: Shop) => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shop.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || shop.category === selectedCategory;
    const matchesVerified = !showVerifiedOnly || shop.verified;
    
    return matchesSearch && matchesCategory && matchesVerified;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Local Shops</h1>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} placeholder="Search shops by name or location..." />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Verified Filter */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showVerifiedOnly}
                    onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Verified shops only</span>
                </label>
              </div>
              
              {/* Results Count */}
              <div className="text-sm text-gray-600">
                {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>

          {/* Shop Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading shops...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">{error}</div>
            ) : filteredShops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredShops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No shops found</div>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopsPage;