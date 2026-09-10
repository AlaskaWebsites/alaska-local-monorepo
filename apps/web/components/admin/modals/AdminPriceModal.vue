<!-- components/admin/modals/AdminPriceModal.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'
import type { Product } from '~/types'

const props = defineProps<{
  isOpen: boolean
  editingProduct: Product | null
  priceInput: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:priceInput', val: number): void
  (e: 'confirm'): void
}>()

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'hamburgueria-x')
const { tenant } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    @click="emit('close')"
  >
    <div
      class="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900"
      @click.stop
    >
      <div class="space-y-1">
        <h3 class="text-base font-bold text-slate-900">Editar Preço</h3>
        <p class="text-xs text-slate-500 truncate">{{ editingProduct?.name }}</p>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-semibold text-slate-600 mb-1">Novo Preço (R$):</label>
        <input
          :value="priceInput"
          @input="emit('update:priceInput', Number(($event.target as HTMLInputElement).value))"
          type="number"
          step="0.01"
          class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono outline-none focus:border-slate-400"
          autofocus
        />
      </div>

      <div class="flex items-center gap-2 pt-2">
        <button
          type="button"
          @click="emit('close')"
          class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="emit('confirm')"
          class="flex-1 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-md active:scale-95"
          :class="themeClasses.primaryBg"
        >
          Salvar Preço
        </button>
      </div>
    </div>
  </div>
</template>
