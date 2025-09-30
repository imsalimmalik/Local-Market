export interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  category: string;
  rating: number;
  verified: boolean;
  image: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface Review {
  id: string;
  shopId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Offer {
  id: string;
  shopId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  discount: string;
  image: string;
  shopName: string;
}

export interface ShopFormData {
  name: string;
  address: string;
  phone: string;
  category: string;
  description: string;
}

export interface ProductFormData {
  name: string;
  price: number;
  description: string;
}

export interface OfferFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  discount: string;
}