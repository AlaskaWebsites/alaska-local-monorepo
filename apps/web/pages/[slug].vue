<!-- pages/[slug].vue -->
<template>
  <div v-if="tenant" class="min-h-screen bg-slate-50 text-slate-900 pb-32">
    <!-- 1. Banner de Capa Hero -->
    <div class="relative h-48 sm:h-64 w-full bg-slate-900 overflow-hidden">
      <img v-if="tenant.banner" :src="tenant.banner" :alt="`Banner de ${tenant.name}`"
        class="w-full h-full object-cover opacity-80" @error="handleImageError($event, tenant?.theme)" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

      <!-- Botão Voltar para o Início / Showcase -->
      <NuxtLink to="/"
        class="absolute top-4 left-4 z-20 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg backdrop-blur-md transition-all flex items-center gap-1 text-xs font-bold"
        aria-label="Voltar para a lista de lojas">
        <ChevronLeft class="w-4 h-4" aria-hidden="true" />
        <span class="hidden sm:inline pr-1">Início</span>
      </NuxtLink>

      <!-- Botão Compartilhar Loja -->
      <button @click="shareStore"
        class="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg backdrop-blur-md transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
        aria-label="Compartilhar link desta loja">
        <Share2 class="w-4 h-4" aria-hidden="true" />
        <span class="hidden sm:inline pr-1">{{ isCopied ? 'Link Copiado!' : 'Compartilhar' }}</span>
      </button>
    </div>

    <!-- 2. Card de Identidade do Estabelecimento -->
    <header class="max-w-4xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-10">
      <div class="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/80 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <!-- Logo Flutuante com Fallback -->
            <div class="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white p-1 shadow-md border border-slate-100 shrink-0 overflow-hidden">
              <img v-if="tenant.logo" :src="tenant.logo" :alt="`Logo de ${tenant.name}`"
                class="w-full h-full object-cover rounded-xl" @error="handleImageError($event, tenant?.theme)" />
              <div v-else class="w-full h-full flex items-center justify-center font-bold text-2xl"
                :class="themeClasses.primaryText">
                {{ tenant.name ? tenant.name.charAt(0) : 'A' }}
              </div>
            </div>

            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {{ tenant.name }}
                </h1>
                <!-- Badge de Categoria de Negócio -->
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                  :class="[themeClasses.badgeBg, themeClasses.badgeText]">
                  {{ isServiceStore ? '💈 Serviços & Agenda' : (tenant.businessCategory === 'shop' ? '🛍️ Vitrine & Catálogo' : '🍔 Cardápio & Delivery') }}
                </span>
              </div>
              <p v-if="tenant.description" class="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {{ tenant.description }}
              </p>
            </div>
          </div>

          <!-- Badges de Prova Social e Status -->
          <div class="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <!-- Nota de Avaliações (Abre Modal de Reviews) -->
            <button v-if="tenant.reviews" @click="isReviewsOpen = true"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-slate-800 font-bold text-xs shadow-2xs hover:bg-amber-100/80 transition-all cursor-pointer"
              :aria-label="`Avaliação ${(tenant.reviews.score || 5).toFixed(1)} de 5 estrelas. Ver ${tenant.reviews.totalReviews || 0} avaliações`">
              <Star class="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span>{{ (tenant.reviews.score || 5).toFixed(1) }}</span>
              <span class="text-slate-400 font-normal">({{ tenant.reviews.totalReviews || 0 }})</span>
            </button>

            <!-- Status Aberto/Fechado (Abre Modal de Informações) com Badge Dinâmico -->
            <button @click="isInfoOpen = true"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs transition-all cursor-pointer"
              :class="isOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/80'"
              :aria-label="`${openingAriaLabel || (isOpen ? 'Loja aberta' : 'Loja fechada')}. Clique para ver horários e endereço`">
              <Clock class="w-3.5 h-3.5" aria-hidden="true" />
              <span>{{ statusText }}</span>
            </button>

            <!-- Botão de Agendamento Rápido no Header (Apenas para Serviços/Clínicas) -->
            <button v-if="isServiceStore" @click="openBookingModal()"
              class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              :class="themeClasses.buttonPrimary" aria-label="Agendar horário online">
              <Calendar class="w-3.5 h-3.5" aria-hidden="true" />
              <span>Agendar Horário</span>
            </button>
          </div>
        </div>

        <!-- 3. Barra de Informações Rápidas -->
        <div class="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
          <div class="flex items-center gap-2">
            <MapPin class="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            <span class="truncate">{{ tenant.address || 'Atendimento local' }}</span>
          </div>

          <div class="flex items-center gap-2">
            <Truck class="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            <span>{{ isServiceStore ? 'Atendimento no local' : (tenant.deliveryFee > 0 ? `Entrega ${formatCurrency(tenant.deliveryFee)}` : 'Entrega Grátis') }}</span>
          </div>

          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            <span>{{ tenant.openingHours ? `${tenant.openingHours.open} às ${tenant.openingHours.close}` : 'Horário flexível' }}</span>
          </div>

          <div class="flex items-center gap-2">
            <Phone class="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            <a :href="`https://wa.me/55${(tenant.phoneWhatsApp || '').replace(/\\D/g, '')}`" target="_blank"
              class="font-bold hover:underline" :class="themeClasses.primaryText">
              WhatsApp Direto
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- 3. Landmark Principal (<main>) Garantido e Acessível -->
    <main id="main-content" class="max-w-4xl mx-auto px-4 mt-6 space-y-8" aria-label="Catálogo e Produtos da Loja">
      <!-- Campo de Busca de Produtos em Tempo Real -->
      <div>
        <ProductSearchInput v-model="searchQuery" :theme="tenant?.theme" @clear="clearSearch" />

        <!-- Contagem de Resultados da Busca -->
        <div v-if="isSearching && hasResults"
          class="mt-3 flex items-center justify-between text-xs text-slate-600 animate-in fade-in duration-150">
          <span>
            Encontrado{{ totalResultsCount === 1 ? '' : 's' }} <strong>{{ totalResultsCount }}</strong> item{{ totalResultsCount === 1 ? '' : 's' }} para "<strong class="text-slate-900">{{ searchQuery }}</strong>"
          </span>
          <button @click="clearSearch" class="font-bold text-xs hover:underline cursor-pointer"
            :class="themeClasses.primaryText">
            Limpar busca
          </button>
        </div>

        <!-- Estado Vazio da Busca -->
        <div v-if="isSearching && !hasResults"
          class="mt-8 py-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search class="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 class="font-bold text-base text-slate-900">Nenhum item encontrado</h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Não encontramos nenhum item correspondente a "<strong class="text-slate-800">{{ searchQuery }}</strong>". Tente buscar por outros termos.
          </p>
          <button @click="clearSearch" class="px-5 py-2.5 rounded-2xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm active:scale-95"
            :class="themeClasses.buttonPrimary">
            Limpar busca e ver tudo
          </button>
        </div>
      </div>

      <!-- Seção Destaques (Ocultada quando em busca ativa) -->
      <section v-if="!isSearching && (featuredProducts?.length || 0) > 0" class="space-y-3.5"
        aria-labelledby="featured-title">
        <div class="flex items-center justify-between">
          <h2 id="featured-title" class="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles class="w-4 h-4 text-amber-500" aria-hidden="true" />
            <span>{{ isServiceStore ? 'Serviços Mais Procurados' : 'Destaques & Mais Pedidos' }}</span>
          </h2>

          <!-- Controles de Navegação Horizontal -->
          <div class="flex items-center gap-1.5">
            <button @click="scrollCarousel('left')"
              class="p-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              aria-label="Rolar destaques para esquerda">
              <ChevronLeft class="w-4 h-4" aria-hidden="true" />
            </button>
            <button @click="scrollCarousel('right')"
              class="p-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              aria-label="Rolar destaques para direita">
              <ChevronRight class="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <!-- Carrossel de Cards com Snap Scroll -->
        <div ref="carouselRef"
          class="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div v-for="product in (featuredProducts || [])" :key="product.id"
            @click="handleProductClick(product)"
            class="shrink-0 w-64 sm:w-68 md:w-72 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group active:scale-[0.99]">
            <div class="relative h-32 w-full bg-slate-100 overflow-hidden">
              <img v-if="product.image" :src="product.image" :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy"
                @error="handleImageError($event, tenant?.theme)" />
            </div>

            <div class="p-4 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3 class="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-slate-700 transition-colors">
                  {{ product.name }}
                </h3>
                <p class="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {{ product.description }}
                </p>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                <span class="font-extrabold text-xs" :class="themeClasses.primaryText">
                  {{ formatCurrency(product.price) }}
                </span>
                <span class="text-[10px] px-2.5 py-1 rounded-full font-bold border transition-all"
                  :class="[themeClasses.badgeBg, themeClasses.badgeText, themeClasses.badgeBorder]">
                  {{ isServiceStore ? 'Agendar' : (((product?.optionGroups?.length || 0) > 0) ? 'Montar' : '+ Adicionar') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Barra Fixa de Categorias -->
      <CategoryTabs v-if="(filteredCategories?.length || 0) > 0" :categories="filteredCategories || []" :theme="tenant?.theme" />

      <!-- Catálogo Completo de Produtos / Serviços -->
      <div v-if="(filteredCategories?.length || 0) > 0" class="space-y-10">
        <section v-for="category in (filteredCategories || [])" :key="category.id" :id="category.id" class="space-y-4 scroll-mt-24"
          :aria-labelledby="`cat-title-${category.id}`">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-4 rounded-full" :class="themeClasses.categoryIndicator" aria-hidden="true"></span>
            <h2 :id="`cat-title-${category.id}`" class="text-lg font-extrabold text-slate-900">
              {{ category.name }}
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="product in (category.products || [])" :key="product.id"
              @click="handleProductClick(product)"
              class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex gap-3.5 cursor-pointer group active:scale-[0.99]">
              <div class="flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1">
                    {{ product.name }}
                  </h3>
                  <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {{ product.description }}
                  </p>
                </div>

                <div class="flex items-center gap-2 mt-3">
                  <span class="font-extrabold text-sm" :class="themeClasses.primaryText">
                    {{ formatCurrency(product.price) }}
                  </span>
                  <span class="text-[10px] px-2.5 py-1 rounded-full font-bold border"
                    :class="[themeClasses.badgeBg, themeClasses.badgeText, themeClasses.badgeBorder]">
                    {{ isServiceStore ? 'Agendar' : (((product?.optionGroups?.length || 0) > 0) ? 'Montar' : '+ Adicionar') }}
                  </span>
                </div>
              </div>

              <!-- Imagem do Produto / Serviço -->
              <div class="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                <img v-if="product.image" :src="product.image" :alt="product.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy"
                  @error="handleImageError($event, tenant?.theme)" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 8. Modal Customizador de Produto (Alaska Menu & Shop) -->
    <ProductCustomizerModal :product="selectedProduct" :tenant="tenant" :is-open="!!selectedProduct"
      @close="closeProductModal" @add-to-cart="handleAddProductToCart" />

    <!-- 9. Barra Fixa Inferior da Sacola (Apenas se houver itens) -->
    <div v-if="(cartItems?.length || 0) > 0" role="region" aria-label="Resumo da sacola de compras"
      class="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl z-40">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 block font-medium">Total da Sacola</span>
          <span class="text-base font-extrabold text-slate-900">
            {{ formatCurrency(cartSubtotal) }}
          </span>
          <span class="text-xs text-slate-400 ml-1.5">({{ totalItemsCount }} itens)</span>
        </div>

        <button @click="isCartDrawerOpen = true"
          class="px-5 py-2.5 rounded-full font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          :class="themeClasses.buttonPrimary" aria-label="Ver sacola de compras">
          <ShoppingCart class="w-4 h-4" aria-hidden="true" />
          <span>Ver Sacola</span>
        </button>
      </div>
    </div>

    <!-- 10. Drawer Lateral da Sacola -->
    <CartDrawerModal :is-open="isCartDrawerOpen" :tenant="tenant" :items="cartItems || []" @close="isCartDrawerOpen = false"
      @remove-item="removeCartItem" @clear-cart="clearCart" />

    <!-- 11. Modais de Informações e Reviews -->
    <StoreReviewsModal v-if="tenant?.reviews" :reviews="tenant.reviews" :theme="tenant?.theme" :is-open="isReviewsOpen"
      @close="isReviewsOpen = false" />

    <StoreInfoModal v-if="tenant" :tenant="tenant" :is-open="isInfoOpen" @close="isInfoOpen = false" />

    <!-- 12. Modal de Agendamento de Serviços (Alaska Hub & Pro) -->
    <BookingModal v-if="tenant" :is-open="isBookingOpen" :tenant="tenant" :initial-service="selectedBookingService"
      @close="isBookingOpen = false" />
  </div>

  <!-- Estado de Carregamento ou 404 durante SSR -->
  <div v-else class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="text-center space-y-3">
      <h2 class="text-lg font-bold text-slate-800">Estabelecimento não encontrado</h2>
      <p class="text-xs text-slate-500">O endereço acessado não corresponde a nenhuma demonstração ativa.</p>
      <NuxtLink to="/" class="inline-block mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">
        Voltar para a página inicial
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { useOpeningHours } from '~/composables/useOpeningHours'
import { useProductSearch } from '~/composables/useProductSearch'
import { useCart } from '~/composables/useCart'
import { formatCurrency } from '~/utils/formatters'
import { handleImageError } from '~/utils/images'
import ProductSearchInput from '~/components/ProductSearchInput.vue'
import BookingModal from '~/components/BookingModal.vue'
import {
  Phone,
  MapPin,
  Truck,
  Clock,
  Star,
  ShoppingCart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Share2,
  Calendar,
  Search
} from 'lucide-vue-next'
import type { Product, CartItem, BookingService, Tenant } from '~/types'

// 1. Resolução do Tenant Atual (Retorna referências reativas síncronas)
const { tenant, slug } = useTenant()

// 2. Tema Dinâmico
const { themeClasses } = useTenantTheme(tenant)

// 3. Horário de Funcionamento (Aberto / Fechado com Badge Dinâmico)
const { isOpen, statusText, ariaLabel: openingAriaLabel } = useOpeningHours(tenant)

// 4. Compartilhamento e Toast
const isCopied = ref(false)
function shareStore() {
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({
      title: tenant.value?.name,
      text: tenant.value?.description,
      url: window.location.href
    }).catch(() => {})
  } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2500)
  }
}

