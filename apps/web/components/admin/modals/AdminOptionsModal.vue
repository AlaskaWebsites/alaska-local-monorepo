<!-- components/admin/modals/AdminOptionsModal.vue -->
<script setup lang="ts">
import { useTenantTheme } from '~/composables/useTenantTheme'
import { X } from 'lucide-vue-next'
import type { Product } from '~/types'

const props = defineProps<{
  isOpen: boolean
  product: Product | null
  isOptionPaused: (optionId: string) => boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggle-option', optionId: string): void
}>()

const { themeClasses } = useTenantTheme()
</script>

<template>
  <div v-if="isOpen && product" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4" @click="emit('close')">
    <div class="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 class="text-sm font-bold text-slate-900">Adicionais & Opcionais</h3>
          <p class="text-xs text-slate-500 font-medium">{{ product.name }}</p>
        </div>
        <button @click="emit('close')" class="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="space-y-4">
        <div v-for="group in product.optionGroups" :key="group.id" class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <h4 class="text-xs font-bold text-slate-800">{{ group.title }}</h4>
          <div class="space-y-1.5">
            <div
              v-for="opt in group.options"
              :key="opt.id"
              class="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs"
            >
              <div class="flex items-center gap-2">
                <span :class="{ 'line-through text-slate-400': isOptionPaused(opt.id) }">{{ opt.name }}</span>
                <span v-if="opt.price > 0" class="text-slate-600 font-mono">+ R$ {{ opt.price.toFixed(2) }}</span>
              </div>

              <button
                type="button"
                @click="emit('toggle-option', opt.id)"
                class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer border"
                :class="isOptionPaused(opt.id) ? 'bg-rose-50 text-rose-700 border-rose-200' : [themeClasses.badgeBg, themeClasses.badgeText, themeClasses.badgeBorder]"
              >
                {{ isOptionPaused(opt.id) ? 'Pausado' : 'Ativo' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        @click="emit('close')"
        class="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
      >
        Fechar
      </button>
    </div>
  </div>
</template>
