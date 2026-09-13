<template>
  <Teleport to="body">
    <!-- Overlay e Container do Modal -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      @click.self="emit('close')"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200"
      >
        <!-- HEADER DO MODAL -->
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/80">
          <div class="flex items-center gap-2.5">
            <div
              class="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-sm"
              :class="themeClasses.badgeBg"
            >
              <Calendar class="w-5 h-5" />
            </div>
            <div>
              <h2 id="booking-modal-title" class="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                Agendar Horário
              </h2>
              <p class="text-[11px] text-slate-500">
                {{ props.tenant.name }} • Escolha seus serviços e profissional
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="emit('close')"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- INDICADOR DE STEPS (Passo a Passo) -->
        <div class="px-5 py-3 bg-white border-b border-slate-100 shrink-0">
          <div class="flex items-center justify-between relative">
            <div class="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 w-full z-0"></div>
            <div
              class="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-600 transition-all duration-300 z-0"
              :style="{ width: `${((currentStep - 1) / 3) * 100}%` }"
            ></div>

            <!-- Step 1 -->
            <button
              type="button"
              @click="canGoToStep(1) && (currentStep = 1)"
              class="relative z-10 flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                :class="
                  currentStep === 1
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                "
              >
                <Check v-if="currentStep > 1" class="w-3.5 h-3.5 stroke-[3]" />
                <span v-else>1</span>
              </div>
              <span class="text-[10px] font-semibold tracking-tight" :class="currentStep === 1 ? 'text-emerald-700' : 'text-slate-500'">
                Serviços
              </span>
            </button>

            <!-- Step 2 -->
            <button
              type="button"
              @click="canGoToStep(2) && (currentStep = 2)"
              :disabled="!canGoToStep(2)"
              class="relative z-10 flex flex-col items-center gap-1 group disabled:cursor-not-allowed cursor-pointer"
            >
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                :class="
                  currentStep === 2
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                "
              >
                <Check v-if="currentStep > 2" class="w-3.5 h-3.5 stroke-[3]" />
                <span v-else>2</span>
              </div>
              <span class="text-[10px] font-semibold tracking-tight" :class="currentStep === 2 ? 'text-emerald-700' : 'text-slate-500'">
                Profissional
              </span>
            </button>

            <!-- Step 3 -->
            <button
              type="button"
              @click="canGoToStep(3) && (currentStep = 3)"
              :disabled="!canGoToStep(3)"
              class="relative z-10 flex flex-col items-center gap-1 group disabled:cursor-not-allowed cursor-pointer"
            >
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                :class="
                  currentStep === 3
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm'
                    : currentStep > 3
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                "
              >
                <Check v-if="currentStep > 3" class="w-3.5 h-3.5 stroke-[3]" />
                <span v-else>3</span>
              </div>
              <span class="text-[10px] font-semibold tracking-tight" :class="currentStep === 3 ? 'text-emerald-700' : 'text-slate-500'">
                Horário
              </span>
            </button>

            <!-- Step 4 -->
            <button
              type="button"
              @click="canGoToStep(4) && (currentStep = 4)"
              :disabled="!canGoToStep(4)"
              class="relative z-10 flex flex-col items-center gap-1 group disabled:cursor-not-allowed cursor-pointer"
            >
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                :class="
                  currentStep === 4
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm'
                    : 'bg-slate-200 text-slate-600'
                "
              >
                <span>4</span>
              </div>
              <span class="text-[10px] font-semibold tracking-tight" :class="currentStep === 4 ? 'text-emerald-700' : 'text-slate-500'">
                Confirmar
              </span>
            </button>
          </div>
        </div>

        <!-- CORPO DO MODAL (Conteúdo do Passo Atual) -->
        <div class="p-5 overflow-y-auto flex-1 space-y-4">
          <!-- STEP 1: Escolha de Serviços (Multi-seleção) -->
          <div v-if="currentStep === 1" class="space-y-3 animate-in fade-in duration-150">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-sm text-slate-900">Selecione um ou mais serviços:</h3>
                <p class="text-xs text-slate-500">Combine corte, barba ou tratamentos em um só agendamento.</p>
              </div>
              <span
                v-if="selectedServices.length > 0"
                class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                {{ selectedServices.length }} selecionado(s)
              </span>
            </div>

            <!-- Lista de Serviços -->
            <div class="grid gap-2.5">
              <div
                v-for="service in availableServices"
                :key="service.id"
                @click="toggleService(service)"
                class="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none"
                :class="
                  isServiceSelected(service.id)
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                "
              >
                <div class="flex items-start gap-3">
                  <div
                    class="w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-all shrink-0"
                    :class="
                      isServiceSelected(service.id)
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    "
                  >
                    <Check v-if="isServiceSelected(service.id)" class="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 class="font-bold text-sm text-slate-900 leading-snug">{{ service.name }}</h4>
                    <p v-if="service.description" class="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {{ service.description }}
                    </p>
                    <div class="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                      <span class="flex items-center gap-1 font-medium">
                        <Clock class="w-3.5 h-3.5 text-slate-400" />
                        {{ service.durationMinutes || 30 }} min
                      </span>
                    </div>
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <span class="font-bold text-sm text-slate-900 block font-mono">
                    {{ formatCurrency(service.price) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 2: Escolha de Profissional com Respeito a Folgas e Escala -->
          <div v-else-if="currentStep === 2" class="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 class="font-bold text-sm text-slate-900">Escolha o profissional / especialista:</h3>
              <p class="text-xs text-slate-500">Ou selecione "Qualquer profissional" para o primeiro horário livre.</p>
            </div>

            <!-- Opção "Qualquer Profissional" -->
            <div
              @click="selectedProfessional = null"
              class="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none"
              :class="
                selectedProfessional === null
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              "
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200"
                >
                  <Sparkles class="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 class="font-bold text-sm text-slate-900">Primeiro Profissional Disponível</h4>
                  <p class="text-xs text-slate-500">Maior flexibilidade e agilidade para o seu atendimento.</p>
                </div>
              </div>
              <div
                class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                :class="selectedProfessional === null ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'"
              >
                <div v-if="selectedProfessional === null" class="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>

            <!-- Lista de Profissionais Específicos -->
            <div class="grid gap-2.5">
              <div
                v-for="prof in availableProfessionals"
                :key="prof.id"
                @click="selectedProfessional = prof"
                class="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none"
                :class="
                  selectedProfessional?.id === prof.id
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                "
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold overflow-hidden border border-slate-200 shrink-0"
                  >
                    <img
                      v-if="prof.avatar"
                      :src="prof.avatar"
                      :alt="prof.name"
                      class="w-full h-full object-cover"
                    />
                    <User v-else class="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h4 class="font-bold text-sm text-slate-900 leading-snug">{{ prof.name }}</h4>
                    <p class="text-xs text-slate-500">{{ prof.role || 'Profissional' }}</p>
                    <div class="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-0.5">
                      <Check class="w-3 h-3" />
                      <span>Atende todos os serviços selecionados</span>
                    </div>
                  </div>
                </div>

                <div
                  class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                  :class="selectedProfessional?.id === prof.id ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'"
                >
                  <div v-if="selectedProfessional?.id === prof.id" class="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 3: Escolha de Data e Horário -->
          <div v-else-if="currentStep === 3" class="space-y-4 animate-in fade-in duration-150">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-sm text-slate-900">Selecione o dia e horário:</h3>
                <p class="text-xs text-slate-500">Próximos 30 dias disponíveis para agendamento.</p>
              </div>

              <!-- Botões de Navegação Desktop (Setas ← e →) -->
              <div class="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  @click="scrollDays('left')"
                  class="p-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs cursor-pointer transition-all active:scale-95 flex items-center justify-center"
                  aria-label="Dias anteriores"
                  title="Dias anteriores"
                >
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  @click="scrollDays('right')"
                  class="p-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs cursor-pointer transition-all active:scale-95 flex items-center justify-center"
                  aria-label="Próximos dias"
                  title="Próximos dias"
                >
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Carrossel de Dias com Rolagem Suave -->
            <div
              ref="daysContainerRef"
              @wheel="handleDaysWheel"
              class="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 -mx-1 px-1"
            >
              <button
                type="button"
                v-for="day in bookingDays"
                :key="day.date"
                @click="selectedDate = day.date"
                :class="[
                  'shrink-0 p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center w-16 cursor-pointer select-none active:scale-95',
                  selectedDate === day.date
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                ]"
              >
                <span class="text-[10px] uppercase font-bold tracking-wider opacity-80">{{ day.dayOfWeek }}</span>
                <span class="text-base font-extrabold my-0.5">{{ day.dayNumber }}</span>
                <span class="text-[10px] font-medium opacity-80">{{ day.month }}</span>
              </button>
            </div>

            <!-- Aviso se o Profissional Selecionado não atende neste dia da semana -->
            <div v-if="isProfOffOnDate" class="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs gap-3">
              <div class="text-amber-800 space-y-0.5">
                <span class="font-bold block">⚠️ {{ selectedProfessional?.name }} não atende neste dia.</span>
                <span class="text-[11px] text-amber-700 block">Selecione outro dia ou troque para qualquer profissional disponível.</span>
              </div>
              <button
                type="button"
                @click="selectedProfessional = null"
                class="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-2xs"
              >
                Qualquer um
              </button>
            </div>

            <!-- Grade de Horários Livres (Filtrando Bloqueios do Admin) -->
            <div v-else class="space-y-2 pt-2">
              <span class="text-xs font-bold text-slate-700 block">Horários Disponíveis ({{ totalDuration }} min):</span>
              
              <div v-if="isDayStoreClosed" class="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
                <span class="text-xs font-bold text-rose-700 block">⚠️ Estabelecimento Fechado neste dia da semana</span>
                <span class="text-[11px] text-rose-600 mt-0.5 block">Selecione outro dia no carrossel acima para ver os horários.</span>
              </div>

              <div v-else-if="availableSlots.length === 0" class="p-4 bg-slate-100 border border-slate-200 rounded-xl text-center">
                <span class="text-xs font-bold text-slate-600 block">Todos os horários deste dia estão bloqueados ou ocupados.</span>
              </div>

              <div v-else class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  v-for="slot in availableSlots"
                  :key="slot.time"
                  @click="selectedTime = slot.time"
                  :class="[
                    'py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center select-none active:scale-95',
                    selectedTime === slot.time
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  ]"
                >
                  {{ slot.time }}
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 4: Identificação e Pagamento do Sinal (Se Habilitado) -->
          <div v-else-if="currentStep === 4" class="space-y-4 animate-in fade-in duration-150">
            <!-- Dados Pessoais -->
            <div class="space-y-3">
              <h3 class="font-bold text-sm text-slate-900">Seus dados para confirmação:</h3>

              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-700">Seu Nome Completo *</label>
                <input
                  v-model="customerName"
                  type="text"
                  placeholder="Ex: Danilo Santos"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all"
                  :class="themeClasses.focusRing"
                />
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-700">WhatsApp para Confirmação *</label>
                <input
                  v-model="customerPhone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all"
                  :class="themeClasses.focusRing"
                />
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-700">Observações (Opcional)</label>
                <textarea
                  v-model="notes"
                  rows="2"
                  placeholder="Alguma observação ou preferência? (Opcional)"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none transition-all"
                  :class="themeClasses.focusRing"
                ></textarea>
              </div>
            </div>

            <!-- Opções de Pagamento (No Local vs Sinal Pix) -->
            <div class="pt-2 border-t border-slate-100 space-y-3">
              <label class="text-xs font-bold text-slate-900 block">Forma de Pagamento:</label>

              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="paymentMode = 'on_service'"
                  :class="[
                    'p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer',
                    paymentMode === 'on_service'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  ]"
                >
                  <span class="block">💵 No Atendimento</span>
                  <span class="text-[10px] text-slate-500 font-normal block">Pagar no balcão presencialmente</span>
                </button>

                <button
                  type="button"
                  @click="paymentMode = 'pix_deposit'"
                  :class="[
                    'p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer',
                    paymentMode === 'pix_deposit'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  ]"
                >
                  <span class="block">💠 Garantir com Sinal</span>
                  <span class="text-[10px] text-slate-500 font-normal block">
                    {{ formatCurrency(depositAmount) }} ({{ depositPercentage }}%)
                  </span>
                </button>
              </div>

              <!-- Card Pix para Agendamento com Sinal -->
              <div
                v-if="paymentMode === 'pix_deposit'"
                class="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-3 mt-2 animate-in fade-in duration-150"
              >
                <div class="flex items-center justify-between text-xs">
                  <span class="text-emerald-950 font-extrabold">Sinal de Reserva via Pix:</span>
                  <span class="font-bold text-emerald-800">{{ formatCurrency(effectiveDepositAmount) }}</span>
                </div>

                <div class="bg-white rounded-xl p-2.5 border border-emerald-200/90 space-y-2">
                  <div class="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Chave ({{ formatKeyTypeLabel(pixConfig?.keyType) }}):</span>
                    <button
                      type="button"
                      @click="copyPixKey"
                      class="text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Copy class="w-3 h-3" />
                      {{ isPixKeyCopied ? 'Chave Copiada!' : 'Copiar Chave' }}
                    </button>
                  </div>
                  <p class="font-mono text-xs text-slate-800 font-bold select-all bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    {{ pixConfig?.key }}
                  </p>
                </div>

                <!-- Botão Copia e Cola Pix Completo com Valor -->
                <div class="space-y-1.5">
                  <button
                    type="button"
                    @click="copyPixCode"
                    class="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <QrCode class="w-3.5 h-3.5" />
                    <span>{{ isPixCodeCopied ? 'Código Pix Copiado!' : 'Copiar Pix Copia e Cola' }}</span>
                  </button>

                  <button
                    type="button"
                    @click="toggleShowBookingQrCode"
                    class="w-full py-1 text-center text-[11px] font-semibold text-emerald-800 hover:underline cursor-pointer"
                  >
                    {{ showBookingQrCode ? 'Ocultar QR Code' : 'Visualizar QR Code na Tela' }}
                  </button>
                </div>

                <!-- Imagem do QR Code Base64 -->
                <div v-if="showBookingQrCode && bookingQrCodeDataUrl" class="flex justify-center p-2 bg-white rounded-xl border border-emerald-200">
                  <img :src="bookingQrCodeDataUrl" alt="QR Code Pix do Sinal" class="w-40 h-40" />
                </div>

                <!-- Toggle de Centavo de Teste (D-0 Sandbox) -->
                <div v-if="pixConfig?.allowTestCent" class="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                  <span class="text-emerald-800 font-medium">Modo Demonstração (R$ 0,01):</span>
                  <input
                    v-model="isTestCentMode"
                    type="checkbox"
                    class="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER FIXO (Resumo de Valores e Ações de Avanço) -->
        <div class="p-4 bg-slate-50 border-t border-slate-100 shrink-0 space-y-3">
          <!-- Resumo Compacto da Comanda -->
          <div class="flex items-center justify-between text-xs">
            <div class="space-y-0.5">
              <span class="text-slate-500 block">Total do Agendamento:</span>
              <div class="flex items-center gap-2">
                <span class="font-mono text-base font-extrabold text-slate-900">{{ formatCurrency(totalPrice) }}</span>
                <span class="text-[11px] text-slate-500">({{ totalDuration }} min)</span>
              </div>
            </div>

            <!-- Botões de Ação -->
            <div class="flex items-center gap-2">
              <button
                v-if="currentStep > 1"
                type="button"
                @click="currentStep--"
                class="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer transition-all active:scale-95"
              >
                Voltar
              </button>

              <button
                v-if="currentStep < 4"
                type="button"
                @click="goToNextStep"
                :disabled="!canAdvanceFromCurrentStep"
                class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <span>Avançar</span>
                <ChevronRight class="w-4 h-4" />
              </button>

              <button
                v-else
                type="button"
                :disabled="!isStep4Valid"
                @click="submitBooking"
                class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all active:scale-95"
              >
                <Send class="w-4 h-4" />
                <span>Confirmar no WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, toRef, watch, onMounted } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { useApiClient } from '~/composables/useApiClient'
