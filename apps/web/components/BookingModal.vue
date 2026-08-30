<!-- components/BookingModal.vue -->
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
        aria-labelledby="booking-modal-title"
        class="bg-white text-slate-800 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-xl flex flex-col overflow-hidden sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-2xl"
        @click.stop
      >
        <!-- 1. Header do Modal -->
        <div class="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div class="flex items-center gap-2">
            <Calendar class="w-5 h-5" :class="themeClasses.primaryText" aria-hidden="true" />
            <div>
              <h2 id="booking-modal-title" class="text-base font-extrabold text-slate-900 leading-tight">
                Agendamento Online
              </h2>
              <span class="text-[11px] text-slate-500 font-medium">
                {{ tenant.name }} • Escolha seus serviços e horário
              </span>
            </div>
          </div>

          <button
            @click="emit('close')"
            class="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar modal de agendamento"
          >
            <X class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <!-- 2. Barra de Progresso / Steps -->
        <div class="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs font-semibold shrink-0">
          <button
            @click="currentStep = 1"
            :class="currentStep >= 1 ? themeClasses.primaryText : 'text-slate-400'"
            class="flex items-center gap-1.5 cursor-pointer"
          >
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              :class="currentStep >= 1 ? [themeClasses.badgeBg, themeClasses.badgeText] : 'bg-slate-200 text-slate-500'">
              1
            </span>
            <span>Serviços</span>
          </button>

          <ChevronRight class="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />

          <button
            @click="canGoToStep(2) && (currentStep = 2)"
            :class="currentStep >= 2 ? themeClasses.primaryText : 'text-slate-400'"
            class="flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            :disabled="!canGoToStep(2)"
          >
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              :class="currentStep >= 2 ? [themeClasses.badgeBg, themeClasses.badgeText] : 'bg-slate-200 text-slate-500'">
              2
            </span>
            <span>Profissional</span>
          </button>

          <ChevronRight class="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />

          <button
            @click="canGoToStep(3) && (currentStep = 3)"
            :class="currentStep >= 3 ? themeClasses.primaryText : 'text-slate-400'"
            class="flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            :disabled="!canGoToStep(3)"
          >
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              :class="currentStep >= 3 ? [themeClasses.badgeBg, themeClasses.badgeText] : 'bg-slate-200 text-slate-500'">
              3
            </span>
            <span>Horário</span>
          </button>

          <ChevronRight class="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />

          <button
            @click="canGoToStep(4) && (currentStep = 4)"
            :class="currentStep === 4 ? themeClasses.primaryText : 'text-slate-400'"
            class="flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            :disabled="!canGoToStep(4)"
          >
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              :class="currentStep === 4 ? [themeClasses.badgeBg, themeClasses.badgeText] : 'bg-slate-200 text-slate-500'">
              4
            </span>
            <span>Confirmar</span>
          </button>
        </div>

        <!-- 3. Conteúdo Dinâmico por Step -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          <!-- STEP 1: Seleção de Serviços -->
          <div v-if="currentStep === 1" class="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 class="font-bold text-sm text-slate-900">Selecione os serviços desejados:</h3>
              <p class="text-xs text-slate-500">Você pode selecionar mais de um procedimento.</p>
            </div>

            <div class="space-y-2.5">
              <div
                v-for="service in availableServices"
                :key="service.id"
                @click="toggleService(service)"
                :class="[
                  'p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer active:scale-[0.99]',
                  isServiceSelected(service.id)
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                ]"
              >
                <div class="space-y-0.5">
                  <span class="font-bold text-xs text-slate-900 block">{{ service.name }}</span>
                  <span class="text-[11px] text-slate-500 block">
                    ⏱️ {{ service.durationMinutes }} min
                    <span v-if="service.description"> • {{ service.description }}</span>
                  </span>
                </div>

                <div class="flex items-center gap-3">
                  <span class="font-extrabold text-xs" :class="themeClasses.primaryText">
                    {{ formatCurrency(service.price) }}
                  </span>
                  <div
                    class="w-5 h-5 rounded-md border flex items-center justify-center transition-all"
                    :class="isServiceSelected(service.id) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'"
                  >
                    <Check v-if="isServiceSelected(service.id)" class="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 2: Escolha de Profissional -->
          <div v-else-if="currentStep === 2" class="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 class="font-bold text-sm text-slate-900">Escolha o profissional:</h3>
              <p class="text-xs text-slate-500">Ou selecione "Qualquer profissional" para maior disponibilidade.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                @click="selectedProfessional = null"
                :class="[
                  'p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer',
                  selectedProfessional === null
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                ]"
              >
                <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                  ⚡
                </div>
                <div>
                  <span class="font-bold text-xs text-slate-900 block">Qualquer Profissional</span>
                  <span class="text-[11px] text-slate-500">Primeiro horário livre</span>
                </div>
              </div>

              <div
                v-for="prof in availableProfessionals"
                :key="prof.id"
                @click="selectedProfessional = prof"
                :class="[
                  'p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer',
                  selectedProfessional?.id === prof.id
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                ]"
              >
                <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {{ prof.name.charAt(0) }}
                </div>
                <div>
                  <span class="font-bold text-xs text-slate-900 block">{{ prof.name }}</span>
                  <span class="text-[11px] text-slate-500">{{ prof.role || 'Especialista' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 3: Escolha de Data e Horário -->
          <div v-else-if="currentStep === 3" class="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 class="font-bold text-sm text-slate-900">Selecione o dia e horário:</h3>
              <p class="text-xs text-slate-500">Próximos 30 dias disponíveis para agendamento.</p>
            </div>

            <!-- Carrossel de Dias -->
            <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                v-for="day in bookingDays"
                :key="day.date"
                @click="selectedDate = day.date"
                :class="[
                  'shrink-0 p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center w-16 cursor-pointer',
                  selectedDate === day.date
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                ]"
              >
                <span class="text-[10px] uppercase font-bold tracking-wider opacity-80">{{ day.dayOfWeek }}</span>
                <span class="text-base font-extrabold">{{ day.dayNumber }}</span>
                <span class="text-[9px] uppercase">{{ day.monthName }}</span>
              </button>
            </div>

            <!-- Grade de Horários Livres -->
            <div class="space-y-2 pt-2">
              <span class="text-xs font-bold text-slate-700 block">Horários Disponíveis ({{ totalDuration }} min):</span>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  v-for="slot in availableSlots"
                  :key="slot.time"
                  @click="selectedTime = slot.time"
                  :class="[
                    'py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                    selectedTime === slot.time
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  ]"
                >
                  {{ slot.time }}
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 4: Confirmação & Pagamento -->
          <div v-else-if="currentStep === 4" class="space-y-4 animate-in fade-in duration-150">
            <!-- Resumo do Agendamento -->
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div class="flex justify-between font-bold text-slate-900">
                <span>Serviços ({{ selectedServices.length }}):</span>
                <span>{{ formatCurrency(totalPrice) }}</span>
              </div>
              <p class="text-slate-600">{{ selectedServices.map(s => s.name).join(', ') }}</p>
              <div class="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
                <span>Data: <strong>{{ selectedDate }} às {{ selectedTime }}</strong></span>
                <span>Duração: <strong>{{ totalDuration }} min</strong></span>
              </div>
            </div>

            <!-- Dados de Contato -->
            <div class="space-y-2.5">
              <input
                v-model="customerName"
                type="text"
                placeholder="Seu Nome Completo *"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all"
                :class="themeClasses.focusRing"
                required
              />

              <input
                v-model="customerPhone"
                type="tel"
                placeholder="WhatsApp para Confirmação *"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all"
                :class="themeClasses.focusRing"
                required
              />

              <textarea
                v-model="notes"
                rows="2"
                placeholder="Alguma observação ou preferência? (Opcional)"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all resize-none"
                :class="themeClasses.focusRing"
              ></textarea>
            </div>

            <!-- Modalidades de Pagamento -->
            <div class="space-y-2 pt-2 border-t border-slate-200">
              <label class="text-xs font-bold text-slate-700 block">Opção de Pagamento & Reserva:</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="paymentMode = 'on_service'"
                  :class="[
                    'p-3 rounded-xl border text-xs font-bold transition-all text-left space-y-0.5 cursor-pointer',
                    paymentMode === 'on_service'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  ]"
                >
                  <span class="block">📍 Pagar no Local</span>
                  <span class="text-[10px] text-slate-500 font-normal block">Cartão, Dinheiro ou Pix</span>
                </button>

                <button
                  type="button"
                  @click="paymentMode = 'pix_deposit'"
                  :class="[
                    'p-3 rounded-xl border text-xs font-bold transition-all text-left space-y-0.5 cursor-pointer',
                    paymentMode === 'pix_deposit'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  ]"
                >
                  <span class="block">💠 Garantir com Sinal</span>
                  <span class="text-[10px] text-emerald-700 font-semibold block">Sinal de {{ depositPercentage }}% via Pix</span>
                </button>
              </div>

              <!-- Card Pix para Agendamento com Sinal -->
              <div
                v-if="paymentMode === 'pix_deposit'"
                class="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-2.5 animate-in fade-in duration-150 text-xs"
              >
                <div class="flex items-center justify-between">
                  <span class="text-emerald-950 font-extrabold">Sinal de Reserva via Pix:</span>
                  <span class="font-extrabold text-sm text-emerald-900">
                    {{ formatCurrency(isTestCentMode ? 0.01 : depositAmount) }}
                  </span>
                </div>

                <div class="bg-white rounded-xl p-2.5 border border-emerald-200/90 space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-500 font-medium">Chave ({{ formatKeyTypeLabel(pixConfig?.keyType) }}):</span>
                    <span class="font-mono font-bold text-slate-800 select-all">{{ pixConfig?.key }}</span>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      @click="copyPixKey"
                      class="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Copy class="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{{ isPixKeyCopied ? 'Copiada!' : 'Copiar Chave' }}</span>
                    </button>

                    <button
                      type="button"
                      @click="copyPixCode"
                      class="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Copy class="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{{ isPixCodeCopied ? 'Copiado!' : 'Copia e Cola' }}</span>
                    </button>
                  </div>

                  <!-- Botão Exibir / Gerar QR Code do Sinal -->
                  <button
                    type="button"
                    @click="toggleShowBookingQrCode"
                    class="w-full py-2 px-3 rounded-lg border border-emerald-300 bg-emerald-100/60 hover:bg-emerald-100 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 shadow-2xs"
                  >
                    <QrCode class="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    <span>{{ showBookingQrCode ? '▲ Ocultar QR Code' : '📷 Gerar / Visualizar QR Code do Sinal' }}</span>
                  </button>

                  <!-- Bloco Visual do QR Code Renderizado -->
                  <div
                    v-if="showBookingQrCode"
                    class="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm flex flex-col items-center justify-center space-y-2 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div class="p-2 bg-white rounded-lg border border-slate-100 flex items-center justify-center min-h-[160px] min-w-[160px]">
                      <img
                        v-if="bookingQrCodeDataUrl"
                        :src="bookingQrCodeDataUrl"
                        alt="QR Code Pix Sinal"
                        class="w-40 h-40 object-contain"
                      />
                      <div v-else class="flex flex-col items-center justify-center text-slate-400 gap-1.5 text-xs py-6">
                        <Loader2 class="w-5 h-5 animate-spin text-emerald-600" aria-hidden="true" />
                        <span>Gerando QR Code...</span>
                      </div>
                    </div>
                    <span class="text-[11px] text-slate-500 text-center font-medium">
                      Escaneie com o app do seu banco para pagar o sinal
                    </span>
                  </div>
                </div>

                <!-- Toggle de 1 Centavo -->
                <label v-if="pixConfig?.allowTestCent" class="flex items-center gap-2 text-xs text-emerald-950 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="isTestCentMode"
                    class="rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                  />
                  <span class="text-[11px] font-semibold">🧪 Testar Sinal com R$ 0,01 (Modo de Teste)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Footer com Ações e Navegação -->
        <div class="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            v-if="currentStep > 1"
            type="button"
            @click="currentStep--"
            class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Voltar
          </button>
          <div v-else></div>

          <button
            v-if="currentStep < 4"
            type="button"
            @click="goToNextStep"
            :disabled="!canAdvanceFromCurrentStep"
            class="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :class="themeClasses.buttonPrimary"
          >
            Avançar
          </button>

          <button
            v-else
            type="button"
            @click="submitBooking"
            :disabled="!isStep4Valid"
            class="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :class="themeClasses.buttonPrimary"
          >
            <Send class="w-3.5 h-3.5" aria-hidden="true" />
            <span>Confirmar no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, toRef, watch, nextTick } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { useApiClient } from '~/composables/useApiClient'
