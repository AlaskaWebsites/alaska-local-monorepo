// composables/useMerchantAdmin.ts
import { ref, computed, isRef, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Product, Category } from '@alaska/contracts'
import { useHaptic } from './useHaptic'

function safeHaptic(duration = 20) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(duration)
    }
  } catch {}
}

import {
  TenantOverridesSchema,
  type TenantOverrides,
  type DaySchedule,
  type PixConfigOverride,
  type ContactOverride,
  type ProfessionalOverride,
  type CustomProfessional
} from '@alaska/contracts'

export type {
  TenantOverrides,
  DaySchedule,
  PixConfigOverride,
  ContactOverride,
  ProfessionalOverride,
  CustomProfessional
}

// Interface mantida para compatibilidade interna se necessário
interface _LocalTenantOverrides {
  products?: Record<string, { isAvailable?: boolean; price?: number }>
  openingHours?: Record<string, DaySchedule> & { open?: string; close?: string }
  emergency?: { isClosed: boolean; message?: string }
  isEmergencyClosed?: boolean
  closedEmergencyMessage?: string
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
    const publicUrl = config?.public?.apiBaseUrl
    if (publicUrl && typeof publicUrl === 'string' && publicUrl.trim()) {
      return publicUrl.replace(/\/$/, '')
    }
  } catch {}

  try {
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3333/api/v1'
      }
    }
  } catch {}

  return 'https://alaska-local-api.onrender.com/api/v1'
}

const inMemoryStore: Record<string, string> = {}
const inMemorySession: Record<string, string> = {}

function getStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key)
    }
  } catch {}
  return inMemoryStore[key] || null
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value)
      window.dispatchEvent(new CustomEvent('alaska_overrides_updated', { detail: { key, value } }))
      return
    }
  } catch {}
  inMemoryStore[key] = value
}

function removeStorageItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key)
      window.dispatchEvent(new CustomEvent('alaska_overrides_updated', { detail: { key } }))
      return
    }
  } catch {}
  delete inMemoryStore[key]
}

function getSessionItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(key)
    }
  } catch {}
  return inMemorySession[key] || null
}

function setSessionItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, value)
      return
    }
  } catch {}
  inMemorySession[key] = value
}

function removeSessionItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key)
      return
    }
  } catch {}
  delete inMemorySession[key]
}

