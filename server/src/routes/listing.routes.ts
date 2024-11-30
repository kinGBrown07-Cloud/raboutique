import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing
} from '../controllers/listing.controller';
import db from '../db'; // Assuming db is imported from another file

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Vérifier l'abonnement actif
const checkActiveSubscription = async (user_id: number) => {
  const [subscription] = await db.query(
    `SELECT us.*, sp.max_listings 
    FROM user_subscriptions us 
    JOIN subscription_plans sp ON us.plan_id = sp.id 
    WHERE us.user_id = ? 
    AND us.status = 'active' 
    AND us.end_date >= CURDATE()`,
    [user_id]
  );
  return subscription[0];
};

// Compter les annonces actives
const countActiveListings = async (user_id: number) => {
  const [result] = await db.query(
    'SELECT COUNT(*) as count FROM listings WHERE user_id = ? AND status = "active"',
    [user_id]
  );
  return result[0].count;
};

// Créer une annonce
router.post('/', async (req, res) => {
  try {
    const { title, description, price, type, stock } = req.body;
    const user_id = req.user.id;

    // Vérifier l'abonnement
    const subscription = await checkActiveSubscription(user_id);
    if (!subscription) {
      return res.status(403).json({
        status: 'error',
        message: 'Abonnement requis pour créer des annonces'
      });
    }

    // Vérifier le nombre d'annonces
    const listingCount = await countActiveListings(user_id);
    if (listingCount >= subscription.max_listings) {
      return res.status(403).json({
        status: 'error',
        message: 'Limite d\'annonces atteinte pour votre abonnement'
      });
    }

    const [result] = await db.query(
      `INSERT INTO listings 
      (user_id, title, description, price, type, stock, last_renewal_date) 
      VALUES (?, ?, ?, ?, ?, ?, CURDATE())`,
      [user_id, title, description, price, type, stock]
    );

    res.status(201).json({
      status: 'success',
      data: {
        listing: {
          id: result.insertId,
          user_id,
          title,
          description,
          price,
          type,
          stock,
          status: 'draft'
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
});

// Obtenir toutes les annonces
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query;
    let query = `
      SELECT l.*, u.name as owner_name 
      FROM listings l
      JOIN users u ON l.user_id = u.id
      JOIN user_subscriptions us ON l.user_id = us.user_id
      WHERE us.status = 'active' 
      AND us.end_date >= CURDATE()
      AND (l.stock IS NULL OR l.stock > 0)
      AND l.last_renewal_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `;

    const params = [];
    if (type) {
      query += ' AND l.type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }

    const [listings] = await db.query(query, params);
    res.json({
      status: 'success',
      data: { listings }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
});

// Mettre à jour une annonce
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, status, stock } = req.body;
    const user_id = req.user.id;

    // Vérifier l'abonnement si on active l'annonce
    if (status === 'active') {
      const subscription = await checkActiveSubscription(user_id);
      if (!subscription) {
        return res.status(403).json({
          status: 'error',
          message: 'Abonnement actif requis pour activer des annonces'
        });
      }
    }

    // Mettre à jour la date de renouvellement si le stock est modifié
    let updateQuery = `
      UPDATE listings 
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          status = COALESCE(?, status),
          stock = COALESCE(?, stock)
    `;
    const params = [title, description, price, status, stock];

    if (stock !== undefined) {
      updateQuery += ', last_renewal_date = CURDATE()';
    }

    updateQuery += ' WHERE id = ? AND user_id = ?';
    params.push(id, user_id);

    const [result] = await db.query(updateQuery, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Annonce non trouvée ou non autorisée'
      });
    }

    res.json({
      status: 'success',
      message: 'Annonce mise à jour'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
});

// Supprimer une annonce
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [result] = await db.query('DELETE FROM listings WHERE id = ? AND user_id = ?', [id, user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Annonce non trouvée ou non autorisée'
      });
    }

    res.json({
      status: 'success',
      message: 'Annonce supprimée'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
});

export default router;
