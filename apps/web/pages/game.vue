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
const isGoingUp = ref(true)

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
    const winW = window.innerWidth
    const winH = window.innerHeight

    const btnWidth = 190
    const btnHeight = 56
    const padX = 16
    const padTop = 36
    const padBottom = 110 // Margem generosa para NUNCA cortar na barra de navegação/gestos inferior

    const maxX = Math.max(padX, winW - btnWidth - padX)
    const randomX = Math.floor(Math.random() * (maxX - padX)) + padX

    const cardEl = cardRef.value
    const rect = cardEl ? cardEl.getBoundingClientRect() : null
    const cardTop = rect ? rect.top : winH * 0.25
    const cardBottom = rect ? rect.bottom : winH * 0.70

    let targetY: number

    // Alterna ativamente entre CIMA e BAIXO para o botão se mover pelos dois lados da tela!
    if (isGoingUp.value) {
      // Pula para cima do card (zona superior bem visível)
      const maxTopY = Math.max(padTop + 15, Math.min(winH * 0.3, cardTop - btnHeight - 12))
      targetY = Math.floor(Math.random() * Math.max(10, maxTopY - padTop)) + padTop
      isGoingUp.value = false
    } else {
      // Pula para baixo do card (zona inferior segura, acima da barra)
      const minBottomY = Math.max(cardBottom + 16, winH * 0.68)
      const maxBottomY = winH - btnHeight - padBottom
      if (maxBottomY > minBottomY) {
        targetY = Math.floor(Math.random() * (maxBottomY - minBottomY)) + minBottomY
      } else {
        targetY = maxBottomY
      }
      isGoingUp.value = true
    }

    // Clamp estrito de segurança
    const finalX = Math.round(Math.max(padX, Math.min(maxX, randomX)))
    const finalY = Math.round(Math.max(padTop, Math.min(winH - btnHeight - padBottom, targetY)))

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

        <!-- Botão NÃO que foge alternando para cima e para baixo -->
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

    <!-- TELA 2: Sucesso / Ela disse SIM (Sem a caixa de print) -->
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
    </div>
  </div>
</template>
