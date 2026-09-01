<!-- components/storefront/BottomCartFloatingBar.vue -->
<script setup lang="ts">
import { formatCurrency } from '~/utils/formatters'

const props = defineProps<{
  totalItems: number
  subtotal: number
  isBookingOpen?: boolean
}>()

const emit = defineEmits<{
  (e: 'open-cart'): void
}>()
</script>

<template>
  <ClientOnly>
    <footer
      v-if="totalItems > 0 && !isBookingOpen"
      class="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-fade-in-up"
    >
      <button
        @click="emit('open-cart')"
        class="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700/50 cursor-pointer active:scale-[0.98] transition-all"
      >
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-amber-500 text-slate-900 text-xs font-black flex items-center justify-center">
            {{ totalItems }}
          </span>
          <span class="text-sm font-bold">Ver Sacola</span>
        </div>
        <span class="text-sm font-extrabold font-mono text-amber-400">
          {{ formatCurrency(subtotal) }}
        </span>
      </button>
    </footer>
  </ClientOnly>
</template>
