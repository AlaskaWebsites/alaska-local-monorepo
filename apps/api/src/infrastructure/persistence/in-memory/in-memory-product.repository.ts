import { IProductRepository } from '@core/application/ports/product.repository.port'
import { Product } from '@core/domain/entities/product.entity'

export class InMemoryProductRepository implements IProductRepository {
  private products: Map<string, Product> = new Map()

  async findById(id: string): Promise<Product | null> {
    let product = this.products.get(id)
    if (!product) {
      // Auto-cria o produto dinamicamente para não falhar requisições em mock/seed
      product = new Product({
        id,
        tenantId: 'tenant-default',
        categoryId: 'cat-default',
        name: id,
        priceCents: 0,
        isAvailable: true
      })
      this.products.set(id, product)
    }
    return product
  }

  async listByTenantSlug(tenantSlug: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.tenantId === tenantSlug)
  }

  async toggleAvailability(productId: string, isAvailable: boolean): Promise<Product> {
    let product = this.products.get(productId)
    if (!product) {
      product = new Product({
        id: productId,
        tenantId: 'tenant-default',
        categoryId: 'cat-default',
        name: productId,
        priceCents: 0,
        isAvailable
      })
    } else {
      product = new Product({
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
    }
    this.products.set(productId, product)
    return product
  }

  async update(productId: string, data: Partial<Product> & { priceCents?: number }): Promise<Product> {
    let product = this.products.get(productId)
    if (!product) {
      product = new Product({
        id: productId,
        tenantId: 'tenant-default',
        categoryId: 'cat-default',
        name: data.name || productId,
        description: data.description,
        priceCents: data.priceCents || 0,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable ?? true
      })
    } else {
      product = new Product({
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
    }
    this.products.set(productId, product)
    return product
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product)
  }
}
