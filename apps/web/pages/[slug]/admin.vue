<!-- pages/[slug]/admin.vue -->
<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white pb-12">
    <ClientOnly>
      <!-- 1. TELA DE LOGIN POR PIN -->
      <div v-if="!isAuthenticated" class="min-h-screen flex items-center justify-center p-4">
        <AdminLoginCard
          :slug="slug"
          :error-message="errorMessage"
          :is-submitting="isSubmitting"
          @login="handleLogin"
        />
      </div>

      <!-- 2. PAINEL OPERACIONAL ATIVO -->
      <div v-else class="max-w-4xl mx-auto space-y-6">
        <!-- Toast de Notificação -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-4 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-4 opacity-0"
        >
          <div
            v-if="toastMessage"
            class="fixed top-4 right-4 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs"
          >
            <span>⚡</span>
            <span>{{ toastMessage }}</span>
          </div>
        </Transition>

        <!-- Header Superior Fixo -->
        <AdminTopHeader
          :slug="slug"
          :tenant-name="tenant?.name || 'Gestão do Estabelecimento'"
          @logout="logout"
        />

        <!-- Navegação de Abas Operacionais -->
        <AdminTabsNav
          v-model="activeTab"
          v-model:active-tab="activeTab"
          :is-service-store="isServiceStore"
          :is-health-store="isHealthStore"
        />

        <!-- CONTEÚDO DAS ABAS -->
        <!-- ABA 1: Cardápio / Catálogo -->
        <AdminCatalogTab
          v-if="activeTab === 'catalog'"
          :categories="categories"
          :is-service-store="isServiceStore"
          :is-product-available="isProductAvailable"
          :get-product-price="getProductPrice"
          @open-price-modal="openPriceModal"
          @edit-price="openPriceModal"
          @toggle-avail="handleProductAvailabilityToggle"
          @toggle-product="handleProductAvailabilityToggle"
          @open-create-modal="isCreateProductOpen = true"
          @create-product="isCreateProductOpen = true"
          @delete-product="handleDeleteProduct"
          @open-options="openOptionsModal"
          @manage-options="openOptionsModal"
        />

        <!-- ABA 2: Especialistas / Agenda (Hub & Pro) -->
        <AdminAgendaTab
          v-else-if="activeTab === 'agenda' && isServiceStore"
          :is-health-store="isHealthStore"
          :professionals-list="professionalsList"
          :store-close-hour="storeCloseHour"
          :selected-agenda-date="selectedAgendaDate"
          :sample-slots="sampleSlots"
          :is-slot-blocked="isSlotBlocked"
          @update:selected-agenda-date="selectedAgendaDate = $event"
          @update:selectedAgendaDate="selectedAgendaDate = $event"
          @create-prof="openCreateProfModal"
          @toggle-prof-avail="handleProfAvailabilityToggle"
          @toggle-prof-day="handleProfDayToggle"
          @change-work-hours="handleProfWorkHoursChange"
          @change-lunch="handleProfLunchChange"
          @delete-prof="handleDeleteProf"
          @toggle-slot="handleSlotToggle"
        />

        <!-- ABA 3: Pix & Contato -->
        <AdminPixContactTab
          v-else-if="activeTab === 'pix_contact'"
          :pix-form="pixForm"
          :pix-config-input="pixForm"
          :contact-form="contactForm"
          :contact-input="contactForm"
          @save-pix="savePixConfig"
          @save-contact="saveContactConfig"
          @save="savePixConfig"
        />

        <!-- ABA 4: Horários & Pausa de Emergência -->
        <AdminHoursTab
          v-else-if="activeTab === 'hours'"
          :weekly-days-config="weeklyDaysConfig"
          :schedule-success-msg="scheduleSuccessMsg"
          :is-emergency-closed="isEmergencyClosed"
          :emergency-message="emergencyMessage"
          @toggle-emergency="toggleEmergencyPause"
          @toggle-day-closed="toggleDayClosed"
          @save-schedule="saveScheduleConfig"
          @save-emergency="saveEmergencyConfig"
        />

        <!-- ABA 5: Delivery & Taxas -->
        <AdminDeliveryTab
          v-else-if="activeTab === 'delivery'"
          :delivery-form="deliveryForm"
          :delivery-success-msg="deliverySuccessMsg"
          :delivery-fee-input="deliveryForm.deliveryFee"
          :min-order-input="deliveryForm.minOrderValue"
          :estimated-time-input="deliveryForm.estimatedTime"
          @update:delivery-fee-input="deliveryForm.deliveryFee = $event"
          @update:min-order-input="deliveryForm.minOrderValue = $event"
          @update:estimated-time-input="deliveryForm.estimatedTime = $event"
          @save="saveDeliveryConfig"
          @save-delivery="saveDeliveryConfig"
        />

        <!-- ABA 6: Comunicado no Topo -->
        <AdminAnnouncementTab
          v-else-if="activeTab === 'announcement'"
          :announcement-form="announcementForm"
          :announcement-success-msg="announcementSuccessMsg"
          :announcement-enabled="announcementForm.enabled"
          :announcement-message="announcementForm.message"
          @update:announcement-enabled="announcementForm.enabled = $event"
          @update:announcement-message="announcementForm.message = $event"
          @save="saveAnnouncementConfig"
          @save-announcement="saveAnnouncementConfig"
        />

        <!-- ABA 7: Segurança & Senha de Acesso -->
        <AdminSecurityTab
          v-else-if="activeTab === 'security'"
          :pin-success-msg="pinSuccessMsg"
          @save-pin="saveNewPin"
        />

        <!-- MODAIS OPERACIONAIS -->
        <AdminPriceModal
          :is-open="isPriceModalOpen"
          :product="editingProduct"
          :product-name="editingProduct?.name || ''"
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
          :is-health-store="isHealthStore"
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
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useMerchantAdmin, type TenantOverrides } from '~/composables/useMerchantAdmin'
import type { Category, Product, DaySchedule } from '~/types'

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

