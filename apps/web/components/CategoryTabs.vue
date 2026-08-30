<!-- components/CategoryTabs.vue -->
<template>
  <nav aria-label="Categorias do cardápio"
    class="sticky top-0 z-30 w-full bg-[#f5f5f5]/95 backdrop-blur-md border-b border-slate-200/80 py-2.5">
    <div class="max-w-4xl mx-auto px-4 flex items-center gap-2">
      <!-- Botão Scroll Esquerda (Desktop) - Alinhado ao lado -->
      <button v-if="canScrollLeft" @click="scroll('left')"
        class="hidden sm:flex shrink-0 p-1.5 rounded-full bg-white text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer items-center justify-center active:scale-95"
        aria-label="Rolar categorias para a esquerda" title="Categorias anteriores">
        <ChevronLeft class="w-4 h-4" aria-hidden="true" />
      </button>

      <!-- Container Rolável das Abas (flex-1 min-w-0 sem barra nativa) -->
      <div ref="tabsContainerRef" @scroll="checkScroll" @wheel="handleWheel"
        class="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
        role="tablist" aria-label="Lista de categorias">
        <a v-for="category in categories" :key="category.id" :href="`#${category.id}`" role="tab"
          :aria-label="`Navegar até a categoria ${category.name}`"
          class="shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          :class="[themeClasses.primaryTextHover, themeClasses.primaryBorderHover]">
          {{ category.name }}
        </a>
      </div>

      <!-- Botão Scroll Direita (Desktop) - Alinhado ao lado -->
      <button v-if="canScrollRight" @click="scroll('right')"
        class="hidden sm:flex shrink-0 p-1.5 rounded-full bg-white text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer items-center justify-center active:scale-95"
        aria-label="Rolar categorias para a direita" title="Mais categorias">
        <ChevronRight class="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useTenantTheme } from '~/composables/useTenantTheme'
import type { Category, TenantTheme } from '~/types'

const props = defineProps<{
  categories: Category[]
  theme?: TenantTheme
}>()

const { themeClasses } = useTenantTheme(computed(() => props.theme))

const tabsContainerRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function checkScroll() {
  if (!tabsContainerRef.value) return
  const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.value
  canScrollLeft.value = scrollLeft > 10
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 10
}

function scroll(direction: 'left' | 'right') {
  if (!tabsContainerRef.value) return
  const scrollAmount = 280
  const delta = direction === 'left' ? -scrollAmount : scrollAmount
  tabsContainerRef.value.scrollBy({ left: delta, behavior: 'smooth' })
}

function handleWheel(e: WheelEvent) {
  if (!tabsContainerRef.value) return
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    tabsContainerRef.value.scrollLeft += e.deltaY * 0.8
    checkScroll()
  }
}

onMounted(async () => {
  await nextTick()
  checkScroll()
  if (import.meta.client) {
    window.addEventListener('resize', checkScroll)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', checkScroll)
  }
})

watch(
  () => props.categories,
  async () => {
    await nextTick()
    checkScroll()
  },
  { deep: true }
)
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.no-scrollbar {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
</style>