import { formatCurrency } from '~/utils/formatters'
import { generatePixPayload, getTenantPixConfig, generatePixQrCodeDataUrl } from '~/utils/pix'
import {
  X,
  Calendar,
  ChevronRight,
  Check,
  Send,
  Copy,
  QrCode,
  Loader2
} from 'lucide-vue-next'
import type { Tenant, BookingService, BookingProfessional } from '~/types'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    tenant: Tenant
    isOpen: boolean
    initialService?: BookingService | null
  }>(),
  {
    initialService: null
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirmed', payload: unknown): void
}>()

// 1. Tema Dinâmico & Trava de Scroll
const { themeClasses } = useTenantTheme(toRef(props, 'tenant'))
useBodyScrollLock(toRef(props, 'isOpen'))

// 2. Estado de Navegação dos Steps
const currentStep = ref(1)

// 3. Catálogo de Serviços
const availableServices = computed<BookingService[]>(() => {
  const list: BookingService[] = []
  if (props.tenant.services && Array.isArray(props.tenant.services) && props.tenant.services.length > 0) {
    return props.tenant.services
  }
  if (props.tenant.categories && Array.isArray(props.tenant.categories)) {
    props.tenant.categories.forEach((cat) => {
      if (cat.products && Array.isArray(cat.products)) {
        cat.products.forEach((p) => {
          list.push({
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: p.price || 0,
            durationMinutes: p.durationMinutes || (props.tenant.businessCategory === 'pro' ? 45 : 30)
          })
        })
      }
    })
  }
  return list
})

