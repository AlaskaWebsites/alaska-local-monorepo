<!-- components/admin/tabs/AdminAgendaTab.vue -->
<script setup lang="ts">
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

function getSafeTime(val: any, fallback: string): string {
  if (typeof val === 'string' && val.length >= 4) return val
  if (val && typeof val === 'object') {
    if (typeof val.start === 'string') return val.start
    if (typeof val.end === 'string') return val.end
    if (typeof val.open === 'string') return val.open
    if (typeof val.close === 'string') return val.close
  }
  return fallback
}

function handleHoursChange(prof: any, field: 'start' | 'end', value: string) {
  if (!value || value.length < 4) return
  const currentStart = getSafeTime(prof.workHours?.start, '09:00')
  const currentEnd = getSafeTime(prof.workHours?.end, '19:00')
  const updated = {
    start: field === 'start' ? value : currentStart,
    end: field === 'end' ? value : currentEnd,
  }
  emit('change-prof-hours', prof.id, updated, prof.name)
}

function handleLunchChange(prof: any, field: 'start' | 'end', value: string) {
  if (!value || value.length < 4) return
  const currentStart = getSafeTime(prof.lunchBreak?.start, '12:00')
  const currentEnd = getSafeTime(prof.lunchBreak?.end, '13:00')
  const updated = {
    start: field === 'start' ? value : currentStart,
    end: field === 'end' ? value : currentEnd,
    enabled: prof.lunchBreak?.enabled !== undefined ? Boolean(prof.lunchBreak.enabled) : true,
  }
  emit('change-prof-lunch', prof.id, updated, prof.name)
}

