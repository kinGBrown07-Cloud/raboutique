import axios from 'axios';
import type { Listing, CreateListingData, UpdateListingData } from '../types/listing';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const listingService = {
  async getListings(filters?: { type?: string; status?: string }) {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_URL}/listings?${params}`);
    return response.data;
  },

  async getListing(id: number) {
    const response = await axios.get(`${API_URL}/listings/${id}`);
    return response.data;
  },

  async createListing(data: CreateListingData) {
    const response = await axios.post(`${API_URL}/listings`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateListing(id: number, data: UpdateListingData) {
    const response = await axios.patch(`${API_URL}/listings/${id}`, data);
    return response.data;
  },

  async deleteListing(id: number) {
    const response = await axios.delete(`${API_URL}/listings/${id}`);
    return response.data;
  },
};
