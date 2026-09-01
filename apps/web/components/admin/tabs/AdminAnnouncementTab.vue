<!-- components/admin/tabs/AdminAnnouncementTab.vue -->
<script setup lang="ts">
const props = defineProps<{
  announcementEnabled: boolean
  announcementMessage: string
}>()

const emit = defineEmits<{
  (e: 'update:announcementEnabled', val: boolean): void
  (e: 'update:announcementMessage', val: string): void
  (e: 'save-announcement'): void
}>()
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
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
          @click="emit('update:announcementEnabled', !announcementEnabled)"
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
          :value="announcementMessage"
          @input="emit('update:announcementMessage', ($event.target as HTMLTextAreaElement).value)"
          rows="3"
          placeholder="Ex: ⚠️ Horário especial de feriado neste sábado!"
          class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 leading-relaxed"
        ></textarea>
      </div>

      <button
        @click="emit('save-announcement')"
        class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
      >
        Salvar Comunicado
      </button>
    </div>
  </main>
</template>
