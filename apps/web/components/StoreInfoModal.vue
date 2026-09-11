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

const daysMap = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
]

const scheduleList = computed(() => {
  const hours = props.tenant?.openingHours as any
  if (!hours) return []

  return daysMap.map(d => {
    const dayConfig = hours[d.key]
    if (!dayConfig || dayConfig.closed) {
      return { label: d.label, time: 'Fechado', isClosed: true }
    }
    const open = dayConfig.open || hours.open || '09:00'
    const close = dayConfig.close || hours.close || '22:00'
    return { label: d.label, time: `${open} às ${close}`, isClosed: false }
  })
})
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
        <!-- Header do Modal -->
        <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">Sobre o Estabelecimento</h3>
              <p class="text-[11px] text-slate-400">Endereço e horários de funcionamento</p>
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

        <!-- Conteúdo Rolável -->
        <div class="p-5 space-y-6 overflow-y-auto flex-1">
          <!-- Bloco 1: Endereço & Localização -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin class="w-3.5 h-3.5 text-emerald-400" />
              <span>Localização</span>
            </h4>
            <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <p class="text-sm font-semibold text-white">
                {{ tenant.address || 'Endereço não informado' }}
              </p>
              <a
                v-if="tenant.address"
                :href="googleMapsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
              >
                <span>Abrir rota no Google Maps</span>
                <ExternalLink class="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <!-- Bloco 2: Grade de Horários Semanais -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5 text-emerald-400" />
              <span>Horários de Atendimento</span>
            </h4>
            <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 divide-y divide-slate-800/60">
              <div
                v-for="item in scheduleList"
                :key="item.label"
                class="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
              >
                <span class="text-slate-300 font-medium">{{ item.label }}</span>
                <span
                  class="font-mono font-bold"
                  :class="item.isClosed ? 'text-rose-400' : 'text-emerald-400'"
                >
                  {{ item.time }}
                </span>
              </div>
            </div>
          </div>

          <!-- Bloco 3: Contato & Pedidos -->
          <div v-if="tenant.phoneWhatsApp || tenant.whatsapp" class="space-y-2">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone class="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp do Estabelecimento</span>
            </h4>
            <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
              <span class="text-xs text-slate-300 font-mono font-bold">
                {{ tenant.phoneWhatsApp || tenant.whatsapp }}
              </span>
              <span class="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                Online
              </span>
            </div>
          </div>
        </div>

        <!-- Footer do Modal -->
        <div class="p-4 border-t border-slate-800 bg-slate-900/90 text-center">
          <button
            @click="emit('close')"
            class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
