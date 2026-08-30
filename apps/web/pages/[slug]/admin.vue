<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
    <ClientOnly>
      <!-- 1. Tela de Login por PIN -->
      <div v-if="!isAuthenticated" class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div class="text-center space-y-2">
            <div class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl mx-auto flex items-center justify-center text-2xl font-bold">
              ⚡
            </div>
            <h1 class="text-xl font-bold text-white tracking-tight">Painel do Lojista</h1>
            <p class="text-sm text-slate-400">Digite seu PIN de acesso para gerenciar sua loja</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label for="admin-pin" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                PIN da Loja (Padrão: 1234)
              </label>
              <input
                id="admin-pin"
                v-model="pinInput"
                type="password"
                maxlength="8"
                inputmode="numeric"
                placeholder="••••"
                class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-white outline-none transition-all"
                autofocus
              />
            </div>

            <div v-if="errorMessage" class="text-xs text-rose-400 text-center font-medium bg-rose-500/10 border border-rose-500/20 py-2 rounded-lg">
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              class="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Entrar no Painel
            </button>
          </form>

          <div class="text-center">
            <NuxtLink :to="`/${slug}`" class="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Voltar para a vitrine
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 2. Painel Operacional Ativo -->
      <div v-else class="max-w-2xl mx-auto pb-24">
        <!-- Header Superior Fixo -->
        <header class="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <NuxtLink :to="`/${slug}`" class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors" title="Ver vitrine">
              ←
            </NuxtLink>
            <div>
              <h1 class="text-sm font-bold text-white leading-tight flex items-center gap-2">
                {{ tenant?.name || 'Gestão da Loja' }}
                <span class="w-2 h-2 rounded-full" :class="isEmergencyClosed ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse'"></span>
              </h1>
              <p class="text-[11px] text-slate-400">
                {{ isServiceStore ? '💈 Modo Gestão de Serviços & Agenda' : '🍔 Modo Gestão de Delivery & Cardápio' }}
              </p>
            </div>
          </div>

          <button
            @click="logout"
            class="text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Sair
          </button>
        </header>

        <!-- Navegação em Abas Operacionais -->
        <nav class="px-4 pt-4 flex gap-2 overflow-x-auto no-scrollbar pb-2" role="tablist">
          <button
            @click="activeTab = 'catalog'"
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            :class="activeTab === 'catalog' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'"
          >
            {{ isServiceStore ? '✂️ Serviços & Preços' : '⚡ Cardápio & Preços' }}
          </button>

          <button
            v-if="isServiceStore"
            @click="activeTab = 'agenda'"
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            :class="activeTab === 'agenda' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'"
          >
            📅 Agenda & Bloqueios
          </button>

          <button
            @click="activeTab = 'hours'"
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            :class="activeTab === 'hours' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'"
          >
            🕒 Horários & Pausa
          </button>

          <button
            v-if="!isServiceStore"
            @click="activeTab = 'delivery'"
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            :class="activeTab === 'delivery' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'"
          >
            🛵 Delivery & Taxas
          </button>

          <button
            @click="activeTab = 'announcement'"
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            :class="activeTab === 'announcement' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'"
          >
            📢 Comunicado
          </button>
        </nav>

        <!-- ABA 1: Catálogo e Serviços (Pausa e Edição de Preços) -->
        <main v-if="activeTab === 'catalog'" class="px-4 mt-4 space-y-6">
          <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-start gap-3">
            <span class="text-lg">⚡</span>
            <div class="text-xs">
              <p class="font-bold text-emerald-400">Pausa Rápida & Preços em Tempo Real</p>
              <p class="text-slate-300 mt-0.5">Ligue ou desligue itens esgotados e edite preços sem precisar fazer deploy.</p>
            </div>
          </div>

          <section v-for="category in categories" :key="category.id" class="space-y-3">
            <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span>{{ category.name }}</span>
              <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{{ (category.products || []).length }}</span>
            </h2>

            <div class="space-y-2">
              <div
                v-for="product in (category.products || [])"
                :key="product.id"
                class="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between gap-4 transition-all"
                :class="{ 'opacity-60 bg-slate-950/40 border-dashed': !product.isAvailable }"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-semibold text-white truncate">{{ product.name }}</h3>
                    <span
                      class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                      :class="product.isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
                    >
                      {{ product.isAvailable ? 'Ativo' : 'Esgotado' }}
                    </span>
                  </div>

                  <div class="flex items-center gap-3 mt-1.5">
                    <button
                      @click="openPriceModal(category.products, product)"
                      class="text-xs text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md cursor-pointer"
                      title="Editar preço"
                    >
                      <span>✏️ R$ {{ Number(product.price).toFixed(2).replace('.', ',') }}</span>
                    </button>

                    <span v-if="product.durationMinutes" class="text-[11px] text-slate-400">
                      ⏱️ {{ product.durationMinutes }}min
                    </span>
                  </div>
                </div>

                <!-- Switch Acessível W3C / WCAG -->
                <button
                  type="button"
                  role="switch"
                  :aria-checked="product.isAvailable"
                  :aria-label="`Alternar disponibilidade de ${product.name}`"
                  @click="toggleProduct(category.products, product.id, product.isAvailable)"
                  class="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                  :class="product.isAvailable ? 'bg-emerald-500' : 'bg-slate-800'"
                >
                  <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                    :class="product.isAvailable ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </section>
        </main>

        <!-- ABA 2: Agenda & Bloqueios (Exclusivo Hub & Pro) -->
        <main v-else-if="activeTab === 'agenda' && isServiceStore" class="px-4 mt-4 space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>📅 Bloqueio Rápido de Horários (Folga / Intervalo)</span>
            </h2>
            <p class="text-xs text-slate-400">
              Precisa tirar um intervalo ou bloquear um horário específico? Selecione o horário para desabilitá-lo na vitrine de agendamentos.
            </p>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1.5">Data:</label>
              <input
                type="date"
                v-model="selectedAgendaDate"
                class="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div class="grid grid-cols-4 gap-2 pt-2">
              <button
                v-for="time in sampleSlots"
                :key="time"
                @click="toggleBlockSlot(selectedAgendaDate, time)"
                class="py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center justify-center gap-0.5"
                :class="isSlotBlocked(selectedAgendaDate, time) ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-emerald-500'"
              >
                <span>{{ time }}</span>
                <span class="text-[9px] uppercase tracking-wider font-extrabold" :class="isSlotBlocked(selectedAgendaDate, time) ? 'text-rose-500' : 'text-emerald-400'">
                  {{ isSlotBlocked(selectedAgendaDate, time) ? 'Bloqueado' : 'Livre' }}
                </span>
              </button>
            </div>
          </div>
        </main>

        <!-- ABA 3: Horários & Pausa de Emergência -->
        <main v-else-if="activeTab === 'hours'" class="px-4 mt-4 space-y-6">
          <!-- Botão de Pausa Emergencial -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>🛑 Pausa Geral de Atendimento</span>
            </h2>
            <p class="text-xs text-slate-400">
              Cozinha lotada, chuva forte ou folga inesperada? Pause todo o atendimento da loja com um clique.
            </p>

            <button
              @click="toggleEmergencyPause"
              class="w-full py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-lg"
              :class="isEmergencyClosed ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-rose-600 text-white hover:bg-rose-700'"
            >
              {{ isEmergencyClosed ? '🟢 Reabrir Atendimento Agora' : '🛑 Pausar Atendimento da Loja Agora' }}
            </button>
          </div>

          <!-- Ajuste de Horário de Funcionamento -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>🕒 Horário de Atendimento Padrão</span>
            </h2>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-slate-400 font-semibold mb-1">Abre às:</label>
                <input
                  type="time"
                  v-model="openTimeInput"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-400 font-semibold mb-1">Fecha às:</label>
                <input
                  type="time"
                  v-model="closeTimeInput"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              @click="saveOpeningHours"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
            >
              Salvar Horários
            </button>
          </div>
        </main>

        <!-- ABA 4: Delivery & Taxas (Menu e Shop) -->
        <main v-else-if="activeTab === 'delivery' && !isServiceStore" class="px-4 mt-4 space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>🛵 Configurações de Entrega & Pedido</span>
            </h2>

            <div class="space-y-4 text-xs">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Taxa de Entrega Padrão (R$):</label>
                <input
                  type="number"
                  step="0.50"
                  v-model.number="deliveryFeeInput"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label class="block text-slate-400 font-semibold mb-1">Pedido Mínimo (R$):</label>
                <input
                  type="number"
                  step="5.00"
                  v-model.number="minOrderInput"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label class="block text-slate-400 font-semibold mb-1">Tempo Estimado de Espera (ex: 35-50 min):</label>
                <input
                  type="text"
                  v-model="estimatedTimeInput"
                  placeholder="35-50 min"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              @click="saveDeliveryConfig"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
            >
              Atualizar Delivery
            </button>
          </div>
        </main>

        <!-- ABA 5: Comunicado / Banner de Recado -->
        <main v-else-if="activeTab === 'announcement'" class="px-4 mt-4 space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>📢 Banner de Comunicado no Topo da Vitrine</span>
            </h2>
            <p class="text-xs text-slate-400">
              Divulgue avisos importantes, folgas ou promoções diretamente no topo do cardápio para todos os clientes.
            </p>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span class="text-xs font-bold text-slate-300">Exibir Banner de Comunicado:</span>
              <button
                type="button"
                role="switch"
                :aria-checked="announcementEnabled"
                @click="announcementEnabled = !announcementEnabled"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
                :class="announcementEnabled ? 'bg-emerald-500' : 'bg-slate-800'"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
                  :class="announcementEnabled ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>

            <div v-if="announcementEnabled">
              <label class="block text-xs text-slate-400 font-semibold mb-1">Mensagem do Comunicado:</label>
              <textarea
                v-model="announcementMessage"
                rows="3"
                placeholder="Ex: ⚠️ Hoje estamos atendendo exclusivamente com retirada no balcão!"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 leading-relaxed"
              ></textarea>
            </div>

            <button
              @click="saveAnnouncementConfig"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
            >
              Salvar Comunicado
            </button>
          </div>
        </main>

        <!-- Modal de Edição Rápida de Preço -->
        <Teleport to="body">
          <div v-if="isPriceModalOpen" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h3 class="text-sm font-bold text-white">Editar Preço: {{ editingProduct?.name }}</h3>
              
              <div>
                <label class="block text-xs text-slate-400 mb-1 font-semibold">Novo Preço (R$):</label>
                <input
                  type="number"
                  step="0.10"
                  v-model.number="newPriceInput"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-lg font-mono font-bold text-white outline-none focus:border-emerald-500"
                  autofocus
                />
              </div>

              <div class="flex gap-2 pt-2">
                <button
                  @click="isPriceModalOpen = false"
                  class="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  @click="confirmPriceEdit"
                  class="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </Teleport>
      </div>

      <!-- Fallback SSR / Loading -->
      <template #fallback>
        <div class="min-h-screen flex items-center justify-center p-4">
          <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useMerchantAdmin } from '~/composables/useMerchantAdmin'
