<!-- components/CartDrawerModal.vue -->
<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
      @click="emit('close')"
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        class="fixed inset-y-0 right-0 max-w-full flex pl-10"
        @click.stop
      >
        <div class="w-screen max-w-md bg-white text-slate-800 shadow-2xl flex flex-col h-full border-l border-slate-200">
          <!-- 1. Header da Gaveta -->
          <div class="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
            <div class="flex items-center gap-2">
              <ShoppingCart class="w-5 h-5" :class="themeClasses.primaryText" aria-hidden="true" />
              <h2 id="cart-drawer-title" class="text-base font-extrabold text-slate-900">
                Sua Sacola
              </h2>
              <span
                v-if="items.length > 0"
                class="px-2 py-0.5 rounded-full text-[11px] font-bold"
                :class="[themeClasses.badgeBg, themeClasses.badgeText]"
              >
                {{ totalItemsCount }} {{ totalItemsCount === 1 ? 'item' : 'itens' }}
              </span>
            </div>

            <div class="flex items-center gap-1">
              <button
                v-if="items.length > 0"
                @click="handleClearCart"
                class="p-2 text-slate-400 hover:text-rose-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-xs font-semibold"
                aria-label="Esvaziar sacola de compras"
              >
                <Trash2 class="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                @click="emit('close')"
                class="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Fechar sacola"
              >
                <X class="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- 2. Conteúdo Rolável -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            <!-- Estado Vazio -->
            <div v-if="items.length === 0" class="py-16 text-center space-y-3">
              <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag class="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 class="font-bold text-base text-slate-800">Sua sacola está vazia</h3>
              <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Navegue pelo cardápio ou catálogo para adicionar itens e fechar seu pedido.
              </p>
              <button
                @click="emit('close')"
                class="mt-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                :class="themeClasses.buttonPrimary"
              >
                Ver Cardápio / Produtos
              </button>
            </div>

            <!-- Lista de Itens Adicionados -->
            <div v-else class="space-y-4">
              <div
                v-for="(item, index) in items"
                :key="index"
                class="p-3.5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-2"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-start gap-2.5">
                    <span
                      class="px-2 py-0.5 rounded-lg text-xs font-bold shrink-0 mt-0.5"
                      :class="[themeClasses.badgeBg, themeClasses.badgeText]"
                    >
                      {{ item.quantity }}x
                    </span>
                    <div>
                      <h4 class="text-xs font-bold text-slate-900 leading-tight">
                        {{ item.product?.name || 'Produto' }}
                      </h4>
                      <span class="text-xs font-semibold text-slate-600 block mt-0.5">
                        {{ formatCurrency(getItemPrice(item)) }}
                      </span>
                    </div>
                  </div>

                  <button
                    @click="emit('remove-item', index)"
                    class="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                    aria-label="Remover item da sacola"
                  >
                    <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                <!-- Opcionais / Adicionais -->
                <div v-if="getCartItemOptions(item).length > 0" class="mt-1 space-y-0.5 pl-6">
                  <p
                    v-for="opt in getCartItemOptions(item)"
                    :key="opt.id"
                    class="text-[11px] text-slate-500 flex items-center justify-between"
                  >
                    <span>+ {{ opt.name }}</span>
                    <span v-if="opt.price > 0" class="font-semibold text-slate-700">
                      {{ formatCurrency(opt.price) }}
                    </span>
                  </p>
                </div>

                <!-- Observação do Item -->
                <p v-if="getCartItemNotes(item)" class="text-[11px] text-slate-400 italic mt-1 pl-6">
                  "{{ getCartItemNotes(item) }}"
                </p>
              </div>

              <!-- 3. Formulário de Identificação & Entrega -->
              <section aria-labelledby="checkout-form-title" class="pt-4 border-t border-slate-200 space-y-4">
                <h3 id="checkout-form-title" class="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Dados para Entrega & Contato
                </h3>

                <!-- Modalidade: Entrega vs Retirada -->
                <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl" role="radiogroup" aria-label="Modalidade de recebimento">
                  <button
                    type="button"
                    role="radio"
                    :aria-checked="form.deliveryType === 'delivery'"
                    @click="form.deliveryType = 'delivery'"
                    :class="[
                      'py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                      form.deliveryType === 'delivery'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    ]"
                  >
                    <Truck class="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Entrega</span>
                  </button>

                  <button
                    type="button"
                    role="radio"
                    :aria-checked="form.deliveryType === 'takeaway' || (form.deliveryType as string) === 'pickup'"
                    @click="form.deliveryType = 'takeaway'"
                    :class="[
                      'py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                      form.deliveryType === 'takeaway' || (form.deliveryType as string) === 'pickup'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    ]"
                  >
                    <Store class="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Retirada</span>
                  </button>
                </div>

                <!-- Nome e Telefone -->
                <div class="space-y-2.5">
                  <input
                    id="checkout-name"
                    v-model="form.customerName"
                    type="text"
                    placeholder="Seu Nome Completo *"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all"
                    :class="themeClasses.focusRing"
                    required
                  />

                  <input
                    id="checkout-phone"
                    v-model="form.customerPhone"
                    type="tel"
                    placeholder="WhatsApp para Acompanhamento *"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all"
                    :class="themeClasses.focusRing"
                    required
                  />
                </div>

                <!-- Campos de Endereço (Apenas se Entrega) com ViaCEP -->
                <div v-if="form.deliveryType === 'delivery'" class="space-y-2.5 animate-in fade-in duration-150">
                  <div class="relative flex items-center">
                    <input
                      id="checkout-cep"
                      v-model="formAddress.cep"
                      @input="onCepInput"
                      @blur="onCepBlur"
                      type="text"
                      maxlength="9"
                      placeholder="CEP (ex: 01310-100)"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all pr-9"
                      :class="themeClasses.focusRing"
                    />
                    <div v-if="isLoadingCep" class="absolute right-3 text-slate-400 pointer-events-none">
                      <Loader2 class="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    </div>
                    <div v-else-if="formAddress.street && !cepError" class="absolute right-3 text-emerald-600 pointer-events-none">
                      <Check class="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                  </div>

                  <p v-if="cepError" class="text-[11px] text-rose-500 font-medium pl-1">
                    {{ cepError }}
                  </p>

                  <div class="grid grid-cols-3 gap-2">
                    <div class="col-span-2 space-y-1">
                      <input
                        id="checkout-street"
                        v-model="formAddress.street"
                        type="text"
                        placeholder="Rua / Avenida *"
                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all"
                        :class="themeClasses.focusRing"
                        required
                      />
                    </div>
                    <div class="space-y-1">
                      <input
                        id="checkout-number"
                        ref="numberInputRef"
                        v-model="formAddress.number"
                        type="text"
                        placeholder="Nº *"
                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all"
                        :class="themeClasses.focusRing"
                        required
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <input
                      id="checkout-neighborhood"
                      v-model="formAddress.neighborhood"
                      type="text"
                      placeholder="Bairro *"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all"
                      :class="themeClasses.focusRing"
                      required
                    />
                    <input
                      id="checkout-complement"
                      v-model="formAddress.complement"
                      type="text"
                      placeholder="Complemento (Apto, Bloco)"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all"
                      :class="themeClasses.focusRing"
                    />
                  </div>
                </div>

                <!-- 4. Forma de Pagamento -->
                <div class="space-y-2 pt-2 border-t border-slate-100">
                  <label class="text-xs font-bold text-slate-700 block">Forma de Pagamento</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      v-for="method in ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro']"
                      :key="method"
                      @click="form.paymentMethod = method"
                      :class="[
                        'py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                        form.paymentMethod === method
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      ]"
                    >
                      <CreditCard v-if="method.includes('Cartão')" class="w-3.5 h-3.5" aria-hidden="true" />
                      <Banknote v-else-if="method === 'Dinheiro'" class="w-3.5 h-3.5" aria-hidden="true" />
                      <span v-else>💠</span>
                      <span>{{ method }}</span>
                    </button>
                  </div>

                  <!-- Card Interativo de Pagamento Pix (Estágio 1) -->
                  <div
                    v-if="form.paymentMethod === 'Pix'"
                    class="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 space-y-3 mt-2 animate-in fade-in duration-150"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          💠
                        </div>
                        <div>
                          <span class="text-xs font-extrabold text-emerald-950 block">Pagamento Instantâneo Pix</span>
                          <span class="text-[11px] text-emerald-800 font-medium">
                            {{ pixConfig?.beneficiary || tenant?.name || 'Alaska Local' }}
                          </span>
                        </div>
                      </div>
                      <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 border border-emerald-300">
                        Pix D+0
                      </span>
                    </div>

                    <!-- Bloco de Chave e Copia e Cola -->
                    <div class="bg-white rounded-xl p-3 border border-emerald-200/90 space-y-2.5">
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-slate-500 font-medium">Chave Pix ({{ formatKeyTypeLabel(pixConfig?.keyType) }}):</span>
                        <span class="font-mono font-bold text-slate-800 select-all">{{ pixConfig?.key }}</span>
                      </div>

                      <div class="grid grid-cols-2 gap-2 pt-0.5">
                        <button
                          type="button"
                          @click="copyPixKey"
                          class="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        >
                          <Copy class="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{{ isPixKeyCopied ? 'Chave Copiada!' : 'Copiar Chave' }}</span>
                        </button>

                        <button
                          type="button"
                          @click="copyPixCode"
                          class="py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <Copy class="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{{ isPixCodeCopied ? 'Código Copiado!' : `Copia e Cola (${formatCurrency(effectivePixAmount)})` }}</span>
                        </button>
                      </div>

                      <!-- Botão Exibir / Gerar QR Code -->
                      <button
                        type="button"
                        @click="toggleShowQrCode"
                        class="w-full py-2 px-3 rounded-xl border border-emerald-300 bg-emerald-100/60 hover:bg-emerald-100 text-emerald-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-2xs"
                      >
                        <QrCode class="w-4 h-4 text-emerald-700" aria-hidden="true" />
                        <span>{{ showQrCode ? '▲ Ocultar QR Code' : '📷 Gerar / Visualizar QR Code Pix' }}</span>
                      </button>

                      <!-- Bloco Visual do QR Code Renderizado -->
                      <div
                        v-if="showQrCode"
                        class="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm flex flex-col items-center justify-center space-y-2 animate-in fade-in zoom-in-95 duration-150"
                      >
                        <div class="p-2 bg-white rounded-lg border border-slate-100 flex items-center justify-center min-h-[180px] min-w-[180px]">
                          <img
                            v-if="qrCodeDataUrl"
                            :src="qrCodeDataUrl"
                            alt="QR Code Pix"
                            class="w-44 h-44 object-contain"
                          />
                          <div v-else class="flex flex-col items-center justify-center text-slate-400 gap-1.5 text-xs py-8">
                            <Loader2 class="w-6 h-6 animate-spin text-emerald-600" aria-hidden="true" />
                            <span>Gerando QR Code...</span>
                          </div>
                        </div>
                        <span class="text-[11px] text-slate-500 text-center font-medium">
                          Abra o app do seu banco e aponte a câmera para escanear
                        </span>
                      </div>
                    </div>

                    <!-- Toggle de Teste de 1 Centavo (R$ 0,01) -->
                    <label v-if="pixConfig?.allowTestCent" class="flex items-center gap-2 text-xs text-emerald-950 cursor-pointer pt-0.5">
                      <input
                        type="checkbox"
                        v-model="isTestCentMode"
                        class="rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span class="text-[11px] font-semibold">🧪 Testar Pix com R$ 0,01 (Modo de Teste)</span>
                    </label>

                    <!-- Aviso de Segurança e Liberação -->
                    <div class="flex items-start gap-2 text-[11px] text-emerald-900 leading-relaxed bg-emerald-100/70 p-2.5 rounded-xl border border-emerald-200">
                      <ShieldCheck class="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>Transfira no app do seu banco e envie o comprovante no WhatsApp. O atendente confere o extrato para liberação imediata.</span>
                    </div>
                  </div>

                  <!-- Campo de Troco (Apenas se Dinheiro) -->
                  <div v-if="form.paymentMethod === 'Dinheiro'" class="space-y-1 pt-1 animate-in fade-in duration-150">
                    <input
                      id="checkout-change"
                      v-model="form.changeFor"
                      type="text"
                      placeholder="Precisa de troco para quanto? (ex: R$ 50,00)"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all"
                      :class="themeClasses.focusRing"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>

          <!-- 5. Footer Fixo com Totais e Botão de Envio para o WhatsApp -->
          <div v-if="items.length > 0" class="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3 shrink-0">
            <div class="space-y-1.5 text-xs text-slate-600">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span class="font-semibold text-slate-800">{{ formatCurrency(subtotal) }}</span>
              </div>
              <div v-if="form.deliveryType === 'delivery'" class="flex justify-between">
                <span>Taxa de Entrega</span>
                <span class="font-semibold text-slate-800">
                  {{ deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Grátis' }}
                </span>
              </div>
              <div class="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total do Pedido</span>
                <span :class="themeClasses.primaryText">{{ formatCurrency(orderTotal) }}</span>
              </div>
            </div>

            <button
              type="button"
              @click="handleSendWhatsApp"
              :disabled="!isFormValid"
              class="w-full py-3 px-4 rounded-2xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="themeClasses.buttonPrimary"
            >
              <Send class="w-4 h-4" aria-hidden="true" />
              <span>Enviar Pedido pelo WhatsApp</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, toRef, nextTick } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { useCep } from '~/composables/useCep'
import { useApiClient } from '~/composables/useApiClient'
import { formatCurrency, formatCep, sanitizeDigits } from '~/utils/formatters'
import { generateWhatsAppOrderUrl } from '~/utils/whatsapp'
import { generatePixPayload, getTenantPixConfig, generatePixQrCodeDataUrl } from '~/utils/pix'
import {
  X,
  Trash2,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Send,
  Loader2,
  Check,
  Copy,
  QrCode,
  ShieldCheck
} from 'lucide-vue-next'
import type { Tenant, CartItem, CheckoutFormData } from '~/types'

const props = defineProps<{
  tenant: Tenant
  items: CartItem[]
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'remove-item', index: number): void
  (e: 'clear-cart'): void
}>()

