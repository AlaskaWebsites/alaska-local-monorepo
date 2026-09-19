<!-- components/admin/tabs/AdminOrdersTab.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShoppingBag,
  RotateCw,
  Search,
  Phone,
  MapPin,
  ExternalLink,
  Ban,
  DollarSign,
  ChevronRight
} from 'lucide-vue-next'
import { useOrderDashboard } from '~/composables/useOrderDashboard'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { formatCurrency } from '~/utils/formatters'
import type { OrderStatus, OrderDashboardItem } from '@alaska/contracts'

const props = withDefaults(
  defineProps<{
    storeName?: string
    phoneWhatsApp?: string
    isServiceStore?: boolean
  }>(),
  {
    storeName: 'Estabelecimento',
    phoneWhatsApp: '',
    isServiceStore: false
  }
)

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'hamburgueria-x')
const { tenant } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)

const {
  orders,
  filteredOrders,
  loading,
  searchQuery,
  statusFilter,
  todayOrdersCount,
  todayRevenue,
  todayAverageTicket,
  pendingCount,
  preparingCount,
  dispatchedCount,
  completedCount,
  cancelledCount,
  isAutoRefresh,
  lastUpdated,
  fetchOrders,
  updateOrderStatus,
  generateStatusWhatsAppUrl
} = useOrderDashboard(slug)

const cancellingOrderId = ref<string | null>(null)

function formatTime(dateStr?: string | Date): string {
  if (!dateStr) return '--:--'
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '--:--'
  }
}

function getShortId(id: string): string {
  if (!id) return ''
  return id.replace(/^ord-/, '').slice(-5).toUpperCase()
}

function getStatusBadge(status: OrderStatus): { text: string; bg: string; textCol: string; border: string } {
  switch (status) {
    case 'created':
    case 'pending_payment':
      return {
        text: 'Novo Pedido',
        bg: 'bg-amber-50',
        textCol: 'text-amber-800',
        border: 'border-amber-200'
      }
    case 'confirmed':
      return {
        text: 'Confirmado',
        bg: 'bg-blue-50',
        textCol: 'text-blue-800',
        border: 'border-blue-200'
      }
    case 'preparing':
      return {
        text: 'Em Preparo',
        bg: 'bg-indigo-50',
        textCol: 'text-indigo-800',
        border: 'border-indigo-200'
      }
    case 'dispatched':
      return {
        text: 'Em Rota / Pronto',
        bg: 'bg-cyan-50',
        textCol: 'text-cyan-800',
        border: 'border-cyan-200'
      }
    case 'completed':
      return {
        text: 'Concluído',
        bg: 'bg-emerald-50',
        textCol: 'text-emerald-800',
        border: 'border-emerald-200'
      }
    case 'cancelled':
      return {
        text: 'Cancelado',
        bg: 'bg-slate-100',
        textCol: 'text-slate-500',
        border: 'border-slate-200'
      }
    default:
      return {
        text: status,
        bg: 'bg-slate-50',
        textCol: 'text-slate-700',
        border: 'border-slate-200'
      }
  }
}

async function handleAdvance(order: OrderDashboardItem) {
  let nextStatus: OrderStatus = 'completed'
  if (order.status === 'created' || order.status === 'pending_payment') {
    nextStatus = 'preparing'
  } else if (order.status === 'confirmed' || order.status === 'preparing') {
    nextStatus = 'dispatched'
  } else if (order.status === 'dispatched') {
    nextStatus = 'completed'
  }

  await updateOrderStatus(order.id, nextStatus)
}

function handleOpenWhatsApp(order: OrderDashboardItem) {
  const url = generateStatusWhatsAppUrl(order, order.status, props.storeName)
  if (url && typeof window !== 'undefined') {
    window.open(url, '_blank')
  }
}

