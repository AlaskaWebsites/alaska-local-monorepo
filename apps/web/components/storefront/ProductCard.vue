<!-- components/storefront/ProductCard.vue -->
<script setup lang="ts">
import { formatCurrency } from '~/utils/formatters'
import { handleImageError } from '~/utils/images'
import type { Product } from '~/types'

const props = withDefaults(
  defineProps<{
    product: Product
    theme?: string
    themeClasses?: any
    isServiceStore?: boolean
    layout?: 'horizontal' | 'grid'
  }>(),
  {
    layout: 'grid'
  }
)

const emit = defineEmits<{
  (e: 'click', product: Product): void
}>()
</script>

<template>
  <article
    @click="emit('click', product)"
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
        @error="handleImageError($event, theme)"
      />
      <span
        v-if="!product.isAvailable"
        class="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider text-center p-1"
      >
        Esgotado
      </span>
    </div>
  </article>
</template>
