<!-- components/admin/tabs/AdminPixContactTab.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useTenantTheme } from '~/composables/useTenantTheme'

const props = defineProps<{
  pixConfigInput?: {
    keyType?: string
    pixKey?: string
    key?: string
    beneficiary?: string
    city?: string
  }
  pixForm?: {
    keyType?: string
    pixKey?: string
    key?: string
    beneficiary?: string
    city?: string
    allowTestCent?: boolean
    depositPercentage?: number
  }
  contactInput?: {
    whatsapp?: string
    instagram?: string
  }
  contactForm?: {
    whatsapp?: string
    instagram?: string
  }
}>()

const emit = defineEmits<{
  (e: 'save-pix'): void
  (e: 'save-contact'): void
  (e: 'save'): void
}>()

const { themeClasses } = useTenantTheme()

const activePix = computed(() => {
  return (props.pixForm || props.pixConfigInput || {}) as any
})

const activeContact = computed(() => {
  return (props.contactForm || props.contactInput || {}) as any
})

function handleSavePix() {
  emit('save-pix')
  emit('save')
}

function handleSaveContact() {
  emit('save-contact')
  emit('save')
}
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

      <div class="space-y-3 pt-1">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Tipo de Chave Pix:</label>
          <select
            v-model="activePix.keyType"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="random">Chave Aleatória (EVP)</option>
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
            <option value="phone">Celular / Telefone</option>
            <option value="email">E-mail</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Chave Pix:</label>
          <input
            type="text"
            v-model="activePix.pixKey"
            placeholder="Cole sua chave Pix aqui..."
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Nome do Beneficiário (Titular da Conta):</label>
          <input
            type="text"
            v-model="activePix.beneficiary"
            placeholder="Ex: Danilo Santos LTDA"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Cidade do Titular:</label>
          <input
            type="text"
            v-model="activePix.city"
            placeholder="Ex: SAO PAULO"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400 uppercase"
          />
        </div>
      </div>

      <button
        type="button"
        @click="handleSavePix"
        class="w-full text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-md active:scale-98 mt-2"
        :class="themeClasses.primaryBg"
      >
        Salvar Dados Pix
      </button>
    </div>

    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
        <span>📱 Canais de Contato & Redes Sociais</span>
      </h2>
      <p class="text-xs text-slate-500">
        Atualize seu número oficial de WhatsApp para receber os pedidos dos clientes.
      </p>

      <div class="space-y-3 pt-1">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">WhatsApp da Loja (com DDD):</label>
          <input
            type="text"
            v-model="activeContact.whatsapp"
            placeholder="Ex: 11988887777"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Instagram (opcional):</label>
          <input
            type="text"
            v-model="activeContact.instagram"
            placeholder="Ex: @minhaloja"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
          />
        </div>
      </div>

      <button
        type="button"
        @click="handleSaveContact"
        class="w-full text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-md active:scale-98 mt-2"
        :class="themeClasses.primaryBg"
      >
        Salvar Contatos
      </button>
    </div>
  </main>
</template>
