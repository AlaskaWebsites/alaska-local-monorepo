<!-- components/admin/AdminLoginCard.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, ArrowLeft } from 'lucide-vue-next'

const props = defineProps<{
  errorMessage?: string
  slug: string
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'login', payload: any): void
}>()

const { tenant } = useTenant(props.slug)
const { themeClasses } = useTenantTheme(tenant)

const loginMode = ref<'credentials' | 'pin'>('credentials')
const email = ref('')
const password = ref('')
const pinInput = ref('')

function handleSubmit() {
  if (loginMode.value === 'credentials') {
    emit('login', {
      email: email.value.trim(),
      password: password.value,
    })
  } else {
    emit('login', pinInput.value.trim())
    pinInput.value = ''
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-slate-50">
    <div class="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-7 shadow-xl space-y-6">
      
      <!-- Cabeçalho com Ícone e Título -->
      <div class="text-center space-y-2">
        <div
          class="w-13 h-13 rounded-2xl mx-auto flex items-center justify-center text-xl font-bold shadow-xs transition-colors"
          :class="[themeClasses.badgeBg, themeClasses.primaryText]"
        >
          <ShieldCheck class="w-7 h-7" />
        </div>
        <h1 class="text-xl font-bold text-slate-900 tracking-tight">
          Painel do Lojista
        </h1>
        <p class="text-xs text-slate-500">
          {{ tenant?.name ? `Gestão operacional de ${tenant.name}` : 'Acesso restrito ao lojista' }}
        </p>
      </div>

      <!-- Alternador de Modo de Login (E-mail/Senha vs PIN) -->
      <div class="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs font-semibold">
        <button
          type="button"
          @click="loginMode = 'credentials'"
          class="flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          :class="loginMode === 'credentials' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
        >
          <Mail class="w-3.5 h-3.5" />
          <span>E-mail e Senha</span>
        </button>
        <button
          type="button"
          @click="loginMode = 'pin'"
          class="flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          :class="loginMode === 'pin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
        >
          <KeyRound class="w-3.5 h-3.5" />
          <span>PIN Rápido</span>
        </button>
      </div>

      <!-- Formulário de Login -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Modo 1: E-mail e Senha Corporativa (ADR 017) -->
        <template v-if="loginMode === 'credentials'">
          <div>
            <label for="admin-email" class="block text-xs font-semibold text-slate-600 mb-1.5">
              E-mail Corporativo
            </label>
            <div class="relative">
              <input
                id="admin-email"
                v-model="email"
                type="email"
                autocomplete="username"
                required
                :placeholder="`admin@${slug}.com.br`"
                class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400 transition-all"
                autofocus
              />
            </div>
          </div>

          <div>
            <label for="admin-password" class="block text-xs font-semibold text-slate-600 mb-1.5">
              Senha de Acesso
            </label>
            <div class="relative">
              <input
                id="admin-password"
                v-model="password"
                type="password"
                autocomplete="current-password"
                required
                placeholder="••••••••"
                class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400 transition-all font-mono"
              />
            </div>
          </div>

          <!-- Dica Demo -->
          <div class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-500 space-y-1">
            <span class="font-bold text-slate-700">Dica de Demonstração:</span>
            <p>
              Use <strong class="text-slate-700">{{ slug === 'bamatec' ? 'bamatec22@gmail.com' : `admin@${slug}.com.br` }}</strong> e senha <strong class="text-slate-700">minhasenhasegura</strong>
            </p>
            <p class="text-[10px] text-slate-400">
              Ou acesse em 1 clique pelo <strong class="text-slate-600">PIN 1234</strong> na aba acima.
            </p>
          </div>
        </template>

        <!-- Modo 2: PIN Numérico de Acesso Rápido -->
        <template v-else>
          <div>
            <label for="admin-pin" class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 text-center">
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
              class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-slate-900 outline-none focus:border-slate-400 transition-all font-mono"
              autofocus
            />
          </div>
        </template>

        <!-- Alerta de Erro -->
        <div
          v-if="errorMessage"
          class="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2 font-medium"
        >
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-500" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Botão Entrar -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full text-slate-950 font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 text-xs flex items-center justify-center gap-2"
          :class="themeClasses.primaryBg"
        >
          <Lock class="w-4 h-4" />
          <span>{{ isSubmitting ? 'Verificando...' : 'Entrar no Painel' }}</span>
        </button>
      </form>

      <!-- Rodapé Voltar -->
      <div class="text-center pt-1">
        <NuxtLink
          :to="`/${slug}`"
          class="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Voltar para a vitrine</span>
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
