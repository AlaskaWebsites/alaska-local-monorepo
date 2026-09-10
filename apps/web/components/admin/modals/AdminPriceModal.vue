<!-- components/admin/modals/AdminPriceModal.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'
import type { Product } from '~/types'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    editingProduct?: Product | null
    product?: Product | null
    priceInput?: number
    initialPrice?: number
  }>(),
  {
    editingProduct: null,
    product: null,
    priceInput: 0,
    initialPrice: 0
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:priceInput', val: number): void
  (e: 'confirm', newPrice?: number): void
}>()

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'hamburgueria-x')
const { tenant } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)

const activeProduct = computed(() => props.product || props.editingProduct)
const localPrice = ref(props.initialPrice || props.priceInput || 0)

watch(
  () => props.initialPrice ?? props.priceInput,
  (val) => {
    if (val !== undefined) localPrice.value = val
  }
)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      localPrice.value = props.initialPrice || props.priceInput || 0
    }
  }
)

function handleInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  localPrice.value = val
  emit('update:priceInput', val)
}

function handleConfirm() {
  emit('update:priceInput', localPrice.value)
  emit('confirm', localPrice.value)
}
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
        <p class="text-xs text-slate-500 truncate">{{ activeProduct?.name }}</p>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-semibold text-slate-600 mb-1">Novo Preço (R$):</label>
        <input
          :value="localPrice"
          @input="handleInput"
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
          @click="handleConfirm"
          class="flex-1 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-md active:scale-95"
          :class="themeClasses.primaryBg"
        >
          Salvar Preço
        </button>
      </div>
    </div>
  </div>
</template>
