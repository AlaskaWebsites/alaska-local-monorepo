<!-- components/admin/tabs/AdminHoursTab.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  openingHours?: any
  isEmergencyClosed?: boolean
}>()

const emit = defineEmits<{
  (e: 'save-hours', openTime: string, closeTime: string): void
  (e: 'toggle-emergency'): void
}>()

function extractTime(val: any, fallback: string): string {
  if (typeof val === 'string' && val.length >= 4) return val
  if (val && typeof val === 'object') {
    if (typeof val.open === 'string') return val.open
    if (typeof val.close === 'string') return val.close
    if (val.monday && typeof val.monday.open === 'string') return val.monday.open
    if (val.monday && typeof val.monday.close === 'string') return val.monday.close
  }
  return fallback
}

const openTimeInput = ref(extractTime(props.openingHours?.open || props.openingHours?.monday?.open, '09:00'))
const closeTimeInput = ref(extractTime(props.openingHours?.close || props.openingHours?.monday?.close, '20:00'))

watch(
  () => props.openingHours,
  (hours) => {
    if (hours) {
      openTimeInput.value = extractTime(hours.open || hours.monday?.open, '09:00')
      closeTimeInput.value = extractTime(hours.close || hours.monday?.close, '20:00')
    }
  },
  { deep: true }
)

function handleSave() {
  if (openTimeInput.value && closeTimeInput.value) {
    emit('save-hours', openTimeInput.value, closeTimeInput.value)
  }
}
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <!-- Botão de Pausa Emergencial -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h2 class="text-sm font-bold text-white flex items-center gap-2">
        <span>🛑 Pausa Geral de Atendimento</span>
      </h2>
      <p class="text-xs text-slate-400">
        Cozinha lotada, chuva forte ou folga inesperada? Pause todo o atendimento da loja com um clique.
      </p>

      <button
        @click="emit('toggle-emergency')"
        class="w-full py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-lg active:scale-[0.98]"
        :class="isEmergencyClosed ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-rose-600 text-white hover:bg-rose-700'"
      >
        {{ isEmergencyClosed ? '🟢 Reabrir Atendimento Agora' : '🛑 Pausar Atendimento da Loja Agora' }}
      </button>
    </div>

    <!-- Ajuste de Horário de Funcionamento -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h2 class="text-sm font-bold text-white flex items-center gap-2">
        <span>🕒 Horário de Atendimento Padrão</span>
      </h2>
      <p class="text-xs text-slate-400">
        Defina o horário de abertura e fechamento padrão para os dias normais de funcionamento.
      </p>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-slate-400 font-semibold mb-1">Abre às:</label>
          <input
            type="time"
            v-model="openTimeInput"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block text-xs text-slate-400 font-semibold mb-1">Fecha às:</label>
          <input
            type="time"
            v-model="closeTimeInput"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <button
        @click="handleSave"
        class="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-md"
      >
        Salvar Horários
      </button>
    </div>
  </main>
</template>
