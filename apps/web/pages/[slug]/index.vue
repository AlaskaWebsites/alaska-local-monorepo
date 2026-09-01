<template>
  <div v-if="effectiveTenant" class="min-h-screen bg-slate-50 text-slate-900 font-sans pb-28 sm:pb-32 selection:bg-emerald-500 selection:text-white">
    <!-- 1. Hero Banner Principal com Alertas e Compartilhamento -->
    <StoreHeroBanner
      :banner="effectiveTenant.banner"
      :store-name="effectiveTenant.name"
      :theme="effectiveTenant.theme"
      :is-emergency-closed="effectiveTenant.isEmergencyClosed"
      :announcement="announcementOverride"
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
        :total-results="totalResultsCount"
        :is-searching="isSearching"
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
        :active-category-id="activeCategoryId"
        :theme="effectiveTenant.theme"
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
      v-if="effectiveTenant && effectiveTenant.reviews"
      :is-open="isReviewsOpen"
      :theme="effectiveTenant.theme"
      :reviews="effectiveTenant.reviews"
      @close="isReviewsOpen = false"
    />

    <StoreInfoModal
      v-if="effectiveTenant"
      :is-open="isInfoOpen"
      :tenant="effectiveTenant"
      @close="isInfoOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { useOpeningHours } from '~/composables/useOpeningHours'
import { useProductSearch } from '~/composables/useProductSearch'
import { useCart } from '~/composables/useCart'
import { useShare } from '~/composables/useShare'
import { useMerchantAdmin } from '~/composables/useMerchantAdmin'
import ProductSearchInput from '~/components/ProductSearchInput.vue'
import BookingModal from '~/components/BookingModal.vue'
import StoreInfoModal from '~/components/StoreInfoModal.vue'
import StoreReviewsModal from '~/components/StoreReviewsModal.vue'
import CartDrawerModal from '~/components/CartDrawerModal.vue'
import ProductCustomizerModal from '~/components/ProductCustomizerModal.vue'
import CategoryTabs from '~/components/CategoryTabs.vue'
import StoreHeroBanner from '~/components/storefront/StoreHeroBanner.vue'
import StoreHeaderCard from '~/components/storefront/StoreHeaderCard.vue'
import FeaturedProductsCarousel from '~/components/storefront/FeaturedProductsCarousel.vue'
import ProductCatalogGrid from '~/components/storefront/ProductCatalogGrid.vue'
import BottomCartFloatingBar from '~/components/storefront/BottomCartFloatingBar.vue'
import type { Product, CartItem, BookingService, Tenant } from '~/types'

// 1. Resolução do Tenant Atual (Retorna referências reativas síncronas)
const { tenant, slug } = useTenant()
const { getOverrides } = useMerchantAdmin(slug)

// Sincronização e Reatividade de Overrides do Lojista
const localOverrides = ref<any>({})

function syncLocalOverrides() {
  localOverrides.value = getOverrides()
}

onMounted(() => {
  syncLocalOverrides()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', syncLocalOverrides)
    window.addEventListener('alaska_overrides_updated', syncLocalOverrides)
  }
})

