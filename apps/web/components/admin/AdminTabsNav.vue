<!-- components/admin/AdminTabsNav.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

export type AdminTabKey =
  | 'orders'
  | 'catalog'
  | 'agenda'
  | 'pix_contact'
  | 'hours'
  | 'delivery'
  | 'announcement'
  | 'security'

const props = withDefaults(
  defineProps<{
    modelValue?: AdminTabKey
    activeTab?: AdminTabKey
    isServiceStore?: boolean
    isHealthStore?: boolean
    pendingOrdersCount?: number
  }>(),
  {
    modelValue: undefined,
    activeTab: undefined,
    isServiceStore: false,
    isHealthStore: false,
    pendingOrdersCount: 0
  }
)

const emit = defineEmits<{
  (e: 'update:activeTab', tab: AdminTabKey): void
  (e: 'update:modelValue', tab: AdminTabKey): void
}>()

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'hamburgueria-x')
const { tenant } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)

const currentTab = computed(() => props.activeTab || props.modelValue || 'orders')

const navContainerRef = ref<HTMLElement | null>(null)
const canScrollNavLeft = ref(false)
const canScrollNavRight = ref(false)

function checkNavScroll() {
  const el = navContainerRef.value
  if (!el) return
  canScrollNavLeft.value = el.scrollLeft > 10
  canScrollNavRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 10
}

function scrollNav(direction: 'left' | 'right') {
  const el = navContainerRef.value
  if (!el) return
  const scrollAmount = 200
  el.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
  setTimeout(checkNavScroll, 300)
}

function handleNavWheel(e: WheelEvent) {
  const el = navContainerRef.value
  if (!el) return
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault()
    el.scrollLeft += e.deltaY
    checkNavScroll()
  }
}

function selectTab(tab: AdminTabKey) {
  emit('update:activeTab', tab)
  emit('update:modelValue', tab)
  nextTick(checkNavScroll)
}

onMounted(() => {
  nextTick(checkNavScroll)
  window.addEventListener('resize', checkNavScroll)
  const el = navContainerRef.value
  if (el) {
    el.addEventListener('wheel', handleNavWheel, { passive: false })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkNavScroll)
  const el = navContainerRef.value
  if (el) {
    el.removeEventListener('wheel', handleNavWheel)
  }
})
</script>

<template>
  <div class="relative group">
    <!-- Seta de Rolagem para Esquerda -->
    <button
      v-if="canScrollNavLeft"
      type="button"
      @click="scrollNav('left')"
      class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-full shadow-md flex items-center justify-center text-slate-700 hover:text-slate-950 transition-all cursor-pointer"
      aria-label="Rolar abas para esquerda"
    >
      <ChevronLeft class="w-4 h-4" />
    </button>

    <!-- Barra de Navegação com Rolagem Suave -->
    <div
      ref="navContainerRef"
      @scroll="checkNavScroll"
      class="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1"
      role="tablist"
    >
      <!-- Aba 0: Mural de Pedidos em Tempo Real -->
      <button
        type="button"
        @click="selectTab('orders')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="currentTab === 'orders' ? [themeClasses.primaryBg, 'text-slate-950 shadow-md font-bold'] : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300 shadow-2xs'"
      >
        <span>🛎️ Pedidos</span>
        <span
          v-if="pendingOrdersCount > 0"
          class="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black animate-pulse"
        >
          {{ pendingOrdersCount }}
        </span>
      </button>

      <!-- Aba 1: Catálogo / Cardápio -->
      <button
        type="button"
        @click="selectTab('catalog')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="currentTab === 'catalog' ? [themeClasses.primaryBg, 'text-slate-950 shadow-md font-bold'] : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300 shadow-2xs'"
      >
        <span>{{ isServiceStore ? '📋 Serviços & Itens' : '📋 Cardápio & Preços' }}</span>
      </button>

      <!-- Aba 2: Agenda & Especialistas (Serviços) -->
      <button
        v-if="isServiceStore"
        type="button"
        @click="selectTab('agenda')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="currentTab === 'agenda' ? [themeClasses.primaryBg, 'text-slate-950 shadow-md font-bold'] : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300 shadow-2xs'"
      >
        <span>{{ isHealthStore ? '🩺 Especialistas & Agenda' : '💈 Barbeiros & Agenda' }}</span>
      </button>

      <!-- Aba 3: Pix & Contato -->
      <button
        type="button"
        @click="selectTab('pix_contact')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="currentTab === 'pix_contact' ? [themeClasses.primaryBg, 'text-slate-950 shadow-md font-bold'] : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300 shadow-2xs'"
      >
        <span>💠 Pix & Contato</span>
      </button>

      <!-- Aba 4: Horários & Pausa Geral -->
      <button
        type="button"
        @click="selectTab('hours')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="currentTab === 'hours' ? [themeClasses.primaryBg, 'text-slate-950 shadow-md font-bold'] : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300 shadow-2xs'"
      >
        <span>🕒 Horários & Pausa</span>
      </button>

      <!-- Aba 5: Delivery & Taxas -->
      <button
        v-if="!isServiceStore"
        type="button"
        @click="selectTab('delivery')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="currentTab === 'delivery' ? [themeClasses.primaryBg, 'text-slate-950 shadow-md font-bold'] : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300 shadow-2xs'"
      >
        <span>🛵 Delivery & Taxas</span>
      </button>

      <!-- Aba 6: Comunicado Oficial -->
      <button
        type="button"
        @click="selectTab('announcement')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="currentTab === 'announcement' ? [themeClasses.primaryBg, 'text-slate-950 shadow-md font-bold'] : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300 shadow-2xs'"
      >
        <span>📢 Comunicado</span>
      </button>

      <!-- Aba 7: Segurança & PIN -->
      <button
        type="button"
        @click="selectTab('security')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="currentTab === 'security' ? [themeClasses.primaryBg, 'text-slate-950 shadow-md font-bold'] : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300 shadow-2xs'"
      >
        <span>🔒 PIN & Segurança</span>
      </button>
    </div>

    <!-- Seta de Rolagem para Direita -->
    <button
      v-if="canScrollNavRight"
      type="button"
      @click="scrollNav('right')"
      class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-full shadow-md flex items-center justify-center text-slate-700 hover:text-slate-950 transition-all cursor-pointer"
      aria-label="Rolar abas para direita"
    >
      <ChevronRight class="w-4 h-4" />
    </button>
  </div>
</template>
