<!-- components/admin/tabs/AdminDeliveryTab.vue -->
<script setup lang="ts">
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
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h2 class="text-sm font-bold text-white flex items-center gap-2">
        <span>🛵 Taxa de Entrega & Pedido Mínimo</span>
      </h2>
      <p class="text-xs text-slate-400">
        Ajuste valores e prazos de entrega em tempo real sem mexer no código.
      </p>

      <div class="space-y-3 pt-2">
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Taxa de Entrega Padrão (R$):</label>
          <input
            type="number"
            step="0.50"
            :value="deliveryFeeInput"
            @input="emit('update:deliveryFeeInput', Number(($event.target as HTMLInputElement).value))"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Valor Mínimo do Pedido (R$):</label>
          <input
            type="number"
            step="1.00"
            :value="minOrderInput"
            @input="emit('update:minOrderInput', Number(($event.target as HTMLInputElement).value))"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Tempo Estimado de Entrega:</label>
          <input
            type="text"
            :value="estimatedTimeInput"
            @input="emit('update:estimatedTimeInput', ($event.target as HTMLInputElement).value)"
            placeholder="Ex: 35-50 min"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <button
        @click="emit('save-delivery')"
        class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-2"
      >
        Salvar Configurações de Entrega
      </button>
    </div>
  </main>
</template>