async function confirmCancel(orderId: string) {
  await updateOrderStatus(orderId, 'cancelled')
  cancellingOrderId.value = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- 1. Top Metrics Cards (Design System Claro Suave) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Pedidos Hoje -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-1">
        <div class="flex items-center justify-between text-slate-500 text-xs font-semibold">
          <span>Pedidos Hoje</span>
          <Package class="w-4 h-4 text-slate-400" />
        </div>
        <div class="text-2xl font-black text-slate-900 tracking-tight">
          {{ todayOrdersCount }}
        </div>
        <p class="text-[11px] text-slate-500">Total recebidos no dia</p>
      </div>

      <!-- Faturamento Hoje -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-1">
        <div class="flex items-center justify-between text-slate-500 text-xs font-semibold">
          <span>Faturamento</span>
          <DollarSign class="w-4 h-4 text-emerald-600" />
        </div>
        <div class="text-2xl font-black text-emerald-700 tracking-tight">
          {{ formatCurrency(todayRevenue) }}
        </div>
        <p class="text-[11px] text-slate-500">Exclui pedidos cancelados</p>
      </div>

      <!-- Ticket Médio -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-1">
        <div class="flex items-center justify-between text-slate-500 text-xs font-semibold">
          <span>Ticket Médio</span>
          <ShoppingBag class="w-4 h-4 text-blue-500" />
        </div>
        <div class="text-2xl font-black text-slate-900 tracking-tight">
          {{ formatCurrency(todayAverageTicket) }}
        </div>
        <p class="text-[11px] text-slate-500">Média por comanda</p>
      </div>

      <!-- Pedidos Pendentes -->
      <div
        class="border rounded-2xl p-4 shadow-2xs space-y-1 transition-colors"
        :class="pendingCount > 0 ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-slate-200/90'"
      >
        <div class="flex items-center justify-between text-xs font-semibold" :class="pendingCount > 0 ? 'text-amber-800' : 'text-slate-500'">
          <span>Aguardando Ação</span>
          <AlertCircle class="w-4 h-4" :class="pendingCount > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-400'" />
        </div>
        <div class="text-2xl font-black tracking-tight" :class="pendingCount > 0 ? 'text-amber-900' : 'text-slate-900'">
          {{ pendingCount }}
        </div>
        <p class="text-[11px]" :class="pendingCount > 0 ? 'text-amber-700' : 'text-slate-500'">
          {{ pendingCount > 0 ? 'Requer atenção imediata' : 'Tudo em dia' }}
        </p>
      </div>
    </div>

    <!-- 2. Controls & Search Bar -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <!-- Campo de Busca -->
        <div class="relative flex-1">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por cliente, WhatsApp ou #ID..."
            class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>

        <!-- Ações: Atualizar & Auto-Refresh -->
        <div class="flex items-center justify-end gap-3 shrink-0">
          <label class="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
            <input
              v-model="isAutoRefresh"
              type="checkbox"
              class="w-4 h-4 rounded text-slate-900 focus:ring-0 cursor-pointer"
            />
            <span>Auto (15s)</span>
          </label>

          <button
            type="button"
            @click="fetchOrders"
            :disabled="loading"
            class="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      <!-- Chips de Filtro por Status -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
        <button
          type="button"
          @click="statusFilter = 'all'"
          class="px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer"
          :class="statusFilter === 'all' ? [themeClasses.primaryBg, 'text-slate-950 shadow-2xs'] : 'bg-slate-100 text-slate-600 hover:text-slate-900'"
        >
          Todos ({{ orders?.length ?? 0 }})
        </button>

        <button
          type="button"
          @click="statusFilter = 'created'"
          class="px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
          :class="statusFilter === 'created' ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'"
        >
          <span>Novos</span>
          <span v-if="pendingCount > 0" class="px-1.5 py-0.2 bg-amber-600 text-white rounded-full text-[10px]">
            {{ pendingCount }}
          </span>
        </button>

        <button
          type="button"
          @click="statusFilter = 'preparing'"
          class="px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer"
          :class="statusFilter === 'preparing' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'"
        >
          Em Preparo ({{ preparingCount }})
        </button>

        <button
          type="button"
          @click="statusFilter = 'dispatched'"
          class="px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer"
          :class="statusFilter === 'dispatched' ? 'bg-cyan-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'"
        >
          Em Rota ({{ dispatchedCount }})
        </button>

        <button
          type="button"
          @click="statusFilter = 'completed'"
          class="px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer"
          :class="statusFilter === 'completed' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'"
        >
          Concluídos ({{ completedCount }})
        </button>

        <button
          type="button"
          @click="statusFilter = 'cancelled'"
          class="px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer"
          :class="statusFilter === 'cancelled' ? 'bg-slate-700 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'"
        >
          Cancelados ({{ cancelledCount }})
        </button>
      </div>
    </div>

    <!-- 3. Orders Grid / Feed -->
    <div v-if="filteredOrders.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="bg-white border rounded-2xl p-5 shadow-2xs space-y-4 transition-all hover:shadow-xs flex flex-col justify-between"
        :class="order.status === 'created' || order.status === 'pending_payment' ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200/90'"
      >
        <div class="space-y-3.5">
          <!-- Header da Comanda: ID, Hora, Status e Modalidade -->
          <div class="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                #{{ getShortId(order.id) }}
              </span>
              <span class="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Clock class="w-3 h-3 text-slate-400" />
                {{ formatTime(order.createdAt) }}
              </span>
            </div>

            <div class="flex items-center gap-1.5">
              <!-- Modalidade Delivery ou Retirada -->
              <span
                class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                :class="order.deliveryType === 'delivery' ? 'bg-slate-100 text-slate-700' : 'bg-purple-50 text-purple-700 border border-purple-200'"
              >
                <Truck v-if="order.deliveryType === 'delivery'" class="w-2.5 h-2.5" />
                <ShoppingBag v-else class="w-2.5 h-2.5" />
                {{ order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada' }}
              </span>

              <!-- Badge do Status -->
              <span
                class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                :class="[getStatusBadge(order.status).bg, getStatusBadge(order.status).textCol, getStatusBadge(order.status).border]\"
              >
                {{ getStatusBadge(order.status).text }}
              </span>
            </div>
          </div>

          <!-- Informações do Cliente & Endereço -->
          <div class="space-y-1.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900 text-sm">{{ order.customerName }}</span>
              <a
                v-if="order.customerPhone"
                :href="`https://wa.me/55${order.customerPhone.replace(/\D/g, '')}`"
                target="_blank"
                rel="noopener noreferrer"
                class="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md transition-colors"
              >
                <Phone class="w-3 h-3" />
                <span>{{ order.customerPhone }}</span>
              </a>
            </div>

            <!-- Endereço se for entrega -->
            <div v-if="order.deliveryType === 'delivery' && order.address" class="text-slate-600 flex items-start gap-1.5 pt-0.5">
              <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                {{ order.address.street }}, {{ order.address.number }}
                <template v-if="order.address.neighborhood"> — {{ order.address.neighborhood }}</template>
                <template v-if="order.address.complement"> ({{ order.address.complement }})</template>
                <template v-if="order.address.reference"> <br /><span class="text-slate-400 text-[11px]">Ref: {{ order.address.reference }}</span></template>
              </span>
            </div>
          </div>

          <!-- Comanda de Itens -->
          <div class="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-2">
            <div
              v-for="(item, idx) in order.items"
              :key="idx"
              class="text-xs space-y-0.5"
            >
              <div class="flex justify-between items-start">
                <span class="text-slate-800 font-medium">
                  <strong class="font-bold text-slate-900">{{ item.quantity }}x</strong> {{ item.productName }}
                </span>
                <span class="font-mono text-slate-700 text-[11px] shrink-0 ml-2">
                  {{ formatCurrency((item.unitPrice || 0) * item.quantity) }}
                </span>
              </div>

              <!-- Opcionais / Adicionais -->
              <div v-if="item.options && item.options.length > 0" class="pl-5 space-y-0.5 text-[11px] text-slate-500">
                <div v-for="opt in item.options" :key="opt.id || opt.name" class="flex justify-between">
                  <span>+ {{ opt.name }}</span>
                  <span v-if="opt.price && opt.price > 0" class="font-mono">+ {{ formatCurrency(opt.price) }}</span>
                </div>
              </div>

              <!-- Observações do item -->
              <div v-if="item.notes" class="pl-5 text-[11px] text-amber-700 italic">
                Obs: {{ item.notes }}
              </div>
            </div>

            <!-- Observação Geral do Pedido -->
            <div v-if="order.notes" class="pt-1.5 border-t border-slate-200/60 text-[11px] text-amber-800 font-medium flex items-start gap-1">
              <span>⚠️</span>
              <span>Obs geral: {{ order.notes }}</span>
            </div>
          </div>

          <!-- Detalhamento Financeiro & Pagamento -->
          <div class="flex items-center justify-between text-xs pt-1">
            <div class="text-slate-500">
              Pagamento: <strong class="text-slate-800">{{ order.paymentMethod }}</strong>
            </div>

            <div class="text-right">
              <span class="text-slate-500 text-[11px] mr-2" v-if="order.deliveryFee && order.deliveryFee > 0">
                (Frete: {{ formatCurrency(order.deliveryFee) }})
              </span>
              <span class="font-mono text-base font-extrabold" :class="themeClasses.primaryText">
                {{ formatCurrency(order.total) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 4. Quick Action Buttons (1 Toque) -->
        <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <!-- Diálogo de confirmação de cancelamento -->
          <div v-if="cancellingOrderId === order.id" class="w-full flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800">
            <span>Confirmar cancelamento?</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="confirmCancel(order.id)"
                class="px-2.5 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 cursor-pointer"
              >
                Sim, Cancelar
              </button>
              <button
                type="button"
                @click="cancellingOrderId = null"
                class="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Voltar
              </button>
            </div>
          </div>

          <template v-else>
            <!-- Botão WhatsApp com mensagem pré-formatada -->
            <button
              type="button"
              @click="handleOpenWhatsApp(order)"
              class="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Avisar cliente no WhatsApp"
            >
              <Phone class="w-3.5 h-3.5" />
              <span>Avisar no WhatsApp</span>
            </button>

            <div class="flex items-center gap-2">
              <!-- Botão Cancelar se pedido ainda não finalizado -->
              <button
                v-if="order.status !== 'completed' && order.status !== 'cancelled'"
                type="button"
                @click="cancellingOrderId = order.id"
                class="px-2.5 py-2 text-slate-400 hover:text-rose-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                title="Cancelar pedido"
              >
                <Ban class="w-4 h-4" />
              </button>

              <!-- Botão Principal: Avançar Status da Comanda -->
              <button
                v-if="order.status !== 'completed' && order.status !== 'cancelled'"
                type="button"
                @click="handleAdvance(order)"
                class="px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                :class="[
                  order.status === 'created' || order.status === 'pending_payment'
                    ? [themeClasses.buttonPrimary, 'text-white']
                    : order.status === 'preparing' || order.status === 'confirmed'
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                ]"
              >
                <span v-if="order.status === 'created' || order.status === 'pending_payment'">
                  👨‍🍳 Aceitar & Preparar
                </span>
                <span v-else-if="order.status === 'preparing' || order.status === 'confirmed'">
                  {{ order.deliveryType === 'pickup' ? '🛍️ Pronto p/ Retirada' : '🛵 Despachar' }}
                </span>
                <span v-else-if="order.status === 'dispatched'">
                  ✅ Marcar como Entregue
                </span>
                <ChevronRight class="w-3.5 h-3.5" />
              </button>

              <span
                v-else-if="order.status === 'completed'"
                class="text-xs font-bold text-emerald-600 flex items-center gap-1 px-3 py-2 bg-emerald-50 rounded-xl"
              >
                <CheckCircle2 class="w-3.5 h-3.5" />
                <span>Finalizado</span>
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 4. Empty State -->
    <div
      v-else
      class="bg-white border border-slate-200/90 rounded-2xl p-10 text-center space-y-3 shadow-2xs"
    >
      <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
        <Package class="w-6 h-6" />
      </div>
      <div class="space-y-1">
        <h4 class="text-sm font-bold text-slate-800">Nenhum pedido encontrado</h4>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">
          {{ searchQuery ? 'Nenhum pedido coincide com os termos pesquisados.' : 'Não há pedidos registrados nesta categoria de status no momento.' }}
        </p>
      </div>
      <button
        v-if="statusFilter !== 'all' || searchQuery"
        type="button"
        @click="statusFilter = 'all'; searchQuery = ''"
        class="text-xs font-semibold text-slate-600 underline hover:text-slate-900 cursor-pointer pt-1"
      >
        Limpar filtros de busca
      </button>
    </div>
  </div>
</template>
