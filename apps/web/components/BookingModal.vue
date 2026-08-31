<!-- components/BookingModal.vue -->
<script setup lang="ts">
import { ref, computed, toRef, onMounted, onUnmounted, watch } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { useHaptic } from '~/composables/useHaptic'
import { useMerchantAdmin } from '~/composables/useMerchantAdmin'
import { formatCurrency } from '~/utils/formatters'
import { generatePixPayload, generatePixQrCodeDataUrl } from '~/utils/pix'
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  QrCode,
  Copy,
  AlertCircle,
  Sparkles
} from 'lucide-vue-next'
import type { BookingService, BookingProfessional, Tenant } from '~/types'

const props = defineProps<{
  isOpen: boolean
  tenant: Tenant
  initialService?: BookingService | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { triggerHaptic } = useHaptic()
const { getOverrides } = useMerchantAdmin(props.tenant?.slug || 'default')

// 1. Tema Dinâmico
const { themeClasses } = useTenantTheme(toRef(props, 'tenant'))

// 2. Trava de Rolagem de Fundo (Body Scroll Lock)
useBodyScrollLock(toRef(props, 'isOpen'))

// 3. Fechamento com Tecla ESC
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

// 4. Sincronização de Overrides Locais (Agenda, Profissionais e Bloqueios)
const rawOverrides = ref<any>({})

function syncBookingOverrides() {
  rawOverrides.value = getOverrides()
}

onMounted(() => {
  syncBookingOverrides()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', syncBookingOverrides)
    window.addEventListener('alaska_overrides_updated', syncBookingOverrides)
  }
})

const tenantSlug = computed(() => props.tenant?.slug || 'clinica-sorriso')

