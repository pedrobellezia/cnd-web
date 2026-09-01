import { mockFornecedores, normalizeMockCnpj } from '../../mocks/fornecedores'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const formData = await readFormData(event)

  if (config.mockApi) {
    const files = formData.getAll('file').filter((f): f is File => f instanceof File)

    return files.map((file) => {
      const isPdf = file.type === 'application/pdf'

      if (!isPdf) {
        return {
          file: file.name,
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: `O arquivo "${file.name}" não é um PDF válido`,
          },
        }
      }

      const cnpjAleatorio = normalizeMockCnpj(
        String(Math.floor(10_000_000_000_000 + Math.random() * 89_999_999_999_999)),
      )

      const novoFornecedor = {
        cnpj: cnpjAleatorio,
        name: file.name.replace(/\.pdf$/i, '').trim().toUpperCase() || 'FORNECEDOR MOCK',
        uf: 'SP',
        municipio: 'SAO PAULO',
        cnd: [],
      }

      mockFornecedores.push(novoFornecedor)

      return {
        file: file.name,
        success: true,
        data: {
          cnpj: novoFornecedor.cnpj,
          name: novoFornecedor.name,
          uf: novoFornecedor.uf,
          municipio: novoFornecedor.municipio,
        },
      }
    })
  }

  return await $fetch(`${config.public.apiUrl}/fornecedor/pdf`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
  })
})
