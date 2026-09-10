<!-- components/admin/tabs/AdminSecurityTab.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { Lock, Check } from 'lucide-vue-next'

const props = defineProps<{
  pinSuccessMsg?: string
}>()

const emit = defineEmits<{
  (e: 'save-pin', pin: string): void
}>()

const { themeClasses } = useTenantTheme()
const newPin = ref('')

function handleSave() {
  if (newPin.value.trim().length >= 4) {
    emit('save-pin', newPin.value.trim())
    newPin.value = ''
  }
}
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Lock class="w-4 h-4 text-slate-600" />
          <span>Alterar PIN de Acesso</span>
        </h2>
      </div>

      <p class="text-xs text-slate-500">
        Defina um novo código numérico de 4 a 8 dígitos para login no painel do lojista.
      </p>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Novo PIN (4 a 8 dígitos):</label>
          <input
            type="password"
            v-model="newPin"
            maxlength="8"
            inputmode="numeric"
            placeholder="••••"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-xl tracking-widest text-slate-900 outline-none focus:border-slate-400 font-mono"
          />
        </div>

        <div v-if="pinSuccessMsg" class="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold text-center animate-in fade-in">
          {{ pinSuccessMsg }}
        </div>

        <button
          @click="handleSave"
          :disabled="newPin.trim().length < 4"
          class="w-full text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          :class="themeClasses.primaryBg"
        >
          <Check class="w-4 h-4" />
          <span>Atualizar PIN de Segurança</span>
        </button>
      </div>
    </div>
  </main>
</template>
