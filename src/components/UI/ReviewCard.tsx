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
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
        <div className="flex items-center space-x-1">
          {renderStars(review.rating)}
        </div>
      </div>
      <p className="text-gray-600 mb-2">{review.comment}</p>
      <p className="text-xs text-gray-500">
        {new Date(review.date).toLocaleDateString()}
      </p>
    </div>
  );
};

export default ReviewCard;