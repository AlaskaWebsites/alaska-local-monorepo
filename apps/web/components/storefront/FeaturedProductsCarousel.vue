<!-- components/storefront/FeaturedProductsCarousel.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { formatCurrency } from '~/utils/formatters'
import { handleImageError } from '~/utils/images'
import type { Product } from '~/types'

const props = defineProps<{
  products: Product[]
  theme?: string
  themeClasses: any
  isServiceStore?: boolean
}>()

const emit = defineEmits<{
  (e: 'select-product', product: Product): void
}>()

const carouselRef = ref<HTMLElement | null>(null)

function scrollCarousel(direction: 'left' | 'right') {
  if (!carouselRef.value) return
  const offset = direction === 'left' ? -260 : 260
  carouselRef.value.scrollBy({ left: offset, behavior: 'smooth' })
}
</script>

<template>
  <section
    v-if="products.length > 0"
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
        v-for="product in products"
        :key="product.id"
        @click="emit('select-product', product)"
        class="min-w-[240px] sm:min-w-[260px] max-w-[260px] bg-white rounded-2xl border border-slate-100 p-3 shadow-md hover:shadow-lg transition-all snap-start flex flex-col justify-between cursor-pointer active:scale-[0.99]"
        :class="{ 'opacity-60 bg-slate-50/50': !product.isAvailable }"
      >
        <div class="space-y-2.5">
          <div class="w-full h-32 rounded-xl overflow-hidden bg-slate-100 relative">
            <img
              :src="product.image"
              :alt="product.name"
              class="w-full h-full object-cover"
              @error="handleImageError($event, theme)"
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
</template>
