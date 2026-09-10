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
   Alaska Local - Tema Claro Suave do Fundo do Admin (bg-slate-50)
   Transforma o background escuro (bg-slate-950) na tonalidade suave de descanso
   ========================================================================== */
html[data-theme] .bg-slate-950,
[data-theme] .bg-slate-950 {
  background-color: #f8fafc !important; /* bg-slate-50 */
  color: #0f172a !important; /* text-slate-900 */
}

html[data-theme] .bg-slate-950\/90,
[data-theme] .bg-slate-950\/90 {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-color: #e2e8f0 !important;
  color: #0f172a !important;
}

html[data-theme] .bg-slate-900,
html[data-theme] .bg-slate-900\/90,
html[data-theme] .bg-slate-900\/80,
[data-theme] .bg-slate-900,
[data-theme] .bg-slate-900\/90,
[data-theme] .bg-slate-900\/80 {
  background-color: #ffffff !important;
  border-color: #e2e8f0 !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04) !important;
}

html[data-theme] .text-slate-400,
[data-theme] .text-slate-400 {
  color: #64748b !important;
}

html[data-theme] .bg-slate-800,
[data-theme] .bg-slate-800 {
  background-color: #f1f5f9 !important;
  color: #475569 !important;
  border-color: #e2e8f0 !important;
}

html[data-theme] .border-slate-800,
[data-theme] .border-slate-800 {
  border-color: #e2e8f0 !important;
}

/* ==========================================================================
   Seleção Dinâmica de Texto (Mouse Drag Highlight) por Categoria / Loja
   ========================================================================== */
html[data-theme="amber"] *::selection,
[data-theme="amber"] *::selection {
  background-color: #f59e0b !important;
  color: #020617 !important;
}
html[data-theme="amber"] *::-moz-selection,
[data-theme="amber"] *::-moz-selection {
  background-color: #f59e0b !important;
  color: #020617 !important;
}

html[data-theme="barber"] *::selection,
[data-theme="barber"] *::selection {
  background-color: #f59e0b !important;
  color: #020617 !important;
}
html[data-theme="barber"] *::-moz-selection,
[data-theme="barber"] *::-moz-selection {
  background-color: #f59e0b !important;
  color: #020617 !important;
}

html[data-theme="rose"] *::selection,
[data-theme="rose"] *::selection {
  background-color: #f43f5e !important;
  color: #ffffff !important;
}
html[data-theme="rose"] *::-moz-selection,
[data-theme="rose"] *::-moz-selection {
  background-color: #f43f5e !important;
  color: #ffffff !important;
}

html[data-theme="health"] *::selection,
[data-theme="health"] *::selection {
  background-color: #14b8a6 !important;
  color: #020617 !important;
}
html[data-theme="health"] *::-moz-selection,
[data-theme="health"] *::-moz-selection {
  background-color: #14b8a6 !important;
  color: #020617 !important;
}

html[data-theme="food"] *::selection,
html[data-theme="default"] *::selection,
[data-theme="food"] *::selection,
[data-theme="default"] *::selection {
  background-color: #ef4444 !important;
  color: #ffffff !important;
}
html[data-theme="food"] *::-moz-selection,
html[data-theme="default"] *::-moz-selection,
[data-theme="food"] *::-moz-selection,
[data-theme="default"] *::-moz-selection {
  background-color: #ef4444 !important;
  color: #ffffff !important;
}

html[data-theme="drinks"] *::selection,
[data-theme="drinks"] *::selection {
  background-color: #9333ea !important;
  color: #ffffff !important;
}
html[data-theme="drinks"] *::-moz-selection,
[data-theme="drinks"] *::-moz-selection {
  background-color: #9333ea !important;
  color: #ffffff !important;
}

html[data-theme="violet"] *::selection,
[data-theme="violet"] *::selection {
  background-color: #8b5cf6 !important;
  color: #ffffff !important;
}
html[data-theme="violet"] *::-moz-selection,
[data-theme="violet"] *::-moz-selection {
  background-color: #8b5cf6 !important;
  color: #ffffff !important;
}

html[data-theme="blue"] *::selection,
[data-theme="blue"] *::selection {
  background-color: #3b82f6 !important;
  color: #ffffff !important;
}
html[data-theme="blue"] *::-moz-selection,
[data-theme="blue"] *::-moz-selection {
  background-color: #3b82f6 !important;
  color: #ffffff !important;
}

html[data-theme="slate"] *::selection,
[data-theme="slate"] *::selection {
  background-color: #94a3b8 !important;
  color: #020617 !important;
}
html[data-theme="slate"] *::-moz-selection,
[data-theme="slate"] *::-moz-selection {
  background-color: #94a3b8 !important;
  color: #020617 !important;
}

/* ==========================================================================
   Cores de Acento do Negócio (Amber, Barber, Rose, Health, Food, etc.)
   ========================================================================== */
html[data-theme="amber"] .bg-emerald-500,
[data-theme="amber"] .bg-emerald-500 {
  background-color: #f59e0b !important;
  color: #020617 !important;
}
html[data-theme="amber"] .text-emerald-400,
[data-theme="amber"] .text-emerald-400 {
  color: #d97706 !important;
}
html[data-theme="amber"] .bg-emerald-500\/10,
[data-theme="amber"] .bg-emerald-500\/10 {
  background-color: #fef3c7 !important;
}
html[data-theme="amber"] .border-emerald-500\/20,
[data-theme="amber"] .border-emerald-500\/20 {
  border-color: #fde68a !important;
}

/* Barber */
html[data-theme="barber"] .bg-emerald-500,
[data-theme="barber"] .bg-emerald-500 {
  background-color: #f59e0b !important;
  color: #020617 !important;
}
html[data-theme="barber"] .text-emerald-400,
[data-theme="barber"] .text-emerald-400 {
  color: #d97706 !important;
}
html[data-theme="barber"] .bg-emerald-500\/10,
[data-theme="barber"] .bg-emerald-500\/10 {
  background-color: #fef3c7 !important;
}

/* Rose */
html[data-theme="rose"] .bg-emerald-500,
[data-theme="rose"] .bg-emerald-500 {
  background-color: #f43f5e !important;
  color: #ffffff !important;
}
html[data-theme="rose"] .text-emerald-400,
[data-theme="rose"] .text-emerald-400 {
  color: #e11d48 !important;
}
html[data-theme="rose"] .bg-emerald-500\/10,
[data-theme="rose"] .bg-emerald-500\/10 {
  background-color: #ffe4e6 !important;
}

/* Health */
html[data-theme="health"] .bg-emerald-500,
[data-theme="health"] .bg-emerald-500 {
  background-color: #14b8a6 !important;
  color: #020617 !important;
}
html[data-theme="health"] .text-emerald-400,
[data-theme="health"] .text-emerald-400 {
  color: #0d9488 !important;
}
html[data-theme="health"] .bg-emerald-500\/10,
[data-theme="health"] .bg-emerald-500\/10 {
  background-color: #ccfbf1 !important;
}

/* Food & Default */
html[data-theme="food"] .bg-emerald-500,
html[data-theme="default"] .bg-emerald-500,
[data-theme="food"] .bg-emerald-500,
[data-theme="default"] .bg-emerald-500 {
  background-color: #ef4444 !important;
  color: #ffffff !important;
}
html[data-theme="food"] .text-emerald-400,
[data-theme="food"] .text-emerald-400 {
  color: #dc2626 !important;
}
html[data-theme="food"] .bg-emerald-500\/10,
[data-theme="food"] .bg-emerald-500\/10 {
  background-color: #fee2e2 !important;
}
</style>
