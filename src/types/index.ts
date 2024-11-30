export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

export type ListingCategory = 
  | 'real_estate'     // Biens immobiliers
  | 'agricultural'    // Produits agricoles
  | 'technology'      // Produits technologiques
  | 'appliances'      // Électroménager
  | 'tickets'         // Billets (concerts, voyages, etc.)
  | 'vouchers'        // Bons d'achat
  | 'stocks'          // Actions de sociétés
  | 'other';          // Autres

export type ListingType = 
  | 'product'         // Produit physique
  | 'real_estate'     // Bien immobilier
  | 'agricultural'    // Terrain/ferme agricole
  | 'ticket_concert'  // Billet de concert
  | 'ticket_travel'   // Billet de voyage
  | 'ticket_lottery'  // Billet de loterie
  | 'voucher'         // Bon d'achat
  | 'stock'           // Action de société
  | 'affiliate';      // Produit affilié

export type ListingStatus = 
  | 'draft'           // Brouillon
  | 'pending'         // En attente de validation
  | 'active'          // Actif/En vente
  | 'sold'            // Vendu
  | 'expired'         // Expiré
  | 'suspended';      // Suspendu

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: ListingCategory;
  type: ListingType;
  images: string[];
  userId: string;
  createdAt: string;
  status: ListingStatus;
  location?: string;
  specifications?: Record<string, any>;
  commission?: number;
}