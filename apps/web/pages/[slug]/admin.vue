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
          :is-service-store="isServiceStore"
          :is-product-available="isProductAvailable"
          :get-product-price="getProductPrice"
          @open-price-modal="openPriceModal"
          @toggle-product="toggleProduct"
          @delete-product="handleDeleteProduct"
          @open-options="openOptionsModal"
          @open-create-product="isCreateProductOpen = true"
        />

        <!-- ABA 2: Especialistas e Agenda (Hub & Pro) -->
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useMerchantAdmin, type TenantOverrides, type DaySchedule } from '~/composables/useMerchantAdmin'
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
import type { Product, Category } from '~/types'

const route = useRoute()
const slug = computed(() => String(route.params.slug || 'hamburgueria-x').toLowerCase())

const { tenant, refresh } = useTenant(slug)
const {
  isAuthenticated,
  errorMessage,
  login,
  logout,
  changePin,
  getOverrides,
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
const localOverrides = ref<TenantOverrides>({})

function showToast(msg: string) {
  adminToastMsg.value = msg
  setTimeout(() => {
    adminToastMsg.value = ''
  }, 3000)
}

function refreshLocalOverrides() {
  localOverrides.value = getOverrides()
}

onMounted(async () => {
  refreshLocalOverrides()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', refreshLocalOverrides)
    window.addEventListener('alaska_overrides_updated', refreshLocalOverrides)
  }
  loadScheduleFromOverrides()
  loadPixAndContactFromOverrides()
  if (tenant.value) {
    loadScheduleFromOverrides()
    loadPixAndContactFromOverrides()
  }
})

function handleLogin(pin: string) {
  login(pin)
}

const categories = computed<Category[]>(() => {
  return (tenant.value?.categories || []) as Category[]
})

function isProductAvailable(product: Product): boolean {
  if (product.isAvailable !== undefined) return Boolean(product.isAvailable)
  if ((product as any).available !== undefined) return Boolean((product as any).available)
  const prodOverrides = localOverrides.value?.products
  if (prodOverrides?.[product.id]?.isAvailable !== undefined) {
    return Boolean(prodOverrides[product.id].isAvailable)
  }
  return true
}

function getProductPrice(product: Product): number {
  const prodOverrides = localOverrides.value?.products
  if (prodOverrides?.[product.id]?.price !== undefined) {
    return Number(prodOverrides[product.id].price)
  }
  return Number(product.price || 0)
}

async function toggleProduct(categoryProducts: Product[], productId: string, currentStatus: boolean) {
  await toggleProductAvailability(categoryProducts, productId, currentStatus)
  refreshLocalOverrides()
  if (typeof refresh === 'function') {
    await refresh()
  }
  showToast(currentStatus ? 'Item pausado no catálogo' : 'Item ativado no catálogo')
}

// 2. Edição de Preços (Modal)
const isPriceModalOpen = ref(false)
const editingProduct = ref<Product | null>(null)
const editingProductsList = ref<Product[]>([])
const newPriceInput = ref(0)

function openPriceModal(categoryProducts: Product[], product: Product) {
  editingProductsList.value = categoryProducts
  editingProduct.value = product
  newPriceInput.value = getProductPrice(product)
  isPriceModalOpen.value = true
}

async function confirmPriceEdit(newPrice: number) {
  if (editingProduct.value && newPrice > 0) {
    await updateProductPrice(editingProductsList.value, editingProduct.value.id, newPrice)
    refreshLocalOverrides()
    if (typeof refresh === 'function') {
      await refresh()
    }
    showToast(`Preço de ${editingProduct.value.name} atualizado!`)
  }
  isPriceModalOpen.value = false
}

// 3. Criação e Exclusão de Produtos
const isCreateProductOpen = ref(false)

function handleCreateProductSubmit(form: { name: string; price: number; categoryId: string; description: string }) {
  createProduct({
    name: form.name,
    price: form.price,
    categoryId: form.categoryId,
    description: form.description
  })
  refreshLocalOverrides()
  isCreateProductOpen.value = false
  showToast(`✅ ${form.name} adicionado ao cardápio!`)
}

function handleDeleteProduct(productId: string, productName: string) {
  if (confirm(`Tem certeza que deseja excluir ${productName}?`)) {
    deleteProduct(productId)
    refreshLocalOverrides()
    showToast(`🗑️ ${productName} removido do catálogo!`)
  }
}

// 4. Modal de Gestão de Opcionais / Adicionais
const isOptionsModalOpen = ref(false)
const selectedProductForOptions = ref<Product | null>(null)

function openOptionsModal(product: Product) {
  selectedProductForOptions.value = product
  isOptionsModalOpen.value = true
}

function isOptionPaused(optionId: string): boolean {
  const current = localOverrides.value || {}
  return (current.pausedOptionIds || []).includes(optionId)
}

