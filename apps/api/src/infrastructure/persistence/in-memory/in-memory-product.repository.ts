import { IProductRepository } from '@core/application/ports/product.repository.port'
import { Product } from '@core/domain/entities/product.entity'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'

export class InMemoryProductRepository implements IProductRepository {
  private products: Map<string, Product> = new Map()

  constructor() {
    this.seedDefaults()
  }

  private seedDefaults() {
    const defaultProducts = [
      // Hamburgueria X
      { id: 'prod-x-burger', tenantId: 'hamburgueria-x', categoryId: 'cat-burgers', name: 'Smash X-Burger Clássico', priceCents: 3200 },
      { id: 'prod-x-bacon', tenantId: 'hamburgueria-x', categoryId: 'cat-burgers', name: 'Smash Bacon Duplo', priceCents: 3600 },
      { id: 'prod-x-salada', tenantId: 'hamburgueria-x', categoryId: 'cat-burgers', name: 'Smash X-Salada Especial', priceCents: 3400 },
      { id: 'prod-batata-rustica', tenantId: 'hamburgueria-x', categoryId: 'cat-porcoes', name: 'Batata Rústica com Alecrim', priceCents: 1800 },
      { id: 'prod-batata-cheddar-bacon', tenantId: 'hamburgueria-x', categoryId: 'cat-porcoes', name: 'Batata Especial Cheddar & Bacon', priceCents: 2400 },
      { id: 'prod-coca-cola', tenantId: 'hamburgueria-x', categoryId: 'cat-bebidas', name: 'Coca-Cola Lata 350ml', priceCents: 600 },
      { id: 'prod-guarana', tenantId: 'hamburgueria-x', categoryId: 'cat-bebidas', name: 'Guaraná Antarctica 350ml', priceCents: 600 },

      // Adega Prime
      { id: 'combo-gin-tanqueray', tenantId: 'adega-prime', categoryId: 'combos-kits', name: 'Combo Gin Tanqueray 750ml + 4 Red Bull', priceCents: 18900 },
      { id: 'combo-whisky-redlabel', tenantId: 'adega-prime', categoryId: 'combos-kits', name: 'Combo Whisky Red Label 1L + 4 Energéticos', priceCents: 15900 },
      { id: 'combo-vodka-smirnoff', tenantId: 'adega-prime', categoryId: 'combos-kits', name: 'Combo Vodka Smirnoff 1L + 4 Baly Tropical', priceCents: 9900 },
      { id: 'pack-heineken-lata', tenantId: 'adega-prime', categoryId: 'cervejas-packs', name: 'Pack Cerveja Heineken Lata 350ml (12 Unidades)', priceCents: 6990 },
      { id: 'pack-spaten-lata', tenantId: 'adega-prime', categoryId: 'cervejas-packs', name: 'Pack Cerveja Spaten Lata 350ml (12 Unidades)', priceCents: 5490 },
      { id: 'corona-long-neck', tenantId: 'adega-prime', categoryId: 'cervejas-packs', name: 'Cerveja Corona Extra Long Neck 330ml Gelada', priceCents: 990 },
      { id: 'saco-gelo-cubo-5kg', tenantId: 'adega-prime', categoryId: 'gelos-conveniencia', name: 'Saco de Gelo em Cubo Filtrado 5kg', priceCents: 1500 },
      { id: 'gelo-sabor-coco-pote', tenantId: 'adega-prime', categoryId: 'gelos-conveniencia', name: 'Gelo de Sabor Coco com Maracujá 200ml', priceCents: 500 },
      { id: 'energetico-monster-473ml', tenantId: 'adega-prime', categoryId: 'refrigerantes-energeticos', name: 'Energético Monster Energy 473ml Lata Gelado', priceCents: 1190 },
      { id: 'coca-cola-2l', tenantId: 'adega-prime', categoryId: 'refrigerantes-energeticos', name: 'Refrigerante Coca-Cola Original 2 Litros Gelada', priceCents: 1390 },
      { id: 'carvao-vegetal-3kg', tenantId: 'adega-prime', categoryId: 'gelos-conveniencia', name: 'Saco de Carvão Vegetal Especial 3kg', priceCents: 2200 },

      // Barbearia Style
      { id: 'prod-corte-degrade', tenantId: 'barbearia-style', categoryId: 'cortes-cabelo', name: 'Corte Degradé / Fade Navalhado', priceCents: 4500 },
      { id: 'prod-corte-social', tenantId: 'barbearia-style', categoryId: 'cortes-cabelo', name: 'Corte Social Tradicional na Tesoura', priceCents: 4000 },
      { id: 'prod-barboterapia', tenantId: 'barbearia-style', categoryId: 'barba-tratamentos', name: 'Barba Terapia com Toalha Quente', priceCents: 4000 },
      { id: 'prod-corte-barba', tenantId: 'barbearia-style', categoryId: 'combos-estetica', name: 'Combo Completo: Corte Degradé + Barboterapia', priceCents: 7500 },
      { id: 'prod-pigmentacao', tenantId: 'barbearia-style', categoryId: 'combos-estetica', name: 'Pigmentação Capilar e Alinhamento de Barba', priceCents: 3000 },
      { id: 'prod-pomada-matte', tenantId: 'barbearia-style', categoryId: 'produtos-barber', name: 'Pomada Modeladora Efeito Matte 150g', priceCents: 3500 },
      { id: 'prod-oleo-barba', tenantId: 'barbearia-style', categoryId: 'produtos-barber', name: 'Óleo Hidratante para Barba 30ml', priceCents: 2990 },
      { id: 'prod-cerveja-artesanal', tenantId: 'barbearia-style', categoryId: 'produtos-barber', name: 'Cerveja Artesanal IPA 500ml', priceCents: 1800 }
    ]

    for (const item of defaultProducts) {
      this.products.set(
        item.id,
        new Product({
          id: item.id,
          tenantId: item.tenantId,
          categoryId: item.categoryId,
          name: item.name,
          priceCents: item.priceCents,
          isAvailable: true
        })
      )
    }
  }

  async findById(id: string): Promise<Product | null> {
    if (id === 'prod-inexistente') return null
    let product = this.products.get(id)
    if (!product) {
      // Cria sob demanda para produtos dinâmicos não mapeados estaticamente
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
    let product = await this.findById(productId)
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
    let product = await this.findById(productId)
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
