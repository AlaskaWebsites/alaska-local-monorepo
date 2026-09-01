<!-- pages/[slug]/admin.vue -->
<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
    <ClientOnly>
      <!-- 1. Tela de Login por PIN -->
      <AdminLoginCard
        v-if="!isAuthenticated"
        :error-message="errorMessage"
        :slug="slug"
        @login="handleLogin"
      />

      <!-- 2. Painel Operacional Ativo -->
      <div v-else class="max-w-2xl mx-auto pb-24">
        <!-- Header Superior Fixo -->
        <AdminTopHeader
          :store-name="tenant?.name"
          :is-emergency-closed="isEmergencyClosed"
          :is-health-store="isHealthStore"
          :is-service-store="isServiceStore"
          :slug="slug"
          @logout="logout"
        />

        <!-- Toast de Notificação Rápida -->
        <div v-if="adminToastMsg" class="sticky top-16 z-30 mx-4 mt-2 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center shadow-lg animate-in fade-in duration-150">
          {{ adminToastMsg }}
        </div>

        <!-- Navegação em Abas Operacionais com Rolagem e Setas Desktop/Mobile -->
        <AdminTabsNav
          v-model:active-tab="activeTab"
          :is-service-store="isServiceStore"
          :is-health-store="isHealthStore"
        />

        <!-- ABA 1: Catálogo e Serviços (Pausa, Criação, Exclusão e Preços) -->
        <AdminCatalogTab
          v-if="activeTab === 'catalog'"
          :categories="categories"
          :is-product-available="isProductAvailable"
          :get-product-price="getProductPrice"
          @create-product="openCreateProductModal"
          @toggle-product="toggleProduct"
          @edit-price="openPriceModal"
          @manage-options="openOptionsModal"
          @delete-product="handleDeleteProduct"
        />

        <!-- ABA 2: Equipe & Agenda (Exclusivo Hub & Pro) -->
        <AdminAgendaTab
          v-else-if="activeTab === 'agenda' && isServiceStore"
          :is-health-store="isHealthStore"
          :professionals-list="professionalsList"
          v-model:selected-agenda-date="selectedAgendaDate"
          :sample-slots="sampleSlots"
          :is-slot-blocked="isSlotBlocked"
          @create-prof="openCreateProfModal"
          @toggle-prof-avail="handleProfAvailabilityToggle"
          @toggle-prof-day="handleProfDayToggle"
          @change-prof-hours="handleProfWorkHoursChange"
          @change-prof-lunch="handleProfLunchChange"
          @delete-prof="handleDeleteProf"
          @toggle-slot="handleSlotToggle"
        />

        <!-- ABA 3: Pix & Contato -->
        <AdminPixContactTab
          v-else-if="activeTab === 'pix_contact'"
          :pix-config-input="pixConfigInput"
          :contact-input="contactInput"
          @save-pix="savePixConfig"
          @save-contact="saveContactConfig"
        />

        <!-- ABA 4: Horários & Pausa Geral -->
        <AdminHoursTab
          v-else-if="activeTab === 'hours'"
          :is-emergency-closed="isEmergencyClosed"
          :weekly-days-config="weeklyDaysConfig"
          :schedule-success-msg="scheduleSuccessMsg"
          @toggle-emergency="toggleEmergencyPause"
          @toggle-day-closed="toggleDayClosed"
          @save-schedule="saveWeeklySchedule"
        />

        <!-- ABA 5: Delivery & Taxas -->
        <AdminDeliveryTab
          v-else-if="activeTab === 'delivery' && !isServiceStore"
          v-model:delivery-fee-input="deliveryFeeInput"
          v-model:min-order-input="minOrderInput"
          v-model:estimated-time-input="estimatedTimeInput"
          @save-delivery="saveDeliveryConfig"
        />

        <!-- ABA 6: Comunicado Oficial -->
        <AdminAnnouncementTab
          v-else-if="activeTab === 'announcement'"
          v-model:announcement-enabled="announcementEnabled"
          v-model:announcement-message="announcementMessage"
          @save-announcement="saveAnnouncementConfig"
        />

        <!-- ABA 7: Segurança e PIN -->
        <AdminSecurityTab
          v-else-if="activeTab === 'security'"
          :pin-success-msg="pinSuccessMsg"
          @save-pin="saveNewPin"
        />

        <!-- Modais Operacionais -->
        <AdminPriceModal
          :is-open="isPriceModalOpen"
          :product="editingProduct"
          :initial-price="newPriceInput"
          @close="isPriceModalOpen = false"
          @confirm="confirmPriceEdit"
        />

        <AdminCreateProductModal
          :is-open="isCreateProductOpen"
          :categories="categories"
          :is-service-store="isServiceStore"
          @close="isCreateProductOpen = false"
          @submit="handleCreateProductSubmit"
        />

        <AdminCreateProfModal
          :is-open="isCreateProfOpen"
          @close="isCreateProfOpen = false"
          @submit="handleCreateProfSubmit"
        />

        <AdminOptionsModal
          :is-open="isOptionsModalOpen"
          :product="selectedProductForOptions"
          :is-option-paused="isOptionPaused"
          @close="isOptionsModalOpen = false"
          @toggle-option="toggleOptionStatus"
        />
      </div>

      <!-- Fallback SSR / Loading -->
      <template #fallback>
        <div class="min-h-screen flex items-center justify-center p-4">
          <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useMerchantAdmin, type TenantOverrides } from '~/composables/useMerchantAdmin'
