<!-- pages/[slug]/admin.vue -->
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
            <p class="text-sm text-slate-400">Digite seu PIN de acesso para gerenciar sua loja</p>
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

        <!-- Navegação em Abas Operacionais -->
        <nav class="px-4 pt-4 flex gap-2 overflow-x-auto no-scrollbar pb-2" role="tablist">
          <button
            @click="activeTab = 'catalog'"
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            :class="activeTab === 'catalog' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'"
          >
            {{ isServiceStore ? '✂️ Serviços & Preços' : '⚡ Cardápio & Preços' }}
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
            @click="activeTab = 'hours'"
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            :class="activeTab === 'hours' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'"
          >
            🕒 Horários & Dias
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
            🔐 Segurança
          </button>
        </nav>

        <!-- ABA 1: Catálogo e Serviços (Pausa e Edição de Preços) -->
        <main v-if="activeTab === 'catalog'" class="px-4 mt-4 space-y-6">
          <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-start gap-3">
            <span class="text-lg">⚡</span>
            <div class="text-xs">
              <p class="font-bold text-emerald-400">Pausa Rápida & Preços em Tempo Real</p>
              <p class="text-slate-300 mt-0.5">Ligue ou desligue procedimentos/produtos e edite preços sem precisar fazer deploy.</p>
            </div>
          </div>

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

                  <div class="flex items-center gap-3 mt-1.5">
                    <button
                      @click="openPriceModal(category.products, product)"
                      class="text-xs text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md cursor-pointer"
                      title="Editar preço"
                    >
                      <span>✏️ R$ {{ Number(product.price).toFixed(2).replace('.', ',') }}</span>
                    </button>

                    <span v-if="product.durationMinutes" class="text-[11px] text-slate-400">
                      ⏱️ {{ product.durationMinutes }}min
                    </span>
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
        </main>

        <!-- ABA 2: Equipe & Agenda (Exclusivo Hub & Pro) com Horários Individuais e Almoço -->
        <main v-else-if="activeTab === 'agenda' && isServiceStore" class="px-4 mt-4 space-y-6">
          <!-- 1. Gestão de Profissionais / Especialistas -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>{{ isHealthStore ? '🩺 Especialistas & Horários Individuais' : '💈 Barbeiros & Horários Individuais' }}</span>
            </h2>
            <p class="text-xs text-slate-400">
              Configure os dias de atendimento, horário de expediente e pausa de almoço de cada especialista.
            </p>

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

                  <!-- Switch de Disponibilidade Reativo -->
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

        <!-- ABA 3: Horários & Tabela Semanal de 7 Dias -->
        <main v-else-if="activeTab === 'hours'" class="px-4 mt-4 space-y-6">
          <!-- Pausa de Emergência -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>🛑 Pausa Geral de Atendimento</span>
            </h2>
            <p class="text-xs text-slate-400">
              Precisa pausar o atendimento de emergência? Pause todas as solicitações com um clique.
            </p>

            <button
              @click="toggleEmergencyPause"
              class="w-full py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-lg"
              :class="isEmergencyClosed ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-rose-600 text-white hover:bg-rose-700'"
            >
              {{ isEmergencyClosed ? '🟢 Reabrir Atendimento Agora' : '🛑 Pausar Atendimento da Loja Agora' }}
            </button>
          </div>

          <!-- Tabela Semanal Completa de Segunda a Domingo -->
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
                class="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div class="flex items-center justify-between sm:justify-start gap-3">
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
                  <span class="text-xs font-bold text-white w-28">{{ d.label }}</span>
                  <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded" :class="!d.closed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'">
                    {{ !d.closed ? 'Aberto' : 'Fechado' }}
                  </span>
                </div>

                <div v-if="!d.closed" class="flex items-center gap-2 text-xs">
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

        <!-- ABA 4: Delivery & Taxas (Menu e Shop) -->
        <main v-else-if="activeTab === 'delivery' && !isServiceStore" class="px-4 mt-4 space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>🛵 Configurações de Entrega & Pedido</span>
            </h2>

            <div class="space-y-4 text-xs">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Taxa de Entrega Padrão (R$):</label>
                <input
                  type="number"
                  step="0.50"
                  v-model.number="deliveryFeeInput"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label class="block text-slate-400 font-semibold mb-1">Pedido Mínimo (R$):</label>
                <input
                  type="number"
                  step="5.00"
                  v-model.number="minOrderInput"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label class="block text-slate-400 font-semibold mb-1">Tempo Estimado de Espera (ex: 35-50 min):</label>
                <input
                  type="text"
                  v-model="estimatedTimeInput"
                  placeholder="35-50 min"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              @click="saveDeliveryConfig"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
            >
              Atualizar Delivery
            </button>
          </div>
        </main>

        <!-- ABA 5: Comunicado -->
        <main v-else-if="activeTab === 'announcement'" class="px-4 mt-4 space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>📢 Banner de Comunicado no Topo da Vitrine</span>
            </h2>
            <p class="text-xs text-slate-400">
              Divulgue avisos importantes, folgas ou comunicados diretamente no topo para todos os clientes.
            </p>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span class="text-xs font-bold text-slate-300">Exibir Banner de Comunicado:</span>
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

            <div v-if="announcementEnabled">
              <label class="block text-xs text-slate-400 font-semibold mb-1">Mensagem do Comunicado:</label>
              <textarea
                v-model="announcementMessage"
                rows="3"
                placeholder="Ex: ⚠️ Horário especial de feriado neste sábado!"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 leading-relaxed"
              ></textarea>
            </div>

            <button
              @click="saveAnnouncementConfig"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
            >
              Salvar Comunicado
            </button>
          </div>
        </main>

        <!-- ABA 6: Segurança & Troca de PIN -->
        <main v-else-if="activeTab === 'security'" class="px-4 mt-4 space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>🔐 Alterar PIN de Acesso da Loja</span>
            </h2>
            <p class="text-xs text-slate-400">
              Defina um novo código numérico de 4 a 8 dígitos para proteger o painel da sua loja.
            </p>

            <div>
              <label class="block text-xs text-slate-400 font-semibold mb-1">Novo PIN Numérico:</label>
              <input
                type="password"
                maxlength="8"
                inputmode="numeric"
                v-model="newPinInput"
                placeholder="••••"
                class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-center text-xl font-mono text-white outline-none"
              />
            </div>

            <div v-if="pinSuccessMsg" class="text-xs text-emerald-400 text-center font-bold bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-lg">
              {{ pinSuccessMsg }}
            </div>

            <button
              @click="saveNewPin"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
            >
              Atualizar PIN
            </button>
          </div>
        </main>

        <!-- Modal de Edição Rápida de Preço -->
        <Teleport to="body">
          <div v-if="isPriceModalOpen" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h3 class="text-sm font-bold text-white">Editar Preço: {{ editingProduct?.name }}</h3>
              
              <div>
                <label class="block text-xs text-slate-400 mb-1 font-semibold">Novo Preço (R$):</label>
                <input
                  type="number"
                  step="0.10"
                  v-model.number="newPriceInput"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-lg font-mono font-bold text-white outline-none focus:border-emerald-500"
                  autofocus
                />
              </div>

              <div class="flex gap-2 pt-2">
                <button
                  @click="isPriceModalOpen = false"
                  class="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  @click="confirmPriceEdit"
                  class="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </Teleport>
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
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useMerchantAdmin, type TenantOverrides } from '~/composables/useMerchantAdmin'
import type { Product, Category } from '@alaska/contracts'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const { tenant } = useTenant(slug)
const {
  isAuthenticated,
  errorMessage,
  login,
  logout,
  updateAdminPin,
  getOverrides,
  applyOverridesToCategories,
  toggleProductAvailability,
  updateProductPrice,
  updateWeeklySchedule,
  toggleProfessionalAvailability,
  updateProfessionalDays,
  updateProfessionalHours,
  updateProfessionalLunch,
  updateDelivery,
  updateAnnouncement,
  updateEmergency,
  toggleBlockSlot
} = useMerchantAdmin(slug)

