<!-- components/admin/AdminTopHeader.vue -->
<script setup lang="ts">
const props = defineProps<{
  storeName?: string
  isEmergencyClosed?: boolean
  isHealthStore?: boolean
  isServiceStore?: boolean
  slug: string
}>()

const emit = defineEmits<{
  (e: 'logout'): void
}>()
</script>

<template>
  <header class="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <NuxtLink :to="`/${slug}`" class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors" title="Ver vitrine">
        ←
      </NuxtLink>
      <div>
        <h1 class="text-sm font-bold text-white leading-tight flex items-center gap-2">
          {{ storeName || 'Gestão da Loja' }}
          <span class="w-2 h-2 rounded-full" :class="isEmergencyClosed ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse'"></span>
        </h1>
        <p class="text-[11px] text-slate-400">
          {{ isHealthStore ? '🩺 Gestão de Consultas & Especialistas' : isServiceStore ? '💈 Gestão de Serviços & Barbeiros' : '🍔 Gestão de Cardápio & Delivery' }}
        </p>
      </div>
    </div>

    <button
      @click="emit('logout')"
      class="text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
    >
      Sair
    </button>
  </header>
</template>
