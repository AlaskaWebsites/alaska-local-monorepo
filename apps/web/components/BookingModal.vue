<!-- components/BookingModal.vue -->
<script setup lang="ts">
import { ref, computed, toRef, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
  const base = defaultProfessionalsBySlug[tenantSlug.value] || defaultProfessionalsBySlug['barbearia-style'] || []
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

// 6. Calendário e Dias de Atendimento (Próximos 30 dias)
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

// Função para checar se um dia específico está bloqueado (Folga / Loja Fechada / Pausa de Emergência)
function isDateBlocked(d: { date: string; dayIndex?: number } | any): boolean {
  if (rawOverrides.value.emergency?.isClosed || (props.tenant as any)?.isEmergencyClosed) {
    return true
  }

  const dayIndex = d.dayIndex !== undefined ? d.dayIndex : new Date(d.date + 'T12:00:00').getDay()

  // 1. Se um profissional específico foi selecionado
  if (selectedProfessional.value) {
    const prof = availableProfessionals.value.find(p => p.id === selectedProfessional.value?.id) || selectedProfessional.value
    if (!prof || !prof.isAvailable) return true
    const days = prof.availableDays || []
    return !days.includes(dayIndex)
  }

  // 2. Se escolheu "Qualquer Profissional" (checa se há pelo menos 1 ativo atendendo neste dia da semana)
  const hasWorkingProf = availableProfessionals.value.some(p => {
    return p.isAvailable && (p.availableDays || []).includes(dayIndex)
  })

  return !hasWorkingProf
}

const isProfOffOnDate = computed(() => {
  if (!selectedProfessional.value) return false
  const dayOfWeek = new Date(selectedDate.value + 'T12:00:00').getDay()
  return !(selectedProfessional.value.availableDays || []).includes(dayOfWeek) || !selectedProfessional.value.isAvailable
})

// Controle de Rolagem Horizontal do Calendário de Datas
const daysContainerRef = ref<HTMLElement | null>(null)

function scrollDays(direction: 'left' | 'right') {
  if (!daysContainerRef.value) return
  const offset = direction === 'left' ? -220 : 220
  daysContainerRef.value.scrollBy({ left: offset, behavior: 'smooth' })
}

function handleDaysWheel(e: WheelEvent) {
  if (!daysContainerRef.value) return
  if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
    daysContainerRef.value.scrollLeft += e.deltaY
  }
}

// Auto-seleciona a primeira data disponível e centraliza a rolagem
function autoSelectFirstAvailableDate() {
  const currentDay = bookingDays.value.find(d => d.date === selectedDate.value)
  if (!currentDay || isDateBlocked(currentDay)) {
    const firstAvailable = bookingDays.value.find(d => !isDateBlocked(d))
    if (firstAvailable) {
      selectedDate.value = firstAvailable.date
      nextTick(() => {
        const el = document.getElementById(`date-btn-${firstAvailable.date}`)
        if (el && daysContainerRef.value) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
      })
    }
  }
}

watch(
  [selectedProfessional, () => currentStep.value],
  () => {
    autoSelectFirstAvailableDate()
  },
  { immediate: true }
)

const allCandidateSlots = [
  '08:00', '08:45', '09:30', '10:15', '11:00',
  '11:45', '12:30', '13:15', '14:00', '14:45',
  '15:30', '16:15', '17:00', '17:45', '18:30'
]

