<!-- components/admin/modals/AdminCreateProfModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', form: { name: string; role: string }): void
}>()

const form = ref({
  name: '',
  role: ''
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      form.value = { name: '', role: '' }
    }
  }
)
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" @click="emit('close')">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" @click.stop>
      <h3 class="text-sm font-bold text-white flex items-center gap-2">
        <Plus class="w-4 h-4 text-emerald-400" />
        <span>Cadastrar Novo Especialista / Barbeiro</span>
      </h3>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Nome:</label>
          <input
            type="text"
            v-model="form.name"
            placeholder="Ex: Dra. Mariana Costa"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Especialidade / Cargo:</label>
          <input
            type="text"
            v-model="form.role"
            placeholder="Ex: Ortodontista & Harmonização"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <button
          @click="emit('close')"
          class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          @click="emit('submit', form)"
          class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Cadastrar
        </button>
      </div>
    </div>
  </div>
</template>
