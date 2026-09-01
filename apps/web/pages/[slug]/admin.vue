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
                autocomplete="current-password"
                maxlength="8"
                inputmode="numeric"
                placeholder="••••"
                class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-white outline-none transition-all font-mono"
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
        <header class="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
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

          <button
            @click="logout"
            class="text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Sair
          </button>
        </header>

        <!-- Toast de Notificação Rápida -->
        <div v-if="adminToastMsg" class="sticky top-16 z-30 mx-4 mt-2 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center shadow-lg animate-in fade-in duration-150">
          {{ adminToastMsg }}
        </div>

        <!-- Navegação em Abas Operacionais com Rolagem e Setas Desktop/Mobile -->
        <div class="relative px-4 pt-4">
          <!-- Botão Scroll Esquerda -->
          <button
            v-if="canScrollNavLeft"
            type="button"
            @click="scrollNav('left')"
            class="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-slate-900/95 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg cursor-pointer backdrop-blur-xs active:scale-95"
            aria-label="Rolar abas para a esquerda"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>

          <!-- Fade Gradient Esquerdo -->
          <div
            v-if="canScrollNavLeft"
            class="hidden sm:block pointer-events-none absolute left-4 top-4 bottom-2 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10"
          ></div>

          <!-- Container de Abas com Rolagem e Touch/Mousewheel -->
          <nav
            ref="navContainerRef"
            @scroll="checkNavScroll"
            @wheel.passive="handleNavWheel"
            class="flex gap-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth w-full pr-12 sm:pr-8 select-none"
            role="tablist"
          >
            <button
              @click="selectTab('catalog')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
              :class="activeTab === 'catalog' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'"
            >
              <span>{{ isServiceStore ? '📋 Serviços & Itens' : '📋 Cardápio & Preços' }}</span>
            </button>

            <button
              v-if="isServiceStore"
              @click="selectTab('agenda')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
              :class="activeTab === 'agenda' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'"
            >
              <span>{{ isHealthStore ? '🩺 Especialistas & Agenda' : '💈 Barbeiros & Agenda' }}</span>
            </button>

            <button
              @click="selectTab('pix_contact')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
              :class="activeTab === 'pix_contact' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'"
            >
              <span>💠 Pix & Contato</span>
            </button>

            <button
              @click="selectTab('hours')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
              :class="activeTab === 'hours' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'"
            >
              <span>🕒 Horários & Pausa</span>
            </button>

            <button
              v-if="!isServiceStore"
              @click="selectTab('delivery')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
              :class="activeTab === 'delivery' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'"
            >
              <span>🛵 Delivery & Taxas</span>
            </button>

            <button
              @click="selectTab('announcement')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
              :class="activeTab === 'announcement' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'"
            >
              <span>📢 Comunicado</span>
            </button>

            <button
              @click="selectTab('security')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
              :class="activeTab === 'security' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'"
            >
              <span>🔒 PIN & Segurança</span>
            </button>
          </nav>

          <!-- Fade Gradient Direito -->
          <div
            v-if="canScrollNavRight"
            class="hidden sm:block pointer-events-none absolute right-4 top-4 bottom-2 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10"
          ></div>

          <!-- Botão Scroll Direita -->
          <button
            v-if="canScrollNavRight"
            type="button"
            @click="scrollNav('right')"
            class="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-slate-900/95 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg cursor-pointer backdrop-blur-xs active:scale-95"
            aria-label="Rolar abas para a direita"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <!-- ABA 1: Catálogo e Serviços (Pausa, Criação, Exclusão e Preços) -->
        <main v-if="activeTab === 'catalog'" class="px-4 mt-4 space-y-6">
          <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div class="flex items-start gap-3">
              <span class="text-lg">⚡</span>
              <div class="text-xs">
                <p class="font-bold text-emerald-400">Pausa Rápida & Preços em Tempo Real</p>
                <p class="text-slate-300 mt-0.5">Ligue ou desligue procedimentos/produtos e edite preços sem precisar fazer deploy.</p>
              </div>
            </div>

            <button
              @click="openCreateProductModal"
              class="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md"
            >
              <Plus class="w-4 h-4" />
              <span>Novo Item</span>
            </button>
          </div>

          <section v-for="category in categories" :key="category.id" class="space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span>{{ category.name }}</span>
                <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{{ (category.products || []).length }}</span>
              </h2>
            </div>

            <div class="space-y-2">
              <div
                v-for="product in (category.products || [])"
                :key="product.id"
                class="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between gap-4 transition-all"
                :class="{ 'opacity-60 bg-slate-950/40 border-dashed': !isProductAvailable(product) }"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-semibold text-white truncate">{{ product.name }}</h3>
                    <span
                      class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                      :class="isProductAvailable(product) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
                    >
                      {{ isProductAvailable(product) ? 'Ativo' : 'Esgotado' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-3 mt-1">
                    <p class="text-xs text-slate-300 font-mono font-bold">
                      R$ {{ Number(getProductPrice(product)).toFixed(2).replace('.', ',') }}
                    </p>
                    <button
                      @click="openPriceModal(category.products, product)"
                      class="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
                    >
                      Alterar Preço
                    </button>
                    <button
                      v-if="product.optionGroups && product.optionGroups.length > 0"
                      @click="openOptionsModal(product)"
                      class="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                    >
                      Gerenciar Adicionais ({{ product.optionGroups.length }})
                    </button>
                    <button
                      @click="handleDeleteProduct(product.id, product.name)"
                      class="text-[11px] text-slate-500 hover:text-rose-400 font-medium cursor-pointer ml-auto"
                      title="Excluir produto do catálogo"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <!-- Switch Acessível W3C / WCAG -->
                <button
                  type="button"
                  role="switch"
                  :aria-checked="isProductAvailable(product)"
                  :aria-label="`Alternar disponibilidade de ${product.name}`"
                  @click="toggleProduct(category.products, product.id, isProductAvailable(product))"
                  class="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                  :class="isProductAvailable(product) ? 'bg-emerald-500' : 'bg-slate-800'"
                >
                  <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                    :class="isProductAvailable(product) ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </section>
        </main>

        <!-- ABA 2: Equipe & Agenda (Exclusivo Hub & Pro) -->
        <main v-else-if="activeTab === 'agenda' && isServiceStore" class="px-4 mt-4 space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold text-white flex items-center gap-2">
                  <span>{{ isHealthStore ? '🩺 Especialistas & Horários Individuais' : '💈 Barbeiros & Horários Individuais' }}</span>
                </h2>
                <p class="text-xs text-slate-400 mt-0.5">
                  Configure os dias de atendimento, horário de expediente e pausa de almoço de cada especialista.
                </p>
              </div>
              <button
                @click="openCreateProfModal"
                class="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md"
              >
                <Plus class="w-4 h-4" />
                <span>Novo Especialista</span>
              </button>
            </div>

            <div class="space-y-4 pt-1">
              <div
                v-for="prof in professionalsList"
                :key="prof.id"
                class="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4 transition-all"
                :class="{ 'opacity-70 border-rose-500/20': !prof.isAvailable }"
              >
                <!-- Linha 1: Nome, Especialidade e Switch de Folga -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs transition-colors"
                      :class="prof.isAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'"
                    >
                      {{ prof.name.charAt(0) }}
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-white">{{ prof.name }}</h4>
                      <span class="text-[10px] text-slate-400">{{ prof.role }}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <span
                      class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded transition-colors"
                      :class="prof.isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
                    >
                      {{ prof.isAvailable ? 'Atendendo' : 'De Folga Hoje' }}
                    </span>

                    <button
                      type="button"
                      role="switch"
                      :aria-checked="prof.isAvailable"
                      @click="handleProfAvailabilityToggle(prof.id, prof.isAvailable, prof.name)"
                      class="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
                      :class="prof.isAvailable ? 'bg-emerald-500' : 'bg-slate-800'"
                    >
                      <span
                        class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                        :class="prof.isAvailable ? 'translate-x-5' : 'translate-x-0'"
                      />
                    </button>

                    <button
                      @click="handleDeleteProf(prof.id, prof.name)"
                      class="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer ml-1"
                      title="Excluir especialista"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
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

          <!-- 2. Bloqueio Rápido de Horários Específicos -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>📅 Grade de Horários & Bloqueio Rápido</span>
            </h2>
            <p class="text-xs text-slate-400">
              Selecione uma data e clique no horário para bloquear ou liberar na agenda dos clientes.
            </p>

            <div class="flex items-center gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-slate-400 mb-1">Data da Agenda:</label>
                <input
                  type="date"
                  v-model="selectedAgendaDate"
                  class="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
              <button
                v-for="time in sampleSlots"
                :key="time"
                type="button"
                @click="handleSlotToggle(selectedAgendaDate, time)"
                class="py-2.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-95 select-none"
                :class="isSlotBlocked(selectedAgendaDate, time) ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-xs' : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-emerald-500'"
              >
                <span class="font-mono text-xs">{{ time }}</span>
                <span class="text-[9px] uppercase tracking-wider font-extrabold" :class="isSlotBlocked(selectedAgendaDate, time) ? 'text-rose-400' : 'text-emerald-400'">
                  {{ isSlotBlocked(selectedAgendaDate, time) ? 'Bloqueado' : 'Livre' }}
                </span>
              </button>
            </div>
          </div>
        </main>

        <!-- ABA 3: Pix & Contato -->
        <main v-else-if="activeTab === 'pix_contact'" class="px-4 mt-4 space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>💠 Configurações Pix Copia e Cola (D+0)</span>
            </h2>
            <p class="text-xs text-slate-400">
              Receba pagamentos diretamente na sua conta bancária sem intermediários e com taxa zero.
            </p>

            <div class="space-y-3 pt-1">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Tipo de Chave Pix:</label>
                <select
                  v-model="pixConfigInput.keyType"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="random">Chave Aleatória (EVP)</option>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="phone">Celular / Telefone</option>
                  <option value="email">E-mail</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Chave Pix:</label>
                <input
                  type="text"
                  v-model="pixConfigInput.pixKey"
                  placeholder="Cole sua chave Pix aqui..."
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Nome do Beneficiário (Titular da Conta):</label>
                <input
                  type="text"
                  v-model="pixConfigInput.beneficiary"
                  placeholder="Ex: Danilo Santos LTDA"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Cidade do Titular:</label>
                <input
                  type="text"
                  v-model="pixConfigInput.city"
                  placeholder="Ex: SAO PAULO"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 uppercase"
                />
              </div>
            </div>

            <button
              @click="savePixConfig"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-2"
            >
              Salvar Dados Pix
            </button>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>📱 Canais de Contato & Redes Sociais</span>
            </h2>
            <p class="text-xs text-slate-400">
              Atualize seu número oficial de WhatsApp para receber os pedidos dos clientes.
            </p>

            <div class="space-y-3 pt-1">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">WhatsApp da Loja (com DDD):</label>
                <input
                  type="text"
                  v-model="contactInput.whatsapp"
                  placeholder="Ex: 11988887777"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Instagram (opcional):</label>
                <input
                  type="text"
                  v-model="contactInput.instagram"
                  placeholder="Ex: @minhaloja"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              @click="saveContactConfig"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-2"
            >
              Salvar Contatos
            </button>
          </div>
        </main>

        <!-- ABA 4: Horários & Pausa Geral -->
        <main v-else-if="activeTab === 'hours'" class="px-4 mt-4 space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>🛑 Pausa Geral de Atendimento</span>
            </h2>
            <p class="text-xs text-slate-400">
              Precisa pausar o atendimento de emergência? Pause todas as solicitações com um clique.
            </p>

            <button
              @click="toggleEmergencyPause"
              class="w-full py-4 rounded-xl font-extrabold text-sm transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              :class="isEmergencyClosed ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'"
            >
              <span>{{ isEmergencyClosed ? '🛑 Loja Pausada (Clique para Reabrir)' : '⚡ Pausar Loja Agora (Emergência)' }}</span>
            </button>
          </div>

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
                class="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div class="flex items-center gap-2.5">
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="!d.closed"
                    @click="toggleDayClosed(d)"
                    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
                    :class="!d.closed ? 'bg-emerald-500' : 'bg-slate-800'"
                  >
                    <span
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
                      :class="!d.closed ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                  <span class="font-semibold text-white" :class="{ 'opacity-50 line-through text-slate-500': d.closed }">
                    {{ d.label }}
                  </span>
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
                <span v-else class="text-xs text-rose-400 font-bold px-2 py-1 bg-rose-500/10 rounded-md">
                  Fechado
                </span>
              </div>
            </div>

            <div v-if="scheduleSuccessMsg" class="text-xs text-emerald-400 text-center font-bold bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-lg">
              {{ scheduleSuccessMsg }}
            </div>

            <button
              @click="saveWeeklySchedule"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-4"
            >
              Salvar Horários
            </button>
          </div>
        </main>

        <!-- ABA 5: Delivery & Taxas -->
        <main v-else-if="activeTab === 'delivery' && !isServiceStore" class="px-4 mt-4 space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>🛵 Taxa de Entrega & Pedido Mínimo</span>
            </h2>
            <p class="text-xs text-slate-400">
              Ajuste valores e prazos de entrega em tempo real sem mexer no código.
            </p>

            <div class="space-y-3 pt-2">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Taxa de Entrega Padrão (R$):</label>
                <input
                  type="number"
                  step="0.50"
                  v-model.number="deliveryFeeInput"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Valor Mínimo do Pedido (R$):</label>
                <input
                  type="number"
                  step="1.00"
                  v-model.number="minOrderInput"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Tempo Estimado de Entrega:</label>
                <input
                  type="text"
                  v-model="estimatedTimeInput"
                  placeholder="Ex: 35-50 min"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              @click="saveDeliveryConfig"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-2"
            >
              Salvar Configurações de Entrega
            </button>
          </div>
        </main>

        <!-- ABA 6: Comunicado Oficial -->
        <main v-else-if="activeTab === 'announcement'" class="px-4 mt-4 space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>📢 Banner de Comunicado no Topo da Vitrine</span>
            </h2>
            <p class="text-xs text-slate-400">
              Divulgue avisos importantes, folgas ou comunicados diretamente no topo para todos os clientes.
            </p>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span class="text-xs font-semibold text-white">Exibir Banner de Comunicado</span>
              <button
                type="button"
                role="switch"
                :aria-checked="announcementEnabled"
                @click="announcementEnabled = !announcementEnabled"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
                :class="announcementEnabled ? 'bg-emerald-500' : 'bg-slate-800'"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
                  :class="announcementEnabled ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Mensagem do Comunicado:</label>
              <textarea
                v-model="announcementMessage"
                rows="3"
                placeholder="Ex: ⚠️ Horário especial de feriado neste sábado!"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 leading-relaxed"
              ></textarea>
            </div>

            <button
              @click="saveAnnouncementConfig"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              Salvar Comunicado
            </button>
          </div>
        </main>

        <!-- ABA 7: Segurança e PIN -->
        <main v-else-if="activeTab === 'security'" class="px-4 mt-4 space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>🔐 Alterar PIN de Acesso</span>
            </h2>
            <p class="text-xs text-slate-400">
              Troque a senha numérica de acesso ao Painel do Lojista. O PIN deve ter no mínimo 4 dígitos.
            </p>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Novo PIN da Loja:</label>
              <input
                type="password"
                v-model="newPinInput"
                maxlength="8"
                inputmode="numeric"
                placeholder="••••"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 text-center tracking-widest text-lg font-mono"
              />
            </div>

            <div v-if="pinSuccessMsg" class="text-xs text-emerald-400 text-center font-bold bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-lg">
              {{ pinSuccessMsg }}
            </div>

            <button
              @click="saveNewPin"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              Atualizar PIN
            </button>
          </div>
        </main>

        <!-- Modais Operacionais -->
        <!-- 1. Modal de Edição de Preço -->
        <div v-if="isPriceModalOpen" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" @click="isPriceModalOpen = false">
          <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4" @click.stop>
            <h3 class="text-sm font-bold text-white">Editar Preço do Item</h3>
            <p class="text-xs text-slate-400">{{ editingProduct?.name }}</p>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Novo Preço (R$):</label>
              <input
                type="number"
                step="0.50"
                v-model.number="newPriceInput"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none focus:border-emerald-500"
                autofocus
              />
            </div>

            <div class="flex gap-2 pt-2">
              <button
                @click="isPriceModalOpen = false"
                class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                @click="confirmPriceEdit"
                class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Salvar Preço
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Modal de Criação de Item/Produto -->
        <div v-if="isCreateProductOpen" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" @click="isCreateProductOpen = false">
          <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" @click.stop>
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <Plus class="w-4 h-4 text-emerald-400" />
              <span>Cadastrar Novo {{ isServiceStore ? 'Serviço' : 'Produto' }}</span>
            </h3>

            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Nome:</label>
                <input
                  type="text"
                  v-model="newProductForm.name"
                  placeholder="Ex: Combo Burger Duplo"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Categoria:</label>
                <select
                  v-model="newProductForm.categoryId"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Preço (R$):</label>
                <input
                  type="number"
                  step="0.50"
                  v-model.number="newProductForm.price"
                  placeholder="0.00"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Descrição (opcional):</label>
                <textarea
                  v-model="newProductForm.description"
                  rows="2"
                  placeholder="Detalhes dos ingredientes ou benefícios..."
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                ></textarea>
              </div>
            </div>

            <div class="flex gap-2 pt-2">
              <button
                @click="isCreateProductOpen = false"
                class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                @click="handleCreateProductSubmit"
                class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>

        <!-- 3. Modal de Criação de Especialista -->
        <div v-if="isCreateProfOpen" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" @click="isCreateProfOpen = false">
          <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" @click.stop>
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <Plus class="w-4 h-4 text-emerald-400" />
              <span>Cadastrar Novo Especialista / Barbeiro</span>
            </h3>

            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Nome:</label>
                <input
                  type="text"
                  v-model="newProfForm.name"
                  placeholder="Ex: Dra. Mariana Costa"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Especialidade / Cargo:</label>
                <input
                  type="text"
                  v-model="newProfForm.role"
                  placeholder="Ex: Ortodontista & Harmonização"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div class="flex gap-2 pt-2">
              <button
                @click="isCreateProfOpen = false"
                class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                @click="handleCreateProfSubmit"
                class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>

        <!-- 4. Modal de Gestão de Opcionais / Adicionais -->
        <div v-if="isOptionsModalOpen && selectedProductForOptions" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" @click="isOptionsModalOpen = false">
          <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 class="text-sm font-bold text-white">Adicionais & Opcionais</h3>
                <p class="text-xs text-slate-400">{{ selectedProductForOptions.name }}</p>
              </div>
              <button @click="isOptionsModalOpen = false" class="p-1 text-slate-400 hover:text-white rounded-lg">
                <X class="w-4 h-4" />
              </button>
            </div>

            <div class="space-y-4">
              <div v-for="group in selectedProductForOptions.optionGroups" :key="group.id" class="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <h4 class="text-xs font-bold text-slate-300">{{ group.title }}</h4>
                <div class="space-y-1.5">
                  <div
                    v-for="opt in group.options"
                    :key="opt.id"
                    class="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                  >
                    <div class="flex items-center gap-2">
                      <span :class="{ 'line-through text-slate-500': isOptionPaused(opt.id) }">{{ opt.name }}</span>
                      <span v-if="opt.price > 0" class="text-slate-400 font-mono">+ R$ {{ opt.price.toFixed(2) }}</span>
                    </div>

                    <button
                      type="button"
                      @click="toggleOptionStatus(opt.id)"
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors"
                      :class="isOptionPaused(opt.id) ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'"
                    >
                      {{ isOptionPaused(opt.id) ? 'Pausado' : 'Ativo' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              @click="isOptionsModalOpen = false"
              class="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
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
import { ref, computed, watch, watchEffect, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useMerchantAdmin, type TenantOverrides } from '~/composables/useMerchantAdmin'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X
} from 'lucide-vue-next'
import type { Product, Category } from '@alaska/contracts'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const { tenant, refresh } = useTenant(slug)
const {
  isAuthenticated,
  errorMessage,
  login,
  logout,
  changePin,
  getOverrides,
  saveOverrides,
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
const adminToastMsg = ref('')

function showToast(msg: string) {
  adminToastMsg.value = msg
  setTimeout(() => { adminToastMsg.value = '' }, 2500)
}

// 1. Estado Reativo dos Overrides para Atualização Imediata da UI
const localOverrides = ref<TenantOverrides>({})

function refreshLocalOverrides() {
  localOverrides.value = getOverrides()
}

// Controle de Rolagem Horizontal das Abas
const navContainerRef = ref<HTMLElement | null>(null)
const canScrollNavLeft = ref(false)
const canScrollNavRight = ref(false)

function checkNavScroll() {
  if (!navContainerRef.value) return
  const { scrollLeft, scrollWidth, clientWidth } = navContainerRef.value
  canScrollNavLeft.value = scrollLeft > 8
  canScrollNavRight.value = scrollLeft < scrollWidth - clientWidth - 8
}

function scrollNav(direction: 'left' | 'right') {
  if (!navContainerRef.value) return
  const offset = direction === 'left' ? -220 : 220
  navContainerRef.value.scrollBy({ left: offset, behavior: 'smooth' })
  setTimeout(checkNavScroll, 300)
}

function handleNavWheel(e: WheelEvent) {
  if (!navContainerRef.value) return
  if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
    navContainerRef.value.scrollLeft += e.deltaY
    checkNavScroll()
  }
}

function selectTab(tab: any) {
  activeTab.value = tab
  nextTick(() => {
    checkNavScroll()
  })
}

onMounted(async () => {
  if (slug.value && typeof refresh === 'function') {
    await refresh()
  }
  refreshLocalOverrides()
  loadScheduleFromOverrides()
  loadPixAndContactFromOverrides()
  nextTick(() => {
    checkNavScroll()
  })
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', refreshLocalOverrides)
    window.addEventListener('alaska_overrides_updated', refreshLocalOverrides)
    window.addEventListener('resize', checkNavScroll)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('storage', refreshLocalOverrides)
    window.removeEventListener('alaska_overrides_updated', refreshLocalOverrides)
    window.removeEventListener('resize', checkNavScroll)
  }
})

// Identifica se a loja é de saúde/clínica ou barbearia/serviços
const isHealthStore = computed(() => {
  const cat = (tenant.value as any)?.businessCategory || (tenant.value as any)?.category || (tenant.value as any)?.template
  return cat === 'pro' || slug.value === 'clinica-sorriso'
})

const isServiceStore = computed(() => {
  const cat = (tenant.value as any)?.businessCategory || (tenant.value as any)?.category || (tenant.value as any)?.template
  return cat === 'hub' || cat === 'pro' || slug.value === 'barbearia-style' || slug.value === 'clinica-sorriso'
})

const categories = computed<Category[]>(() => {
  const baseCategories = (tenant.value?.categories || []) as Category[]
  const overrides = localOverrides.value
  const deletedProductIds = overrides.deletedProductIds || []
  const customProducts = overrides.customProducts || []

  return baseCategories.map(cat => {
    const baseProds = (cat.products || []).filter(p => !deletedProductIds.includes(p.id))
    const customForCat = customProducts.filter(p => p.categoryId === cat.id && !deletedProductIds.includes(p.id))

    return {
      ...cat,
      products: [...baseProds, ...customForCat]
    }
  })
})

function handleLogin() {
  login(pinInput.value)
  pinInput.value = ''
}

function isProductAvailable(product: Product): boolean {
  if (localOverrides.value.products?.[product.id]?.isAvailable !== undefined) {
    return localOverrides.value.products[product.id].isAvailable!
  }
  if (product.isAvailable !== undefined) return product.isAvailable
  if ((product as any).available !== undefined) return (product as any).available
  return true
}

function getProductPrice(product: Product): number {
  if (localOverrides.value.products?.[product.id]?.price !== undefined) {
    return localOverrides.value.products[product.id].price!
  }
  return product.price
}

function toggleProduct(products: Product[], productId: string, currentStatus: boolean) {
  toggleProductAvailability(products, productId, currentStatus)
  refreshLocalOverrides()
}

// 2. Edição de Preço
const isPriceModalOpen = ref(false)
const editingProduct = ref<Product | null>(null)
const editingProductsList = ref<Product[]>([])
const newPriceInput = ref<number>(0)

function openPriceModal(products: Product[], product: Product) {
  editingProduct.value = product
  editingProductsList.value = products
  newPriceInput.value = getProductPrice(product)
  isPriceModalOpen.value = true
}

async function confirmPriceEdit() {
  if (editingProduct.value && newPriceInput.value > 0) {
    await updateProductPrice(editingProductsList.value, editingProduct.value.id, newPriceInput.value)
    refreshLocalOverrides()
    showToast(`Preço de ${editingProduct.value.name} atualizado!`)
  }
  isPriceModalOpen.value = false
}

// 3. Criação e Exclusão de Produtos
const isCreateProductOpen = ref(false)
const newProductForm = ref({
  name: '',
  price: 0,
  categoryId: '',
  description: ''
})

function openCreateProductModal() {
  newProductForm.value = {
    name: '',
    price: 0,
    categoryId: categories.value[0]?.id || '',
    description: ''
  }
  isCreateProductOpen.value = true
}

function handleCreateProductSubmit() {
  if (!newProductForm.value.name || !newProductForm.value.price || !newProductForm.value.categoryId) {
    showToast('⚠️ Preencha nome, preço e categoria!')
    return
  }
  createProduct(newProductForm.value)
  refreshLocalOverrides()
  isCreateProductOpen.value = false
  showToast(`✅ ${newProductForm.value.name} cadastrado com sucesso!`)
}

function handleDeleteProduct(productId: string, productName: string) {
  if (confirm(`Tem certeza que deseja excluir "${productName}" do catálogo?`)) {
    deleteProduct(productId)
    refreshLocalOverrides()
    showToast(`🗑️ ${productName} removido!`)
  }
}

// 4. Gestão de Opcionais Pausados
const isOptionsModalOpen = ref(false)
const selectedProductForOptions = ref<Product | null>(null)

function openOptionsModal(product: Product) {
  selectedProductForOptions.value = product
  isOptionsModalOpen.value = true
}

function isOptionPaused(optionId: string): boolean {
  return (localOverrides.value.pausedOptionIds || []).includes(optionId)
}

function toggleOptionStatus(optionId: string) {
  const currentPaused = isOptionPaused(optionId)
  toggleOptionAvailability(optionId, currentPaused)
  refreshLocalOverrides()
}

// 5. Gestão Pix e Contatos
const pixConfigInput = ref({
  keyType: 'random' as 'cpf' | 'cnpj' | 'phone' | 'email' | 'random',
  pixKey: '',
  beneficiary: '',
  city: 'SAO PAULO'
})

const contactInput = ref({
  whatsapp: '',
  instagram: ''
})

function loadPixAndContactFromOverrides() {
  const ov = getOverrides()
  const basePix = tenant.value?.pixConfig || (tenant.value as any)?.pix || {}

  pixConfigInput.value = {
    keyType: ov.pix?.keyType || basePix.keyType || 'random',
    pixKey: ov.pix?.pixKey || basePix.key || basePix.pixKey || '',
    beneficiary: ov.pix?.beneficiary || basePix.beneficiary || tenant.value?.name || '',
    city: ov.pix?.city || basePix.city || 'SAO PAULO'
  }

  contactInput.value = {
    whatsapp: ov.contact?.whatsapp || tenant.value?.phoneWhatsApp || '',
    instagram: ov.contact?.instagram || (tenant.value as any)?.instagram || ''
  }
}

function savePixConfig() {
  updatePixConfig(pixConfigInput.value)
  refreshLocalOverrides()
  showToast('Configurações Pix salvas com sucesso!')
}

function saveContactConfig() {
  updateContact(contactInput.value)
  refreshLocalOverrides()
  showToast('Contatos salvos com sucesso!')
}

// 6. Programação Semanal de 7 Dias
const weeklyDaysConfig = ref([
  { key: 'monday', label: 'Segunda-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'tuesday', label: 'Terça-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'wednesday', label: 'Quarta-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'thursday', label: 'Quinta-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'friday', label: 'Sexta-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'saturday', label: 'Sábado', closed: false, open: '09:00', close: '20:00' },
  { key: 'sunday', label: 'Domingo', closed: true, open: '09:00', close: '18:00' },
])

const scheduleSuccessMsg = ref('')

function loadScheduleFromOverrides() {
  const overrides = getOverrides()
  const hours = overrides.openingHours || tenant.value?.openingHours || {}
  const defOpen = hours.open || '09:00'
  const defClose = hours.close || '20:00'

  weeklyDaysConfig.value.forEach(d => {
    const dayConfig = (hours as any)[d.key]
    if (dayConfig) {
      d.closed = Boolean(dayConfig.closed)
      d.open = dayConfig.open || defOpen
      d.close = dayConfig.close || defClose
    } else {
      d.open = defOpen
      d.close = defClose
    }
  })
}

watch(
  () => tenant.value,
  (newTenant) => {
    if (newTenant) {
      loadScheduleFromOverrides()
      loadPixAndContactFromOverrides()
    }
  },
  { deep: true }
)

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
  refreshLocalOverrides()
  scheduleSuccessMsg.value = 'Programação semanal salva com sucesso!'
  showToast('Programação semanal salva com sucesso!')
  setTimeout(() => { scheduleSuccessMsg.value = '' }, 2500)
}

// 7. Pausa de Emergência
const isEmergencyClosed = computed(() => {
  return Boolean(localOverrides.value.emergency?.isClosed)
})

function toggleEmergencyPause() {
  const newStatus = !isEmergencyClosed.value
  updateEmergency(newStatus, newStatus ? 'Atendimento pausado temporariamente' : '')
  refreshLocalOverrides()
  showToast(newStatus ? '🛑 Atendimento da loja pausado!' : '🟢 Loja reaberta com sucesso!')
}

// 8. Barbeiros & Especialistas da Clínica com Horários e Almoço
const defaultProfessionalsBySlug: Record<string, Array<{ id: string; name: string; role: string; isAvailable: boolean; availableDays: number[]; workHours: { start: string; end: string }; lunchBreak: { start: string; end: string; enabled: boolean } }>> = {
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

const professionalsList = computed(() => {
  const profOverrides = localOverrides.value.professionals || {}
  const deletedProfIds = localOverrides.value.deletedProfessionalIds || []
  const customProfs = localOverrides.value.customProfessionals || []

  const baseList = defaultProfessionalsBySlug[slug.value] || defaultProfessionalsBySlug['barbearia-style']
  const filteredBase = baseList.filter(p => !deletedProfIds.includes(p.id))

  const all = [...filteredBase, ...customProfs.filter(p => !deletedProfIds.includes(p.id))]

  return all.map(p => {
    const ov = profOverrides[p.id]
    return {
      ...p,
      isAvailable: ov?.isAvailable !== undefined ? Boolean(ov.isAvailable) : Boolean(p.isAvailable),
      availableDays: ov?.availableDays ? [...ov.availableDays] : [...p.availableDays],
      workHours: {
        start: ov?.workHours?.start || p.workHours.start,
        end: ov?.workHours?.end || p.workHours.end
      },
      lunchBreak: {
        start: ov?.lunchBreak?.start || p.lunchBreak.start,
        end: ov?.lunchBreak?.end || p.lunchBreak.end,
        enabled: ov?.lunchBreak?.enabled !== undefined ? Boolean(ov.lunchBreak.enabled) : p.lunchBreak.enabled
      }
    }
  })
})

function handleProfAvailabilityToggle(profId: string, currentAvailable: boolean, name: string) {
  const newStatus = !currentAvailable
  toggleProfessionalAvailability(profId, newStatus)
  refreshLocalOverrides()
  showToast(newStatus ? `✅ ${name} agora está atendendo!` : `🏖️ ${name} marcado como De Folga!`)
}

function handleProfDayToggle(profId: string, dayIndex: number, name: string) {
  const prof = professionalsList.value.find(p => p.id === profId)
  if (!prof) return
  let days = [...(prof.availableDays || [])]
  if (days.includes(dayIndex)) {
    days = days.filter(d => d !== dayIndex)
  } else {
    days.push(dayIndex)
  }
  updateProfessionalDays(profId, days.sort())
  refreshLocalOverrides()
  showToast(`📅 Escala semanal de ${name} atualizada!`)
}

function handleProfWorkHoursChange(profId: string, workHours: { start: string; end: string }, name: string) {
  updateProfessionalHours(profId, workHours)
  refreshLocalOverrides()
  showToast(`⏰ Horário de ${name} salvo: ${workHours.start} às ${workHours.end}!`)
}

function handleProfLunchChange(profId: string, lunchBreak: { start: string; end: string; enabled: boolean }, name: string) {
  updateProfessionalLunch(profId, lunchBreak)
  refreshLocalOverrides()
  showToast(`🍽️ Intervalo de almoço de ${name} atualizado!`)
}

// 9. Criação e Exclusão de Especialistas
const isCreateProfOpen = ref(false)
const newProfForm = ref({
  name: '',
  role: ''
})

function openCreateProfModal() {
  newProfForm.value = {
    name: '',
    role: ''
  }
  isCreateProfOpen.value = true
}

function handleCreateProfSubmit() {
  if (!newProfForm.value.name || !newProfForm.value.role) {
    showToast('⚠️ Preencha nome e especialidade!')
    return
  }
  createProfessional({
    name: newProfForm.value.name,
    role: newProfForm.value.role,
    availableDays: [1, 2, 3, 4, 5],
    workHours: { start: '08:00', end: '18:00' },
    lunchBreak: { start: '12:00', end: '13:00', enabled: true }
  })
  refreshLocalOverrides()
  isCreateProfOpen.value = false
  showToast(`✅ ${newProfForm.value.name} cadastrado na equipe!`)
}

function handleDeleteProf(profId: string, profName: string) {
  if (confirm(`Tem certeza que deseja remover "${profName}" da equipe?`)) {
    deleteProfessional(profId)
    refreshLocalOverrides()
    showToast(`🗑️ ${profName} removido da equipe!`)
  }
}

// 10. Delivery & Taxas
const deliveryFeeInput = ref((tenant.value as any)?.deliveryFee || 6.0)
const minOrderInput = ref((tenant.value as any)?.minOrderValue || 20.0)
const estimatedTimeInput = ref('35-50 min')

function saveDeliveryConfig() {
  updateDelivery(deliveryFeeInput.value, minOrderInput.value, estimatedTimeInput.value)
  refreshLocalOverrides()
  showToast('Configurações de delivery atualizadas!')
}

// 11. Comunicado
const announcementEnabled = ref(false)
const announcementMessage = ref('')

function saveAnnouncementConfig() {
  updateAnnouncement(announcementEnabled.value, announcementMessage.value)
  refreshLocalOverrides()
  showToast('Comunicado oficial atualizado!')
}

// 12. Troca de PIN
const newPinInput = ref('')
const pinSuccessMsg = ref('')

function saveNewPin() {
  if (changePin(newPinInput.value)) {
    pinSuccessMsg.value = 'PIN de acesso atualizado com sucesso!'
    newPinInput.value = ''
    refreshLocalOverrides()
    showToast('PIN atualizado com sucesso!')
    setTimeout(() => { pinSuccessMsg.value = '' }, 3000)
  }
}

// 13. Agenda & Bloqueios de Horário
const selectedAgendaDate = ref(new Date().toISOString().split('T')[0])
const sampleSlots = [
  '08:00', '08:45', '09:30', '10:15', '11:00',
  '11:45', '12:30', '13:15', '14:00', '14:45',
  '15:30', '16:15', '17:00', '17:45', '18:30'
]

function isSlotBlocked(date: string, time: string): boolean {
  const slots = localOverrides.value.blockedSlots || []
  return slots.some(s => s.date === date && s.time === time)
}

function handleSlotToggle(date: string, time: string) {
  const currentlyBlocked = isSlotBlocked(date, time)
  toggleBlockSlot(date, time)
  refreshLocalOverrides()
  showToast(currentlyBlocked ? `🟢 Horário ${time} liberado para agendamento!` : `🛑 Horário ${time} bloqueado na agenda!`)
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.no-scrollbar {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
</style>
