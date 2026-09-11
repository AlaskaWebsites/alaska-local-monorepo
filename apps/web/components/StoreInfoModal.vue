<!-- components/StoreInfoModal.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { X, MapPin, Clock, Phone, ExternalLink } from 'lucide-vue-next'
import type { Tenant } from '~/types'

const props = defineProps<{
  isOpen: boolean
  tenant: Tenant
  isOpenNow?: boolean
  statusText?: string
  theme?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const googleMapsUrl = computed(() => {
  if (!props.tenant?.address) return '#'
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.tenant.address)}`
})

const cleanPhone = computed(() => {
  const p = props.tenant?.phoneWhatsApp || (props.tenant as any)?.whatsapp || ''
  return p.replace(/\D/g, '')
})

const daysList = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
]

function formatDayHours(dayKey: string): string {
  const hours = props.tenant?.openingHours as any
  if (!hours) return 'Consulte'
  const d = hours[dayKey]
  if (d?.closed) return 'Fechado'
  if (d?.open && d?.close) return `${d.open} às ${d.close}`
  if (hours.open && hours.close) return `${hours.open} às ${hours.close}`
  return 'Aberto'
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm transition-all"
      @click.self="emit('close')"
    >
      <div
        class="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
      >
        <!-- Header -->
        <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">Informações da Loja</h3>
              <p class="text-[11px] text-slate-400">Endereço, contatos e horários</p>
            </div>
          </div>

          <button
            @click="emit('close')"
            class="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Conteúdo -->
        <div class="p-5 space-y-5 overflow-y-auto flex-1">
          <!-- Status de Atendimento -->
          <div v-if="statusText" class="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-3">
            <div
              class="w-3 h-3 rounded-full shrink-0"
              :class="isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'"
            />
            <span class="text-xs font-bold text-white">{{ statusText }}</span>
          </div>

          <!-- Endereço -->
          <div v-if="tenant?.address" class="space-y-1.5">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin class="w-3.5 h-3.5 text-emerald-400" />
              <span>Endereço & Localização</span>
            </h4>
            <div class="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between gap-3">
              <p class="text-xs text-slate-200">{{ tenant.address }}</p>
              <a
                :href="googleMapsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
              >
                <span>Ver rota</span>
                <ExternalLink class="w-3 h-3" />
              </a>
            </div>
          </div>

          <!-- Contatos -->
          <div class="space-y-1.5">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone class="w-3.5 h-3.5 text-emerald-400" />
              <span>Contato Direto</span>
            </h4>
            <div class="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between gap-3">
              <p class="text-xs text-slate-200">WhatsApp: {{ tenant?.phoneWhatsApp || (tenant as any)?.whatsapp || 'Consulte' }}</p>
              <a
                v-if="cleanPhone"
                :href="`https://wa.me/55${cleanPhone}`"
                target="_blank"
                rel="noopener noreferrer"
                class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
              >
                <span>Chamar</span>
                <ExternalLink class="w-3 h-3" />
              </a>
            </div>
          </div>

          <!-- Horários Semanais -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5 text-emerald-400" />
              <span>Programação Semanal</span>
            </h4>
            <div class="bg-slate-950/40 border border-slate-800/60 rounded-xl divide-y divide-slate-800/60 overflow-hidden text-xs">
              <div
                v-for="day in daysList"
                :key="day.key"
                class="px-3.5 py-2.5 flex items-center justify-between"
              >
                <span class="text-slate-400 font-medium">{{ day.label }}</span>
                <span class="text-white font-mono font-bold">{{ formatDayHours(day.key) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-slate-800 bg-slate-900/90 text-center">
          <button
            @click="emit('close')"
            class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
