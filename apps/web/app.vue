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

/* ==========================================================================
   Alaska Local - Tema Dinâmico do Painel do Lojista (Dark Modern)
   Aplica as cores de destaque da categoria/tema do negócio ativo
   ========================================================================== */
html[data-theme="amber"] .bg-emerald-500,
[data-theme="amber"] .bg-emerald-500 {
  background-color: #f59e0b !important;
  color: #020617 !important;
}
html[data-theme="amber"] .hover\:bg-emerald-400:hover,
html[data-theme="amber"] button.bg-emerald-500:hover,
[data-theme="amber"] .hover\:bg-emerald-400:hover,
[data-theme="amber"] button.bg-emerald-500:hover {
  background-color: #fbbf24 !important;
}
html[data-theme="amber"] .text-emerald-400,
[data-theme="amber"] .text-emerald-400 {
  color: #fbbf24 !important;
}
html[data-theme="amber"] .text-emerald-500,
[data-theme="amber"] .text-emerald-500 {
  color: #f59e0b !important;
}
html[data-theme="amber"] .text-emerald-300,
html[data-theme="amber"] .hover\:text-emerald-300:hover,
[data-theme="amber"] .text-emerald-300,
[data-theme="amber"] .hover\:text-emerald-300:hover {
  color: #fcd34d !important;
}
html[data-theme="amber"] .border-emerald-400,
html[data-theme="amber"] .border-emerald-500,
[data-theme="amber"] .border-emerald-400,
[data-theme="amber"] .border-emerald-500 {
  border-color: #f59e0b !important;
}
html[data-theme="amber"] .bg-emerald-500\/10,
[data-theme="amber"] .bg-emerald-500\/10 {
  background-color: rgba(245, 158, 11, 0.15) !important;
}
html[data-theme="amber"] .bg-emerald-500\/20,
[data-theme="amber"] .bg-emerald-500\/20 {
  background-color: rgba(245, 158, 11, 0.25) !important;
}
html[data-theme="amber"] .border-emerald-500\/20,
html[data-theme="amber"] .border-emerald-500\/30,
[data-theme="amber"] .border-emerald-500\/20,
[data-theme="amber"] .border-emerald-500\/30 {
  border-color: rgba(245, 158, 11, 0.35) !important;
}

/* Barber */
html[data-theme="barber"] .bg-emerald-500,
[data-theme="barber"] .bg-emerald-500 {
  background-color: #f59e0b !important;
  color: #020617 !important;
}
html[data-theme="barber"] .hover\:bg-emerald-400:hover,
html[data-theme="barber"] button.bg-emerald-500:hover,
[data-theme="barber"] .hover\:bg-emerald-400:hover,
[data-theme="barber"] button.bg-emerald-500:hover {
  background-color: #fbbf24 !important;
}
html[data-theme="barber"] .text-emerald-400,
[data-theme="barber"] .text-emerald-400 {
  color: #fbbf24 !important;
}
html[data-theme="barber"] .bg-emerald-500\/10,
[data-theme="barber"] .bg-emerald-500\/10 {
  background-color: rgba(245, 158, 11, 0.15) !important;
}
html[data-theme="barber"] .border-emerald-500\/20,
[data-theme="barber"] .border-emerald-500\/20 {
  border-color: rgba(245, 158, 11, 0.3) !important;
}

/* Rose (Studio Nail Design) */
html[data-theme="rose"] .bg-emerald-500,
[data-theme="rose"] .bg-emerald-500 {
  background-color: #f43f5e !important;
  color: #ffffff !important;
}
html[data-theme="rose"] .hover\:bg-emerald-400:hover,
html[data-theme="rose"] button.bg-emerald-500:hover,
[data-theme="rose"] .hover\:bg-emerald-400:hover,
[data-theme="rose"] button.bg-emerald-500:hover {
  background-color: #fb7185 !important;
}
html[data-theme="rose"] .text-emerald-400,
[data-theme="rose"] .text-emerald-400 {
  color: #fb7185 !important;
}
html[data-theme="rose"] .bg-emerald-500\/10,
[data-theme="rose"] .bg-emerald-500\/10 {
  background-color: rgba(244, 63, 94, 0.15) !important;
}
html[data-theme="rose"] .border-emerald-500\/20,
[data-theme="rose"] .border-emerald-500\/20 {
  border-color: rgba(244, 63, 94, 0.3) !important;
}

/* Health (Clínica Sorriso) */
html[data-theme="health"] .bg-emerald-500,
[data-theme="health"] .bg-emerald-500 {
  background-color: #14b8a6 !important;
  color: #020617 !important;
}
html[data-theme="health"] .hover\:bg-emerald-400:hover,
html[data-theme="health"] button.bg-emerald-500:hover,
[data-theme="health"] .hover\:bg-emerald-400:hover,
[data-theme="health"] button.bg-emerald-500:hover {
  background-color: #2dd4bf !important;
}
html[data-theme="health"] .text-emerald-400,
[data-theme="health"] .text-emerald-400 {
  color: #2dd4bf !important;
}
html[data-theme="health"] .bg-emerald-500\/10,
[data-theme="health"] .bg-emerald-500\/10 {
  background-color: rgba(20, 184, 166, 0.15) !important;
}
html[data-theme="health"] .border-emerald-500\/20,
[data-theme="health"] .border-emerald-500\/20 {
  border-color: rgba(20, 184, 166, 0.3) !important;
}

/* Food & Default (Hamburgueria, Pizzaria) */
html[data-theme="food"] .bg-emerald-500,
html[data-theme="default"] .bg-emerald-500,
[data-theme="food"] .bg-emerald-500,
[data-theme="default"] .bg-emerald-500 {
  background-color: #ef4444 !important;
  color: #ffffff !important;
}
html[data-theme="food"] .hover\:bg-emerald-400:hover,
html[data-theme="food"] button.bg-emerald-500:hover,
[data-theme="food"] .hover\:bg-emerald-400:hover,
[data-theme="food"] button.bg-emerald-500:hover {
  background-color: #f87171 !important;
}
html[data-theme="food"] .text-emerald-400,
[data-theme="food"] .text-emerald-400 {
  color: #f87171 !important;
}
html[data-theme="food"] .bg-emerald-500\/10,
[data-theme="food"] .bg-emerald-500\/10 {
  background-color: rgba(239, 68, 68, 0.15) !important;
}
html[data-theme="food"] .border-emerald-500\/20,
[data-theme="food"] .border-emerald-500\/20 {
  border-color: rgba(239, 68, 68, 0.3) !important;
}
</style>
