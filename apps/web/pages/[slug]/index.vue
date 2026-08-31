<template>
  <div v-if="effectiveTenant" class="min-h-screen bg-slate-50 text-slate-900 font-sans pb-28 sm:pb-32 selection:bg-emerald-500 selection:text-white">
    <!-- 1. Hero Banner Principal com Gradiente Escuro Suave -->
    <div class="relative h-48 sm:h-64 w-full bg-slate-900 overflow-hidden">
      <img
        v-if="effectiveTenant.banner"
        :src="effectiveTenant.banner"
        :alt="`Banner de ${effectiveTenant.name}`"
        class="w-full h-full object-cover opacity-80"
        @error="handleImageError($event, effectiveTenant?.theme)"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

      <!-- Botão Voltar para o Início / Showcase -->
      <NuxtLink
        to="/"
        class="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/60 transition-colors border border-white/10"
        aria-label="Voltar para a página inicial"
      >
        <ChevronLeft class="w-4 h-4" />
        <span>Início</span>
      </NuxtLink>

      <!-- Botão de Compartilhar -->
      <button
        @click="shareStore"
        class="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors border border-white/10 cursor-pointer"
        aria-label="Compartilhar vitrine da loja"
      >
        <Share2 class="w-4 h-4" />
      </button>
    </div>

    <!-- 2. Header & Card de Identidade da Loja -->
    <header class="max-w-4xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-10">
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 flex flex-col items-center text-center">
        <!-- Logo Flutuante com Fallback -->
        <div class="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white p-1 shadow-md border border-slate-100 shrink-0 overflow-hidden -mt-16 sm:-mt-20 mb-4">
          <img
            v-if="effectiveTenant.logo"
            :src="effectiveTenant.logo"
            :alt="`Logo de ${effectiveTenant.name}`"
            class="w-full h-full object-cover rounded-xl"
            @error="handleImageError($event, effectiveTenant?.theme)"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center font-bold text-2xl"
            :class="themeClasses.primaryText"
          >
            {{ effectiveTenant.name ? effectiveTenant.name.charAt(0) : 'A' }}
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap justify-center mb-1">
          <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {{ effectiveTenant.name }}
          </h1>
          <span v-if="effectiveTenant.priceRange" class="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {{ effectiveTenant.priceRange }}
          </span>
        </div>

        <p v-if="effectiveTenant.description" class="text-xs sm:text-sm text-slate-500 max-w-lg mb-4 leading-relaxed">
          {{ effectiveTenant.description }}
        </p>

        <!-- Badges e Botões de Prova Social e Status -->
        <div class="flex items-center gap-2.5 flex-wrap justify-center text-xs font-semibold mb-5">
          <!-- Avaliações iFood-Style (Abre Modal de Reviews) -->
          <button
            v-if="effectiveTenant.reviews"
            @click="isReviewsOpen = true"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs hover:bg-amber-100 transition-colors cursor-pointer"
            aria-label="Abrir avaliações da loja"
          >
            <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span class="font-bold">{{ (effectiveTenant.reviews?.score || 5).toFixed(1) }}</span>
            <span class="text-slate-500">({{ effectiveTenant.reviews?.totalReviews || 0 }})</span>
          </button>

          <!-- Status Aberto/Fechado (Abre Modal de Informações) com Badge Dinâmico -->
          <button
            @click="isInfoOpen = true"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs transition-all cursor-pointer"
            :class="isOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/80'"
            :aria-label="`${openingAriaLabel || (isOpen ? 'Loja aberta' : 'Loja fechada')}. Clique para ver horários e endereço`"
          >
            <Clock class="w-3.5 h-3.5" aria-hidden="true" />
            <span>{{ statusText }}</span>
          </button>

          <!-- Botão Agendar Horário em Destaque (Alaska Hub & Pro) -->
          <button
            v-if="isServiceStore"
            @click="openBookingModal"
            class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
            :class="themeClasses.buttonPrimary"
            aria-label="Agendar horário de atendimento"
          >
            <Calendar class="w-3.5 h-3.5" />
            <span>Agendar Horário</span>
          </button>
        </div>

        <!-- Meta Informações Rápidas -->
        <div class="w-full pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-slate-600">
          <div v-if="effectiveTenant.address" class="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900" @click="isInfoOpen = true">
            <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span class="truncate">{{ effectiveTenant.address }}</span>
          </div>
          <div v-if="effectiveTenant.deliveryType" class="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900" @click="isInfoOpen = true">
            <Truck class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{{ effectiveTenant.deliveryType }}</span>
          </div>
          <div v-if="effectiveTenant.openingHours" class="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900" @click="isInfoOpen = true">
            <Clock class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{{ effectiveTenant.openingHours.open }} às {{ effectiveTenant.openingHours.close }}</span>
          </div>
          <div class="flex items-center justify-center gap-1.5">
            <a
              :href="`https://wa.me/${(effectiveTenant.phoneWhatsApp || '').replace(/\D/g, '')}`"
              target="_blank"
              rel="noopener noreferrer"
              class="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <Phone class="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </header>

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
            aria-label="Rolar destaques para esquerda"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            @click="scrollCarousel('right')"
            class="p-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            aria-label="Rolar destaques para direita"
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
          :class="{ 'opacity-60 bg-slate-50/50': !product.isAvailable }"
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
                v-if="!product.isAvailable"
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
            :class="{ 'opacity-60 bg-slate-50/50': !product.isAvailable }"
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
                  v-if="!product.isAvailable"
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
                v-if="!product.isAvailable"
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
    <ClientOnly>
      <footer
        v-if="totalItemsCount > 0 && !isBookingOpen"
        class="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-fade-in-up"
      >
        <button
          @click="isCartDrawerOpen = true"
          class="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700/50 cursor-pointer active:scale-[0.98] transition-all"
        >
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-full bg-amber-500 text-slate-900 text-xs font-black flex items-center justify-center">
              {{ totalItemsCount }}
            </span>
            <span class="text-sm font-bold">Ver Sacola</span>
          </div>
          <span class="text-sm font-extrabold font-mono text-amber-400">
            {{ formatCurrency(cartSubtotal) }}
          </span>
        </button>
      </footer>
    </ClientOnly>

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
import { formatCurrency } from '~/utils/formatters'
import { handleImageError } from '~/utils/images'
import ProductSearchInput from '~/components/ProductSearchInput.vue'
import BookingModal from '~/components/BookingModal.vue'
import StoreInfoModal from '~/components/StoreInfoModal.vue'
import {
  Phone,
  MapPin,
  Truck,
  Clock,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Share2,
  Calendar
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
    categories: effectiveCategories
  }
})

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
    if (cat && Array.isArray(cat.products)) {
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