import type { Product, Category } from '@alaska/contracts'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const { tenant } = useTenant(slug)
const {
  isAuthenticated,
  errorMessage,
  login,
  logout,
  getOverrides,
  applyOverridesToCategories,
  toggleProductAvailability,
  updateProductPrice,
  updateHours,
  updateDelivery,
  updateAnnouncement,
  updateEmergency,
  toggleBlockSlot
} = useMerchantAdmin(slug.value)

const pinInput = ref('')
const activeTab = ref<'catalog' | 'agenda' | 'hours' | 'delivery' | 'announcement'>('catalog')

// Identifica se a loja é de serviços/agendamento
const isServiceStore = computed(() => {
  const cat = (tenant.value as any)?.businessCategory || (tenant.value as any)?.category || (tenant.value as any)?.template
  return cat === 'hub' || cat === 'pro' || slug.value === 'barbearia-style' || slug.value === 'clinica-sorriso'
})

const categories = computed<Category[]>(() => {
  return (tenant.value?.categories || []) as Category[]
})

watchEffect(() => {
  if (categories.value.length > 0) {
    applyOverridesToCategories(categories.value)
  }
})

function handleLogin() {
  login(pinInput.value)
  pinInput.value = ''
}

function toggleProduct(products: Product[], productId: string, currentStatus: boolean) {
  toggleProductAvailability(products, productId, currentStatus)
}

