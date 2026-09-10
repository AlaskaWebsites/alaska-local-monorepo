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
   Alaska Local - Tema Claro Suave do Painel do Lojista (Light Eye-Friendly)
   Padroniza o Admin com os mesmos tons de branco e descanso visual da vitrine
   ========================================================================== */
.admin-themed-root,
.min-h-screen.bg-slate-950 {
  background-color: #f8fafc !important; /* bg-slate-50 */
  color: #0f172a !important; /* text-slate-900 */
}

/* Containers e Cards do Admin */
.admin-themed-root .bg-slate-900,
.admin-themed-root .bg-slate-900\/90,
.admin-themed-root .bg-slate-900\/80,
.admin-themed-root .bg-slate-900\/60,
.min-h-screen.bg-slate-950 .bg-slate-900,
.min-h-screen.bg-slate-950 .bg-slate-900\/90,
.min-h-screen.bg-slate-950 .bg-slate-900\/80,
.min-h-screen.bg-slate-950 .bg-slate-900\/60 {
  background-color: #ffffff !important;
  border-color: #e2e8f0 !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04) !important;
}

.admin-themed-root .bg-slate-950,
.admin-themed-root .bg-slate-950\/90,
.admin-themed-root .bg-slate-950\/40,
.min-h-screen.bg-slate-950 .bg-slate-950,
.min-h-screen.bg-slate-950 .bg-slate-950\/90,
.min-h-screen.bg-slate-950 .bg-slate-950\/40 {
  background-color: #f8fafc !important;
  border-color: #e2e8f0 !important;
}

/* Inputs, Textareas e Selects do Admin */
.admin-themed-root input,
.admin-themed-root textarea,
.admin-themed-root select,
.min-h-screen.bg-slate-950 input,
.min-h-screen.bg-slate-950 textarea,
.min-h-screen.bg-slate-950 select {
  background-color: #ffffff !important;
  border-color: #e2e8f0 !important;
  color: #0f172a !important;
}

.admin-themed-root input::placeholder,
.admin-themed-root textarea::placeholder {
  color: #94a3b8 !important;
}

/* Tipografia Suave */
.admin-themed-root .text-white,
.min-h-screen.bg-slate-950 .text-white {
  color: #0f172a !important;
}
.admin-themed-root .text-slate-100,
.min-h-screen.bg-slate-950 .text-slate-100 {
  color: #1e293b !important;
}
.admin-themed-root .text-slate-300,
.min-h-screen.bg-slate-950 .text-slate-300 {
  color: #334155 !important;
}
.admin-themed-root .text-slate-400,
.min-h-screen.bg-slate-950 .text-slate-400 {
  color: #64748b !important;
}

/* Bordas suaves */
.admin-themed-root .border-slate-800,
.admin-themed-root .border-slate-800\/80,
.admin-themed-root .border-slate-700,
.min-h-screen.bg-slate-950 .border-slate-800,
.min-h-screen.bg-slate-950 .border-slate-800\/80,
.min-h-screen.bg-slate-950 .border-slate-700 {
  border-color: #e2e8f0 !important;
}

/* Botões Secundários */
.admin-themed-root .bg-slate-800,
.admin-themed-root .bg-slate-800\/80,
.min-h-screen.bg-slate-950 .bg-slate-800,
.min-h-screen.bg-slate-950 .bg-slate-800\/80 {
  background-color: #f1f5f9 !important;
  color: #334155 !important;
  border-color: #e2e8f0 !important;
}
.admin-themed-root .hover\:bg-slate-700:hover {
  background-color: #e2e8f0 !important;
}

/* Switch inativo */
.admin-themed-root button[role="switch"].bg-slate-800,
.min-h-screen.bg-slate-950 button[role="switch"].bg-slate-800 {
  background-color: #cbd5e1 !important;
}

/* Modais do Admin */
.admin-themed-root .fixed .bg-slate-900 {
  background-color: #ffffff !important;
  border-color: #e2e8f0 !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
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
