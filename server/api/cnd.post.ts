export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const formData = await readFormData(event)

  if (config.mockApi) {
    const files = formData.getAll('file').filter((f): f is File => f instanceof File)

    return files.map((file) => {
      const isPdf = file.type === 'application/pdf'

      return isPdf
        ? { file: file.name, success: true }
        : {
            file: file.name,
            success: false,
            error: { type: 'VALIDATION_ERROR', message: `O arquivo "${file.name}" não é um PDF válido` },
          }
    })
  }

  return await $fetch(`${config.public.apiUrl}${config.apiBasePath}`, {
    method: 'POST',
    body: formData,
    headers: {
      'x-api-key': config.apiKey,
    },
  })
})
