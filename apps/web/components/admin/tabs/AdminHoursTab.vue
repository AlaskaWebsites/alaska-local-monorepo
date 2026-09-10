<!-- components/admin/tabs/AdminHoursTab.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'

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

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'hamburgueria-x')
const { tenant } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <!-- 1. Pausa Emergencial Geral -->
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
          @click="emit('toggle-emergency')"
          class="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white"
          :class="isEmergencyClosed ? 'bg-rose-500 focus:ring-rose-500' : 'bg-slate-200 focus:ring-slate-400'"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
            :class="isEmergencyClosed ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>
    </div>

    <!-- 2. Horários Semanais -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
        <span>🕒 Grade de Horários por Dia da Semana</span>
      </h2>
      <p class="text-xs text-slate-500">
        Defina o horário de abertura e fechamento de cada dia.
      </p>

      <div class="space-y-2.5 pt-1">
        <div
          v-for="day in weeklyDaysConfig"
          :key="day.key"
          class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              :aria-checked="!day.closed"
              @click="emit('toggle-day-closed', day)"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="!day.closed ? [themeClasses.primaryBg, themeClasses.focusRing] : 'bg-slate-300'"
            >
              <span
                aria-hidden="true"
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                :class="!day.closed ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
            <span class="text-xs font-bold text-slate-900">{{ day.label }}</span>
          </div>

          <div v-if="!day.closed" class="flex items-center gap-2">
            <input
              v-model="day.open"
              type="time"
              class="bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono text-center"
            />
            <span class="text-xs text-slate-500">às</span>
            <input
              v-model="day.close"
              type="time"
              class="bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono text-center"
            />
          </div>
          <span v-else class="text-xs text-rose-600 font-bold">Fechado</span>
        </div>

        <div v-if="scheduleSuccessMsg" class="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center font-bold">
          {{ scheduleSuccessMsg }}
        </div>

        <button
          @click="emit('save-schedule')"
          class="w-full text-slate-950 font-bold py-3 rounded-xl text-xs transition-colors shadow-md active:scale-[0.99] cursor-pointer mt-2"
          :class="themeClasses.primaryBg"
        >
          Salvar Grade de Horários
        </button>
      </div>
    </div>
  </main>
</template>
