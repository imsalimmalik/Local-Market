import React, { useEffect, useState } from 'react';
// import { Filter } from 'lucide-react';
import SearchBar from '../components/Forms/SearchBar';
import ShopCard from '../components/UI/ShopCard';
import { categories } from '../data/mockData';
import { Shop } from '../types';

const ShopsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showVerifiedOnly] = useState(false);
  // Left sidebar filters removed; inline controls are in the SearchBar
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const loadShops = async () => {
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
        rating: s.rating || 0,
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

  useEffect(() => {
    loadShops();
  }, []);

  // Reload shops when window regains focus (user comes back from another tab/window or shop detail page)
  useEffect(() => {
    const handleFocus = () => {
      loadShops();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
  // Reload when component is visible (user navigates back to this page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadShops();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search shops by name or location..."
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={(v) => setSelectedCategory(v)}
              />
            </div>
            {/* Filters button was inside SearchBar; left sidebar removed */}
          </div>
        </div>

        {/* Shop Grid - 4 per row on xl screens */}
        <div>
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading shops...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">{error}</div>
            ) : filteredShops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
  );
};

export default ShopsPage;