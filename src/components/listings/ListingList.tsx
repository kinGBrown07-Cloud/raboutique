import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useListingStore } from '../../store/useListingStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { ListingType } from '../../types/listing';

const listingTypes: { value: ListingType; label: string }[] = [
  { value: 'product', label: 'Produit' },
  { value: 'business', label: 'Business' },
  { value: 'event', label: 'Événement' },
  { value: 'travel', label: 'Voyage' },
  { value: 'voucher', label: 'Bon d\'achat' },
];

export function ListingList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { listings, isLoading, error, fetchListings, deleteListing, setFilters } =
    useListingStore();

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      await deleteListing(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        Une erreur est survenue : {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes Annonces</h2>
        <button
          onClick={() => navigate('/dashboard/listings/new')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          Nouvelle Annonce
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          onChange={(e) => setFilters({ type: e.target.value || undefined })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Tous les types</option>
          {listingTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Aucune annonce trouvée</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white p-6 rounded-lg shadow-md space-y-4"
            >
              <h3 className="text-xl font-semibold">{listing.title}</h3>
              <p className="text-gray-600 line-clamp-2">{listing.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">
                  {listing.price.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {
                    listingTypes.find((type) => type.value === listing.type)
                      ?.label
                  }
                </span>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => navigate(`/dashboard/listings/${listing.id}/edit`)}
                  className="p-2 text-gray-600 hover:text-indigo-600"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(listing.id)}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
