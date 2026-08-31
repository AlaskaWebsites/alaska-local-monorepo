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

          <!-- 2. Conteúdo da Sacola (Scrollável) -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            <!-- Estado Vazio -->
            <div
              v-if="items.length === 0"
              class="h-full flex flex-col items-center justify-center text-center p-6 space-y-3"
            >
              <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag class="w-8 h-8 stroke-[1.5]" aria-hidden="true" />
              </div>
              <h3 class="text-sm font-bold text-slate-900">Sua sacola está vazia</h3>
              <p class="text-xs text-slate-500 max-w-xs leading-relaxed">
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
                    <span v-if="opt.price > 0" class="font-mono text-slate-600">
                      {{ formatCurrency(opt.price) }}
                    </span>
                  </p>
                </div>

                <!-- Observação do Item -->
                <p
                  v-if="getCartItemNotes(item)"
                  class="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 italic mt-1"
                >
                  Obs: "{{ getCartItemNotes(item) }}"
                </p>
              </div>

              <!-- Formulário de Checkout Integrado -->
              <form @submit.prevent="handleSubmitOrder" class="space-y-5 pt-4 border-t border-slate-200">
                <!-- 1. Tipo de Entrega -->
                <div class="space-y-2">
                  <label class="block text-xs font-bold text-slate-900">
                    Como deseja receber?
                  </label>
                  <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de entrega">
                    <button
                      type="button"
                      role="radio"
                      :aria-checked="form.deliveryType === 'delivery'"
                      @click="form.deliveryType = 'delivery'"
                      class="p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer select-none"
                      :class="form.deliveryType === 'delivery' ? [themeClasses.primaryBorder, 'bg-emerald-50/60', themeClasses.primaryText, 'shadow-2xs'] : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
                    >
                      <Truck class="w-4 h-4" aria-hidden="true" />
                      <span>Delivery</span>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      :aria-checked="form.deliveryType === 'pickup'"
                      @click="form.deliveryType = 'pickup'"
                      class="p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer select-none"
                      :class="form.deliveryType === 'pickup' ? [themeClasses.primaryBorder, 'bg-emerald-50/60', themeClasses.primaryText, 'shadow-2xs'] : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
                    >
                      <Store class="w-4 h-4" aria-hidden="true" />
                      <span>Retirada</span>
                    </button>
                  </div>
                </div>

                <!-- 2. Dados Pessoais do Cliente -->
                <div class="space-y-3">
                  <div>
                    <label for="checkout-name" class="block text-xs font-bold text-slate-900 mb-1">
                      Seu Nome Completo *
                    </label>
                    <input
                      id="checkout-name"
                      v-model="form.customerName"
                      type="text"
                      required
                      placeholder="Ex: Danilo Santos"
                      class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label for="checkout-phone" class="block text-xs font-bold text-slate-900 mb-1">
                      WhatsApp para Contato *
                    </label>
                    <input
                      id="checkout-phone"
                      v-model="form.customerPhone"
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <!-- 3. Endereço de Entrega (Apenas Delivery) com ViaCEP -->
                <div v-if="form.deliveryType === 'delivery'" class="space-y-3 pt-1 border-t border-slate-100">
                  <div class="flex items-center justify-between">
                    <label for="checkout-cep" class="block text-xs font-bold text-slate-900">
                      Endereço de Entrega
                    </label>
                    <span v-if="cepLoading" class="text-[11px] text-emerald-600 font-semibold animate-pulse">
                      Buscando CEP...
                    </span>
                  </div>

                  <div class="grid grid-cols-3 gap-2">
                    <div class="col-span-1">
                      <input
                        id="checkout-cep"
                        v-model="cepInput"
                        type="text"
                        maxlength="9"
                        placeholder="CEP (opcional)"
                        class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <div class="col-span-2">
                      <input
                        id="checkout-street"
                        v-model="form.address.street"
                        type="text"
                        required
                        placeholder="Rua / Avenida *"
                        class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-2">
                    <div class="col-span-1">
                      <input
                        id="checkout-number"
                        ref="numberInputRef"
                        v-model="form.address.number"
                        type="text"
                        required
                        placeholder="Número *"
                        class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div class="col-span-2">
                      <input
                        id="checkout-neighborhood"
                        v-model="form.address.neighborhood"
                        type="text"
                        required
                        placeholder="Bairro *"
                        class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <input
                      id="checkout-complement"
                      v-model="form.address.complement"
                      type="text"
                      placeholder="Complemento (Apto, Bloco)"
                      class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500"
                    />
                    <input
                      id="checkout-reference"
                      v-model="form.address.reference"
                      type="text"
                      placeholder="Ponto de Referência"
                      class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <!-- 4. Forma de Pagamento -->
                <div class="space-y-2 pt-1 border-t border-slate-100">
                  <label class="block text-xs font-bold text-slate-900">
                    Forma de Pagamento
                  </label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      v-for="method in paymentMethods"
                      :key="method"
                      type="button"
                      @click="form.paymentMethod = method"
                      class="p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer select-none"
                      :class="form.paymentMethod === method ? [themeClasses.primaryBorder, 'bg-emerald-50/60', themeClasses.primaryText, 'font-bold shadow-2xs'] : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
                    >
                      <span class="text-sm">
                        {{ method === 'Pix' ? '💠' : method === 'Dinheiro' ? '💵' : '💳' }}
                      </span>
                      <span class="truncate">{{ method }}</span>
                    </button>
                  </div>

                  <!-- Troco para Dinheiro -->
                  <div v-if="form.paymentMethod === 'Dinheiro'" class="pt-2">
                    <label for="checkout-change" class="block text-[11px] font-semibold text-slate-600 mb-1">
                      Precisa de troco para quanto?
                    </label>
                    <input
                      id="checkout-change"
                      v-model.number="form.changeFor"
                      type="number"
                      step="5"
                      :min="finalTotal"
                      :placeholder="`Ex: R$ ${(Math.ceil(finalTotal / 10) * 10).toFixed(2)}`"
                      class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <!-- Bloco Pix Copia e Cola / QR Code Direto -->
                  <div
                    v-if="form.paymentMethod === 'Pix' && tenantPixConfig"
                    class="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 mt-3 animate-in fade-in duration-200"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <QrCode class="w-4 h-4 text-emerald-600" /> Pix Copia e Cola (D+0)
                      </span>
                      <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Sem Taxas
                      </span>
                    </div>

                    <p class="text-[11px] text-slate-600 leading-relaxed">
                      Pague diretamente na chave <strong>{{ tenantPixConfig.key }}</strong> ({{ tenantPixConfig.keyType }}).
                    </p>

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

                    <span class="text-[10px] text-emerald-800 block italic">
                      💡 Envie o comprovante na conversa do WhatsApp para liberação imediata.
                    </span>
                  </div>
                </div>

                <!-- 5. Observações Gerais do Pedido -->
                <div class="space-y-1">
                  <label for="checkout-notes" class="block text-xs font-bold text-slate-900">
                    Observações do Pedido (opcional)
                  </label>
                  <textarea
                    id="checkout-notes"
                    v-model="form.notes"
                    rows="2"
                    placeholder="Ex: Tocar o interfone 204, deixar na portaria..."
                    class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-emerald-500 transition-all leading-relaxed"
                  ></textarea>
                </div>
              </form>
            </div>
          </div>

          <!-- 3. Rodapé Fixo com Resumo de Valores e Botão de Envio WhatsApp -->
          <div v-if="items.length > 0" class="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3 shrink-0">
            <!-- Linhas de Resumo Financeiro -->
            <div class="space-y-1.5 text-xs text-slate-600">
              <div class="flex justify-between items-center">
                <span>Subtotal dos itens</span>
                <span class="font-mono font-semibold text-slate-900">{{ formatCurrency(subtotal) }}</span>
              </div>
              <div v-if="form.deliveryType === 'delivery'" class="flex justify-between items-center">
                <span>Taxa de entrega</span>
                <span class="font-mono font-semibold text-slate-900">{{ formatCurrency(deliveryFee) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total</span>
                <span class="font-mono text-base" :class="themeClasses.primaryText">
                  {{ formatCurrency(finalTotal) }}
                </span>
              </div>
            </div>

            <!-- Botão de Despacho para o WhatsApp -->
            <button
              type="button"
              @click="handleSubmitOrder"
              :disabled="!isFormValid"
              class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Send class="w-4 h-4" aria-hidden="true" />
              <span>Enviar Pedido para o WhatsApp</span>
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
import { formatCurrency, formatCep, sanitizeDigits } from '~/utils/formatters'
import { generateWhatsAppOrderUrl } from '~/utils/whatsapp'
import { generatePixPayload, getTenantPixConfig } from '~/utils/pix'
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
  Check,
  Copy,
  QrCode,
  ShieldCheck
} from 'lucide-vue-next'
import type { Tenant, CartItem, CheckoutFormData } from '~/types'

const props = withDefaults(
  defineProps<{
    tenant: Tenant
    items?: CartItem[]
    cartItems?: CartItem[]
    isOpen: boolean
  }>(),
  {
    items: () => [],
    cartItems: () => []
  }
)

const items = computed(() => (props.items && props.items.length > 0 ? props.items : props.cartItems || []))

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
    complement: '',
    reference: '',
    city: 'São Paulo',
    state: 'SP'
  },
  paymentMethod: 'Pix',
  changeFor: null,
  notes: ''
})

