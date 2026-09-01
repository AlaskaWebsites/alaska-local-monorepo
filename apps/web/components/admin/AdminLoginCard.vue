<!-- components/admin/AdminLoginCard.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  errorMessage?: string
  slug: string
}>()

const emit = defineEmits<{
  (e: 'login', pin: string): void
}>()

const pinInput = ref('')

function handleSubmit() {
  emit('login', pinInput.value)
  pinInput.value = ''
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl mx-auto flex items-center justify-center text-2xl font-bold">
          ⚡
        </div>
        <h1 class="text-xl font-bold text-white tracking-tight">Painel do Lojista</h1>
        <p class="text-sm text-slate-400">Digite seu PIN de acesso para gerenciar o catálogo</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="admin-pin" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
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
            class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-white outline-none transition-all font-mono"
            autofocus
          />
        </div>

        <div v-if="errorMessage" class="text-xs text-rose-400 text-center font-medium bg-rose-500/10 border border-rose-500/20 py-2 rounded-lg">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          class="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          Entrar no Painel
        </button>
      </form>

      <div class="text-center">
        <NuxtLink :to="`/${slug}`" class="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          ← Voltar para a vitrine
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
