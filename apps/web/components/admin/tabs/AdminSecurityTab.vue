<!-- components/admin/tabs/AdminSecurityTab.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'

const props = defineProps<{
  pinSuccessMsg?: string
}>()

const emit = defineEmits<{
  (e: 'save-pin', newPin: string): void
}>()

const newPinInput = ref('')

function handleSave() {
  emit('save-pin', newPinInput.value)
  newPinInput.value = ''
}

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'hamburgueria-x')
const { tenant } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)
</script>

<template>
  <main class="px-4 mt-4 space-y-6">
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
      <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
        <span>🔐 Alterar PIN de Acesso</span>
      </h2>
      <p class="text-xs text-slate-500">
        Troque a senha numérica de acesso ao Painel do Lojista. O PIN deve ter no mínimo 4 dígitos.
      </p>

      <div class="space-y-4 pt-2">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Novo PIN da Loja:</label>
          <input
            v-model="newPinInput"
            type="password"
            maxlength="8"
            inputmode="numeric"
            placeholder="••••"
            class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-slate-900 outline-none focus:border-slate-400 font-mono"
          />
        </div>

        <div v-if="pinSuccessMsg" class="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center font-bold">
          {{ pinSuccessMsg }}
        </div>

        <button
          @click="handleSave"
          class="w-full text-slate-950 font-bold py-3 rounded-xl text-xs transition-colors shadow-md active:scale-[0.99] cursor-pointer"
          :class="themeClasses.primaryBg"
        >
          Atualizar PIN
        </button>
      </div>
    </div>
  </main>
</template>
