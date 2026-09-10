<!-- components/admin/tabs/AdminAnnouncementTab.vue -->
<script setup lang="ts">
import { useTenantTheme } from '~/composables/useTenantTheme'
import { Megaphone, Check } from 'lucide-vue-next'

const props = defineProps<{
  announcementEnabled: boolean
  announcementMessage: string
}>()

const emit = defineEmits<{
  (e: 'update:announcementEnabled', val: boolean): void
  (e: 'update:announcementMessage', val: string): void
  (e: 'save-announcement'): void
}>()

const { themeClasses } = useTenantTheme()
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Megaphone class="w-4 h-4 text-amber-500" />
          <span>Comunicado Oficial no Topo da Loja</span>
        </h2>

        <button
          type="button"
          role="switch"
          :aria-checked="announcementEnabled"
          @click="emit('update:announcementEnabled', !announcementEnabled)"
          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white"
          :class="announcementEnabled ? [themeClasses.primaryBg, themeClasses.focusRing] : 'bg-slate-300'"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
            :class="announcementEnabled ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <p class="text-xs text-slate-500">
        Exibe uma faixa de aviso no topo da vitrine para promoções, feriados ou comunicados especiais.
      </p>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Mensagem do Comunicado:</label>
          <textarea
            :value="announcementMessage"
            @input="emit('update:announcementMessage', ($event.target as HTMLInputElement).value)"
            rows="3"
            placeholder="Ex: Estaremos atendendo excepcionalmente até as 23h hoje!"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-slate-400 leading-relaxed"
          ></textarea>
        </div>

        <button
          @click="emit('save-announcement')"
          class="w-full text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-[0.99]"
          :class="themeClasses.primaryBg"
        >
          <Check class="w-4 h-4" />
          <span>Salvar Comunicado</span>
        </button>
      </div>
    </div>
  </main>
</template>
