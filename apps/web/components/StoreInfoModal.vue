<!-- components/StoreInfoModal.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { X, Clock, MapPin, Phone, ExternalLink, Truck, CreditCard } from 'lucide-vue-next'
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
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.tenant?.address || '')}`
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

const paymentMethods = computed(() => {
  return props.tenant?.paymentMethods || ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro']
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
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-info-title"
      @click="emit('close')"
    >
      <!-- Container Modal Branco Estilo iFood -->
      <div
        class="bg-white border border-slate-200/90 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200 text-slate-900"
        @click.stop
      >
        <!-- Header do Modal -->
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-2xs">
              <Clock class="w-4 h-4" />
            </div>
            <div>
              <h3 id="store-info-title" class="text-sm font-black text-slate-900 tracking-tight">
                Sobre o Estabelecimento
              </h3>
              <p class="text-[11px] text-slate-500 font-medium">
                Endereço, entrega e horários de funcionamento
              </p>
            </div>
          </div>

          <button
            @click="emit('close')"
            class="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar informações"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Conteúdo Rolável -->
        <div class="p-5 space-y-5 overflow-y-auto flex-1 bg-white">
          <!-- Bloco 0: Descrição da Loja (se houver) -->
          <div v-if="tenant?.description" class="space-y-1.5">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Descrição da Loja
            </h4>
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <p class="text-xs text-slate-700 leading-relaxed font-medium">
                {{ tenant.description }}
              </p>
            </div>
          </div>

          <!-- Bloco 1: Localização & Endereço -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin class="w-3.5 h-3.5 text-rose-500" />
              <span>Endereço</span>
            </h4>
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 shadow-2xs">
              <div class="flex items-start gap-2.5">
                <MapPin class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p class="text-xs text-slate-800 font-semibold leading-relaxed">
                  {{ tenant?.address || 'Endereço não informado' }}
                </p>
              </div>
              <div v-if="tenant?.address" class="pt-1">
                <a
                  :href="googleMapsUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <span>Abrir rota no Google Maps</span>
                  <ExternalLink class="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          <!-- Bloco 2: Regras de Entrega (Delivery & Pedido Mínimo) -->
          <div v-if="tenant && (tenant.deliveryFee !== undefined || tenant.minOrderValue || tenant.estimatedTime)" class="space-y-2">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Truck class="w-3.5 h-3.5 text-rose-500" />
              <span>Entrega & Prazos</span>
            </h4>
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shadow-2xs">
              <div>
                <span class="text-slate-500 block text-[11px] font-medium">Tempo Estimado:</span>
                <span class="font-bold text-slate-900 font-mono text-xs">{{ tenant.estimatedTime || '30-45 min' }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px] font-medium">Taxa Padrão:</span>
                <span class="font-bold text-slate-900 font-mono text-xs">
                  {{ tenant.deliveryFee === 0 ? 'Grátis' : formatCurrency(Number(tenant.deliveryFee || 0)) }}
                </span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px] font-medium">Pedido Mínimo:</span>
                <span class="font-bold text-amber-700 font-mono text-xs">
                  {{ formatCurrency(Number(tenant.minOrderValue || 0)) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Bloco 3: Grade de Horários Semanais -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-rose-500" />
                <span>Horários de Atendimento</span>
              </h4>
              <span
                v-if="statusText"
                class="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border"
                :class="isOpenNow ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'"
              >
                {{ statusText }}
              </span>
            </div>

            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs shadow-2xs">
              <div
                v-for="item in scheduleList"
                :key="item.label"
                class="flex items-center justify-between py-1.5 border-b border-slate-200/60 last:border-0"
              >
                <span class="text-slate-700 font-medium">{{ item.label }}</span>
                <span
                  class="font-mono font-bold"
                  :class="item.isClosed ? 'text-rose-600' : 'text-slate-900'"
                >
                  {{ item.time }}
                </span>
              </div>
            </div>
          </div>

          <!-- Bloco 4: Formas de Pagamento (Estilo iFood) -->
          <div v-if="paymentMethods.length > 0" class="space-y-2">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard class="w-3.5 h-3.5 text-rose-500" />
              <span>Formas de Pagamento</span>
            </h4>
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="pm in paymentMethods"
                  :key="pm"
                  class="px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5"
                >
                  <span v-if="pm.toLowerCase().includes('pix')" class="text-emerald-600 font-black text-xs">❖</span>
                  <span v-else-if="pm.toLowerCase().includes('cart')" class="text-slate-500">💳</span>
                  <span v-else-if="pm.toLowerCase().includes('dinheiro')" class="text-emerald-600">💵</span>
                  <span>{{ pm }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Bloco 5: Canais de Contato & Redes Sociais -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone class="w-3.5 h-3.5 text-rose-500" />
              <span>Canais de Contato</span>
            </h4>
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-2xs">
              <!-- WhatsApp -->
              <div v-if="tenant?.phoneWhatsApp || tenant?.whatsapp" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Phone class="w-3.5 h-3.5 text-emerald-600" />
                  <span class="text-xs text-slate-800 font-mono font-bold">
                    {{ tenant.phoneWhatsApp || tenant.whatsapp }}
                  </span>
                </div>
                <a
                  :href="`https://wa.me/55${(tenant.phoneWhatsApp || tenant.whatsapp || '').replace(/\\D/g, '')}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <span>Chamar</span>
                  <ExternalLink class="w-3 h-3" />
                </a>
              </div>

              <!-- Instagram -->
              <div v-if="instagramUrl" class="flex items-center justify-between pt-2.5 border-t border-slate-200/80">
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                  <span class="text-xs text-slate-800 font-bold">
                    {{ instagramHandle }}
                  </span>
                </div>
                <a
                  :href="instagramUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <span>Seguir</span>
                  <ExternalLink class="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <!-- Bloco 6: Outras Informações / Disclaimer iFood -->
          <div class="pt-2 text-center space-y-1">
            <p v-if="(tenant as any)?.cnpj" class="text-[11px] text-slate-500 font-medium">
              CNPJ: {{ (tenant as any).cnpj }}
            </p>
            <p class="text-[10px] text-slate-400 leading-relaxed max-w-sm mx-auto">
              Os preços apresentados no catálogo são definidos pela própria loja. Ofertas sujeitas a alteração sem aviso prévio e disponibilidade de estoque.
            </p>
          </div>
        </div>

        <!-- Footer do Modal -->
        <div class="p-4 border-t border-slate-100 bg-[#fafafa] sm:bg-white text-center shrink-0">
          <button
            type="button"
            @click="emit('close')"
            class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-xs transition-all shadow-md active:scale-98 cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
