import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListingStore } from '../../store/useListingStore';
import { ListingForm } from '../../components/listings/ListingForm';

export function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentListing, fetchListing, isLoading, error } = useListingStore();

  useEffect(() => {
    if (id) {
      fetchListing(parseInt(id, 10));
    }
  }, [id, fetchListing]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          Une erreur est survenue : {error}
        </div>
        <button
          onClick={() => navigate('/dashboard/listings')}
          className="mt-4 px-4 py-2 text-indigo-600 hover:text-indigo-500"
        >
          Retour aux annonces
        </button>
      </div>
    );
  }

  if (!currentListing) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg">
          Annonce non trouvée
        </div>
        <button
          onClick={() => navigate('/dashboard/listings')}
          className="mt-4 px-4 py-2 text-indigo-600 hover:text-indigo-500"
        >
          Retour aux annonces
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Modifier l'annonce</h1>
      <ListingForm listing={currentListing} mode="edit" />
    </div>
  );
}