// 5. Estado do Fluxo de Agendamento em 4 Passos
const currentStep = ref<1 | 2 | 3 | 4>(1)
const selectedServices = ref<BookingService[]>([])
const selectedProfessional = ref<any | null>(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedTime = ref('14:00')

const customerName = ref('')
const customerPhone = ref('')
const paymentMode = ref<'on_service' | 'pix_deposit'>('on_service')
const notes = ref('')

const isGeneratingPix = ref(false)
const pixPayload = ref('')
const qrCodeDataUrl = ref('')
const isPixCopied = ref(false)

// Inicializa com serviço padrão se fornecido
watch(
  () => props.initialService,
  (newSrv) => {
    if (newSrv) {
      selectedServices.value = [newSrv]
      currentStep.value = 2
    }
  },
  { immediate: true }
)

// Catálogo de Serviços Base da Clínica / Barbearia
const defaultServicesBySlug: Record<string, BookingService[]> = {
  'clinica-sorriso': [
    { id: 'srv-1', name: 'Avaliação Inicial & Planejamento 3D', description: 'Consulta completa com diagnóstico digital e plano de tratamento.', price: 120.0, durationMinutes: 45, professionalIds: [] },
    { id: 'srv-2', name: 'Profilaxia & Limpeza Dental Profunda', description: 'Remoção de tártaro, jato de bicarbonato e aplicação de flúor.', price: 180.0, durationMinutes: 45, professionalIds: [] },
    { id: 'srv-3', name: 'Clareamento Dental a Laser', description: 'Sessão clínica com gel fotoativado de alta potência.', price: 450.0, durationMinutes: 60, professionalIds: [] },
    { id: 'srv-4', name: 'Manutenção de Aparelho Ortodôntico', description: 'Troca de arcos, elásticos e alinhamento mensal.', price: 150.0, durationMinutes: 30, professionalIds: [] },
    { id: 'srv-5', name: 'Harmonização / Aplicação de Toxina', description: 'Procedimento estético facial por região.', price: 850.0, durationMinutes: 45, professionalIds: [] }
  ],
  'barbearia-style': [
    { id: 'srv-1', name: 'Corte Degradê / Fade Navalhado', description: 'Acabamento na lâmina, lavagem e finalização premium.', price: 45.0, durationMinutes: 35, professionalIds: [] },
    { id: 'srv-2', name: 'Barboterapia Completa com Toalha Quente', description: 'Vapor de ozônio, óleos essenciais e massagem facial.', price: 40.0, durationMinutes: 30, professionalIds: [] },
    { id: 'srv-3', name: 'Combo Cabelo & Barba Style', description: 'O serviço completo mais pedido com direito a cerveja gelada.', price: 75.0, durationMinutes: 55, professionalIds: [] },
    { id: 'srv-4', name: 'Camuflagem de Fios Brancos', description: 'Pigmentação natural para barba ou cabelo.', price: 35.0, durationMinutes: 25, professionalIds: [] }
  ]
}

const availableServices = computed<BookingService[]>(() => {
  const base = defaultServicesBySlug[tenantSlug.value] || defaultServicesBySlug['barbearia-style']
  return base
})

// Profissionais com Suporte a Custom e Delete
const defaultProfessionalsBySlug: Record<string, Array<any>> = {
  'clinica-sorriso': [
    { id: 'prof-1', name: 'Dra. Camila Rocha', role: 'Cirurgiã Dentista & Implantes', isAvailable: true, availableDays: [1, 2, 3, 4, 5], workHours: { start: '08:00', end: '17:00' }, lunchBreak: { start: '12:00', end: '13:00', enabled: true } },
    { id: 'prof-2', name: 'Dr. Rafael Mendes', role: 'Ortodontista & Invisalign', isAvailable: true, availableDays: [1, 2, 3, 4, 5, 6], workHours: { start: '09:00', end: '19:00' }, lunchBreak: { start: '13:00', end: '14:00', enabled: true } },
    { id: 'prof-3', name: 'Dra. Beatriz Lima', role: 'Harmonização Orofacial & Estética', isAvailable: true, availableDays: [2, 3, 4, 5, 6], workHours: { start: '10:00', end: '19:00' }, lunchBreak: { start: '13:00', end: '14:00', enabled: false } }
  ],
  'barbearia-style': [
    { id: 'prof-1', name: 'Carlos Santos', role: 'Barbeiro Master', isAvailable: true, availableDays: [1, 2, 3, 4, 5, 6], workHours: { start: '09:00', end: '20:00' }, lunchBreak: { start: '12:00', end: '13:00', enabled: true } },
    { id: 'prof-2', name: 'Lucas Oliveira', role: 'Visagista & Barbeiro', isAvailable: true, availableDays: [2, 3, 4, 5, 6], workHours: { start: '10:00', end: '20:00' }, lunchBreak: { start: '14:00', end: '15:00', enabled: true } },
    { id: 'prof-3', name: 'Mateus Silva', role: 'Especialista em Cortes Clássicos', isAvailable: true, availableDays: [1, 3, 4, 5, 6], workHours: { start: '09:00', end: '18:00' }, lunchBreak: { start: '12:00', end: '13:00', enabled: false } }
  ]
}

const availableProfessionals = computed(() => {
  const overrides = rawOverrides.value.professionals || {}
  const deletedIds = rawOverrides.value.deletedProfessionalIds || []
  const customProfs = rawOverrides.value.customProfessionals || []
  const base = defaultProfessionalsBySlug[tenantSlug.value] || defaultProfessionalsBySlug['barbearia-style']
  const allProfs = [...base, ...customProfs].filter(p => !deletedIds.includes(p.id))

  return allProfs.map(p => {
    const ov = overrides[p.id]
    const isAvail = ov?.isAvailable !== undefined ? Boolean(ov.isAvailable) : Boolean(p.isAvailable)
    const days = ov?.availableDays ? [...ov.availableDays] : [...(p.availableDays || [1, 2, 3, 4, 5])]
    return {
      ...p,
      isAvailable: isAvail,
      availableDays: days,
      workHours: {
        start: ov?.workHours?.start || p.workHours?.start || '08:00',
        end: ov?.workHours?.end || p.workHours?.end || '18:00'
      },
      lunchBreak: {
        start: ov?.lunchBreak?.start || p.lunchBreak?.start || '12:00',
        end: ov?.lunchBreak?.end || p.lunchBreak?.end || '13:00',
        enabled: ov?.lunchBreak?.enabled !== undefined ? Boolean(ov.lunchBreak.enabled) : Boolean(p.lunchBreak?.enabled)
      }
    }
  })
})

function parseTimeToMin(t: string): number {
  if (!t) return 0
  const [h, m] = t.split(':')
  return (parseInt(h || '0', 10) * 60) + parseInt(m || '0', 10)
}

// 6. Calendário e Dias de Atendimento
const bookingDays = computed(() => {
  const days = []
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

  const base = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    const dayOfWeekIdx = d.getDay()

    days.push({
      date: dateStr,
      dayOfWeek: weekDays[dayOfWeekIdx],
      dayNumber: d.getDate(),
      monthName: months[d.getMonth()],
      dayIndex: dayOfWeekIdx
    })
  }
  return days
})