async function toggleOptionStatus(optionId: string) {
  const currentlyPaused = isOptionPaused(optionId)
  await toggleOptionAvailability(optionId, currentlyPaused, selectedProductForOptions.value?.id)
  refreshLocalOverrides()
  if (typeof refresh === 'function') {
    await refresh()
  }
  showToast(currentlyPaused ? 'Opcional ativado no estoque' : 'Opcional pausado no estoque')
}

// 5. Especialistas & Horários Individuais (Hub & Pro)
const isServiceStore = computed(() => {
  const cat = tenant.value?.businessCategory || (tenant.value as any)?.template
  return cat === 'hub' || cat === 'pro' || slug.value === 'barbearia-style' || slug.value === 'clinica-sorriso'
})

const isHealthStore = computed(() => {
  return tenant.value?.businessCategory === 'pro' || slug.value === 'clinica-sorriso'
})

const isEmergencyClosed = computed(() => {
  return Boolean(localOverrides.value?.emergency?.isClosed)
})

const professionalsList = computed(() => {
  const baseProfs = (tenant.value?.professionals || []) as any[]
  const overrides = localOverrides.value || {}
  const profOverrides = overrides.professionals || {}
  const deletedProfIds = overrides.deletedProfessionalIds || []
  const customProfs = overrides.customProfessionals || []

  const filteredBase = baseProfs.filter((p: any) => !deletedProfIds.includes(p.id))
  const allProfs = [...filteredBase, ...customProfs.filter((p: any) => !deletedProfIds.includes(p.id))]

  return allProfs.map((p: any) => {
    const ov = profOverrides[p.id] || {}
    const isAvail = ov.isAvailable !== undefined
      ? Boolean(ov.isAvailable)
      : (p.isAvailable !== undefined ? Boolean(p.isAvailable) : true)

    const days = ov.availableDays
      ? [...ov.availableDays]
      : (p.availableDays ? [...p.availableDays] : [1, 2, 3, 4, 5, 6])

    const startHour = ov.workHours?.start || p.workHours?.start || '08:00'
    const endHour = ov.workHours?.end || p.workHours?.end || '18:00'
    const lunchStart = ov.lunchBreak?.start || p.lunchBreak?.start || '12:00'
    const lunchEnd = ov.lunchBreak?.end || p.lunchBreak?.end || '13:00'
    const lunchEnabled = ov.lunchBreak?.enabled !== undefined
      ? Boolean(ov.lunchBreak.enabled)
      : (p.lunchBreak?.enabled !== undefined ? Boolean(p.lunchBreak.enabled) : true)

    return {
      ...p,
      isAvailable: isAvail,
      availableDays: days,
      workHours: {
        start: startHour,
        end: endHour
      },
      lunchBreak: {
        start: lunchStart,
        end: lunchEnd,
        enabled: lunchEnabled
      }
    }
  })
})