const pinInput = ref('')
const activeTab = ref<'catalog' | 'agenda' | 'hours' | 'delivery' | 'announcement' | 'security'>('catalog')
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

onMounted(() => {
  refreshLocalOverrides()
  loadScheduleFromOverrides()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', refreshLocalOverrides)
    window.addEventListener('alaska_overrides_updated', refreshLocalOverrides)
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
  return (tenant.value?.categories || []) as Category[]
})

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
  newPriceInput.value = Number(product.price)
  isPriceModalOpen.value = true
}

async function confirmPriceEdit() {
  if (editingProduct.value && newPriceInput.value > 0) {
    await updateProductPrice(editingProductsList.value, editingProduct.value.id, newPriceInput.value)
    refreshLocalOverrides()
  }
  isPriceModalOpen.value = false
}

// 3. Programação Semanal de 7 Dias com Sincronização e Auto-Save
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

watch(
  () => tenant.value,
  (newTenant) => {
    if (newTenant) {
      loadScheduleFromOverrides()
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

// 4. Pausa de Emergência
const isEmergencyClosed = computed(() => {
  return Boolean(localOverrides.value.emergency?.isClosed)
})

function toggleEmergencyPause() {
  const newStatus = !isEmergencyClosed.value
  updateEmergency(newStatus, newStatus ? 'Atendimento pausado temporariamente' : '')
  refreshLocalOverrides()
}

// 5. Barbeiros & Especialistas da Clínica com Horários e Almoço
const defaultProfessionalsBySlug: Record<string, Array<{ id: string; name: string; role: string; isAvailable: boolean; availableDays: number[]; workHours: { start: string; end: string }; lunchBreak: { start: string; end: string; enabled: boolean } }>> = {
  'clinica-sorriso': [
    { id: 'prof-1', name: 'Dra. Camila Rocha', role: 'Cirurgiã Dentista & Implantes', isAvailable: true, availableDays: [1, 2, 3, 4, 5], workHours: { start: '08:00', end: '17:00' }, lunchBreak: { start: '12:00', end: '13:00', enabled: true } },
    { id: 'prof-2', name: 'Dr. Rafael Mendes', role: 'Ortodontista & Invisalign', isAvailable: true, availableDays: [1, 2, 3, 4, 5, 6], workHours: { start: '09:00', end: '19:00' }, lunchBreak: { start: '13:00', end: '14:00', enabled: true } },
    { id: 'prof-3', name: 'Dra. Beatriz Lima', role: 'Harmonização Orofacial & Estética', isAvailable: true, availableDays: [2, 3, 4, 5, 6], workHours: { start: '10:00', end: '19:00', }, lunchBreak: { start: '13:00', end: '14:00', enabled: false } }
  ],
  'barbearia-style': [
    { id: 'prof-1', name: 'Carlos Santos', role: 'Barbeiro Master', isAvailable: true, availableDays: [1, 2, 3, 4, 5, 6], workHours: { start: '09:00', end: '20:00' }, lunchBreak: { start: '12:00', end: '13:00', enabled: true } },
    { id: 'prof-2', name: 'Lucas Oliveira', role: 'Visagista & Barbeiro', isAvailable: true, availableDays: [2, 3, 4, 5, 6], workHours: { start: '10:00', end: '20:00' }, lunchBreak: { start: '14:00', end: '15:00', enabled: true } },
    { id: 'prof-3', name: 'Mateus Silva', role: 'Especialista em Cortes Clássicos', isAvailable: true, availableDays: [1, 3, 4, 5, 6], workHours: { start: '09:00', end: '18:00' }, lunchBreak: { start: '12:00', end: '13:00', enabled: false } }
  ]
}

const professionalsList = computed(() => {
  const profOverrides = localOverrides.value.professionals || {}
  const list = defaultProfessionalsBySlug[slug.value] || defaultProfessionalsBySlug['barbearia-style']

  return list.map(p => {
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

// 6. Delivery & Taxas
const deliveryFeeInput = ref((tenant.value as any)?.deliveryFee || 6.0)
const minOrderInput = ref((tenant.value as any)?.minOrderValue || 20.0)
const estimatedTimeInput = ref('35-50 min')

function saveDeliveryConfig() {
  updateDelivery(deliveryFeeInput.value, minOrderInput.value, estimatedTimeInput.value)
  refreshLocalOverrides()
  showToast('Configurações de delivery atualizadas!')
}

// 7. Comunicado
const announcementEnabled = ref(false)
const announcementMessage = ref('')

function saveAnnouncementConfig() {
  updateAnnouncement(announcementEnabled.value, announcementMessage.value)
  refreshLocalOverrides()
  showToast('Comunicado oficial atualizado!')
}

// 8. Troca de PIN
const newPinInput = ref('')
const pinSuccessMsg = ref('')

function saveNewPin() {
  if (updateAdminPin(newPinInput.value)) {
    pinSuccessMsg.value = 'PIN de acesso atualizado com sucesso!'
    newPinInput.value = ''
    refreshLocalOverrides()
    showToast('PIN atualizado com sucesso!')
    setTimeout(() => { pinSuccessMsg.value = '' }, 3000)
  }
}

// 9. Agenda & Bloqueios de Horário
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
