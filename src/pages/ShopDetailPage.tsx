import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Phone, MapPin, Star, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import ProductCard from '../components/UI/ProductCard';
import ReviewCard from '../components/UI/ReviewCard';
import type { Shop, Product, Review } from '../types';

// Helper function to get mobile-friendly Google Maps URL
const getGoogleMapsUrl = (address: string): string => {
  const encodedAddress = encodeURIComponent(address);
  // This format works well on both mobile and desktop
  // On mobile, it will prompt to open in the native app if available
  return `https://maps.google.com/maps?daddr=${encodedAddress}`;
};

// Helper function to format phone number for tel: link
// Removes spaces, dashes, and other formatting to ensure mobile compatibility
const formatPhoneForCall = (phone: string): string => {
  // Remove all non-digit characters except + for international numbers
  return phone.replace(/[^\d+]/g, '');
};

const ShopDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation() as any;
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    comment: ''
  });
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const loadProducts = useCallback(async () => {
    if (!slug) return;
    setProductsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/shops/${slug}/products`);
      if (res.ok) {
        const data = await res.json();
        const mapped: Product[] = (data || []).map((p: any) => ({
          id: p._id || p.id,
          shopId: p.shopId || '',
          name: p.name,
          price: p.price,
          description: p.description || '',
          ...(p.image && { image: p.image }), // Only include image if it exists
        }));
        setProducts(mapped);
      }
    } catch (e: any) {
      console.error('Error loading products:', e);
      // Don't show error to user, just log it
    } finally {
      setProductsLoading(false);
    }
  }, [slug]);

  const loadReviews = useCallback(async () => {
    if (!slug) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/shops/${slug}/reviews`);
      if (res.ok) {
        const data = await res.json();
        const mapped: Review[] = (data.reviews || []).map((r: any) => ({
          id: r._id || r.id,
          shopId: r.shopId || '',
          customerName: r.customerName,
          rating: r.rating,
          comment: r.comment,
          date: new Date(r.createdAt).toLocaleDateString(),
        }));
        setReviews(mapped);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
        
        // Update shop rating in state (but don't cause re-render loop)
        setShop((prevShop) => {
          if (prevShop) {
            return {
              ...prevShop,
              rating: data.averageRating || 0,
            };
          }
          return prevShop;
        });
      }
    } catch (e: any) {
      console.error('Error loading reviews:', e);
    } finally {
      setReviewsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    // Prefer shop from router state if available
    if (location?.state?.shop) {
      const shopFromState = location.state.shop as Shop;
      setShop(shopFromState);
      setLoading(false);
      // Still load products and reviews even if shop is from state
      loadProducts();
      loadReviews();
      return;
    }

    const load = async () => {
      if (!slug) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5000/api/shops/${slug}`);
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
          rating: s.rating || 0,
          verified: false,
          image: s.logoUrl ? `http://localhost:5000${s.logoUrl}` : 'https://placehold.co/1200x600?text=Shop',
          description: s.description || '',
          coordinates: { lat: 0, lng: 0 },
        };
        setShop(mapped);
        
        // Load products and reviews for this shop
        loadProducts();
        loadReviews();
      } catch (e: any) {
        setError(e.message || 'Error loading shop');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, location, loadProducts, loadReviews]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !newReview.name.trim() || !newReview.comment.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`http://localhost:5000/api/shops/${slug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: newReview.name,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to submit review');
      }

      const data = await res.json();
      
      // Reload reviews to get updated list and rating
      await loadReviews();
      
      // Reset form
      setNewReview({ name: '', rating: 5, comment: '' });
      
      alert(`Review submitted successfully! Shop rating: ${data.shopRating.toFixed(1)}`);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(`Error submitting review: ${error.message}`);
    } finally {
      setSubmittingReview(false);
    }
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
                <span>{shop.rating > 0 ? shop.rating.toFixed(1) : 'No ratings'}</span>
                {totalReviews > 0 && (
                  <span className="text-sm text-gray-300">({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
                )}
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
              {productsLoading ? (
                <p className="text-gray-500 text-center py-8">Loading products...</p>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No products available at the moment.</p>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Customer Reviews
                  {totalReviews > 0 && (
                    <span className="text-lg font-normal text-gray-600 ml-2">
                      ({totalReviews})
                    </span>
                  )}
                </h2>
                {averageRating > 0 && (
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 fill-current text-yellow-400" />
                    <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              {reviewsLoading ? (
                <p className="text-gray-500 text-center py-8">Loading reviews...</p>
              ) : reviews.length > 0 ? (
                <>
                  {!showAllReviews ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {reviews.slice(0, 4).map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                      {reviews.length > 4 && (
                        <div className="flex justify-center">
                          <button
                            onClick={() => setShowAllReviews(true)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors duration-200"
                          >
                            <span>View More ({reviews.length - 4})</span>
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="max-h-[600px] overflow-y-auto pr-2 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => setShowAllReviews(false)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors duration-200"
                        >
                          <ChevronUp className="h-3 w-3" />
                          <span>View Less</span>
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center py-8 mb-8">No reviews yet. Be the first to review!</p>
              )}

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
                  disabled={submittingReview}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
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
                <a
                  href={`tel:${formatPhoneForCall(shop.phone)}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 block text-center"
                >
                  Call Shop
                </a>
                <a
                  href={getGoogleMapsUrl(shop.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 block text-center"
                >
                  Get Directions
                </a>
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