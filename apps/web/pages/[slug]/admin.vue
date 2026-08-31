<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
    <!-- Toast de Notificação Operacional -->
    <div
      v-if="toastMessage"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200 border border-emerald-400"
    >
      <span>⚡</span>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- 1. Tela de Login por PIN -->
    <div v-if="!isAuthenticated" class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl mx-auto flex items-center justify-center text-2xl font-bold">
            ⚡
          </div>
          <h1 class="text-xl font-bold text-white tracking-tight">Painel do Lojista</h1>
          <p class="text-sm text-slate-400">Digite seu PIN de acesso para gerenciar a loja</p>
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
              <span class="w-2 h-2 rounded-full" :class="isEmergencyClosed ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse'"></span>
            </h1>
            <p class="text-[11px] text-slate-400">
              {{ isHealthStore ? '🩺 Gestão de Consultas & Especialistas' : isServiceStore ? '💈 Gestão de Serviços & Barbeiros' : '🍔 Gestão de Cardápio & Delivery' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="handleReset"
            class="text-[10px] font-semibold text-slate-400 hover:text-amber-400 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Resetar overrides locais"
          >
            Resetar
          </button>
          <button
            @click="logout"
            class="text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
      </header>

      <!-- Navegação por Abas Operacionais -->
      <div class="px-4 mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          @click="activeTab = 'catalog'"
          class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
          :class="activeTab === 'catalog' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'"
        >
          {{ isServiceStore ? '📋 Serviços & Itens' : '🍔 Cardápio & Itens' }}
        </button>

        <button
          v-if="isServiceStore"
          @click="activeTab = 'agenda'"
          class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
          :class="activeTab === 'agenda' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'"
        >
          {{ isHealthStore ? '🩺 Especialistas & Agenda' : '💈 Barbeiros & Agenda' }}
        </button>

        <button
          @click="activeTab = 'pix_contact'"
          class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
          :class="activeTab === 'pix_contact' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'"
        >
          💠 Pix & Contato
        </button>

        <button
          @click="activeTab = 'hours'"
          class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
          :class="activeTab === 'hours' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'"
        >
          🕒 Horários & Pausa
        </button>

        <button
          v-if="!isServiceStore"
          @click="activeTab = 'delivery'"
          class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
          :class="activeTab === 'delivery' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'"
        >
          🛵 Delivery & Taxas
        </button>

        <button
          @click="activeTab = 'announcement'"
          class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
          :class="activeTab === 'announcement' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'"
        >
          📢 Comunicado
        </button>

        <button
          @click="activeTab = 'security'"
          class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
          :class="activeTab === 'security' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'"
        >
          🔒 Segurança
        </button>
      </div>

      <!-- ========================================== -->
      <!-- ABA 1: Catálogo, Cardápio & Opcionais       -->
      <!-- ========================================== -->
      <main v-if="activeTab === 'catalog'" class="px-4 mt-4 space-y-6">
        <!-- Banner de Ações Rápidas -->
        <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div class="text-xs space-y-0.5">
            <p class="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>⚡</span> Gestão de Itens & Opcionais
            </p>
            <p class="text-slate-300">Pause itens/adicionais esgotados, altere preços e crie novos produtos sem deploy.</p>
          </div>
          <button
            @click="openNewProductModal"
            class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shrink-0 transition-all cursor-pointer shadow-md flex items-center gap-1"
          >
            <span>+</span> Novo Item
          </button>
        </div>

        <!-- Lista de Categorias e Produtos -->
        <section v-for="category in effectiveCategories" :key="category.id" class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span>{{ category.name }}</span>
              <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{{ (category.products || []).length }}</span>
            </h2>
            <button
              @click="openNewProductModalWithCategory(category.id)"
              class="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              + Adicionar nesta categoria
            </button>
          </div>

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
                <div class="flex items-center gap-3 mt-1 text-xs">
                  <span class="text-slate-300 font-mono font-semibold">
                    R$ {{ Number(product.price).toFixed(2).replace('.', ',') }}
                  </span>
                  <button
                    @click="openPriceEditModal(product)"
                    class="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Editar preço
                  </button>
                  <button
                    @click="confirmDeleteProduct(product)"
                    class="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer ml-auto"
                    title="Excluir item"
                  >
                    🗑️ Excluir
                  </button>
                </div>
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

        <!-- Subseção: Pausa Rápida de Adicionais & Opcionais em Tempo Real -->
        <section v-if="allExtractedOptions.length > 0" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>🧀 Adicionais & Opcionais em Tempo Real</span>
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              Acabou o bacon, queijo ou algum adicional no estoque? Pause aqui para bloquear a seleção nos produtos.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div
              v-for="opt in allExtractedOptions"
              :key="opt.id"
              class="p-3 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-between gap-3 transition-all"
              :class="{ 'opacity-60 border-rose-500/20 bg-slate-950/40': isOptionPaused(opt.id) }"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-white truncate">{{ opt.name }}</span>
                  <span
                    class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase"
                    :class="!isOptionPaused(opt.id) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'"
                  >
                    {{ !isOptionPaused(opt.id) ? 'Disponível' : 'Esgotado' }}
                  </span>
                </div>
                <p class="text-[10px] text-slate-400 mt-0.5">
                  {{ opt.groupName }} • <span class="font-mono text-slate-300">R$ {{ Number(opt.price || 0).toFixed(2).replace('.', ',') }}</span>
                </p>
              </div>

              <button
                type="button"
                role="switch"
                :aria-checked="!isOptionPaused(opt.id)"
                :aria-label="`Alternar status do adicional ${opt.name}`"
                @click="handleOptionToggle(opt.id, !isOptionPaused(opt.id), opt.name)"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
                :class="!isOptionPaused(opt.id) ? 'bg-emerald-500' : 'bg-slate-800'"
              >
                <span
                  aria-hidden="true"
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                  :class="!isOptionPaused(opt.id) ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>
          </div>
        </section>
      </main>

      <!-- ========================================== -->
      <!-- ABA 2: Equipe, Especialistas & Agenda      -->
      <!-- ========================================== -->
      <main v-else-if="activeTab === 'agenda' && isServiceStore" class="px-4 mt-4 space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-bold text-white flex items-center gap-2">
                <span>{{ isHealthStore ? '🩺 Especialistas & Horários Individuais' : '💈 Barbeiros & Horários Individuais' }}</span>
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                Configure a escala, horário de atendimento, almoço e crie novos profissionais.
              </p>
            </div>
            <button
              @click="openNewProfModal"
              class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs shrink-0 transition-all cursor-pointer shadow-md flex items-center gap-1"
            >
              <span>+</span> Novo
            </button>
          </div>

          <div class="space-y-4 pt-1">
            <div
              v-for="prof in effectiveProfessionalsList"
              :key="prof.id"
              class="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4 transition-all"
              :class="{ 'opacity-70 border-rose-500/20': !prof.isAvailable }"
            >
              <!-- Linha 1: Nome, Especialidade, Switch e Excluir -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs transition-colors"
                    :class="prof.isAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'"
                  >
                    {{ prof.name.charAt(0) }}
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-white leading-tight">{{ prof.name }}</h3>
                    <p class="text-xs text-slate-400">{{ prof.role }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <button
                    v-if="effectiveProfessionalsList.length > 1"
                    @click="confirmDeleteProf(prof)"
                    class="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
                    title="Excluir profissional"
                  >
                    🗑️
                  </button>

                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold uppercase" :class="prof.isAvailable ? 'text-emerald-400' : 'text-rose-400'">
                      {{ prof.isAvailable ? 'Atendendo' : 'De Folga' }}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      :aria-checked="prof.isAvailable"
                      :aria-label="`Alternar folga de ${prof.name}`"
                      @click="handleProfToggle(prof.id, prof.isAvailable, prof.name)"
                      class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
                      :class="prof.isAvailable ? 'bg-emerald-500' : 'bg-slate-800'"
                    >
                      <span
                        aria-hidden="true"
                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                        :class="prof.isAvailable ? 'translate-x-5' : 'translate-x-0'"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Linha 2: Dias de Atendimento na Semana -->
              <div class="pt-2 border-t border-slate-800/80 space-y-1.5">
                <span class="text-[10px] text-slate-400 font-semibold block">Dias de Atendimento na Semana:</span>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <button
                    v-for="(dayName, dIdx) in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']"
                    :key="dIdx"
                    type="button"
                    @click="handleProfDayToggle(prof.id, dIdx, prof.name)"
                    class="px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer select-none active:scale-95 border"
                    :class="prof.availableDays?.includes(dIdx) ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'"
                  >
                    {{ dayName }}
                  </button>
                </div>
              </div>

              <!-- Linha 3: Horário de Expediente & Intervalo de Almoço -->
              <div class="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <!-- Horário de Atendimento -->
                <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <span class="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <span>⏰ Expediente de Atendimento:</span>
                  </span>
                  <div class="flex items-center gap-1.5">
                    <input
                      type="time"
                      v-model="prof.workHours.start"
                      @change="handleProfWorkHoursChange(prof.id, prof.workHours, prof.name)"
                      class="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono w-20 text-center"
                    />
                    <span class="text-slate-500 text-xs">às</span>
                    <input
                      type="time"
                      v-model="prof.workHours.end"
                      @change="handleProfWorkHoursChange(prof.id, prof.workHours, prof.name)"
                      class="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono w-20 text-center"
                    />
                  </div>
                </div>

                <!-- Intervalo de Almoço / Pausa -->
                <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <span>🍽️ Pausa / Almoço:</span>
                    </span>
                    <label class="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="prof.lunchBreak.enabled"
                        @change="handleProfLunchChange(prof.id, prof.lunchBreak, prof.name)"
                        class="rounded border-slate-700 bg-slate-950 text-emerald-500 h-3 w-3"
                      />
                      <span class="text-[9px] text-slate-400 font-semibold">Ativar</span>
                    </label>
                  </div>

                  <div v-if="prof.lunchBreak.enabled" class="flex items-center gap-1.5">
                    <input
                      type="time"
                      v-model="prof.lunchBreak.start"
                      @change="handleProfLunchChange(prof.id, prof.lunchBreak, prof.name)"
                      class="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono w-20 text-center"
                    />
                    <span class="text-slate-500 text-xs">às</span>
                    <input
                      type="time"
                      v-model="prof.lunchBreak.end"
                      @change="handleProfLunchChange(prof.id, prof.lunchBreak, prof.name)"
                      class="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono w-20 text-center"
                    />
                  </div>
                  <span v-else class="text-[10px] text-slate-500 block pt-0.5">Sem intervalo programado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Bloqueio de Horários Específicos da Agenda -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <span>📅 Bloqueio de Horários na Agenda</span>
          </h2>
          <p class="text-xs text-slate-400">
            Selecione uma data e clique nos horários que deseja fechar (ex: compromisso médico, reunião ou manutenção).
          </p>

          <div class="flex items-center gap-3">
            <input
              type="date"
              v-model="selectedAgendaDate"
              class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            />
            <span class="text-xs text-slate-400">Data selecionada</span>
          </div>

          <div class="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-2">
            <button
              v-for="time in sampleSlots"
              :key="time"
              type="button"
              @click="handleBlockSlotToggle(selectedAgendaDate, time)"
              class="py-2.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer text-center"
              :class="isSlotBlocked(selectedAgendaDate, time) ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 line-through' : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'"
            >
              {{ time }}
            </button>
          </div>
        </div>
      </main>

      <!-- ========================================== -->
      <!-- ABA 3: Chave Pix & Contatos da Loja        -->
      <!-- ========================================== -->
      <main v-else-if="activeTab === 'pix_contact'" class="px-4 mt-4 space-y-6">
        <!-- 1. Configuração de Chave Pix -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>💠 Chave Pix para Recebimento</span>
            </h2>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              D+0 Direto na Conta
            </span>
          </div>
          <p class="text-xs text-slate-400">
            Atualize a chave Pix e os dados do titular da loja para geração automática do QR Code e Pix Copia e Cola.
          </p>

          <div class="space-y-3 pt-1 text-xs">
            <div>
              <label class="block text-[11px] text-slate-400 font-semibold mb-1">Tipo de Chave Pix:</label>
              <select
                v-model="pixForm.keyType"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="phone">Telefone / Celular</option>
                <option value="email">E-mail</option>
                <option value="random">Chave Aleatória (EVP)</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] text-slate-400 font-semibold mb-1">Chave Pix:</label>
              <input
                type="text"
                v-model="pixForm.pixKey"
                placeholder="Ex: 11988887777 ou chave aleatória"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] text-slate-400 font-semibold mb-1">Nome do Titular / Empresa:</label>
                <input
                  type="text"
                  v-model="pixForm.beneficiary"
                  placeholder="Ex: Clínica Sorriso LTDA"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label class="block text-[11px] text-slate-400 font-semibold mb-1">Cidade do Titular (BACEN):</label>
                <input
                  type="text"
                  v-model="pixForm.city"
                  placeholder="Ex: SAO PAULO"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 uppercase"
                />
              </div>
            </div>

            <button
              @click="savePixConfig"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-2"
            >
              Salvar Dados do Pix
            </button>
          </div>
        </div>

        <!-- 2. WhatsApp & Redes Sociais -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <span>📱 WhatsApp & Redes de Atendimento</span>
          </h2>
          <p class="text-xs text-slate-400">
            Número de WhatsApp que recebe as mensagens automáticas com os pedidos e agendamentos dos clientes.
          </p>

          <div class="space-y-3 pt-1 text-xs">
            <div>
              <label class="block text-[11px] text-slate-400 font-semibold mb-1">Número de WhatsApp (com DDD):</label>
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  v-model="contactForm.whatsapp"
                  placeholder="Ex: 11988887777"
                  class="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
                <a
                  v-if="contactForm.whatsapp"
                  :href="`https://wa.me/${sanitizedWhatsApp(contactForm.whatsapp)}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold text-xs hover:bg-emerald-500/20 transition-all shrink-0"
                >
                  Testar Link ↗
                </a>
              </div>
            </div>

            <div>
              <label class="block text-[11px] text-slate-400 font-semibold mb-1">Perfil do Instagram (@ ou URL):</label>
              <input
                type="text"
                v-model="contactForm.instagram"
                placeholder="Ex: @clinicasorriso ou https://instagram.com/..."
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <button
              @click="saveContactConfig"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-2"
            >
              Salvar WhatsApp & Redes
            </button>
          </div>
        </div>
      </main>

      <!-- ========================================== -->
      <!-- ABA 4: Horários & Emergência               -->
      <!-- ========================================== -->
      <main v-else-if="activeTab === 'hours'" class="px-4 mt-4 space-y-6">
        <!-- 1. Pausa de Emergência -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <span>🛑 Pausa Geral de Atendimento</span>
          </h2>
          <p class="text-xs text-slate-400">
            Precisa pausar o atendimento de emergência? Pause todas as solicitações com um clique.
          </p>

          <button
            type="button"
            @click="toggleEmergencyPause"
            class="w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-lg"
            :class="isEmergencyClosed ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30' : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'"
          >
            <span class="w-2.5 h-2.5 rounded-full" :class="isEmergencyClosed ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'"></span>
            <span>{{ isEmergencyClosed ? 'Loja Pausada (Clique para Reabrir)' : 'Pausar Atendimento Imediatamente' }}</span>
          </button>
        </div>

        <!-- 2. Programação Semanal -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <span>🕒 Programação Semanal & Dias de Funcionamento</span>
          </h2>
          <p class="text-xs text-slate-400">
            Defina os dias em que a loja abre e os horários de cada dia da semana.
          </p>

          <div class="space-y-3 pt-2">
            <div
              v-for="d in weeklyDaysConfig"
              :key="d.key"
              class="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs"
            >
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  :aria-checked="!d.closed"
                  @click="toggleDayClosed(d)"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
                  :class="!d.closed ? 'bg-emerald-500' : 'bg-slate-800'"
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200"
                    :class="!d.closed ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
                <div>
                  <span class="font-bold text-white block">{{ d.label }}</span>
                  <span class="text-[10px]" :class="!d.closed ? 'text-emerald-400' : 'text-rose-400'">
                    {{ !d.closed ? 'Aberto' : 'Fechado' }}
                  </span>
                </div>
              </div>

              <div v-if="!d.closed" class="flex items-center gap-1.5 font-mono">
                <input
                  type="time"
                  v-model="d.open"
                  @change="saveWeeklySchedule"
                  class="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                />
                <span class="text-slate-500">às</span>
                <input
                  type="time"
                  v-model="d.close"
                  @change="saveWeeklySchedule"
                  class="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div v-if="scheduleSuccessMsg" class="text-xs text-emerald-400 text-center font-bold bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-lg">
            {{ scheduleSuccessMsg }}
          </div>

          <button
            @click="saveWeeklySchedule"
            class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-4"
          >
            Salvar Programação Semanal
          </button>
        </div>
      </main>

      <!-- ========================================== -->
      <!-- ABA 5: Delivery & Taxas                    -->
      <!-- ========================================== -->
      <main v-else-if="activeTab === 'delivery' && !isServiceStore" class="px-4 mt-4 space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <span>🛵 Configurações de Entrega</span>
          </h2>
          <p class="text-xs text-slate-400">
            Ajuste a taxa de entrega padrão, pedido mínimo e tempo estimado.
          </p>

          <div class="space-y-3 pt-2 text-xs">
            <div>
              <label class="block text-[11px] text-slate-400 font-semibold mb-1">Taxa de Entrega (R$):</label>
              <input
                type="number"
                step="0.50"
                v-model="deliveryFeeInput"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label class="block text-[11px] text-slate-400 font-semibold mb-1">Pedido Mínimo (R$):</label>
              <input
                type="number"
                step="1.00"
                v-model="minOrderInput"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label class="block text-[11px] text-slate-400 font-semibold mb-1">Tempo Estimado de Entrega:</label>
              <input
                type="text"
                v-model="estimatedTimeInput"
                placeholder="Ex: 30-45 min"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <button
              @click="saveDeliveryConfig"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-4"
            >
              Salvar Configurações de Delivery
            </button>
          </div>
        </div>
      </main>

      <!-- ========================================== -->
      <!-- ABA 6: Banner de Comunicado                -->
      <!-- ========================================== -->
      <main v-else-if="activeTab === 'announcement'" class="px-4 mt-4 space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <span>📢 Banner de Comunicado no Topo da Vitrine</span>
          </h2>
          <p class="text-xs text-slate-400">
            Divulgue avisos importantes, folgas ou comunicados diretamente no topo para todos os clientes.
          </p>

          <div class="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span class="text-xs font-bold text-white">Exibir Banner de Aviso</span>
            <button
              type="button"
              role="switch"
              :aria-checked="announcementEnabled"
              @click="announcementEnabled = !announcementEnabled"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
              :class="announcementEnabled ? 'bg-emerald-500' : 'bg-slate-800'"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200"
                :class="announcementEnabled ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <div v-if="announcementEnabled" class="space-y-2 pt-2 text-xs">
            <label class="block text-[11px] text-slate-400 font-semibold">Mensagem do Comunicado:</label>
            <textarea
              v-model="announcementMessage"
              rows="3"
              placeholder="Ex: ⚠️ Horário especial de feriado neste sábado!"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 leading-relaxed"
            ></textarea>
          </div>

          <button
            @click="saveAnnouncementConfig"
            class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-4"
          >
            Salvar Comunicado
          </button>
        </div>
      </main>

      <!-- ========================================== -->
      <!-- ABA 7: Segurança & PIN                     -->
      <!-- ========================================== -->
      <main v-else-if="activeTab === 'security'" class="px-4 mt-4 space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <span>🔒 Alterar PIN de Acesso</span>
          </h2>
          <p class="text-xs text-slate-400">
            Defina uma nova senha numérica de 4 a 8 dígitos para proteger o acesso a este painel.
          </p>

          <div class="space-y-3 pt-2 text-xs">
            <div>
              <label class="block text-[11px] text-slate-400 font-semibold mb-1">Novo PIN Numérico:</label>
              <input
                type="password"
                maxlength="8"
                inputmode="numeric"
                v-model="newPinInput"
                placeholder="Ex: 5678"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-lg tracking-widest text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <button
              @click="saveNewPin"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-4"
            >
              Salvar Novo PIN
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- ========================================== -->
    <!-- MODAL 1: Cadastrar Novo Produto / Item     -->
    <!-- ========================================== -->
    <div
      v-if="isNewProductModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
    >
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 class="text-sm font-bold text-white">Cadastrar Novo Item</h3>
          <button @click="isNewProductModalOpen = false" class="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-[11px] text-slate-400 font-semibold mb-1">Nome do Item *</label>
            <input
              type="text"
              v-model="newProductForm.name"
              placeholder="Ex: Combo Smash Especial ou Limpeza Dental"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-[11px] text-slate-400 font-semibold mb-1">Categoria *</label>
            <select
              v-model="newProductForm.categoryId"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
            >
              <option v-for="cat in effectiveCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] text-slate-400 font-semibold mb-1">Preço (R$) *</label>
              <input
                type="number"
                step="0.50"
                v-model="newProductForm.price"
                placeholder="0.00"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div v-if="isServiceStore">
              <label class="block text-[11px] text-slate-400 font-semibold mb-1">Duração (min)</label>
              <input
                type="number"
                step="15"
                v-model="newProductForm.durationMinutes"
                placeholder="Ex: 45"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label class="block text-[11px] text-slate-400 font-semibold mb-1">Descrição</label>
            <textarea
              v-model="newProductForm.description"
              rows="2"
              placeholder="Ex: Acompanha fritas rústicas e molho da casa..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-[11px] text-slate-400 font-semibold mb-1">URL da Imagem (Opcional)</label>
            <input
              type="text"
              v-model="newProductForm.image"
              placeholder="https://images.unsplash.com/..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button
            @click="isNewProductModalOpen = false"
            class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
          >
            Cancelar
          </button>
          <button
            @click="saveNewProduct"
            class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
          >
            Salvar Item
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL 2: Cadastrar Novo Especialista       -->
    <!-- ========================================== -->
    <div
      v-if="isNewProfModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
    >
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 class="text-sm font-bold text-white">Cadastrar Especialista / Profissional</h3>
          <button @click="isNewProfModalOpen = false" class="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-[11px] text-slate-400 font-semibold mb-1">Nome Completo *</label>
            <input
              type="text"
              v-model="newProfForm.name"
              placeholder="Ex: Dr. Lucas Silveira ou Rodrigo Barbeiro"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-[11px] text-slate-400 font-semibold mb-1">Cargo / Especialidade *</label>
            <input
              type="text"
              v-model="newProfForm.role"
              placeholder="Ex: Ortodontista ou Barbeiro Master"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] text-slate-400 font-semibold mb-1">Início Expediente</label>
              <input
                type="time"
                v-model="newProfForm.workHours.start"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-emerald-500 text-center"
              />
            </div>
            <div>
              <label class="block text-[11px] text-slate-400 font-semibold mb-1">Fim Expediente</label>
              <input
                type="time"
                v-model="newProfForm.workHours.end"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-emerald-500 text-center"
              />
            </div>
          </div>

          <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-400">Pausa de Almoço</span>
              <label class="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" v-model="newProfForm.lunchBreak.enabled" class="rounded text-emerald-500" />
                <span class="text-[10px] text-slate-300">Ativar</span>
              </label>
            </div>
            <div v-if="newProfForm.lunchBreak.enabled" class="flex items-center gap-2">
              <input
                type="time"
                v-model="newProfForm.lunchBreak.start"
                class="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white text-center"
              />
              <span class="text-slate-500 text-xs">às</span>
              <input
                type="time"
                v-model="newProfForm.lunchBreak.end"
                class="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white text-center"
              />
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button
            @click="isNewProfModalOpen = false"
            class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
          >
            Cancelar
          </button>
          <button
            @click="saveNewProfessional"
            class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
          >
            Salvar Profissional
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL 3: Editar Preço                      -->
    <!-- ========================================== -->
    <div
      v-if="isPriceModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
    >
      <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <h3 class="text-sm font-bold text-white">Editar Preço: {{ editingProduct?.name }}</h3>
        <div>
          <label class="block text-[11px] text-slate-400 font-semibold mb-1">Novo Preço (R$):</label>
          <input
            type="number"
            step="0.50"
            v-model="editingPriceValue"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-lg font-mono text-white outline-none focus:border-emerald-500 text-center"
            autofocus
          />
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="isPriceModalOpen = false"
            class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
          >
            Cancelar
          </button>
          <button
            @click="confirmPriceEdit"
            class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
          >
            Salvar Preço
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useMerchantAdmin } from '~/composables/useMerchantAdmin'
import type { Product, Category } from '@alaska/contracts'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const { tenant, loadTenant } = useTenant()
const {
  isAuthenticated,
  errorMessage,
  login,
  logout,
  changePin,
  getOverrides,
  resetOverrides,
  toggleProductAvailability,
  updateProductPrice,
  createProduct,
  deleteProduct,
  toggleOptionAvailability,
  updatePixConfig,
  updateContact,
  updateWeeklySchedule,
  toggleProfessionalAvailability,
  updateProfessionalDays,
  updateProfessionalHours,
  updateProfessionalLunch,
  createProfessional,
  deleteProfessional,
  updateDelivery,
  updateAnnouncement,
  updateEmergency,
  toggleBlockSlot
} = useMerchantAdmin(slug)