import AdminLoginCard from '~/components/admin/AdminLoginCard.vue'
import AdminTopHeader from '~/components/admin/AdminTopHeader.vue'
import AdminTabsNav, { type AdminTabKey } from '~/components/admin/AdminTabsNav.vue'
import AdminCatalogTab from '~/components/admin/tabs/AdminCatalogTab.vue'
import AdminAgendaTab from '~/components/admin/tabs/AdminAgendaTab.vue'
import AdminPixContactTab from '~/components/admin/tabs/AdminPixContactTab.vue'
import AdminHoursTab from '~/components/admin/tabs/AdminHoursTab.vue'
import AdminDeliveryTab from '~/components/admin/tabs/AdminDeliveryTab.vue'
import AdminAnnouncementTab from '~/components/admin/tabs/AdminAnnouncementTab.vue'
import AdminSecurityTab from '~/components/admin/tabs/AdminSecurityTab.vue'
import AdminPriceModal from '~/components/admin/modals/AdminPriceModal.vue'
import AdminCreateProductModal from '~/components/admin/modals/AdminCreateProductModal.vue'
import AdminCreateProfModal from '~/components/admin/modals/AdminCreateProfModal.vue'
import AdminOptionsModal from '~/components/admin/modals/AdminOptionsModal.vue'
import type { Product, Category } from '@alaska/contracts'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const { tenant, refresh } = useTenant(slug)
const {
  isAuthenticated,
  errorMessage,
  login,
  logout,
  changePin,
  getOverrides,
  saveOverrides,
  toggleProductAvailability,
  updateProductPrice,
  createProduct,
  deleteProduct,
  toggleOptionAvailability,
  updatePixConfig,
  updateContact,
  updateWeeklySchedule,
  toggleProfessionalAvailability,
  updateProfessionalDays,
  updateProfessionalHours,
  updateProfessionalLunch,
  createProfessional,
  deleteProfessional,
  updateDelivery,
  updateAnnouncement,
  updateEmergency,
  toggleBlockSlot
} = useMerchantAdmin(slug)

const activeTab = ref<AdminTabKey>('catalog')
const adminToastMsg = ref('')

function showToast(msg: string) {
  adminToastMsg.value = msg
  setTimeout(() => { adminToastMsg.value = '' }, 2500)
}

// 1. Estado Reativo dos Overrides para Atualização Imediata da UI
const localOverrides = ref<TenantOverrides>({})

function refreshLocalOverrides() {
  localOverrides.value = getOverrides()
}

onMounted(async () => {
  if (slug.value && typeof refresh === 'function') {
    await refresh()
  }
  refreshLocalOverrides()
  loadScheduleFromOverrides()
  loadPixAndContactFromOverrides()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', refreshLocalOverrides)
    window.addEventListener('alaska_overrides_updated', refreshLocalOverrides)
  }
})