// 1. Tema Dinâmico
const { themeClasses } = useTenantTheme(toRef(props, 'tenant'))

// 2. Trava de Scroll Acessível
useBodyScrollLock(toRef(props, 'isOpen'))

// 3. Perfil de Checkout Persistente no LocalStorage
const form = useLocalStorage<CheckoutFormData>('alaska_checkout_profile', {
  customerName: '',
  customerPhone: '',
  deliveryType: 'delivery',
  address: {
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    complement: ''
  },
  paymentMethod: 'Pix',
  changeFor: ''
}, {
  mergeDefaults: true
})

const formAddress = computed(() => {
  if (!form.value.address) {
    form.value.address = {
      cep: '',
      street: '',
      number: '',
      neighborhood: '',
      complement: ''
    }
  }
  return form.value.address
})

// 4. Configuração de Pix e Teste de 1 Centavo
const isTestCentMode = ref(false)
const isPixKeyCopied = ref(false)
const isPixCodeCopied = ref(false)
const showQrCode = ref(false)
const qrCodeDataUrl = ref('')

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

const effectivePixAmount = computed(() => {
  if (isTestCentMode.value) return 0.01
  return orderTotal.value
})

async function updateQrCode() {
  if (!pixConfig.value?.key) return
  const payload = generatePixPayload({
    key: pixConfig.value.key,
    beneficiary: pixConfig.value.beneficiary || props.tenant?.name,
    city: pixConfig.value.city || 'SAO PAULO',
    amount: effectivePixAmount.value,
    txid: 'PEDIDO'
  })
  if (payload) {
    qrCodeDataUrl.value = await generatePixQrCodeDataUrl(payload)
  }
}

