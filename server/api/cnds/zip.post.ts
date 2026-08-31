import { zipSync } from 'fflate'

interface ZipItem {
  sourceFileName: string
  downloadName: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ items: ZipItem[] }>(event)

  if (!body?.items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo informado' })
  }

  const files: Record<string, Uint8Array> = {}
  const falhas: string[] = []

  for (const item of body.items) {
    const response = await fetch(`${config.public.apiUrl}/public/${item.sourceFileName}`)

    if (!response.ok) {
      falhas.push(item.sourceFileName)
      continue
    }

    files[item.downloadName] = new Uint8Array(await response.arrayBuffer())
  }

  if (falhas.length > 0) {
    throw createError({
      statusCode: 502,
      statusMessage: `Falha ao baixar: ${falhas.join(', ')}`,
    })
  }

  setResponseHeader(event, 'Content-Type', 'application/zip')
  setResponseHeader(event, 'Content-Disposition', 'attachment; filename="cnds.zip"')

  return zipSync(files)
})
