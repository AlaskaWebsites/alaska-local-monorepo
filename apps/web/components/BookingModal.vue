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

          <!-- STEP 2: Escolha de Profissional com Respeito a Folgas e Escala -->
          <div v-else-if="currentStep === 2" class="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 class="font-bold text-sm text-slate-900">Escolha o profissional / especialista:</h3>
              <p class="text-xs text-slate-500">Ou selecione "Qualquer profissional" para o primeiro horário livre.</p>
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
                @click="prof.isAvailable && (selectedProfessional = prof)"
                :class="[
                  'p-3.5 rounded-2xl border transition-all flex items-center gap-3',
                  !prof.isAvailable ? 'opacity-50 grayscale bg-slate-50 border-dashed cursor-not-allowed' :
                  selectedProfessional?.id === prof.id
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs cursor-pointer'
                    : 'border-slate-200 bg-white hover:bg-slate-50 cursor-pointer'
                ]"
              >
                <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {{ prof.name.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-xs text-slate-900 truncate">{{ prof.name }}</span>
                    <span v-if="!prof.isAvailable" class="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded uppercase">
                      De Folga
                    </span>
                  </div>
                  <span class="text-[11px] text-slate-500 block">{{ prof.role || 'Especialista' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 3: Escolha de Data e Horário -->
          <div v-else-if="currentStep === 3" class="space-y-4 animate-in fade-in duration-150">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-sm text-slate-900">Selecione o dia e horário:</h3>
                <p class="text-xs text-slate-500">Próximos 30 dias disponíveis para agendamento.</p>
              </div>

              <!-- Botões de Navegação Desktop (Setas ← e →) -->
              <div class="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  @click="scrollDays('left')"
                  class="p-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs cursor-pointer transition-all active:scale-95 flex items-center justify-center"
                  aria-label="Dias anteriores"
                  title="Dias anteriores"
                >
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  @click="scrollDays('right')"
                  class="p-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs cursor-pointer transition-all active:scale-95 flex items-center justify-center"
                  aria-label="Próximos dias"
                  title="Próximos dias"
                >
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Carrossel de Dias com Rolagem Suave -->
            <div
              ref="daysContainerRef"
              @wheel="handleDaysWheel"
              class="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 -mx-1 px-1"
            >
              <button
                type="button"
                v-for="day in bookingDays"
                :key="day.date"
                @click="selectedDate = day.date"
                :class="[
                  'shrink-0 p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center w-16 cursor-pointer select-none active:scale-95',
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

            <!-- Aviso se o Profissional Selecionado não atende neste dia da semana -->
            <div v-if="isProfOffOnDate" class="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs gap-3">
              <div class="text-amber-800 space-y-0.5">
                <span class="font-bold block">⚠️ {{ selectedProfessional?.name }} não atende neste dia.</span>
                <span class="text-[11px] text-amber-700 block">Selecione outro dia ou troque para qualquer profissional disponível.</span>
              </div>
              <button
                type="button"
                @click="selectedProfessional = null"
                class="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-2xs"
              >
                Qualquer um
              </button>
            </div>

            <!-- Grade de Horários Livres (Filtrando Bloqueios do Admin) -->
            <div v-else class="space-y-2 pt-2">
              <span class="text-xs font-bold text-slate-700 block">Horários Disponíveis ({{ totalDuration }} min):</span>
              
              <div v-if="isDayStoreClosed" class="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
                <span class="text-xs font-bold text-rose-700 block">⚠️ Estabelecimento Fechado neste dia da semana</span>
                <span class="text-[11px] text-rose-600 mt-0.5 block">Selecione outro dia no carrossel acima para ver os horários.</span>
              </div>

              <div v-else-if="availableSlots.length === 0" class="p-4 bg-slate-100 border border-slate-200 rounded-xl text-center">
                <span class="text-xs font-bold text-slate-600 block">Todos os horários deste dia estão bloqueados ou ocupados.</span>
              </div>

              <div v-else class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  v-for="slot in availableSlots"
                  :key="slot.time"
                  @click="selectedTime = slot.time"
                  :class="[
                    'py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center select-none active:scale-95',
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
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all"
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
                  <span class="text-[10px] text-slate-500 font-normal block">
                    {{ formatCurrency(depositAmount) }} ({{ depositPercentage }}%)
                  </span>
                </button>
              </div>

              <!-- Card Pix para Agendamento com Sinal -->
              <div
                v-if="paymentMode === 'pix_deposit'"
                class="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-3 mt-2 animate-in fade-in duration-150"
              >
                <div class="flex items-center justify-between text-xs">
                  <span class="text-emerald-950 font-extrabold">Sinal de Reserva via Pix:</span>
                  <span class="font-bold text-emerald-800">{{ formatCurrency(effectiveDepositAmount) }}</span>
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
import { ref, computed, toRef, onMounted } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { formatCurrency } from '~/utils/formatters'
import { generatePixPayload, getTenantPixConfig, generatePixQrCodeDataUrl } from '~/utils/pix'
import {
  X,
  Calendar,
  ChevronLeft,
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
}>()

// 1. Tema Dinâmico & Trava de Scroll
const { themeClasses } = useTenantTheme(toRef(props, 'tenant'))
useBodyScrollLock(toRef(props, 'isOpen'))

// 2. Estado de Navegação dos Steps
const currentStep = ref(1)

// 3. Estado de Seleção de Serviços
const selectedServices = ref<BookingService[]>([])

function isServiceSelected(id: string): boolean {
  return selectedServices.value.some(s => s.id === id)
}

function toggleService(service: BookingService) {
  const idx = selectedServices.value.findIndex(s => s.id === service.id)
  if (idx >= 0) {
    selectedServices.value.splice(idx, 1)
  } else {
    selectedServices.value.push(service)
  }
}

const availableServices = computed<BookingService[]>(() => {
  const services: BookingService[] = []
  props.tenant.categories?.forEach((cat) => {
    cat.products?.forEach((prod) => {
      services.push({
        id: prod.id,
        name: prod.name,
        description: prod.description || '',
        price: prod.price,
        durationMinutes: prod.durationMinutes || 30,
        professionalIds: []
      })
    })
  })
  return services
})

// 4. Estado de Profissional com Overrides do Admin (Dentistas/Especialistas ou Barbeiros)
const selectedProfessional = ref<BookingProfessional | null>(null)

const defaultProfessionalsBySlug: Record<string, Array<{ id: string; name: string; role: string; isAvailable: boolean; availableDays: number[] }>> = {
  'clinica-sorriso': [
    { id: 'prof-1', name: 'Dra. Camila Rocha', role: 'Cirurgiã Dentista & Implantes', isAvailable: true, availableDays: [1, 2, 3, 4, 5] },
    { id: 'prof-2', name: 'Dr. Rafael Mendes', role: 'Ortodontista & Invisalign', isAvailable: true, availableDays: [1, 2, 3, 4, 5, 6] },
    { id: 'prof-3', name: 'Dra. Beatriz Lima', role: 'Harmonização Orofacial & Estética', isAvailable: true, availableDays: [2, 3, 4, 5, 6] }
  ],
  'barbearia-style': [
    { id: 'prof-1', name: 'Carlos Santos', role: 'Barbeiro Master', isAvailable: true, availableDays: [1, 2, 3, 4, 5, 6] },
    { id: 'prof-2', name: 'Lucas Oliveira', role: 'Visagista & Barbeiro', isAvailable: true, availableDays: [2, 3, 4, 5, 6] },
    { id: 'prof-3', name: 'Mateus Silva', role: 'Especialista em Cortes Clássicos', isAvailable: true, availableDays: [1, 3, 4, 5, 6] }
  ]
}

const rawOverrides = ref<any>({})

function syncOverrides() {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`alaska_overrides_${props.tenant.slug}`)
      if (raw) rawOverrides.value = JSON.parse(raw)
    } catch {}
  }
}

onMounted(() => {
  syncOverrides()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', syncOverrides)
    window.addEventListener('alaska_overrides_updated', syncOverrides)
  }
})

