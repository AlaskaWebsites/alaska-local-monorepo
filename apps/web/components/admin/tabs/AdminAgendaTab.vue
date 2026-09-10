<!-- components/admin/tabs/AdminAgendaTab.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { Plus, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  isHealthStore?: boolean
  professionalsList: Array<any>
  selectedAgendaDate: string
  sampleSlots: string[]
  isSlotBlocked: (date: string, time: string) => boolean
}>()

const emit = defineEmits<{
  (e: 'create-prof'): void
  (e: 'toggle-prof-avail', profId: string, currentAvailable: boolean, name: string): void
  (e: 'toggle-prof-day', profId: string, dayIndex: number, name: string): void
  (e: 'change-prof-hours', profId: string, workHours: { start: string; end: string }, name: string): void
  (e: 'change-prof-lunch', profId: string, lunchBreak: { start: string; end: string; enabled: boolean }, name: string): void
  (e: 'delete-prof', profId: string, profName: string): void
  (e: 'update:selectedAgendaDate', val: string): void
  (e: 'toggle-slot', date: string, time: string): void
}>()

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'hamburgueria-x')
const { tenant } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>{{ isHealthStore ? '🩺 Especialistas & Horários Individuais' : '💈 Barbeiros & Horários Individuais' }}</span>
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Configure os dias de atendimento, horário de expediente e pausa de almoço de cada especialista.
          </p>
        </div>
        <button
          @click="emit('create-prof')"
          class="px-3.5 py-2 rounded-xl text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md active:scale-95"
          :class="themeClasses.primaryBg"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" />
          <span>Novo Especialista</span>
        </button>
      </div>

      <div class="space-y-4 pt-1">
        <div
          v-for="prof in professionalsList"
          :key="prof.id"
          class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 transition-all"
          :class="{ 'opacity-70 border-rose-200 bg-rose-50/30': !prof.isAvailable }"
        >
          <!-- Linha 1: Nome, Especialidade e Switch de Folga -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div
                class="w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs transition-colors border"
                :class="prof.isAvailable ? [themeClasses.badgeBg, themeClasses.primaryText, themeClasses.badgeBorder] : 'bg-rose-100 text-rose-700 border-rose-200'"
              >
                {{ prof.name.charAt(0) }}
              </div>
              <div class="min-w-0">
                <h4 class="text-xs font-bold text-slate-900 truncate">{{ prof.name }}</h4>
                <span class="text-[10px] text-slate-500 block truncate">{{ prof.role }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span
                class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full transition-colors border"
                :class="prof.isAvailable ? [themeClasses.badgeBg, themeClasses.badgeText, themeClasses.badgeBorder] : 'bg-rose-50 text-rose-700 border-rose-200'"
              >
                {{ prof.isAvailable ? 'Atendendo' : 'De Folga Hoje' }}
              </span>

              <button
                type="button"
                role="switch"
                :aria-checked="prof.isAvailable"
                :aria-label="`Alternar folga de ${prof.name}`"
                @click="emit('toggle-prof-avail', prof.id, prof.isAvailable, prof.name)"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white"
                :class="prof.isAvailable ? [themeClasses.primaryBg, themeClasses.focusRing] : 'bg-slate-300'"
              >
                <span
                  aria-hidden="true"
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                  :class="prof.isAvailable ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>

              <button
                @click="emit('delete-prof', prof.id, prof.name)"
                class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="Excluir especialista"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Linha 2: Escala Semanal de 7 Dias -->
          <div class="space-y-1.5 pt-1 border-t border-slate-200">
            <span class="text-[11px] font-semibold text-slate-600 block">Dias de Atendimento na Semana:</span>
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="(dayName, dIdx) in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']"
                :key="dIdx"
                type="button"
                @click="emit('toggle-prof-day', prof.id, dIdx, prof.name)"
                class="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer select-none"
                :class="prof.availableDays?.includes(dIdx) ? [themeClasses.primaryBg, 'text-slate-950 border-transparent shadow-xs font-bold'] : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'"
              >
                {{ dayName }}
              </button>
            </div>
          </div>

          <!-- Linha 3: Expediente e Intervalo de Almoço Individual -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
            <!-- Expediente Normal -->
            <div class="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
              <span class="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                ⏰ Expediente de Atendimento:
              </span>
              <div class="flex items-center gap-2">
                <input
                  type="time"
                  :value="prof.workHours?.start || '09:00'"
                  @change="emit('change-prof-hours', prof.id, { start: ($event.target as HTMLInputElement).value, end: prof.workHours?.end || '19:00' }, prof.name)"
                  class="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono w-20 text-center"
                />
                <span class="text-slate-500">às</span>
                <input
                  type="time"
                  :value="prof.workHours?.end || '19:00'"
                  @change="emit('change-prof-hours', prof.id, { start: prof.workHours?.start || '09:00', end: ($event.target as HTMLInputElement).value }, prof.name)"
                  class="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono w-20 text-center"
                />
              </div>
            </div>

            <!-- Intervalo de Almoço / Pausa -->
            <div class="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  🍽️ Pausa / Almoço:
                </span>
                <label class="flex items-center gap-1 cursor-pointer text-[10px] text-slate-500 select-none">
                  <input
                    type="checkbox"
                    :checked="prof.lunchBreak?.enabled !== false"
                    @change="emit('change-prof-lunch', prof.id, { start: prof.lunchBreak?.start || '12:00', end: prof.lunchBreak?.end || '13:00', enabled: ($event.target as HTMLInputElement).checked }, prof.name)"
                    class="rounded border-slate-300 h-3 w-3"
                  />
                  <span>Ativar</span>
                </label>
              </div>

              <div v-if="prof.lunchBreak?.enabled !== false" class="flex items-center gap-2">
                <input
                  type="time"
                  :value="prof.lunchBreak?.start || '12:00'"
                  @change="emit('change-prof-lunch', prof.id, { start: ($event.target as HTMLInputElement).value, end: prof.lunchBreak?.end || '13:00', enabled: true }, prof.name)"
                  class="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono w-20 text-center"
                />
                <span class="text-slate-500">às</span>
                <input
                  type="time"
                  :value="prof.lunchBreak?.end || '13:00'"
                  @change="emit('change-prof-lunch', prof.id, { start: prof.lunchBreak?.start || '12:00', end: ($event.target as HTMLInputElement).value }, prof.name)"
                  class="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono w-20 text-center"
                />
              </div>
              <div v-else class="text-[10px] text-slate-500 italic py-1">
                Sem pausa (atendimento contínuo).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Bloqueio Rápido de Horários Específicos da Agenda -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>📅 Bloqueio de Horários da Grade</span>
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Clique em um horário para bloquear ou liberar agendamentos em um dia específico.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 pt-1">
        <label class="text-xs font-semibold text-slate-600">Data:</label>
        <input
          type="date"
          :value="selectedAgendaDate"
          @input="emit('update:selectedAgendaDate', ($event.target as HTMLInputElement).value)"
          class="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 cursor-pointer"
        />
      </div>

      <div class="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-2">
        <button
          v-for="time in sampleSlots"
          :key="time"
          type="button"
          @click="emit('toggle-slot', selectedAgendaDate, time)"
          class="py-2.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer text-center"
          :class="isSlotBlocked(selectedAgendaDate, time) ? 'bg-rose-50 text-rose-700 border-rose-200 line-through' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 shadow-2xs'"
        >
          <span>{{ time }}</span>
          <span class="text-[9px] uppercase tracking-wider font-extrabold block" :class="isSlotBlocked(selectedAgendaDate, time) ? 'text-rose-600' : themeClasses.primaryText">
            {{ isSlotBlocked(selectedAgendaDate, time) ? 'Bloqueado' : 'Livre' }}
          </span>
        </button>
      </div>
    </div>
  </main>
</template>
