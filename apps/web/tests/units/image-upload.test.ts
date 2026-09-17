import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useImageUpload } from '../../composables/useImageUpload'

// Simulação das variáveis públicas do Nuxt RuntimeConfig
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    cloudinaryCloudName: 'gf5j6cdu',
    cloudinaryUploadPreset: 'alaska_products'
  }
}))

describe('Unit: useImageUpload (Cloudinary Client-Direct)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('deve realizar upload e retornar URL otimizada com transformações automáticas seguras', async () => {
    const fakeFile = new File(['mock-image-content'], 'hamburguer.jpg', { type: 'image/jpeg' })
    const mockCloudinaryUrl = 'https://res.cloudinary.com/gf5j6cdu/image/upload/v1726530000/alaska-products/hamburguer.jpg'

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        secure_url: mockCloudinaryUrl,
        public_id: 'alaska-products/hamburguer',
        width: 1200,
        height: 1200
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const { uploadImage, isUploading, uploadError } = useImageUpload()
    const result = await uploadImage(fakeFile)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.cloudinary.com/v1_1/gf5j6cdu/image/upload')
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)

    expect(result).not.toBeNull()
    expect(result?.url).toBe(
      'https://res.cloudinary.com/gf5j6cdu/image/upload/c_fill,w_600,h_600,f_auto,q_auto/v1726530000/alaska-products/hamburguer.jpg'
    )
    expect(result?.publicId).toBe('alaska-products/hamburguer')
    expect(isUploading.value).toBe(false)
    expect(uploadError.value).toBeNull()
  })

  it('deve capturar mensagens de erro amigáveis retornadas pela API do Cloudinary', async () => {
    const fakeFile = new File(['invalid'], 'bad.png', { type: 'image/png' })

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        error: { message: 'Invalid upload preset' }
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const { uploadImage, isUploading, uploadError } = useImageUpload()
    const result = await uploadImage(fakeFile)

    expect(result).toBeNull()
    expect(isUploading.value).toBe(false)
    expect(uploadError.value).toBe('Invalid upload preset')
  })
})
