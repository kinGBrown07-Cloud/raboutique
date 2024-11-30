import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ListingGrid } from '../listings/ListingGrid';
import type { Listing } from '../../types';

const MY_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Modern Office Space in City Center',
    description: 'Prime location office space with panoramic views and modern amenities',
    price: 250000,
    currency: 'USD',
    category: 'Commercial',
    type: 'business',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c'],
    userId: 'user1',
    createdAt: '2024-03-10T10:00:00Z',
    status: 'active',
  },
];

export function DashboardListings() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Listings</h2>
        <Link
          to="/dashboard/listings/new"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Listing
        </Link>
      </div>

      {MY_LISTINGS.length > 0 ? (
        <ListingGrid listings={MY_LISTINGS} />
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">No listings yet. Create your first listing!</p>
        </div>
      )}
    </div>
  );
}