const isProfOffOnDate = computed(() => {
  if (!selectedProfessional.value) return false
  const dayOfWeek = new Date(selectedDate.value + 'T12:00:00').getDay()
  return !(selectedProfessional.value.availableDays || []).includes(dayOfWeek) || !selectedProfessional.value.isAvailable
})

const allCandidateSlots = [
  '08:00', '08:45', '09:30', '10:15', '11:00',
  '11:45', '12:30', '13:15', '14:00', '14:45',
  '15:30', '16:15', '17:00', '17:45', '18:30'
]

const availableSlots = computed(() => {
  const blocked = rawOverrides.value.blockedSlots || []
  const dayOfWeek = new Date(selectedDate.value + 'T12:00:00').getDay()

  if (selectedProfessional.value) {
    const prof = availableProfessionals.value.find(p => p.id === selectedProfessional.value?.id)
    if (!prof || !prof.isAvailable || !(prof.availableDays || []).includes(dayOfWeek)) {
      return []
    }

    const startMin = parseTimeToMin(prof.workHours?.start || '08:00')
    const endMin = parseTimeToMin(prof.workHours?.end || '18:00')
    const lunchStart = parseTimeToMin(prof.lunchBreak?.start || '12:00')
    const lunchEnd = parseTimeToMin(prof.lunchBreak?.end || '13:00')
    const hasLunch = Boolean(prof.lunchBreak?.enabled)

    return allCandidateSlots
      .filter(time => {
        const timeMin = parseTimeToMin(time)
        if (timeMin < startMin || timeMin >= endMin) return false
        if (hasLunch && timeMin >= lunchStart && timeMin < lunchEnd) return false
        if (blocked.some((b: any) => b.date === selectedDate.value && b.time === time)) return false
        return true
      })
      .map(time => ({ time }))
  }

  const workingProfs = availableProfessionals.value.filter(p => {
    return p.isAvailable && (p.availableDays || []).includes(dayOfWeek)
  })

  return allCandidateSlots
    .filter(time => {
      const timeMin = parseTimeToMin(time)
      if (blocked.some((b: any) => b.date === selectedDate.value && b.time === time)) return false

      const hasAnyProf = workingProfs.some(prof => {
        const startMin = parseTimeToMin(prof.workHours?.start || '08:00')
        const endMin = parseTimeToMin(prof.workHours?.end || '18:00')
        const lunchStart = parseTimeToMin(prof.lunchBreak?.start || '12:00')
        const lunchEnd = parseTimeToMin(prof.lunchBreak?.end || '13:00')
        const hasLunch = Boolean(prof.lunchBreak?.enabled)

        if (timeMin < startMin || timeMin >= endMin) return false
        if (hasLunch && timeMin >= lunchStart && timeMin < lunchEnd) return false
        return true
      })

      return hasAnyProf
    })
    .map(time => ({ time }))
})

const totalDuration = computed(() => {
  return selectedServices.value.reduce((acc, s) => acc + (s.durationMinutes || 30), 0)
})

const totalPrice = computed(() => {
  return selectedServices.value.reduce((acc, s) => acc + Number(s.price || 0), 0)
})

const depositAmount = computed(() => {
  return Math.round(totalPrice.value * 0.3)
})

function isServiceSelected(srvId: string): boolean {
  return selectedServices.value.some(s => s.id === srvId)
}

