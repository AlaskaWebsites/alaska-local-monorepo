<!-- components/admin/modals/AdminPriceModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTenantTheme } from '~/composables/useTenantTheme'
import type { Product } from '~/types'

const props = defineProps<{
  isOpen: boolean
  product: Product | null
  initialPrice: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', newPrice: number): void
}>()

const { themeClasses } = useTenantTheme()
const priceInput = ref(props.initialPrice)

watch(
  () => props.initialPrice,
  (val) => { priceInput.value = val }
)
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4" @click="emit('close')">
    <div class="w-full max-w-sm bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xl space-y-4" @click.stop>
      <h3 class="text-sm font-bold text-slate-900">Editar Preço do Item</h3>
      <p class="text-xs text-slate-500 font-medium">{{ product?.name }}</p>

      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1">Novo Preço (R$):</label>
        <input
          type="number"
          step="0.50"
          v-model.number="priceInput"
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono outline-none focus:border-slate-400"
          autofocus
        />
      </div>

      <div class="flex gap-2 pt-2">
        <button
          @click="emit('close')"
          class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          @click="emit('confirm', priceInput)"
          class="flex-1 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer active:scale-95"
          :class="themeClasses.primaryBg"
        >
          Salvar Preço
        </button>
      </div>
    </div>
  </div>
</template>