async function toggleShowQrCode() {
  showQrCode.value = !showQrCode.value
  if (showQrCode.value) {
    await updateQrCode()
  }
}

function copyPixKey() {
  if (!pixConfig.value?.key) return
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(pixConfig.value.key)
    isPixKeyCopied.value = true
    setTimeout(() => {
      isPixKeyCopied.value = false
    }, 2500)
  }
}

function copyPixCode() {
  if (!pixConfig.value?.key) return
  const payload = generatePixPayload({
    key: pixConfig.value.key,
    beneficiary: pixConfig.value.beneficiary || props.tenant?.name,
    city: pixConfig.value.city || 'SAO PAULO',
    amount: effectivePixAmount.value,
    txid: 'PEDIDO'
  })

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(payload)
    isPixCodeCopied.value = true
    setTimeout(() => {
      isPixCodeCopied.value = false
    }, 2500)
  }
}

// 5. Helpers para Opcionais e Observações
function getCartItemOptions(item: any): any[] {
  return item.options || item.selectedOptions || []
}

function getCartItemNotes(item: any): string {
  return item.notes || item.observation || ''
}

function getItemPrice(item: any): number {
  const base = item.product?.price || item.unitPrice || 0
  const opts = getCartItemOptions(item)
  const optsTotal = opts.reduce((sum: number, o: any) => sum + (o.price || 0), 0)
  return (base + optsTotal) * (item.quantity || 1)
}