// Identifica se a loja é de saúde/clínica ou barbearia/serviços
const isHealthStore = computed(() => {
  const cat = (tenant.value as any)?.businessCategory || (tenant.value as any)?.category || (tenant.value as any)?.template
  return cat === 'pro' || slug.value === 'clinica-sorriso'
})

const isServiceStore = computed(() => {
  const cat = (tenant.value as any)?.businessCategory || (tenant.value as any)?.category || (tenant.value as any)?.template
  return cat === 'hub' || cat === 'pro' || slug.value === 'barbearia-style' || slug.value === 'clinica-sorriso'
})

const categories = computed<Category[]>(() => {
  const baseCategories = (tenant.value?.categories || []) as Category[]
  const overrides = localOverrides.value
  const deletedProductIds = overrides.deletedProductIds || []
  const customProducts = overrides.customProducts || []

  return baseCategories.map(cat => {
    const baseProds = (cat.products || []).filter(p => !deletedProductIds.includes(p.id))
    const customForCat = customProducts.filter(p => p.categoryId === cat.id && !deletedProductIds.includes(p.id))

    return {
      ...cat,
      products: [...baseProds, ...customForCat]
    }
  })
})

function handleLogin(pin: string) {
  login(pin)
}

function isProductAvailable(product: Product): boolean {
  if (localOverrides.value.products?.[product.id]?.isAvailable !== undefined) {
    return localOverrides.value.products[product.id].isAvailable!
  }
  if (product.isAvailable !== undefined) return product.isAvailable
  if ((product as any).available !== undefined) return (product as any).available
  return true
}

function getProductPrice(product: Product): number {
  if (localOverrides.value.products?.[product.id]?.price !== undefined) {
    return localOverrides.value.products[product.id].price!
  }
  return product.price
}

function toggleProduct(products: Product[], productId: string, currentStatus: boolean) {
  toggleProductAvailability(products, productId, currentStatus)
  refreshLocalOverrides()
}

// 2. Edição de Preço
const isPriceModalOpen = ref(false)
const editingProduct = ref<Product | null>(null)
const editingProductsList = ref<Product[]>([])
const newPriceInput = ref<number>(0)

function openPriceModal(products: Product[], product: Product) {
  editingProduct.value = product
  editingProductsList.value = products
  newPriceInput.value = getProductPrice(product)
  isPriceModalOpen.value = true
}

async function confirmPriceEdit(newPrice: number) {
  if (editingProduct.value && newPrice > 0) {
    await updateProductPrice(editingProductsList.value, editingProduct.value.id, newPrice)
    refreshLocalOverrides()
    showToast(`Preço de ${editingProduct.value.name} atualizado!`)
  }
  isPriceModalOpen.value = false
}

// 3. Criação e Exclusão de Produtos
const isCreateProductOpen = ref(false)

function openCreateProductModal() {
  isCreateProductOpen.value = true
}

function handleCreateProductSubmit(form: { name: string; price: number; categoryId: string; description: string }) {
  if (!form.name || !form.price || !form.categoryId) {
    showToast('⚠️ Preencha nome, preço e categoria!')
    return
  }
  createProduct(form)
  refreshLocalOverrides()
  isCreateProductOpen.value = false
  showToast(`✅ ${form.name} cadastrado com sucesso!`)
}

function handleDeleteProduct(productId: string, productName: string) {
  if (confirm(`Tem certeza que deseja excluir "${productName}" do catálogo?`)) {
    deleteProduct(productId)
    refreshLocalOverrides()
    showToast(`🗑️ ${productName} removido!`)
  }
}

// 4. Gestão de Opcionais Pausados
const isOptionsModalOpen = ref(false)
const selectedProductForOptions = ref<Product | null>(null)

function openOptionsModal(product: Product) {
  selectedProductForOptions.value = product
  isOptionsModalOpen.value = true
}

function isOptionPaused(optionId: string): boolean {
  return (localOverrides.value.pausedOptionIds || []).includes(optionId)
}

