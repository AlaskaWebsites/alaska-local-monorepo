<!-- components/StoreReviewsModal.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ChevronLeft,
  Share2,
  Heart,
  Star,
  ChevronRight,
  Info,
  Store
} from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  theme?: string
  reviews?: any
  storeName?: string
  category?: string
  address?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open-info'): void
}>()

// Aba ativa: 'reviews' ou 'info'
const activeTab = ref<'reviews' | 'info'>('reviews')

// Filtro de comentários: 'all' ou 'recent'
const activeFilter = ref<'all' | 'recent'>('all')

// Likes interativos locais por comentário
const likedMap = ref<Record<string, boolean>>({})
const likesCountMap = ref<Record<string, number>>({})

function toggleLike(commentId: string, initialLikes: number = 0) {
  if (likesCountMap.value[commentId] === undefined) {
    likesCountMap.value[commentId] = initialLikes
  }
  if (likedMap.value[commentId]) {
    likedMap.value[commentId] = false
    likesCountMap.value[commentId]--
  } else {
    likedMap.value[commentId] = true
    likesCountMap.value[commentId]++
  }
}

function getLikes(commentId: string, initialLikes: number = 0): number {
  if (likesCountMap.value[commentId] !== undefined) {
    return likesCountMap.value[commentId]
  }
  return initialLikes
}

const displayRating = computed(() => {
  if (!props.reviews) return '5.0'
  const val = props.reviews.rating ?? props.reviews.score ?? 5.0
  return Number(val).toFixed(1)
})

const displayCount = computed(() => {
  if (!props.reviews) return 274
  return Number(props.reviews.count ?? props.reviews.totalReviews ?? 274)
})

const qualityService = computed(() => {
  return props.reviews?.serviceQuality || {
    status: 'Análise em andamento',
    description: 'A loja receberá um nível de 1 a 5 para indicar a qualidade do serviço aos seus clientes'
  }
})

// Distribuição das estrelas (5 a 1)
const distribution = computed(() => {
  const dist = props.reviews?.distribution || {
    5: 258,
    4: 12,
    3: 3,
    2: 1,
    1: 0
  }
  const total = Number(displayCount.value) || 1
  return [5, 4, 3, 2, 1].map(stars => {
    const count = Number(dist[stars] || 0)
    const percentage = Math.round((count / total) * 100)
    return {
      stars,
      count,
      percentage: Math.min(100, Math.max(0, percentage))
    }
  })
})

// Comentários reais com respostas da loja
const defaultComments = [
  {
    id: 'rev-1',
    author: 'Ana',
    rating: 5,
    date: 'há 5 dias',
    likes: 0,
    text: 'Muito atenciosos, obrigada pelo brinde!!',
    storeReply: {
      text: 'Muito obrigado, Ana! 🥰❤️ Ficamos muito felizes com sua avaliação e em saber que gostou do atendimento O brinde é uma forma de agradecer pela preferência e confiança! Volte sempre!'
    }
  },
  {
    id: 'rev-2',
    author: 'Josiele',
    rating: 5,
    date: 'há 1 semana',
    likes: 1,
    text: 'Bebidas trincando de geladas e entrega antes do prazo! Salvou o final de semana.',
    storeReply: {
      text: 'Show demais, Josiele! Obrigado pela preferência e confiança. Pode contar sempre com a gente!'
    }
  },
  {
    id: 'rev-3',
    author: 'Carlos Eduardo',
    rating: 5,
    date: 'há 2 semanas',
    likes: 2,
    text: 'Kit gin impecável, com todas as tônicas originais e o gelo de sabor no ponto. Preço super justo.',
    storeReply: {
      text: 'Valeu pelo feedback Carlos! Trabalhamos só com produtos 100% originais e procedência garantida. Tmj!'
    }
  }
]

