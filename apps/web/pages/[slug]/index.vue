<!-- pages/[slug]/index.vue -->
<template>
  <!-- 0. Experiência Especializada B2B / Industrial para o Tenant Bama TEC -->
  <BamaTecStorefront
    v-if="effectiveTenant?.slug === 'bamatec'"
    :tenant="effectiveTenant"
  />

  <div v-else-if="effectiveTenant" class="min-h-screen bg-slate-50 text-slate-900 font-sans pb-28 sm:pb-32 selection:bg-emerald-500 selection:text-white">
    <!-- 1. Hero Banner Principal com Alertas e Compartilhamento -->
    <StoreHeroBanner
      :banner="effectiveTenant.banner"
      :store-name="effectiveTenant.name"
      :theme="effectiveTenant.theme"
      :is-emergency-closed="effectiveTenant.isEmergencyClosed"
      :announcement="effectiveAnnouncement"
      @share="shareStore"
    />

    <!-- 2. Header & Card de Identidade da Loja -->
    <StoreHeaderCard
      :tenant="effectiveTenant"
      :is-open="isOpen"
      :status-text="statusText"
      :opening-aria-label="openingAriaLabel"
      :is-service-store="isServiceStore"
      :theme-classes="themeClasses"
      @open-reviews="isReviewsOpen = true"
      @open-info="isInfoOpen = true"
      @open-booking="openBookingModal"
    />

    <!-- 3. Campo de Busca com Normalização Unicode Client-Side (0ms) -->
    <div class="max-w-4xl mx-auto px-4 mt-6">
      <ProductSearchInput
        v-model="searchQuery"
        :placeholder="`Buscar em ${effectiveTenant.name}...`"
        :is-searching="isSearching"
        :results-count="totalResultsCount"
        @clear="clearSearch"
      />
    </div>

    <!-- 4. Carrossel de Destaques -->
    <FeaturedProductsCarousel
      v-if="!isSearching"
      :products="featuredProducts"
      :theme="effectiveTenant.theme"
      :theme-classes="themeClasses"
      :is-service-store="isServiceStore"
      @select-product="handleProductClick"
    />

    <!-- 5. Navegação por Categorias com CategoryTabs -->
    <div v-if="!isSearching" class="max-w-4xl mx-auto px-4 mt-6">
      <CategoryTabs
        :categories="categories"
        :theme="effectiveTenant.theme"
        :theme-classes="themeClasses"
        @select-category="scrollToCategory"
      />
    </div>

    <!-- 6. Listagem de Categorias e Produtos -->
    <ProductCatalogGrid
      :categories="filteredCategories"
      :theme="effectiveTenant.theme"
      :theme-classes="themeClasses"
      :is-searching="isSearching"
      :search-query="searchQuery"
      @select-product="handleProductClick"
      @clear-search="clearSearch"
    />

    <!-- 7. Barra Fixa Flutuante Inferior (Bottom Bar / Cart CTA) -->
    <BottomCartFloatingBar
      :total-items="totalItemsCount"
      :subtotal="cartSubtotal"
      :is-booking-open="isBookingOpen"
      @open-cart="isCartDrawerOpen = true"
    />

    <!-- 8. Modais do Sistema -->
    <ProductCustomizerModal
      v-if="selectedProduct && effectiveTenant"
      :is-open="!!selectedProduct"
      :product="selectedProduct"
      :tenant="effectiveTenant"
      @close="closeProductModal"
      @add-to-cart="handleAddProductToCart"
    />

    <StoreInfoModal
      v-if="effectiveTenant"
      :is-open="isInfoOpen"
      :tenant="effectiveTenant"
      :is-open-now="isOpen"
      :status-text="statusText"
      :theme="effectiveTenant.theme"
      @close="isInfoOpen = false"
    />

    <CartDrawerModal
      v-if="effectiveTenant"
      :is-open="isCartDrawerOpen"
      :tenant="effectiveTenant"
      :items="cartItems"
      @remove-item="removeCartItem"
      @clear-cart="clearCart"
      @close="isCartDrawerOpen = false"
    />

    <BookingModal
      v-if="effectiveTenant && isServiceStore"
      :is-open="isBookingOpen"
      :tenant="effectiveTenant"
      :initial-service="selectedBookingService"
      @close="isBookingOpen = false"
    />

    <StoreReviewsModal
      v-if="effectiveTenant"
      :is-open="isReviewsOpen"
      :reviews="effectiveTenant.reviews"
      :store-name="effectiveTenant.name"
      @close="isReviewsOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from '#app'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { useOpeningHours } from '~/composables/useOpeningHours'
