import { ref } from 'vue'

export interface UploadResult {
  url: string
  publicId?: string
  width?: number
  height?: number
}

export function useImageUpload() {
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)
  const uploadProgress = ref(0)

  async function uploadImage(file: File): Promise<UploadResult | null> {
    isUploading.value = true
    uploadError.value = null
    uploadProgress.value = 0

    try {
      const config = useRuntimeConfig()
      const cloudName = config.public.cloudinaryCloudName || 'gf5j6cdu'
      const uploadPreset = config.public.cloudinaryUploadPreset || 'alaska_products'

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      formData.append('folder', 'alaska-products')

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        let errorMsg = `Falha no upload (${response.status})`
        try {
          const errData = await response.json()
          if (errData?.error?.message) {
            errorMsg = errData.error.message
          }
        } catch {
          // fallback to generic status text
        }
        throw new Error(errorMsg)
      }

      const data = await response.json()

      // Aplica transformações automáticas para vitrine (f_auto, q_auto, corte inteligente w=600, h=600)
      const secureUrl = data.secure_url as string
      const optimizedUrl = secureUrl.includes('/image/upload/')
        ? secureUrl.replace(
            '/image/upload/',
            '/image/upload/c_fill,g_auto,w_600,h_600,f_auto,q_auto/'
          )
        : secureUrl

      return {
        url: optimizedUrl,
        publicId: data.public_id,
        width: data.width,
        height: data.height
      }
    } catch (err: any) {
      uploadError.value = err.message || 'Erro ao enviar imagem'
      return null
    } finally {
      isUploading.value = false
    }
  }

  return {
    uploadImage,
    isUploading,
    uploadError,
    uploadProgress
  }
}