const pinInput = ref('')
const activeTab = ref<'catalog' | 'agenda' | 'pix_contact' | 'hours' | 'delivery' | 'announcement' | 'security'>('catalog')
const toastMessage = ref('')

function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

function sanitizedWhatsApp(num: string): string {
  const digits = (num || '').replace(/\D/g, '')
  if (digits.length <= 11 && !digits.startsWith('55')) {
    return `55${digits}`
  }
  return digits
}

// Identifica se a loja é de saúde/clínica ou barbearia/serviços
const isHealthStore = computed(() => {
  const cat = (tenant.value as any)?.businessCategory || (tenant.value as any)?.category || (tenant.value as any)?.template
  return cat === 'pro' || slug.value === 'clinica-sorriso'
})

const isServiceStore = computed(() => {
  const cat = (tenant.value as any)?.businessCategory || (tenant.value as any)?.category || (tenant.value as any)?.template
  return cat === 'hub' || cat === 'pro' || slug.value === 'barbearia-style' || slug.value === 'clinica-sorriso'
})

onMounted(async () => {
  if (slug.value) {
    await loadTenant(slug.value)
  }
  loadScheduleFromOverrides()
  loadPixAndContactFromOverrides()
})

// Sincronização e Reatividade de Overrides Locais
const rawOverrides = ref<any>({})