import { useProductSearch } from '~/composables/useProductSearch'
import { useCart } from '~/composables/useCart'
import { useShare } from '~/composables/useShare'
import { useMerchantAdmin, type TenantOverrides } from '~/composables/useMerchantAdmin'
import ProductSearchInput from '~/components/ProductSearchInput.vue'
import CategoryTabs from '~/components/CategoryTabs.vue'
import StoreHeroBanner from '~/components/storefront/StoreHeroBanner.vue'
import StoreHeaderCard from '~/components/storefront/StoreHeaderCard.vue'
import FeaturedProductsCarousel from '~/components/storefront/FeaturedProductsCarousel.vue'
import ProductCatalogGrid from '~/components/storefront/ProductCatalogGrid.vue'
import BottomCartFloatingBar from '~/components/storefront/BottomCartFloatingBar.vue'
import ProductCustomizerModal from '~/components/ProductCustomizerModal.vue'
import StoreInfoModal from '~/components/StoreInfoModal.vue'
import CartDrawerModal from '~/components/CartDrawerModal.vue'
import BookingModal from '~/components/BookingModal.vue'
import StoreReviewsModal from '~/components/StoreReviewsModal.vue'
import BamaTecStorefront from '~/components/storefront/BamaTecStorefront.vue'
import type { Product, CartItem, BookingService, Tenant } from '~/types'

// 1. Resolução do Tenant Atual (Retorna referências reativas síncronas)
const route = useRoute()
const { tenant } = useTenant()

// Reatividade local para overrides do Lojista (localStorage)
const localOverrides = ref<TenantOverrides>({})
function reloadLocalOverrides() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(`alaska_overrides_${route.params.slug}`)
    localOverrides.value = raw ? JSON.parse(raw) : {}
  } catch {
    localOverrides.value = {}
  }
}

onMounted(() => {
  reloadLocalOverrides()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', reloadLocalOverrides)
  }
})

// 2. Mesclagem Reativa em Memória: Dados Canônicos + Overrides do Admin
const effectiveTenant = computed<Tenant | null>(() => {
  if (!tenant.value) return null
  const ov = localOverrides.value || {}
  const overrideHours = ov.openingHours || {}
  const deletedIds = ov.deletedProductIds || []
  const customProds = (ov.customProducts || []) as Product[]

  // Categorias com produtos mesclados e customizados do lojista
  const effectiveCategories = (tenant.value.categories || []).map((cat) => {
    const baseProds = (cat.products || []).filter((p) => !deletedIds.includes(p.id))
    const extraProds = customProds.filter((p) => (p as any).categoryId === cat.id)
    const combined = [...baseProds, ...extraProds]

    return {
      ...cat,
      products: combined.map((p) => {
        const prodOv = ov.products?.[p.id]
        if (!prodOv) return p
        return {
          ...p,
          price: prodOv.price !== undefined ? prodOv.price : p.price,
          isAvailable: prodOv.isAvailable !== undefined ? prodOv.isAvailable : p.isAvailable,
          available: prodOv.isAvailable !== undefined ? prodOv.isAvailable : p.available
        }
      })
    }
  })

  // Profissionais mesclados
  const deletedProfIds = ov.deletedProfessionalIds || []
  const customProfs = (ov.customProfessionals || []) as any[]
  const baseProfs = (tenant.value.professionals || []).filter((p: any) => !deletedProfIds.includes(p.id))
  const effectiveProfessionals = [...baseProfs, ...customProfs].map((p: any) => {
    const profOv = ov.professionals?.[p.id]
    if (!profOv) return p
    return {
      ...p,
      isAvailable: profOv.isAvailable !== undefined ? profOv.isAvailable : p.isAvailable,
      availableDays: profOv.availableDays || p.availableDays,
      workHours: profOv.workHours || p.workHours
    }
  })

  const effectivePhone = ov.contact?.whatsapp || tenant.value.phoneWhatsApp || (tenant.value as any).whatsapp
  const effectivePix = ov.pix || tenant.value.pixConfig

  const ovDelivery = ov.delivery || {}
  const effectiveDeliveryFee = ovDelivery.deliveryFee !== undefined
    ? Number(ovDelivery.deliveryFee)
    : (tenant.value.deliveryFee !== undefined ? Number(tenant.value.deliveryFee) : 6)
  const effectiveMinOrderValue = ovDelivery.minOrderValue !== undefined
    ? Number(ovDelivery.minOrderValue)
    : (tenant.value.minOrderValue !== undefined ? Number(tenant.value.minOrderValue) : 0)
  const effectiveEstimatedTime = ovDelivery.estimatedTime || tenant.value.estimatedTime || '30-45 min'

  return {
    ...tenant.value,
    isEmergencyClosed: ov.emergency?.isClosed ?? tenant.value.isEmergencyClosed ?? false,
    closedEmergencyMessage: ov.emergency?.message || tenant.value.closedEmergencyMessage,
    openingHours: {
      ...tenant.value.openingHours,
      ...overrideHours
    },
    phoneWhatsApp: effectivePhone,
    phone: effectivePhone,
    instagram: ov.contact?.instagram || (tenant.value as any).instagram || '',
    pixConfig: effectivePix,
    pix: effectivePix,
    categories: effectiveCategories,
    professionals: effectiveProfessionals,
    deliveryFee: effectiveDeliveryFee,
    minOrderValue: effectiveMinOrderValue,
    estimatedTime: effectiveEstimatedTime,
    delivery: {
      deliveryFee: effectiveDeliveryFee,
      minOrderValue: effectiveMinOrderValue,
      estimatedTime: effectiveEstimatedTime
    }
  } as Tenant
})

