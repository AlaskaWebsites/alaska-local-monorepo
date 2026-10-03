<!-- components/StoreReviewsModal.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Info,
  Heart,
  X
} from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  storeName?: string
  theme?: string
  reviews?: any
  category?: string
  address?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// Fechamento com Tecla ESC
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown)
  }
})

const activeFilter = ref<'comentarios' | 'recentes'>('comentarios')

// Array de estrelas de 5 a 1 para o gráfico de barras
const starLevels: number[] = [5, 4, 3, 2, 1]

// Estado reativo para curtidas nos comentários
const likedComments = ref<Record<string, boolean>>({})

const toggleLike = (commentId: string) => {
  likedComments.value[commentId] = !likedComments.value[commentId]
}

// Helper defensivo para extrair o texto da resposta da loja
function getStoreReplyText(reply: any): string {
  if (!reply) return ''
  if (typeof reply === 'object') {
    return reply.text || reply.message || reply.comment || reply.reply || ''
  }
  if (typeof reply === 'string') {
    const trimmed = reply.trim()
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed)
        return parsed.text || parsed.message || parsed.comment || parsed.reply || trimmed
      } catch {
        return trimmed
      }
    }
    return trimmed
  }
  return String(reply)
}

// Normalização defensiva: 100% à prova de TypeError e idêntica ao iFood
const normalizedReviews = computed(() => {
  const r = (props.reviews || {}) as any
  const score = typeof r.score === 'number'
    ? r.score
    : typeof r.rating === 'number'
      ? r.rating
      : typeof r.average === 'number'
        ? r.average
        : 5.0

  const totalReviews = typeof r.totalReviews === 'number'
    ? r.totalReviews
    : typeof r.count === 'number'
      ? r.count
      : typeof r.total === 'number'
        ? r.total
        : 48

  const serviceQuality = {
    experienceLabel: r.serviceQuality?.experienceLabel || 'Avaliação Excelente',
    description: r.serviceQuality?.description || 'Classificação máxima em atendimento e agilidade no preparo e entrega dos pedidos',
    level: Number(r.serviceQuality?.level ?? 5)
  }

  const defaultDistribution: Record<number, number> = {
    5: 92,
    4: 6,
    3: 2,
    2: 0,
    1: 0
  }
  const distribution = (r.distribution && typeof r.distribution === 'object') ? r.distribution : defaultDistribution

  const defaultComments = [
    {
      id: 'comm-1',
      author: 'Ana',
      rating: 5,
      date: 'há 5 dias',
      comment: 'Muito atenciosos, atendimento impecável e entrega super pontual!',
      likes: 2,
      storeReply: 'Muito obrigado, Ana! Ficamos muito felizes com a sua confiança e avaliação!'
    },
    {
      id: 'comm-2',
      author: 'Josiele',
      rating: 5,
      date: 'há 1 semana',
      comment: 'Tudo perfeito, produtos de primeira qualidade e muito capricho no envio.',
      likes: 1,
      storeReply: 'Valeu demais pela preferência, Josiele! Estamos sempre à disposição.'
    },
    {
      id: 'comm-3',
      author: 'Carlos Eduardo',
      rating: 5,
      date: 'há 2 semanas',
      comment: 'Atendimento nota 10, rapidez na entrega e facilidade no pagamento via Pix.',
      likes: 1,
      storeReply: 'Muito obrigado, Carlos! Nosso compromisso é entregar sempre o melhor.'
    }
  ]

  const rawComments = Array.isArray(r.comments) && r.comments.length > 0
    ? r.comments
    : Array.isArray(r.items) && r.items.length > 0
      ? r.items
      : defaultComments

  const comments = rawComments.map((item: any, index: number) => ({
    id: item.id || `comm-${index}`,
    author: item.author || item.name || item.customerName || 'Cliente Verificado',
    rating: Number(item.rating || 5),
    date: item.date || 'recente',
    comment: item.comment || item.text || item.review || '',
    likes: Number(item.likes || 0),
    storeReply: item.storeReply || item.storeResponse || item.reply || null
  }))

  return {
    score,
    totalReviews,
    serviceQuality,
    distribution,
    comments
  }
})

const getDistributionPercentage = (star: number): number => {
  const dist = (normalizedReviews.value.distribution || {}) as Record<number, number>
  return dist[star] ?? 0
}

