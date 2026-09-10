<!-- components/admin/tabs/AdminDeliveryTab.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'

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

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'hamburgueria-x')
const { tenant } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
        <span>🛵 Taxa de Entrega & Pedido Mínimo</span>
      </h2>
      <p class="text-xs text-slate-500">
        Ajuste as regras de entrega para seus clientes.
      </p>

      <div class="space-y-4 pt-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Taxa de Entrega Padrão (R$):</label>
            <input
              :value="deliveryFeeInput"
              @input="emit('update:deliveryFeeInput', Number(($event.target as HTMLInputElement).value))"
              type="number"
              step="0.50"
              class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Pedido Mínimo (R$):</label>
            <input
              :value="minOrderInput"
              @input="emit('update:minOrderInput', Number(($event.target as HTMLInputElement).value))"
              type="number"
              step="1.00"
              class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Tempo Estimado de Entrega:</label>
          <input
            :value="estimatedTimeInput"
            @input="emit('update:estimatedTimeInput', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Ex: 30-45 min"
            class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <button
          @click="emit('save-delivery')"
          class="w-full text-slate-950 font-bold py-3 rounded-xl text-xs transition-colors shadow-md active:scale-[0.99] cursor-pointer mt-2"
          :class="themeClasses.primaryBg"
        >
          Salvar Regras de Entrega
        </button>
      </div>
    </div>
  </main>
</template>
