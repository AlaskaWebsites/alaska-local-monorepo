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
                {{ isServiceStore ? '💈 Gestão de Serviços & Profissionais' : '🍔 Gestão de Cardápio & Delivery' }}
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
            💈 Barbeiros & Agenda
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
              <p class="text-slate-300 mt-0.5">Ligue ou desligue itens esgotados e edite preços sem precisar fazer deploy.</p>
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

        <!-- ABA 2: Barbeiros & Agenda (Exclusivo Hub & Pro) -->
        <main v-else-if="activeTab === 'agenda' && isServiceStore" class="px-4 mt-4 space-y-6">
          <!-- 1. Gestão de Profissionais / Barbeiros -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>💈 Profissionais & Folgas da Equipe</span>
            </h2>
            <p class="text-xs text-slate-400">
              Gerencie a escala e marque se o profissional está de folga hoje.
            </p>

            <div class="space-y-3 pt-1">
              <div
                v-for="prof in professionalsList"
                :key="prof.id"
                class="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                      {{ prof.name.charAt(0) }}
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-white">{{ prof.name }}</h4>
                      <span class="text-[10px] text-slate-400">{{ prof.role }}</span>
                    </div>
                  </div>

                  <!-- Switch de Disponibilidade do Barbeiro -->
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold uppercase" :class="prof.isAvailable ? 'text-emerald-400' : 'text-rose-400'">
                      {{ prof.isAvailable ? 'Atendendo' : 'De Folga' }}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      :aria-checked="prof.isAvailable"
                      @click="toggleProfAvailable(prof.id, prof.isAvailable)"
                      class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
                      :class="prof.isAvailable ? 'bg-emerald-500' : 'bg-slate-800'"
                    >
                      <span
                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
                        :class="prof.isAvailable ? 'translate-x-5' : 'translate-x-0'"
                      />
                    </button>
                  </div>
                </div>

                <!-- Dias de Atendimento na Semana -->
                <div class="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                  <span class="text-[10px] text-slate-500 font-semibold mr-1">Dias:</span>
                  <button
                    v-for="(dayName, dIdx) in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']"
                    :key="dIdx"
                    @click="toggleProfDay(prof.id, dIdx)"
                    class="px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer"
                    :class="prof.availableDays?.includes(dIdx) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-600 border border-slate-800'"
                  >
                    {{ dayName }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Bloqueio Rápido de Horários Específicos -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>📅 Bloqueio Rápido de Horários (Intervalos)</span>
            </h2>
            <p class="text-xs text-slate-400">
              Selecione uma data para bloquear ou liberar horários específicos da agenda.
            </p>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1.5">Data:</label>
              <input
                type="date"
                v-model="selectedAgendaDate"
                class="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div class="grid grid-cols-4 gap-2 pt-2">
              <button
                v-for="time in sampleSlots"
                :key="time"
                @click="toggleBlockSlot(selectedAgendaDate, time)"
                class="py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center justify-center gap-0.5"
                :class="isSlotBlocked(selectedAgendaDate, time) ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-emerald-500'"
              >
                <span>{{ time }}</span>
                <span class="text-[9px] uppercase tracking-wider font-extrabold" :class="isSlotBlocked(selectedAgendaDate, time) ? 'text-rose-500' : 'text-emerald-400'">
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
              Cozinha lotada, chuva forte ou folga inesperada? Pause todo o atendimento da loja com um clique.
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
              Defina os dias em que a loja abre e os horários de atendimento de cada dia da semana.
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
                    @click="d.closed = !d.closed"
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
                    class="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                  />
                  <span class="text-slate-500">às</span>
                  <input
                    type="time"
                    v-model="d.close"
                    class="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              @click="saveWeeklySchedule"
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-4"
            >
              Salvar Programação Semanal
            </button>
          </div>
        </main>

        <!-- ABA 4: Delivery & Taxas -->
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
              Divulgue avisos importantes, folgas ou promoções diretamente no topo do cardápio para todos os clientes.
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
                placeholder="Ex: ⚠️ Hoje estamos atendendo exclusivamente com retirada no balcão!"
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
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useMerchantAdmin } from '~/composables/useMerchantAdmin'
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
  updateDelivery,
  updateAnnouncement,
  updateEmergency,
  toggleBlockSlot
} = useMerchantAdmin(slug.value)

