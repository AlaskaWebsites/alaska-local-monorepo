<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pix-modal-title"
      @keydown.esc="close"
    >
      <div class="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        <!-- Close Button -->
        <button
          @click="close"
          class="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Fechar modal Pix"
        >
          <XIcon class="w-5 h-5" />
        </button>

        <!-- Header -->
        <div class="text-center mb-5">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
            <QrCodeIcon class="w-6 h-6" />
          </div>
          <h3 id="pix-modal-title" class="text-xl font-bold text-slate-900">
            Pague com Pix
          </h3>
          <p class="text-sm text-slate-500 mt-1">
            Escaneie o QR Code ou copie o código Copia e Cola
          </p>
        </div>

        <!-- Valor & Toggle de Teste -->
        <div class="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-600">Valor Total:</span>
            <span class="text-2xl font-extrabold text-slate-900">{{ formattedAmount }}</span>
          </div>

          <div v-if="allowTestCent" class="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-amber-900">Modo Teste Real</span>
              <span class="text-[11px] text-amber-700">Gerar Pix com R$ 0,01</span>
            </div>
            <button
              type="button"
              @click="toggleTestMode"
              :class="[
                'px-3 py-1 rounded-full text-xs font-bold transition-all',
                isTestMode ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              ]"
            >
              {{ isTestMode ? 'R$ 0,01 Ativo' : 'Ativar R$ 0,01' }}
            </button>
          </div>
        </div>

        <!-- QR Code Visual -->
        <div class="flex flex-col items-center justify-center mb-5">
          <div class="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-inner flex items-center justify-center min-h-[220px] min-w-[220px]">
            <img
              v-if="qrCodeDataUrl"
              :src="qrCodeDataUrl"
              alt="QR Code Pix"
              class="w-52 h-52 object-contain"
            />
            <div v-else class="flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2Icon class="w-8 h-8 animate-spin text-emerald-500" />
              <span class="text-xs font-medium">Gerando QR Code...</span>
            </div>
          </div>
          <span class="text-xs text-slate-400 mt-2 font-medium">
            Beneficiário: {{ beneficiaryName }}
          </span>
        </div>

        <!-- Botão Copia e Cola -->
        <div class="space-y-3">
          <button
            type="button"
            @click="copyPixCode"
            :class="[
              'w-full py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98',
              copied ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
            ]"
          >
            <CheckIcon v-if="copied" class="w-5 h-5 animate-in zoom-in" />
            <CopyIcon v-else class="w-5 h-5" />
            <span>{{ copied ? 'Código Copiado com Sucesso!' : 'Copiar Código Pix (Copia e Cola)' }}</span>
          </button>

          <button
            type="button"
            @click="close"
            class="w-full py-2.5 text-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Concluir e Voltar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X as XIcon, QrCode as QrCodeIcon, Copy as CopyIcon, Check as CheckIcon, Loader2 as Loader2Icon } from 'lucide-vue-next'
import { generatePixPayload, generatePixQrCodeDataUrl } from '~/utils/pix'
import { formatCurrency } from '~/utils/formatters'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { useHaptic } from '~/composables/useHaptic'
import type { Tenant } from '~/types/tenant'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    tenant: Tenant
    amount: number
    txid?: string
    allowTestCent?: boolean
  }>(),
  {
    allowTestCent: true
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'copied'): void
}>()

const isTestMode = ref(false)
const qrCodeDataUrl = ref('')
const copied = ref(false)

const { lock, unlock } = useBodyScrollLock()
const { triggerHaptic } = useHaptic()

const effectiveAmount = computed(() => {
  return isTestMode.value ? 0.01 : props.amount
})

const formattedAmount = computed(() => {
  return formatCurrency(effectiveAmount.value)
})

const beneficiaryName = computed(() => {
  return props.tenant?.pixConfig?.beneficiary || props.tenant?.name || 'Alaska Local'
})

const pixPayload = computed(() => {
  if (!props.tenant) return ''
  const key = props.tenant.pixConfig?.key || props.tenant.phoneWhatsApp.replace(/\D/g, '')
  return generatePixPayload({
    key,
    name: beneficiaryName.value,
    city: props.tenant.pixConfig?.city || 'SAO PAULO',
    amount: effectiveAmount.value,
    txid: props.txid || 'ALASKA'
  })
})

async function updateQrCode() {
  if (pixPayload.value) {
    qrCodeDataUrl.value = await generatePixQrCodeDataUrl(pixPayload.value)
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    lock()
    updateQrCode()
  } else {
    unlock()
    copied.value = false
  }
})

watch([pixPayload, isTestMode], () => {
  if (props.modelValue) {
    updateQrCode()
  }
})

function toggleTestMode() {
  isTestMode.value = !isTestMode.value
  triggerHaptic(30)
}

async function copyPixCode() {
  if (!pixPayload.value) return
  try {
    await navigator.clipboard.writeText(pixPayload.value)
    copied.value = true
    triggerHaptic([40, 60, 40])
    emit('copied')
    setTimeout(() => {
      copied.value = false
    }, 4000)
  } catch {
    // Fallback silencioso
  }
}

function close() {
  emit('update:modelValue', false)
}
</script>
