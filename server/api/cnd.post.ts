export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const formData = await readFormData(event)

  return await $fetch(`${config.public.apiUrl}${config.apiBasePath}`, {
    method: 'POST',
    body: formData,
    headers: {
      'x-api-key': config.apiKey,
    },
  })
})