const displayedComments = computed(() => {
  const list = normalizedReviews.value.comments || []
  if (activeFilter.value === 'recentes') {
    return [...list].reverse()
  }
  return list
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reviews-modal-title"
      @click="emit('close')"
    >
      <!-- Container Modal Branco Estilo iFood -->
      <div
        class="bg-white border border-slate-200/90 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200 text-slate-900"
        @click.stop
      >
        <!-- Top Bar com Botão Voltar e Botão Fechar -->
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-20">
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="emit('close')"
              class="p-2 -ml-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Voltar"
            >
              <ChevronLeft class="w-6 h-6 text-slate-800" />
            </button>
            <span class="text-sm font-bold text-slate-900">Avaliações da Loja</span>
          </div>

          <button
            type="button"
            @click="emit('close')"
            class="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar modal de avaliações"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Conteúdo com Rolagem -->
        <div class="overflow-y-auto flex-1 p-5 space-y-6 bg-white">
          <!-- Cabeçalho do Estabelecimento -->
          <div class="space-y-1">
            <div class="flex items-start justify-between gap-2">
              <h2 id="reviews-modal-title" class="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {{ storeName || 'Avaliações do Estabelecimento' }}
              </h2>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0 mt-1">
                {{ category || 'Verificado' }}
              </span>
            </div>
            <p v-if="address" class="text-xs text-slate-500 font-medium line-clamp-1">
              {{ address }}
            </p>

            <div class="flex items-center gap-2 pt-1.5">
              <span class="text-sm font-black text-slate-900">
                {{ normalizedReviews.score.toFixed(1) }}
              </span>
              <div class="flex items-center gap-0.5 text-amber-500">
                <Star v-for="i in 5" :key="i" class="w-3.5 h-3.5 fill-current" />
              </div>
              <span class="text-xs text-slate-500 font-medium">
                {{ normalizedReviews.totalReviews }} avaliações
              </span>
            </div>
          </div>

          <!-- SEÇÃO 1: Qualidade do Serviço -->
          <section class="space-y-2.5">
            <h3 class="text-base font-extrabold text-slate-900 tracking-tight">
              Qualidade do serviço
            </h3>

            <div class="rounded-2xl border border-slate-100 bg-[#fafafa] p-4 space-y-1.5 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-slate-900">
                  {{ normalizedReviews.serviceQuality.experienceLabel }}
                </span>
                <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <p class="text-xs text-slate-500 leading-relaxed">
                {{ normalizedReviews.serviceQuality.description }}
              </p>
            </div>
          </section>

          <!-- SEÇÃO 2: Resumo das Avaliações -->
          <section class="space-y-2.5">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-extrabold text-slate-900 tracking-tight">
                Resumo
              </h3>
              <div class="flex items-center gap-1 text-xs text-slate-400">
                <span>Avaliações reais</span>
                <Info class="w-3.5 h-3.5" />
              </div>
            </div>

            <div class="rounded-2xl border border-slate-100 bg-[#fafafa] p-4 flex items-center justify-between gap-6 shadow-2xs">
              <!-- Score Grande à Esquerda -->
              <div class="text-center shrink-0 pr-4 border-r border-slate-200">
                <div class="flex items-center justify-center gap-1.5 text-3xl font-black text-slate-900">
                  <span>{{ normalizedReviews.score.toFixed(1) }}</span>
                  <Star class="w-6 h-6 fill-amber-500 text-amber-500" />
                </div>
                <span class="text-xs text-slate-500 mt-0.5 block font-medium">
                  {{ normalizedReviews.totalReviews }} avaliações
                </span>
              </div>

              <!-- Barras de Distribuição à Direita -->
              <div class="flex-1 space-y-1.5">
                <div
                  v-for="star in starLevels"
                  :key="star"
                  class="flex items-center gap-2 text-xs text-slate-600 font-medium"
                >
                  <span class="w-3 text-right text-[11px]">{{ star }}</span>
                  <Star class="w-3 h-3 fill-amber-400 text-amber-400" />
                  <div class="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      class="h-full rounded-full bg-slate-900 transition-all duration-300"
                      :style="`width: ${getDistributionPercentage(star)}%`"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- SEÇÃO 3: Filtros em Pílulas -->
          <div class="flex items-center gap-2 pt-1">
            <button
              type="button"
              @click="activeFilter = 'comentarios'"
              class="px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border"
              :class="activeFilter === 'comentarios'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
            >
              Comentários
            </button>
            <button
              type="button"
              @click="activeFilter = 'recentes'"
              class="px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border"
              :class="activeFilter === 'recentes'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
            >
              Recentes
            </button>
          </div>

          <!-- SEÇÃO 4: Lista de Comentários com Resposta da Loja -->
          <div class="space-y-4 pt-1">
            <article
              v-for="item in displayedComments"
              :key="item.id"
              class="border-b border-slate-100 pb-5 space-y-2.5 last:border-b-0"
            >
              <!-- Autor, Data e Curtida -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-sm text-slate-900">{{ item.author }}</span>
                  <span class="text-xs text-slate-400">• {{ item.date }}</span>
                </div>
                <!-- Like / Heart Interativo -->
                <button
                  type="button"
                  @click="toggleLike(item.id)"
                  class="flex items-center gap-1 transition-colors cursor-pointer text-xs"
                  :class="likedComments[item.id] ? 'text-red-500' : 'text-slate-400 hover:text-red-500'"
                >
                  <Heart
                    class="w-4 h-4"
                    :class="likedComments[item.id] ? 'fill-red-500' : ''"
                  />
                  <span class="text-[11px] font-medium">
                    {{ (item.likes || 0) + (likedComments[item.id] ? 1 : 0) }}
                  </span>
                </button>
              </div>

              <!-- Estrelas do Comentário -->
              <div class="flex items-center gap-0.5 text-amber-500">
                <Star
                  v-for="i in 5"
                  :key="i"
                  class="w-3.5 h-3.5"
                  :class="i <= (item.rating || 5) ? 'fill-current' : 'text-slate-200'"
                />
              </div>

              <!-- Texto do Cliente -->
              <p class="text-sm text-slate-700 leading-relaxed font-normal">
                {{ item.comment || item.text }}
              </p>

              <!-- Resposta Oficial da Loja -->
              <div
                v-if="getStoreReplyText(item.storeReply)"
                class="mt-2.5 rounded-2xl bg-[#f7f7f7] p-3.5 border border-slate-100 space-y-1.5"
              >
                <div class="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span class="text-sm">🏪</span>
                  <span>Resposta da loja</span>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  {{ getStoreReplyText(item.storeReply) }}
                </p>
                <div class="flex items-center gap-0.5 text-amber-400 pt-0.5">
                  <Star v-for="s in 5" :key="s" class="w-2.5 h-2.5 fill-current" />
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- Rodapé com Botão Entendido -->
        <div class="p-4 border-t border-slate-100 bg-white shrink-0 flex items-center justify-end">
          <button
            type="button"
            @click="emit('close')"
            class="w-full sm:w-auto px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer text-center"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
</style>