function toggleOptionStatus(optionId: string) {
  const currentPaused = isOptionPaused(optionId)
  toggleOptionAvailability(optionId, currentPaused)
  refreshLocalOverrides()
}

// 5. Gestão Pix e Contatos
const pixConfigInput = ref({
  keyType: 'random' as 'cpf' | 'cnpj' | 'phone' | 'email' | 'random',
  pixKey: '',
  beneficiary: '',
  city: 'SAO PAULO'
})

const contactInput = ref({
  whatsapp: '',
  instagram: ''
})

function loadPixAndContactFromOverrides() {
  const ov = getOverrides()
  const basePix = tenant.value?.pixConfig || (tenant.value as any)?.pix || {}

  pixConfigInput.value = {
    keyType: ov.pix?.keyType || basePix.keyType || 'random',
    pixKey: ov.pix?.pixKey || basePix.key || basePix.pixKey || '',
    beneficiary: ov.pix?.beneficiary || basePix.beneficiary || tenant.value?.name || '',
    city: ov.pix?.city || basePix.city || 'SAO PAULO'
  }

  contactInput.value = {
    whatsapp: ov.contact?.whatsapp || tenant.value?.phoneWhatsApp || '',
    instagram: ov.contact?.instagram || (tenant.value as any)?.instagram || ''
  }
}

function savePixConfig() {
  updatePixConfig(pixConfigInput.value)
  refreshLocalOverrides()
  showToast('Configurações Pix salvas com sucesso!')
}

function saveContactConfig() {
  updateContact(contactInput.value)
  refreshLocalOverrides()
  showToast('Contatos salvos com sucesso!')
}

// 6. Programação Semanal de 7 Dias
const weeklyDaysConfig = ref([
  { key: 'monday', label: 'Segunda-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'tuesday', label: 'Terça-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'wednesday', label: 'Quarta-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'thursday', label: 'Quinta-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'friday', label: 'Sexta-feira', closed: false, open: '09:00', close: '20:00' },
  { key: 'saturday', label: 'Sábado', closed: false, open: '09:00', close: '20:00' },
  { key: 'sunday', label: 'Domingo', closed: true, open: '09:00', close: '18:00' },
])

const scheduleSuccessMsg = ref('')

function loadScheduleFromOverrides() {
  const overrides = getOverrides()
  const hours = overrides.openingHours || tenant.value?.openingHours || {}
  const defOpen = hours.open || '09:00'
  const defClose = hours.close || '20:00'

  weeklyDaysConfig.value.forEach(d => {
    const dayConfig = (hours as any)[d.key]
    if (dayConfig) {
      d.closed = Boolean(dayConfig.closed)
      d.open = dayConfig.open || defOpen
      d.close = dayConfig.close || defClose
    } else {
      d.open = defOpen
      d.close = defClose
    }
  })
}

watch(
  () => tenant.value,
  (newTenant) => {
    if (newTenant) {
      loadScheduleFromOverrides()
      loadPixAndContactFromOverrides()
    }
  },
  { deep: true }
)

function toggleDayClosed(d: any) {
  d.closed = !d.closed
  saveWeeklySchedule()
}

function saveWeeklySchedule() {
  const schedulePayload: Record<string, any> = {}
  weeklyDaysConfig.value.forEach(d => {
    schedulePayload[d.key] = {
      open: d.open,
      close: d.close,
      closed: d.closed
    }
  })
  updateWeeklySchedule(schedulePayload)
  refreshLocalOverrides()
  scheduleSuccessMsg.value = 'Programação semanal salva com sucesso!'
  showToast('Programação semanal salva com sucesso!')
  setTimeout(() => { scheduleSuccessMsg.value = '' }, 2500)
}

// 7. Pausa de Emergência
const isEmergencyClosed = computed(() => {
  return Boolean(localOverrides.value.emergency?.isClosed)
})

function toggleEmergencyPause() {
  const newStatus = !isEmergencyClosed.value
  updateEmergency(newStatus, newStatus ? 'Atendimento pausado temporariamente' : '')
  refreshLocalOverrides()
  showToast(newStatus ? '🛑 Atendimento da loja pausado!' : '🟢 Loja reaberta com sucesso!')
}

