import type { Cnd } from './useCnds'

export type NomeEmpresaModo = 'completo' | 'abreviado' | 'iniciais'

export interface OpcoesNomeArquivo {
  empresa: boolean
  nomeEmpresaModo: NomeEmpresaModo
  cnpj: boolean
  tipo: boolean
  emissao: boolean
  validade: boolean
}

export const criarOpcoesNomeArquivoPadrao = (): OpcoesNomeArquivo => ({
  empresa: true,
  nomeEmpresaModo: 'abreviado',
  cnpj: true,
  tipo: true,
  emissao: false,
  validade: true,
})

const DIACRITICS_REGEX = new RegExp('[\\u0300-\\u036f]', 'g')

export const sanitizarNomeArquivo = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .replace(/[/\\?%*:|"<>]/g, '')
    .trim()
}

export const formatDateFile = (dateString: string | null): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR').replace(/\//g, '-')
}

const abreviarEmpresa = (name: string): string => {
  const palavras = name.trim().split(/\s+/)
  const abreviado = palavras.slice(0, 3).join(' ')
  return abreviado.length > 30 ? abreviado.slice(0, 30) : abreviado
}

const iniciaisEmpresa = (name: string): string => {
  return name
    .trim()
    .split(/\s+/)
    .map((palavra) => palavra[0])
    .join('')
    .toUpperCase()
    .slice(0, 8)
}

export const nomeEmpresaFormatado = (name: string, modo: NomeEmpresaModo): string => {
  if (modo === 'completo') return name
  if (modo === 'iniciais') return iniciaisEmpresa(name)
  return abreviarEmpresa(name)
}

export const extensaoDoArquivo = (fileName: string | null): string => {
  const match = (fileName || '').match(/\.[a-zA-Z0-9]+$/)
  return match ? match[0] : '.pdf'
}

type CndParaNome = Pick<Cnd, 'fornecedor' | 'cndtype' | 'emissao' | 'validade'>

export const gerarNomeArquivo = (cnd: CndParaNome, opcoes: OpcoesNomeArquivo): string => {
  const partes: string[] = []

  if (opcoes.empresa) partes.push(nomeEmpresaFormatado(cnd.fornecedor.name, opcoes.nomeEmpresaModo))
  if (opcoes.cnpj) partes.push(cnd.fornecedor.cnpj.replace(/\D/g, ''))
  if (opcoes.tipo && cnd.cndtype?.name) partes.push(cnd.cndtype.name.toUpperCase())
  if (opcoes.emissao && cnd.emissao) partes.push(`EMISSAO-${formatDateFile(cnd.emissao)}`)
  if (opcoes.validade && cnd.validade) partes.push(`VALIDADE-${formatDateFile(cnd.validade)}`)

  const base = sanitizarNomeArquivo(partes.join('_').replace(/\s+/g, '-'))

  return base || 'documento'
}

export const deduplicarNomes = (nomes: string[]): string[] => {
  const contagem = new Map<string, number>()

  return nomes.map((nome) => {
    const usos = contagem.get(nome) ?? 0
    contagem.set(nome, usos + 1)

    return usos === 0 ? nome : `${nome}-${usos + 1}`
  })
}

export const gerarNomesUnicos = (cnds: Cnd[], opcoes: OpcoesNomeArquivo): { cnd: Cnd; fileName: string }[] => {
  const bases = deduplicarNomes(cnds.map((cnd) => gerarNomeArquivo(cnd, opcoes)))

  return cnds.map((cnd, index) => ({
    cnd,
    fileName: `${bases[index]}${extensaoDoArquivo(cnd.file_name)}`,
  }))
}
