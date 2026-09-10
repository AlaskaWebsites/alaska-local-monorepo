<!-- components/admin/tabs/AdminCatalogTab.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'
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

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'hamburgueria-x')
const { tenant } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
      <div class="flex items-start gap-3">
        <span class="text-lg">⚡</span>
        <div class="text-xs">
          <p class="font-bold" :class="themeClasses.primaryText">Pausa Rápida & Preços em Tempo Real</p>
          <p class="text-slate-500 mt-0.5">Ligue ou desligue procedimentos/produtos e edite preços sem precisar fazer deploy.</p>
        </div>
      </div>

      <button
        @click="emit('create-product')"
        class="px-3.5 py-2 rounded-xl text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md active:scale-95"
        :class="themeClasses.primaryBg"
      >
        <Plus class="w-4 h-4 stroke-[2.5]" />
        <span>Novo Item</span>
      </button>
    </div>

    <section v-for="category in categories" :key="category.id" class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
          <span>{{ category.name }}</span>
          <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{{ (category.products || []).length }}</span>
        </h2>
      </div>

      <div class="space-y-2">
        <div
          v-for="product in (category.products || [])"
          :key="product.id"
          class="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all shadow-2xs"
          :class="{ 'opacity-60 bg-slate-50/70 border-dashed': !isProductAvailable(product) }"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-slate-900 truncate">{{ product.name }}</h3>
              <span
                class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border"
                :class="isProductAvailable(product) ? [themeClasses.badgeBg, themeClasses.badgeText, themeClasses.badgeBorder] : 'bg-rose-50 text-rose-700 border-rose-200'"
              >
                {{ isProductAvailable(product) ? 'Ativo' : 'Esgotado' }}
              </span>
            </div>
            <div class="flex items-center gap-3 mt-1.5 flex-wrap">
              <p class="text-xs text-slate-900 font-mono font-bold">
                R$ {{ Number(getProductPrice(product)).toFixed(2).replace('.', ',') }}
              </p>
              <button
                @click="emit('edit-price', category.products, product)"
                class="text-[11px] underline font-bold cursor-pointer transition-colors"
                :class="themeClasses.primaryText"
              >
                Alterar Preço
              </button>
              <button
                v-if="product.optionGroups && product.optionGroups.length > 0"
                @click="emit('manage-options', product)"
                class="text-[11px] text-amber-700 hover:text-amber-800 underline font-semibold cursor-pointer"
              >
                Gerenciar Adicionais ({{ product.optionGroups.length }})
              </button>
              <button
                @click="emit('delete-product', product.id, product.name)"
                class="text-[11px] text-slate-400 hover:text-rose-600 font-medium cursor-pointer ml-auto"
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
            class="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white"
            :class="isProductAvailable(product) ? [themeClasses.primaryBg, themeClasses.focusRing] : 'bg-slate-200'"
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