const availableProfessionals = computed(() => {
  const profOverrides = rawOverrides.value.professionals || {}
  const baseList = defaultProfessionalsBySlug[props.tenant.slug] || defaultProfessionalsBySlug['barbearia-style']

  return baseList.map(p => {
    const ov = profOverrides[p.id]
    const isAvail = ov?.isAvailable !== undefined ? Boolean(ov.isAvailable) : Boolean(p.isAvailable)
    const days = ov?.availableDays || p.availableDays

    return {
      ...p,
      isAvailable: isAvail,
      availableDays: days
    }
  })
})

// 5. Estado de Data e Horário (Próximos 30 dias com Rolagem Desktop)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedTime = ref('14:00')
const daysContainerRef = ref<HTMLElement | null>(null)

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const isDayStoreClosed = computed(() => {
  const hours = (rawOverrides.value.openingHours || props.tenant?.openingHours) as any
  if (!hours) return false
  const dayIndex = new Date(selectedDate.value + 'T12:00:00').getDay()
  const dayKey = DAY_KEYS[dayIndex]
  return Boolean(hours[dayKey]?.closed)
})

// Verifica se o profissional escolhido atende no dia da semana selecionado
const isProfOffOnDate = computed(() => {
  if (!selectedProfessional.value) return false
  const prof = availableProfessionals.value.find(p => p.id === selectedProfessional.value?.id)
  if (!prof) return false
  if (!prof.isAvailable) return true

  const dayOfWeek = new Date(selectedDate.value + 'T12:00:00').getDay()
  return !(prof.availableDays || []).includes(dayOfWeek)
})