const commentsList = computed(() => {
  const list = (props.reviews?.comments && Array.isArray(props.reviews.comments) && props.reviews.comments.length > 0)
    ? props.reviews.comments
    : defaultComments

  if (activeFilter.value === 'recent') {
    return [...list].reverse()
  }
  return list
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm transition-all"
      @click.self="emit('close')"
    >
      <div
        class="bg-[#121418] text-white w-full max-w-lg h-[92vh] sm:h-[88vh] rounded-t-3xl sm:rounded-3xl border border-slate-800 flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
      >
        <!-- Top Bar Fixa: Navegação & Ações -->
        <div class="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-[#121418] sticky top-0 z-20">
          <button
            @click="emit('close')"
            class="p-1.5 -ml-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Voltar"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>

          <div class="flex items-center gap-3">
            <button
              class="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Compartilhar"
            >
              <Share2 class="w-5 h-5" />
            </button>
            <button
              class="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              title="Favoritar"
            >
              <Heart class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Cabeçalho da Loja (Estilo iFood) -->
        <div class="px-5 pt-3 pb-2">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-xl font-bold text-white tracking-tight">
                {{ storeName || 'Adega & Distribuidora Prime' }}
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                Bebidas • 3,5 km • $$$$$
              </p>
            </div>

            <div class="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 font-bold text-xs shrink-0">
              🍺
            </div>
          </div>

          <!-- Linha de Nota do Topo -->
          <div class="flex items-center gap-2 mt-2 text-xs">
            <span class="font-bold text-white">{{ displayRating }}</span>
            <div class="flex items-center text-amber-400">
              <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span class="text-slate-400">•</span>
            <span class="text-slate-400">{{ displayCount }} avaliações</span>
          </div>
        </div>

        <!-- Abas de Navegação (Avaliações / Informações) -->
        <div class="px-5 flex items-center border-b border-slate-800/80 mt-2 gap-8 text-sm">
          <button
            @click="activeTab = 'reviews'"
            class="pb-3 font-semibold transition-all relative cursor-pointer"
            :class="activeTab === 'reviews' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-slate-200'"
          >
            <span>Avaliações</span>
            <div
              v-if="activeTab === 'reviews'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full"
            />
          </button>

          <button
            @click="emit('open-info')"
            class="pb-3 font-semibold text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <span>Informações</span>
          </button>
        </div>

        <!-- Conteúdo Rolável -->
        <div class="p-5 space-y-6 overflow-y-auto flex-1">
          <!-- 1. Qualidade do Serviço -->
          <section class="space-y-2">
            <h3 class="text-sm font-bold text-white tracking-wide">Qualidade do serviço</h3>
            <div class="bg-[#1a1d24] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-1.5 font-bold text-sm text-white">
                  <span>{{ qualityService.status }}</span>
                </div>
                <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                  {{ qualityService.description }}
                </p>
              </div>
              <ChevronRight class="w-5 h-5 text-slate-500 shrink-0" />
            </div>
          </section>

          <!-- 2. Resumo das Avaliações (Nota Grande + Barras 5 a 1) -->
          <section class="space-y-2">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-white tracking-wide">Resumo</h3>
              <button class="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer">
                <span>Como funcionam as avaliações</span>
                <Info class="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <div class="bg-[#1a1d24] border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between gap-6">
              <!-- Lado Esquerdo: Nota Grande e Total -->
              <div class="text-center sm:text-left shrink-0">
                <div class="flex items-center justify-center sm:justify-start gap-1.5 text-3xl font-black text-white">
                  <span>{{ displayRating }}</span>
                  <Star class="w-6 h-6 fill-amber-400 text-amber-400" />
                </div>
                <p class="text-xs text-slate-400 mt-1 font-medium">
                  {{ displayCount }} avaliações
                </p>
              </div>

              <!-- Lado Direito: Barras de Progresso de 5 a 1 -->
              <div class="flex-1 space-y-1.5 max-w-[220px]">
                <div
                  v-for="row in distribution"
                  :key="row.stars"
                  class="flex items-center gap-2 text-xs"
                >
                  <span class="w-2.5 font-bold text-slate-400 text-right">{{ row.stars }}</span>
                  <Star class="w-3 h-3 fill-slate-500 text-slate-500 shrink-0" />
                  <div class="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-slate-300 rounded-full transition-all duration-500"
                      :style="{ width: `${row.percentage}%` }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 3. Filtros de Comentários (Chips) -->
          <div class="flex items-center gap-2 pt-1">
            <button
              @click="activeFilter = 'all'"
              class="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
              :class="activeFilter === 'all' ? 'bg-slate-800 text-white border border-slate-700' : 'bg-transparent text-slate-400 border border-slate-800/80 hover:border-slate-700'"
            >
              Comentários
            </button>

            <button
              @click="activeFilter = 'recent'"
              class="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
              :class="activeFilter === 'recent' ? 'bg-slate-800 text-white border border-slate-700' : 'bg-transparent text-slate-400 border border-slate-800/80 hover:border-slate-700'"
            >
              Recentes
            </button>
          </div>

          <!-- 4. Lista de Comentários Reais com Resposta da Loja -->
          <div class="space-y-4">
            <div
              v-for="comment in commentsList"
              :key="comment.id"
              class="border-b border-slate-800/60 pb-4 space-y-2.5 last:border-b-0"
            >
              <!-- Cabeçalho do Comentário: Autor e Curtidas -->
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="font-bold text-sm text-white">
                    {{ comment.author }}
                  </div>
                  <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <div class="flex items-center text-amber-400">
                      <Star
                        v-for="s in 5"
                        :key="s"
                        class="w-3 h-3"
                        :class="s <= comment.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'"
                      />
                    </div>
                    <span>•</span>
                    <span>{{ comment.date }}</span>
                  </div>
                </div>

                <!-- Botão de Curtida com Contador -->
                <button
                  @click="toggleLike(comment.id, comment.likes)"
                  class="flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors cursor-pointer"
                  :class="likedMap[comment.id] ? 'text-rose-500 bg-rose-500/10' : 'text-slate-400 hover:text-slate-200'"
                >
                  <Heart
                    class="w-4 h-4"
                    :class="likedMap[comment.id] ? 'fill-rose-500 text-rose-500' : ''"
                  />
                  <span>{{ getLikes(comment.id, comment.likes) }}</span>
                </button>
              </div>

              <!-- Texto do Cliente -->
              <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {{ comment.text }}
              </p>

              <!-- Caixa de Resposta da Loja (Estilo iFood) -->
              <div
                v-if="comment.storeReply"
                class="bg-[#1a1d24] border border-slate-800/80 rounded-xl p-3.5 mt-2.5 space-y-1.5"
              >
                <div class="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Store class="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Resposta da loja</span>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed">
                  {{ comment.storeReply.text }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