// 4. Integração ViaCEP
const {
  cepInput,
  loading: cepLoading,
  street: cepStreet,
  neighborhood: cepNeighborhood,
  city: cepCity,
  state: cepState
} = useCep()

const numberInputRef = ref<HTMLInputElement | null>(null)

// Quando o CEP preenche a rua, foca no número da casa
watch(cepStreet, (newStreet) => {
  if (newStreet) {
    form.value.address.street = newStreet
    form.value.address.neighborhood = cepNeighborhood.value
    form.value.address.city = cepCity.value
    form.value.address.state = cepState.value
    nextTick(() => {
      numberInputRef.value?.focus()
    })
  }
})

// 5. Cálculos Financeiros
const subtotal = computed(() => {
  return items.value.reduce((acc, item) => {
    return acc + getItemPrice(item) * (item.quantity || 1)
  }, 0)
})

const deliveryFee = computed(() => {
  if (form.value.deliveryType === 'pickup') return 0
  return Number(props.tenant.deliveryFee || 0)
})

const finalTotal = computed(() => subtotal.value + deliveryFee.value)

const totalItemsCount = computed(() => {
  return items.value.reduce((acc, item) => acc + (item.quantity || 1), 0)
})

function getItemPrice(item: CartItem): number {
  let price = Number(item.unitPrice || item.product?.price || 0)
  return price
}

