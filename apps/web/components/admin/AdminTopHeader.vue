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
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-3 flex items-center justify-between shadow-2xs">
    <div class="flex items-center gap-3">
      <NuxtLink :to="`/${slug}`" class="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer" title="Ver vitrine">
        ←
      </NuxtLink>
      <div>
        <h1 class="text-sm font-bold text-slate-900 leading-tight flex items-center gap-2">
          {{ storeName || 'Gestão da Loja' }}
          <span class="w-2 h-2 rounded-full" :class="isEmergencyClosed ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse'"></span>
        </h1>
        <p class="text-[11px] text-slate-500 font-medium">
          {{ isHealthStore ? '🩺 Gestão de Consultas & Especialistas' : isServiceStore ? '💈 Gestão de Serviços & Barbeiros' : '🍔 Gestão de Cardápio & Delivery' }}
        </p>
      </div>
    </div>

    <button
      @click="emit('logout')"
      class="text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
    >
      Sair
    </button>
  </header>
</template>
