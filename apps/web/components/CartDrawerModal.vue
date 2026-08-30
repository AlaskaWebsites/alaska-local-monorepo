<!-- components/CartDrawerModal.vue -->
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden flex justify-end" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <!-- Backdrop Escuro com Blur -->
      <div @click="$emit('close')" class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"></div>

      <!-- Gaveta Lateral Deslizante -->
      <aside class="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slide-in-right overflow-y-auto">
        <!-- 1. Header da Sacola -->
        <div class="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div class="flex items-center gap-2.5">
            <ShoppingCart class="w-5 h-5 text-slate-800" />
            <h2 id="cart-title" class="text-lg font-extrabold text-slate-900">Sua Sacola</h2>
            <span class="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {{ items.length }} {{ items.length === 1 ? 'item' : 'itens' }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="items.length > 0"
              @click="$emit('clear-cart')"
              class="text-xs text-slate-400 hover:text-rose-500 font-semibold p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              title="Limpar sacola"
            >
              <Trash2 class="w-4 h-4" />
            </button>
            <button
              @click="$emit('close')"
              class="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Fechar sacola"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- 2. Conteúdo da Sacola (Vazia ou Lista de Itens) -->
        <div class="flex-1 p-5 space-y-6">
          <!-- Alerta de Loja Fechada / Pausada -->
          <div v-if="!isStoreOpen" class="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center space-y-1">
            <div class="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-700">
              <AlertCircle class="w-4 h-4" />
              <span>{{ isEmergencyClosed ? 'Atendimento Pausado pela Loja' : 'Loja Fechada no Momento' }}</span>
            </div>
            <p class="text-[11px] text-rose-600">
              {{ isEmergencyClosed ? 'O estabelecimento pausou os pedidos temporariamente.' : 'Fora do horário de atendimento. Volte mais tarde para enviar seu pedido.' }}
            </p>
          </div>

          <div v-if="items.length === 0" class="h-64 flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3 text-slate-400">
              🛒
            </div>
            <p class="text-sm font-bold text-slate-700">Sua sacola está vazia</p>
            <p class="text-xs text-slate-400 mt-1">Adicione itens deliciosos para começar seu pedido.</p>
          </div>

          <div v-else class="space-y-4">
            <!-- Lista de Produtos -->
            <div
              v-for="(item, idx) in items"
              :key="idx"
              class="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 shadow-2xs"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    {{ item.quantity }}x
                  </span>
                  <h4 class="font-bold text-sm text-slate-900 truncate">
                    {{ item.product?.name || item.name }}
                  </h4>
                </div>

                <!-- Opcionais Selecionados (se houver) -->
                <ul v-if="Array.isArray(item.options) && item.options.length > 0" class="text-[11px] text-slate-500 space-y-0.5 mt-1.5">
                  <li v-for="(opt, optIdx) in item.options" :key="optIdx" class="flex justify-between">
                    <span>+ {{ opt.name || opt.label }}</span>
                    <span v-if="opt.price" class="font-mono font-semibold text-slate-700">+ {{ formatCurrency(opt.price) }}</span>
                  </li>
                </ul>

                <p v-if="item.observations || item.notes || item.observation" class="text-xs text-slate-500 italic mt-2 bg-white p-2 rounded-lg border border-slate-100">
                  Obs: "{{ item.observations || item.notes || item.observation }}"
                </p>

                <p class="text-xs font-extrabold text-slate-900 font-mono mt-2">
                  {{ formatCurrency((item.unitPrice || item.product?.price || 0) * (item.quantity || 1)) }}
                </p>
              </div>

              <button
                @click="$emit('remove-item', idx)"
                class="text-slate-300 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                title="Remover item"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <!-- Dados de Entrega e Checkout -->
            <div class="pt-4 border-t border-slate-100 space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Dados para Entrega & Contato</h3>

              <!-- Seleção Tipo de Entrega -->
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="deliveryType = 'delivery'"
                  class="py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer"
                  :class="deliveryType === 'delivery' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'"
                >
                  <Truck class="w-3.5 h-3.5" />
                  <span>Entrega</span>
                </button>
                <button
                  type="button"
                  @click="deliveryType = 'pickup'"
                  class="py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer"
                  :class="deliveryType === 'pickup' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'"
                >
                  <ShoppingBag class="w-3.5 h-3.5" />
                  <span>Retirada</span>
                </button>
              </div>

              <!-- Inputs do Cliente -->
              <div class="space-y-2 text-xs">
                <input
                  v-model="customerName"
                  type="text"
                  placeholder="Seu Nome Completo *"
                  class="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl p-3 outline-none"
                />

                <input
                  v-model="customerPhone"
                  type="tel"
                  placeholder="WhatsApp com DDD (ex: 11999998888) *"
                  class="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl p-3 outline-none"
                />

                <div v-if="deliveryType === 'delivery'" class="space-y-2">
                  <input
                    v-model="addressCep"
                    type="text"
                    placeholder="CEP (opcional)"
                    class="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl p-3 outline-none"
                  />
                  <div class="grid grid-cols-3 gap-2">
                    <input
                      v-model="addressStreet"
                      type="text"
                      placeholder="Rua / Avenida *"
                      class="col-span-2 bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl p-3 outline-none"
                    />
                    <input
                      v-model="addressNumber"
                      type="text"
                      placeholder="Nº *"
                      class="bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl p-3 outline-none"
                    />
                  </div>
                  <input
                    v-model="addressNeighborhood"
                    type="text"
                    placeholder="Bairro *"
                    class="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl p-3 outline-none"
                  />
                  <input
                    v-model="addressComplement"
                    type="text"
                    placeholder="Complemento (Apto, Bloco)"
                    class="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl p-3 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Footer com Totais e Botão de Enviar Pedido -->
        <div v-if="items.length > 0" class="p-5 border-t border-slate-100 bg-slate-50/80 space-y-3 sticky bottom-0">
          <div class="space-y-1.5 text-xs text-slate-600">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="font-bold text-slate-900 font-mono">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div v-if="deliveryType === 'delivery'" class="flex justify-between">
              <span>Taxa de Entrega</span>
              <span class="font-bold text-slate-900 font-mono">{{ formatCurrency(effectiveDeliveryFee) }}</span>
            </div>
            <div class="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total do Pedido</span>
              <span class="text-emerald-600 font-mono">{{ formatCurrency(total) }}</span>
            </div>
          </div>

          <!-- Botão Enviar Pedido (com bloqueio rígido se loja fechada/pausada) -->
          <button
            @click="handleSendWhatsApp"
            :disabled="!isFormValid || !isStoreOpen"
            class="w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all"
            :class="!isStoreOpen
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : isFormValid
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
          >
            <Send v-if="isStoreOpen" class="w-4 h-4" />
            <span>{{ !isStoreOpen ? 'Loja Fechada • Pedidos Desabilitados' : 'Enviar Pedido pelo WhatsApp' }}</span>
          </button>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOpeningHours } from '~/composables/useOpeningHours'
