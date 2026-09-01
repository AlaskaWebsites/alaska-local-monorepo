<!-- components/storefront/ProductCatalogGrid.vue -->
<script setup lang="ts">
import ProductCard from './ProductCard.vue'
import type { Category, Product } from '~/types'

const props = defineProps<{
  categories: Category[]
  theme?: string
  themeClasses: any
  isSearching?: boolean
  searchQuery?: string
}>()

const emit = defineEmits<{
  (e: 'select-product', product: Product): void
  (e: 'clear-search'): void
}>()
</script>

<template>
  <main class="max-w-4xl mx-auto px-4 mt-6 space-y-10">
    <div v-if="categories.length === 0" class="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <p class="text-slate-400 text-sm font-medium">Nenhum produto encontrado para "{{ searchQuery }}"</p>
      <button
        @click="emit('clear-search')"
        class="mt-3 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
      >
        Limpar busca
      </button>
    </div>

    <section
      v-for="category in categories"
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
        <ProductCard
          v-for="product in category.products"
          :key="product.id"
          :product="product"
          :theme="theme"
          :theme-classes="themeClasses"
          @click="emit('select-product', product)"
        />
      </div>
    </section>
  </main>
</template>
