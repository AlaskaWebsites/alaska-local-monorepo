<!-- components/StoreInfoModal.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { X, Clock, MapPin, Phone, ExternalLink, Truck } from 'lucide-vue-next'
import { formatCurrency } from '~/utils/formatters'
import type { Tenant } from '~/types'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    tenant: Tenant
    isOpenNow?: boolean
    statusText?: string
    theme?: string
  }>(),
  {
    isOpenNow: true,
    statusText: '',
    theme: 'default'
  }
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const googleMapsUrl = computed(() => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.tenant.address || '')}`
})

const instagramUrl = computed(() => {
  const insta = props.tenant?.instagram
  if (!insta) return ''
  const clean = String(insta).trim().replace(/^@/, '')
  if (!clean) return ''
  return clean.startsWith('http') ? clean : `https://instagram.com/${clean}`
})

const instagramHandle = computed(() => {
  const insta = props.tenant?.instagram
  if (!insta) return ''
  const clean = String(insta).trim()
  if (clean.startsWith('http')) {
    const parts = clean.split('/').filter(Boolean)
    return `@${parts[parts.length - 1]}`
  }
  return clean.startsWith('@') ? clean : `@${clean}`
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
  const defaultOpen = hours.open || '09:00'
  const defaultClose = hours.close || '19:00'

  return daysMap.map(d => {
    const dayConfig = hours[d.key]
    const isClosed = dayConfig ? Boolean(dayConfig.closed) : false
    if (isClosed) {
      return { label: d.label, time: 'Fechado', isClosed: true }
    }
    const open = dayConfig?.open || defaultOpen
    const close = dayConfig?.close || defaultClose
    return { label: d.label, time: `${open} às ${close}`, isClosed: false }
  })
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      @click="emit('close')"
    >
      <div
        class="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
        @click.stop
      >
        <!-- Header do Modal -->
        <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">Sobre o Estabelecimento</h3>
              <p class="text-[11px] text-slate-400">Endereço, entrega e horários de funcionamento</p>
            </div>
          </div>

          <button
            @click="emit('close')"
            class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar informações"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Conteúdo Rolável -->
        <div class="p-5 space-y-6 overflow-y-auto flex-1">
          <!-- Bloco 1: Localização -->
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

          <!-- Bloco 2: Regras de Entrega (Delivery & Pedido Mínimo) -->
          <div v-if="tenant.deliveryFee !== undefined || tenant.minOrderValue || tenant.estimatedTime" class="space-y-2">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Truck class="w-3.5 h-3.5 text-emerald-400" />
              <span>Entrega & Prazos</span>
            </h4>
            <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span class="text-slate-400 block text-[11px]">Tempo Estimado:</span>
                <span class="font-bold text-white font-mono">{{ tenant.estimatedTime || '30-45 min' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Taxa Padrão:</span>
                <span class="font-bold text-white font-mono">
                  {{ tenant.deliveryFee === 0 ? 'Grátis' : formatCurrency(Number(tenant.deliveryFee || 0)) }}
                </span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Pedido Mínimo:</span>
                <span class="font-bold text-amber-400 font-mono">
                  {{ formatCurrency(Number(tenant.minOrderValue || 0)) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Bloco 3: Grade de Horários Semanais -->
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

          <!-- Bloco 4: Canais de Contato & Redes Sociais -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone class="w-3.5 h-3.5 text-emerald-400" />
              <span>Canais de Contato</span>
            </h4>
            <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <!-- WhatsApp -->
              <div v-if="tenant.phoneWhatsApp || tenant.whatsapp" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Phone class="w-3.5 h-3.5 text-emerald-400" />
                  <span class="text-xs text-slate-300 font-mono font-bold">
                    {{ tenant.phoneWhatsApp || tenant.whatsapp }}
                  </span>
                </div>
                <a
                  :href="`https://wa.me/55${(tenant.phoneWhatsApp || tenant.whatsapp || '').replace(/\\D/g, '')}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <span>Chamar</span>
                  <ExternalLink class="w-3 h-3" />
                </a>
              </div>

              <!-- Instagram -->
              <div v-if="instagramUrl" class="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                  <span class="text-xs text-slate-300 font-bold">
                    {{ instagramHandle }}
                  </span>
                </div>
                <a
                  :href="instagramUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <span>Seguir</span>
                  <ExternalLink class="w-3 h-3" />
                </a>
              </div>
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