const pinInput = ref('')
const activeTab = ref<'catalog' | 'agenda' | 'hours' | 'delivery' | 'announcement' | 'security'>('catalog')

// Identifica se a loja é de serviços/agendamento
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
}

// 1. Edição de Preço
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
  }
  isPriceModalOpen.value = false
}

// 2. Programação Semanal de 7 Dias
const weeklyDaysConfig = ref([
  { key: 'monday', label: 'Segunda-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'tuesday', label: 'Terça-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'wednesday', label: 'Quarta-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'thursday', label: 'Quinta-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'friday', label: 'Sexta-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'saturday', label: 'Sábado', closed: false, open: '09:00', close: '20:00' },
  { key: 'sunday', label: 'Domingo', closed: true, open: '09:00', close: '18:00' },
])

onMounted(() => {
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
})

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
}

// 3. Pausa de Emergência
const isEmergencyClosed = ref(false)

function toggleEmergencyPause() {
  isEmergencyClosed.value = !isEmergencyClosed.value
  updateEmergency(isEmergencyClosed.value, isEmergencyClosed.value ? 'Atendimento pausado temporariamente' : '')
}

// 4. Barbeiros & Profissionais
const defaultProfessionals = [
  { id: 'prof-1', name: 'Carlos Santos', role: 'Barbeiro Master', isAvailable: true, availableDays: [1, 2, 3, 4, 5, 6] },
  { id: 'prof-2', name: 'Lucas Oliveira', role: 'Visagista & Barbeiro', isAvailable: true, availableDays: [2, 3, 4, 5, 6] },
  { id: 'prof-3', name: 'Mateus Silva', role: 'Especialista em Cortes Clássicos', isAvailable: true, availableDays: [1, 3, 4, 5, 6] }
]

const professionalsList = computed(() => {
  const overrides = getOverrides()
  const profOverrides = overrides.professionals || {}

  return defaultProfessionals.map(p => {
    const ov = profOverrides[p.id]
    return {
      ...p,
      isAvailable: ov?.isAvailable !== undefined ? ov.isAvailable : p.isAvailable,
      availableDays: ov?.availableDays || p.availableDays
    }
  })
})

function toggleProfAvailable(profId: string, currentAvailable: boolean) {
  toggleProfessionalAvailability(profId, !currentAvailable)
}

function toggleProfDay(profId: string, dayIndex: number) {
  const prof = professionalsList.value.find(p => p.id === profId)
  if (!prof) return
  let days = [...(prof.availableDays || [])]
  if (days.includes(dayIndex)) {
    days = days.filter(d => d !== dayIndex)
  } else {
    days.push(dayIndex)
  }
  updateProfessionalDays(profId, days.sort())
}

// 5. Delivery & Taxas
const deliveryFeeInput = ref((tenant.value as any)?.deliveryFee || 6.0)
const minOrderInput = ref((tenant.value as any)?.minOrderValue || 20.0)
const estimatedTimeInput = ref('35-50 min')

function saveDeliveryConfig() {
  updateDelivery(deliveryFeeInput.value, minOrderInput.value, estimatedTimeInput.value)
}

// 6. Comunicado
const announcementEnabled = ref(false)
const announcementMessage = ref('')

function saveAnnouncementConfig() {
  updateAnnouncement(announcementEnabled.value, announcementMessage.value)
}

// 7. Troca de PIN
const newPinInput = ref('')
const pinSuccessMsg = ref('')

function saveNewPin() {
  if (updateAdminPin(newPinInput.value)) {
    pinSuccessMsg.value = 'PIN de acesso atualizado com sucesso!'
    newPinInput.value = ''
    setTimeout(() => { pinSuccessMsg.value = '' }, 3000)
  }
}

// 8. Agenda & Bloqueios
const selectedAgendaDate = ref(new Date().toISOString().split('T')[0])
const sampleSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

function isSlotBlocked(date: string, time: string): boolean {
  const overrides = getOverrides()
  const slots = overrides.blockedSlots || []
  return slots.some(s => s.date === date && s.time === time)
}
</script>
