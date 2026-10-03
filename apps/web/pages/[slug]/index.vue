<!-- apps/web/pages/[slug]/index.vue -->
<template>
  <!-- 0. Experiência Especializada B2B / Industrial para o Tenant Bama TEC -->
  <BamaTecStorefront
    v-if="effectiveTenant?.slug === 'bamatec'"
    :tenant="effectiveTenant"
  />

  <div v-else-if="effectiveTenant" class="min-h-screen bg-slate-50 text-slate-900 font-sans pb-28 sm:pb-32 selection:bg-emerald-500 selection:text-white">
    <!-- 1. Hero Banner Principal com Logo Flutuante -->
    <StoreHeroBanner
      :banner-url="effectiveTenant.banner"
      :store-name="effectiveTenant.name"
      :theme="effectiveTenant.theme"
      :theme-classes="themeClasses"
      @share="handleShare"
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

    <!-- 3. Campo de Busca de Produtos em Tempo Real -->
    <div class="max-w-4xl mx-auto px-4 mt-6">
      <ProductSearchInput
        v-model="searchQuery"
        :placeholder="isServiceStore ? 'Buscar serviços, barbas ou cortes...' : 'Buscar produtos no cardápio...'"
        :theme="effectiveTenant.theme"
      />
    </div>

    <!-- 4. Carrossel de Produtos em Destaque -->
    <FeaturedProductsCarousel
      v-if="!isSearching && featuredProducts.length > 0"
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
      :category="effectiveTenant.category || (effectiveTenant.businessCategory === 'hub' ? 'Barbearia & Estética' : (effectiveTenant.businessCategory === 'shop' ? 'Boutique & Moda' : (effectiveTenant.businessCategory === 'pro' ? 'Saúde & Odontologia' : 'Comércio Local')))"
      :address="effectiveTenant.address"
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