// 5. Busca de Produtos em Tempo Real (useProductSearch)
const {
  searchQuery,
  isSearching,
  filteredCategories,
  totalResultsCount,
  hasResults,
  clearSearch
} = useProductSearch(computed(() => tenant?.value?.categories || []))

// 6. Carrinho Persistente Multi-Tenant via LocalStorage (useCart)
const {
  items: cartItems,
  addItem: addToCart,
  removeItem: removeCartItem,
  clearCart,
  totalItemsCount,
  cartSubtotal
} = useCart(tenant)

// 7. SEO & OpenGraph Dinâmico com Guardas Defensivas de SSR
useSeoMeta({
  title: () => tenant?.value ? `${tenant.value.name} — Vitrine & Pedidos Online` : 'Alaska Local',
  description: () => tenant?.value?.description || 'Faça seu pedido ou agende seu horário online de forma rápida pelo WhatsApp.',
  ogTitle: () => tenant?.value?.name || 'Alaska Local',
  ogDescription: () => tenant?.value?.description || 'Atendimento digital via WhatsApp.',
  ogImage: () => tenant?.value?.banner || tenant?.value?.logo || '/og-image.png',
  twitterCard: 'summary_large_image'
})

// 8. Estados de Modais
const isReviewsOpen = ref(false)
const isInfoOpen = ref(false)
const isCartDrawerOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

// Estados do Módulo de Agendamento (Alaska Hub & Pro)
const isBookingOpen = ref(false)
const selectedBookingService = ref<BookingService | null>(null)

const isServiceStore = computed(() => {
  if (!tenant?.value) return false
  const cat = tenant.value.businessCategory || tenant.value.template
  return cat === 'hub' || cat === 'pro' || tenant.value.slug === 'barbearia-style' || tenant.value.slug === 'clinica-sorriso'
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

// 9. Destaques Dinâmicos com iterador seguro
const featuredProducts = computed(() => {
  if (!tenant?.value?.categories || !Array.isArray(tenant.value.categories)) return []
  const all: Product[] = []
  for (const cat of tenant.value.categories) {
    if (cat && Array.isArray(cat.products)) {
      all.push(...cat.products)
    }
  }
  return all.slice(0, 6)
})

// 10. Controle de Rolagem Horizontal do Carrossel
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
