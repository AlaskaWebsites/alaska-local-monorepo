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
      @open-booking="openBookingModalForProduct"
    />

    <StoreInfoModal
      :is-open="isInfoOpen"
      :tenant="effectiveTenant"
      :is-open-now="isOpen"
      :status-text="statusText"
      @close="isInfoOpen = false"
    />

    <CartDrawerModal
      :is-open="isCartDrawerOpen"
      :items="cartItems"
      :tenant="effectiveTenant"
      @close="isCartDrawerOpen = false"
      @remove-item="removeCartItem"
      @clear-cart="clearCart"
    />

    <BookingModal
      v-if="isServiceStore"
      :is-open="isBookingOpen"
      :tenant="effectiveTenant"
      :initial-service="selectedBookingService"
      @close="isBookingOpen = false"
    />

    <StoreReviewsModal
      v-if="effectiveTenant.storeReviews"
      :is-open="isReviewsOpen"
      :store-reviews="effectiveTenant.storeReviews"
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

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'hamburgueria-x')

// 1. Carregamento dos Dados Canônicos
const { tenant } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)
const { getOverrides } = useMerchantAdmin(slug)

const localOverrides = ref(getOverrides())

function reloadLocalOverrides() {
  localOverrides.value = getOverrides()
}

onMounted(() => {
  reloadLocalOverrides()
  if (typeof window !== 'undefined') {
    window.addEventListener('alaska_overrides_updated', reloadLocalOverrides)
    window.addEventListener('storage', reloadLocalOverrides)
  }
})

// 2. Mesclagem Reativa em Memória: Dados Canônicos + Overrides do Admin
const effectiveTenant = computed<Tenant | null>(() => {
  if (!tenant.value) return null
  const ov = localOverrides.value || {}
  const overrideHours = ov.openingHours || {}
  const deletedIds = ov.deletedProductIds || []
  const rawCustomProds = (ov.customProducts || []) as Product[]

  // Deduplica produtos customizados duplicados acidentalmente (mesmo nome, categoria e preco)
  const seenCustom = new Set<string>()
  const customProds: Product[] = []
  for (const p of rawCustomProds) {
    const key = `${(p as any).categoryId}_${p.name.trim().toLowerCase()}_${p.price}`
    if (p.id.startsWith('prod-custom-')) {
      if (seenCustom.has(key)) continue
      seenCustom.add(key)
    }
    customProds.push(p)
  }

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
    categories: effectiveCategories,
    professionals: effectiveProfessionals,
    phoneWhatsApp: effectivePhone,
    pixConfig: effectivePix,
    deliveryFee: effectiveDeliveryFee,
    minOrderValue: effectiveMinOrderValue,
    estimatedTime: effectiveEstimatedTime
  }
})

// 3. Comunicado Efetivo
const effectiveAnnouncement = computed(() => {
  const ovAnn = localOverrides.value?.announcement
  if (ovAnn && typeof ovAnn.enabled === 'boolean') {
    return ovAnn
  }
  return effectiveTenant.value?.announcement || null
})

// 4. Status de Abertura / Horários
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

function openBookingModal() {
  selectedBookingService.value = null
  isBookingOpen.value = true
}

function openBookingModalForProduct(product: Product) {
  selectedBookingService.value = {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    durationMinutes: product.durationMinutes || 30,
    professionalIds: []
  }
  isBookingOpen.value = true
}

function handleProductClick(product: Product) {
  if (isServiceStore.value) {
    openBookingModalForProduct(product)
  } else {
    selectedProduct.value = product
  }
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