const route = useRoute()
const slug = computed(() => String(route.params.slug || 'hamburgueria-x').toLowerCase())
const { tenant, refresh } = useTenant(slug)
const {
  isAuthenticated,
  isSubmitting,
  errorMessage,
  login,
  logout,
  getOverrides,
  updateProductPrice,
  toggleProductAvailability,
  toggleOptionAvailability,
  createProduct,
  deleteProduct,
  updateWeeklySchedule,
  updateEmergency,
  updateDelivery,
  updateAnnouncement,
  updatePixConfig,
  updateContact,
  changePin,
  createProfessional,
  deleteProfessional,
  toggleProfessionalAvailability,
  toggleProfessionalDay,
  updateProfessionalHours,
  updateProfessionalLunch,
  toggleBlockSlot
} = useMerchantAdmin(slug)

const activeTab = ref<AdminTabKey>('catalog')
const toastMessage = ref('')

function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

const localOverrides = ref<TenantOverrides>({})

function refreshLocalOverrides() {
  localOverrides.value = getOverrides()
}

// 1. Gestão de Login
function handleLogin(pin: string) {
  login(pin)
}

// 2. Catálogo & Preços
const categories = computed<Category[]>(() => {
  const baseCategories = (tenant.value?.categories || []) as Category[]
  const overrides = localOverrides.value
  const deletedIds = overrides.deletedProductIds || []
  const customProducts = overrides.customProducts || []

  return baseCategories.map(cat => {
    const existing = (cat.products || []).filter(p => !deletedIds.includes(p.id))
    const additions = customProducts.filter(p => p.categoryId === cat.id && !deletedIds.includes(p.id))
    return {
      ...cat,
      products: [...existing, ...additions]
    }
  })
})

function getProductPrice(product: Product): number {
  const overridePrice = localOverrides.value?.products?.[product.id]?.price
  return overridePrice !== undefined ? overridePrice : product.price
}

function isProductAvailable(product: Product): boolean {
  const prodOverrides = localOverrides.value?.products
  if (prodOverrides?.[product.id]?.isAvailable !== undefined) {
    return Boolean(prodOverrides[product.id].isAvailable)
  }
  if (product.isAvailable !== undefined) return Boolean(product.isAvailable)
  if ((product as any).available !== undefined) return Boolean((product as any).available)
  return true
}

async function handleProductAvailabilityToggle(productOrList: any, productId?: string) {
  let targetProduct: Product | undefined
  if (typeof productOrList === 'object' && productOrList !== null && 'id' in productOrList && !Array.isArray(productOrList)) {
    targetProduct = productOrList as Product
  } else if (Array.isArray(productOrList) && productId) {
    targetProduct = productOrList.find(p => p.id === productId)
  }
  if (!targetProduct) return
  const currentStatus = isProductAvailable(targetProduct)
  await toggleProductAvailability(targetProduct.id, currentStatus)
  refreshLocalOverrides()
  if (typeof refresh === 'function') {
    await refresh()
  }
  showToast(currentStatus ? `⏸️ ${targetProduct.name} pausado!` : `✅ ${targetProduct.name} ativado!`)
}

