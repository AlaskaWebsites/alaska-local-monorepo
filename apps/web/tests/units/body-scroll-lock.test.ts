// tests/units/body-scroll-lock.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'

describe('Composable useBodyScrollLock (Trava de Rolagem de Fundo)', () => {
    let mockClassList: Set<string>

    beforeEach(() => {
        mockClassList = new Set()

        // Mock seguro do document.body para ambiente Node.js
        globalThis.document = {
            body: {
                classList: {
                    add: (cls: string) => mockClassList.add(cls),
                    remove: (cls: string) => mockClassList.delete(cls),
                    contains: (cls: string) => mockClassList.has(cls),
                },
            },
        } as any
    })

    it('deve adicionar a classe overflow-hidden no body quando isLocked for true', async () => {
        const isLocked = ref(false)
        useBodyScrollLock(isLocked)

        // Inicialmente fechado
        expect(document.body.classList.contains('overflow-hidden')).toBe(false)

        // Ao abrir o modal
        isLocked.value = true
        await nextTick()
        expect(document.body.classList.contains('overflow-hidden')).toBe(true)

        // Ao fechar o modal
        isLocked.value = false
        await nextTick()
        expect(document.body.classList.contains('overflow-hidden')).toBe(false)
    })
})