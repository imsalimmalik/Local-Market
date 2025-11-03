import { Shop, Product, Review, Offer } from '../types';

export const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Green Valley Grocery',
    address: '123 Main St, Downtown',
    phone: '+1 (555) 123-4567',
    category: 'Grocery',
    rating: 4.8,
    verified: true,
    image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Fresh organic produce and daily essentials',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: '2',
    name: 'Tech Solutions Hub',
    address: '456 Tech Ave, Silicon District',
    phone: '+1 (555) 987-6543',
    category: 'Electronics',
    rating: 4.6,
    verified: true,
    image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Latest gadgets and electronic accessories',
    coordinates: { lat: 40.7589, lng: -73.9851 }
  },
  {
    id: '3',
    name: 'Fashion Forward',
    address: '789 Style Blvd, Fashion Quarter',
    phone: '+1 (555) 456-7890',
    category: 'Clothing',
    rating: 4.9,
    verified: false,
    image: 'https://images.pexels.com/photos/1037995/pexels-photo-1037995.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Trendy clothing and accessories for all ages',
    coordinates: { lat: 40.7505, lng: -73.9934 }
  },
  {
    id: '4',
    name: 'Book Haven',
    address: '321 Literary Lane, Arts District',
    phone: '+1 (555) 234-5678',
    category: 'Books',
    rating: 4.7,
    verified: true,
    image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Wide selection of books and literary treasures',
    coordinates: { lat: 40.7282, lng: -74.0776 }
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    shopId: '1',
    name: 'Organic Apples',
    price: 4.99,
    image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Fresh organic apples from local farms'
  },
  {
    id: '2',
    shopId: '1',
    name: 'Whole Grain Bread',
    price: 3.49,
    image: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Freshly baked whole grain bread'
  },
  {
    id: '3',
    shopId: '2',
    name: 'Wireless Headphones',
    price: 79.99,
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'High-quality wireless bluetooth headphones'
  },
  {
    id: '4',
    shopId: '2',
    name: 'Smartphone Case',
    price: 24.99,
    image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Protective case for all smartphone models'
  }
];

export const mockReviews: Review[] = [
  {
    id: '1',
    shopId: '1',
    customerName: 'Sarah Johnson',
    rating: 5,
    comment: 'Amazing fresh produce! The organic vegetables are top quality.',
    date: '2024-12-10'
  },
  {
    id: '2',
    shopId: '1',
    customerName: 'Mike Chen',
    rating: 4,
    comment: 'Great selection and friendly staff. Prices are reasonable.',
    date: '2024-12-08'
  },
  {
    id: '3',
    shopId: '2',
    customerName: 'Emily Davis',
    rating: 5,
    comment: 'Found exactly what I needed. Excellent customer service!',
    date: '2024-12-09'
  }
];

export const mockOffers: Offer[] = [
  {
    id: '1',
    shopId: '1',
    title: 'Fresh Produce Sale',
    description: '20% off all organic fruits and vegetables',
    startDate: '2024-12-15',
    endDate: '2024-12-25',
    discount: '20%',
    image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=400',
    shopName: 'Green Valley Grocery'
  },
  {
    id: '2',
    shopId: '2',
    title: 'Tech Week Special',
    description: 'Up to 30% off on all electronic accessories',
    startDate: '2024-12-20',
    endDate: '2024-12-31',
    discount: '30%',
    image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
    shopName: 'Tech Solutions Hub'
  },
  {
    id: '3',
    shopId: '3',
    title: 'Winter Fashion Sale',
    description: 'End of season clearance - up to 50% off winter collection',
    startDate: '2024-12-18',
    endDate: '2025-01-15',
    discount: '50%',
    image: 'https://images.pexels.com/photos/1037995/pexels-photo-1037995.jpeg?auto=compress&cs=tinysrgb&w=400',
    shopName: 'Fashion Forward'
  }
];

export const categories = [
  'All',
  'Grocery',
  'Electronics',
  'Clothing',
  'Books',
  'Restaurant',
  'Pharmacy',
  'Beauty',
  'Sports',
  'Home & Garden'
];