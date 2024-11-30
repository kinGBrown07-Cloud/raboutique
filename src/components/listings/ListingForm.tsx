import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListingStore } from '../../store/useListingStore';
import type { CreateListingData, UpdateListingData, Listing, ListingType } from '../../types/listing';

interface ListingFormProps {
  listing?: Listing;
  mode: 'create' | 'edit';
}

const listingTypes: { value: ListingType; label: string }[] = [
  { value: 'product', label: 'Produit' },
  { value: 'business', label: 'Business' },
  { value: 'event', label: 'Événement' },
  { value: 'travel', label: 'Voyage' },
  { value: 'voucher', label: 'Bon d\'achat' },
];

const initialFormData: CreateListingData = {
  title: '',
  description: '',
  price: 0,
  type: 'product',
};

export function ListingForm({ listing, mode }: ListingFormProps) {
  const navigate = useNavigate();
  const { createListing, updateListing, error, isLoading } = useListingStore();
  const [formData, setFormData] = useState<CreateListingData>(
    listing || initialFormData
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        await createListing(formData);
      } else if (listing) {
        await updateListing(listing.id, formData as UpdateListingData);
      }
      navigate('/dashboard/listings');
    } catch (error) {
      console.error('Failed to save listing:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prix
        </label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {listingTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/listings')}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading
            ? mode === 'create'
              ? 'Création...'
              : 'Mise à jour...'
            : mode === 'create'
            ? 'Créer'
            : 'Mettre à jour'}
        </button>
      </div>
    </form>
  );
}
