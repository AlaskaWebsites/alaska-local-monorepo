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
    <StoreIdentityCard
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

    <!-- 4. Carrossel de Destaques (Quando não estiver buscando) -->
    <section
      v-if="!isSearching && featuredProducts.length > 0"
      class="max-w-4xl mx-auto px-4 mt-8"
      aria-labelledby="featured-heading"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 id="featured-heading" class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-amber-500" />
          <span>Destaques da Casa</span>
        </h2>
        <div class="flex items-center gap-1.5">
          <button
            @click="scrollCarousel('left')"
            class="p-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            aria-label="Rolar carrossel para a esquerda"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            @click="scrollCarousel('right')"
            class="p-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            aria-label="Rolar carrossel para a direita"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Grid Horizontal de Destaques -->
      <div
        ref="carouselRef"
        class="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar"
        role="region"
        aria-label="Carrossel de produtos em destaque"
      >
        <article
          v-for="product in featuredProducts"
          :key="product.id"
          @click="handleProductClick(product)"
          class="min-w-[240px] sm:min-w-[260px] max-w-[260px] bg-white rounded-2xl border border-slate-100 p-3 shadow-md hover:shadow-lg transition-all snap-start flex flex-col justify-between cursor-pointer active:scale-[0.99]"
          :class="{ 'opacity-60 bg-slate-50/50': product.isAvailable === false }"
        >
          <div class="space-y-2.5">
            <div class="w-full h-32 rounded-xl overflow-hidden bg-slate-100 relative">
              <img
                :src="product.image"
                :alt="product.name"
                class="w-full h-full object-cover"
                @error="handleImageError($event, effectiveTenant?.theme)"
              />
              <span
                v-if="product.isAvailable === false"
                class="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider"
              >
                Esgotado
              </span>
            </div>
            <h3 class="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 leading-snug">
              {{ product.name }}
            </h3>
            <p v-if="product.description" class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              {{ product.description }}
            </p>
          </div>

          <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs sm:text-sm font-extrabold font-mono text-slate-900">
              {{ formatCurrency(product.price) }}
            </span>
            <span
              class="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
              :class="themeClasses.primaryBg + ' text-white'"
            >
              {{ isServiceStore ? 'Agendar' : 'Pedir' }}
            </span>
          </div>
        </article>
      </div>
    </section>

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
    <main class="max-w-4xl mx-auto px-4 mt-6 space-y-10">
      <div v-if="filteredCategories.length === 0" class="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <p class="text-slate-400 text-sm font-medium">Nenhum produto encontrado para "{{ searchQuery }}"</p>
        <button
          @click="clearSearch"
          class="mt-3 text-xs font-bold text-emerald-600 hover:underline"
        >
          Limpar busca
        </button>
      </div>

      <section
        v-for="category in filteredCategories"
        :key="category.id"
        :id="`category-${category.id}`"
        class="space-y-4 scroll-mt-24"
        :aria-labelledby="`cat-heading-${category.id}`"
      >
        <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
          <h2 :id="`cat-heading-${category.id}`" class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {{ category.name }}
          </h2>
          <span class="text-xs text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
            {{ category.products.length }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <article
            v-for="product in category.products"
            :key="product.id"
            @click="handleProductClick(product)"
            class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 cursor-pointer active:scale-[0.99]"
            :class="{ 'opacity-60 bg-slate-50/50': product.isAvailable === false }"
          >
            <div class="min-w-0 flex-1 space-y-1">
              <h3 class="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 leading-snug">
                {{ product.name }}
              </h3>
              <p v-if="product.description" class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {{ product.description }}
              </p>
              <div class="pt-1 flex items-center gap-2">
                <span class="text-xs sm:text-sm font-extrabold font-mono text-slate-900">
                  {{ formatCurrency(product.price) }}
                </span>
                <span
                  v-if="product.isAvailable === false"
                  class="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md"
                >
                  Esgotado
                </span>
              </div>
            </div>

            <div class="w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative border border-slate-100">
              <img
                :src="product.image"
                :alt="product.name"
                class="w-full h-full object-cover"
                @error="handleImageError($event, effectiveTenant?.theme)"
              />
              <span
                v-if="product.isAvailable === false"
                class="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider text-center p-1"
              >
                Esgotado
              </span>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- 7. Barra Fixa Flutuante Inferior (Bottom Bar / Cart CTA) com ClientOnly -->
    <BottomCartBar
      :cart-items="cartItems"
      :cart-subtotal="cartSubtotal"
      :theme="effectiveTenant.theme"
      :theme-classes="themeClasses"
      :is-service-store="isServiceStore"
      @open-cart="isCartDrawerOpen = true"
    />

    <!-- 8. Modais do Sistema (Lazy/Client-Side) -->
    <ProductCustomizerModal
      v-if="selectedProductForCustomization"
      :is-open="isCustomizerOpen"
      :product="selectedProductForCustomization"
      :tenant="effectiveTenant"
      @close="isCustomizerOpen = false"
      @add-to-cart="handleCustomizerAdd"
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
      :cart-items="cartItems"
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
import { formatCurrency } from '~/utils/formatters'
import { handleImageError } from '~/utils/images'
import ProductSearchInput from '~/components/ProductSearchInput.vue'
import CategoryTabs from '~/components/CategoryTabs.vue'
import StoreHeroBanner from '~/components/storefront/StoreHeroBanner.vue'
import StoreIdentityCard from '~/components/storefront/StoreIdentityCard.vue'
import BottomCartBar from '~/components/storefront/BottomCartBar.vue'
import ProductCustomizerModal from '~/components/ProductCustomizerModal.vue'
import StoreInfoModal from '~/components/StoreInfoModal.vue'
import CartDrawerModal from '~/components/CartDrawerModal.vue'
import BookingModal from '~/components/BookingModal.vue'
import StoreReviewsModal from '~/components/StoreReviewsModal.vue'
import {
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-vue-next'
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
      const resolvedAvailable = o?.isAvailable !== undefined
        ? Boolean(o.isAvailable)
        : (p.isAvailable !== undefined ? Boolean(p.isAvailable) : (p.available !== undefined ? Boolean(p.available) : true))
      return {
        ...p,
        isAvailable: resolvedAvailable,
        available: resolvedAvailable,
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
    openingHours: {
      ...baseHours,
      ...overrideHours,
      open: overrideHours.open || baseHours.open || '09:00',
      close: overrideHours.close || baseHours.close || '22:00'
    },
    isEmergencyClosed: ov.emergency?.isClosed ?? false,
    deliveryFee: ov.delivery?.deliveryFee !== undefined ? ov.delivery.deliveryFee : (tenant.value.deliveryFee ?? (tenant.value.deliveryFeeCents ? tenant.value.deliveryFeeCents / 100 : 0)),
    minOrderValue: ov.delivery?.minOrderValue !== undefined ? ov.delivery.minOrderValue : (tenant.value.minOrderValue ?? (tenant.value.minOrderValueCents ? tenant.value.minOrderValueCents / 100 : 0)),
    phoneWhatsApp: effectivePhone,
    instagram: ov.contact?.instagram || (tenant.value as any).instagram,
    pixConfig: effectivePix,
    pix: effectivePix,
    categories: effectiveCategories
  } as Tenant
})

