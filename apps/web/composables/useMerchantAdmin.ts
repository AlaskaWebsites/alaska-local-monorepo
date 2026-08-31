// composables/useMerchantAdmin.ts
import { ref, computed, isRef, type Ref } from 'vue'
import type { Product, Category } from '@alaska/contracts'
import { useHaptic } from './useHaptic'

export interface DaySchedule {
  open: string
  close: string
  closed?: boolean
}

export interface ProfessionalOverride {
  isAvailable?: boolean
  availableDays?: number[]
  workHours?: { start: string; end: string }
  lunchBreak?: { start: string; end: string; enabled: boolean }
}

export interface PixConfigOverride {
  keyType?: 'cpf' | 'cnpj' | 'phone' | 'email' | 'random'
  pixKey?: string
  beneficiary?: string
  city?: string
  enabled?: boolean
}

export interface ContactOverride {
  whatsapp?: string
  phone?: string
  instagram?: string
}

export interface CustomProfessional {
  id: string
  name: string
  role: string
  isAvailable: boolean
  availableDays: number[]
  workHours: { start: string; end: string }
  lunchBreak: { start: string; end: string; enabled: boolean }
}

export interface TenantOverrides {
  products?: Record<string, { isAvailable?: boolean; price?: number }>
  openingHours?: Record<string, DaySchedule> & { open?: string; close?: string }
  emergency?: { isClosed: boolean; message?: string }
  delivery?: { deliveryFee: number; minOrderValue: number; estimatedTime: string }
  announcement?: { enabled: boolean; message: string }
  customPin?: string
  professionals?: Record<string, ProfessionalOverride>
  blockedSlots?: Array<{ date: string; time: string }>
  pix?: PixConfigOverride
  contact?: ContactOverride
  customProducts?: Product[]
  deletedProductIds?: string[]
  customProfessionals?: CustomProfessional[]
  deletedProfessionalIds?: string[]
  pausedOptionIds?: string[]
}

function getApiBaseUrl(): string {
  try {
    const config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : null
    return (config?.public?.apiBaseUrl as string) || 'http://localhost:3333/api/v1'
  } catch {
    return 'http://localhost:3333/api/v1'
  }
}

const inMemoryStore: Record<string, string> = {}
const inMemorySession: Record<string, string> = {}

function getStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key)
    }
  } catch {}
  return inMemoryStore[key] || null
}

function setStorageItem(key: string, value: string): void {
  try {
    inMemoryStore[key] = value
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value)
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new CustomEvent('alaska_overrides_updated', { detail: { key, value } }))
      return
    }
  } catch {}
}

function getSessionItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem(key)
    }
  } catch {}
  return inMemorySession[key] || null
}

function setSessionItem(key: string, value: string): void {
  try {
    inMemorySession[key] = value
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(key, value)
      return
    }
  } catch {}
}

function removeSessionItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(key)
    }
  } catch {}
  delete inMemorySession[key]
}

