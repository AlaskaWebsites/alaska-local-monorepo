<!-- app.vue -->
<template>
  <NuxtPage />
</template>

<style>
/* Oculta barras de rolagem horizontais e verticais nativas preservando a funcionalidade de scroll */
.no-scrollbar::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}

.no-scrollbar {
  -ms-overflow-style: none !important; /* IE e Edge */
  scrollbar-width: none !important; /* Firefox */
}

/* Suavização de renderização tipográfica e scroll fluido */
html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Garante fundo claro suave apenas no container do Admin */
.admin-themed-root {
  background-color: #f8fafc !important;
  color: #0f172a !important;
}
</style>
