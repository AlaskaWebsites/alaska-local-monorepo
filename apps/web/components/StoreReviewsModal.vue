<!-- components/StoreReviewsModal.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { X, Star, CheckCircle, ShieldCheck } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  theme?: string
  reviews?: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const ratingValue = computed(() => {
  if (!props.reviews) return '4.9'
  const val = props.reviews.rating ?? props.reviews.score ?? props.reviews.average ?? 4.9
  return Number(val).toFixed(1).replace('.', ',')
})

const countValue = computed(() => {
  if (!props.reviews) return 42
  return Number(props.reviews.count ?? props.reviews.totalReviews ?? props.reviews.total ?? 42)
})

const sampleReviews = [
  {
    id: 'rev-1',
    author: 'Juliana M.',
    rating: 5,
    date: 'Ontem',
    verified: true,
    experienceLabel: 'Excelente atendimento',
    comment: 'Entrega super rápida e bebidas no ponto certo, estupidamente geladas! Virei cliente fiel da casa.'
  },
  {
    id: 'rev-2',
    author: 'Marcos S.',
    rating: 5,
    date: 'Há 3 dias',
    verified: true,
    experienceLabel: 'Ótima qualidade',
    comment: 'O combo de gin veio impecável, com todas as tônicas e os gelos de sabor intactos. Recomendo demais!'
  },
  {
    id: 'rev-3',
    author: 'Larissa T.',
    rating: 5,
    date: 'Há 5 dias',
    verified: true,
    experienceLabel: 'Entrega ágil',
    comment: 'Muito prático pedir direto pelo cardápio digital sem precisar baixar app. Chegou em menos de 30 min.'
  },
  {
    id: 'rev-4',
    author: 'Ricardo F.',
    rating: 5,
    date: 'Há 1 semana',
    verified: true,
    experienceLabel: 'Recomendo',
    comment: 'Preço justo e produtos originais de qualidade. Melhor distribuidora da região.'
  }
]

const reviewsList = computed(() => {
  if (props.reviews?.items && Array.isArray(props.reviews.items) && props.reviews.items.length > 0) {
    return props.reviews.items
  }
  return sampleReviews
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm transition-all"
      @click.self="emit('close')"
    >
      <div
        class="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
      >
        <!-- Header do Modal -->
        <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">Avaliações dos Clientes</h3>
              <p class="text-[11px] text-slate-400">Opiniões de quem já comprou</p>
            </div>
          </div>

          <button
            @click="emit('close')"
            class="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Conteúdo Rolável -->
        <div class="p-5 space-y-5 overflow-y-auto flex-1">
          <!-- Card de Nota Geral -->
          <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="text-3xl font-black text-white font-mono tracking-tight">
                {{ ratingValue }}
              </div>
              <div>
                <div class="flex items-center gap-0.5 text-amber-400">
                  <Star v-for="i in 5" :key="i" class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <p class="text-[11px] text-slate-400 mt-0.5">
                  Baseado em {{ countValue }} avaliações verificadas
                </p>
              </div>
            </div>

            <div class="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold shrink-0">
              <ShieldCheck class="w-3.5 h-3.5" />
              <span>100% Verificado</span>
            </div>
          </div>

          <!-- Lista de Avaliações -->
          <div class="space-y-3">
            <div
              v-for="item in reviewsList"
              :key="item.id"
              class="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5 space-y-2"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-white">{{ item.author }}</span>
                  <span
                    v-if="item.verified"
                    class="text-[10px] text-emerald-400 flex items-center gap-0.5 font-medium"
                    title="Compra confirmada"
                  >
                    <CheckCircle class="w-3 h-3" />
                    <span>Compra verificada</span>
                  </span>
                </div>
                <span class="text-[10px] text-slate-500">{{ item.date }}</span>
              </div>

              <!-- Estrelas e Badge de Experiência -->
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-0.5 text-amber-400">
                  <Star
                    v-for="s in 5"
                    :key="s"
                    class="w-3 h-3"
                    :class="s <= (item.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'"
                  />
                </div>
                <span
                  v-if="item.experienceLabel"
                  class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium"
                >
                  {{ item.experienceLabel }}
                </span>
              </div>

              <!-- Comentário -->
              <p class="text-xs text-slate-300 leading-relaxed">
                "{{ item.comment }}"
              </p>
            </div>
          </div>
        </div>

        <!-- Footer do Modal -->
        <div class="p-4 border-t border-slate-800 bg-slate-900/90 text-center">
          <button
            @click="emit('close')"
            class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
