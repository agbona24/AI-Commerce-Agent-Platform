import apiClient from './client';
import { ApiResponse, PaginatedResponse, Product, Category } from './types';

export interface ProductFilters {
  category_id?: string;
  status?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  page?: number;
  per_page?: number;
}

export interface CreateProductData {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  sale_price?: number;
  cost?: number;
  quantity?: number;
  category_id?: string;
  images?: string[];
  variants?: Array<{
    name: string;
    sku?: string;
    price?: number;
    quantity?: number;
    attributes: Record<string, string>;
  }>;
  attributes?: Record<string, unknown>;
  status?: 'active' | 'inactive' | 'draft';
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parent_id?: string;
  image?: string;
  sort_order?: number;
}

export const productService = {
  /**
   * Get paginated list of products
   */
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
      params: filters
    });
    return response.data;
  },

  /**
   * Get a single product by ID
   */
  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductData): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data);
    return response.data.data;
  },

  /**
   * Update a product
   */
  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  /**
   * Bulk update products
   */
  async bulkUpdate(ids: string[], data: Partial<UpdateProductData>): Promise<{ updated: number }> {
    const response = await apiClient.post<ApiResponse<{ updated: number }>>('/products/bulk-update', {
      ids,
      data
    });
    return response.data.data;
  },

  /**
   * Bulk delete products
   */
  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    const response = await apiClient.post<ApiResponse<{ deleted: number }>>('/products/bulk-delete', {
      ids
    });
    return response.data.data;
  },

  /**
   * Import products from file
   */
  async importProducts(file: File): Promise<{ imported: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<ApiResponse<{ imported: number; errors: string[] }>>('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  /**
   * Export products
   */
  async exportProducts(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const response = await apiClient.get('/products/export', {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Search products
   */
  async search(query: string, filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    return this.getProducts({ ...filters, search: query });
  },

  // Category methods
  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },

  /**
   * Get a single category
   */
  async getCategory(id: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  /**
   * Create a category
   */
  async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  },

  /**
   * Update a category
   */
  async updateCategory(id: string, data: Partial<CreateCategoryData>): Promise<Category> {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};

export default productService;
