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
          :is-service-store="isServiceStore"
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
          :contact-form="contactForm"
          @save-pix="savePixConfig"
          @save-contact="saveContactConfig"
        />

        <!-- ABA 4: Horários & Pausa de Emergência -->
        <AdminHoursTab
          v-else-if="activeTab === 'hours'"
          :weekly-days-config="weeklyDaysConfig"
          :schedule-success-msg="scheduleSuccessMsg"
          :is-emergency-closed="isEmergencyClosed"
          :emergency-message="emergencyMessage"
          @save-schedule="saveScheduleConfig"
          @save-emergency="saveEmergencyConfig"
        />

        <!-- ABA 5: Delivery & Taxas -->
        <AdminDeliveryTab
          v-else-if="activeTab === 'delivery'"
          :delivery-form="deliveryForm"
          :delivery-success-msg="deliverySuccessMsg"
          @save="saveDeliveryConfig"
        />

        <!-- ABA 6: Comunicado no Topo -->
        <AdminAnnouncementTab
          v-else-if="activeTab === 'announcement'"
          :announcement-form="announcementForm"
          :announcement-success-msg="announcementSuccessMsg"
          @save="saveAnnouncementConfig"
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
          :product-name="editingProduct?.name || ''"
          :initial-price="newPriceInput"
          @close="isPriceModalOpen = false"
          @confirm="confirmPriceEdit"
        />

        <AdminCreateProductModal
          :is-open="isCreateProductOpen"
          :categories="categories"
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

      <!-- Fallback SSR / Loading -->
      <template #fallback>
        <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div class="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
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
  isSubmitting,
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
  const prodOverrides = localOverrides.value?.products
  if (prodOverrides?.[product.id]?.isAvailable !== undefined) {
    return Boolean(prodOverrides[product.id].isAvailable)
  }
  if (product.isAvailable !== undefined) return Boolean(product.isAvailable)
  if ((product as any).available !== undefined) return Boolean((product as any).available)
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
  if (editingProduct.value) {
    await updateProductPrice(editingProductsList.value, editingProduct.value.id, newPrice)
    refreshLocalOverrides()
    if (typeof refresh === 'function') {
      await refresh()
    }
    isPriceModalOpen.value = false
    showToast(`Preço de ${editingProduct.value.name} atualizado!`)
  }
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

function toggleOptionStatus(optionId: string, currentPaused: boolean) {
  toggleOptionAvailability(optionId, currentPaused)
  refreshLocalOverrides()
  showToast(currentPaused ? 'Adicional reativado!' : 'Adicional pausado em tempo real!')
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
  if (confirm(`Deseja excluir "${profName}" da equipe?`)) {
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
  deliveryFee: 0,
  minOrderValue: 0,
  estimatedTime: '30-45 min'
})
const deliverySuccessMsg = ref('')

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
</script>
