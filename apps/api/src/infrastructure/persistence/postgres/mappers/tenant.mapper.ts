import { Tenant, BusinessCategory, TenantTheme, OpeningHours, PixConfig } from '@core/domain/entities/tenant.entity'

export interface TenantRow {
  id: string
  slug: string
  name: string
  description?: string | null
  logo?: string | null
  banner?: string | null
  phone_whatsapp: string
  address?: string | null
  business_category: string
  theme: string
  custom_domain?: string | null
  opening_hours?: OpeningHours | null
  pix_config?: PixConfig | null
  delivery_fee_cents?: number | null
  min_order_value_cents?: number | null
  categories?: unknown[] | null
  reviews?: unknown | null
  is_active?: boolean | null
  created_at?: Date | string | null
  updated_at?: Date | string | null
}

export class TenantMapper {
  static toDomain(row: TenantRow, categories: unknown[] = []): Tenant {
    return new Tenant({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description || undefined,
      logo: row.logo || undefined,
      banner: row.banner || undefined,
      phoneWhatsApp: row.phone_whatsapp,
      address: row.address || undefined,
      businessCategory: (row.business_category || 'menu') as BusinessCategory,
      theme: (row.theme || 'food') as TenantTheme,
      customDomain: row.custom_domain || undefined,
      openingHours: row.opening_hours || undefined,
      pixConfig: row.pix_config || undefined,
      deliveryFeeCents: row.delivery_fee_cents ?? 0,
      minOrderValueCents: row.min_order_value_cents ?? 0,
      categories: categories.length > 0 ? categories : (row.categories || []),
      reviews: row.reviews || undefined,
      isActive: row.is_active ?? true,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined
    })
  }

  static toPersistence(tenant: Tenant): Record<string, unknown> {
    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      description: tenant.description || null,
      logo: tenant.logo || null,
      banner: tenant.banner || null,
      phone_whatsapp: tenant.phoneWhatsApp,
      address: tenant.address || null,
      business_category: tenant.businessCategory,
      theme: tenant.theme,
      custom_domain: tenant.customDomain || null,
      opening_hours: tenant.openingHours ? JSON.stringify(tenant.openingHours) : null,
      pix_config: tenant.pixConfig ? JSON.stringify(tenant.pixConfig) : null,
      delivery_fee_cents: tenant.deliveryFeeCents,
      min_order_value_cents: tenant.minOrderValueCents,
      is_active: tenant.isActive,
      created_at: tenant.createdAt,
      updated_at: tenant.updatedAt
    }
  }
}
