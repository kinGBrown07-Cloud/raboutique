export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  type: string;
  images: string[];
  userId: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
}

export interface ListingFilter {
  category?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}
