export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  return await $fetch(`${config.public.apiUrl}${config.apiBasePath}`, {
    query,
    headers: {
      'x-api-key': config.apiKey,
    },
  })
})