const announcementOverride = computed(() => localOverrides.value?.announcement)

// 3. Tema Dinâmico
const { themeClasses } = useTenantTheme(effectiveTenant)

// 4. Status de Funcionamento Aberto/Fechado
const { isOpen, statusText, ariaLabel: openingAriaLabel } = useOpeningHours(
  computed(() => effectiveTenant.value?.openingHours)
)

// 5. Categorias e Motor de Busca Client-Side (0ms)
const categories = computed(() => effectiveTenant.value?.categories || [])

const {
  searchQuery,
  filteredCategories,
  totalResultsCount,
  isSearching,
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
  cartSubtotal
} = useCart(effectiveTenant)

// 7. Compartilhamento
const { shareStore } = useShare(effectiveTenant)

// 8. SEO & OpenGraph Dinâmico com Guardas Defensivas de SSR
useSeoMeta({
  title: () => effectiveTenant.value ? `${effectiveTenant.value.name} | Catálogo Online` : 'Alaska Local',
  description: () => effectiveTenant.value?.description || 'Faça seu pedido online com rapidez e facilidade.',
  ogTitle: () => effectiveTenant.value ? `${effectiveTenant.value.name} | Catálogo Online` : 'Alaska Local',
  ogDescription: () => effectiveTenant.value?.description || 'Peça online agora mesmo.',
  ogImage: () => effectiveTenant.value?.banner || effectiveTenant.value?.logo || ''
})

// 9. Estados de Modais
const isInfoOpen = ref(false)
const isCartDrawerOpen = ref(false)
const isReviewsOpen = ref(false)
const isCustomizerOpen = ref(false)
const selectedProductForCustomization = ref<Product | null>(null)

// Estados do Módulo de Agendamento (Alaska Hub & Pro)
const isBookingOpen = ref(false)
const selectedBookingService = ref<BookingService | null>(null)

const isServiceStore = computed(() => {
  if (!effectiveTenant.value) return false
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
      requiresProfessional: true
    }
    isBookingOpen.value = true
    return
  }

  selectedProductForCustomization.value = product
  isCustomizerOpen.value = true
}

function handleCustomizerAdd(item: CartItem) {
  useCart(effectiveTenant).addItem(item)
  isCustomizerOpen.value = false
  isCartDrawerOpen.value = true
}

function openBookingModal() {
  selectedBookingService.value = null
  isBookingOpen.value = true
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

// 11. Controle de Rolagem Horizontal do Carrossel
const carouselRef = ref<HTMLElement | null>(null)

function scrollCarousel(direction: 'left' | 'right') {
  if (!carouselRef.value) return
  const offset = direction === 'left' ? -280 : 280
  carouselRef.value.scrollBy({ left: offset, behavior: 'smooth' })
}
</script>