// 2. Objeto Tenant Efetivo e Reativo
const effectiveTenant = computed<Tenant | null>(() => {
  if (!tenant.value) return null
  const ov = localOverrides.value || {}
  const baseHours = tenant.value.openingHours || {}
  const overrideHours = ov.openingHours || {}
  const prodOverrides = ov.products || {}
  const deletedIds = ov.deletedProductIds || []
  const customProds = (ov.customProducts || []) as Product[]

  // Mescla produtos base + customizados da categoria e remove excluídos
  const effectiveCategories = (tenant.value.categories || []).map((cat: any) => {
    const baseProds = (cat.products || []).filter((p: any) => !deletedIds.includes(p.id))
    const matchingCustom = customProds.filter(p => p.categoryId === cat.id && !deletedIds.includes(p.id))
    const mergedProds = [...baseProds, ...matchingCustom].map(p => {
      const o = prodOverrides[p.id]
      return {
        ...p,
        isAvailable: o?.isAvailable !== undefined ? o.isAvailable : p.isAvailable,
        available: o?.isAvailable !== undefined ? o.isAvailable : (p.available ?? p.isAvailable ?? true),
        price: o?.price !== undefined ? o.price : p.price
      }
    })

    return {
      ...cat,
      products: mergedProds
    }
  })

  // Mescla configuração Pix
  const basePix = tenant.value.pixConfig || (tenant.value as any).pix || {}
  const overridePix = ov.pix || {}
  const effectivePix = {
    ...basePix,
    ...overridePix,
    key: overridePix.pixKey || basePix.key || basePix.pixKey || '',
    keyType: overridePix.keyType || basePix.keyType || 'random',
    beneficiary: overridePix.beneficiary || basePix.beneficiary || tenant.value.name,
    city: overridePix.city || basePix.city || 'SAO PAULO'
  }

  // Mescla contatos e WhatsApp
  const effectivePhone = ov.contact?.whatsapp || tenant.value.phoneWhatsApp

  return {
    ...tenant.value,
    phoneWhatsApp: effectivePhone,
    instagram: ov.contact?.instagram || (tenant.value as any).instagram,
    pixConfig: effectivePix,
    pix: effectivePix,
    openingHours: {
      ...baseHours,
      ...overrideHours,
      open: overrideHours.open || baseHours.open || '09:00',
      close: overrideHours.close || baseHours.close || '20:00',
    },
    deliveryFee: ov.delivery?.deliveryFee !== undefined ? ov.delivery.deliveryFee : (tenant.value as any)?.deliveryFee,
    minOrderValue: ov.delivery?.minOrderValue !== undefined ? ov.delivery.minOrderValue : (tenant.value as any)?.minOrderValue,
    deliveryType: ov.delivery?.estimatedTime || tenant.value.deliveryType,
    isEmergencyClosed: ov.emergency?.isClosed ?? false,
    categories: effectiveCategories
  } as Tenant
})

const announcementOverride = computed(() => localOverrides.value?.announcement)

// 3. Tema Dinâmico
const { themeClasses } = useTenantTheme(effectiveTenant)

// 4. Status de Funcionamento Aberto/Fechado (Reativo com Suporte a Pausa Emergencial)
const { isOpen, statusText, ariaLabel: openingAriaLabel } = useOpeningHours(effectiveTenant)

// 5. Categorias e Motor de Busca Client-Side (0ms)
const categories = computed(() => effectiveTenant.value?.categories || [])

const {
  searchQuery,
  filteredCategories,
  isSearching,
  totalResultsCount,
  clearSearch
} = useProductSearch(categories)

const activeCategoryId = ref<string>('')

function scrollToCategory(catId: string) {
  activeCategoryId.value = catId
  const el = document.getElementById(`category-${catId}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

// 7. Compartilhamento
const { shareStore } = useShare(effectiveTenant)

// 8. SEO & OpenGraph Dinâmico com Guardas Defensivas de SSR
useSeoMeta({
  title: () => effectiveTenant?.value ? `${effectiveTenant.value.name} — Vitrine & Pedidos Online` : 'Alaska Local',
  description: () => effectiveTenant?.value?.description || 'Faça seu pedido ou agende seu horário online de forma rápida pelo WhatsApp.',
  ogTitle: () => effectiveTenant?.value?.name || 'Alaska Local',
  ogDescription: () => effectiveTenant?.value?.description || 'Atendimento digital via WhatsApp.',
  ogImage: () => effectiveTenant?.value?.banner || effectiveTenant?.value?.logo || '/og-image.png',
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

const isServiceStore = computed(() => {
  if (!effectiveTenant?.value) return false
  const cat = effectiveTenant.value.businessCategory || effectiveTenant.value.template
  return cat === 'hub' || cat === 'pro' || effectiveTenant.value.slug === 'barbearia-style' || effectiveTenant.value.slug === 'clinica-sorriso'
})

function handleProductClick(product: Product) {
  if (isServiceStore.value) {
    selectedBookingService.value = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      durationMinutes: 35,
      professionalIds: [],
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
  if (!effectiveTenant?.value?.categories || !Array.isArray(effectiveTenant.value.categories)) return []
  const all: Product[] = []
  for (const cat of effectiveTenant.value.categories) {
    if (cat.products && Array.isArray(cat.products)) {
      all.push(...cat.products)
    }
  }
  return all.slice(0, 6)
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.no-scrollbar {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
</style>
