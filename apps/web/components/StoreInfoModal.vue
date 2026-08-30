<!-- components/StoreInfoModal.vue -->
<script setup lang="ts">
import { computed, toRef, onMounted, onUnmounted } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { useOpeningHours } from '~/composables/useOpeningHours'
import { formatCurrency } from '~/utils/formatters'
import { handleImageError } from '~/utils/images'
import {
  X,
  Clock,
  MapPin,
  CreditCard,
  Navigation,
  ShieldCheck
} from 'lucide-vue-next'
import type { Tenant } from '~/types'

const props = defineProps<{
  tenant: Tenant
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// 1. Tema Dinâmico
const { themeClasses } = useTenantTheme(toRef(props, 'tenant'))

// 2. Trava de Scroll e Acessibilidade ESC
useBodyScrollLock(toRef(props, 'isOpen'))

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleKeyDown)
  }
})

// 3. Status e Horários Dinâmicos
const { isOpen: isOpenNow, statusBadgeLabel, formattedOpeningHours } = useOpeningHours(toRef(props, 'tenant'))

const formatOpeningHours = computed(() => {
  if (!props.tenant.openingHours) return null
  return `${props.tenant.openingHours.open} às ${props.tenant.openingHours.close}`
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      @click="emit('close')">
      <div role="dialog" aria-modal="true" aria-labelledby="info-modal-title"
        class="bg-white text-slate-800 w-full h-full sm:h-auto sm:max-h-[88vh] sm:max-w-lg flex flex-col overflow-hidden sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-2xl"
        @click.stop>
        <!-- Header do Modal (Fixo no Topo) -->
        <div class="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h2 id="info-modal-title" class="text-lg font-extrabold text-slate-900">
            Informações da Loja
          </h2>
          <button @click="emit('close')"
            class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar informações da loja">
            <X class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <!-- Conteúdo Rolável -->
        <div class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-6">
          <!-- 1. Identidade e Sobre -->
          <section aria-labelledby="store-identity-title" class="space-y-3">
            <div class="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="h-16 w-16 rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shrink-0 shadow-2xs">
                <img v-if="tenant.logo" :src="tenant.logo" :alt="tenant.name" class="h-full w-full object-cover"
                  @error="handleImageError($event, tenant?.theme)" />
                <div v-else class="h-full w-full flex items-center justify-center font-bold text-lg"
                  :class="themeClasses.primaryText">
                  {{ tenant.name.charAt(0) }}
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <h3 id="store-identity-title" class="text-base font-bold text-slate-900 truncate">
                  {{ tenant.name }}
                </h3>
                <p v-if="tenant.description" class="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {{ tenant.description }}
                </p>
                <div class="flex items-center gap-2 mt-2 text-[11px] font-semibold" :class="themeClasses.primaryText">
                  <ShieldCheck class="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Ambiente Seguro & Verificado</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Horários de Atendimento -->
          <section aria-labelledby="store-hours-title">
            <h3 id="store-hours-title" class="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
              <Clock class="w-4 h-4" :class="themeClasses.primaryText" aria-hidden="true" />
              <span>Horário de Funcionamento</span>
            </h3>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-600 font-medium">Status no Momento:</span>
                <span role="status"
                  :class="isOpenNow ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'"
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold border">
                  {{ statusBadgeLabel }}
                </span>
              </div>

              <div class="flex items-center justify-between border-t border-slate-200 pt-2.5 text-xs">
                <span class="text-slate-500">Atendimento Hoje:</span>
                <span class="font-bold text-slate-900">{{ formattedOpeningHours || formatOpeningHours || 'Consulte no WhatsApp' }}</span>
              </div>
            </div>
          </section>

          <!-- 3. Formas de Pagamento -->
          <section aria-labelledby="store-payments-title">
            <h3 id="store-payments-title" class="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
              <CreditCard class="w-4 h-4" :class="themeClasses.primaryText" aria-hidden="true" />
              <span>Formas de Pagamento</span>
            </h3>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs" role="list">
              <div class="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-200" role="listitem">
                <div class="space-y-0.5">
                  <span class="font-bold text-slate-900 block">Pix Direto (D+0)</span>
                  <span class="text-slate-500 text-[11px]">Chave informada automaticamente no fechamento do
                    pedido</span>
                </div>
                <span class="font-bold shrink-0" :class="themeClasses.primaryText">Instantâneo</span>
              </div>

              <div class="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-200" role="listitem">
                <div class="space-y-0.5">
                  <span class="font-bold text-slate-900 block">Cartões de Crédito & Débito</span>
                  <span class="text-slate-500 text-[11px]">Visa, Mastercard, Elo na maquininha do entregador</span>
                </div>
                <span class="text-slate-500 font-medium shrink-0">Na Entrega</span>
              </div>

              <div class="flex items-start justify-between gap-2" role="listitem">
                <div class="space-y-0.5">
                  <span class="font-bold text-slate-900 block">Dinheiro em Espécie</span>
                  <span class="text-slate-500 text-[11px]">Com opção de troco no checkout</span>
                </div>
                <span class="text-slate-500 font-medium shrink-0">Na Entrega</span>
              </div>
            </div>
          </section>

          <!-- 4. Endereço e Localização -->
          <section aria-labelledby="store-address-title">
            <h3 id="store-address-title" class="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
              <MapPin class="w-4 h-4" :class="themeClasses.primaryText" aria-hidden="true" />
              <span>Endereço & Entrega</span>
            </h3>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3.5 text-xs">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <span class="font-bold text-slate-900 block">Endereço da Loja:</span>
                  <span class="text-slate-600 leading-relaxed block">
                    {{ tenant.address || 'Atendimento e entrega para a região local.' }}
                  </span>
                </div>

                <a v-if="tenant.address"
                  :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenant.address)}`"
                  target="_blank"
                  class="shrink-0 p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5 font-bold shadow-2xs"
                  :class="themeClasses.primaryText"
                  aria-label="Abrir rota no Google Maps para o endereço do estabelecimento">
                  <Navigation class="w-4 h-4" aria-hidden="true" />
                  <span class="text-[11px]">Rotas</span>
                </a>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div class="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span class="text-slate-500 text-[11px] block">Taxa de Entrega</span>
                  <span class="font-bold text-xs" :class="themeClasses.primaryText">
                    {{ tenant.deliveryFee ? formatCurrency(tenant.deliveryFee) : 'Grátis' }}
                  </span>
                </div>

                <div class="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span class="text-slate-500 text-[11px] block">Pedido Mínimo</span>
                  <span class="font-bold text-slate-900 text-xs">
                    {{ tenant.minOrderValue ? formatCurrency(tenant.minOrderValue) : 'Sem valor mínimo' }}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Footer do Modal -->
        <div class="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span class="text-xs text-slate-500">
            Dúvidas ou encomendas especiais?
          </span>
          <a :href="`https://wa.me/55${(tenant.phoneWhatsApp || '').replace(/\\D/g, '')}`" target="_blank"
            class="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
            :class="themeClasses.buttonPrimary">
            Chamar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>
