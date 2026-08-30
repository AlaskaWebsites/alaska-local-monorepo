<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
    <ClientOnly>
      <!-- 1. Tela de Login por PIN -->
      <div v-if="!isAuthenticated" class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div class="text-center space-y-2">
            <div class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl mx-auto flex items-center justify-center text-2xl font-bold">
              ⚡
            </div>
            <h1 class="text-xl font-bold text-white tracking-tight">Painel do Lojista</h1>
            <p class="text-sm text-slate-400">Digite seu PIN de acesso para gerenciar o catálogo</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label for="admin-pin" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                PIN da Loja (Padrão: 1234)
              </label>
              <input
                id="admin-pin"
                v-model="pinInput"
                type="password"
                maxlength="8"
                inputmode="numeric"
                placeholder="••••"
                class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-white outline-none transition-all"
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

      <!-- 2. Painel Operacional Ativo -->
      <div v-else class="max-w-2xl mx-auto pb-24">
        <!-- Header Superior Fixo -->
        <header class="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <NuxtLink :to="`/${slug}`" class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors" title="Ver vitrine">
              ←
            </NuxtLink>
            <div>
              <h1 class="text-sm font-bold text-white leading-tight flex items-center gap-2">
                {{ tenant?.name || 'Gestão da Loja' }}
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </h1>
              <p class="text-[11px] text-slate-400">Modo Operacional em Tempo Real</p>
            </div>
          </div>

          <button
            @click="logout"
            class="text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Sair
          </button>
        </header>

        <!-- Banner de Aviso Operacional -->
        <div class="p-4">
          <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-start gap-3">
            <span class="text-lg">⚡</span>
            <div class="text-xs">
              <p class="font-bold text-emerald-400">Pausa Rápida de Produtos (< 3s)</p>
              <p class="text-slate-300 mt-0.5">Acabou algum ingrediente ou item? Clique no botão para pausar no cardápio na hora.</p>
            </div>
          </div>
        </div>

        <!-- Lista de Categorias e Produtos -->
        <main class="px-4 space-y-6">
          <section v-for="category in categories" :key="category.id" class="space-y-3">
            <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span>{{ category.name }}</span>
              <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{{ (category.products || []).length }}</span>
            </h2>

            <div class="space-y-2">
              <div
                v-for="product in (category.products || [])"
                :key="product.id"
                class="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between gap-4 transition-all"
                :class="{ 'opacity-60 bg-slate-950/40 border-dashed': !product.isAvailable }"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-semibold text-white truncate">{{ product.name }}</h3>
                    <span
                      class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                      :class="product.isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
                    >
                      {{ product.isAvailable ? 'Ativo' : 'Esgotado' }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 mt-0.5 font-mono">
                    R$ {{ Number(product.price).toFixed(2).replace('.', ',') }}
                  </p>
                </div>

                <!-- Switch Acessível W3C / WCAG -->
                <button
                  type="button"
                  role="switch"
                  :aria-checked="product.isAvailable"
                  :aria-label="`Alternar disponibilidade de ${product.name}`"
                  @click="toggleProduct(category.products, product.id, product.isAvailable)"
                  class="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                  :class="product.isAvailable ? 'bg-emerald-500' : 'bg-slate-800'"
                >
                  <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                    :class="product.isAvailable ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      <!-- Fallback SSR / Loading -->
      <template #fallback>
        <div class="min-h-screen flex items-center justify-center p-4">
          <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useMerchantAdmin } from '~/composables/useMerchantAdmin'
import type { Product, Category } from '@alaska/contracts'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const { tenant } = useTenant(slug)
const { isAuthenticated, errorMessage, login, logout, toggleProductAvailability, applyOverridesToCategories } = useMerchantAdmin(slug.value)

const pinInput = ref('')

const categories = computed<Category[]>(() => {
  return (tenant.value?.categories || []) as Category[]
})

// Aplica overrides salvos aos produtos na tela do admin
watchEffect(() => {
  if (categories.value.length > 0) {
    applyOverridesToCategories(categories.value)
  }
})

function handleLogin() {
  login(pinInput.value)
  pinInput.value = ''
}

function toggleProduct(products: Product[], productId: string, currentStatus: boolean) {
  toggleProductAvailability(products, productId, currentStatus)
}
</script>
