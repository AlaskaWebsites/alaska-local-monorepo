<!-- components/admin/modals/AdminCreateCategoryModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { FolderPlus, X } from 'lucide-vue-next'
import { useTenantTheme } from '~/composables/useTenantTheme'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', category: { name: string; icon: string }): void
}>()

const { themeClasses } = useTenantTheme()

const form = ref({
  name: '',
  icon: '🏷️'
})

const emojiSuggestions = [
  '🏷️', '🍔', '🍕', '🥩', '🍖', '🥪',
  '🍺', '🍷', '🥃', '🥤', '☕', '🍰',
  '🐶', '🐱', '💈', '✂️', '🩺', '🛍️'
]

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      form.value = {
        name: '',
        icon: '🏷️'
      }
    }
  }
)

function selectEmoji(emoji: string) {
  form.value.icon = emoji
}

function handleSubmit() {
  if (!form.value.name.trim()) return
  emit('submit', {
    name: form.value.name.trim(),
    icon: form.value.icon.trim() || '🏷️'
  })
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    @click="emit('close')"
  >
    <div
      class="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FolderPlus class="w-4 h-4" :class="themeClasses.primaryText" />
          <span>Cadastrar Nova Categoria</span>
        </h3>
        <button
          type="button"
          @click="emit('close')"
          class="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <p class="text-xs text-slate-500">
        Crie uma nova seção para organizar os produtos ou serviços na vitrine da loja.
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">
            Nome da Categoria:
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="Ex: Petiscos Especiais, Rações Premium..."
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
            autofocus
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">
            Ícone ou Emoji da Categoria:
          </label>
          <div class="flex items-center gap-2 mb-2">
            <span class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg border border-slate-200">
              {{ form.icon }}
            </span>
            <input
              v-model="form.icon"
              type="text"
              maxlength="4"
              class="w-20 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-center text-slate-900 outline-none focus:border-slate-400"
            />
            <span class="text-[11px] text-slate-400">Escolha abaixo ou digite:</span>
          </div>

          <!-- Grade de Emojis Rápidos -->
          <div class="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200/80 rounded-xl">
            <button
              v-for="emoji in emojiSuggestions"
              :key="emoji"
              type="button"
              @click="selectEmoji(emoji)"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-base hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
              :class="{ 'bg-white shadow-2xs ring-1 ring-slate-300': form.icon === emoji }"
            >
              {{ emoji }}
            </button>
          </div>
        </div>

        <div class="flex gap-2 pt-2">
          <button
            type="button"
            @click="emit('close')"
            class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="!form.name.trim()"
            class="flex-1 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="themeClasses.primaryBg"
          >
            Criar Categoria
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