// 8. Barbeiros & Especialistas da Clínica com Horários e Almoço
const defaultProfessionalsBySlug: Record<string, Array<{ id: string; name: string; role: string; isAvailable: boolean; availableDays: number[]; workHours: { start: string; end: string }; lunchBreak: { start: string; end: string; enabled: boolean } }>> = {
  'clinica-sorriso': [
    { id: 'prof-1', name: 'Dra. Camila Rocha', role: 'Cirurgiã Dentista & Implantes', isAvailable: true, availableDays: [1, 2, 3, 4, 5], workHours: { start: '08:00', end: '17:00' }, lunchBreak: { start: '12:00', end: '13:00', enabled: true } },
    { id: 'prof-2', name: 'Dr. Rafael Mendes', role: 'Ortodontista & Invisalign', isAvailable: true, availableDays: [1, 2, 3, 4, 5, 6], workHours: { start: '09:00', end: '19:00' }, lunchBreak: { start: '13:00', end: '14:00', enabled: true } },
    { id: 'prof-3', name: 'Dra. Beatriz Lima', role: 'Harmonização Orofacial & Estética', isAvailable: true, availableDays: [2, 3, 4, 5, 6], workHours: { start: '10:00', end: '19:00' }, lunchBreak: { start: '13:00', end: '14:00', enabled: false } }
  ],
  'barbearia-style': [
    { id: 'prof-1', name: 'Carlos Santos', role: 'Barbeiro Master', isAvailable: true, availableDays: [1, 2, 3, 4, 5, 6], workHours: { start: '09:00', end: '20:00' }, lunchBreak: { start: '12:00', end: '13:00', enabled: true } },
    { id: 'prof-2', name: 'Lucas Oliveira', role: 'Visagista & Barbeiro', isAvailable: true, availableDays: [2, 3, 4, 5, 6], workHours: { start: '10:00', end: '20:00' }, lunchBreak: { start: '14:00', end: '15:00', enabled: true } },
    { id: 'prof-3', name: 'Mateus Silva', role: 'Especialista em Cortes Clássicos', isAvailable: true, availableDays: [1, 3, 4, 5, 6], workHours: { start: '09:00', end: '18:00' }, lunchBreak: { start: '12:00', end: '13:00', enabled: false } }
  ]
}

const professionalsList = computed(() => {
  const profOverrides = localOverrides.value.professionals || {}
  const deletedProfIds = localOverrides.value.deletedProfessionalIds || []
  const customProfs = localOverrides.value.customProfessionals || []

  const baseList = defaultProfessionalsBySlug[slug.value] || defaultProfessionalsBySlug['barbearia-style']
  const filteredBase = baseList.filter(p => !deletedProfIds.includes(p.id))

  const all = [...filteredBase, ...customProfs.filter(p => !deletedProfIds.includes(p.id))]

  return all.map(p => {
    const ov = profOverrides[p.id]
    return {
      ...p,
      isAvailable: ov?.isAvailable !== undefined ? Boolean(ov.isAvailable) : Boolean(p.isAvailable),
      availableDays: ov?.availableDays ? [...ov.availableDays] : [...p.availableDays],
      workHours: {
        start: ov?.workHours?.start || p.workHours.start,
        end: ov?.workHours?.end || p.workHours.end
      },
      lunchBreak: {
        start: ov?.lunchBreak?.start || p.lunchBreak.start,
        end: ov?.lunchBreak?.end || p.lunchBreak.end,
        enabled: ov?.lunchBreak?.enabled !== undefined ? Boolean(ov.lunchBreak.enabled) : p.lunchBreak.enabled
      }
    }
  })
})

function handleProfAvailabilityToggle(profId: string, currentAvailable: boolean, name: string) {
  const newStatus = !currentAvailable
  toggleProfessionalAvailability(profId, newStatus)
  refreshLocalOverrides()
  showToast(newStatus ? `✅ ${name} agora está atendendo!` : `🏖️ ${name} marcado como De Folga!`)
}