function refreshLocalOverrides() {
  rawOverrides.value = getOverrides()
}

onMounted(() => {
  refreshLocalOverrides()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', refreshLocalOverrides)
    window.addEventListener('alaska_overrides_updated', refreshLocalOverrides)
  }
})

function handleLogin() {
  const ok = login(pinInput.value)
  if (ok) {
    pinInput.value = ''
    refreshLocalOverrides()
    loadScheduleFromOverrides()
    loadPixAndContactFromOverrides()
  }
}

function handleReset() {
  if (confirm('Deseja resetar todas as alterações locais e voltar aos padrões da demonstração?')) {
    resetOverrides()
    refreshLocalOverrides()
    loadScheduleFromOverrides()
    loadPixAndContactFromOverrides()
    showToast('🔄 Configurações resetadas com sucesso!')
  }
}

// 1. Categorias & Produtos com Suporte a Custom e Delete
const effectiveCategories = computed<Category[]>(() => {
  const base = (tenant.value?.categories || []) as Category[]
  const ov = rawOverrides.value || {}
  const prodOverrides = ov.products || {}
  const deletedIds = ov.deletedProductIds || []
  const customProds = (ov.customProducts || []) as Product[]

  return base.map(cat => {
    const baseProds = (cat.products || []).filter(p => !deletedIds.includes(p.id))
    const matchingCustom = customProds.filter(p => p.categoryId === cat.id && !deletedIds.includes(p.id))
    const mergedProds = [...baseProds, ...matchingCustom].map(p => {
      const o = prodOverrides[p.id]
      return {
        ...p,
        isAvailable: o?.isAvailable !== undefined ? o.isAvailable : p.isAvailable,
        price: o?.price !== undefined ? o.price : p.price
      }
    })

    return {
      ...cat,
      products: mergedProds
    }
  })
})

