import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import SearchBar from '../components/Forms/SearchBar';
import ShopCard from '../components/UI/ShopCard';
import OfferCard from '../components/UI/OfferCard';
import type { Shop, Offer } from '../types';

const HomePage: React.FC = () => {
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // In a real app, this would filter shops/products
  };

  const [shops, setShops] = useState<Shop[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [offersLoading, setOffersLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
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

    const loadOffers = async () => {
      setOffersLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/offers');
        if (!res.ok) throw new Error('Failed to load offers');
        const data = await res.json();
        const mapped: Offer[] = (data || []).map((o: any) => ({
          id: o._id || o.id,
          shopId: o.shopId || '',
          title: o.title,
          description: o.description,
          startDate: o.startDate,
          endDate: o.endDate,
          discount: o.discount,
          image: o.image || 'https://placehold.co/600x400?text=Offer',
          shopName: o.shopName || 'Unknown Shop',
        }));
        setOffers(mapped);
      } catch (e: any) {
        console.error('Error loading offers:', e);
      } finally {
        setOffersLoading(false);
      }
    };

    loadShops();
    loadOffers();
  }, []);

  const featuredShops = shops.slice(0, 3);
  const hotOffers = offers.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Discover Your Local Shops
              <span className="block text-blue-200">& Real Market Prices</span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Connect with local businesses in your neighborhood and discover amazing products at competitive prices.
            </p>
            
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar onSearch={handleSearch} />
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Local Discovery</span>
              </div>
              {/* <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Verified Shops</span>
              </div> */}
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Real Reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Shops */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Shops</h2>
              <p className="text-gray-600 mt-2">Discover top-rated local businesses</p>
            </div>
            <Link
              to="/shops"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>View All Shops</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading shops...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hot Offers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Ongoing Hot Sales</h2>
              <p className="text-gray-600 mt-2">Don't miss these amazing deals</p>
            </div>
            <Link
              to="/offers"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>View All Offers</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {offersLoading ? (
            <div className="text-center py-12 text-gray-500">Loading offers...</div>
          ) : hotOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No offers available at the moment.</div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Own a Local Business?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our marketplace and reach more customers in your community
          </p>
          <Link
            to="/register-shop"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
          >
            Register Your Shop
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;