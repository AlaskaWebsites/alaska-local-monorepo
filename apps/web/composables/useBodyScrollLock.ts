// composables/useBodyScrollLock.ts
import { watch, onUnmounted, getCurrentInstance, type Ref } from 'vue'

export function useBodyScrollLock(isLocked: Ref<boolean>) {
    const lock = () => {
        if (typeof document !== 'undefined') {
            document.body.classList.add('overflow-hidden')
        }
    }

    const unlock = () => {
        if (typeof document !== 'undefined') {
            document.body.classList.remove('overflow-hidden')
        }
    }

    watch(
        isLocked,
        (locked) => {
            if (locked) {
                lock()
            } else {
                unlock()
            }
        },
        { immediate: true }
    )

    if (getCurrentInstance()) {
        onUnmounted(() => {
            unlock()
        })
    }
}