function toggleProduct(products: Product[], productId: string, currentStatus: boolean) {
  toggleProductAvailability(products, productId, currentStatus)
  refreshLocalOverrides()
  showToast(`Status do item alterado!`)
}

// Edição de Preço
const isPriceModalOpen = ref(false)
const editingProduct = ref<Product | null>(null)
const editingPriceValue = ref(0)

function openPriceEditModal(product: Product) {
  editingProduct.value = product
  editingPriceValue.value = Number(product.price)
  isPriceModalOpen.value = true
}

async function confirmPriceEdit() {
  if (editingProduct.value) {
    await updateProductPrice(effectiveCategories.value.flatMap(c => c.products || []), editingProduct.value.id, Number(editingPriceValue.value))
    refreshLocalOverrides()
    showToast(`Preço de ${editingProduct.value.name} atualizado!`)
  }
  isPriceModalOpen.value = false
}

// Criação de Produto
const isNewProductModalOpen = ref(false)
const newProductForm = ref({
  name: '',
  description: '',
  price: 0,
  categoryId: '',
  image: '',
  durationMinutes: 45
})

function openNewProductModal() {
  const firstCatId = effectiveCategories.value[0]?.id || 'cat-1'
  newProductForm.value = {
    name: '',
    description: '',
    price: 25.0,
    categoryId: firstCatId,
    image: '',
    durationMinutes: 45
  }
  isNewProductModalOpen.value = true
}

