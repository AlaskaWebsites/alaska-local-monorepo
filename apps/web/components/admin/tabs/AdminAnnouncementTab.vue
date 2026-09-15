<!-- components/admin/tabs/AdminAnnouncementTab.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useTenantTheme } from '~/composables/useTenantTheme'

const props = withDefaults(
  defineProps<{
    announcementForm?: {
      enabled?: boolean
      message?: string
    }
    announcementEnabled?: boolean
    announcementMessage?: string
    announcementSuccessMsg?: string
  }>(),
  {
    announcementForm: undefined,
    announcementEnabled: false,
    announcementMessage: '',
    announcementSuccessMsg: ''
  }
)

const emit = defineEmits<{
  (e: 'update:announcementEnabled', val: boolean): void
  (e: 'update:announcementMessage', val: string): void
  (e: 'save-announcement'): void
  (e: 'save'): void
}>()

const { themeClasses } = useTenantTheme()

const isEnabled = computed(() => {
  if (props.announcementForm?.enabled !== undefined) return props.announcementForm.enabled
  return props.announcementEnabled
})

const message = computed(() => {
  if (props.announcementForm?.message !== undefined) return props.announcementForm.message
  return props.announcementMessage
})

function handleToggleSwitch() {
  const nextVal = !isEnabled.value
  if (props.announcementForm) props.announcementForm.enabled = nextVal
  emit('update:announcementEnabled', nextVal)
}

function handleMessageInput(e: Event) {
  const val = (e.target as HTMLTextAreaElement).value
  if (props.announcementForm) props.announcementForm.message = val
  emit('update:announcementMessage', val)
}

function handleSave() {
  emit('save-announcement')
  emit('save')
}
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
          :aria-checked="isEnabled"
          @click="handleToggleSwitch"
          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
          :class="isEnabled ? [themeClasses.primaryBg] : 'bg-slate-200'"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
            :class="isEnabled ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1">Mensagem do Comunicado:</label>
        <textarea
          :value="message"
          @input="handleMessageInput"
          rows="3"
          placeholder="Ex: Entregas com tempo estendido devido à chuva. Agradecemos a compreensão!"
          class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-slate-400 leading-relaxed"
        ></textarea>
      </div>

      <div v-if="announcementSuccessMsg" class="text-xs text-emerald-600 text-center font-bold bg-emerald-50 border border-emerald-200 py-2 rounded-lg">
        {{ announcementSuccessMsg }}
      </div>

      <button
        type="button"
        @click="handleSave"
        class="w-full text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-md active:scale-98 mt-2"
        :class="themeClasses.primaryBg"
      >
        Salvar Comunicado
      </button>
    </div>
  </main>
</template>
