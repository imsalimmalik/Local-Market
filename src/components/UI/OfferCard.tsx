import React from 'react';
import { Calendar, Tag } from 'lucide-react';
import { Offer } from '../../types';

interface OfferCardProps {
  offer: Offer;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const startDate = new Date(offer.startDate).toLocaleDateString();
  const endDate = new Date(offer.endDate).toLocaleDateString();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={offer.image}
          alt={offer.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-1">
          <Tag className="h-4 w-4" />
          <span className="font-semibold">{offer.discount} OFF</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
          <span className="text-sm text-blue-600 font-medium">{offer.shopName}</span>
        </div>
        <p className="text-gray-600 text-sm mb-3">{offer.description}</p>
        
        <div className="flex items-center space-x-2 text-gray-600 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{startDate} - {endDate}</span>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;