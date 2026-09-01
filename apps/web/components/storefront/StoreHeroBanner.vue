<!-- components/storefront/StoreHeroBanner.vue -->
<script setup lang="ts">
import { ChevronLeft, Share2 } from 'lucide-vue-next'
import { handleImageError } from '~/utils/images'

const props = defineProps<{
  banner?: string
  storeName: string
  theme?: string
  isEmergencyClosed?: boolean
  announcement?: { enabled?: boolean; message?: string }
}>()

const emit = defineEmits<{
  (e: 'share'): void
}>()
</script>

<template>
  <div>
    <!-- Banner de Alerta / Pausa Emergencial da Loja -->
    <div
      v-if="isEmergencyClosed"
      class="bg-rose-600 text-white text-xs font-bold p-3 px-4 text-center sticky top-0 z-40 shadow-md flex items-center justify-center gap-2"
      role="alert"
    >
      <span>⚠️</span>
      <span>Atendimento temporariamente pausado pela loja no momento. Retornaremos em breve!</span>
    </div>

    <!-- Banner de Comunicado Oficial da Loja -->
    <div
      v-else-if="announcement?.enabled && announcement?.message"
      class="bg-amber-500 text-slate-950 text-xs font-bold p-2.5 px-4 text-center sticky top-0 z-40 shadow-sm flex items-center justify-center gap-2"
      role="status"
    >
      <span>📢</span>
      <span>{{ announcement.message }}</span>
    </div>

    <!-- Hero Banner Principal com Gradiente Escuro Suave -->
    <div class="relative h-48 sm:h-64 w-full bg-slate-900 overflow-hidden">
      <img
        v-if="banner"
        :src="banner"
        :alt="`Banner de ${storeName}`"
        class="w-full h-full object-cover opacity-80"
        @error="handleImageError($event, theme)"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

      <!-- Botão Voltar para o Início / Showcase -->
      <NuxtLink
        to="/"
        class="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/60 transition-colors border border-white/10"
        aria-label="Voltar para a página inicial"
      >
        <ChevronLeft class="w-4 h-4" />
        <span>Início</span>
      </NuxtLink>

      <!-- Botão de Compartilhar -->
      <button
        @click="emit('share')"
        class="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors border border-white/10 cursor-pointer"
        aria-label="Compartilhar vitrine da loja"
      >
        <Share2 class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