const selectedAgendaDate = ref(new Date().toISOString().split('T')[0])
const sampleSlots = ref(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'])

function isSlotBlocked(slot: string): boolean {
  const blocked = localOverrides.value?.blockedSlots || []
  return blocked.some((b: any) => b.date === selectedAgendaDate.value && b.time === slot)
}

function handleProfAvailabilityToggle(profId: string, currentAvailable: boolean, name: string) {
  const newStatus = !currentAvailable
  toggleProfessionalAvailability(profId, newStatus)
  refreshLocalOverrides()
  showToast(newStatus ? `Status de ${name}: Atendendo!` : `Status de ${name}: De Folga Hoje!`)
}

function handleProfDayToggle(profId: string, dayIndex: number, name: string) {
  const prof = professionalsList.value.find((p) => p.id === profId)
  if (!prof) return
  let days = [...(prof.availableDays || [])]
  if (days.includes(dayIndex)) {
    days = days.filter((d) => d !== dayIndex)
  } else {
    days.push(dayIndex)
  }
  updateProfessionalDays(profId, days.sort())
  refreshLocalOverrides()
  showToast(`Escala semanal de ${name} atualizada!`)
}

function handleProfWorkHoursChange(profId: string, workHours: any, name: string) {
  const start = typeof workHours === 'object' && workHours ? workHours.start : workHours
  const end = typeof workHours === 'object' && workHours ? workHours.end : ''
  updateProfessionalHours(profId, start, end)
  refreshLocalOverrides()
  showToast(`Horário de ${name} salvo: ${start} às ${end}!`)
}

function handleProfLunchChange(profId: string, lunchBreak: any, name: string) {
  const start = typeof lunchBreak === 'object' && lunchBreak ? lunchBreak.start : lunchBreak
  const end = typeof lunchBreak === 'object' && lunchBreak ? lunchBreak.end : ''
  const enabled = typeof lunchBreak === 'object' && lunchBreak ? Boolean(lunchBreak.enabled) : true
  updateProfessionalLunch(profId, start, end, enabled)
  refreshLocalOverrides()
  showToast(`Almoço de ${name} atualizado!`)
}

function handleDeleteProf(profId: string, profName: string) {
  if (confirm(`Remover ${profName} da equipe?`)) {
    deleteProfessional(profId)
    refreshLocalOverrides()
    showToast(`🗑️ ${profName} removido da equipe!`)
  }
}

// 7. Bloqueio de Horários na Agenda
function handleSlotToggle(date: string, time: string) {
  const isBlocked = toggleBlockSlot(date, time)
  refreshLocalOverrides()
  showToast(isBlocked ? `Horário ${time} bloqueado!` : `Horário ${time} liberado!`)
}

// 8. Configurações Pix & Contato
const pixConfigInput = ref({
  keyType: 'phone' as 'cpf' | 'cnpj' | 'phone' | 'email' | 'random',
  pixKey: '',
  beneficiary: '',
  city: ''
})

const contactInput = ref({
  whatsapp: '',
  instagram: ''
})

function loadPixAndContactFromOverrides() {
  const ov = localOverrides.value || {}
  const basePix = tenant.value?.pixConfig || (tenant.value as any)?.pix || {}
  pixConfigInput.value = {
    keyType: ov.pix?.keyType || basePix.keyType || 'phone',
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

// 9. Horários & Pausa Geral
const weeklyDaysConfig = ref<Array<{ key: string; label: string; closed: boolean; open: string; close: string }>>([])
const scheduleSuccessMsg = ref('')

function loadScheduleFromOverrides() {
  const ov = localOverrides.value || {}
  const baseHours = (tenant.value?.openingHours || {}) as Record<string, DaySchedule> & { open?: string; close?: string }
  const overrideHours = ov.openingHours || {}
  const days = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ]

  weeklyDaysConfig.value = days.map(d => {
    const dOverride = (overrideHours as any)[d.key]
    const dBase = (baseHours as any)[d.key]
    return {
      key: d.key,
      label: d.label,
      open: dOverride?.open || dBase?.open || baseHours.open || '09:00',
      close: dOverride?.close || dBase?.close || baseHours.close || '22:00',
      closed: dOverride?.closed ?? dBase?.closed ?? false
    }
  })
}

function toggleEmergencyPause() {
  const nextVal = !isEmergencyClosed.value
  updateEmergency(nextVal, '')
  refreshLocalOverrides()
  showToast(nextVal ? 'Atendimento emergencial pausado!' : 'Atendimento reativado!')
}

function toggleDayClosed(day: any) {
  day.closed = !day.closed
}

async function saveWeeklySchedule() {
  const schedule: Record<string, DaySchedule> = {}
  weeklyDaysConfig.value.forEach(d => {
    schedule[d.key] = {
      open: d.open,
      close: d.close,
      closed: d.closed
    }
  })
  await updateWeeklySchedule(schedule)
  refreshLocalOverrides()
  if (typeof refresh === 'function') {
    await refresh()
  }
  scheduleSuccessMsg.value = 'Horários atualizados com sucesso!'
  showToast('Horários de funcionamento atualizados!')
  setTimeout(() => {
    scheduleSuccessMsg.value = ''
  }, 3000)
}

// 10. Delivery & Taxas
const deliveryFeeInput = ref(0)
const minOrderInput = ref(0)
const estimatedTimeInput = ref('30-50 min')

function saveDeliveryConfig() {
  updateDelivery(deliveryFeeInput.value, minOrderInput.value, estimatedTimeInput.value)
  refreshLocalOverrides()
  showToast('Configurações de entrega salvas com sucesso!')
}

// 11. Comunicados em Destaque
const announcementEnabled = ref(false)
const announcementMessage = ref('')

function saveAnnouncementConfig() {
  updateAnnouncement(announcementEnabled.value, announcementMessage.value)
  refreshLocalOverrides()
  showToast('Comunicado da loja salvo com sucesso!')
}

// 12. Troca de PIN
const pinSuccessMsg = ref('')

function saveNewPin(newPin: string) {
  const success = changePin(newPin)
  if (success) {
    pinSuccessMsg.value = 'PIN de acesso atualizado com sucesso!'
    refreshLocalOverrides()
    showToast('PIN atualizado com sucesso!')
    setTimeout(() => {
      pinSuccessMsg.value = ''
    }, 3000)
  }
}

function openCreateProfModal() {
  isCreateProfOpen.value = true
}

function handleCreateProfSubmit(form: { name: string; role: string }) {
  createProfessional({
    name: form.name,
    role: form.role,
    availableDays: [1, 2, 3, 4, 5],
    workHours: { start: '08:00', end: '18:00' },
    lunchBreak: { start: '12:00', end: '13:00', enabled: true }
  })
  refreshLocalOverrides()
  isCreateProfOpen.value = false
  showToast(`✅ Especialista ${form.name} cadastrado!`)
}
</script>
