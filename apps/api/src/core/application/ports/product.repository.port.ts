import { Product } from '@core/domain/entities/product.entity'

export interface IProductRepository {
  findById(id: string): Promise<Product | null>
  listByTenantSlug(tenantSlug: string): Promise<Product[]>
  toggleAvailability(productId: string, isAvailable: boolean): Promise<Product>
  update(productId: string, data: Partial<Product>): Promise<Product>
  save(product: Product): Promise<void>
}
