import { ProductService } from '../product.service';
import { db } from '../../database/db';
import { mockProduct, mockProductList } from '../__mocks__/product.mock';

jest.mock('../../database/db');

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return a list of products with pagination', async () => {
      const mockQuery = jest.spyOn(db, 'query');
      mockQuery.mockResolvedValueOnce({ rows: mockProductList, rowCount: 100 });

      const result = await ProductService.getProducts({
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(mockProductList);
      expect(result.pagination).toEqual({
        total: 100,
        pages: 10,
        current_page: 1,
        per_page: 10,
      });
    });

    it('should apply filters correctly', async () => {
      const mockQuery = jest.spyOn(db, 'query');
      mockQuery.mockResolvedValueOnce({ rows: mockProductList, rowCount: 50 });

      const result = await ProductService.getProducts({
        page: 1,
        limit: 10,
        category: 'fruits',
        minPrice: 10,
        maxPrice: 100,
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE category = $1 AND price >= $2 AND price <= $3'),
        ['fruits', 10, 100]
      );
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const mockQuery = jest.spyOn(db, 'query');
      mockQuery.mockResolvedValueOnce({ rows: [mockProduct] });

      const result = await ProductService.createProduct(mockProduct);

      expect(result).toEqual(mockProduct);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products'),
        expect.arrayContaining([
          mockProduct.name,
          mockProduct.description,
          mockProduct.price,
        ])
      );
    });

    it('should throw error if validation fails', async () => {
      const invalidProduct = { ...mockProduct, price: -1 };

      await expect(ProductService.createProduct(invalidProduct))
        .rejects
        .toThrow('Invalid product data');
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      const mockQuery = jest.spyOn(db, 'query');
      mockQuery.mockResolvedValueOnce({ rows: [mockProduct] });

      const result = await ProductService.updateProduct(
        mockProduct.id,
        { price: 150 }
      );

      expect(result).toEqual(mockProduct);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE products'),
        expect.arrayContaining([150, mockProduct.id])
      );
    });

    it('should return null if product not found', async () => {
      const mockQuery = jest.spyOn(db, 'query');
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await ProductService.updateProduct(
        'non-existent-id',
        { price: 150 }
      );

      expect(result).toBeNull();
    });
  });

  describe('deleteProduct', () => {
    it('should delete an existing product', async () => {
      const mockQuery = jest.spyOn(db, 'query');
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await ProductService.deleteProduct(mockProduct.id);

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM products'),
        [mockProduct.id]
      );
    });

    it('should return false if product not found', async () => {
      const mockQuery = jest.spyOn(db, 'query');
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      const result = await ProductService.deleteProduct('non-existent-id');

      expect(result).toBe(false);
    });
  });
});
