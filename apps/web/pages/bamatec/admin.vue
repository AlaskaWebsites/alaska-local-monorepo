<!-- apps/web/pages/bamatec/admin.vue -->
<script setup lang="ts">
// Painel do lojista desativado temporariamente para o tenant Bama TEC
await navigateTo('/bamatec', { redirectCode: 302 })
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-600 font-sans">
    <div class="text-center space-y-3 bg-white p-8 rounded-3xl border border-slate-200/90 shadow-2xs max-w-md">
      <div class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-xl">
        ⚙️
      </div>
      <h2 class="text-base font-black text-slate-900">Painel do Lojista Desativado</h2>
      <p class="text-xs text-slate-500 leading-relaxed">
        O painel administrativo da Bama TEC está desativado temporariamente. Redirecionando para a vitrine...
      </p>
      <NuxtLink to="/bamatec" class="inline-block px-5 py-2.5 bg-[#2d7097] text-white font-bold text-xs rounded-xl shadow-xs">
        Voltar para Bama TEC
      </NuxtLink>
    </div>
  </div>
</template>
