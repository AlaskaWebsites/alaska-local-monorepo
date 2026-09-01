<!-- components/admin/tabs/AdminCatalogTab.vue -->
<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { formatCurrency } from '~/utils/formatters'
import type { Category, Product } from '~/types'

const props = defineProps<{
  categories: Category[]
  isProductAvailable: (product: Product) => boolean
  getProductPrice: (product: Product) => number
}>()

const emit = defineEmits<{
  (e: 'create-product'): void
  (e: 'toggle-product', categoryProducts: Product[], productId: string, currentStatus: boolean): void
  (e: 'edit-price', categoryProducts: Product[], product: Product): void
  (e: 'manage-options', product: Product): void
  (e: 'delete-product', productId: string, productName: string): void
}>()
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3">
      <div class="flex items-start gap-3">
        <span class="text-lg">⚡</span>
        <div class="text-xs">
          <p class="font-bold text-emerald-400">Pausa Rápida & Preços em Tempo Real</p>
          <p class="text-slate-300 mt-0.5">Ligue ou desligue procedimentos/produtos e edite preços sem precisar fazer deploy.</p>
        </div>
      </div>

      <button
        @click="emit('create-product')"
        class="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md"
      >
        <Plus class="w-4 h-4" />
        <span>Novo Item</span>
      </button>
    </div>

    <section v-for="category in categories" :key="category.id" class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span>{{ category.name }}</span>
          <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{{ (category.products || []).length }}</span>
        </h2>
      </div>

      <div class="space-y-2">
        <div
          v-for="product in (category.products || [])"
          :key="product.id"
          class="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between gap-4 transition-all"
          :class="{ 'opacity-60 bg-slate-950/40 border-dashed': !isProductAvailable(product) }"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-semibold text-white truncate">{{ product.name }}</h3>
              <span
                class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                :class="isProductAvailable(product) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
              >
                {{ isProductAvailable(product) ? 'Ativo' : 'Esgotado' }}
              </span>
            </div>
            <div class="flex items-center gap-3 mt-1">
              <p class="text-xs text-slate-300 font-mono font-bold">
                R$ {{ Number(getProductPrice(product)).toFixed(2).replace('.', ',') }}
              </p>
              <button
                @click="emit('edit-price', category.products, product)"
                class="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
              >
                Alterar Preço
              </button>
              <button
                v-if="product.optionGroups && product.optionGroups.length > 0"
                @click="emit('manage-options', product)"
                class="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
              >
                Gerenciar Adicionais ({{ product.optionGroups.length }})
              </button>
              <button
                @click="emit('delete-product', product.id, product.name)"
                class="text-[11px] text-slate-500 hover:text-rose-400 font-medium cursor-pointer ml-auto"
                title="Excluir produto do catálogo"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Switch Acessível W3C / WCAG -->
          <button
            type="button"
            role="switch"
            :aria-checked="isProductAvailable(product)"
            :aria-label="`Alternar disponibilidade de ${product.name}`"
            @click="emit('toggle-product', category.products, product.id, isProductAvailable(product))"
            class="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            :class="isProductAvailable(product) ? 'bg-emerald-500' : 'bg-slate-800'"
          >
            <span
              aria-hidden="true"
              class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
              :class="isProductAvailable(product) ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
