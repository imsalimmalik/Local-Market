import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Phone, MapPin, Star, CheckCircle, Clock } from 'lucide-react';
import ProductCard from '../components/UI/ProductCard';
import ReviewCard from '../components/UI/ReviewCard';
import { mockProducts, mockReviews } from '../data/mockData';
import type { Shop } from '../types';

const ShopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation() as any;
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    comment: ''
  });
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Prefer shop from router state if available
    if (location?.state?.shop) {
      setShop(location.state.shop as Shop);
      setLoading(false);
      return;
    }

    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5000/api/shops/${id}`);
        if (res.status === 404) {
          setShop(null);
          return;
        }
        if (!res.ok) throw new Error('Failed to load shop');
        const s = await res.json();
        const mapped: Shop = {
          id: s._id || s.id,
          name: s.name,
          address: s.address,
          phone: s.phone,
          category: s.category || 'General',
          rating: 4.5,
          verified: false,
          image: s.logoUrl ? `http://localhost:5000${s.logoUrl}` : 'https://placehold.co/1200x600?text=Shop',
          description: s.description || '',
          coordinates: { lat: 0, lng: 0 },
        };
        setShop(mapped);
      } catch (e: any) {
        setError(e.message || 'Error loading shop');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, location]);

  const shopProducts = mockProducts.filter(p => p.shopId === id);
  const shopReviews = mockReviews.filter(r => r.shopId === id);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New review:', newReview);
    // In a real app, this would submit to backend
    setNewReview({ name: '', rating: 5, comment: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">Loading shop...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Shop Not Found</h2>
          <p className="text-gray-600">The shop you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop Banner */}
      <div className="relative h-64 lg:h-80 bg-gray-200 overflow-hidden">
        <img
          src={shop.image}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl lg:text-4xl font-bold">{shop.name}</h1>
              {shop.verified && (
                <div className="flex items-center space-x-1 bg-green-500 px-2 py-1 rounded-full text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Verified</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-lg">
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 fill-current text-yellow-400" />
                <span>{shop.rating}</span>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {shop.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shop Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Shop</h2>
              <p className="text-gray-600 mb-6">{shop.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{shop.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{shop.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">9:00 AM - 9:00 PM</span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>
              {shopProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shopProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No products available at the moment.</p>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
              
              <div className="space-y-4 mb-8">
                {shopReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleReviewSubmit} className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Your Review</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newReview.name}
                      onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <select
                      value={newReview.rating}
                      onChange={(e) => setNewReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={2}>2 Stars</option>
                      <option value={1}>1 Star</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your experience..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map Placeholder */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Interactive Map</p>
                  <p className="text-sm text-gray-500">Location: {shop.address}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                  Call Shop
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                  Get Directions
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors duration-200">
                  Share Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetailPage;