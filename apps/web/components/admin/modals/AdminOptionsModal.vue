<!-- components/admin/modals/AdminOptionsModal.vue -->
<script setup lang="ts">
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
</script>

<template>
  <div v-if="isOpen && product" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" @click="emit('close')">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 class="text-sm font-bold text-white">Adicionais & Opcionais</h3>
          <p class="text-xs text-slate-400">{{ product.name }}</p>
        </div>
        <button @click="emit('close')" class="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="space-y-4">
        <div v-for="group in product.optionGroups" :key="group.id" class="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
          <h4 class="text-xs font-bold text-slate-300">{{ group.title }}</h4>
          <div class="space-y-1.5">
            <div
              v-for="opt in group.options"
              :key="opt.id"
              class="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
            >
              <div class="flex items-center gap-2">
                <span :class="{ 'line-through text-slate-500': isOptionPaused(opt.id) }">{{ opt.name }}</span>
                <span v-if="opt.price > 0" class="text-slate-400 font-mono">+ R$ {{ opt.price.toFixed(2) }}</span>
              </div>

              <button
                type="button"
                @click="emit('toggle-option', opt.id)"
                class="px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
                :class="isOptionPaused(opt.id) ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'"
              >
                {{ isOptionPaused(opt.id) ? 'Pausado' : 'Ativo' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        @click="emit('close')"
        class="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
      >
        Fechar
      </button>
    </div>
  </div>
</template>