const effectiveAnnouncement = computed(() => {
  const ov = localOverrides.value?.announcement
  if (ov && typeof ov === 'object') {
    return {
      enabled: Boolean(ov.enabled),
      message: ov.message || ''
    }
  }
  const tAnnounce = (tenant.value as any)?.announcement
  if (tAnnounce && typeof tAnnounce === 'object') {
    return {
      enabled: Boolean(tAnnounce.enabled),
      message: tAnnounce.message || ''
    }
  }
  const tMsg = (tenant.value as any)?.announcementMessage
  const tEnabled = (tenant.value as any)?.announcementEnabled
  if (tMsg) {
    return {
      enabled: Boolean(tEnabled),
      message: tMsg
    }
  }
  return { enabled: false, message: '' }
})

// 3. Tema Visual Dinâmico da Loja
const { themeClasses } = useTenantTheme(effectiveTenant)

// 4. Horários de Funcionamento em Tempo Real
const {
  isOpen,
  statusText,
  openingAriaLabel
} = useOpeningHours(
  computed(() => effectiveTenant.value?.openingHours),
  computed(() => effectiveTenant.value?.isEmergencyClosed || false)
)

const isServiceStore = computed(() => {
  if (!effectiveTenant.value) return false
  const cat = effectiveTenant.value.businessCategory
  return cat === 'hub' || cat === 'pro' || effectiveTenant.value.slug === 'barbearia-style' || effectiveTenant.value.slug === 'clinica-sorriso'
})

// 5. Busca de Produtos com Normalização Unicode Client-Side
const categories = computed(() => effectiveTenant.value?.categories || [])
const {
  searchQuery,
  filteredCategories,
  isSearching,
  totalResultsCount,
  clearSearch
} = useProductSearch(categories)

function scrollToCategory(catId: string) {
  if (typeof document !== 'undefined') {
    const el = document.getElementById(catId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

// 6. Sacola de Compras Namespaced por Tenant
const {
  items: cartItems,
  addItem: addToCart,
  removeItem: removeCartItem,
  clearCart,
  totalItemsCount,
  cartSubtotal
} = useCart(effectiveTenant)

const { shareStore } = useShare(effectiveTenant)

// 8. SEO & OpenGraph Dinâmico com Guardas Defensivas de SSR
useSeoMeta({
  title: () => effectiveTenant.value ? `${effectiveTenant.value.name} — Vitrine & Pedidos Online` : 'Alaska Local',
  description: () => effectiveTenant.value?.description || 'Faça seu pedido ou agende seu horário online de forma rápida pelo WhatsApp.',
  ogTitle: () => effectiveTenant.value ? `${effectiveTenant.value.name} — Vitrine & Pedidos Online` : 'Alaska Local',
  ogDescription: () => effectiveTenant.value?.description || 'Atendimento digital via WhatsApp.',
  ogImage: () => effectiveTenant.value?.banner || effectiveTenant.value?.logo || '/og-image.png',
  twitterCard: 'summary_large_image'
})

// 9. Estados de Modais
const isReviewsOpen = ref(false)
const isInfoOpen = ref(false)
const isCartDrawerOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

// Estados do Módulo de Agendamento (Alaska Hub & Pro)
const isBookingOpen = ref(false)
const selectedBookingService = ref<BookingService | null>(null)

function handleProductClick(product: Product) {
  if (isServiceStore.value) {
    selectedBookingService.value = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      durationMinutes: 35,
      professionalIds: []
    }
    isBookingOpen.value = true
  } else {
    selectedProduct.value = product
  }
}

function openBookingModal() {
  selectedBookingService.value = null
  isBookingOpen.value = true
}

function closeProductModal() {
  selectedProduct.value = null
}

function handleAddProductToCart(item: CartItem) {
  if (typeof addToCart === 'function') {
    addToCart(item)
  }
  closeProductModal()
}

// 10. Destaques Dinâmicos com iterador seguro
const featuredProducts = computed(() => {
  const all: Product[] = []
  for (const cat of categories.value) {
    for (const p of cat.products || []) {
      all.push(p)
    }
  }
  return all.slice(0, 6)
})
</script>

<style scoped>
</style>