const availableProfessionals = computed<BookingProfessional[]>(() => {
  if (props.tenant.professionals && Array.isArray(props.tenant.professionals)) {
    return props.tenant.professionals
  }
  return []
})

// 4. Seleções do Usuário
const selectedServices = ref<BookingService[]>([])
const selectedProfessional = ref<BookingProfessional | null>(null)

function formatKeyTypeLabel(type?: string): string {
  if (!type) return 'Aleatória'
  if (type === 'random') return 'Aleatória'
  if (type === 'phone') return 'Celular'
  if (type === 'cpf') return 'CPF'
  if (type === 'cnpj') return 'CNPJ'
  if (type === 'email') return 'E-mail'
  return type
}

const pixConfig = computed(() => getTenantPixConfig(props.tenant))
const depositPercentage = computed(() => pixConfig.value?.depositPercentage || 30)

watch(() => props.isOpen, (open) => {
  if (open) {
    if (props.initialService) {
      selectedServices.value = [props.initialService]
      currentStep.value = 2
    }
  } else {
    currentStep.value = 1
    selectedServices.value = []
    selectedProfessional.value = null
  }
})

function toggleService(service: BookingService) {
  const index = selectedServices.value.findIndex(s => s.id === service.id)
  if (index >= 0) {
    selectedServices.value.splice(index, 1)
  } else {
    selectedServices.value.push(service)
  }
}

