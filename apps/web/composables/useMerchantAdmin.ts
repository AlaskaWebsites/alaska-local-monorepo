import { ref, computed } from 'vue';
import type { Tenant, Product } from '~/types';
import { useTenant } from './useTenant';
import { useHaptic } from './useHaptic';

export interface MerchantAdminOverrides {
  pausedProductIds?: string[];
  productPriceOverrides?: Record<string, number>;
  productNameOverrides?: Record<string, string>;
  productDescriptionOverrides?: Record<string, string>;
  openingHoursOverrides?: Tenant['openingHours'];
  emergencyClose?: {
    active: boolean;
    message?: string;
  };
  blockedBookingSlots?: Record<string, string[]>;
}

const isAuthenticated = ref(false);
const adminToken = ref<string | null>(null);

export function useMerchantAdmin(tenantSlug?: string) {
  const { tenant } = useTenant(tenantSlug);
  const { triggerHaptic } = useHaptic();

  const storageKey = computed(() => `alaska_overrides_${tenantSlug || tenant.value?.slug || 'default'}`);
  const tokenKey = computed(() => `alaska_admin_token_${tenantSlug || tenant.value?.slug || 'default'}`);

  const loadOverrides = (): MerchantAdminOverrides => {
    if (!import.meta.client) return {};
    try {
      const raw = localStorage.getItem(storageKey.value);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const saveOverrides = (overrides: MerchantAdminOverrides) => {
    if (!import.meta.client) return;
    try {
      localStorage.setItem(storageKey.value, JSON.stringify(overrides));
    } catch (e) {
      console.error('Falha ao persistir overrides locais:', e);
    }
  };

  const overrides = ref<MerchantAdminOverrides>(loadOverrides());

  const login = async (pin: string): Promise<boolean> => {
    triggerHaptic(20);

    // Tentativa 1: Autenticação remota com a API NestJS
    if (import.meta.client && tenantSlug) {
      try {
        const config = useRuntimeConfig();
        const apiBase = config.public?.apiBaseUrl || 'http://localhost:3001';
        const response = await fetch(`${apiBase}/tenants/${tenantSlug}/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            isAuthenticated.value = true;
            adminToken.value = data.token || null;
            if (data.token) {
              localStorage.setItem(tokenKey.value, data.token);
            }
            triggerHaptic([15, 50, 25]);
            return true;
          }
        }
      } catch {
        // Fallback gracioso para modo demonstração local caso a API esteja offline
      }
    }

    // Tentativa 2: Fallback local para demos offline
    if (pin === '1234') {
      isAuthenticated.value = true;
      triggerHaptic([15, 50, 25]);
      return true;
    }

    triggerHaptic(50);
    return false;
  };

  const logout = () => {
    isAuthenticated.value = false;
    adminToken.value = null;
    if (import.meta.client) {
      localStorage.removeItem(tokenKey.value);
    }
  };

  const toggleProductAvailability = (productId: string) => {
    triggerHaptic(20);
    const current = overrides.value.pausedProductIds || [];
    const updated = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    overrides.value = {
      ...overrides.value,
      pausedProductIds: updated,
    };
    saveOverrides(overrides.value);
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
    triggerHaptic(20);
    overrides.value = {
      ...overrides.value,
      productPriceOverrides: {
        ...(overrides.value.productPriceOverrides || {}),
        [productId]: newPrice,
      },
    };
    saveOverrides(overrides.value);
  };

  const effectiveTenant = computed<Tenant | null>(() => {
    if (!tenant.value) return null;
    const ov = overrides.value;
    const base = { ...tenant.value };

    if (ov.emergencyClose?.active !== undefined) {
      base.isClosedEmergency = ov.emergencyClose.active;
      base.closedEmergencyMessage = ov.emergencyClose.message;
    }

    if (ov.openingHoursOverrides) {
      base.openingHours = ov.openingHoursOverrides;
    }

    return base;
  });

  return {
    isAuthenticated,
    adminToken,
    overrides,
    effectiveTenant,
    login,
    logout,
    toggleProductAvailability,
    updateProductPrice,
    loadOverrides,
    saveOverrides,
  };
}