function scrollDays(direction: 'left' | 'right') {
  if (!daysContainerRef.value) return
  const offset = direction === 'left' ? -220 : 220
  daysContainerRef.value.scrollBy({ left: offset, behavior: 'smooth' })
}

function handleDaysWheel(e: WheelEvent) {
  if (!daysContainerRef.value) return
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    daysContainerRef.value.scrollLeft += e.deltaY * 0.8
  }
}

const bookingDays = computed(() => {
  const days = []
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const weekDays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

  const base = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`

    days.push({
      date: dateStr,
      dayOfWeek: weekDays[d.getDay()],
      dayNumber: d.getDate(),
      monthName: months[d.getMonth()]
    })
  }
  return days
})

const allSlots = [
  '09:00', '09:45', '10:30', '11:15', '12:00',
  '13:00', '13:45', '14:30', '15:15', '16:00',
  '16:45', '17:30', '18:15', '19:00'
]

const availableSlots = computed(() => {
  const blocked = rawOverrides.value.blockedSlots || []
  return allSlots
    .filter(time => !blocked.some((b: any) => b.date === selectedDate.value && b.time === time))
    .map(time => ({ time }))
})

// 6. Estado de Identificação e Pagamento Pix
const customerName = ref('')
const customerPhone = ref('')
const notes = ref('')
const paymentMode = ref<'on_service' | 'pix_deposit'>('on_service')

const isTestCentMode = ref(false)
const isPixKeyCopied = ref(false)
const isPixCodeCopied = ref(false)
const showBookingQrCode = ref(false)
const bookingQrCodeDataUrl = ref('')

function formatKeyTypeLabel(type?: string): string {
  switch (type) {
    case 'cpf': return 'CPF'
    case 'cnpj': return 'CNPJ'
    case 'phone': return 'Celular'
    case 'email': return 'E-mail'
    default: return 'Aleatória'
  }
}

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

const pixConfig = computed(() => getTenantPixConfig(props.tenant))
const depositPercentage = computed(() => pixConfig.value?.depositPercentage || 30)

const totalPrice = computed(() => {
  return selectedServices.value.reduce((sum, s) => sum + s.price, 0)
})

const totalDuration = computed(() => {
  return selectedServices.value.reduce((sum, s) => sum + (s.durationMinutes || 30), 0)
})

const depositAmount = computed(() => {
  return (totalPrice.value * depositPercentage.value) / 100
})

const effectiveDepositAmount = computed(() => {
  if (isTestCentMode.value) return 0.01
  return depositAmount.value
})

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
    amount: effectiveDepositAmount.value,
    txid: 'AGENDAMENTO'
  })

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(payload)
    isPixCodeCopied.value = true
    setTimeout(() => { isPixCodeCopied.value = false }, 2500)
  }
}

// 7. Validação de Navegação
function canGoToStep(step: number): boolean {
  if (step === 2) return selectedServices.value.length > 0
  if (step === 3) return selectedServices.value.length > 0
  if (step === 4) return selectedServices.value.length > 0 && !!selectedDate.value && !!selectedTime.value && !isDayStoreClosed.value && !isProfOffOnDate.value
  return true
}

const canAdvanceFromCurrentStep = computed(() => {
  if (currentStep.value === 1) return selectedServices.value.length > 0
  if (currentStep.value === 2) return true
  if (currentStep.value === 3) return !!selectedDate.value && !!selectedTime.value && !isDayStoreClosed.value && !isProfOffOnDate.value
  return false
})

const isStep4Valid = computed(() => {
  return customerName.value.trim().length >= 2 && customerPhone.value.trim().length >= 10
})

function goToNextStep() {
  if (canAdvanceFromCurrentStep.value && currentStep.value < 4) {
    currentStep.value++
  }
}

// 8. Despacho no WhatsApp
function submitBooking() {
  if (!isStep4Valid.value || !props.tenant) return

  const cleanPhone = (props.tenant.phoneWhatsApp || '').replace(/\D/g, '')
  const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

  const lines: string[] = []
  lines.push(`🩺 *NOVO AGENDAMENTO — ${props.tenant.name.toUpperCase()}*`)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`📅 *DATA & HORÁRIO:*`)
  lines.push(`• Data: ${selectedDate.value}`)
  lines.push(`• Horário: ${selectedTime.value}`)
  lines.push(`• Profissional: ${selectedProfessional.value ? selectedProfessional.value.name : 'Qualquer disponível'}`)
  lines.push(``)
  lines.push(`✂️ *PROCEDIMENTOS / SERVIÇOS:*`)
  selectedServices.value.forEach(s => {
    lines.push(`• ${s.name} (${s.durationMinutes} min) — ${formatCurrency(s.price)}`)
  })
  lines.push(``)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`⏱️ Duração Estimada: ${totalDuration.value} minutos`)
  lines.push(`*VALOR TOTAL: ${formatCurrency(totalPrice.value)}*`)

  if (paymentMode.value === 'pix_deposit') {
    lines.push(`💠 *SINAL VIA PIX:* ${formatCurrency(isTestCentMode.value ? 0.01 : depositAmount.value)}`)
    lines.push(`💳 *Restante no Local:* ${formatCurrency(totalPrice.value - depositAmount.value)}`)
  } else {
    lines.push(`💳 *PAGAMENTO:* No local (Atendimento presencial)`)
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`👤 *CLIENTE / PACIENTE:* ${customerName.value.trim()}`)
  lines.push(`📱 *WHATSAPP:* ${customerPhone.value.trim()}`)

  if (notes.value.trim()) {
    lines.push(`💬 *OBS:* "${notes.value.trim()}"`)
  }

  if (paymentMode.value === 'pix_deposit' && pixConfig.value) {
    lines.push(``)
    lines.push(`📌 *Comprovante do Pix do sinal anexado nesta conversa para confirmação.*`)
  }

  lines.push(``)
  lines.push(`_Agendamento via Alaska Local_`)

  const text = encodeURIComponent(lines.join('\n'))
  const url = `https://wa.me/${phone}?text=${text}`

  if (typeof window !== 'undefined') {
    window.open(url, '_blank')
  }
}

onMounted(() => {
  if (props.initialService) {
    selectedServices.value = [props.initialService]
  }
})
</script>