function isServiceSelected(serviceId: string): boolean {
  return selectedServices.value.some(s => s.id === serviceId)
}

const totalDuration = computed(() => {
  return selectedServices.value.reduce((acc, s) => acc + (s.durationMinutes || 30), 0)
})

const totalPrice = computed(() => {
  return selectedServices.value.reduce((acc, s) => acc + (s.price || 0), 0)
})

// 5. Horários & Datas
const selectedDate = ref('')
const selectedTime = ref('')

const bookingDays = computed(() => {
  const days = []
  const today = new Date()
  const weekDays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      dayOfWeek: weekDays[d.getDay()],
      dayNumber: d.getDate(),
      monthName: months[d.getMonth()]
    })
  }
  return days
})

const availableSlots = computed(() => {
  return [
    { time: '09:00' }, { time: '09:30' }, { time: '10:00' }, { time: '10:30' },
    { time: '11:00' }, { time: '11:30' }, { time: '13:00' }, { time: '13:30' },
    { time: '14:00' }, { time: '14:30' }, { time: '15:00' }, { time: '15:30' },
    { time: '16:00' }, { time: '16:30' }, { time: '17:00' }, { time: '17:30' }
  ]
})

// 6. Dados do Cliente & Pagamento
const customerName = ref('')
const customerPhone = ref('')
const notes = ref('')
const paymentMode = ref<'on_service' | 'pix_deposit'>('on_service')
const isTestCentMode = ref(false)
const isPixKeyCopied = ref(false)
const isPixCodeCopied = ref(false)
const showBookingQrCode = ref(false)
const bookingQrCodeDataUrl = ref('')

const depositAmount = computed(() => {
  return (totalPrice.value * depositPercentage.value) / 100
})

async function updateBookingQrCode() {
  if (!pixConfig.value?.key) return
  const payload = generatePixPayload({
    key: pixConfig.value.key,
    beneficiary: pixConfig.value.beneficiary || props.tenant?.name,
    city: pixConfig.value.city || 'SAO PAULO',
    amount: isTestCentMode.value ? 0.01 : depositAmount.value,
    txid: 'SINAL'
  })
  if (payload) {
    bookingQrCodeDataUrl.value = await generatePixQrCodeDataUrl(payload)
  }
}

async function toggleShowBookingQrCode() {
  showBookingQrCode.value = !showBookingQrCode.value
  if (showBookingQrCode.value) {
    await updateBookingQrCode()
  }
}