// 1. Edição de Preço
const isPriceModalOpen = ref(false)
const editingProduct = ref<Product | null>(null)
const editingProductsList = ref<Product[]>([])
const newPriceInput = ref<number>(0)

function openPriceModal(products: Product[], product: Product) {
  editingProduct.value = product
  editingProductsList.value = products
  newPriceInput.value = Number(product.price)
  isPriceModalOpen.value = true
}

async function confirmPriceEdit() {
  if (editingProduct.value && newPriceInput.value > 0) {
    await updateProductPrice(editingProductsList.value, editingProduct.value.id, newPriceInput.value)
  }
  isPriceModalOpen.value = false
}

// 2. Horários & Emergência
const openTimeInput = ref(tenant.value?.openingHours?.open || '09:00')
const closeTimeInput = ref(tenant.value?.openingHours?.close || '20:00')
const isEmergencyClosed = ref(false)

function saveOpeningHours() {
  updateHours(openTimeInput.value, closeTimeInput.value)
}

function toggleEmergencyPause() {
  isEmergencyClosed.value = !isEmergencyClosed.value
  updateEmergency(isEmergencyClosed.value, isEmergencyClosed.value ? 'Atendimento pausado temporariamente' : '')
}

// 3. Delivery & Taxas
const deliveryFeeInput = ref((tenant.value as any)?.deliveryFee || 6.0)
const minOrderInput = ref((tenant.value as any)?.minOrderValue || 20.0)
const estimatedTimeInput = ref('35-50 min')

function saveDeliveryConfig() {
  updateDelivery(deliveryFeeInput.value, minOrderInput.value, estimatedTimeInput.value)
}

// 4. Comunicado
const announcementEnabled = ref(false)
const announcementMessage = ref('')

function saveAnnouncementConfig() {
  updateAnnouncement(announcementEnabled.value, announcementMessage.value)
}

// 5. Agenda & Bloqueios
const selectedAgendaDate = ref(new Date().toISOString().split('T')[0])
const sampleSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

function isSlotBlocked(date: string, time: string): boolean {
  const overrides = getOverrides()
  const slots = overrides.blockedSlots || []
  return slots.some(s => s.date === date && s.time === time)
}
</script>
