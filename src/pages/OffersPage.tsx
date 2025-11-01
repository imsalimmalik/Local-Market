import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Upload } from 'lucide-react';
import OfferCard from '../components/UI/OfferCard';
import { OfferFormData, Offer, Shop } from '../types';

const OffersPage: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [offersLoading, setOffersLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newOffer, setNewOffer] = useState<OfferFormData>({
    shopId: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    discount: ''
  });
  const [offerImage, setOfferImage] = useState<File | null>(null);

  useEffect(() => {
    loadOffers();
    loadShops();
  }, []);

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

  const loadShops = async () => {
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
      console.error('Error loading shops:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.shopId) {
      alert('Please select a shop');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('shopId', newOffer.shopId);
      formData.append('title', newOffer.title);
      formData.append('description', newOffer.description);
      formData.append('startDate', newOffer.startDate);
      formData.append('endDate', newOffer.endDate);
      formData.append('discount', newOffer.discount);
      if (offerImage) {
        formData.append('image', offerImage);
      }

      const res = await fetch('http://localhost:5000/api/offers', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        // Try to parse as JSON, but handle HTML error pages
        let errorMessage = 'Failed to create offer';
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await res.json();
            errorMessage = error.message || errorMessage;
          } else {
            const text = await res.text();
            errorMessage = `Server error (${res.status}): ${text.substring(0, 100)}`;
          }
        } catch (e) {
          errorMessage = `Server error (${res.status})`;
        }
        throw new Error(errorMessage);
      }

      // Reset form
      setNewOffer({ shopId: '', title: '', description: '', startDate: '', endDate: '', discount: '' });
      setOfferImage(null);
      setShowAddForm(false);
      
      // Reload offers
      await loadOffers();
      
      alert('Offer created successfully!');
    } catch (error: any) {
      console.error('Error creating offer:', error);
      alert(`Error creating offer: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Current Offers & Events</h1>
            <p className="text-gray-600 mt-2">Discover amazing deals from local shops</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Add Offer Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop *
                </label>
                <select
                  required
                  value={newOffer.shopId}
                  onChange={(e) => setNewOffer(prev => ({ ...prev, shopId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a shop</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOffer.title}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Black Friday Sale"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOffer.discount}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, discount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 20%"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Image
                </label>
                <div className="mt-1 px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="flex items-center space-x-4">
                    <Upload className="h-6 w-6 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                        setOfferImage(file);
                      }}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {offerImage && (
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm text-gray-600">Selected: {offerImage.name}</div>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 text-sm"
                        onClick={() => setOfferImage(null)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={newOffer.description}
                  onChange={(e) => setNewOffer(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your event..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newOffer.startDate}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newOffer.endDate}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  {submitting ? 'Creating...' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Offers Grid */}
        {offersLoading ? (
          <div className="text-center py-12 text-gray-500">Loading offers...</div>
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers available</h3>
            <p className="text-gray-500">Be the first to add an exciting offer!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersPage;