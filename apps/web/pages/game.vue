<!-- pages/game.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const accepted = ref(false)
const dodgeCount = ref(0)

const noButtonPosition = ref<{ top: string; left: string; position: 'static' | 'fixed' }>({
  top: 'auto',
  left: 'auto',
  position: 'static'
})

const noButtonTexts = [
  'Não',
  'Tem certeza? 🥺',
  'Pensa bem! 👀',
  'Ops, errou! 😂',
  'Nem tenta kkk',
  'Erro 404: Não encontrado',
  'Clica no Sim logo! ❤️',
  'Sem chance 😜',
  'Desiste hahaha',
  'Só vale SIM! 💍'
]

const currentNoText = ref('Não')
const yesScale = ref(1)

// Posições percentuais seguras (âncora central com translate(-50%, -50%)):
// Alternam ativamente entre CIMA e BAIXO, mantendo-se sempre no miolo visível da tela do celular sem nunca encostar nos cantos ou sumir
const safeSpots = [
  { top: '22%', left: '50%' }, // 1. Acima do card (topo central)
  { top: '72%', left: '50%' }, // 2. Abaixo do card (base central)
  { top: '35%', left: '42%' }, // 3. Meio superior esquerdo
  { top: '65%', left: '58%' }, // 4. Meio inferior direito
  { top: '25%', left: '56%' }, // 5. Acima do card à direita
  { top: '70%', left: '44%' }, // 6. Abaixo do card à esquerda
  { top: '38%', left: '50%' }, // 7. Centro superior
  { top: '67%', left: '50%' }  // 8. Centro inferior
]

function dodge() {
  dodgeCount.value++
  currentNoText.value = noButtonTexts[dodgeCount.value % noButtonTexts.length]

  // Faz o Sim crescer gradualmente para convidar ao clique
  yesScale.value = Math.min(1.4, Number((yesScale.value + 0.06).toFixed(2)))

  // Pega o próximo spot seguro da lista
  const spot = safeSpots[(dodgeCount.value - 1) % safeSpots.length]
  noButtonPosition.value = {
    top: spot.top,
    left: spot.left,
    position: 'fixed'
  }
}

const noButtonStyle = computed(() => {
  if (noButtonPosition.value.position === 'fixed') {
    return {
      position: 'fixed' as const,
      top: noButtonPosition.value.top,
      left: noButtonPosition.value.left,
      transform: 'translate(-50%, -50%)',
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

        <!-- Botão NÃO: Foge com âncora central percentual fixa, 100% contido no campo de visão da tela -->
        <button
          type="button"
          :style="noButtonStyle"
          @mouseenter="dodge"
          @touchstart.prevent="dodge"
          @pointerdown.prevent="dodge"
          @click="dodge"
          class="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm sm:text-base rounded-2xl transition-all duration-150 cursor-pointer shadow-md active:scale-95 select-none whitespace-nowrap max-w-[85vw] text-center"
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
