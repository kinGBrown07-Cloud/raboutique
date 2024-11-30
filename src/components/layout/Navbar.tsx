import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Badge,
  MenuItem,
  Menu,
  Container,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ShoppingBag from '@mui/icons-material/ShoppingBag';
import Campaign from '@mui/icons-material/Campaign';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CategoryIcon from '@mui/icons-material/Category';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ArticleIcon from '@mui/icons-material/Article';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HomeIcon from '@mui/icons-material/Home';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';
import DropdownMenu from '../navigation/DropdownMenu';
import SearchDropdown from '../navigation/SearchDropdown';

const mainMenuItems = {
  annonces: {
    title: 'Annonces',
    icon: <StorefrontIcon />,
    sections: [
      {
        title: 'Parcourir',
        links: [
          {
            title: 'Toutes les annonces',
            path: '/annonces',
            icon: <CategoryIcon />,
            description: 'Explorer toutes les annonces',
          },
          {
            title: 'Nouveautés',
            path: '/annonces?sort=newest',
            icon: <NewReleasesIcon />,
            description: 'Dernières annonces publiées',
          },
          {
            title: 'Promotions',
            path: '/annonces?sort=promo',
            icon: <LocalOfferIcon />,
            description: 'Annonces en promotion',
          },
          {
            title: 'Tendances',
            path: '/annonces?sort=trending',
            icon: <TrendingUpIcon />,
            description: 'Annonces populaires',
          },
        ],
      },
      {
        title: 'Publier',
        links: [
          {
            title: 'Créer une annonce',
            path: '/annonces/creer',
            icon: <ArticleIcon />,
            description: 'Publier une nouvelle annonce',
          },
          {
            title: 'Plans d\'abonnement',
            path: '/abonnements',
            icon: <Campaign />,
            description: 'Découvrir nos forfaits',
          },
        ],
      },
    ],
  },
  boutique: {
    title: 'Boutique',
    icon: <ShoppingBag />,
    sections: [
      {
        title: 'Catégories',
        links: [
          {
            title: 'Tous les produits',
            path: '/boutique',
            description: 'Explorer notre catalogue',
            icon: <CategoryIcon />,
          },
          {
            title: 'Nouveautés',
            path: '/boutique/nouveautes',
            description: 'Derniers arrivages',
            icon: <NewReleasesIcon />,
          },
          {
            title: 'Promotions',
            path: '/boutique/promotions',
            description: 'Offres spéciales',
            icon: <LocalOfferIcon />,
          },
        ],
      },
    ],
  },
  blog: {
    title: 'Blog',
    icon: <ArticleIcon />,
    sections: [
      {
        title: 'Articles',
        links: [
          {
            title: 'Tous les articles',
            path: '/blog',
            description: 'Actualités et conseils',
            icon: <ArticleIcon />,
          },
          {
            title: 'Tendances',
            path: '/blog/tendances',
            description: 'Les dernières tendances',
            icon: <TrendingUpIcon />,
          },
        ],
      },
    ],
  },
};

const userMenuItems = [
  {
    title: 'Mon Compte',
    links: [
      {
        title: 'Tableau de bord',
        path: '/dashboard',
        icon: <HomeIcon />,
        description: 'Aperçu général',
      },
      {
        title: 'Notifications',
        path: '/notifications',
        icon: <NotificationsIcon />,
        description: 'Centre de notifications',
      },
    ],
  },
  {
    title: 'Mes Achats',
    links: [
      {
        title: 'Mes Commandes',
        path: '/mes-commandes',
        icon: <ShoppingBag />,
        description: 'Suivre mes achats',
      },
      {
        title: 'Mes Favoris',
        path: '/favoris',
        icon: <FavoriteIcon />,
        description: 'Articles sauvegardés',
      },
    ],
  },
  {
    title: 'Mes Annonces',
    links: [
      {
        title: 'Gérer mes Annonces',
        path: '/mes-annonces',
        icon: <Campaign />,
        description: 'Voir et modifier',
      },
      {
        title: 'Statistiques',
        path: '/statistiques',
        icon: <TrendingUpIcon />,
        description: 'Performances',
      },
    ],
  },
];

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Logo />
          </Box>

          {/* Menu principal - Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, mx: 4 }}>
              <Button
                component={Link}
                to="/"
                sx={{
                  color: 'text.primary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                Accueil
              </Button>
              {Object.entries(mainMenuItems).map(([key, item]) => (
                <DropdownMenu
                  key={key}
                  title={item.title}
                  icon={item.icon}
                  sections={item.sections}
                />
              ))}
            </Box>
          )}

          {/* Actions - Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchDropdown />
              <IconButton color="inherit">
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <IconButton color="inherit">
                <Badge badgeContent={2} color="error">
                  <FavoriteIcon />
                </Badge>
              </IconButton>
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
              {isAuthenticated ? (
                <IconButton
                  onClick={handleUserMenuOpen}
                  sx={{
                    padding: 0.5,
                    border: '2px solid transparent',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                    }}
                  >
                    U
                  </Avatar>
                </IconButton>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  color="primary"
                  size="small"
                >
                  Connexion
                </Button>
              )}
            </Box>
          )}

          {/* Menu mobile */}
          {isMobile && (
            <>
              <IconButton
                color="inherit"
                onClick={handleMobileMenuToggle}
                edge="start"
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="left"
                open={mobileMenuOpen}
                onClose={handleMobileMenuToggle}
              >
                <Box sx={{ width: 280, pt: 2 }}>
                  <List>
                    <ListItem button component={Link} to="/">
                      <ListItemIcon>
                        <HomeIcon />
                      </ListItemIcon>
                      <ListItemText primary="Accueil" />
                    </ListItem>
                    {Object.entries(mainMenuItems).map(([key, item]) => (
                      <ListItem
                        key={key}
                        button
                        component={Link}
                        to={`/${key}`}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.title} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Drawer>
            </>
          )}

          {/* Menu utilisateur */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {userMenuItems.map((section, index) => [
              <MenuItem key={`${section.title}-header`} disabled>
                <Typography variant="subtitle2" color="text.secondary">
                  {section.title}
                </Typography>
              </MenuItem>,
              section.links.map((link) => (
                <MenuItem
                  key={link.path}
                  component={Link}
                  to={link.path}
                  sx={{ py: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {link.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={link.title}
                    secondary={link.description}
                  />
                </MenuItem>
              )),
              index < userMenuItems.length - 1 && <Divider key={`${section.title}-divider`} />
            ]).flat()}
            <MenuItem onClick={logout} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Déconnexion" />
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