import { formatCurrency } from '~/utils/formatters'
import { generatePixPayload, getTenantPixConfig, generatePixQrCodeDataUrl } from '~/utils/pix'
import { 
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  Send,
  Clock,
  User,
  Sparkles,
  Copy,
  QrCode
} from 'lucide-vue-next'
import type { Tenant } from '~/types/tenant'
import type { BookingService, BookingProfessional } from '~/types/booking'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    tenant: Tenant
    initialService?: BookingService | null
  }>(),
  {
    isOpen: false,
    initialService: null
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirmed', payload: unknown): void
}>()

// 1. Tema Dinâmico & Trava de Scroll
const { themeClasses } = useTenantTheme(toRef(props, 'tenant'))
useBodyScrollLock(toRef(props, 'isOpen'))

// 2. Estado de Navegação dos Steps
const currentStep = ref(1)

// 3. Estado de Seleção de Serviços
const selectedServices = ref<BookingService[]>([])

function isServiceSelected(id: string): boolean {
  return selectedServices.value.some(s => s.id === id)
}

function toggleService(service: BookingService) {
  const idx = selectedServices.value.findIndex(s => s.id === service.id)
  if (idx >= 0) {
    selectedServices.value.splice(idx, 1)
  } else { 
    selectedServices.value.push(service)
  }
}

