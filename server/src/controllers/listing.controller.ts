import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pool from '../config/database';
import { AppError } from '../middleware/error.middleware';

const createListingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0),
  type: z.enum(['product', 'business', 'event', 'travel', 'voucher'])
});

const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['draft', 'pending', 'active', 'rejected']).optional()
});

export const createListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const data = createListingSchema.parse(req.body);

    const [result] = await pool.execute(
      'INSERT INTO listings (user_id, title, description, price, type) VALUES (?, ?, ?, ?, ?)',
      [userId, data.title, data.description, data.price, data.type]
    );

    const listingId = (result as any).insertId;

    const [listings] = await pool.execute(
      'SELECT * FROM listings WHERE id = ?',
      [listingId]
    );

    res.status(201).json({
      status: 'success',
      data: {
        listing: (listings as any[])[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getListings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, status } = req.query;
    let query = 'SELECT * FROM listings WHERE 1=1';
    const params: any[] = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    // Si l'utilisateur n'est pas admin, ne montrer que ses annonces
    if (req.user?.role !== 'admin') {
      query += ' AND user_id = ?';
      params.push(req.user?.id);
    }

    query += ' ORDER BY created_at DESC';

    const [listings] = await pool.execute(query, params);

    res.json({
      status: 'success',
      data: {
        listings
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const [listings] = await pool.execute(
      'SELECT * FROM listings WHERE id = ?',
      [id]
    );

    const listing = (listings as any[])[0];

    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    // Vérifier si l'utilisateur a le droit de voir cette annonce
    if (req.user?.role !== 'admin' && listing.user_id !== req.user?.id) {
      throw new AppError('Not authorized to access this listing', 403);
    }

    res.json({
      status: 'success',
      data: {
        listing
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = updateListingSchema.parse(req.body);

    // Vérifier si l'annonce existe et appartient à l'utilisateur
    const [listings] = await pool.execute(
      'SELECT * FROM listings WHERE id = ?',
      [id]
    );

    const listing = (listings as any[])[0];

    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    if (req.user?.role !== 'admin' && listing.user_id !== req.user?.id) {
      throw new AppError('Not authorized to update this listing', 403);
    }

    // Construire la requête de mise à jour dynamiquement
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return res.json({
        status: 'success',
        data: {
          listing
        }
      });
    }

    values.push(id);

    await pool.execute(
      `UPDATE listings SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedListings] = await pool.execute(
      'SELECT * FROM listings WHERE id = ?',
      [id]
    );

    res.json({
      status: 'success',
      data: {
        listing: (updatedListings as any[])[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Vérifier si l'annonce existe et appartient à l'utilisateur
    const [listings] = await pool.execute(
      'SELECT * FROM listings WHERE id = ?',
      [id]
    );

    const listing = (listings as any[])[0];

    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    if (req.user?.role !== 'admin' && listing.user_id !== req.user?.id) {
      throw new AppError('Not authorized to delete this listing', 403);
    }

    await pool.execute('DELETE FROM listings WHERE id = ?', [id]);

    res.json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