export function useMerchantAdmin(slugOrSource?: string | Ref<string | null | undefined>) {
  const route = typeof useRoute === 'function' ? useRoute() : null
  const apiBaseUrl = getApiBaseUrl()

  const currentSlug = computed(() => {
    if (typeof slugOrSource === 'string') return slugOrSource.trim().toLowerCase()
    if (isRef(slugOrSource)) return String(slugOrSource.value || 'default').trim().toLowerCase()
    if (slugOrSource && typeof slugOrSource === 'object' && (slugOrSource as any).slug) return String((slugOrSource as any).slug).trim().toLowerCase()
    return String((route?.params?.slug as string) || 'default').trim().toLowerCase()
  })

  const tenantSlug = currentSlug
  const overridesKey = computed(() => `alaska_overrides_${currentSlug.value}`)
  const pinSessionKey = computed(() => `alaska_admin_session_${currentSlug.value}`)

  const isAuthenticated = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  let triggerHaptic = safeHaptic
  try {
    const haptic = typeof useHaptic === 'function' ? useHaptic() : null
    if (haptic && typeof haptic.triggerHaptic === 'function') {
      triggerHaptic = haptic.triggerHaptic
    }
  } catch {}

  // Verifica autenticação inicial
  if (typeof window !== 'undefined') {
    const session = getSessionItem(pinSessionKey.value)
    if (session) {
      isAuthenticated.value = true
    }
  }

  function login(pin: string): boolean {
    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const overrides = getOverrides()
      const configuredPin = overrides.customPin || '1234'
      if (pin === configuredPin) {
        setSessionItem(pinSessionKey.value, 'true')
        isAuthenticated.value = true
        triggerHaptic(30)
        return true
      }
      errorMessage.value = 'PIN incorreto. Tente novamente.'
      triggerHaptic(50)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  function logout(): void {
    removeSessionItem(pinSessionKey.value)
    isAuthenticated.value = false
    triggerHaptic(20)
  }

  function changePin(newPin: string): boolean {
    if (!newPin || newPin.length < 4 || newPin.length > 8) {
      errorMessage.value = 'O PIN deve ter entre 4 e 8 dígitos numéricos.'
      triggerHaptic(50)
      return false
    }
    triggerHaptic(30)
    saveOverrides({ customPin: newPin })
    return true
  }

  function getOverrides(): TenantOverrides {
    try {
      const raw = getStorageItem(overridesKey.value)
      if (!raw || typeof raw !== 'string') return { pausedOptionIds: [] }
      const parsed = JSON.parse(raw)
      const result = TenantOverridesSchema.safeParse(parsed)
      if (result.success) {
        const data = result.data as TenantOverrides
        return {
          ...data,
          pausedOptionIds: data.pausedOptionIds ?? []
        }
      }
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return {
          ...(parsed as TenantOverrides),
          pausedOptionIds: (parsed as any).pausedOptionIds ?? []
        }
      }
      return { pausedOptionIds: [] }
    } catch {
      return { pausedOptionIds: [] }
    }
  }

  function saveOverrides(patch: Partial<TenantOverrides>): void {
    try {
      const current = getOverrides()
      const merged = { ...current, ...patch }
      setStorageItem(overridesKey.value, JSON.stringify(merged))
    } catch (e) {
      console.warn('[AlaskaAdmin] Erro ao salvar overrides no localStorage:', e)
    }
  }

  function resetOverrides(): void {
    removeStorageItem(overridesKey.value)
    triggerHaptic(20)
  }

  // 1. Catálogo: Pausar e Atualizar Preço
  async function toggleProductAvailability(
    productsOrId: any,
    productIdOrStatus?: any,
    statusParam?: any
  ): Promise<boolean> {
    triggerHaptic(20)
    let productId = ''
    let currentStatus = true
    let productsList: Product[] | null = null

    if (typeof productsOrId === 'string') {
      productId = productsOrId
      currentStatus = typeof productIdOrStatus === 'boolean' ? productIdOrStatus : true
    } else if (Array.isArray(productsOrId)) {
      productsList = productsOrId
      productId = typeof productIdOrStatus === 'string' ? productIdOrStatus : ''
      currentStatus = typeof statusParam === 'boolean' ? statusParam : true
    } else if (productsOrId && typeof productsOrId === 'object' && 'id' in productsOrId) {
      productId = productsOrId.id
      currentStatus = typeof productIdOrStatus === 'boolean' ? productIdOrStatus : true
    }

    if (!productId || productId === 'true' || productId === 'false') {
      console.warn('[AlaskaAdmin] ID de produto inválido em toggleProductAvailability:', productId)
      return false
    }

    const newStatus = !currentStatus

    if (productsList && Array.isArray(productsList)) {
      try {
        const prod = productsList.find(p => p && p.id === productId)
        if (prod) {
          prod.isAvailable = newStatus
          ;(prod as any).available = newStatus
        }
      } catch {}
    }

    const current = getOverrides()
    const existing = current.products?.[productId] || {}
    saveOverrides({
      products: {
        ...(current.products || {}),
        [productId]: {
          ...existing,
          isAvailable: newStatus,
          available: newStatus,
        }
      }
    })

    try {
      if (typeof $fetch === 'function') {
        const url = `${apiBaseUrl}/tenants/${currentSlug.value}/products/${productId}/availability`
        await $fetch(url, {
          method: 'PATCH',
          body: { isAvailable: newStatus, available: newStatus },
          timeout: 15000
        }).catch(() => {})
      }
    } catch {}

    return true
  }

  async function updateProductPrice(
    productsOrId: any,
    productIdOrPrice: any,
    priceParam?: any
  ): Promise<boolean> {
    triggerHaptic(20)
    let productId = ''
    let newPrice = 0
    let productsList: Product[] | null = null

    if (typeof productsOrId === 'string') {
      productId = productsOrId
      newPrice = Number(productIdOrPrice) || 0
    } else if (Array.isArray(productsOrId)) {
      productsList = productsOrId
      productId = typeof productIdOrPrice === 'string' ? productIdOrPrice : ''
      newPrice = Number(priceParam) || 0
    } else if (productsOrId && typeof productsOrId === 'object' && 'id' in productsOrId) {
      productId = productsOrId.id
      newPrice = Number(productIdOrPrice) || 0
    }

    if (!productId) return false

    if (productsList && Array.isArray(productsList)) {
      try {
        const prod = productsList.find(p => p && p.id === productId)
        if (prod) {
          prod.price = newPrice
        }
      } catch {}
    }

    const current = getOverrides()
    const existing = current.products?.[productId] || {}
    saveOverrides({
      products: {
        ...(current.products || {}),
        [productId]: {
          ...existing,
          price: newPrice
        }
      }
    })

    try {
      if (typeof $fetch === 'function') {
        await $fetch(`${apiBaseUrl}/tenants/${currentSlug.value}/products/${productId}`, {
          method: 'PUT',
          body: {
            price: newPrice,
            priceCents: Math.round(newPrice * 100)
          },
          timeout: 15000
        }).catch(() => {})
      }
    } catch {}

    return true
  }

  // 2. Catálogo: Criar e Excluir Produto com Persistência Real no PostgreSQL (ADR 010)
  async function createProduct(productData: {
    name: string
    description?: string
    price: number
    categoryId: string
    image?: string
    durationMinutes?: number
  }): Promise<Product> {
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
      durationMinutes: productData.durationMinutes || 0,
      optionGroups: []
    }

    const current = getOverrides()
    const list = [...(current.customProducts || []), newProd]
    saveOverrides({ customProducts: list })

    try {
      if (typeof $fetch === 'function') {
        const url = `${apiBaseUrl}/tenants/${currentSlug.value}/products`
        await $fetch(url, {
          method: 'POST',
          body: {
            id: newId,
            name: productData.name,
            description: productData.description || '',
            price: Number(productData.price) || 0,
            priceCents: Math.round((Number(productData.price) || 0) * 100),
            categoryId: productData.categoryId,
            image: productData.image || '',
            durationMinutes: productData.durationMinutes || 0
          },
          timeout: 15000
        }).catch((err) => {
          console.warn('[AlaskaAdmin] Aviso ao persistir produto no backend:', err)
        })
      }
    } catch {}

    return newProd
  }

  async function deleteProduct(productId: string): Promise<boolean> {
    triggerHaptic(40)
    const current = getOverrides()
    const deleted = Array.from(new Set([...(current.deletedProductIds || []), productId]))
    const customs = (current.customProducts || []).filter(p => p.id !== productId)
    saveOverrides({
      deletedProductIds: deleted,
      customProducts: customs
    })

    try {
      if (typeof $fetch === 'function') {
        const url = `${apiBaseUrl}/tenants/${currentSlug.value}/products/${productId}`
        await $fetch(url, {
          method: 'DELETE',
          timeout: 15000
        }).catch((err) => {
          console.warn('[AlaskaAdmin] Aviso ao remover produto no backend:', err)
        })
      }
    } catch {}

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
        const prodPath = productId ? `/products/${productId}` : ''
        await $fetch(`${apiBaseUrl}/tenants/${currentSlug.value}${prodPath}/options/${optionId}/availability`, {
          method: 'PATCH',
          body: { isAvailable },
          timeout: 15000
        }).catch(() => {})
      }
    } catch {}

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
      openingHours: schedule as any
    })

    try {
      if (typeof $fetch === 'function') {
        await $fetch(`${apiBaseUrl}/tenants/${currentSlug.value}/hours`, {
          method: 'PATCH',
          body: { hours: schedule },
          timeout: 15000
        }).catch(() => {})
      }
    } catch {}

    return true
  }

  // 7. Especialistas / Barbeiros: Disponibilidade, Escala, Expediente e Almoço (ADR 011 / ADR 021)
  async function toggleProfessionalAvailability(profId: string, isAvailable: boolean): Promise<boolean> {
    triggerHaptic(30)
    const current = getOverrides()
    const profs = current.professionals || {}
    saveOverrides({
      professionals: {
        ...profs,
        [profId]: { ...(profs[profId] || {}), isAvailable }
      }
    })

    try {
      if (typeof $fetch === 'function') {
        const url = `${apiBaseUrl}/tenants/${currentSlug.value}/professionals/${profId}/availability`
        await $fetch(url, {
          method: 'PATCH',
          body: { isAvailable },
          timeout: 15000
        }).catch((err) => {
          console.warn('[AlaskaAdmin] Aviso ao alterar disponibilidade de profissional no backend:', err)
        })
      }
    } catch {}

    return true
  }

  async function toggleProfessionalDay(profId: string, dayIndex: number): Promise<void> {
    triggerHaptic(25)
    const current = getOverrides()
    const profs = current.professionals || {}
    const existing = profs[profId] || {}
    const days = new Set(existing.availableDays || [1, 2, 3, 4, 5, 6])

    if (days.has(dayIndex)) {
      days.delete(dayIndex)
    } else {
      days.add(dayIndex)
    }

    const availableDays = Array.from(days).sort()
    saveOverrides({
      professionals: {
        ...profs,
        [profId]: {
          ...existing,
          availableDays
        }
      }
    })

    try {
      if (typeof $fetch === 'function') {
        const url = `${apiBaseUrl}/tenants/${currentSlug.value}/professionals/${profId}`
        await $fetch(url, {
          method: 'PATCH',
          body: { availableDays },
          timeout: 15000
        }).catch((err) => {
          console.warn('[AlaskaAdmin] Aviso ao salvar escala de profissional no backend:', err)
        })
      }
    } catch {}
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

  async function updateProfessionalHours(
    profId: string,
    workHoursOrStart: string | { start: string; end: string },
    endParam?: string,
  ): Promise<void> {
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

    const workHours = { start: startVal, end: endVal }
    saveOverrides({
      professionals: {
        ...profs,
        [profId]: {
          ...existing,
          workHours,
        },
      },
    })

    try {
      if (typeof $fetch === 'function') {
        const url = `${apiBaseUrl}/tenants/${currentSlug.value}/professionals/${profId}`
        await $fetch(url, {
          method: 'PATCH',
          body: { workHours },
          timeout: 15000
        }).catch((err) => {
          console.warn('[AlaskaAdmin] Aviso ao salvar expediente de profissional no backend:', err)
        })
      }
    } catch {}
  }

  async function updateProfessionalLunch(
    profId: string,
    lunchOrStart: string | { start: string; end: string; enabled?: boolean },
    endParam?: string,
    enabledParam?: boolean,
  ): Promise<void> {
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

    const lunchBreak = { start: startVal, end: endVal, enabled: enabledVal }
    saveOverrides({
      professionals: {
        ...profs,
        [profId]: {
          ...existing,
          lunchBreak,
        },
      },
    })

    try {
      if (typeof $fetch === 'function') {
        const url = `${apiBaseUrl}/tenants/${currentSlug.value}/professionals/${profId}`
        await $fetch(url, {
          method: 'PATCH',
          body: { lunchBreak },
          timeout: 15000
        }).catch((err) => {
          console.warn('[AlaskaAdmin] Aviso ao salvar almoço de profissional no backend:', err)
        })
      }
    } catch {}
  }

  // 8. Especialistas: Criar e Excluir com Persistência Real no PostgreSQL (ADR 011 / ADR 021)
  async function createProfessional(profData: {
    name: string
    role?: string
    avatar?: string
    availableDays?: number[]
    workHours?: { start: string; end: string }
    lunchBreak?: { start: string; end: string; enabled: boolean }
  }): Promise<CustomProfessional> {
    triggerHaptic(35)
    const newId = `prof-custom-${Date.now()}`
    const newProf: CustomProfessional = {
      id: newId,
      name: profData.name,
      role: profData.role || 'Profissional',
      isAvailable: true,
      availableDays: profData.availableDays || [1, 2, 3, 4, 5],
      workHours: profData.workHours || { start: '08:00', end: '18:00' },
      lunchBreak: profData.lunchBreak || { start: '12:00', end: '13:00', enabled: true }
    }

    const current = getOverrides()
    const list = [...(current.customProfessionals || []), newProf]
    saveOverrides({ customProfessionals: list })

    try {
      if (typeof $fetch === 'function') {
        const url = `${apiBaseUrl}/tenants/${currentSlug.value}/professionals`
        await $fetch(url, {
          method: 'POST',
          body: {
            id: newId,
            name: profData.name,
            role: profData.role || 'Profissional',
            avatar: profData.avatar,
            availableDays: profData.availableDays || [1, 2, 3, 4, 5],
            workHours: profData.workHours || { start: '08:00', end: '18:00' },
            lunchBreak: profData.lunchBreak || { start: '12:00', end: '13:00', enabled: true },
            isAvailable: true
          },
          timeout: 15000
        }).catch((err) => {
          console.warn('[AlaskaAdmin] Aviso ao persistir profissional no backend:', err)
        })
      }
    } catch {}

    return newProf
  }

  async function deleteProfessional(profId: string): Promise<boolean> {
    triggerHaptic(40)
    const current = getOverrides()
    const deleted = Array.from(new Set([...(current.deletedProfessionalIds || []), profId]))
    const customs = (current.customProfessionals || []).filter(p => p.id !== profId)
    saveOverrides({
      deletedProfessionalIds: deleted,
      customProfessionals: customs
    })

    try {
      if (typeof $fetch === 'function') {
        const url = `${apiBaseUrl}/tenants/${currentSlug.value}/professionals/${profId}`
        await $fetch(url, {
          method: 'DELETE',
          timeout: 15000
        }).catch((err) => {
          console.warn('[AlaskaAdmin] Aviso ao remover profissional no backend:', err)
        })
      }
    } catch {}

    return true
  }

  // 9. Delivery, Comunicados e Emergência
  function updateDelivery(
    feeOrConfig: number | { deliveryFee?: number; minOrderValue?: number; estimatedTime?: string },
    minOrderParam?: number,
    estimatedTimeParam?: string
  ): void {
    triggerHaptic(30)
    let fee = 5
    let minOrder = 20
    let estimatedTime = '30-45 min'

    if (typeof feeOrConfig === 'object' && feeOrConfig !== null) {
      fee = typeof feeOrConfig.deliveryFee === 'number' ? feeOrConfig.deliveryFee : 5
      minOrder = typeof feeOrConfig.minOrderValue === 'number' ? feeOrConfig.minOrderValue : 20
      estimatedTime = feeOrConfig.estimatedTime || '30-45 min'
    } else if (typeof feeOrConfig === 'number') {
      fee = feeOrConfig
      minOrder = typeof minOrderParam === 'number' ? minOrderParam : 20
      estimatedTime = estimatedTimeParam || '30-45 min'
    }

    saveOverrides({
      delivery: { deliveryFee: fee, minOrderValue: minOrder, estimatedTime }
    })
  }

  function updateAnnouncement(
    enabledOrConfig: boolean | { enabled?: boolean; message?: string },
    messageParam?: string
  ): void {
    triggerHaptic(25)
    let enabled = false
    let message = ''

    if (typeof enabledOrConfig === 'object' && enabledOrConfig !== null) {
      enabled = Boolean(enabledOrConfig.enabled)
      message = enabledOrConfig.message || ''
    } else if (typeof enabledOrConfig === 'boolean') {
      enabled = enabledOrConfig
      message = typeof messageParam === 'string' ? messageParam : ''
    }

    saveOverrides({
      announcement: { enabled, message }
    })
  }

  function updateEmergency(isClosed: boolean, message: string = '') {
    triggerHaptic(40)
    saveOverrides({
      emergency: { isClosed, message },
      isEmergencyClosed: isClosed,
      closedEmergencyMessage: message
    })
  }

  // 10. Bloqueio de Slots de Agenda com Persistência no PostgreSQL (ADR 011 / ADR 021)
  async function toggleBlockSlot(date: string, time: string): Promise<boolean> {
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

    try {
      if (typeof $fetch === 'function') {
        const url = `${apiBaseUrl}/tenants/${currentSlug.value}/slots/toggle`
        await $fetch(url, {
          method: 'POST',
          body: { date, time },
          timeout: 15000
        }).catch((err) => {
          console.warn('[AlaskaAdmin] Aviso ao alternar slot no backend:', err)
        })
      }
    } catch {}

    return index < 0
  }

  function getEffectiveCategories(baseCategories: Category[]): Category[] {
    const overrides = getOverrides()
    const customProds = overrides.customProducts || []
    const deletedIds = new Set(overrides.deletedProductIds || [])
    const productOverrides = overrides.products || {}
    const pausedOptions = new Set(overrides.pausedOptionIds || [])

    const cloned: Category[] = JSON.parse(JSON.stringify(baseCategories || []))

    for (const cat of cloned) {
      cat.products = (cat.products || []).filter(p => !deletedIds.has(p.id))

      for (const prod of cat.products) {
        const over = productOverrides[prod.id]
        if (over) {
          if (typeof over.isAvailable === 'boolean') {
            prod.isAvailable = over.isAvailable
            if ('available' in prod) {
              ;(prod as any).available = over.isAvailable
            }
          }
          if (typeof over.price === 'number') {
            prod.price = over.price
          }
        }

        if (prod.optionGroups && Array.isArray(prod.optionGroups)) {
          for (const og of prod.optionGroups) {
            const items = (og as any).items || (og as any).options || []
            for (const item of items) {
              if (pausedOptions.has(item.id)) {
                item.isAvailable = false
                item.available = false
              }
            }
          }
        }
      }

      const prodsForCat = customProds.filter(p => p.categoryId === cat.id && !deletedIds.has(p.id))
      for (const cp of prodsForCat) {
        const over = productOverrides[cp.id]
        if (over) {
          if (typeof over.isAvailable === 'boolean') {
            cp.isAvailable = over.isAvailable
            if ('available' in cp) {
              ;(cp as any).available = over.isAvailable
            }
          }
          if (typeof over.price === 'number') {
            cp.price = over.price
          }
        }
        if (!cat.products.some(p => p.id === cp.id)) {
          cat.products.push(cp)
        }
      }
    }

    return cloned
  }

  function getEffectiveProductPrice(product: Product): number {
    if (!product) return 0
    const overrides = getOverrides()
    const overridePrice = overrides.products?.[product.id]?.price
    if (typeof overridePrice === 'number' && overridePrice >= 0) {
      return overridePrice
    }
    return typeof product.price === 'number' ? product.price : 0
  }

  function resolveProductPrice(product: Product): number {
    return getEffectiveProductPrice(product)
  }

  function getProductPrice(product: Product): number {
    return getEffectiveProductPrice(product)
  }

  function isProductPaused(product: Product): boolean {
    if (!product) return false
    const overrides = getOverrides()
    const overrideAvailable = overrides.products?.[product.id]?.price !== undefined ? overrides.products?.[product.id]?.isAvailable : undefined
    if (typeof overrideAvailable === 'boolean') {
      return !overrideAvailable
    }
    if (typeof product.isAvailable === 'boolean') {
      return !product.isAvailable
    }
    if ('available' in product && typeof (product as any).available === 'boolean') {
      return !(product as any).available
    }
    return false
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    isSubmitting: computed(() => isSubmitting.value),
    errorMessage: computed(() => errorMessage.value),
    tenantSlug,
    overridesKey,
    login,
    logout,
    changePin,
    updatePin: changePin,
    updateAdminPin: changePin,
    getOverrides,
    saveOverrides,
    resetOverrides,
    toggleProductAvailability,
    updateProductPrice,
    createProduct,
    addProduct: createProduct,
    deleteProduct,
    toggleOptionAvailability,
    updateWeeklySchedule,
    saveSchedule: updateWeeklySchedule,
    updateEmergency,
    setEmergencyClose: updateEmergency,
    updateDelivery,
    updateDeliveryConfig: updateDelivery,
    saveDelivery: updateDelivery,
    updateAnnouncement,
    updateAnnouncementConfig: updateAnnouncement,
    saveAnnouncement: updateAnnouncement,
    toggleProfessionalAvailability,
    toggleProfessionalDay,
    updateProfessionalDays: toggleProfessionalDay,
    updateProfessionalHours,
    updateProfessionalWorkHours: updateProfessionalHours,
    updateProfessionalLunch,
    updateProfessionalLunchBreak: updateProfessionalLunch,
    toggleBlockSlot,
    toggleSlotBlock: toggleBlockSlot,
    isSlotBlocked: (date: string, time: string) => {
      const current = getOverrides()
      return (current.blockedSlots || []).some(s => s.date === date && s.time === time)
    },
    createProfessional,
    addProfessional: createProfessional,
    deleteProfessional,
    updatePixConfig,
    savePix: updatePixConfig,
    updateContact,
    saveContact: updateContact,
    getEffectiveCategories,
    getEffectiveProductPrice,
    resolveProductPrice,
    getProductPrice,
    isProductPaused,
  }
}