const totalItemsCount = computed(() => {
  return props.items.reduce((acc, item) => acc + (item.quantity || 1), 0)
})

// 6. Consulta de CEP (ViaCEP)
const { fetchAddress, isLoading: isLoadingCep, error: cepError } = useCep()
const numberInputRef = ref<HTMLInputElement | null>(null)

async function onCepInput(e: Event) {
  const input = e.target as HTMLInputElement
  formAddress.value.cep = formatCep(input.value)

  const rawDigits = sanitizeDigits(input.value)
  if (rawDigits.length === 8) {
    const data = await fetchAddress(rawDigits)
    if (data) {
      formAddress.value.street = data.logradouro
      formAddress.value.neighborhood = data.bairro
      formAddress.value.city = data.localidade
      await nextTick()
      numberInputRef.value?.focus()
    }
  }
}

function onCepBlur() {
  const rawDigits = sanitizeDigits(formAddress.value.cep || '')
  if (rawDigits.length > 0 && rawDigits.length < 8) {
    cepError.value = 'CEP incompleto (deve ter 8 dígitos)'
  }
}

// 7. Cálculos Financeiros
const subtotal = computed(() => {
  return props.items.reduce((sum, item) => sum + getItemPrice(item), 0)
})

const deliveryFee = computed(() => {
  if (form.value.deliveryType === 'delivery') {
    return props.tenant.deliveryFee || 0
  }
  return 0
})

