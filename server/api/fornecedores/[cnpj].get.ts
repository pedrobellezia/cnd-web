export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cnpj = getRouterParam(event, 'cnpj')
  const query = getQuery(event)

  return await $fetch(`${config.public.apiUrl}${config.apiBasePath}/${cnpj}`, {
    query,
    headers: {
      'x-api-key': config.apiKey,
    },
  })
})
