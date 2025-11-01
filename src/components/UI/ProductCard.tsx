import React from 'react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
        <span className="text-2xl font-bold text-green-600">
          ₹{product.price.toFixed(2)}
        </span>
      </div>
      {product.description && (
        <p className="text-gray-600 text-sm">{product.description}</p>
      )}
    </div>
  );
};

export default ProductCard;