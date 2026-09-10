<!-- components/admin/tabs/AdminPixContactTab.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'

const props = defineProps<{
  pixConfigInput: {
    keyType: 'cpf' | 'cnpj' | 'phone' | 'email' | 'random'
    pixKey: string
    beneficiary: string
    city: string
  }
  contactInput: {
    whatsapp: string
    instagram: string
  }
}>()

const emit = defineEmits<{
  (e: 'save-pix'): void
  (e: 'save-contact'): void
}>()

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'hamburgueria-x')
const { tenant } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
        <span>💠 Configurações Pix Copia e Cola (D+0)</span>
      </h2>
      <p class="text-xs text-slate-500">
        Receba pagamentos diretamente na sua conta bancária sem intermediários e com taxa zero.
      </p>

      <div class="space-y-3 pt-2">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Tipo de Chave Pix:</label>
          <select
            v-model="pixConfigInput.keyType"
            class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="random">Chave Aleatória (EVP)</option>
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
            <option value="phone">Telefone Celular</option>
            <option value="email">E-mail</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Chave Pix:</label>
          <input
            v-model="pixConfigInput.pixKey"
            type="text"
            placeholder="Ex: 7e3ed5e6-6097-4b15-88a3-221caba64141"
            class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Nome do Titular da Conta:</label>
            <input
              v-model="pixConfigInput.beneficiary"
              type="text"
              placeholder="Ex: Nome da Loja ou Razão Social"
              class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Cidade da Conta (Sem acento):</label>
            <input
              v-model="pixConfigInput.city"
              type="text"
              placeholder="Ex: SAO PAULO"
              class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <button
          @click="emit('save-pix')"
          class="w-full text-slate-950 font-bold py-3 rounded-xl text-xs transition-colors shadow-md active:scale-[0.99] cursor-pointer mt-2"
          :class="themeClasses.primaryBg"
        >
          Salvar Dados Pix
        </button>
      </div>
    </div>

    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
        <span>📱 Canais de Contato & Redes Sociais</span>
      </h2>
      <p class="text-xs text-slate-500">
        Atualize seu número oficial de WhatsApp para receber os pedidos dos clientes.
      </p>

      <div class="space-y-3 pt-2">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">WhatsApp da Loja (com DDD):</label>
          <input
            v-model="contactInput.whatsapp"
            type="text"
            placeholder="Ex: 11999998888"
            class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Instagram (opcional):</label>
          <input
            v-model="contactInput.instagram"
            type="text"
            placeholder="Ex: @sualoja"
            class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <button
          @click="emit('save-contact')"
          class="w-full text-slate-950 font-bold py-3 rounded-xl text-xs transition-colors shadow-md active:scale-[0.99] cursor-pointer mt-2"
          :class="themeClasses.primaryBg"
        >
          Salvar Contatos
        </button>
      </div>
    </div>
  </main>
</template>
