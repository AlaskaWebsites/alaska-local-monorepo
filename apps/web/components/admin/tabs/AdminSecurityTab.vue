<!-- components/admin/tabs/AdminSecurityTab.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { Lock, Check, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  passwordSuccessMsg?: string
  pinSuccessMsg?: string
}>()

const emit = defineEmits<{
  (e: 'change-password', payload: { currentPassword: string; newPassword: string; confirmPassword: string }): void
  (e: 'save-pin', pin: string): void
}>()

const { themeClasses } = useTenantTheme()

// Senha Corporativa do Lojista
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const localPasswordError = ref('')

function handleChangePassword() {
  localPasswordError.value = ''
  if (!currentPassword.value) {
    localPasswordError.value = 'Informe a senha atual.'
    return
  }
  if (newPassword.value.length < 8) {
    localPasswordError.value = 'A nova senha deve ter no mínimo 8 caracteres.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    localPasswordError.value = 'A nova senha e a confirmação não coincidem.'
    return
  }

  emit('change-password', {
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
    confirmPassword: confirmPassword.value,
  })

  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <!-- CARD: Troca de Senha do Lojista -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Lock class="w-4 h-4 text-slate-600" />
          <span>Alterar Senha do Lojista</span>
        </h2>
      </div>

      <p class="text-xs text-slate-500">
        Atualize sua senha corporativa de acesso com e-mail e senha. A nova senha deve ter no mínimo 8 caracteres.
      </p>

      <form @submit.prevent="handleChangePassword" class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Senha Atual:</label>
          <input
            v-model="currentPassword"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Nova Senha:</label>
            <input
              v-model="newPassword"
              type="password"
              autocomplete="new-password"
              placeholder="Mínimo 8 dígitos"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Confirmar Nova Senha:</label>
            <input
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="Repita a nova senha"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono"
            />
          </div>
        </div>

        <div v-if="localPasswordError" class="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium flex items-center gap-1.5">
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-500" />
          <span>{{ localPasswordError }}</span>
        </div>

        <div v-if="passwordSuccessMsg" class="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold text-center animate-in fade-in">
          {{ passwordSuccessMsg }}
        </div>

        <button
          type="submit"
          :disabled="!currentPassword || newPassword.length < 8"
          class="w-full text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          :class="themeClasses.primaryBg"
        >
          <Check class="w-4 h-4" />
          <span>Salvar Nova Senha Corporativa</span>
        </button>
      </form>
    </div>
  </main>
</template>