function handleProfDayToggle(profId: string, dayIndex: number, name: string) {
  const prof = professionalsList.value.find(p => p.id === profId)
  if (!prof) return
  let days = [...(prof.availableDays || [])]
  if (days.includes(dayIndex)) {
    days = days.filter(d => d !== dayIndex)
  } else {
    days.push(dayIndex)
  }
  updateProfessionalDays(profId, days.sort())
  refreshLocalOverrides()
  showToast(`📅 Escala semanal de ${name} atualizada!`)
}

function handleProfWorkHoursChange(profId: string, workHours: { start: string; end: string }, name: string) {
  updateProfessionalHours(profId, workHours)
  refreshLocalOverrides()
  showToast(`⏰ Horário de ${name} salvo: ${workHours.start} às ${workHours.end}!`)
}

function handleProfLunchChange(profId: string, lunchBreak: { start: string; end: string; enabled: boolean }, name: string) {
  updateProfessionalLunch(profId, lunchBreak)
  refreshLocalOverrides()
  showToast(`🍽️ Intervalo de almoço de ${name} atualizado!`)
}

// 9. Criação e Exclusão de Especialistas
const isCreateProfOpen = ref(false)

function openCreateProfModal() {
  isCreateProfOpen.value = true
}

function handleCreateProfSubmit(form: { name: string; role: string }) {
  if (!form.name || !form.role) {
    showToast('⚠️ Preencha nome e especialidade!')
    return
  }
  createProfessional({
    name: form.name,
    role: form.role,
    availableDays: [1, 2, 3, 4, 5],
    workHours: { start: '08:00', end: '18:00' },
    lunchBreak: { start: '12:00', end: '13:00', enabled: true }
  })
  refreshLocalOverrides()
  isCreateProfOpen.value = false
  showToast(`✅ ${form.name} cadastrado na equipe!`)
}

function handleDeleteProf(profId: string, profName: string) {
  if (confirm(`Tem certeza que deseja remover "${profName}" da equipe?`)) {
    deleteProfessional(profId)
    refreshLocalOverrides()
    showToast(`🗑️ ${profName} removido da equipe!`)
  }
}

// 10. Delivery & Taxas
const deliveryFeeInput = ref((tenant.value as any)?.deliveryFee || 6.0)
const minOrderInput = ref((tenant.value as any)?.minOrderValue || 20.0)
const estimatedTimeInput = ref('35-50 min')

function saveDeliveryConfig() {
  updateDelivery(deliveryFeeInput.value, minOrderInput.value, estimatedTimeInput.value)
  refreshLocalOverrides()
  showToast('Configurações de delivery atualizadas!')
}

// 11. Comunicado
const announcementEnabled = ref(false)
const announcementMessage = ref('')

function saveAnnouncementConfig() {
  updateAnnouncement(announcementEnabled.value, announcementMessage.value)
  refreshLocalOverrides()
  showToast('Comunicado oficial atualizado!')
}

// 12. Troca de PIN
const pinSuccessMsg = ref('')

function saveNewPin(newPin: string) {
  if (changePin(newPin)) {
    pinSuccessMsg.value = 'PIN de acesso atualizado com sucesso!'
    refreshLocalOverrides()
    showToast('PIN atualizado com sucesso!')
    setTimeout(() => { pinSuccessMsg.value = '' }, 3000)
  }
}

// 13. Agenda & Bloqueios de Horário
const selectedAgendaDate = ref(new Date().toISOString().split('T')[0])
const sampleSlots = [
  '08:00', '08:45', '09:30', '10:15', '11:00',
  '11:45', '12:30', '13:15', '14:00', '14:45',
  '15:30', '16:15', '17:00', '17:45', '18:30'
]

function isSlotBlocked(date: string, time: string): boolean {
  const slots = localOverrides.value.blockedSlots || []
  return slots.some(s => s.date === date && s.time === time)
}

function handleSlotToggle(date: string, time: string) {
  const currentlyBlocked = isSlotBlocked(date, time)
  toggleBlockSlot(date, time)
  refreshLocalOverrides()
  showToast(currentlyBlocked ? `🟢 Horário ${time} liberado para agendamento!` : `🛑 Horário ${time} bloqueado na agenda!`)
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.no-scrollbar {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
</style>
