<!-- apps/web/pages/galvanoplastia.vue -->
<script setup lang="ts">
// Redireciona a rota legada isolada para a rota oficial do tenant Bama TEC no ecossistema Alaska Local
await navigateTo('/bamatec', { redirectCode: 301 })
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-600">
    <div class="text-center space-y-3">
      <p class="text-sm font-semibold">Redirecionando para Bama TEC no ecossistema Alaska Local...</p>
      <NuxtLink to="/bamatec" class="inline-block px-5 py-2.5 bg-[#2d7097] text-white font-bold text-xs rounded-xl shadow-xs">
        Acessar Bama TEC
      </NuxtLink>
    </div>
  </div>
</template>
