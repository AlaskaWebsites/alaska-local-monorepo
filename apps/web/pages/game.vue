<!-- pages/game.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const cardRef = ref<HTMLElement | null>(null)
const accepted = ref(false)
const noButtonPosition = ref<{ top: string; left: string; position: 'static' | 'fixed' }>({
  top: 'auto',
  left: 'auto',
  position: 'static'
})

const dodgeCount = ref(0)
const noButtonTexts = [
  'Não',
  'Tem certeza? 🥺',
  'Pensa bem! 👀',
  'Ops, errou! 😂',
  'Nem tenta kkkk',
  'Erro 404: Não encontrado',
  'Clica no Sim logo! ❤️',
  'Sem chance de recusar 😜',
  'Desiste hahaha',
  'Só tem uma resposta! 💍'
]

const currentNoText = ref('Não')
const yesScale = ref(1)

function dodge() {
  dodgeCount.value++
  currentNoText.value = noButtonTexts[dodgeCount.value % noButtonTexts.length]

  // Faz o Sim crescer gradualmente para convidar ao clique
  yesScale.value = Math.min(1.4, Number((yesScale.value + 0.06).toFixed(2)))

  if (typeof window !== 'undefined') {
    const btnWidth = 200
    const btnHeight = 56
    const safeMarginX = 16
    const safeMarginTop = 32
    const safeMarginBottom = 90 // Protege contra a barra de navegação/gestos do Android e iOS

    const winW = window.innerWidth
    const winH = window.innerHeight

    // Pega as dimensões reais do card na tela
    const cardEl = cardRef.value
    const rect = cardEl ? cardEl.getBoundingClientRect() : null

    const cardTop = rect ? rect.top : winH * 0.25
    const cardBottom = rect ? rect.bottom : winH * 0.70
    const cardLeft = rect ? rect.left : winW * 0.05
    const cardRight = rect ? rect.right : winW * 0.95

    // Lista de posições seguras garantidas ao redor do card e da tela
    const safePositions: Array<{ x: number; y: number }> = [
      // 1. Logo abaixo do card (centralizado, mas bem visível)
      { x: cardLeft + (cardRight - cardLeft - btnWidth) / 2, y: cardBottom + 20 },
      // 2. Logo acima do card (centralizado)
      { x: cardLeft + (cardRight - cardLeft - btnWidth) / 2, y: cardTop - btnHeight - 20 },
      // 3. Dentro da área inferior do card (lado esquerdo)
      { x: cardLeft + 24, y: cardBottom - btnHeight - 24 },
      // 4. Dentro da área inferior do card (lado direito)
      { x: cardRight - btnWidth - 24, y: cardBottom - btnHeight - 24 },
      // 5. Logo abaixo do card (inclinado à direita)
      { x: cardRight - btnWidth, y: cardBottom + 16 },
      // 6. Logo abaixo do card (inclinado à esquerda)
      { x: cardLeft, y: cardBottom + 16 },
      // 7. Logo acima do card (lado direito)
      { x: cardRight - btnWidth, y: cardTop - btnHeight - 16 },
      // 8. Logo acima do card (lado esquerdo)
      { x: cardLeft, y: cardTop - btnHeight - 16 }
    ]

    // Se estiver em desktop com espaço lateral sobrando, adiciona laterais
    if (winW > 650) {
      safePositions.push(
        { x: cardLeft - btnWidth - 24, y: cardTop + 100 },
        { x: cardRight + 24, y: cardTop + 100 }
      )
    }

    // Seleciona a próxima posição com variação
    const target = safePositions[dodgeCount.value % safePositions.length]

    // Clamp rigoroso: NUNCA deixa passar dos limites visíveis da viewport
    const maxX = Math.max(safeMarginX, winW - btnWidth - safeMarginX)
    const maxY = Math.max(safeMarginTop, winH - btnHeight - safeMarginBottom)

    const finalX = Math.round(Math.max(safeMarginX, Math.min(maxX, target.x)))
    const finalY = Math.round(Math.max(safeMarginTop, Math.min(maxY, target.y)))

    noButtonPosition.value = {
      top: finalY + 'px',
      left: finalX + 'px',
      position: 'fixed'
    }
  }
}

function handleAccept() {
  accepted.value = true
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
    <!-- Efeitos de luz no fundo -->
    <div class="absolute -top-16 -left-16 w-64 h-64 bg-rose-200/50 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-16 -right-16 w-80 h-80 bg-pink-300/40 rounded-full blur-3xl pointer-events-none"></div>

    <!-- TELA 1: A Pergunta -->
    <div
      v-if="!accepted"
      ref="cardRef"
      class="bg-white/95 backdrop-blur-md border border-rose-200/90 rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-2xl text-center space-y-7 z-10 transition-all"
    >
      <div class="space-y-3">
        <div class="text-6xl sm:text-7xl animate-bounce">
          💍
        </div>
        <h1 class="text-2xl sm:text-4xl font-black text-rose-950 tracking-tight leading-tight">
          Quer namorar comigo?
        </h1>
        <p class="text-sm sm:text-base text-rose-600 font-semibold max-w-xs mx-auto leading-relaxed">
          Pensa com bastante carinho antes de responder... 👀
        </p>
      </div>

      <!-- Botões de Ação -->
      <div class="flex items-center justify-center gap-4 min-h-[110px] relative">
        <!-- Botão SIM -->
        <button
          type="button"
          @click="handleAccept"
          :style="{ transform: 'scale(' + yesScale + ')' }"
          class="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 transition-all duration-200 cursor-pointer active:scale-95 shrink-0 z-10"
        >
          SIM! ❤️
        </button>

        <!-- Botão NÃO que foge com limites rigorosos na tela -->
        <button
          type="button"
          :style="{
            position: noButtonPosition.position,
            top: noButtonPosition.top,
            left: noButtonPosition.left
          }"
          @mouseenter="dodge"
          @touchstart.prevent="dodge"
          @pointerdown.prevent="dodge"
          @click="dodge"
          class="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm sm:text-base rounded-2xl transition-all duration-150 cursor-pointer shadow-md active:scale-95 select-none whitespace-nowrap z-30"
        >
          {{ currentNoText }}
        </button>
      </div>

      <div v-if="dodgeCount > 0" class="pt-2">
        <span class="text-xs sm:text-sm font-bold text-rose-600 bg-rose-100/70 border border-rose-200 px-4 py-2 rounded-full inline-block animate-pulse">
          Dica: eu não aceito um &quot;não&quot; como resposta! 😜
        </span>
      </div>
    </div>

    <!-- TELA 2: Sucesso / Ela disse SIM -->
    <div
      v-else
      class="bg-white/95 backdrop-blur-md border border-rose-300 rounded-3xl p-8 sm:p-12 max-w-md w-full shadow-2xl text-center space-y-6 z-10 animate-in fade-in zoom-in duration-300"
    >
      <div class="text-6xl sm:text-7xl animate-pulse">
        💖✨🎉
      </div>

      <div class="space-y-3">
        <h2 class="text-2xl sm:text-4xl font-black text-rose-950 tracking-tight leading-tight">
          SABIA QUE VOCÊ IA ACEITAR! 🥰
        </h2>
        <p class="text-base sm:text-lg text-rose-700 font-semibold leading-relaxed">
          Agora é oficial! Os melhores momentos começam agora. ❤️
        </p>
      </div>

      <div class="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-sm sm:text-base text-rose-800 font-bold leading-relaxed shadow-xs">
        📸 Tira um print dessa tela e me manda lá no WhatsApp pra comemorarmos! 🥂
      </div>
    </div>
  </div>
</template>