function toggleService(srv: BookingService) {
  triggerHaptic(20)
  const idx = selectedServices.value.findIndex(s => s.id === srv.id)
  if (idx >= 0) {
    selectedServices.value.splice(idx, 1)
  } else {
    selectedServices.value.push(srv)
  }
}

function selectProfessional(prof: any | null) {
  triggerHaptic(25)
  selectedProfessional.value = prof
}

function selectDate(dateStr: string) {
  triggerHaptic(20)
  selectedDate.value = dateStr
}

function selectTime(timeStr: string) {
  triggerHaptic(20)
  selectedTime.value = timeStr
}

// 7. Geração de Pix para Sinal de Reserva
async function generatePixDeposit() {
  const pix = rawOverrides.value.pix || (props.tenant as any).pixConfig || (props.tenant as any).pix || {}
  const key = pix.pixKey || pix.key || props.tenant.phoneWhatsApp.replace(/\D/g, '')

  isGeneratingPix.value = true
  try {
    const payload = generatePixPayload({
      key,
      beneficiary: pix.beneficiary || props.tenant.name,
      city: pix.city || 'SAO PAULO',
      amount: depositAmount.value,
      txid: `AGEND${Date.now().toString().slice(-6)}`
    })

    pixPayload.value = payload
    qrCodeDataUrl.value = await generatePixQrCodeDataUrl(payload)
  } catch (e) {
    console.error('Erro ao gerar Pix de sinal:', e)
  } finally {
    isGeneratingPix.value = false
  }
}

function copyPixCode() {
  if (!pixPayload.value) return
  navigator.clipboard.writeText(pixPayload.value)
  isPixCopied.value = true
  triggerHaptic(30)
  setTimeout(() => { isPixCopied.value = false }, 2500)
}

watch(paymentMode, (newMode) => {
  if (newMode === 'pix_deposit' && !pixPayload.value) {
    generatePixDeposit()
  }
})