function openNewProductModalWithCategory(catId: string) {
  newProductForm.value = {
    name: '',
    description: '',
    price: 25.0,
    categoryId: catId,
    image: '',
    durationMinutes: 45
  }
  isNewProductModalOpen.value = true
}

function saveNewProduct() {
  if (!newProductForm.value.name.trim()) {
    alert('Digite o nome do produto.')
    return
  }
  createProduct(newProductForm.value)
  refreshLocalOverrides()
  isNewProductModalOpen.value = false
  showToast(`✅ Produto ${newProductForm.value.name} criado com sucesso!`)
}

function confirmDeleteProduct(product: Product) {
  if (confirm(`Tem certeza que deseja excluir "${product.name}" do cardápio?`)) {
    deleteProduct(product.id)
    refreshLocalOverrides()
    showToast(`🗑️ ${product.name} removido!`)
  }
}

// 2. Extração e Pausa de Opcionais / Adicionais
const allExtractedOptions = computed(() => {
  const list: Array<{ id: string; name: string; price: number; groupName: string; productId: string }> = []
  const seenIds = new Set<string>()

  effectiveCategories.value.forEach(cat => {
    (cat.products || []).forEach(prod => {
      const groups = (prod as any).optionGroups || []
      groups.forEach((grp: any) => {
        const items = grp.items || grp.options || []
        items.forEach((item: any) => {
          if (item && item.id && !seenIds.has(item.id)) {
            seenIds.add(item.id)
            list.push({
              id: item.id,
              name: item.name || 'Adicional',
              price: item.price || 0,
              groupName: grp.name || prod.name,
              productId: prod.id
            })
          }
        })
      })
    })
  })

  return list
})

