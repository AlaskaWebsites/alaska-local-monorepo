<!-- components/admin/modals/AdminOptionsModal.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'
import type { Product } from '~/types'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    product?: Product | null
    managingProduct?: Product | null
    isOptionPaused?: (optionId: string) => boolean
    isOptionAvailable?: (groupId: string, optionId: string) => boolean
  }>(),
  {
    product: null,
    managingProduct: null,
    isOptionPaused: undefined,
    isOptionAvailable: undefined
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggle-option', optionIdOrGroupId: string, optionId?: string, currentStatus?: boolean): void
}>()

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'hamburgueria-x')
const { tenant } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)

const activeProduct = computed(() => props.product || props.managingProduct)

function checkOptionActive(group: any, opt: any): boolean {
  if (props.isOptionPaused) {
    return !props.isOptionPaused(opt.id)
  }
  if (props.isOptionAvailable) {
    return props.isOptionAvailable(group.id, opt.id)
  }
  return true
}

function handleToggle(group: any, opt: any) {
  const current = checkOptionActive(group, opt)
  emit('toggle-option', opt.id)
  emit('toggle-option', group.id, opt.id, current)
}
</script>

<template>
  <div
    v-if="isOpen && activeProduct"
    class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    @click="emit('close')"
  >
    <div
      class="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-900"
      @click.stop
    >
      <div class="space-y-1 border-b border-slate-100 pb-3">
        <h3 class="text-base font-bold text-slate-900">Gerenciar Adicionais & Opcionais</h3>
        <p class="text-xs text-slate-500 truncate">{{ activeProduct.name }}</p>
      </div>

      <div v-if="activeProduct.optionGroups && activeProduct.optionGroups.length > 0" class="space-y-4">
        <div
          v-for="group in activeProduct.optionGroups"
          :key="group.id"
          class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"
        >
          <h4 class="text-xs font-bold text-slate-700">{{ group.name || group.title }}</h4>

          <div class="space-y-1.5">
            <div
              v-for="opt in group.options"
              :key="opt.id"
              class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800"
            >
              <span>{{ opt.name }} <strong v-if="opt.price" class="text-slate-900 font-mono">+R${{ opt.price }}</strong></span>
              <button
                type="button"
                role="switch"
                :aria-checked="checkOptionActive(group, opt)"
                @click="handleToggle(group, opt)"
                class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                :class="checkOptionActive(group, opt) ? [themeClasses.primaryBg, themeClasses.focusRing] : 'bg-slate-300'"
              >
                <span
                  aria-hidden="true"
                  class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                  :class="checkOptionActive(group, opt) ? 'translate-x-4' : 'translate-x-0'"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="py-4 text-center text-xs text-slate-400">
        Nenhum grupo de adicionais configurado para este item.
      </div>

      <div class="pt-2">
        <button
          type="button"
          @click="emit('close')"
          class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Concluir
        </button>
      </div>
    </div>
  </div>
</template>