const availableServices = computed<BookingService[]>(() => {
  const services: BookingService[] = []
  props.tenant.categories?.forEach((cat) => {
    cat.products?.forEach((prod) => {
      services.push({
        id: prod.id,
        name: prod.name,
        description: prod.description || '',
        price: prod.price,
        durationMinutes: prod.durationMinutes || 30,
        professionalIds: []
      })
    })
  })
  return services
})

// 4. Estado de Profissional com Overrides do Admin (Dentistas/Especialistas ou Barbeiros)
const selectedProfessional = ref<BookingProfessional | null>(null)

const defaultProfessionalsBySlug: Record<string, Array<{ id: string; name: string; role: string; isAvailable: boolean; availableDays: number[] }>> = {
  'clinica-sorriso': [
    { id: 'prof-1', name: 'Dra. Camila Rocha', role: 'Cirurgiã Dentista & Implantes', isAvailable: true, availableDays: [1, 2, 3, 4, 5] },
    { id: 'prof-2', name: 'Dr. Rafael Mendes', role: 'Ortodontista & Invisalign', isAvailable: true, availableDays: [1, 2, 3, 4, 5, 6] },
    { id: 'prof-3', name: 'Dra. Beatriz Lima', role: 'Harmonização Orofacial & Estética', isAvailable: true, availableDays: [2, 3, 4, 5, 6] }
  ],
  'barbearia-style': [
    { id: 'prof-1', name: 'Carlos Santos', role: 'Barbeiro Master', isAvailable: true, availableDays: [1, 2, 3, 4, 5, 6] },
    { id: 'prof-2', name: 'Lucas Oliveira', role: 'Visagista & Barbeiro', isAvailable: true, availableDays: [2, 3, 4, 5, 6] },
    { id: 'prof-3', name: 'Mateus Silva', role: 'Especialista em Cortes Clássicos', isAvailable: true, availableDays: [1, 3, 4, 5, 6] }
  ]
}