function handleLunchToggle(prof: any, enabled: boolean) {
  const currentStart = getSafeTime(prof.lunchBreak?.start, '12:00')
  const currentEnd = getSafeTime(prof.lunchBreak?.end, '13:00')
  emit('change-prof-lunch', prof.id, {
    start: currentStart,
    end: currentEnd,
    enabled,
  }, prof.name)
}
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <span>{{ isHealthStore ? '🩺 Especialistas & Horários Individuais' : '💈 Barbeiros & Horários Individuais' }}</span>
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Configure os dias de atendimento, horário de expediente e pausa de almoço de cada especialista.
          </p>
        </div>
        <button
          @click="emit('create-prof')"
          class="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md"
        >
          <Plus class="w-4 h-4" />
          <span>Novo Especialista</span>
        </button>
      </div>

      <div class="space-y-4 pt-1">
        <div
          v-for="prof in professionalsList"
          :key="prof.id"
          class="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4 transition-all"
          :class="{ 'opacity-70 border-rose-500/20': !prof.isAvailable }"
        >
          <!-- Linha 1: Nome, Especialidade e Switch de Folga -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div
                class="w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs transition-colors"
                :class="prof.isAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'"
              >
                {{ prof.name.charAt(0) }}
              </div>
              <div>
                <h4 class="text-xs font-bold text-white">{{ prof.name }}</h4>
                <span class="text-[10px] text-slate-400">{{ prof.role }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span
                class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded transition-colors"
                :class="prof.isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
              >
                {{ prof.isAvailable ? 'Atendendo' : 'De Folga Hoje' }}
              </span>

              <button
                type="button"
                role="switch"
                :aria-checked="prof.isAvailable"
                @click="emit('toggle-prof-avail', prof.id, prof.isAvailable, prof.name)"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
                :class="prof.isAvailable ? 'bg-emerald-500' : 'bg-slate-800'"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
                  :class="prof.isAvailable ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>

              <button
                v-if="prof.id && prof.id.startsWith('prof-custom-')"
                @click="emit('delete-prof', prof.id, prof.name)"
                class="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                title="Excluir Especialista"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Linha 2: Dias de Atendimento na Semana -->
          <div class="pt-2 border-t border-slate-800/80 space-y-1.5">
            <span class="text-[10px] text-slate-400 font-semibold block">Dias de Atendimento na Semana:</span>
            <div class="flex items-center gap-1.5 flex-wrap">
              <button
                v-for="(dayName, dIdx) in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']"
                :key="dIdx"
                type="button"
                @click="emit('toggle-prof-day', prof.id, dIdx, prof.name)"
                class="px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer select-none active:scale-95 border"
                :class="prof.availableDays?.includes(dIdx) ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'"
              >
                {{ dayName }}
              </button>
            </div>
          </div>

          <!-- Linha 3: Horário de Expediente & Intervalo de Almoço -->
          <div class="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <!-- Horário de Atendimento -->
            <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
              <span class="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <span>⏰ Expediente de Atendimento:</span>
              </span>
              <div class="flex items-center gap-1.5">
                <input
                  type="time"
                  :value="getSafeTime(prof.workHours?.start, '09:00')"
                  @change="handleHoursChange(prof, 'start', ($event.target as HTMLInputElement).value)"
                  class="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono w-20 text-center"
                />
                <span class="text-slate-500 text-xs">às</span>
                <input
                  type="time"
                  :value="getSafeTime(prof.workHours?.end, '19:00')"
                  @change="handleHoursChange(prof, 'end', ($event.target as HTMLInputElement).value)"
                  class="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono w-20 text-center"
                />
              </div>
            </div>

            <!-- Intervalo de Almoço / Pausa -->
            <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <span>🍽️ Pausa / Almoço:</span>
                </span>
                <label class="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="prof.lunchBreak?.enabled !== false"
                    @change="handleLunchToggle(prof, ($event.target as HTMLInputElement).checked)"
                    class="rounded border-slate-700 bg-slate-950 text-emerald-500 h-3 w-3"
                  />
                  <span class="text-[9px] text-slate-400 font-semibold">Ativar</span>
                </label>
              </div>

              <div v-if="prof.lunchBreak?.enabled !== false" class="flex items-center gap-1.5">
                <input
                  type="time"
                  :value="getSafeTime(prof.lunchBreak?.start, '12:00')"
                  @change="handleLunchChange(prof, 'start', ($event.target as HTMLInputElement).value)"
                  class="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono w-20 text-center"
                />
                <span class="text-slate-500 text-xs">às</span>
                <input
                  type="time"
                  :value="getSafeTime(prof.lunchBreak?.end, '13:00')"
                  @change="handleLunchChange(prof, 'end', ($event.target as HTMLInputElement).value)"
                  class="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono w-20 text-center"
                />
              </div>
              <span v-else class="text-[10px] text-slate-500 block pt-0.5">Sem intervalo programado</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Bloqueio Rápido de Horários da Agenda -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h2 class="text-sm font-bold text-white flex items-center gap-2">
        <span>📅 Bloqueio Rápido de Horários Gerais da Loja</span>
      </h2>
      <p class="text-xs text-slate-400">
        Bloqueie horários específicos na agenda geral da loja para que nenhum cliente possa agendar.
      </p>

      <div>
        <label class="block text-xs font-semibold text-slate-400 mb-1.5">Data:</label>
        <input
          type="date"
          :value="selectedAgendaDate"
          @input="emit('update:selectedAgendaDate', ($event.target as HTMLInputElement).value)"
          class="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
        />
      </div>

      <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
        <button
          v-for="time in sampleSlots"
          :key="time"
          type="button"
          @click="emit('toggle-slot', selectedAgendaDate, time)"
          class="py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center justify-center gap-0.5"
          :class="isSlotBlocked(selectedAgendaDate, time) ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-emerald-500'"
        >
          <span>{{ time }}</span>
          <span class="text-[9px] uppercase tracking-wider font-extrabold" :class="isSlotBlocked(selectedAgendaDate, time) ? 'text-rose-500' : 'text-emerald-400'">
            {{ isSlotBlocked(selectedAgendaDate, time) ? 'Bloqueado' : 'Livre' }}
          </span>
        </button>
      </div>
    </div>
  </main>
</template>
