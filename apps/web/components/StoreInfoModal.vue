<!-- components/StoreInfoModal.vue -->
<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      @click="emit('close')"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-info-modal-title"
        class="bg-white text-slate-800 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg flex flex-col overflow-hidden sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-2xl"
        @click.stop
      >
        <!-- 1. Header do Modal -->
        <div class="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div class="flex items-center gap-2">
            <Store class="w-5 h-5" :class="themeClasses.primaryText" aria-hidden="true" />
            <div>
              <h2 id="store-info-modal-title" class="text-base font-extrabold text-slate-900 leading-tight">
                Informações da Loja
              </h2>
              <span class="text-[11px] text-slate-500 font-medium">
                {{ tenant.name }} • Detalhes operacionais e endereço
              </span>
            </div>
          </div>

          <button
            @click="emit('close')"
            class="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar informações da loja"
          >
            <X class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <!-- 2. Conteúdo Rolável -->
        <div class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-6">
          <!-- 1. Identidade e Sobre -->
          <section aria-labelledby="store-identity-title" class="space-y-3">
            <div class="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div class="relative h-14 w-14 rounded-xl bg-white p-1 shadow-xs border border-slate-200/80 shrink-0 overflow-hidden">
                <img
                  v-if="tenant.logo"
                  :src="tenant.logo"
                  :alt="`Logo de ${tenant.name}`"
                  class="w-full h-full object-cover rounded-lg"
                  @error="handleImageError($event, tenant?.theme)"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center font-bold text-lg"
                  :class="themeClasses.primaryText"
                >
                  {{ tenant.name.charAt(0) }}
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <h3 id="store-identity-title" class="font-extrabold text-sm text-slate-900 truncate">
                  {{ tenant.name }}
                </h3>
                <p v-if="tenant.description" class="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                  {{ tenant.description }}
                </p>
                <div class="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-600">
                  <ShieldCheck class="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Ambiente Seguro & Verificado</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Tabela de Horários Semanais da Loja -->
          <section aria-labelledby="store-hours-title" class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 id="store-hours-title" class="text-xs font-bold uppercase tracking-wider text-slate-400">
                Horários de Atendimento da Semana
              </h3>
              <span
                role="status"
                :class="isOpenNow ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'"
                class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
              >
                {{ statusBadgeLabel }}
              </span>
            </div>

            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
              <div
                v-for="day in weeklyScheduleList"
                :key="day.key"
                class="flex items-center justify-between py-1 border-b border-slate-100 last:border-0"
                :class="{ 'font-bold text-slate-900 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs': day.isToday }"
              >
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" :class="day.isToday ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'"></span>
                  <span>{{ day.name }}</span>
                  <span v-if="day.isToday" class="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.2 rounded uppercase">
                    Hoje
                  </span>
                </div>

                <span
                  v-if="day.closed"
                  class="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md"
                >
                  Fechado / Folga
                </span>
                <span v-else class="font-mono font-medium text-slate-700">
                  {{ day.open }} às {{ day.close }}
                </span>
              </div>
            </div>
          </section>

          <!-- 3. Endereço e Localização -->
          <section v-if="tenant.address" aria-labelledby="store-address-title" class="space-y-3">
            <h3 id="store-address-title" class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Endereço & Atendimento Presencial
            </h3>

            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
              <div class="flex items-start gap-2.5">
                <MapPin class="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span class="text-slate-700 leading-relaxed font-medium">{{ tenant.address }}</span>
              </div>

              <div v-if="tenant.deliveryType" class="flex items-center gap-2.5 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                <Truck class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{{ tenant.deliveryType }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- 3. Footer do Modal -->
        <div class="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span class="text-xs text-slate-500">
            Dúvidas ou encomendas?
          </span>
          <a
            :href="`https://wa.me/55${(tenant.phoneWhatsApp || '').replace(/\D/g, '')}`"
            target="_blank"
            class="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
            :class="themeClasses.buttonPrimary"
          >
            Chamar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { useOpeningHours } from '~/composables/useOpeningHours'
import { handleImageError } from '~/utils/images'
import { X, Store, MapPin, Truck, ShieldCheck } from 'lucide-vue-next'
import type { Tenant } from '~/types'

const props = defineProps<{
  isOpen: boolean
  tenant: Tenant
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { themeClasses } = useTenantTheme(toRef(props, 'tenant'))
const { isOpen: isOpenNow, statusBadgeLabel } = useOpeningHours(toRef(props, 'tenant'))

const DAY_ORDER = [
  { key: 'monday', name: 'Segunda-feira', dayIndex: 1 },
  { key: 'tuesday', name: 'Terça-feira', dayIndex: 2 },
  { key: 'wednesday', name: 'Quarta-feira', dayIndex: 3 },
  { key: 'thursday', name: 'Quinta-feira', dayIndex: 4 },
  { key: 'friday', name: 'Sexta-feira', dayIndex: 5 },
  { key: 'saturday', name: 'Sábado', dayIndex: 6 },
  { key: 'sunday', name: 'Domingo', dayIndex: 0 },
]

const todayIndex = new Date().getDay()

const weeklyScheduleList = computed(() => {
  const hours = props.tenant?.openingHours || {}
  const defaultOpen = hours.open || '09:00'
  const defaultClose = hours.close || '19:00'

  return DAY_ORDER.map(d => {
    const dayConfig = (hours as any)[d.key]
    return {
      key: d.key,
      name: d.name,
      isToday: d.dayIndex === todayIndex,
      closed: dayConfig ? Boolean(dayConfig.closed) : false,
      open: dayConfig?.open || defaultOpen,
      close: dayConfig?.close || defaultClose,
    }
  })
})
</script>
