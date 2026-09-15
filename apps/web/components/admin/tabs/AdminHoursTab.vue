<!-- components/admin/tabs/AdminHoursTab.vue -->
<script setup lang="ts">
import { useTenantTheme } from '~/composables/useTenantTheme'

const props = withDefaults(
  defineProps<{
    isEmergencyClosed?: boolean
    emergencyMessage?: string
    weeklyDaysConfig?: Array<{ key: string; label: string; closed: boolean; open: string; close: string }>
    scheduleSuccessMsg?: string
  }>(),
  {
    isEmergencyClosed: false,
    emergencyMessage: '',
    weeklyDaysConfig: () => [],
    scheduleSuccessMsg: ''
  }
)

const emit = defineEmits<{
  (e: 'toggle-emergency'): void
  (e: 'toggle-day-closed', day: any): void
  (e: 'save-schedule'): void
  (e: 'save-emergency', data: { isClosed: boolean; message: string }): void
}>()

const { themeClasses } = useTenantTheme()

function handleToggleEmergency() {
  emit('toggle-emergency')
  emit('save-emergency', { isClosed: !props.isEmergencyClosed, message: props.emergencyMessage || '' })
}

function handleToggleDay(d: any) {
  d.closed = !d.closed
  emit('toggle-day-closed', d)
}

function handleSave() {
  emit('save-schedule')
}
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <!-- Fechamento de Emergência -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-2xs">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>🚨 Fechamento de Emergência</span>
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Pausa o atendimento imediatamente na vitrine com um aviso aos clientes.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          :aria-checked="isEmergencyClosed"
          @click="handleToggleEmergency"
          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
          :class="isEmergencyClosed ? 'bg-rose-500' : 'bg-slate-200'"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
            :class="isEmergencyClosed ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>
    </div>

    <!-- Grade de Horários por Dia da Semana -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <div>
        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>🕒 Grade de Horários por Dia da Semana</span>
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Defina o horário de abertura e fechamento de cada dia.
        </p>
      </div>

      <div class="space-y-2.5 pt-1">
        <div
          v-for="d in weeklyDaysConfig"
          :key="d.key"
          class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
        >
          <div class="flex items-center gap-2.5">
            <button
              type="button"
              role="switch"
              :aria-checked="!d.closed"
              @click="handleToggleDay(d)"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="!d.closed ? [themeClasses.primaryBg] : 'bg-slate-300'"
            >
              <span
                aria-hidden="true"
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                :class="!d.closed ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
            <span class="font-bold text-slate-800" :class="{ 'opacity-50 line-through text-slate-400': d.closed }">
              {{ d.label }}
            </span>
          </div>

          <div v-if="!d.closed" class="flex items-center gap-1.5 font-mono">
            <input
              type="time"
              v-model="d.open"
              class="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-slate-400"
            />
            <span class="text-slate-400 text-xs">às</span>
            <input
              type="time"
              v-model="d.close"
              class="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-slate-400"
            />
          </div>
          <span v-else class="text-xs text-rose-600 font-bold px-2 py-1 bg-rose-50 rounded-md border border-rose-200">
            Fechado
          </span>
        </div>
      </div>

      <div v-if="scheduleSuccessMsg" class="text-xs text-emerald-600 text-center font-bold bg-emerald-50 border border-emerald-200 py-2 rounded-lg">
        {{ scheduleSuccessMsg }}
      </div>

      <button
        type="button"
        @click="handleSave"
        class="w-full text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-md active:scale-98 mt-2"
        :class="themeClasses.primaryBg"
      >
        Salvar Grade de Horários
      </button>
    </div>
  </main>
</template>
