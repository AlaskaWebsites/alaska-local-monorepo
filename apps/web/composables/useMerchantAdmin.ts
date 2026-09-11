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
    const url = (config?.public?.apiBaseUrl as string)
    if (url && !url.includes('localhost')) return url
    if (typeof window !== 'undefined') {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return 'https://alaska-local-api.onrender.com/api/v1'
      }
    }
    return url || 'https://alaska-local-api.onrender.com/api/v1'
  } catch {
    return 'https://alaska-local-api.onrender.com/api/v1'
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

export function useMerchantAdmin(slugOrSource?: string | Ref<string | null | undefined> | { slug?: string } | null) {
  const { triggerHaptic } = useHaptic()
  const apiBaseUrl = getApiBaseUrl()

  const tenantSlug = computed(() => {
    if (!slugOrSource) return 'default'
    if (typeof slugOrSource === 'string') return slugOrSource.trim().toLowerCase()
    const raw = isRef(slugOrSource) ? slugOrSource.value : slugOrSource
    if (!raw) return 'default'
    if (typeof raw === 'string') return raw.trim().toLowerCase()
    return raw.slug ? String(raw.slug).trim().toLowerCase() : 'default'
  })

  const pinSessionKey = computed(() => `alaska_admin_session_${tenantSlug.value}`)
  const overridesKey = computed(() => `alaska_overrides_${tenantSlug.value}`)

  const isAuthenticated = ref(getSessionItem(pinSessionKey.value) === 'true')
  const isSubmitting = ref(false)
  const errorMessage = ref('')

  function getOverrides(): TenantOverrides {
    try {
      const raw = getStorageItem(overridesKey.value)
      return raw ? JSON.parse(raw) : {}
    } catch (e) {
      console.warn('Erro ao carregar overrides:', e)
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

    if (pin === validPin) {
      isAuthenticated.value = true
      setSessionItem(pinSessionKey.value, 'true')
      triggerHaptic(30)
      return true
    }

    errorMessage.value = 'PIN incorreto. Tente novamente.'
    triggerHaptic(50)
    return false
  }

  function logout(): void {
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

    // Atualização otimista em memória na lista atual
    // Não gravamos no localStorage para não criar divergência entre mobile e desktop

    try {
      if (typeof $fetch === 'function') {
        const url = `${apiBaseUrl}/tenants/${tenantSlug.value}/products/${productId}/availability`
        console.log(`[AlaskaAdmin] Enviando PATCH para ${url}:`, { isAvailable: newStatus })
        await $fetch(url, {
          method: 'PATCH',
          body: { isAvailable: newStatus },
          timeout: 6000
        })
      }
      return true
    } catch (err) {
      console.error('[AlaskaAdmin] Erro ao sincronizar disponibilidade no backend:', err)
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
          body: {
            price: newPrice,
            priceCents: Math.round(newPrice * 100)
          },
          timeout: 4000
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
  async function toggleOptionAvailability(optionId: string, isAvailable: boolean, productId?: string): Promise<boolean> {
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

    try {
      if (typeof $fetch === 'function') {
        const url = productId
          ? `${apiBaseUrl}/tenants/${tenantSlug.value}/products/${productId}/options/${optionId}/availability`
          : `${apiBaseUrl}/tenants/${tenantSlug.value}/products/options/${optionId}/availability`
        await $fetch(url, {
          method: 'PATCH',
          body: { isAvailable },
          timeout: 4000
        })
      }
      return true
    } catch (e) {
      console.warn('Falha ao sincronizar opcional no backend:', e)
      return true
    }
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
          method: 'POST',
          body: { hours: schedule },
          timeout: 4000
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
    const profs = current.professionals || {}
    saveOverrides({
      professionals: {
        ...profs,
        [profId]: { ...(profs[profId] || {}), isAvailable }
      }
    })
  }

  function updateProfessionalDays(profId: string, availableDays: number[]) {
    triggerHaptic(30)
    const current = getOverrides()
    const profs = current.professionals || {}
    saveOverrides({
      professionals: {
        ...profs,
        [profId]: { ...(profs[profId] || {}), availableDays }
      }
    })
  }

  function updateProfessionalHours(
    profId: string,
    workHoursOrStart: string | { start: string; end: string },
    endParam?: string,
  ) {
    triggerHaptic(25)
    const current = getOverrides()
    const profs = current.professionals || {}
    const existing = profs[profId] || {}

    let startVal = '09:00'
    let endVal = '19:00'

    if (typeof workHoursOrStart === 'object' && workHoursOrStart !== null) {
      startVal = typeof workHoursOrStart.start === 'string' ? workHoursOrStart.start : '09:00'
      endVal = typeof workHoursOrStart.end === 'string' ? workHoursOrStart.end : '19:00'
    } else if (typeof workHoursOrStart === 'string') {
      startVal = workHoursOrStart
      endVal = endParam || existing.workHours?.end || '19:00'
    }

    saveOverrides({
      professionals: {
        ...profs,
        [profId]: {
          ...existing,
          workHours: { start: startVal, end: endVal },
        },
      },
    })
  }

  function updateProfessionalLunch(
    profId: string,
    lunchOrStart: string | { start: string; end: string; enabled?: boolean },
    endParam?: string,
    enabledParam?: boolean,
  ) {
    triggerHaptic(25)
    const current = getOverrides()
    const profs = current.professionals || {}
    const existing = profs[profId] || {}

    let startVal = '12:00'
    let endVal = '13:00'
    let enabledVal = true

    if (typeof lunchOrStart === 'object' && lunchOrStart !== null) {
      startVal = typeof lunchOrStart.start === 'string' ? lunchOrStart.start : '12:00'
      endVal = typeof lunchOrStart.end === 'string' ? lunchOrStart.end : '13:00'
      enabledVal = lunchOrStart.enabled !== undefined ? Boolean(lunchOrStart.enabled) : true
    } else if (typeof lunchOrStart === 'string') {
      startVal = lunchOrStart
      endVal = endParam || existing.lunchBreak?.end || '13:00'
      enabledVal = enabledParam !== undefined ? Boolean(enabledParam) : (existing.lunchBreak?.enabled ?? true)
    }

    saveOverrides({
      professionals: {
        ...profs,
        [profId]: {
          ...existing,
          lunchBreak: { start: startVal, end: endVal, enabled: enabledVal },
        },
      },
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
