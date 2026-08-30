// composables/useApiClient.ts
import { useRuntimeConfig } from '#app'
import { TenantSchema, type Tenant } from '~/types/tenant'

export interface HealthCheckResponse {
  status: string
  service: string
  timestamp: string
  uptime: number
}

export interface ApiTenantResponse {
  success: boolean
  data: Tenant
  meta: {
    isOpen: boolean
  }
}

export interface PixBrCodeResponse {
  success: boolean
  data: {
    pixKey: string
    keyType: string
    beneficiary: string
    amount: number
    copiaECola: string
    isTestMode: boolean
  }
}

export interface CreateOrderInput {
  tenantSlug: string
  customerName: string
  customerPhone: string
  deliveryType: 'delivery' | 'pickup'
  address?: {
    street: string
    number: string
    neighborhood: string
    cep?: string
    city?: string
    state?: string
    complement?: string
    reference?: string
  }
  items: Array<{
    productId: string
    productName: string
    quantity: number
    unitPriceCents: number
    options?: Array<{ id: string; name: string; priceCents: number }>
    observation?: string
  }>
  paymentMethod: 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro'
  changeForCents?: number
  isTestCent?: boolean
}

export interface CreateBookingInput {
  tenantId: string
  customerName: string
  customerPhone: string
  services: Array<{
    id: string
    name: string
    priceCents: number
    durationMinutes: number
  }>
  professionalId?: string
  professionalName?: string
  date: string
  time: string
  notes?: string
  paymentMode?: 'on_service' | 'pix_deposit' | 'pix_full'
}

/**
 * Cliente HTTP tipado e resiliente para comunicação com o Alaska Local Backend NestJS.
 */
export function useApiClient() {
  const config = useRuntimeConfig()
  const baseUrl = config.public?.apiBaseUrl || 'http://localhost:3333/api/v1'

  async function checkHealth(): Promise<HealthCheckResponse | null> {
    try {
      return await $fetch<HealthCheckResponse>(`${baseUrl}/health`, {
        timeout: 3000
      })
    } catch {
      return null
    }
  }

  async function fetchTenantBySlug(slug: string): Promise<Tenant | null> {
    try {
      const res = await $fetch<ApiTenantResponse>(`${baseUrl}/tenants/${slug}`, {
        timeout: 4000
      })
      if (res && res.success && res.data) {
        return TenantSchema.parse(res.data)
      }
      return null
    } catch {
      return null
    }
  }

  async function resolveTenantByDomain(host: string): Promise<Tenant | null> {
    try {
      const res = await $fetch<ApiTenantResponse>(`${baseUrl}/tenants/resolve`, {
        params: { host },
        timeout: 4000
      })
      if (res && res.success && res.data) {
        return TenantSchema.parse(res.data)
      }
      return null
    } catch {
      return null
    }
  }

  async function generatePixBrCode(params: {
    tenantSlug: string
    amount: number
    txid?: string
    isTestCent?: boolean
  }): Promise<PixBrCodeResponse['data'] | null> {
    try {
      const res = await $fetch<PixBrCodeResponse>(`${baseUrl}/pix/brcode`, {
        method: 'POST',
        body: params,
        timeout: 4000
      })
      return res?.data || null
    } catch {
      return null
    }
  }

  async function createOrder(input: CreateOrderInput): Promise<{ success: boolean; data?: unknown } | null> {
    try {
      return await $fetch<{ success: boolean; data: unknown }>(`${baseUrl}/orders`, {
        method: 'POST',
        body: input,
        timeout: 5000
      })
    } catch {
      return null
    }
  }

  async function createBooking(input: CreateBookingInput): Promise<{ success: boolean; data?: unknown } | null> {
    try {
      return await $fetch<{ success: boolean; data: unknown }>(`${baseUrl}/bookings`, {
        method: 'POST',
        body: input,
        timeout: 5000
      })
    } catch {
      return null
    }
  }

  return {
    baseUrl,
    checkHealth,
    fetchTenantBySlug,
    resolveTenantByDomain,
    generatePixBrCode,
    createOrder,
    createBooking
  }
}