const rawOverrides = ref<any>({})

function syncOverrides() {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`alaska_overrides_${props.tenant.slug}`)
      if (raw) rawOverrides.value = JSON.parse(raw)
    } catch {}
  }
}

onMounted(() => {
  syncOverrides()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', syncOverrides)
    window.addEventListener('alaska_overrides_updated', syncOverrides)
  }
})

const availableProfessionals = computed(() => {
  const profOverrides = rawOverrides.value.professionals || {}
  const baseList = defaultProfessionalsBySlug[props.tenant.slug] || defaultProfessionalsBySlug['barbearia-style']

  return baseList.map(p => {
    const ov = profOverrides[p.id]
    const isAvail = ov?.isAvailable !== undefined ? Boolean(ov.isAvailable) : Boolean(p.isAvailable)
    const days = ov?.availableDays || p.availableDays

    return {
      ...p,
      isAvailable: isAvail,
      availableDays: days
    }
  })
})

// 5. Estado de Data e Horário (Próximos 30 dias com Rolagem Desktop)
const selectedDate = ref('2026-08-30')
const selectedTime = ref('14:00')
const daysContainerRef = ref<HTMLElement | null>(null)

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const isDayStoreClosed = computed(() => {
  const hours = (rawOverrides.value.openingHours || props.tenant?.openingHours) as any
  if (!hours) return false
  const dayIndex = new Date(selectedDate.value + 'T12:00:00').getDay()
  const dayKey = DAY_KEYS[dayIndex]
  return Boolean(hours[dayKey]?.closed)
})

