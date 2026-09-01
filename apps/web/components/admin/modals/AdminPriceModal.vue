<!-- components/admin/modals/AdminPriceModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
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

const priceInput = ref(props.initialPrice)

watch(
  () => props.initialPrice,
  (val) => { priceInput.value = val }
)
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" @click="emit('close')">
    <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4" @click.stop>
      <h3 class="text-sm font-bold text-white">Editar Preço do Item</h3>
      <p class="text-xs text-slate-400">{{ product?.name }}</p>

      <div>
        <label class="block text-xs font-semibold text-slate-400 mb-1">Novo Preço (R$):</label>
        <input
          type="number"
          step="0.50"
          v-model.number="priceInput"
          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none focus:border-emerald-500"
          autofocus
        />
      </div>

      <div class="flex gap-2 pt-2">
        <button
          @click="emit('close')"
          class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          @click="emit('confirm', priceInput)"
          class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Salvar Preço
        </button>
      </div>
    </div>
  </div>
</template>