function isOptionPaused(optionId: string): boolean {
  const paused = rawOverrides.value.pausedOptionIds || []
  return paused.includes(optionId)
}

function handleOptionToggle(optionId: string, currentAvailable: boolean, name: string) {
  toggleOptionAvailability(optionId, !currentAvailable)
  refreshLocalOverrides()
  showToast(`🧀 Status de "${name}": ${!currentAvailable ? 'Disponível' : 'Esgotado'}!`)
}

// 3. Equipe & Especialistas
const defaultProfessionalsBySlug: Record<string, Array<any>> = {
  'clinica-sorriso': [
    { id: 'prof-1', name: 'Dra. Camila Rocha', role: 'Cirurgiã Dentista & Implantes', isAvailable: true, availableDays: [1, 2, 3, 4, 5], workHours: { start: '08:00', end: '17:00' }, lunchBreak: { start: '12:00', end: '13:00', enabled: true } },
    { id: 'prof-2', name: 'Dr. Rafael Mendes', role: 'Ortodontista & Invisalign', isAvailable: true, availableDays: [1, 2, 3, 4, 5, 6], workHours: { start: '09:00', end: '19:00' }, lunchBreak: { start: '13:00', end: '14:00', enabled: true } },
    { id: 'prof-3', name: 'Dra. Beatriz Lima', role: 'Harmonização Orofacial & Estética', isAvailable: true, availableDays: [2, 3, 4, 5, 6], workHours: { start: '10:00', end: '19:00' }, lunchBreak: { start: '13:00', end: '14:00', enabled: false } }
  ],
  'barbearia-style': [
    { id: 'prof-1', name: 'Carlos Santos', role: 'Barbeiro Master', isAvailable: true, availableDays: [1, 2, 3, 4, 5, 6], workHours: { start: '09:00', end: '20:00' }, lunchBreak: { start: '12:00', end: '13:00', enabled: true } },
    { id: 'prof-2', name: 'Lucas Oliveira', role: 'Visagista & Barbeiro', isAvailable: true, availableDays: [2, 3, 4, 5, 6], workHours: { start: '10:00', end: '20:00' }, lunchBreak: { start: '14:00', end: '15:00', enabled: true } },
    { id: 'prof-3', name: 'Mateus Silva', role: 'Especialista em Cortes Clássicos', isAvailable: true, availableDays: [1, 3, 4, 5, 6], workHours: { start: '09:00', end: '18:00' }, lunchBreak: { start: '12:00', end: '13:00', enabled: false } }
  ]
}

