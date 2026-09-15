<!-- components/admin/tabs/AdminDeliveryTab.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useTenantTheme } from '~/composables/useTenantTheme'

const props = withDefaults(
  defineProps<{
    deliveryForm?: {
      deliveryFee?: number
      minOrderValue?: number
      estimatedTime?: string
    }
    deliveryFeeInput?: number
    minOrderInput?: number
    estimatedTimeInput?: string
    deliverySuccessMsg?: string
  }>(),
  {
    deliveryForm: undefined,
    deliveryFeeInput: undefined,
    minOrderInput: undefined,
    estimatedTimeInput: undefined,
    deliverySuccessMsg: ''
  }
)

const emit = defineEmits<{
  (e: 'update:deliveryFeeInput', val: number): void
  (e: 'update:minOrderInput', val: number): void
  (e: 'update:estimatedTimeInput', val: string): void
  (e: 'save-delivery'): void
  (e: 'save'): void
}>()

const { themeClasses } = useTenantTheme()

const activeForm = computed(() => {
  return props.deliveryForm || {
    deliveryFee: props.deliveryFeeInput ?? 5,
    minOrderValue: props.minOrderInput ?? 20,
    estimatedTime: props.estimatedTimeInput || '30-45 min'
  }
})

function handleFeeChange(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  if (props.deliveryForm) props.deliveryForm.deliveryFee = val
  emit('update:deliveryFeeInput', val)
}

function handleMinOrderChange(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  if (props.deliveryForm) props.deliveryForm.minOrderValue = val
  emit('update:minOrderInput', val)
}

function handleTimeChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  if (props.deliveryForm) props.deliveryForm.estimatedTime = val
  emit('update:estimatedTimeInput', val)
}

function handleSave() {
  emit('save-delivery')
  emit('save')
}
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <div>
        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>🛵 Taxa de Entrega & Pedido Mínimo</span>
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Ajuste as regras de entrega para seus clientes.
        </p>
      </div>

      <div class="space-y-3 pt-1">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Taxa de Entrega Padrão (R$):</label>
          <input
            type="number"
            step="0.50"
            :value="activeForm.deliveryFee"
            @input="handleFeeChange"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Pedido Mínimo (R$):</label>
          <input
            type="number"
            step="1.00"
            :value="activeForm.minOrderValue"
            @input="handleMinOrderChange"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Tempo Estimado de Entrega:</label>
          <input
            type="text"
            :value="activeForm.estimatedTime"
            @input="handleTimeChange"
            placeholder="Ex: 30-45 min"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
          />
        </div>
      </div>

      <div v-if="deliverySuccessMsg" class="text-xs text-emerald-600 text-center font-bold bg-emerald-50 border border-emerald-200 py-2 rounded-lg">
        {{ deliverySuccessMsg }}
      </div>

      <button
        type="button"
        @click="handleSave"
        class="w-full text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-md active:scale-98 mt-2"
        :class="themeClasses.primaryBg"
      >
        Salvar Regras de Entrega
      </button>
    </div>
  </main>
</template>
