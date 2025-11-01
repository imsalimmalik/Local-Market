import React from 'react';
import { Star } from 'lucide-react';
import { Review } from '../../types';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-3 w-3 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all duration-200 flex flex-col h-full min-h-[140px]">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm text-gray-900 truncate flex-1 pr-2 leading-snug">{review.customerName}</h4>
        <div className="flex items-center space-x-0.5 flex-shrink-0 ml-1">
          {renderStars(review.rating)}
        </div>
      </div>
      <p className="text-xs text-gray-600 line-clamp-4 flex-1 mb-2 leading-relaxed">{review.comment}</p>
      <p className="text-[10px] text-gray-400 mt-auto pt-1.5 border-t border-gray-100 leading-tight">
        {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>
    </div>
  );
};

export default ReviewCard;