<!-- components/admin/AdminTabsNav.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

export type AdminTabKey = 'catalog' | 'agenda' | 'pix_contact' | 'hours' | 'delivery' | 'announcement' | 'security'

const props = defineProps<{
  activeTab: AdminTabKey
  isServiceStore?: boolean
  isHealthStore?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: AdminTabKey): void
}>()

const navContainerRef = ref<HTMLElement | null>(null)
const canScrollNavLeft = ref(false)
const canScrollNavRight = ref(false)

function checkNavScroll() {
  if (!navContainerRef.value) return
  const { scrollLeft, scrollWidth, clientWidth } = navContainerRef.value
  canScrollNavLeft.value = scrollLeft > 8
  canScrollNavRight.value = scrollLeft < scrollWidth - clientWidth - 8
}

function scrollNav(direction: 'left' | 'right') {
  if (!navContainerRef.value) return
  const offset = direction === 'left' ? -220 : 220
  navContainerRef.value.scrollBy({ left: offset, behavior: 'smooth' })
  setTimeout(checkNavScroll, 300)
}

function handleNavWheel(e: WheelEvent) {
  if (!navContainerRef.value) return
  if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
    navContainerRef.value.scrollLeft += e.deltaY
    checkNavScroll()
  }
}

function selectTab(tab: AdminTabKey) {
  emit('update:activeTab', tab)
  nextTick(checkNavScroll)
}

onMounted(() => {
  nextTick(checkNavScroll)
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', checkNavScroll)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkNavScroll)
  }
})
</script>

<template>
  <div class="relative px-4 pt-4">
    <!-- Botão Scroll Esquerda -->
    <button
      v-if="canScrollNavLeft"
      type="button"
      @click="scrollNav('left')"
      class="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-slate-900/95 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg cursor-pointer backdrop-blur-xs active:scale-95"
      aria-label="Rolar abas para a esquerda"
    >
      <ChevronLeft class="w-4 h-4" />
    </button>

    <!-- Fade Gradient Esquerdo -->
    <div
      v-if="canScrollNavLeft"
      class="hidden sm:block pointer-events-none absolute left-4 top-4 bottom-2 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10"
    ></div>

    <!-- Container de Abas -->
    <nav
      ref="navContainerRef"
      @scroll="checkNavScroll"
      @wheel.passive="handleNavWheel"
      class="flex gap-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth w-full pr-12 sm:pr-8 select-none"
      role="tablist"
    >
      <button
        @click="selectTab('catalog')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="activeTab === 'catalog' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'"
      >
        <span>{{ isServiceStore ? '📋 Serviços & Itens' : '📋 Cardápio & Preços' }}</span>
      </button>

      <button
        v-if="isServiceStore"
        @click="selectTab('agenda')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="activeTab === 'agenda' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'"
      >
        <span>{{ isHealthStore ? '🩺 Especialistas & Agenda' : '💈 Barbeiros & Agenda' }}</span>
      </button>

      <button
        @click="selectTab('pix_contact')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="activeTab === 'pix_contact' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'"
      >
        <span>💠 Pix & Contato</span>
      </button>

      <button
        @click="selectTab('hours')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="activeTab === 'hours' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'"
      >
        <span>🕒 Horários & Pausa</span>
      </button>

      <button
        v-if="!isServiceStore"
        @click="selectTab('delivery')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="activeTab === 'delivery' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'"
      >
        <span>🛵 Delivery & Taxas</span>
      </button>

      <button
        @click="selectTab('announcement')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="activeTab === 'announcement' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'"
      >
        <span>📢 Comunicado</span>
      </button>

      <button
        @click="selectTab('security')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
        :class="activeTab === 'security' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'"
      >
        <span>🔒 PIN & Segurança</span>
      </button>
    </nav>

    <!-- Fade Gradient Direito -->
    <div
      v-if="canScrollNavRight"
      class="hidden sm:block pointer-events-none absolute right-4 top-4 bottom-2 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10"
    ></div>

    <!-- Botão Scroll Direita -->
    <button
      v-if="canScrollNavRight"
      type="button"
      @click="scrollNav('right')"
      class="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-slate-900/95 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg cursor-pointer backdrop-blur-xs active:scale-95"
      aria-label="Rolar abas para a direita"
    >
      <ChevronRight class="w-4 h-4" />
    </button>
  </div>
</template>
