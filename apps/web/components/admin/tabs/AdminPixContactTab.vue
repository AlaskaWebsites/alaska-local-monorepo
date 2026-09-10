<!-- components/admin/tabs/AdminPixContactTab.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { QrCode, Phone, Check } from 'lucide-vue-next'

const props = defineProps<{
  pixConfigInput: { key: string; keyType: string; beneficiary: string; city: string }
  contactInput: { phoneWhatsApp: string; instagram?: string }
}>()

const emit = defineEmits<{
  (e: 'save-pix'): void
  (e: 'save-contact'): void
}>()

const { themeClasses } = useTenantTheme()
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <!-- 1. Configuração de Chave Pix -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <QrCode class="w-4 h-4 text-emerald-600" />
          <span>Chave Pix para Recebimento</span>
        </h2>
        <span class="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">D+0 Sem Taxas</span>
      </div>

      <p class="text-xs text-slate-500">
        Esta chave será utilizada para gerar o QR Code dinâmico e o código Copia e Cola na sacola e nos agendamentos.
      </p>

      <div class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Tipo de Chave:</label>
            <select
              v-model="pixConfigInput.keyType"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
            >
              <option value="phone">Telefone / Celular</option>
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="email">E-mail</option>
              <option value="random">Chave Aleatória (EVP)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Chave Pix:</label>
            <input
              type="text"
              v-model="pixConfigInput.key"
              placeholder="Ex: 11999998888 ou chave aleatória"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Nome do Titular / Beneficiário:</label>
            <input
              type="text"
              v-model="pixConfigInput.beneficiary"
              placeholder="Ex: Adega Prime LTDA"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Cidade da Conta:</label>
            <input
              type="text"
              v-model="pixConfigInput.city"
              placeholder="Ex: SAO PAULO"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 uppercase outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <button
          @click="emit('save-pix')"
          class="w-full text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-[0.99]"
          :class="themeClasses.primaryBg"
        >
          <Check class="w-4 h-4" />
          <span>Salvar Chave Pix</span>
        </button>
      </div>
    </div>

    <!-- 2. Canais de Atendimento & WhatsApp -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Phone class="w-4 h-4 text-emerald-600" />
          <span>WhatsApp para Recebimento de Pedidos</span>
        </h2>
      </div>

      <p class="text-xs text-slate-500">
        Número para onde serão despachados os pedidos e comprovantes pelo cliente.
      </p>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">WhatsApp da Loja (com DDD):</label>
          <input
            type="text"
            v-model="contactInput.phoneWhatsApp"
            placeholder="Ex: 11988887777"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono outline-none focus:border-slate-400"
          />
        </div>

        <button
          @click="emit('save-contact')"
          class="w-full text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-[0.99]"
          :class="themeClasses.primaryBg"
        >
          <Check class="w-4 h-4" />
          <span>Salvar WhatsApp de Atendimento</span>
        </button>
      </div>
    </div>
  </main>
</template>
