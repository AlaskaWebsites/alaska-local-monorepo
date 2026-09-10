<!-- components/admin/tabs/AdminDeliveryTab.vue -->
<script setup lang="ts">
import { useTenantTheme } from '~/composables/useTenantTheme'
import { Truck, Check } from 'lucide-vue-next'

const props = defineProps<{
  deliveryFeeInput: number
  minOrderInput: number
  estimatedTimeInput: string
}>()

const emit = defineEmits<{
  (e: 'update:deliveryFeeInput', val: number): void
  (e: 'update:minOrderInput', val: number): void
  (e: 'update:estimatedTimeInput', val: string): void
  (e: 'save-delivery'): void
}>()

const { themeClasses } = useTenantTheme()
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Truck class="w-4 h-4 text-emerald-600" />
          <span>Configuração de Delivery & Taxas</span>
        </h2>
      </div>

      <div class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Taxa de Entrega (R$):</label>
            <input
              type="number"
              step="0.50"
              :value="deliveryFeeInput"
              @input="emit('update:deliveryFeeInput', Number(($event.target as HTMLInputElement).value))"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Pedido Mínimo (R$):</label>
            <input
              type="number"
              step="1.00"
              :value="minOrderInput"
              @input="emit('update:minOrderInput', Number(($event.target as HTMLInputElement).value))"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Tempo Estimado de Entrega:</label>
          <input
            type="text"
            :value="estimatedTimeInput"
            @input="emit('update:estimatedTimeInput', ($event.target as HTMLInputElement).value)"
            placeholder="Ex: 35-50 min"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <button
          @click="emit('save-delivery')"
          class="w-full text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-[0.99]"
          :class="themeClasses.primaryBg"
        >
          <Check class="w-4 h-4" />
          <span>Salvar Taxas de Entrega</span>
        </button>
      </div>
    </div>
  </main>
</template>
