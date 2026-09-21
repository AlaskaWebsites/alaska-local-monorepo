<!-- pages/game.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const accepted = ref(false)
const dodgeCount = ref(0)

const noButtonPosition = ref<{
  position: 'static' | 'fixed'
  top?: string
  bottom?: string
  left?: string
  right?: string
  transform?: string
}>({
  position: 'static'
})

const noButtonTexts = [
  'Não',
  'Tem certeza, Thaís? 🥺',
  'Pensa bem, Thaís! 👀',
  'Thaís, clica no Sim logo! ❤️',
  'Errou o botão, Thaís! 😂',
  'Nem tenta fugir, Thaís kkk',
  'Thaís, você me ama que eu sei 🥰',
  'O botão Não quebrou, Thaís 🤷‍♂️',
  'Sem chance, Thaís 😜',
  'Thaís do céu, clica no SIM! 😂',
  'Desiste, Thaís hahaha',
  'Thaís, só tem uma resposta certa! 💍',
  'Aceita logo, Thaís! 💖',
  'Já era, Thaís, é SIM! 🔒',
  'Cansou de tentar o Não, Thaís?',
  'Thaís, eu não aceito não! 😜',
  'Duvido você conseguir clicar aqui kkk',
  'Vem pro SIM, Thaís! ❤️'
]

const currentNoText = ref('Não')
const yesScale = ref(1)

// Slots de fuga em tela cheia (ancorados nas bordas e cantos com margens seguras anti-corte):
// Cruza diagonais, sobe, desce e vai pros dois lados em grande amplitude!
const fullScreenSlots = [
  // 1. Canto Superior Direito
  { top: '55px', right: '20px', bottom: 'auto', left: 'auto', transform: 'none' },
  // 2. Canto Inferior Esquerdo (com 115px de folga do rodapé)
  { bottom: '115px', left: '20px', top: 'auto', right: 'auto', transform: 'none' },
  // 3. Canto Superior Esquerdo
  { top: '55px', left: '20px', bottom: 'auto', right: 'auto', transform: 'none' },
  // 4. Canto Inferior Direito
  { bottom: '115px', right: '20px', top: 'auto', left: 'auto', transform: 'none' },
  // 5. Lateral Esquerda (Meio da tela)
  { top: '50%', left: '16px', bottom: 'auto', right: 'auto', transform: 'translateY(-50%)' },
  // 6. Lateral Direita (Meio da tela)
  { top: '50%', right: '16px', bottom: 'auto', left: 'auto', transform: 'translateY(-50%)' },
  // 7. Topo Central (acima do card)
  { top: '50px', left: '50%', bottom: 'auto', right: 'auto', transform: 'translateX(-50%)' },
  // 8. Base Central (abaixo do card)
  { bottom: '115px', left: '50%', top: 'auto', right: 'auto', transform: 'translateX(-50%)' }
]

function dodge() {
  dodgeCount.value++
  currentNoText.value = noButtonTexts[dodgeCount.value % noButtonTexts.length]

  // Faz o Sim crescer visivelmente a cada tentativa, ficando bem caricato e chamativo
  yesScale.value = Math.min(1.85, Number((yesScale.value + 0.12).toFixed(2)))

  // Pega o próximo slot que faz o botão cruzar a tela
  const slot = fullScreenSlots[(dodgeCount.value - 1) % fullScreenSlots.length]
  noButtonPosition.value = {
    position: 'fixed',
    top: slot.top,
    bottom: slot.bottom,
    left: slot.left,
    right: slot.right,
    transform: slot.transform
  }
}

const noButtonStyle = computed(() => {
  if (noButtonPosition.value.position === 'fixed') {
    return {
      position: 'fixed' as const,
      top: noButtonPosition.value.top,
      bottom: noButtonPosition.value.bottom,
      left: noButtonPosition.value.left,
      right: noButtonPosition.value.right,
      transform: noButtonPosition.value.transform,
      zIndex: 50
    }
  }
  return {}
})

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
          Pensa com bastante carinho antes de responder, Thaís... 👀
        </p>
      </div>

      <!-- Botões de Ação -->
      <div class="flex items-center justify-center gap-4 min-h-[110px] relative">
        <!-- Botão SIM: Cresce caricato a cada clique no Não -->
        <button
          type="button"
          @click="handleAccept"
          :style="{ transform: 'scale(' + yesScale + ')' }"
          class="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 transition-transform duration-200 cursor-pointer active:scale-95 shrink-0 z-10"
        >
          SIM! ❤️
        </button>

        <!-- Botão NÃO: Foge pela tela com frases personalizadas da Thaís -->
        <button
          type="button"
          :style="noButtonStyle"
          @mouseenter="dodge"
          @touchstart.prevent="dodge"
          @pointerdown.prevent="dodge"
          @click="dodge"
          class="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm sm:text-base rounded-2xl transition-all duration-200 ease-out cursor-pointer shadow-md active:scale-95 select-none whitespace-nowrap max-w-[calc(100vw-36px)] text-center"
        >
          {{ currentNoText }}
        </button>
      </div>

      <div v-if="dodgeCount > 0" class="pt-2">
        <span class="text-xs sm:text-sm font-bold text-rose-600 bg-rose-100/70 border border-rose-200 px-4 py-2 rounded-full inline-block animate-pulse">
          Dica: eu não aceito um &quot;não&quot; como resposta, Thaís! 😜
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
          SABIA QUE VOCÊ IA ACEITAR, THAÍS! 🥰
        </h2>
        <p class="text-base sm:text-lg text-rose-700 font-semibold leading-relaxed">
          Agora é oficial! Os melhores momentos começam agora. ❤️
        </p>
      </div>
    </div>
  </div>
</template>