const orderTotal = computed(() => {
  return subtotal.value + deliveryFee.value
})

const isFormValid = computed(() => {
  if (props.items.length === 0) return false
  if (!form.value.customerName.trim()) return false
  if (form.value.deliveryType === 'delivery') {
    if (!formAddress.value.street?.trim()) return false
    if (!formAddress.value.number?.trim()) return false
    if (!formAddress.value.neighborhood?.trim()) return false
  }
  return true
})

// 8. Despacho no WhatsApp
function handleSendWhatsApp() {
  if (!isFormValid.value) return

  const cartState = {
    items: props.items,
    customerName: form.value.customerName,
    customerPhone: form.value.customerPhone,
    deliveryType: form.value.deliveryType,
    address: formAddress.value,
    paymentMethod: form.value.paymentMethod,
    changeFor: form.value.changeFor,
    subtotal: subtotal.value,
    deliveryFee: deliveryFee.value,
    total: orderTotal.value
  }

  // Sincronização assíncrona não-bloqueante no backend NestJS/PostgreSQL
  try {
    const { createOrder } = useApiClient()
    createOrder({
      tenantSlug: props.tenant.slug,
      customerName: form.value.customerName,
      customerPhone: form.value.customerPhone,
      deliveryType: form.value.deliveryType === 'takeaway' ? 'pickup' : (form.value.deliveryType as 'delivery' | 'pickup'),
      address: form.value.deliveryType === 'delivery' ? formAddress.value : undefined,
      items: props.items.map(item => ({
        productId: item.product?.id || 'prod',
        productName: item.product?.name || 'Produto',
        quantity: item.quantity || 1,
        unitPriceCents: Math.round((item.product?.price || 0) * 100),
        options: getCartItemOptions(item).map(o => ({
          id: o.id,
          name: o.name,
          priceCents: Math.round((o.price || 0) * 100)
        })),
        observation: getCartItemNotes(item) || undefined
      })),
      paymentMethod: form.value.paymentMethod as any,
      isTestCent: isTestCentMode.value
    }).catch(() => {})
  } catch {}

  const url = generateWhatsAppOrderUrl(props.tenant, cartState as any)
  if (import.meta.client) {
    window.open(url, '_blank')
    emit('clear-cart')
    emit('close')
  }
}

function handleClearCart() {
  emit('clear-cart')
}
</script>