const effectiveProfessionalsList = computed(() => {
  const ov = rawOverrides.value || {}
  const profOverrides = ov.professionals || {}
  const deletedIds = ov.deletedProfessionalIds || []
  const customProfs = ov.customProfessionals || []

  const base = defaultProfessionalsBySlug[slug.value] || defaultProfessionalsBySlug['barbearia-style']
  const all = [...base, ...customProfs].filter(p => !deletedIds.includes(p.id))

  return all.map(p => {
    const o = profOverrides[p.id]
    return {
      ...p,
      isAvailable: o?.isAvailable !== undefined ? Boolean(o.isAvailable) : Boolean(p.isAvailable),
      availableDays: o?.availableDays ? [...o.availableDays] : [...(p.availableDays || [1, 2, 3, 4, 5])],
      workHours: {
        start: o?.workHours?.start || p.workHours?.start || '08:00',
        end: o?.workHours?.end || p.workHours?.end || '18:00'
      },
      lunchBreak: {
        start: o?.lunchBreak?.start || p.lunchBreak?.start || '12:00',
        end: o?.lunchBreak?.end || p.lunchBreak?.end || '13:00',
        enabled: o?.lunchBreak?.enabled !== undefined ? Boolean(o.lunchBreak.enabled) : Boolean(p.lunchBreak?.enabled)
      }
    }
  })
})

function handleProfToggle(profId: string, currentStatus: boolean, name: string) {
  toggleProfessionalAvailability(profId, !currentStatus)
  refreshLocalOverrides()
  showToast(`Escala de ${name}: ${!currentStatus ? 'Atendendo' : 'De Folga'}!`)
}

function handleProfDayToggle(profId: string, dayIndex: number, name: string) {
  const prof = effectiveProfessionalsList.value.find(p => p.id === profId)
  if (!prof) return
  let days = [...(prof.availableDays || [])]
  if (days.includes(dayIndex)) {
    days = days.filter(d => d !== dayIndex)
  } else {
    days.push(dayIndex)
  }
  updateProfessionalDays(profId, days)
  refreshLocalOverrides()
  showToast(`📅 Dias de ${name} atualizados!`)
}

function handleProfWorkHoursChange(profId: string, workHours: { start: string; end: string }, name: string) {
  updateProfessionalHours(profId, workHours)
  refreshLocalOverrides()
  showToast(`⏰ Horário de ${name}: ${workHours.start} às ${workHours.end}!`)
}

function handleProfLunchChange(profId: string, lunchBreak: { start: string; end: string; enabled: boolean }, name: string) {
  updateProfessionalLunch(profId, lunchBreak)
  refreshLocalOverrides()
  showToast(`🍽️ Intervalo de almoço de ${name} atualizado!`)
}

const isNewProfModalOpen = ref(false)
const newProfForm = ref({
  name: '',
  role: '',
  availableDays: [1, 2, 3, 4, 5],
  workHours: { start: '08:00', end: '18:00' },
  lunchBreak: { start: '12:00', end: '13:00', enabled: true }
})

function openNewProfModal() {
  newProfForm.value = {
    name: '',
    role: isHealthStore.value ? 'Cirurgião Dentista' : 'Barbeiro',
    availableDays: [1, 2, 3, 4, 5],
    workHours: { start: '08:00', end: '18:00' },
    lunchBreak: { start: '12:00', end: '13:00', enabled: true }
  }
  isNewProfModalOpen.value = true
}

function saveNewProfessional() {
  if (!newProfForm.value.name.trim()) {
    alert('Digite o nome do profissional.')
    return
  }
  createProfessional(newProfForm.value)
  refreshLocalOverrides()
  isNewProfModalOpen.value = false
  showToast(`✅ ${newProfForm.value.name} adicionado à equipe!`)
}

