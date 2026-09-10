<!-- components/admin/tabs/AdminHoursTab.vue -->
<script setup lang="ts">
import { useTenantTheme } from '~/composables/useTenantTheme'
import { Clock, AlertTriangle, Check } from 'lucide-vue-next'

const props = defineProps<{
  isEmergencyClosed: boolean
  weeklyDaysConfig: Record<number, { closed: boolean; open: string; close: string }>
  scheduleSuccessMsg?: string
}>()

const emit = defineEmits<{
  (e: 'toggle-emergency'): void
  (e: 'toggle-day-closed', dayIndex: number): void
  (e: 'save-schedule'): void
}>()

const { themeClasses } = useTenantTheme()
const weekDays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <!-- Pausa de Emergência -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-amber-500" />
            <span>Pausa Imediata / Emergencial</span>
          </h2>
          <p class="text-xs text-slate-500">
            Pausa todos os pedidos e agendamentos instantaneamente na vitrine.
          </p>
        </div>

        <button
          @click="emit('toggle-emergency')"
          class="px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer active:scale-95"
          :class="isEmergencyClosed ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'"
        >
          {{ isEmergencyClosed ? 'Reabrir Loja Agora' : 'Pausar Atendimento' }}
        </button>
      </div>
    </div>

    <!-- Escala Semanal de Funcionamento -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock class="w-4 h-4 text-slate-600" />
          <span>Horário de Funcionamento Semanal</span>
        </h2>
      </div>

      <div class="space-y-2 pt-1">
        <div
          v-for="(dayName, dIdx) in weekDays"
          :key="dIdx"
          class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
        >
          <span class="font-bold text-slate-800 w-28">{{ dayName }}</span>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="emit('toggle-day-closed', dIdx)"
              class="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer"
              :class="weeklyDaysConfig[dIdx]?.closed ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-white text-slate-700 border-slate-200'"
            >
              {{ weeklyDaysConfig[dIdx]?.closed ? 'Fechado' : 'Aberto' }}
            </button>

            <div v-if="!weeklyDaysConfig[dIdx]?.closed" class="flex items-center gap-1.5 font-mono">
              <input
                type="time"
                v-model="weeklyDaysConfig[dIdx].open"
                class="bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 outline-none w-20 text-center"
              />
              <span class="text-slate-400">às</span>
              <input
                type="time"
                v-model="weeklyDaysConfig[dIdx].close"
                class="bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 outline-none w-20 text-center"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="scheduleSuccessMsg" class="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold text-center animate-in fade-in">
        {{ scheduleSuccessMsg }}
      </div>

      <button
        @click="emit('save-schedule')"
        class="w-full text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-[0.99]"
        :class="themeClasses.primaryBg"
      >
        <Check class="w-4 h-4" />
        <span>Salvar Horários da Semana</span>
      </button>
    </div>
  </main>
</template>