// Verifica se o profissional escolhido atende no dia da semana selecionado
const isProfOffOnDate = computed(() => {
  if (!selectedProfessional.value) return false
  const prof = availableProfessionals.value.find(p => p.id === selectedProfessional.value?.id)
  if (!prof) return false
  if (!prof.isAvailable) return true

  const dayOfWeek = new Date(selectedDate.value + 'T12:00:00').getDay()
  return !(prof.availableDays || []).includes(dayOfWeek)
})

function scrollDays(direction: 'left' | 'right') {
  if (!daysContainerRef.value) return
  const offset = direction === 'left' ? -220 : 220
  daysContainerRef.value.scrollBy({ left: offset, behavior: 'smooth' })
}

function handleDaysWheel(e: WheelEvent) {
  if (!daysContainerRef.value) return
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    daysContainerRef.value.scrollLeft += e.deltaY * 0.8
  }
}

const bookingDays = computed(() => {
  const days = []
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const weekDays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

  const base = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`

    days.push({
      date: dateStr,
      dayOfWeek: weekDays[d.getDay()],
      dayNumber: d.getDate(),
      month: months[d.getMonth()]
    })
  }
  return days
})

const allSlots = [
  '09:00', '09:45', '10:30', '11:15', '12:00',
  '13:00', '13:45', '14:30', '15:15', '16:00',
  '16:45', '17:30', '18:15', '19:00'
]

const availableSlots = computed(() => {
  const blocked = rawOverrides.value.blockedSlots || []
  return allSlots
    .filter(time => !blocked.some((b: any) => b.date === selectedDate.value && b.time === time))
    .map(time => ({ time }))
})

// 6. Estado de Identificação e Pagamento Pix
const customerName = ref('')
const customerPhone = ref('')
const notes = ref('')
const paymentMode = ref<'on_service' | 'pix_deposit'>('on_service')

const isTestCentMode = ref(false)
const isPixKeyCopied = ref(false)
const isPixCodeCopied = ref(false)
const showBookingQrCode = ref(false)
const bookingQrCodeDataUrl = ref('')

function formatKeyTypeLabel(type?: string): string {
  switch (type) {
    case 'cpf': return 'CPF'
    case 'cnpj': return 'CNPJ'
    case 'phone': return 'Celular'
    case 'email': return 'E-mail'
    default: return 'Aleatória'
  }
}

async function updateBookingQrCode() {
  if (!pixConfig.value?.key) return
  try {
    const payload = generatePixPayload({
      key: pixConfig.value.key,
      keyType: pixConfig.value.keyType,
      beneficiary: pixConfig.value.beneficiary || props.tenant?.name,
      city: pixConfig.value.city || 'SAO PAULO',
      amount: effectiveDepositAmount.value,
      txid: 'AGENDAMENTO'
    })
    bookingQrCodeDataUrl.value = await generatePixQrCodeDataUrl(payload)
  } catch (err) {
    console.error('Erro ao gerar QR Code para sinal de agendamento:', err)
  }
}

async function toggleShowBookingQrCode() {
  showBookingQrCode.value = !showBookingQrCode.value
  if (showBookingQrCode.value && !bookingQrCodeDataUrl.value) {
    await updateBookingQrCode()
  }
}

const pixConfig = computed(() => getTenantPixConfig(props.tenant))
const depositPercentage = computed(() => pixConfig.value?.depositPercentage || 30)

const totalPrice = computed(() => {
  return selectedServices.value.reduce((sum, s) => sum + s.price, 0)
})

const totalDuration = computed(() => {
  return selectedServices.value.reduce((sum, s) => sum + (s.durationMinutes || 30), 0)
})

const depositAmount = computed(() => {
  return (totalPrice.value * depositPercentage.value) / 100
})

const effectiveDepositAmount = computed(() => {
  if (isTestCentMode.value) return 0.01
  return depositAmount.value
})

function copyPixKey() {
  if (!pixConfig.value?.key) return
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(pixConfig.value.key)
    isPixKeyCopied.value = true
    setTimeout(() => {
      isPixKeyCopied.value = false
    }, 2500)
  }
}

function copyPixCode() {
  if (!pixConfig.value?.key) return
  const code = generatePixPayload({
    key: pixConfig.value.key,
    beneficiary: pixConfig.value.beneficiary || props.tenant?.name,
    city: pixConfig.value.city || 'SAO PAULO',
    amount: effectiveDepositAmount.value,
    txid: 'AGENDAMENTO'
  })

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(code)
    isPixCodeCopied.value = true
    setTimeout(() => {
      isPixCodeCopied.value = false
    }, 2500)
  }
}

// 7. Validação de Navegação
function canGoToStep(step: number): boolean {
  if (step === 2) return selectedServices.value.length > 0
  if (step === 3) return selectedServices.value.length > 0
  if (step === 4) return selectedServices.value.length > 0 && !!selectedDate.value && !!selectedTime.value && !isDayStoreClosed.value && !isProfOffOnDate.value
  return true
}

const canAdvanceFromCurrentStep = computed(() => {
  if (currentStep.value === 1) return selectedServices.value.length > 0
  if (currentStep.value === 2) return true
  if (currentStep.value === 3) return !!selectedDate.value && !!selectedTime.value && !isDayStoreClosed.value && !isProfOffOnDate.value
  return false
})

const isStep4Valid = computed(() => {
  return customerName.value.trim().length >= 2 && customerPhone.value.trim().length >= 10
})

function goToNextStep() {
  if (canAdvanceFromCurrentStep.value && currentStep.value < 4) {
    currentStep.value++
  }
}

// 8. Despacho no WhatsApp
function submitBooking() {
  if (!isStep4Valid.value || !props.tenant) return

  const rawPhone = props.tenant?.phoneWhatsApp || props.tenant?.whatsapp || ''
  const cleanPhone = rawPhone.replace(/\D/g, '')
  const targetPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

  // Sincronização assíncrona não-bloqueante no backend NestJS/PostgreSQL
  try {
    const { createBooking } = useApiClient()
    createBooking({
      tenantId: props.tenant?.id || (props.tenant?.slug ? `ten-${props.tenant.slug}` : 'ten-default'),
      customerName: customerName.value,
      customerPhone: customerPhone.value,
      services: selectedServices.value.map(s => ({
        id: s.id,
        name: s.name,
        priceCents: Math.round(s.price * 100),
        durationMinutes: s.durationMinutes || 30
      })),
      professionalId: selectedProfessional.value?.id,
      professionalName: selectedProfessional.value?.name,
      date: selectedDate.value,
      time: selectedTime.value,
      notes: notes.value.trim() || undefined,
      paymentMode: paymentMode.value
    }).catch(() => {})
  } catch {}

  const tenantName = (props.tenant?.name || 'ESTABELECIMENTO').toUpperCase()
  const lines: string[] = []
  lines.push(`💈 *NOVO AGENDAMENTO — ${tenantName}*`)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`👤 *CLIENTE:* ${customerName.value}`)
  lines.push(`📱 *WhatsApp:* ${customerPhone.value}`)
  lines.push(`📅 *DATA & HORÁRIO:* ${selectedDate.value} às ${selectedTime.value}`)
  lines.push(`✂️ *PROFISSIONAL:* ${selectedProfessional.value ? selectedProfessional.value.name : 'Qualquer Profissional'}`)
  lines.push(`⏱️ *DURAÇÃO ESTIMADA:* ${totalDuration.value} min`)
  lines.push(``)
  lines.push(`📋 *SERVIÇOS SELECIONADOS:*`)
  for (const s of selectedServices.value) {
    lines.push(`• ${s.name} (${formatCurrency(s.price)})`)
  }
  lines.push(``)
  lines.push(`💰 *VALOR TOTAL:* ${formatCurrency(totalPrice.value)}`)

  if (paymentMode.value === 'pix_deposit') {
    lines.push(`💠 *SINAL VIA PIX:* ${formatCurrency(isTestCentMode.value ? 0.01 : depositAmount.value)}`)
  } else {
    lines.push(`💳 *PAGAMENTO:* No Local / Atendimento`)
  }

  if (notes.value.trim()) {
    lines.push(``)
    lines.push(`📝 *Observações:* "${notes.value}"`)
  }

  const message = lines.join('\n')
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`

  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank')
    emit('confirmed', {
      services: selectedServices.value,
      professional: selectedProfessional.value,
      date: selectedDate.value,
      time: selectedTime.value,
      totalPrice: totalPrice.value
    })
    emit('close')
  }
}

onMounted(() => {
  if (props.initialService) {
    selectedServices.value = [props.initialService]
  }
})
</script>
