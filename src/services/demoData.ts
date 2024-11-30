import { faker } from '@faker-js/faker/locale/fr';

export interface DemoListing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  imageUrl: string;
  category: string;
  createdAt: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  specifications: Record<string, string>;
  stock: number;
  condition: 'new' | 'used' | 'refurbished';
}

const CATEGORIES = [
  'Tracteurs',
  'Moissonneuses',
  'Outils de jardinage',
  'Systèmes d\'irrigation',
  'Semences',
  'Engrais',
  'Serres',
  'Équipements d\'élevage',
  'Stockage',
  'Pièces détachées'
];

const CONDITIONS = {
  new: 'Neuf',
  used: 'Occasion',
  refurbished: 'Reconditionné'
};

const LOCATIONS = [
  'Bordeaux', 'Lyon', 'Paris', 'Marseille', 'Toulouse',
  'Nantes', 'Strasbourg', 'Lille', 'Montpellier', 'Rennes'
];

const generateSpecifications = (category: string): Record<string, string> => {
  const specs: Record<string, string> = {};
  
  switch (category) {
    case 'Tracteurs':
      specs['Puissance'] = `${faker.number.int({ min: 50, max: 300 })} CV`;
      specs['Heures de service'] = `${faker.number.int({ min: 0, max: 5000 })} h`;
      specs['Année'] = faker.date.past({ years: 15 }).getFullYear().toString();
      specs['Transmission'] = faker.helpers.arrayElement(['Manuelle', 'Automatique', 'Semi-automatique']);
      break;
    case 'Moissonneuses':
      specs['Largeur de coupe'] = `${faker.number.int({ min: 4, max: 12 })} m`;
      specs['Capacité de trémie'] = `${faker.number.int({ min: 5000, max: 12000 })} L`;
      specs['Année'] = faker.date.past({ years: 15 }).getFullYear().toString();
      break;
    case 'Systèmes d\'irrigation':
      specs['Débit'] = `${faker.number.int({ min: 10, max: 100 })} m³/h`;
      specs['Portée'] = `${faker.number.int({ min: 10, max: 50 })} m`;
      specs['Type'] = faker.helpers.arrayElement(['Aspersion', 'Goutte-à-goutte', 'Pivot']);
      break;
    default:
      specs['Marque'] = faker.company.name();
      specs['Modèle'] = faker.vehicle.model();
  }

  return specs;
};

const generateDemoListing = (): DemoListing => {
  const category = faker.helpers.arrayElement(CATEGORIES);
  const condition = faker.helpers.arrayElement(['new', 'used', 'refurbished']) as 'new' | 'used' | 'refurbished';
  
  return {
    id: faker.string.uuid(),
    title: `${faker.commerce.productName()} - ${category}`,
    description: faker.commerce.productDescription(),
    price: faker.number.int({ min: 1000, max: 150000 }),
    location: faker.helpers.arrayElement(LOCATIONS),
    imageUrl: `https://source.unsplash.com/800x600/?agriculture,${category.toLowerCase()}`,
    category,
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
    sellerId: faker.string.uuid(),
    sellerName: faker.company.name(),
    sellerRating: faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
    specifications: generateSpecifications(category),
    stock: faker.number.int({ min: 1, max: 10 }),
    condition
  };
};

export const generateDemoListings = (count: number = 50): DemoListing[] => {
  return Array.from({ length: count }, generateDemoListing);
};

// Générer quelques données de démo pour les statistiques
export const generateDemoStats = () => ({
  totalListings: faker.number.int({ min: 100, max: 500 }),
  activeListings: faker.number.int({ min: 50, max: 200 }),
  totalViews: faker.number.int({ min: 1000, max: 5000 }),
  totalFavorites: faker.number.int({ min: 100, max: 1000 }),
  recentSales: faker.number.int({ min: 10, max: 50 }),
  revenue: faker.number.int({ min: 10000, max: 100000 }),
  popularCategories: CATEGORIES.slice(0, 5).map(category => ({
    category,
    count: faker.number.int({ min: 10, max: 100 })
  })),
  monthlyStats: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2024, i, 1).toLocaleString('fr-FR', { month: 'long' }),
    listings: faker.number.int({ min: 20, max: 100 }),
    views: faker.number.int({ min: 100, max: 1000 }),
    sales: faker.number.int({ min: 5, max: 30 })
  }))
});