function confirmDeleteProf(prof: any) {
  if (confirm(`Tem certeza que deseja remover ${prof.name} da equipe?`)) {
    deleteProfessional(prof.id)
    refreshLocalOverrides()
    showToast(`🗑️ ${prof.name} removido da equipe!`)
  }
}

// 4. Pix & Contatos
const pixForm = ref({
  keyType: 'random' as 'cpf' | 'cnpj' | 'phone' | 'email' | 'random',
  pixKey: '',
  beneficiary: '',
  city: 'SAO PAULO'
})

const contactForm = ref({
  whatsapp: '',
  instagram: ''
})

function loadPixAndContactFromOverrides() {
  const ov = getOverrides()
  const p = ov.pix || (tenant.value as any)?.pixConfig || {}
  pixForm.value = {
    keyType: p.keyType || 'random',
    pixKey: p.pixKey || p.key || '',
    beneficiary: p.beneficiary || (tenant.value as any)?.name || '',
    city: p.city || 'SAO PAULO'
  }

  const c = ov.contact || {}
  contactForm.value = {
    whatsapp: c.whatsapp || (tenant.value as any)?.phoneWhatsApp || '',
    instagram: c.instagram || (tenant.value as any)?.instagram || ''
  }
}

watch(() => tenant.value, () => {
  loadPixAndContactFromOverrides()
})

function savePixConfig() {
  updatePixConfig(pixForm.value)
  refreshLocalOverrides()
  showToast(`💠 Chave Pix salva com sucesso!`)
}

function saveContactConfig() {
  updateContact(contactForm.value)
  refreshLocalOverrides()
  showToast(`📱 Contatos salvos com sucesso!`)
}

// 5. Horários Semanais & Pausa
const weeklyDaysConfig = ref([
  { key: 'monday', label: 'Segunda-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'tuesday', label: 'Terça-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'wednesday', label: 'Quarta-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'thursday', label: 'Quinta-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'friday', label: 'Sexta-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'saturday', label: 'Sábado', closed: false, open: '09:00', close: '18:00' },
  { key: 'sunday', label: 'Domingo', closed: true, open: '09:00', close: '18:00' },
])

const scheduleSuccessMsg = ref('')

function loadScheduleFromOverrides() {
  const overrides = getOverrides()
  const hours = overrides.openingHours || tenant.value?.openingHours || {}
  const defOpen = hours.open || '09:00'
  const defClose = hours.close || '20:00'

  weeklyDaysConfig.value.forEach(d => {
    const dayData = (hours as any)[d.key]
    if (dayData) {
      d.closed = Boolean(dayData.closed)
      d.open = dayData.open || defOpen
      d.close = dayData.close || defClose
    } else {
      d.open = defOpen
      d.close = defClose
    }
  })
}

function toggleDayClosed(d: any) {
  d.closed = !d.closed
  saveWeeklySchedule()
}

function saveWeeklySchedule() {
  const schedulePayload: Record<string, any> = {}
  weeklyDaysConfig.value.forEach(d => {
    schedulePayload[d.key] = {
      open: d.open,
      close: d.close,
      closed: d.closed
    }
  })
  updateWeeklySchedule(schedulePayload)
  scheduleSuccessMsg.value = 'Programação semanal salva com sucesso!'
  setTimeout(() => { scheduleSuccessMsg.value = '' }, 2500)
}

const isEmergencyClosed = computed(() => {
  return Boolean(rawOverrides.value.emergency?.isClosed)
})

function toggleEmergencyPause() {
  const newStatus = !isEmergencyClosed.value
  updateEmergency(newStatus, newStatus ? 'Atendimento pausado temporariamente' : '')
  refreshLocalOverrides()
  showToast(newStatus ? '🛑 Loja pausada!' : '✅ Loja reaberta!')
}

// 6. Bloqueio de Slots
const selectedAgendaDate = ref(new Date().toISOString().split('T')[0])
const sampleSlots = [
  '08:00', '08:45', '09:30', '10:15', '11:00',
  '11:45', '12:30', '13:15', '14:00', '14:45',
  '15:30', '16:15', '17:00', '17:45', '18:30'
]

function isSlotBlocked(date: string, time: string): boolean {
  const blocked = rawOverrides.value.blockedSlots || []
  return blocked.some((b: any) => b.date === date && b.time === time)
}

function handleBlockSlotToggle(date: string, time: string) {
  const wasBlocked = toggleBlockSlot(date, time)
  refreshLocalOverrides()
  showToast(`Slot ${time} ${wasBlocked ? 'bloqueado' : 'liberado'} em ${date}!`)
}

// 7. Delivery
const deliveryFeeInput = ref(6.0)
const minOrderInput = ref(20.0)
const estimatedTimeInput = ref('30-45 min')

function saveDeliveryConfig() {
  updateDelivery(Number(deliveryFeeInput.value), Number(minOrderInput.value), estimatedTimeInput.value)
  refreshLocalOverrides()
  showToast('🛵 Delivery atualizado!')
}

// 8. Comunicado
const announcementEnabled = ref(false)
const announcementMessage = ref('')

function saveAnnouncementConfig() {
  updateAnnouncement(announcementEnabled.value, announcementMessage.value)
  refreshLocalOverrides()
  showToast('📢 Comunicado salvo!')
}

// 9. PIN
const newPinInput = ref('')

function saveNewPin() {
  const ok = changePin(newPinInput.value)
  if (ok) {
    newPinInput.value = ''
    refreshLocalOverrides()
    showToast('🔒 Novo PIN salvo com sucesso!')
  }
}
</script>
