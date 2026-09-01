<!-- components/admin/tabs/AdminPixContactTab.vue -->
<script setup lang="ts">
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
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
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
        @click="emit('save-pix')"
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
        @click="emit('save-contact')"
        class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-2"
      >
        Salvar Contatos
      </button>
    </div>
  </main>
</template>