function copyPixKey() {
  if (!pixConfig.value?.key) return
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(pixConfig.value.key)
    isPixKeyCopied.value = true
    setTimeout(() => { isPixKeyCopied.value = false }, 2500)
  }
}

function copyPixCode() {
  if (!pixConfig.value?.key) return
  const payload = generatePixPayload({
    key: pixConfig.value.key,
    beneficiary: pixConfig.value.beneficiary || props.tenant?.name,
    city: pixConfig.value.city || 'SAO PAULO',
    amount: isTestCentMode.value ? 0.01 : depositAmount.value,
    txid: 'SINAL'
  })

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(payload)
    isPixCodeCopied.value = true
    setTimeout(() => { isPixCodeCopied.value = false }, 2500)
  }
}

// 7. Navegação
const canAdvanceFromCurrentStep = computed(() => {
  if (currentStep.value === 1) return selectedServices.value.length > 0
  if (currentStep.value === 2) return true
  if (currentStep.value === 3) return !!selectedDate.value && !!selectedTime.value
  return true
})

function canGoToStep(targetStep: number): boolean {
  if (targetStep <= 1) return true
  if (targetStep === 2) return selectedServices.value.length > 0
  if (targetStep === 3) return selectedServices.value.length > 0
  if (targetStep === 4) return selectedServices.value.length > 0 && !!selectedDate.value && !!selectedTime.value
  return false
}

function goToNextStep() {
  if (canAdvanceFromCurrentStep.value && currentStep.value < 4) {
    currentStep.value++
  }
}

const isStep4Valid = computed(() => {
  return (
    selectedServices.value.length > 0 &&
    !!selectedDate.value &&
    !!selectedTime.value &&
    customerName.value.trim().length >= 2 &&
    customerPhone.value.replace(/\D/g, '').length >= 10
  )
})

// 8. Confirmação
function submitBooking() {
  if (!isStep4Valid.value || !props.tenant) return

  const cleanPhone = (props.tenant.phoneWhatsApp || '').replace(/\D/g, '')
  const targetPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

  // Sincronização assíncrona não-bloqueante no backend NestJS/PostgreSQL
  try {
    const { createBooking } = useApiClient()
    createBooking({
      tenantId: props.tenant.id || `ten-${props.tenant.slug}`,
      customerName: customerName.value,
      customerPhone: customerPhone.value,
      services: selectedServices.value.map(s => ({
        id: s.id,
        name: s.name,
        priceCents: Math.round(s.price * 100),
        durationMinutes: s.durationMinutes || 30
      })),
      professionalId: selectedProfessional.value?.id,
      professionalName: selectedProfessional.value?.name,
      date: selectedDate.value,
      time: selectedTime.value,
      notes: notes.value.trim() || undefined,
      paymentMode: paymentMode.value
    }).catch(() => {})
  } catch {}

  const lines: string[] = []
  lines.push(`💈 *NOVO AGENDAMENTO — ${props.tenant.name.toUpperCase()}*`)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`👤 *CLIENTE:* ${customerName.value}`)
  lines.push(`📱 *WhatsApp:* ${customerPhone.value}`)
  lines.push(`📅 *DATA & HORÁRIO:* ${selectedDate.value} às ${selectedTime.value}`)
  lines.push(`✂️ *PROFISSIONAL:* ${selectedProfessional.value ? selectedProfessional.value.name : 'Qualquer Profissional'}`)
  lines.push(`⏱️ *DURAÇÃO ESTIMADA:* ${totalDuration.value} min`)
  lines.push(``)
  lines.push(`📋 *SERVIÇOS SELECIONADOS:*`)
  for (const s of selectedServices.value) {
    lines.push(`• ${s.name} (${formatCurrency(s.price)})`)
  }
  lines.push(``)
  lines.push(`💰 *VALOR TOTAL:* ${formatCurrency(totalPrice.value)}`)

  if (paymentMode.value === 'pix_deposit') {
    lines.push(`💠 *SINAL VIA PIX:* ${formatCurrency(isTestCentMode.value ? 0.01 : depositAmount.value)}`)
  } else {
    lines.push(`💳 *PAGAMENTO:* No Local / Atendimento`)
  }

  if (notes.value.trim()) {
    lines.push(``)
    lines.push(`📝 *Observações:* "${notes.value}"`)
  }

  const message = lines.join('\n')
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`

  if (import.meta.client) {
    window.open(whatsappUrl, '_blank')
    emit('confirmed', {
      services: selectedServices.value,
      professional: selectedProfessional.value,
      date: selectedDate.value,
      time: selectedTime.value,
      totalPrice: totalPrice.value
    })
    emit('close')
  }
}
</script>