function getCartItemOptions(item: CartItem): any[] {
  return (item as any).options || (item as any).selectedOptions || []
}

function getCartItemNotes(item: CartItem): string {
  return (item as any).observation || (item as any).notes || ''
}

// 6. Formas de Pagamento e Pix
const paymentMethods = computed(() => {
  return props.tenant.paymentMethods || ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro']
})

const tenantPixConfig = computed(() => {
  return getTenantPixConfig(props.tenant)
})

const isPixCopied = ref(false)

const pixPayload = computed(() => {
  if (!tenantPixConfig.value) return ''
  return generatePixPayload({
    key: tenantPixConfig.value.key,
    beneficiary: tenantPixConfig.value.beneficiary || props.tenant.name,
    city: tenantPixConfig.value.city || 'SAO PAULO',
    amount: finalTotal.value,
    txid: `PED${Date.now().toString().slice(-6)}`
  })
})

function copyPixCode() {
  if (!pixPayload.value) return
  navigator.clipboard.writeText(pixPayload.value)
  isPixCopied.value = true
  setTimeout(() => { isPixCopied.value = false }, 2500)
}

// 7. Validação e Envio do Pedido
const isFormValid = computed(() => {
  if (!form.value.customerName?.trim()) return false
  if (!form.value.customerPhone?.trim()) return false

  if (form.value.deliveryType === 'delivery') {
    const addr = form.value.address
    if (!addr.street?.trim() || !addr.number?.trim() || !addr.neighborhood?.trim()) {
      return false
    }
  }

  return items.value.length > 0
})

function handleClearCart() {
  if (confirm('Deseja esvaziar sua sacola de compras?')) {
    emit('clear-cart')
  }
}

function handleSubmitOrder() {
  if (!isFormValid.value) return

  const cartState = {
    items: items.value,
    deliveryType: form.value.deliveryType,
    deliveryFee: deliveryFee.value,
    customerName: form.value.customerName,
    customerPhone: form.value.customerPhone,
    address: form.value.address,
    paymentMethod: form.value.paymentMethod as any,
    changeFor: form.value.changeFor,
    subtotal: subtotal.value,
    total: finalTotal.value
  }

  const url = generateWhatsAppOrderUrl(props.tenant, cartState)
  window.open(url, '_blank')
  emit('close')
}
</script>