import { formatCurrency } from '~/utils/formatters'
import { ShoppingCart, Trash2, X, Truck, ShoppingBag, Send, AlertCircle } from 'lucide-vue-next'
import type { CartItem, Tenant } from '~/types'

const props = defineProps<{
  isOpen: boolean
  tenant: Tenant
  items: CartItem[]
}>()

const emit = defineEmits(['close', 'remove-item', 'clear-cart'])

// Status de Abertura e Pausa
const { isOpen: isStoreOpen } = useOpeningHours(computed(() => props.tenant))
const isEmergencyClosed = computed(() => Boolean((props.tenant as any)?.isEmergencyClosed))

const deliveryType = ref<'delivery' | 'pickup'>('delivery')
const customerName = ref('')
const customerPhone = ref('')
const addressCep = ref('')
const addressStreet = ref('')
const addressNumber = ref('')
const addressNeighborhood = ref('')
const addressComplement = ref('')

const effectiveDeliveryFee = computed(() => {
  if (deliveryType.value === 'pickup') return 0
  return Number((props.tenant as any)?.deliveryFee || 0)
})

const subtotal = computed(() => {
  return props.items.reduce((acc, item) => {
    const price = item.unitPrice || item.product?.price || 0
    return acc + price * (item.quantity || 1)
  }, 0)
})

const total = computed(() => {
  return subtotal.value + effectiveDeliveryFee.value
})

const isFormValid = computed(() => {
  if (!customerName.value.trim() || !customerPhone.value.trim()) return false
  if (deliveryType.value === 'delivery') {
    return !!(addressStreet.value.trim() && addressNumber.value.trim() && addressNeighborhood.value.trim())
  }
  return true
})

function handleSendWhatsApp() {
  if (!isStoreOpen.value || !isFormValid.value) return

  const cleanPhone = (props.tenant.phoneWhatsApp || props.tenant.phone || '').replace(/\D/g, '')
  
  let msg = `*🛍️ NOVO PEDIDO - ${props.tenant.name}*\n\n`
  msg += `*Cliente:* ${customerName.value.trim()}\n`
  msg += `*Telefone:* ${customerPhone.value.trim()}\n`
  msg += `*Tipo:* ${deliveryType.value === 'delivery' ? '🛵 Entrega' : '🏪 Retirada no Balcão'}\n`

  if (deliveryType.value === 'delivery') {
    msg += `*Endereço:* ${addressStreet.value.trim()}, ${addressNumber.value.trim()}`
    if (addressComplement.value.trim()) msg += ` (${addressComplement.value.trim()})`
    msg += ` - ${addressNeighborhood.value.trim()}\n`
    if (addressCep.value.trim()) msg += `*CEP:* ${addressCep.value.trim()}\n`
  }

  msg += `\n*ITENS DO PEDIDO:*\n`
  props.items.forEach((item, idx) => {
    const itemName = item.product?.name || item.name || 'Produto'
    const unitPrice = item.unitPrice || item.product?.price || 0
    msg += `${idx + 1}. ${item.quantity}x *${itemName}* - ${formatCurrency(unitPrice * (item.quantity || 1))}\n`
    if (Array.isArray(item.options)) {
      item.options.forEach((opt: any) => {
        msg += `   + ${opt.name || opt.label}`
        if (opt.price) msg += ` (${formatCurrency(opt.price)})`
        msg += `\n`
      })
    }
    const obs = item.observations || item.notes || item.observation
    if (obs) msg += `   _Obs: ${obs}_\n`
  })

  msg += `\n*Subtotal:* ${formatCurrency(subtotal.value)}\n`
  if (deliveryType.value === 'delivery') {
    msg += `*Taxa de Entrega:* ${formatCurrency(effectiveDeliveryFee.value)}\n`
  }
  msg += `*TOTAL:* ${formatCurrency(total.value)}\n\n`
  msg += `_Pedido gerado via Alaska Local_`

  const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`
  if (typeof window !== 'undefined') {
    window.open(url, '_blank')
  }
}
</script>
