<!-- pages/game.vue -->
<script setup lang="ts">
import { ref } from 'vue'

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
  'Ops, botão errado! 😂',
  'Nem tenta kkkk',
  'Erro 404: Não não encontrado',
  'Clica no Sim logo! ❤️',
  'Sem chance de recusar 😜',
  'Desiste hahaha',
  'Só tem uma resposta certa! 💍'
]

const currentNoText = ref('Não')
const yesScale = ref(1)
const noScale = ref(1)

function dodge() {
  dodgeCount.value++
  currentNoText.value = noButtonTexts[dodgeCount.value % noButtonTexts.length]

  // Faz o Sim crescer gradualmente e o Não encolher
  yesScale.value = Math.min(2.0, Number((yesScale.value + 0.12).toFixed(2)))
  noScale.value = Math.max(0.7, Number((noScale.value - 0.04).toFixed(2)))

  if (typeof window !== 'undefined') {
    const paddingX = 140
    const paddingY = 80
    const maxX = Math.max(20, window.innerWidth - paddingX)
    const maxY = Math.max(20, window.innerHeight - paddingY)

    const randomX = Math.floor(Math.random() * maxX) + 20
    const randomY = Math.floor(Math.random() * maxY) + 20

    noButtonPosition.value = {
      top: `${randomY}px`,
      left: `${randomX}px`,
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
      class="bg-white/90 backdrop-blur-md border border-rose-200/90 rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-2xl text-center space-y-8 z-10"
    >
      <div class="space-y-3">
        <div class="text-6xl animate-bounce">
          💍
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-rose-950 tracking-tight">
          Quer namorar comigo?
        </h1>
        <p class="text-xs sm:text-sm text-rose-600 font-medium">
          Pensa com bastante carinho antes de responder... 👀
        </p>
      </div>

      <!-- Botões de Ação -->
      <div class="flex items-center justify-center gap-4 min-h-[120px] relative">
        <!-- Botão SIM -->
        <button
          type="button"
          @click="handleAccept"
          :style="{ transform: 'scale(' + yesScale + ')' }"
          class="px-7 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all duration-200 cursor-pointer active:scale-95 shrink-0 z-10"
        >
          SIM! ❤️
        </button>

        <!-- Botão NÃO que foge em qualquer aproximação ou toque -->
        <button
          type="button"
          :style="{
            position: noButtonPosition.position,
            top: noButtonPosition.top,
            left: noButtonPosition.left,
            transform: 'scale(' + noScale + ')'
          }"
          @mouseenter="dodge"
          @touchstart.prevent="dodge"
          @pointerdown.prevent="dodge"
          @click="dodge"
          class="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition-all duration-150 cursor-pointer shadow-sm active:scale-90 select-none whitespace-nowrap z-20"
        >
          {{ currentNoText }}
        </button>
      </div>

      <p v-if="dodgeCount > 2" class="text-xs font-bold text-rose-500 animate-pulse">
        Dica: eu não aceito um &quot;não&quot; como resposta! 😜
      </p>
    </div>

    <!-- TELA 2: Sucesso / Ela disse SIM -->
    <div
      v-else
      class="bg-white/95 backdrop-blur-md border border-rose-300 rounded-3xl p-8 sm:p-12 max-w-md w-full shadow-2xl text-center space-y-6 z-10"
    >
      <div class="text-6xl sm:text-7xl animate-pulse">
        💖✨🎉
      </div>

      <div class="space-y-3">
        <h2 class="text-2xl sm:text-3xl font-black text-rose-950 tracking-tight">
          SABIA QUE VOCÊ IA ACEITAR! 🥰
        </h2>
        <p class="text-sm sm:text-base text-rose-700 font-semibold leading-relaxed">
          Agora é oficial! Os melhores momentos começam agora. ❤️
        </p>
      </div>

      <div class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-800 font-medium">
        📸 Tira um print dessa tela e me manda lá no WhatsApp pra comemorarmos! 🥂
      </div>
    </div>
  </div>
</template>
