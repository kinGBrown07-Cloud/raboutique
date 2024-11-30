export type ListingType = 'product' | 'business' | 'event' | 'travel' | 'voucher';
export type ListingStatus = 'draft' | 'pending' | 'active' | 'rejected';

export interface Listing {
  id: number;
  userId: number;
  title: string;
  description: string;
  price: number;
  status: ListingStatus;
  type: ListingType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  type: ListingType;
}

export interface UpdateListingData extends Partial<CreateListingData> {
  status?: ListingStatus;
}