// 8. Despacho Estruturado no WhatsApp
function confirmAndDispatchWhatsApp() {
  if (!customerName.value.trim() || !customerPhone.value.trim()) {
    alert('Preencha seu nome e telefone para confirmar o agendamento.')
    return
  }

  triggerHaptic(40)
  const phone = (props.tenant.phoneWhatsApp || '').replace(/\D/g, '')
  const cleanPhone = phone.startsWith('55') ? phone : `55${phone}`

  const lines: string[] = []
  lines.push(`🩺 *NOVO AGENDAMENTO — ${props.tenant.name.toUpperCase()}*`)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`📅 *DATA & HORÁRIO:*`)
  lines.push(`• Data: ${selectedDate.value}`)
  lines.push(`• Horário: ${selectedTime.value}`)

  if (selectedProfessional.value) {
    lines.push(`• Profissional: ${selectedProfessional.value.name} (${selectedProfessional.value.role || 'Especialista'})`)
  } else {
    lines.push(`• Profissional: Qualquer disponível`)
  }

  lines.push(``)
  lines.push(`✂️ *PROCEDIMENTOS / SERVIÇOS:*`)
  selectedServices.value.forEach(srv => {
    lines.push(`• ${srv.name} (${srv.durationMinutes} min) — ${formatCurrency(srv.price)}`)
  })

  lines.push(``)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`⏱️ Duração Estimada: ${totalDuration.value} minutos`)
  lines.push(`*VALOR TOTAL: ${formatCurrency(totalPrice.value)}*`)

  if (paymentMode.value === 'pix_deposit') {
    lines.push(`💠 *Sinal de Reserva (30%):* ${formatCurrency(depositAmount.value)} (Pago via Pix)`)
    lines.push(`📌 *Restante a pagar no atendimento:* ${formatCurrency(totalPrice.value - depositAmount.value)}`)
  } else {
    lines.push(`💳 *Pagamento:* No atendimento (Dinheiro/Cartão/Pix)`)
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`👤 *PACIENTE / CLIENTE:* ${customerName.value}`)
  lines.push(`📱 *WHATSAPP:* ${customerPhone.value}`)

  if (notes.value.trim()) {
    lines.push(`💬 *OBSERVAÇÕES:* "${notes.value.trim()}"`)
  }

  lines.push(``)
  lines.push(`_Agendamento gerado via Alaska Local_`)

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join('\n'))}`
  window.open(url, '_blank')
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      @click="emit('close')"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        class="bg-white text-slate-800 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg flex flex-col overflow-hidden sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-2xl"
        @click.stop
      >
        <!-- Header Fixo no Topo -->
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div class="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <Calendar class="w-4 h-4" />
            </div>
            <div class="truncate">
              <h2 id="booking-modal-title" class="text-base font-extrabold text-slate-900 truncate">
                Agendamento Online
              </h2>
              <p class="text-[11px] text-slate-500 truncate">
                {{ tenant.name }} • Escolha seus serviços e horário
              </p>
            </div>
          </div>

          <button
            @click="emit('close')"
            class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar modal de agendamento"
          >
            <X class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <!-- Indicador Visual de Passos (1 a 4) -->
        <div class="px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span :class="{ 'text-emerald-700 font-bold': currentStep === 1 }">1. Serviços</span>
          <span>›</span>
          <span :class="{ 'text-emerald-700 font-bold': currentStep === 2 }">2. Profissional</span>
          <span>›</span>
          <span :class="{ 'text-emerald-700 font-bold': currentStep === 3 }">3. Horário</span>
          <span>›</span>
          <span :class="{ 'text-emerald-700 font-bold': currentStep === 4 }">4. Confirmar</span>
        </div>

        <!-- Conteúdo com Rolagem Suave -->
        <div class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          <!-- ========================================== -->
          <!-- PASSO 1: Seleção de Serviços               -->
          <!-- ========================================== -->
          <div v-if="currentStep === 1" class="space-y-3 animate-in fade-in duration-150">
            <div>
              <h3 class="font-bold text-sm text-slate-900">Selecione os procedimentos / serviços:</h3>
              <p class="text-xs text-slate-500">Você pode selecionar múltiplos serviços para agendar no mesmo dia.</p>
            </div>

            <div class="space-y-2 pt-1">
              <div
                v-for="srv in availableServices"
                :key="srv.id"
                @click="toggleService(srv)"
                class="p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none"
                :class="isServiceSelected(srv.id) ? 'bg-emerald-50/80 border-emerald-400 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300'"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h4 class="font-bold text-xs sm:text-sm text-slate-900 truncate">{{ srv.name }}</h4>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold shrink-0">
                      {{ srv.durationMinutes }} min
                    </span>
                  </div>
                  <p v-if="srv.description" class="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-relaxed">
                    {{ srv.description }}
                  </p>
                  <p class="text-xs font-mono font-extrabold text-emerald-700 mt-1">
                    {{ formatCurrency(srv.price) }}
                  </p>
                </div>

                <div
                  class="w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0"
                  :class="isServiceSelected(srv.id) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'"
                >
                  <Check v-if="isServiceSelected(srv.id)" class="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- PASSO 2: Seleção de Especialista           -->
          <!-- ========================================== -->
          <div v-else-if="currentStep === 2" class="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 class="font-bold text-sm text-slate-900">Escolha o profissional / especialista:</h3>
              <p class="text-xs text-slate-500">Ou selecione "Qualquer profissional" para maior flexibilidade.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Opção Qualquer Profissional -->
              <div
                @click="selectProfessional(null)"
                class="p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer select-none"
                :class="selectedProfessional === null ? 'bg-emerald-50/80 border-emerald-400 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300'"
              >
                <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                  ⚡
                </div>
                <div>
                  <h4 class="font-bold text-xs text-slate-900">Qualquer Profissional</h4>
                  <span class="text-[11px] text-slate-500 block">Primeiro horário livre</span>
                </div>
              </div>

              <!-- Lista de Especialistas -->
              <div
                v-for="prof in availableProfessionals"
                :key="prof.id"
                @click="selectProfessional(prof)"
                class="p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer select-none"
                :class="selectedProfessional?.id === prof.id ? 'bg-emerald-50/80 border-emerald-400 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300'"
              >
                <div
                  class="w-10 h-10 rounded-full font-bold flex items-center justify-center text-xs shrink-0"
                  :class="prof.isAvailable ? 'bg-emerald-500/20 text-emerald-700' : 'bg-rose-500/20 text-rose-700'"
                >
                  {{ prof.name.charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <h4 class="font-bold text-xs text-slate-900 truncate">{{ prof.name }}</h4>
                    <span v-if="!prof.isAvailable" class="text-[9px] bg-rose-100 text-rose-700 px-1 py-0.2 rounded font-bold">
                      Folga
                    </span>
                  </div>
                  <span class="text-[11px] text-slate-500 block truncate">{{ prof.role || 'Especialista' }}</span>
                  <span v-if="prof.isAvailable" class="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                    ⏰ {{ prof.workHours?.start || '08:00' }} às {{ prof.workHours?.end || '18:00' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- PASSO 3: Seleção de Data e Horário         -->
          <!-- ========================================== -->
          <div v-else-if="currentStep === 3" class="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 class="font-bold text-sm text-slate-900">Selecione o dia e horário:</h3>
              <p class="text-xs text-slate-500">Próximos 30 dias disponíveis para agendamento.</p>
            </div>

            <!-- Carrossel Horizontal de Dias -->
            <div class="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x">
              <button
                v-for="d in bookingDays"
                :key="d.date"
                type="button"
                @click="selectDate(d.date)"
                class="min-w-[62px] p-2.5 rounded-2xl border text-center transition-all cursor-pointer select-none shrink-0 snap-start"
                :class="selectedDate === d.date ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'"
              >
                <span class="text-[10px] font-bold uppercase block">{{ d.dayOfWeek }}</span>
                <span class="text-base font-extrabold block my-0.5">{{ d.dayNumber }}</span>
                <span class="text-[9px] uppercase block font-semibold opacity-80">{{ d.monthName }}</span>
              </button>
            </div>

            <!-- Aviso caso o profissional selecionado esteja de folga no dia -->
            <div v-if="isProfOffOnDate" class="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
              <p class="font-bold flex items-center gap-1.5">
                <span>⚠️</span> {{ selectedProfessional?.name }} não atende neste dia da semana.
              </p>
              <span class="text-[11px] text-slate-600 block">Selecione outro dia no carrossel acima para visualizar os horários de atendimento.</span>
            </div>

            <!-- Grade de Horários Livres -->
            <div v-else class="space-y-2 pt-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-700 block">
                  Horários Disponíveis ({{ totalDuration }} min)
                  <span v-if="selectedProfessional" class="text-emerald-600 font-semibold">• {{ selectedProfessional.name }} ({{ selectedProfessional.workHours?.start }} às {{ selectedProfessional.workHours?.end }})</span>
                </span>
                <span class="text-[11px] text-slate-400 font-medium">{{ availableSlots.length }} opções</span>
              </div>

              <div v-if="availableSlots.length === 0" class="p-4 bg-slate-100 border border-slate-200 rounded-xl text-center">
                <span class="text-xs font-bold text-slate-600 block">Todos os horários deste dia estão ocupados ou fora do expediente do profissional.</span>
              </div>

              <div v-else class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <button
                  v-for="slot in availableSlots"
                  :key="slot.time"
                  type="button"
                  @click="selectTime(slot.time)"
                  class="py-2.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer select-none text-center"
                  :class="selectedTime === slot.time ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'"
                >
                  {{ slot.time }}
                </button>
              </div>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- PASSO 4: Dados do Cliente & Confirmação    -->
          <!-- ========================================== -->
          <div v-else-if="currentStep === 4" class="space-y-4 animate-in fade-in duration-150">
            <!-- Resumo do Agendamento -->
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
              <div class="flex items-center justify-between pb-2 border-b border-slate-200 font-bold text-slate-900">
                <span>Resumo da Consulta / Serviço</span>
                <span class="text-emerald-700 font-mono text-sm">{{ formatCurrency(totalPrice) }}</span>
              </div>

              <div class="space-y-1 text-slate-600">
                <p><strong>Data:</strong> {{ selectedDate }} às {{ selectedTime }}</p>
                <p><strong>Profissional:</strong> {{ selectedProfessional?.name || 'Qualquer disponível' }}</p>
                <p><strong>Procedimentos:</strong> {{ selectedServices.map(s => s.name).join(', ') }}</p>
                <p><strong>Duração Total:</strong> {{ totalDuration }} minutos</p>
              </div>
            </div>

            <!-- Dados de Contato -->
            <div class="space-y-3 text-xs">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Seu Nome Completo *</label>
                <input
                  type="text"
                  v-model="customerName"
                  placeholder="Ex: Danilo Santos"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Seu WhatsApp (com DDD) *</label>
                <input
                  type="tel"
                  v-model="customerPhone"
                  placeholder="Ex: 11988887777"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                />
              </div>

              <!-- Modalidade de Pagamento / Sinal Pix -->
              <div class="space-y-2 pt-1">
                <label class="block text-[11px] font-bold text-slate-700">Forma de Confirmação:</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    class="p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer select-none transition-all"
                    :class="paymentMode === 'on_service' ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-slate-200'"
                  >
                    <input type="radio" value="on_service" v-model="paymentMode" class="text-emerald-600" />
                    <div>
                      <span class="font-bold text-xs text-slate-900 block">Pagar no Atendimento</span>
                      <span class="text-[10px] text-slate-500">Dinheiro, Cartão ou Pix</span>
                    </div>
                  </label>

                  <label
                    class="p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer select-none transition-all"
                    :class="paymentMode === 'pix_deposit' ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-slate-200'"
                  >
                    <input type="radio" value="pix_deposit" v-model="paymentMode" class="text-emerald-600" />
                    <div>
                      <span class="font-bold text-xs text-slate-900 block">Sinal Pix (30%)</span>
                      <span class="text-[10px] text-emerald-700 font-bold font-mono">{{ formatCurrency(depositAmount) }}</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Bloco Pix Copia e Cola / QR Code para Sinal -->
              <div v-if="paymentMode === 'pix_deposit'" class="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <QrCode class="w-4 h-4 text-emerald-600" /> Sinal de Reserva: {{ formatCurrency(depositAmount) }}
                  </span>
                  <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Pix D+0</span>
                </div>

                <div v-if="qrCodeDataUrl" class="flex justify-center py-1">
                  <img :src="qrCodeDataUrl" alt="QR Code Pix" class="w-36 h-36 rounded-xl border border-emerald-200 shadow-sm bg-white p-1" />
                </div>

                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    readonly
                    :value="pixPayload"
                    class="flex-1 bg-white border border-emerald-200 rounded-xl p-2.5 text-[11px] text-slate-700 font-mono select-all outline-none"
                  />
                  <button
                    type="button"
                    @click="copyPixCode"
                    class="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                  >
                    <Copy class="w-3.5 h-3.5" />
                    <span>{{ isPixCopied ? 'Copiado!' : 'Copiar' }}</span>
                  </button>
                </div>
              </div>

              <!-- Observações -->
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Observações adicionais (opcional)</label>
                <textarea
                  v-model="notes"
                  rows="2"
                  placeholder="Ex: Primeira consulta, preferência por sala silenciosa..."
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Rodapé Fixo com Navegação de Passos -->
        <div class="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <button
            v-if="currentStep > 1"
            @click="currentStep--"
            class="px-4 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Voltar
          </button>
          <div v-else class="text-xs font-mono font-bold text-slate-500 pl-1">
            {{ selectedServices.length }} {{ selectedServices.length === 1 ? 'serviço' : 'serviços' }}
          </div>

          <button
            v-if="currentStep < 4"
            @click="currentStep++"
            :disabled="selectedServices.length === 0"
            class="flex-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1 shadow-lg active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Avançar</span>
            <ChevronRight class="w-4 h-4" />
          </button>

          <button
            v-else
            @click="confirmAndDispatchWhatsApp"
            :disabled="!customerName.trim() || !customerPhone.trim()"
            class="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Confirmar no WhatsApp</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
