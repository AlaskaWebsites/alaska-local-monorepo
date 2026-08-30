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
</style>
