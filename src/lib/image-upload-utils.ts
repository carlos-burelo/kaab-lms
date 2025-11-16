interface UploadImageResponse {
  url: string
}

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('Error al subir la imagen')
  }

  const data: UploadImageResponse = await response.json()
  return data.url
}

export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024

  return validTypes.includes(file.type) && file.size <= maxSize
}

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
