<!-- components/admin/AdminLoginCard.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'

const props = defineProps<{
  errorMessage?: string
  slug: string
}>()

const emit = defineEmits<{
  (e: 'login', pin: string): void
}>()

const { tenant } = useTenant(props.slug)
const { themeClasses } = useTenantTheme(tenant)

const pinInput = ref('')

function handleSubmit() {
  emit('login', pinInput.value)
  pinInput.value = ''
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-slate-50">
    <div class="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl space-y-6">
      <div class="text-center space-y-2">
        <div
          class="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold border"
          :class="[themeClasses.badgeBg, themeClasses.primaryText, themeClasses.badgeBorder]"
        >
          ⚡
        </div>
        <h1 class="text-xl font-bold text-slate-900 tracking-tight">Painel do Lojista</h1>
        <p class="text-sm text-slate-500">Digite seu PIN de acesso para gerenciar o catálogo</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="admin-pin" class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            PIN da Loja (Padrão: 1234)
          </label>
          <input
            id="admin-pin"
            v-model="pinInput"
            type="password"
            autocomplete="current-password"
            maxlength="8"
            inputmode="numeric"
            placeholder="••••"
            class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-slate-900 outline-none transition-all font-mono"
            :class="themeClasses.focusRing"
            autofocus
          />
        </div>

        <div v-if="errorMessage" class="text-xs text-rose-600 text-center font-medium bg-rose-50 border border-rose-200 py-2 rounded-lg">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          class="w-full text-slate-950 font-bold py-3.5 rounded-xl shadow-lg transition-all cursor-pointer active:scale-[0.98]"
          :class="themeClasses.primaryBg"
        >
          Entrar no Painel
        </button>
      </form>

      <div class="text-center">
        <NuxtLink :to="`/${slug}`" class="text-xs text-slate-400 hover:text-slate-600 transition-colors">
          ← Voltar para a vitrine
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
