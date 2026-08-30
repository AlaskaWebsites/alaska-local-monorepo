import { IProductRepository } from '@core/application/ports/product.repository.port'
import { Product } from '@core/domain/entities/product.entity'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'

export class InMemoryProductRepository implements IProductRepository {
  private products: Map<string, Product> = new Map()

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) || null
  }

  async listByTenantSlug(tenantSlug: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.tenantId === tenantSlug)
  }

  async toggleAvailability(productId: string, isAvailable: boolean): Promise<Product> {
    const product = this.products.get(productId)
    if (!product) {
      throw new EntityNotFoundError('Product', productId)
    }

    const updated = new Product({
      id: product.id,
      tenantId: product.tenantId,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      priceCents: product.price.inCents,
      imageUrl: product.imageUrl,
      isAvailable,
      optionGroups: product.optionGroups,
      createdAt: product.createdAt
    })
    this.products.set(productId, updated)
    return updated
  }

  async update(productId: string, data: Partial<Product> & { priceCents?: number }): Promise<Product> {
    const product = this.products.get(productId)
    if (!product) {
      throw new EntityNotFoundError('Product', productId)
    }

    const updated = new Product({
      id: product.id,
      tenantId: product.tenantId,
      categoryId: product.categoryId,
      name: data.name ?? product.name,
      description: data.description ?? product.description,
      priceCents: data.priceCents !== undefined ? data.priceCents : product.price.inCents,
      imageUrl: product.imageUrl,
      isAvailable: data.isAvailable ?? product.isAvailable,
      optionGroups: product.optionGroups,
      createdAt: product.createdAt
    })
    this.products.set(productId, updated)
    return updated
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product)
  }
}
