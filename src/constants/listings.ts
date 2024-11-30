import { ListingCategory, ListingType } from '../types';

export const LISTING_CATEGORIES: { id: ListingCategory; label: string; description: string }[] = [
  {
    id: 'real_estate',
    label: 'Immobilier',
    description: 'Biens immobiliers, terrains et propriétés'
  },
  {
    id: 'agricultural',
    label: 'Agriculture',
    description: 'Produits agricoles, terrains agricoles et équipements'
  },
  {
    id: 'technology',
    label: 'Technologie',
    description: 'Produits électroniques et technologiques'
  },
  {
    id: 'appliances',
    label: 'Électroménager',
    description: 'Appareils électroménagers et équipements domestiques'
  },
  {
    id: 'tickets',
    label: 'Billets',
    description: 'Billets de concert, voyage et loterie'
  },
  {
    id: 'vouchers',
    label: 'Bons d\'achat',
    description: 'Bons d\'achat et cartes cadeaux'
  },
  {
    id: 'stocks',
    label: 'Actions',
    description: 'Parts et actions de sociétés'
  },
  {
    id: 'other',
    label: 'Autres',
    description: 'Autres types de produits'
  }
];

export const LISTING_TYPES: { id: ListingType; label: string; category: ListingCategory; commission: number }[] = [
  {
    id: 'product',
    label: 'Produit physique',
    category: 'other',
    commission: 0.05
  },
  {
    id: 'real_estate',
    label: 'Bien immobilier',
    category: 'real_estate',
    commission: 0.15
  },
  {
    id: 'agricultural',
    label: 'Terrain/ferme agricole',
    category: 'agricultural',
    commission: 0.15
  },
  {
    id: 'ticket_concert',
    label: 'Billet de concert',
    category: 'tickets',
    commission: 0.05
  },
  {
    id: 'ticket_travel',
    label: 'Billet de voyage',
    category: 'tickets',
    commission: 0.05
  },
  {
    id: 'ticket_lottery',
    label: 'Billet de loterie',
    category: 'tickets',
    commission: 0.05
  },
  {
    id: 'voucher',
    label: 'Bon d\'achat',
    category: 'vouchers',
    commission: 0.05
  },
  {
    id: 'stock',
    label: 'Action de société',
    category: 'stocks',
    commission: 0.05
  },
  {
    id: 'affiliate',
    label: 'Produit affilié',
    category: 'other',
    commission: 0.05
  }
];

export const getCommissionRate = (type: ListingType): number => {
  const listingType = LISTING_TYPES.find(t => t.id === type);
  return listingType?.commission || 0.05;
};

export const getCategoryByType = (type: ListingType): ListingCategory => {
  const listingType = LISTING_TYPES.find(t => t.id === type);
  return listingType?.category || 'other';
};