const isPriceModalOpen = ref(false)
const editingProduct = ref<Product | null>(null)
const editingProductsList = ref<Product[]>([])
const newPriceInput = ref(0)

function openPriceModal(categoryProductsOrProduct: any, product?: Product) {
  if (Array.isArray(categoryProductsOrProduct) && product) {
    editingProductsList.value = categoryProductsOrProduct
    editingProduct.value = product
  } else if (categoryProductsOrProduct && typeof categoryProductsOrProduct === 'object') {
    editingProduct.value = categoryProductsOrProduct
    editingProductsList.value = [categoryProductsOrProduct]
  }
  if (editingProduct.value) {
    const overridePrice = localOverrides.value?.products?.[editingProduct.value.id]?.price
    newPriceInput.value = overridePrice !== undefined ? overridePrice : editingProduct.value.price
    isPriceModalOpen.value = true
  }
}

// 3. Criação e Exclusão de Produtos
const isCreateProductOpen = ref(false)
const isCreateProfOpen = ref(false)

function handleCreateProductSubmit(form: { name: string; price: number; categoryId: string; description: string }) {
  createProduct({
    name: form.name,
    price: form.price,
    categoryId: form.categoryId,
    description: form.description
  })
  refreshLocalOverrides()
  isCreateProductOpen.value = false
  showToast(`✅ ${form.name} cadastrado na vitrine!`)
}

function handleDeleteProduct(productId: string, productName: string) {
  if (confirm(`Deseja excluir "${productName}" da vitrine?`)) {
    deleteProduct(productId)
    refreshLocalOverrides()
    showToast(`🗑️ ${productName} removido da vitrine!`)
  }
}

// 4. Modais Operacionais de Opcionais & Adicionais
const isOptionsModalOpen = ref(false)
const selectedProductForOptions = ref<Product | null>(null)

function openOptionsModal(product: Product) {
  selectedProductForOptions.value = product
  isOptionsModalOpen.value = true
}

function isOptionPaused(optionId: string): boolean {
  const paused = localOverrides.value.pausedOptionIds || []
  return paused.includes(optionId)
}

function toggleOptionStatus(optionId: string, currentPaused?: boolean) {
  const isPaused = currentPaused !== undefined ? currentPaused : isOptionPaused(optionId)
  toggleOptionAvailability(optionId, isPaused)
  refreshLocalOverrides()
  showToast(isPaused ? 'Adicional reativado!' : 'Adicional pausado em tempo real!')
}

// 5. Verificações de Tipo de Estabelecimento
const isServiceStore = computed(() => {
  if (!tenant.value) return false
  const cat = tenant.value.businessCategory
  return cat === 'hub' || cat === 'pro' || tenant.value.slug === 'barbearia-style' || tenant.value.slug === 'clinica-sorriso'
})

const isHealthStore = computed(() => {
  return tenant.value?.slug === 'clinica-sorriso'
})

const storeCloseHour = computed(() => {
  const hours = tenant.value?.openingHours as any
  return hours?.close || '20:00'
})

// 6. Especialistas & Agenda (Hub & Pro)
const isEmergencyClosed = computed(() => {
  return localOverrides.value.emergency?.isClosed ?? tenant.value?.isEmergencyClosed ?? false
})

const emergencyMessage = computed(() => {
  return localOverrides.value.emergency?.message || tenant.value?.closedEmergencyMessage || ''
})

