<!-- components/admin/modals/AdminCreateProductModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { Plus } from 'lucide-vue-next'
import type { Category } from '~/types'

const props = defineProps<{
  isOpen: boolean
  categories: Category[]
  isServiceStore?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', form: { name: string; price: number; categoryId: string; description: string }): void
}>()

const { themeClasses } = useTenantTheme()

const form = ref({
  name: '',
  price: 0,
  categoryId: '',
  description: ''
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      form.value = {
        name: '',
        price: 0,
        categoryId: props.categories[0]?.id || '',
        description: ''
      }
    }
  }
)
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4" @click="emit('close')">
    <div class="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" @click.stop>
      <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
        <Plus class="w-4 h-4" :class="themeClasses.primaryText" />
        <span>Cadastrar Novo {{ isServiceStore ? 'Serviço' : 'Produto' }}</span>
      </h3>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Nome:</label>
          <input
            type="text"
            v-model="form.name"
            placeholder="Ex: Combo Burger Duplo"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Categoria:</label>
          <select
            v-model="form.categoryId"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
          >
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Preço (R$):</label>
          <input
            type="number"
            step="0.50"
            v-model.number="form.price"
            placeholder="0.00"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Descrição (opcional):</label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Detalhes dos ingredientes ou benefícios..."
            class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
          ></textarea>
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <button
          @click="emit('close')"
          class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          @click="emit('submit', form)"
          class="flex-1 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer active:scale-95"
          :class="themeClasses.primaryBg"
        >
          Cadastrar
        </button>
      </div>
    </div>
  </div>
</template>
