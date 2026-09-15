<!-- components/admin/tabs/AdminCatalogTab.vue -->
<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { formatCurrency } from '~/utils/formatters'
import { useTenantTheme } from '~/composables/useTenantTheme'
import type { Category, Product } from '~/types'

const props = withDefaults(
  defineProps<{
    categories?: Category[]
    isProductAvailable?: (product: Product) => boolean
    getProductPrice?: (product: Product) => number
    isServiceStore?: boolean
  }>(),
  {
    categories: () => [],
    isProductAvailable: undefined,
    getProductPrice: undefined,
    isServiceStore: false
  }
)

const emit = defineEmits<{
  (e: 'create-product'): void
  (e: 'open-create-modal'): void
  (e: 'toggle-product', categoryProducts: Product[], productId: string, currentStatus: boolean): void
  (e: 'toggle-avail', product: Product): void
  (e: 'edit-price', categoryProducts: Product[], product: Product): void
  (e: 'open-price-modal', categoryProducts: Product[], product: Product): void
  (e: 'manage-options', product: Product): void
  (e: 'open-options', product: Product): void
  (e: 'delete-product', productId: string, productName: string): void
}>()

const { themeClasses } = useTenantTheme()

function resolvePrice(product: Product): number {
  if (typeof props.getProductPrice === 'function') {
    return props.getProductPrice(product)
  }
  return Number(product?.price) || 0
}

function checkAvailable(product: Product): boolean {
  if (typeof props.isProductAvailable === 'function') {
    return props.isProductAvailable(product)
  }
  return product?.isAvailable !== false
}

function handleCreate() {
  emit('create-product')
  emit('open-create-modal')
}

function handleToggle(categoryProducts: Product[], product: Product) {
  const status = checkAvailable(product)
  emit('toggle-product', categoryProducts, product.id, status)
  emit('toggle-avail', product)
}

function handleEditPrice(categoryProducts: Product[], product: Product) {
  emit('edit-price', categoryProducts, product)
  emit('open-price-modal', categoryProducts, product)
}

function handleOptions(product: Product) {
  emit('manage-options', product)
  emit('open-options', product)
}

function handleDelete(product: Product) {
  emit('delete-product', product.id, product.name)
}
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <!-- Banner de Ação Rápida -->
    <div
      class="border rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs"
      :class="[themeClasses.badgeBg, themeClasses.badgeBorder]"
    >
      <div class="flex items-start gap-3">
        <span class="text-xl">⚡</span>
        <div class="text-xs">
          <p class="font-bold" :class="themeClasses.primaryText">Pausa Rápida & Preços em Tempo Real</p>
          <p class="text-slate-600 mt-0.5 font-medium">Ligue ou desligue procedimentos/produtos e edite preços sem precisar fazer deploy.</p>
        </div>
      </div>

      <button
        type="button"
        @click="handleCreate"
        class="px-3.5 py-2 rounded-xl text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md active:scale-95"
        :class="themeClasses.primaryBg"
      >
        <Plus class="w-4 h-4 stroke-[2.5]" />
        <span>Novo Item</span>
      </button>
    </div>

    <!-- Categorias & Produtos -->
    <section v-for="category in categories" :key="category.id" class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <span>{{ category.name }}</span>
          <span class="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
            {{ (category.products || []).length }}
          </span>
        </h2>
      </div>

      <div class="space-y-2.5">
        <div
          v-for="product in (category.products || [])"
          :key="product.id"
          class="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all shadow-2xs"
          :class="{ 'opacity-60 bg-slate-50 border-dashed': !checkAvailable(product) }"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-slate-900 truncate">{{ product.name }}</h3>
              <span
                class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border"
                :class="checkAvailable(product) ? [themeClasses.badgeBg, themeClasses.badgeText, themeClasses.badgeBorder] : 'bg-rose-50 text-rose-700 border-rose-200'"
              >
                {{ checkAvailable(product) ? 'Ativo' : 'Esgotado' }}
              </span>
            </div>

            <div class="flex items-center gap-3 mt-1.5 flex-wrap">
              <p class="text-xs text-slate-900 font-mono font-extrabold">
                {{ formatCurrency(resolvePrice(product)) }}
              </p>
              <button
                type="button"
                @click="handleEditPrice(category.products || [], product)"
                class="text-[11px] font-bold underline cursor-pointer transition-colors"
                :class="themeClasses.primaryText"
              >
                Alterar Preço
              </button>
              <button
                v-if="product.optionGroups && product.optionGroups.length > 0"
                type="button"
                @click="handleOptions(product)"
                class="text-[11px] text-amber-600 hover:text-amber-700 font-bold underline cursor-pointer"
              >
                Gerenciar Adicionais ({{ product.optionGroups.length }})
              </button>
              <button
                type="button"
                @click="handleDelete(product)"
                class="text-[11px] text-slate-400 hover:text-rose-600 font-medium cursor-pointer ml-auto p-1"
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
            :aria-checked="checkAvailable(product)"
            :aria-label="`Alternar disponibilidade de ${product.name}`"
            @click="handleToggle(category.products || [], product)"
            class="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="checkAvailable(product) ? [themeClasses.primaryBg] : 'bg-slate-300'"
          >
            <span
              aria-hidden="true"
              class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
              :class="checkAvailable(product) ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
