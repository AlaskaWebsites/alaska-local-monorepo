<!-- components/admin/tabs/AdminSecurityTab.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  pinSuccessMsg?: string
}>()

const emit = defineEmits<{
  (e: 'save-pin', newPin: string): void
}>()

const newPinInput = ref('')

function handleSave() {
  emit('save-pin', newPinInput.value)
  newPinInput.value = ''
}
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h2 class="text-sm font-bold text-white flex items-center gap-2">
        <span>🔐 Alterar PIN de Acesso</span>
      </h2>
      <p class="text-xs text-slate-400">
        Troque a senha numérica de acesso ao Painel do Lojista. O PIN deve ter no mínimo 4 dígitos.
      </p>

      <div>
        <label class="block text-xs font-semibold text-slate-400 mb-1">Novo PIN da Loja:</label>
        <input
          type="password"
          v-model="newPinInput"
          maxlength="8"
          inputmode="numeric"
          placeholder="••••"
          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 text-center tracking-widest text-lg font-mono"
        />
      </div>

      <div v-if="pinSuccessMsg" class="text-xs text-emerald-400 text-center font-bold bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-lg">
        {{ pinSuccessMsg }}
      </div>

      <button
        @click="handleSave"
        class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
      >
        Atualizar PIN
      </button>
    </div>
  </main>
</template>
