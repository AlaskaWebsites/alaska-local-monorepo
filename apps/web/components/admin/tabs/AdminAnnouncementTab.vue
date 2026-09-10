<!-- components/admin/tabs/AdminAnnouncementTab.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'

const props = defineProps<{
  announcementEnabled: boolean
  announcementMessage: string
}>()

const emit = defineEmits<{
  (e: 'update:announcementEnabled', val: boolean): void
  (e: 'update:announcementMessage', val: string): void
  (e: 'save-announcement'): void
}>()

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'hamburgueria-x')
const { tenant } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>📢 Comunicado no Topo da Vitrine</span>
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Exiba um banner de aviso para os clientes na página inicial da loja.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          :aria-checked="announcementEnabled"
          @click="emit('update:announcementEnabled', !announcementEnabled)"
          class="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white"
          :class="announcementEnabled ? [themeClasses.primaryBg, themeClasses.focusRing] : 'bg-slate-200'"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
            :class="announcementEnabled ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <div class="space-y-3 pt-2">
        <label class="block text-xs font-semibold text-slate-600">Mensagem do Comunicado:</label>
        <textarea
          :value="announcementMessage"
          @input="emit('update:announcementMessage', ($event.target as HTMLTextAreaElement).value)"
          rows="3"
          placeholder="Ex: Entregas com tempo estendido devido à chuva. Agradecemos a compreensão!"
          class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-slate-400"
        />

        <button
          @click="emit('save-announcement')"
          class="w-full text-slate-950 font-bold py-3 rounded-xl text-xs transition-colors shadow-md active:scale-[0.99] cursor-pointer mt-2"
          :class="themeClasses.primaryBg"
        >
          Salvar Comunicado
        </button>
      </div>
    </div>
  </main>
</template>
