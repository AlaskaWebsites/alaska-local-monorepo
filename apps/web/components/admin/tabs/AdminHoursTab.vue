<!-- components/admin/tabs/AdminHoursTab.vue -->
<script setup lang="ts">
const props = defineProps<{
  isEmergencyClosed: boolean
  weeklyDaysConfig: Array<{ key: string; label: string; closed: boolean; open: string; close: string }>
  scheduleSuccessMsg?: string
}>()

const emit = defineEmits<{
  (e: 'toggle-emergency'): void
  (e: 'toggle-day-closed', day: any): void
  (e: 'save-schedule'): void
}>()
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h2 class="text-sm font-bold text-white flex items-center gap-2">
        <span>🛑 Pausa Geral de Atendimento</span>
      </h2>
      <p class="text-xs text-slate-400">
        Precisa pausar o atendimento de emergência? Pause todas as solicitações com um clique.
      </p>

      <button
        @click="emit('toggle-emergency')"
        class="w-full py-4 rounded-xl font-extrabold text-sm transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
        :class="isEmergencyClosed ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'"
      >
        <span>{{ isEmergencyClosed ? '🛑 Loja Pausada (Clique para Reabrir)' : '⚡ Pausar Loja Agora (Emergência)' }}</span>
      </button>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h2 class="text-sm font-bold text-white flex items-center gap-2">
        <span>🕒 Programação Semanal & Dias de Funcionamento</span>
      </h2>
      <p class="text-xs text-slate-400">
        Defina os dias em que a loja abre e os horários de cada dia da semana.
      </p>

      <div class="space-y-3 pt-2">
        <div
          v-for="d in weeklyDaysConfig"
          :key="d.key"
          class="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
        >
          <div class="flex items-center gap-2.5">
            <button
              type="button"
              role="switch"
              :aria-checked="!d.closed"
              @click="emit('toggle-day-closed', d)"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
              :class="!d.closed ? 'bg-emerald-500' : 'bg-slate-800'"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
                :class="!d.closed ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
            <span class="font-semibold text-white" :class="{ 'opacity-50 line-through text-slate-500': d.closed }">
              {{ d.label }}
            </span>
          </div>

          <div v-if="!d.closed" class="flex items-center gap-1.5 font-mono">
            <input
              type="time"
              v-model="d.open"
              @change="emit('save-schedule')"
              class="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
            />
            <span class="text-slate-500">às</span>
            <input
              type="time"
              v-model="d.close"
              @change="emit('save-schedule')"
              class="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <span v-else class="text-xs text-rose-400 font-bold px-2 py-1 bg-rose-500/10 rounded-md">
            Fechado
          </span>
        </div>
      </div>

      <div v-if="scheduleSuccessMsg" class="text-xs text-emerald-400 text-center font-bold bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-lg">
        {{ scheduleSuccessMsg }}
      </div>

      <button
        @click="emit('save-schedule')"
        class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-4"
      >
        Salvar Horários
      </button>
    </div>
  </main>
</template>