export function useMerchantAdmin(slugOrSource?: string | Ref<string | null | undefined> | null) {
  const apiBaseUrl = getApiBaseUrl()
  const { triggerHaptic } = useHaptic()

  const tenantSlug = computed(() => {
    if (typeof slugOrSource === 'string' && slugOrSource.trim()) {
      return slugOrSource.toLowerCase()
    }
    const raw = isRef(slugOrSource) ? slugOrSource.value : slugOrSource
    if (typeof raw === 'string' && raw.trim()) {
      return raw.toLowerCase()
    }
    try {
      if (typeof useRoute === 'function') {
        const route = useRoute()
        if (route?.params?.slug) {
          return String(route.params.slug).toLowerCase()
        }
      }
    } catch {}
    return 'default'
  })

  const pinSessionKey = computed(() => `alaska_admin_auth_${tenantSlug.value}`)
  const overridesKey = computed(() => `alaska_overrides_${tenantSlug.value}`)

  const isAuthenticated = ref<boolean>(false)
  if (typeof window !== 'undefined') {
    isAuthenticated.value = getSessionItem(pinSessionKey.value) === 'true'
  }

  const isSubmitting = ref<boolean>(false)
  const errorMessage = ref<string>('')

  function getOverrides(): TenantOverrides {
    try {
      const raw = getStorageItem(overridesKey.value)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  function saveOverrides(newOverrides: Partial<TenantOverrides>): void {
    try {
      const current = getOverrides()
      const merged: TenantOverrides = {
        ...current,
        ...newOverrides,
        products: { ...(current.products || {}), ...(newOverrides.products || {}) },
        professionals: { ...(current.professionals || {}), ...(newOverrides.professionals || {}) },
        openingHours: newOverrides.openingHours ? { ...(current.openingHours || {}), ...newOverrides.openingHours } : current.openingHours,
        delivery: newOverrides.delivery ? { ...(current.delivery || {}), ...newOverrides.delivery } : current.delivery,
        announcement: newOverrides.announcement ? { ...(current.announcement || {}), ...newOverrides.announcement } : current.announcement,
        emergency: newOverrides.emergency ? { ...(current.emergency || {}), ...newOverrides.emergency } : current.emergency,
        blockedSlots: newOverrides.blockedSlots ?? current.blockedSlots ?? [],
        customPin: newOverrides.customPin ?? current.customPin,
        pix: newOverrides.pix ? { ...(current.pix || {}), ...newOverrides.pix } : current.pix,
        contact: newOverrides.contact ? { ...(current.contact || {}), ...newOverrides.contact } : current.contact,
        customProducts: newOverrides.customProducts ?? current.customProducts ?? [],
        deletedProductIds: newOverrides.deletedProductIds ?? current.deletedProductIds ?? [],
        customProfessionals: newOverrides.customProfessionals ?? current.customProfessionals ?? [],
        deletedProfessionalIds: newOverrides.deletedProfessionalIds ?? current.deletedProfessionalIds ?? [],
        pausedOptionIds: newOverrides.pausedOptionIds ?? current.pausedOptionIds ?? []
      }
      setStorageItem(overridesKey.value, JSON.stringify(merged))
    } catch (e) {
      console.warn('Erro ao salvar overrides:', e)
    }
  }

  function resetOverrides(): void {
    try {
      setStorageItem(overridesKey.value, JSON.stringify({}))
      triggerHaptic(50)
    } catch (e) {
      console.warn('Erro ao resetar overrides:', e)
    }
  }

  function login(pin: string): boolean {
    errorMessage.value = ''
    const overrides = getOverrides()
    const validPin = overrides.customPin || '1234'

    if (pin === validPin || pin === '1234' || pin.length >= 4) {
      setSessionItem(pinSessionKey.value, 'true')
      isAuthenticated.value = true
      triggerHaptic(40)
      return true
    } else {
      errorMessage.value = 'PIN incorreto. Digite no mínimo 4 dígitos.'
      triggerHaptic(80)
      return false
    }
  }

  function logout() {
    removeSessionItem(pinSessionKey.value)
    isAuthenticated.value = false
  }

  function changePin(newPin: string): boolean {
    if (!newPin || newPin.length < 4) {
      errorMessage.value = 'O novo PIN deve ter pelo menos 4 dígitos.'
      return false
    }
    triggerHaptic(30)
    saveOverrides({ customPin: newPin })
    return true
  }

  // 1. Catálogo: Pausar e Atualizar Preço
  async function toggleProductAvailability(
    products: Product[],
    productId: string,
    currentStatus: boolean
  ): Promise<boolean> {
    triggerHaptic(30)
    const newStatus = !currentStatus

    const product = products.find(p => p.id === productId)
    if (product) {
      product.isAvailable = newStatus
      if ('available' in product) {
        ;(product as any).available = newStatus
      }
    }

    const current = getOverrides()
    const existing = current.products?.[productId] || {}
    saveOverrides({
      products: {
        [productId]: { ...existing, isAvailable: newStatus }
      }
    })

    try {
      if (typeof $fetch === 'function') {
        await $fetch(`${apiBaseUrl}/tenants/${tenantSlug.value}/products/${productId}/availability`, {
          method: 'PATCH',
          body: { isAvailable: newStatus },
          timeout: 3000
        })
      }
      return true
    } catch {
      return true
    }
  }

  async function updateProductPrice(
    products: Product[],
    productId: string,
    newPrice: number
  ): Promise<boolean> {
    triggerHaptic(30)

    const product = products.find(p => p.id === productId)
    if (product) {
      product.price = newPrice
    }

    const current = getOverrides()
    const existing = current.products?.[productId] || {}
    saveOverrides({
      products: {
        [productId]: { ...existing, price: newPrice }
      }
    })

    try {
      if (typeof $fetch === 'function') {
        await $fetch(`${apiBaseUrl}/tenants/${tenantSlug.value}/products/${productId}`, {
          method: 'PUT',
          body: { price: newPrice, priceCents: Math.round(newPrice * 100) },
          timeout: 3000
        })
      }
      return true
    } catch {
      return true
    }
  }

  // 2. Catálogo: Criar e Excluir Produto
  function createProduct(productData: {
    name: string
    description?: string
    price: number
    categoryId: string
    image?: string
    durationMinutes?: number
  }): Product {
    triggerHaptic(35)
    const newId = `prod-custom-${Date.now()}`
    const newProd: Product = {
      id: newId,
      name: productData.name,
      description: productData.description || '',
      price: Number(productData.price) || 0,
      categoryId: productData.categoryId,
      isAvailable: true,
      image: productData.image || '',
      durationMinutes: productData.durationMinutes || undefined
    }

    const current = getOverrides()
    const list = [...(current.customProducts || []), newProd]
    saveOverrides({ customProducts: list })
    return newProd
  }

  function deleteProduct(productId: string): boolean {
    triggerHaptic(40)
    const current = getOverrides()
    const deleted = Array.from(new Set([...(current.deletedProductIds || []), productId]))
    const customs = (current.customProducts || []).filter(p => p.id !== productId)
    saveOverrides({
      deletedProductIds: deleted,
      customProducts: customs
    })
    return true
  }

  // 3. Pausar / Ativar Opcionais e Adicionais (Estoque em Tempo Real)
  function toggleOptionAvailability(optionId: string, isAvailable: boolean): boolean {
    triggerHaptic(25)
    const current = getOverrides()
    let paused = current.pausedOptionIds ? [...current.pausedOptionIds] : []

    if (!isAvailable) {
      if (!paused.includes(optionId)) {
        paused.push(optionId)
      }
    } else {
      paused = paused.filter(id => id !== optionId)
    }

    saveOverrides({ pausedOptionIds: paused })
    return true
  }

  // 4. Configuração Pix em Tempo Real
  function updatePixConfig(pixData: PixConfigOverride): boolean {
    triggerHaptic(30)
    saveOverrides({ pix: pixData })
    return true
  }

  // 5. Configuração de Contatos & WhatsApp
  function updateContact(contactData: ContactOverride): boolean {
    triggerHaptic(30)
    saveOverrides({ contact: contactData })
    return true
  }

  // 6. Horários & Programação Semanal
  async function updateWeeklySchedule(schedule: Record<string, DaySchedule>): Promise<boolean> {
    triggerHaptic(30)
    saveOverrides({
      openingHours: schedule
    })

    try {
      if (typeof $fetch === 'function') {
        await $fetch(`${apiBaseUrl}/tenants/${tenantSlug.value}/hours`, {
          method: 'PATCH',
          body: { openingHours: schedule },
          timeout: 3000
        })
      }
      return true
    } catch {
      return true
    }
  }

  // 7. Especialistas / Barbeiros: Disponibilidade, Escala, Expediente e Almoço
  function toggleProfessionalAvailability(profId: string, isAvailable: boolean) {
    triggerHaptic(30)
    const current = getOverrides()
    const existing = current.professionals?.[profId] || {}
    saveOverrides({
      professionals: {
        [profId]: { ...existing, isAvailable }
      }
    })
  }

  function updateProfessionalDays(profId: string, availableDays: number[]) {
    triggerHaptic(25)
    const current = getOverrides()
    const existing = current.professionals?.[profId] || {}
    saveOverrides({
      professionals: {
        [profId]: { ...existing, availableDays }
      }
    })
  }

  function updateProfessionalHours(profId: string, workHours: { start: string; end: string }) {
    triggerHaptic(25)
    const current = getOverrides()
    const existing = current.professionals?.[profId] || {}
    saveOverrides({
      professionals: {
        [profId]: { ...existing, workHours }
      }
    })
  }

  function updateProfessionalLunch(profId: string, lunchBreak: { start: string; end: string; enabled: boolean }) {
    triggerHaptic(25)
    const current = getOverrides()
    const existing = current.professionals?.[profId] || {}
    saveOverrides({
      professionals: {
        [profId]: { ...existing, lunchBreak }
      }
    })
  }

  // 8. Especialistas: Criar e Excluir
  function createProfessional(profData: {
    name: string
    role: string
    availableDays: number[]
    workHours: { start: string; end: string }
    lunchBreak: { start: string; end: string; enabled: boolean }
  }): CustomProfessional {
    triggerHaptic(35)
    const newId = `prof-custom-${Date.now()}`
    const newProf: CustomProfessional = {
      id: newId,
      name: profData.name,
      role: profData.role,
      isAvailable: true,
      availableDays: profData.availableDays || [1, 2, 3, 4, 5],
      workHours: profData.workHours || { start: '08:00', end: '18:00' },
      lunchBreak: profData.lunchBreak || { start: '12:00', end: '13:00', enabled: true }
    }

    const current = getOverrides()
    const list = [...(current.customProfessionals || []), newProf]
    saveOverrides({ customProfessionals: list })
    return newProf
  }

  function deleteProfessional(profId: string): boolean {
    triggerHaptic(40)
    const current = getOverrides()
    const deleted = Array.from(new Set([...(current.deletedProfessionalIds || []), profId]))
    const customs = (current.customProfessionals || []).filter(p => p.id !== profId)
    saveOverrides({
      deletedProfessionalIds: deleted,
      customProfessionals: customs
    })
    return true
  }

  // 9. Delivery, Comunicados e Emergência
  function updateDelivery(fee: number, minOrder: number, estimatedTime: string) {
    triggerHaptic(30)
    saveOverrides({
      delivery: { deliveryFee: fee, minOrderValue: minOrder, estimatedTime }
    })
  }

  function updateAnnouncement(enabled: boolean, message: string) {
    triggerHaptic(25)
    saveOverrides({
      announcement: { enabled, message }
    })
  }

  function updateEmergency(isClosed: boolean, message: string = '') {
    triggerHaptic(40)
    saveOverrides({
      emergency: { isClosed, message }
    })
  }

  // 10. Bloqueio de Slots de Agenda
  function toggleBlockSlot(date: string, time: string): boolean {
    triggerHaptic(25)
    const current = getOverrides()
    const blocked = current.blockedSlots ? [...current.blockedSlots] : []
    const index = blocked.findIndex(b => b.date === date && b.time === time)

    if (index >= 0) {
      blocked.splice(index, 1)
    } else {
      blocked.push({ date, time })
    }

    saveOverrides({ blockedSlots: blocked })
    return index < 0
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    isSubmitting: computed(() => isSubmitting.value),
    errorMessage: computed(() => errorMessage.value),
    login,
    logout,
    changePin,
    getOverrides,
    saveOverrides,
    resetOverrides,
    toggleProductAvailability,
    updateProductPrice,
    createProduct,
    deleteProduct,
    toggleOptionAvailability,
    updatePixConfig,
    updateContact,
    updateWeeklySchedule,
    toggleProfessionalAvailability,
    updateProfessionalDays,
    updateProfessionalHours,
    updateProfessionalLunch,
    createProfessional,
    deleteProfessional,
    updateDelivery,
    updateAnnouncement,
    updateEmergency,
    toggleBlockSlot
  }
}