// 2. Mesclagem Reativa do Tenant com Overrides Locais (Sem sobrescrever categorias reais)
const effectiveTenant = computed<Tenant | null>(() => {
  if (!tenant.value) return null
  const ov = localOverrides.value || {}
  const overrideHours = ov.openingHours || {}
  const deletedCatIds = new Set(ov.deletedCategoryIds || [])
  const customCats = (ov.customCategories || []) as any[]
  const deletedIds = new Set(ov.deletedProductIds || [])
  const rawCustomProds = (ov.customProducts || []) as Product[]

  // Deduplica produtos customizados duplicados acidentalmente (mesmo nome, categoria e preco)
  const seenProds = new Set<string>()
  const customProds: Product[] = []
  for (const p of rawCustomProds) {
    const key = `${(p as any).categoryId}_${p.name.trim().toLowerCase()}_${p.price}`
    if (seenProds.has(key)) continue
    seenProds.add(key)
    customProds.push(p)
  }

  // Filtra categorias canônicas excluindo as deletadas pelo lojista (ADR 013 / ADR 026)
  const baseCats = (tenant.value.categories || [])
    .filter((cat) => !deletedCatIds.has(cat.id))

  // Categorias customizadas criadas pelo lojista (não deletadas e sem duplicar com base)
  const extraCats = customCats
    .filter((cat) => !deletedCatIds.has(cat.id) && !baseCats.some((b) => b.id === cat.id))

  const allCats = [...baseCats, ...extraCats]

  // Categorias com produtos mesclados e customizados do lojista
  const effectiveCategories = allCats.map((cat) => {
    const baseProds = (cat.products || []).filter((p) => !deletedIds.has(p.id))
    const extraProds = customProds.filter((p) => (p as any).categoryId === cat.id && !deletedIds.has(p.id))
    const combined = [...baseProds, ...extraProds]

    return {
      ...cat,
      products: combined
    }
  })

  // Profissionais de Agendamento (Alaska Hub & Pro)
  const effectiveProfessionals = tenant.value.professionals || []

  // Contato e Chave Pix
  const effectivePhone = ov.contact?.whatsapp || tenant.value.phoneWhatsApp || tenant.value.whatsapp || ''
  const effectivePix = {
    key: ov.pix?.key || tenant.value.pixConfig?.key || '',
    keyType: (ov.pix?.keyType || tenant.value.pixConfig?.keyType || 'phone') as 'phone' | 'cpf' | 'cnpj' | 'email' | 'random',
    beneficiary: ov.pix?.beneficiary || tenant.value.pixConfig?.beneficiary || tenant.value.name,
    city: ov.pix?.city || tenant.value.pixConfig?.city || 'São Paulo'
  }

  // Entrega
  const effectiveDeliveryFee = ov.delivery?.fee !== undefined
    ? ov.delivery.fee
    : (tenant.value.deliveryFee ?? ((tenant.value.deliveryFeeCents || 0) / 100))

  const effectiveMinOrderValue = ov.delivery?.minOrder !== undefined
    ? ov.delivery.minOrder
    : (tenant.value.minOrderValue ?? ((tenant.value.minOrderValueCents || 0) / 100))

  const effectiveEstimatedTime = ov.delivery?.estimatedTime || tenant.value.estimatedTime || '30-45 min'

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

// 3. Tema Dinâmico do Tenant
const tenantThemeRef = computed(() => effectiveTenant.value?.theme || 'emerald')
const { themeClasses } = useTenantTheme(tenantThemeRef)

// 4. Horários de Funcionamento em Tempo Real
const openingHoursRef = computed(() => effectiveTenant.value?.openingHours)
const isClosedEmergencyRef = computed(() => effectiveTenant.value?.isEmergencyClosed || effectiveTenant.value?.isClosedEmergency)
const emergencyMessageRef = computed(() => effectiveTenant.value?.closedEmergencyMessage)

const {
  isOpen,
  statusText,
  openingAriaLabel
} = useOpeningHours(openingHoursRef, isClosedEmergencyRef, emergencyMessageRef)

// 5. Categorias e Catálogo de Produtos
const categories = computed(() => effectiveTenant.value?.categories || [])

// 6. Busca de Produtos em Tempo Real
const {
  searchQuery,
  isSearching,
  filteredCategories,
  clearSearch
} = useProductSearch(categories)

// 7. Modais da Vitrine
const isInfoOpen = ref(false)
const isCartDrawerOpen = ref(false)
const isBookingOpen = ref(false)
const isReviewsOpen = ref(false)

// 8. Produto Selecionado para Personalização
const selectedProduct = ref<Product | null>(null)
const selectedBookingService = ref<BookingService | null>(null)

// 9. Carrinho de Compras
const {
  items: cartItems,
  addItem: addToCart,
  removeItem: removeCartItem,
  clearCart,
  totalItemsCount,
  subtotal: cartSubtotal
} = useCart()

// 10. Compartilhamento do Estabelecimento
const { shareStore } = useShare()

function handleShare() {
  if (!effectiveTenant.value) return
  shareStore({
    title: effectiveTenant.value.name,
    text: effectiveTenant.value.description || `Confira o catálogo de ${effectiveTenant.value.name}!`,
    url: typeof window !== 'undefined' ? window.location.href : ''
  })
}

// 11. Modal de Agendamento
const isServiceStore = computed(() => {
  if (!effectiveTenant.value) return false
  return effectiveTenant.value.businessCategory === 'hub' ||
         effectiveTenant.value.businessCategory === 'pro' ||
         (effectiveTenant.value.professionals && effectiveTenant.value.professionals.length > 0)
})

function openBookingModal() {
  selectedBookingService.value = null
  isBookingOpen.value = true
}

function openBookingModalForProduct(product: Product) {
  selectedBookingService.value = {
    id: product.id,
    name: product.name,
    description: product.description,
    priceCents: Math.round(product.price * 100),
    durationMinutes: product.durationMinutes || 30
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

function handleAddProductToCart(item: any) {
  addToCart(item)
  closeProductModal()
  isCartDrawerOpen.value = true
}

// 12. Navegação Horizontal por Categorias
function scrollToCategory(categoryId: string) {
  if (typeof document === 'undefined') return
  const element = document.getElementById(categoryId)
  if (element) {
    const yOffset = -90
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

// 13. Produtos em Destaque no Topo
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