const availableSlots = computed(() => {
  const blocked = rawOverrides.value.blockedSlots || []
  const dayOfWeek = new Date(selectedDate.value + 'T12:00:00').getDay()

  if (isDateBlocked({ date: selectedDate.value, dayIndex: dayOfWeek })) {
    return []
  }

  if (selectedProfessional.value) {
    const prof = availableProfessionals.value.find(p => p.id === selectedProfessional.value?.id) || selectedProfessional.value
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

  // Se escolheu "Qualquer Profissional": mostra horários onde pelo menos 1 profissional ativo atende
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

function isServiceSelected(serviceId: string): boolean {
  return selectedServices.value.some(s => s.id === serviceId)
}

function toggleService(service: BookingService) {
  triggerHaptic(20)
  const idx = selectedServices.value.findIndex(s => s.id === service.id)
  if (idx >= 0) {
    selectedServices.value.splice(idx, 1)
  } else {
    selectedServices.value.push(service)
  }
}

const totalPrice = computed(() => {
  return selectedServices.value.reduce((acc, s) => acc + (s.price || 0), 0)
})

const totalDuration = computed(() => {
  return selectedServices.value.reduce((acc, s) => acc + (s.durationMinutes || 30), 0)
})

function selectDate(dateStr: string) {
  const day = bookingDays.value.find(d => d.date === dateStr) || { date: dateStr, dayIndex: new Date(dateStr + 'T12:00:00').getDay() }
  if (isDateBlocked(day)) return
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
  const key = pix.pixKey || pix.key || props.tenant.phoneWhatsApp.replace(/\\D/g, '')

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
  } catch (err) {
    console.error('Erro ao gerar Pix de reserva:', err)
  } finally {
    isGeneratingPix.value = false
  }
}

const depositPercentage = 30
const depositAmount = computed(() => {
  return (totalPrice.value * depositPercentage) / 100
})

watch(paymentMode, (newMode) => {
  if (newMode === 'pix_deposit' && !pixPayload.value) {
    generatePixDeposit()
  }
})

function copyPixCode() {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(pixPayload.value)
    isPixCopied.value = true
    triggerHaptic(40)
    setTimeout(() => {
      isPixCopied.value = false
    }, 2500)
  }
}

// 8. Despacho Final via WhatsApp
function confirmAndDispatchWhatsApp() {
  triggerHaptic(50)
  const phone = props.tenant.phoneWhatsApp.replace(/\\D/g, '')
  const servicesText = selectedServices.value.map(s => `• ${s.name} (${s.durationMinutes}min - ${formatCurrency(s.price)})`).join('\\n')
  const profName = selectedProfessional.value ? selectedProfessional.value.name : 'Qualquer especialista disponível'
  const payText = paymentMode.value === 'pix_deposit' ? `Sinal de ${formatCurrency(depositAmount.value)} pago via Pix (30%)` : 'Pagamento presencial no local'

  let msg = `Olá, gostaria de agendar um horário! 📅\\n\\n`
  msg += `*Cliente:* ${customerName.value.trim()}\\n`
  msg += `*WhatsApp:* ${customerPhone.value.trim()}\\n`
  msg += `*Data:* ${selectedDate.value}\\n`
  msg += `*Horário:* ${selectedTime.value}\\n`
  msg += `*Profissional:* ${profName}\\n\\n`
  msg += `*Serviços Selecionados:*\\n${servicesText}\\n\\n`
  msg += `*Valor Total:* ${formatCurrency(totalPrice.value)} (${totalDuration.value} min)\\n`
  msg += `*Forma:* ${payText}\\n`

  if (notes.value.trim()) {
    msg += `*Observações:* ${notes.value.trim()}\\n`
  }

  const url = `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`
  if (typeof window !== 'undefined') {
    window.open(url, '_blank')
  }
  emit('close')
}
</script>

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
        class="bg-white text-slate-800 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg flex flex-col overflow-hidden sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-2xl"
        @click.stop
      >
        <!-- 1. Header do Modal -->
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              📅
            </div>
            <div>
              <h2 id="booking-modal-title" class="text-base font-extrabold text-slate-900 leading-tight">
                Agendamento Online
              </h2>
              <p class="text-[11px] text-slate-500 font-medium">
                {{ tenant.name }} • Escolha seus serviços e horário
              </p>
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
        <div class="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold shrink-0">
          <div class="flex items-center gap-1.5" :class="currentStep === 1 ? 'text-emerald-600 font-bold' : 'text-slate-500'">
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" :class="currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'">1</span>
            <span>Serviços</span>
          </div>
          <ChevronRight class="w-3.5 h-3.5 text-slate-300" />
          <div class="flex items-center gap-1.5" :class="currentStep === 2 ? 'text-emerald-600 font-bold' : 'text-slate-500'">
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" :class="currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'">2</span>
            <span>Profissional</span>
          </div>
          <ChevronRight class="w-3.5 h-3.5 text-slate-300" />
          <div class="flex items-center gap-1.5" :class="currentStep === 3 ? 'text-emerald-600 font-bold' : 'text-slate-500'">
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" :class="currentStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'">3</span>
            <span>Horário</span>
          </div>
          <ChevronRight class="w-3.5 h-3.5 text-slate-300" />
          <div class="flex items-center gap-1.5" :class="currentStep === 4 ? 'text-emerald-600 font-bold' : 'text-slate-500'">
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" :class="currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'">4</span>
            <span>Confirmar</span>
          </div>
        </div>

        <!-- 3. Conteúdo Dinâmico por Step -->
        <div class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          <!-- STEP 1: Seleção de Procedimentos/Serviços -->
          <div v-if="currentStep === 1" class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-900">Escolha os procedimentos ou serviços:</h3>
              <span class="text-xs text-slate-400">{{ availableServices.length }} disponíveis</span>
            </div>

            <div class="space-y-2.5">
              <div
                v-for="service in availableServices"
                :key="service.id"
                @click="toggleService(service)"
                class="p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none"
                :class="isServiceSelected(service.id) ? 'bg-emerald-50 border-emerald-500 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300'"
              >
                <div class="space-y-0.5">
                  <span class="text-xs font-bold text-slate-900 block">{{ service.name }}</span>
                  <span class="text-[11px] text-slate-500 block leading-relaxed">{{ service.description }}</span>
                  <div class="flex items-center gap-2 pt-1">
                    <span class="text-xs font-mono font-bold text-slate-900">{{ formatCurrency(service.price) }}</span>
                    <span class="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-semibold">⏱️ {{ service.durationMinutes }} min</span>
                  </div>
                </div>

                <div
                  class="w-5 h-5 rounded-md border flex items-center justify-center text-xs transition-colors shrink-0 ml-3"
                  :class="isServiceSelected(service.id) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'"
                >
                  <Check v-if="isServiceSelected(service.id)" class="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 2: Seleção de Especialista / Barbeiro -->
          <div v-else-if="currentStep === 2" class="space-y-4">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Selecione o profissional:</h3>
              <p class="text-xs text-slate-500 mt-0.5">Escolha seu especialista de preferência ou o primeiro disponível.</p>
            </div>

            <div class="space-y-2.5">
              <!-- Opção Qualquer Profissional -->
              <div
                @click="selectedProfessional = null"
                class="p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none"
                :class="selectedProfessional === null ? 'bg-emerald-50 border-emerald-500 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300'"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                    ⚡
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-slate-900">Qualquer Especialista Disponível</h4>
                    <span class="text-[11px] text-slate-500">Primeiro horário livre na grade</span>
                  </div>
                </div>
                <div
                  class="w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-colors shrink-0"
                  :class="selectedProfessional === null ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'"
                >
                  <Check v-if="selectedProfessional === null" class="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <!-- Lista de Especialistas -->
              <div
                v-for="prof in availableProfessionals"
                :key="prof.id"
                @click="prof.isAvailable && (selectedProfessional = prof)"
                class="p-3.5 rounded-2xl border transition-all flex items-center justify-between select-none"
                :class="[
                  !prof.isAvailable
                    ? 'opacity-40 grayscale bg-slate-50 border-dashed cursor-not-allowed'
                    : selectedProfessional?.id === prof.id
                      ? 'bg-emerald-50 border-emerald-500 shadow-2xs cursor-pointer'
                      : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                ]"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0"
                    :class="prof.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'"
                  >
                    {{ prof.name.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <h4 class="text-xs font-bold text-slate-900 truncate">{{ prof.name }}</h4>
                      <span v-if="!prof.isAvailable" class="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded uppercase shrink-0">
                        De Folga
                      </span>
                    </div>
                    <span class="text-[11px] text-slate-500 block truncate">{{ prof.role }}</span>
                  </div>
                </div>

                <div
                  v-if="prof.isAvailable"
                  class="w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-colors shrink-0 ml-2"
                  :class="selectedProfessional?.id === prof.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'"
                >
                  <Check v-if="selectedProfessional?.id === prof.id" class="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 3: Escolha de Data e Horário com Bloqueio de Dias Indisponíveis -->
          <div v-else-if="currentStep === 3" class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-slate-900">Selecione o dia e o horário:</h3>
                <p class="text-xs text-slate-500 mt-0.5">Próximos 30 dias disponíveis para agendamento.</p>
              </div>

              <!-- Botões de Navegação Desktop (Setas ← e →) -->
              <div class="flex items-center gap-1.5">
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

            <!-- Carrossel Horizontal de Dias com Bloqueio de Folga e Indisponibilidade -->
            <div
              ref="daysContainerRef"
              @wheel.passive="handleDaysWheel"
              class="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth snap-x select-none"
            >
              <button
                v-for="d in bookingDays"
                :key="d.date"
                :id="`date-btn-${d.date}`"
                type="button"
                :disabled="isDateBlocked(d)"
                @click="!isDateBlocked(d) && selectDate(d.date)"
                class="min-w-[62px] p-2.5 rounded-2xl border text-center transition-all select-none shrink-0 snap-start flex flex-col items-center justify-center relative"
                :class="[
                  isDateBlocked(d)
                    ? 'opacity-40 grayscale bg-slate-100/80 text-slate-400 border-slate-200 border-dashed cursor-not-allowed pointer-events-none'
                    : selectedDate === d.date
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105 cursor-pointer'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer active:scale-95'
                ]"
              >
                <span class="text-[10px] font-bold uppercase block leading-tight">{{ d.dayOfWeek }}</span>
                <span class="text-base font-extrabold block my-0.5 leading-none">{{ d.dayNumber }}</span>
                <span class="text-[9px] uppercase block font-semibold opacity-80 leading-tight">
                  {{ isDateBlocked(d) ? 'Folga' : d.monthName }}
                </span>
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
                  class="p-2.5 rounded-xl border text-xs font-bold font-mono text-center transition-all cursor-pointer select-none active:scale-95"
                  :class="selectedTime === slot.time ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-500'"
                >
                  {{ slot.time }}
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 4: Confirmação & Pagamento -->
          <div v-else-if="currentStep === 4" class="space-y-4">
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <h4 class="font-bold text-slate-900 text-sm">Resumo do Agendamento:</h4>
              <p><strong>Procedimentos:</strong> {{ selectedServices.map(s => s.name).join(', ') }}</p>
              <p><strong>Profissional:</strong> {{ selectedProfessional ? selectedProfessional.name : 'Primeiro disponível' }}</p>
              <p><strong>Data:</strong> {{ selectedDate }} às {{ selectedTime }}</p>
              <p><strong>Duração Total:</strong> {{ totalDuration }} minutos</p>
              <p class="text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                Valor Total: <span class="text-emerald-600 font-mono">{{ formatCurrency(totalPrice) }}</span>
              </p>
            </div>

            <div class="space-y-3 pt-1">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Seu Nome Completo *</label>
                <input
                  type="text"
                  v-model="customerName"
                  placeholder="Ex: Danilo Santos"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">WhatsApp para Confirmação *</label>
                <input
                  type="tel"
                  v-model="customerPhone"
                  placeholder="Ex: (11) 98888-7777"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <!-- Escolha de Pagamento -->
              <div class="space-y-2 pt-2">
                <label class="block text-[11px] font-bold text-slate-700">Forma de Garantia do Agendamento:</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    @click="paymentMode = 'on_service'"
                    class="p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    :class="paymentMode === 'on_service' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold' : 'bg-white border-slate-200 text-slate-600'"
                  >
                    <span>📍 Pagar no Local</span>
                    <span class="text-[10px] font-normal text-slate-400">Cartão, Pix ou Dinheiro</span>
                  </button>

                  <button
                    type="button"
                    @click="paymentMode = 'pix_deposit'"
                    class="p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    :class="paymentMode === 'pix_deposit' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold' : 'bg-white border-slate-200 text-slate-600'"
                  >
                    <span>💠 Sinal via Pix (30%)</span>
                    <span class="text-[10px] font-normal text-slate-400">{{ formatCurrency(depositAmount) }}</span>
                  </button>
                </div>
              </div>

              <!-- Bloco Pix Copia e Cola / QR Code para Sinal -->
              <div v-if="paymentMode === 'pix_deposit'" class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2.5 animate-in fade-in duration-150">
                <div class="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>Pagar Sinal de Reserva ({{ formatCurrency(depositAmount) }})</span>
                </div>

                <div v-if="qrCodeDataUrl" class="flex justify-center py-2">
                  <img :src="qrCodeDataUrl" alt="QR Code Pix" class="w-36 h-36 rounded-xl border border-emerald-200 shadow-xs bg-white p-1" />
                </div>

                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    readonly
                    :value="pixPayload"
                    class="flex-1 bg-white border border-emerald-200 rounded-xl p-2 text-[11px] font-mono text-slate-700 select-all outline-none"
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
            :disabled="selectedServices.length === 0 || (currentStep === 3 && isDateBlocked({ date: selectedDate }))"
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