const professionalsList = computed(() => {
  const baseProfs = (tenant.value?.professionals || []) as any[]
  const profsOverrides = localOverrides.value?.professionals || {}

  return baseProfs.map(p => {
    const ov = profsOverrides[p.id] || {}
    return {
      ...p,
      isAvailable: ov.isAvailable !== undefined ? ov.isAvailable : (p.isAvailable ?? true),
      availableDays: ov.availableDays || p.availableDays || [1, 2, 3, 4, 5, 6],
      workHours: ov.workHours || p.workHours || { start: '09:00', end: '19:00' },
      lunchBreak: ov.lunchBreak || p.lunchBreak || { start: '12:00', end: '13:00', enabled: true }
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
  toggleProfessionalAvailability(profId, currentAvailable)
  refreshLocalOverrides()
  showToast(currentAvailable ? `⏸️ ${name} marcado como folga hoje!` : `✅ ${name} ativado para atendimento!`)
}

function handleProfDayToggle(profId: string, dayIndex: number, name: string) {
  toggleProfessionalDay(profId, dayIndex)
  refreshLocalOverrides()
  showToast(`Escala semanal de ${name} atualizada!`)
}

function handleProfWorkHoursChange(profId: string, workHours: any, name: string) {
  updateProfessionalHours(profId, workHours)
  refreshLocalOverrides()
  showToast(`Horário de expediente de ${name} atualizado!`)
}

function handleProfLunchChange(profId: string, lunchBreak: any, name: string) {
  updateProfessionalLunch(profId, lunchBreak)
  refreshLocalOverrides()
  showToast(`Horário de almoço de ${name} atualizado!`)
}

function handleDeleteProf(profId: string, profName: string) {
  if (confirm(`Deseja excluir "${profName}" da equipe?`)) {
    deleteProfessional(profId)
    refreshLocalOverrides()
    showToast(`🗑️ ${profName} removido da equipe!`)
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

// 7. Bloqueio de Horários na Agenda
function handleSlotToggle(date: string, time: string) {
  const isBlocked = toggleBlockSlot(date, time)
  refreshLocalOverrides()
  showToast(isBlocked ? `Horário ${time} bloqueado!` : `Horário ${time} liberado!`)
}

// 8. Configurações Pix & Contato
const pixForm = ref({
  keyType: 'cpf',
  pixKey: '',
  beneficiary: '',
  city: '',
  allowTestCent: true,
  depositPercentage: 30
})

const contactForm = ref({
  whatsapp: '',
  instagram: ''
})

function loadPixAndContactFromOverrides() {
  const overrides = localOverrides.value || {}
  const tenantPix = tenant.value?.pixConfig as any
  const ovPix = overrides.pix || {}

  pixForm.value = {
    keyType: ovPix.keyType || tenantPix?.keyType || 'cpf',
    pixKey: ovPix.pixKey || ovPix.key || tenantPix?.key || tenantPix?.pixKey || '',
    beneficiary: ovPix.beneficiary || tenantPix?.beneficiary || '',
    city: ovPix.city || tenantPix?.city || '',
    allowTestCent: ovPix.allowTestCent !== undefined ? ovPix.allowTestCent : (tenantPix?.allowTestCent ?? true),
    depositPercentage: ovPix.depositPercentage !== undefined ? ovPix.depositPercentage : (tenantPix?.depositPercentage ?? 30)
  }

  const ovContact = overrides.contact || {}
  contactForm.value = {
    whatsapp: ovContact.whatsapp || tenant.value?.phoneWhatsApp || (tenant.value as any)?.whatsapp || '',
    instagram: ovContact.instagram || (tenant.value as any)?.instagram || ''
  }
}

function savePixConfig() {
  updatePixConfig(pixForm.value)
  refreshLocalOverrides()
  showToast('Configurações Pix salvas com sucesso!')
}

function saveContactConfig() {
  updateContact(contactForm.value)
  refreshLocalOverrides()
  showToast('Contatos salvos com sucesso!')
}

// 9. Horários & Pausa Geral
const weeklyDaysConfig = ref<Array<{ key: string; label: string; closed: boolean; open: string; close: string }>>([])
const scheduleSuccessMsg = ref('')

const defaultDays = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
]

function loadScheduleFromOverrides() {
  const overrides = localOverrides.value || {}
  const baseHours = tenant.value?.openingHours as any
  const ovHours = overrides.openingHours || {}
  const defaultOpen = ovHours.open || baseHours?.open || '09:00'
  const defaultClose = ovHours.close || baseHours?.close || '20:00'

  weeklyDaysConfig.value = defaultDays.map(d => {
    const dayConfig = ovHours[d.key] || baseHours?.[d.key]
    const closed = dayConfig?.closed !== undefined ? Boolean(dayConfig.closed) : false
    const open = dayConfig?.open || defaultOpen
    const close = dayConfig?.close || defaultClose
    return {
      key: d.key,
      label: d.label,
      closed,
      open,
      close
    }
  })
}

function toggleEmergencyPause() {
  const nextVal = !isEmergencyClosed.value
  updateEmergency(nextVal, emergencyMessage.value || '')
  refreshLocalOverrides()
  showToast(nextVal ? 'Loja pausada temporariamente!' : 'Loja reaberta com sucesso!')
}

async function toggleDayClosed(day: any) {
  if (day) {
    await saveScheduleConfig()
  }
}

async function saveScheduleConfig() {
  const scheduleObj: Record<string, DaySchedule> = {}
  for (const d of weeklyDaysConfig.value) {
    scheduleObj[d.key] = {
      open: d.open,
      close: d.close,
      closed: d.closed
    }
  }
  await updateWeeklySchedule(scheduleObj)
  refreshLocalOverrides()
  scheduleSuccessMsg.value = 'Horários atualizados com sucesso!'
  showToast('Horários salvos com sucesso!')
  setTimeout(() => {
    scheduleSuccessMsg.value = ''
  }, 3000)
}

function saveEmergencyConfig(data: { isClosed: boolean; message: string }) {
  updateEmergency(data.isClosed, data.message)
  refreshLocalOverrides()
  showToast(data.isClosed ? 'Loja pausada temporariamente!' : 'Loja reaberta com sucesso!')
}

// 10. Delivery & Taxas
const deliveryForm = ref({
  deliveryFee: 5,
  minOrderValue: 20,
  estimatedTime: '30-45 min'
})
const deliverySuccessMsg = ref('')

function loadDeliveryFromOverrides() {
  const overrides = localOverrides.value || {}
  const tenantDelivery = tenant.value as any
  const ovDelivery = overrides.delivery || {}
  deliveryForm.value = {
    deliveryFee: ovDelivery.deliveryFee ?? (tenantDelivery?.deliveryFeeCents ? tenantDelivery.deliveryFeeCents / 100 : (tenantDelivery?.deliveryFee ?? 5)),
    minOrderValue: ovDelivery.minOrderValue ?? (tenantDelivery?.minOrderValueCents ? tenantDelivery.minOrderValueCents / 100 : (tenantDelivery?.minOrderValue ?? 20)),
    estimatedTime: ovDelivery.estimatedTime || tenantDelivery?.estimatedTime || '30-45 min'
  }
}

function saveDeliveryConfig() {
  updateDelivery(deliveryForm.value.deliveryFee, deliveryForm.value.minOrderValue, deliveryForm.value.estimatedTime)
  refreshLocalOverrides()
  deliverySuccessMsg.value = 'Configurações de entrega salvas com sucesso!'
  showToast('Delivery atualizado!')
  setTimeout(() => {
    deliverySuccessMsg.value = ''
  }, 3000)
}

// 11. Comunicado no Topo
const announcementForm = ref({
  enabled: false,
  message: ''
})
const announcementSuccessMsg = ref('')

function loadAnnouncementFromOverrides() {
  const overrides = localOverrides.value || {}
  const tenantAnnounce = tenant.value as any
  const ovAnnounce = overrides.announcement || {}
  announcementForm.value = {
    enabled: ovAnnounce.enabled ?? tenantAnnounce?.announcementEnabled ?? false,
    message: ovAnnounce.message || tenantAnnounce?.announcementMessage || ''
  }
}

function saveAnnouncementConfig() {
  updateAnnouncement(announcementForm.value.enabled, announcementForm.value.message)
  refreshLocalOverrides()
  announcementSuccessMsg.value = 'Comunicado salvo com sucesso!'
  showToast('Comunicado atualizado!')
  setTimeout(() => {
    announcementSuccessMsg.value = ''
  }, 3000)
}

// 12. Segurança / Troca de PIN
const pinSuccessMsg = ref('')

function saveNewPin(newPin: string) {
  if (changePin(newPin)) {
    pinSuccessMsg.value = 'Senha PIN atualizada com sucesso!'
    showToast('PIN alterado!')
    setTimeout(() => {
      pinSuccessMsg.value = ''
    }, 3000)
  }
}

// Inicialização de ciclo de vida
onMounted(() => {
  refreshLocalOverrides()
  loadScheduleFromOverrides()
  loadPixAndContactFromOverrides()
  loadDeliveryFromOverrides()
  loadAnnouncementFromOverrides()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', refreshLocalOverrides)
    window.addEventListener('alaska_overrides_updated', refreshLocalOverrides)
  }
})

watch(
  () => tenant.value,
  () => {
    loadScheduleFromOverrides()
    loadPixAndContactFromOverrides()
    loadDeliveryFromOverrides()
    loadAnnouncementFromOverrides()
  },
  { deep: true }
)
</script>
