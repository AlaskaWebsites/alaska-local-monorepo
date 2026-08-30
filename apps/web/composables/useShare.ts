// composables/useShare.ts
import { ref, isRef, type Ref } from 'vue'
import type { Tenant } from '~/types/tenant'

export function useShare(tenantRef?: Ref<Tenant | null | undefined> | Tenant | null) {
    const isCopied = ref(false)

    const shareStore = async () => {
        if (!import.meta.client) return
        const tenant = isRef(tenantRef) ? tenantRef.value : tenantRef
        if (!tenant) return

        const shareUrl =
            window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? `https://alaskalocal.vercel.app/${tenant.slug}`
                : window.location.href

        const shareData = {
            title: tenant.name,
            text: tenant.description || `Confira o cardápio e faça seu pedido na ${tenant.name}!`,
            url: shareUrl,
        }

        // Tenta Web Share API nativa (mobile)
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData)
                return
            } catch (err: any) {
                if (err.name === 'AbortError') return
            }
        }

        // Fallback Clipboard (Desktop)
        try {
            await navigator.clipboard.writeText(shareUrl)
            isCopied.value = true
            setTimeout(() => {
                isCopied.value = false
            }, 2500)
        } catch (err) {
            console.error('Erro ao copiar link:', err)
        }
    }

    return {
        isCopied,
        shareStore,
    }
}
