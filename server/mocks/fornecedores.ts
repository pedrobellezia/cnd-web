export const cndTypes = ['federal', 'fgts', 'trabalhista', 'estadual', 'municipal'] as const

export interface MockCnd {
  tipo: string
  file_name: string | null
  validade: string | null
  emissao: string | null
  status: string | null
}

export interface MockFornecedor {
  cnpj: string
  name: string
  uf: string
  municipio: string
  cnd: MockCnd[]
}

function cnd(tipo: string, status: MockCnd['status'], diasValidade: number | null): MockCnd {
  const isRegular = status === 'regular' && diasValidade !== null

  return {
    tipo,
    file_name: isRegular ? `${tipo}-mock.pdf` : null,
    validade: isRegular
      ? new Date(Date.now() + diasValidade! * 86_400_000).toISOString()
      : null,
    emissao: isRegular
      ? new Date(Date.now() - 5 * 86_400_000).toISOString()
      : null,
    status,
  }
}

export const mockFornecedores: MockFornecedor[] = [
  {
    cnpj: '11222333000181',
    name: 'Construtora Alfa Ltda',
    uf: 'SP',
    municipio: 'SAO PAULO',
    cnd: [
      cnd('federal', 'em desenvolvimento', null),
      cnd('fgts', 'regular', 25),
      cnd('trabalhista', 'regular', 90),
      cnd('estadual', 'irregular', null),
      cnd('municipal', 'regular', -10),
    ],
  },
  {
    cnpj: '22333444000162',
    name: 'Beta Engenharia S.A.',
    uf: 'RJ',
    municipio: 'RIO DE JANEIRO',
    cnd: [
      cnd('federal', 'em desenvolvimento', null),
      cnd('fgts', 'regular', 3),
      cnd('trabalhista', 'error', null),
      cnd('estadual', 'em desenvolvimento', null),
      cnd('municipal', 'regular', 40),
    ],
  },
  {
    cnpj: '33444555000143',
    name: 'Gama Serviços Industriais Ltda',
    uf: 'MG',
    municipio: 'BELO HORIZONTE',
    cnd: [
      cnd('federal', 'em desenvolvimento', null),
      cnd('fgts', 'irregular', null),
      cnd('trabalhista', 'regular', 60),
      cnd('estadual', 'regular', 10),
      cnd('municipal', 'em desenvolvimento', null),
    ],
  },
  {
    cnpj: '44555666000124',
    name: 'Delta Transportes e Logística',
    uf: 'PR',
    municipio: 'CURITIBA',
    cnd: [
      cnd('federal', 'em desenvolvimento', null),
      cnd('fgts', 'regular', 120),
      cnd('trabalhista', 'regular', 45),
      cnd('estadual', 'regular', 8),
      cnd('municipal', 'regular', 30),
    ],
  },
  {
    cnpj: '55666777000105',
    name: 'Epsilon Comércio de Materiais',
    uf: 'RS',
    municipio: 'PORTO ALEGRE',
    cnd: [
      cnd('federal', 'em desenvolvimento', null),
      cnd('fgts', 'error', null),
      cnd('trabalhista', 'error', null),
      cnd('estadual', 'irregular', null),
      cnd('municipal', 'regular', 5),
    ],
  },
  {
    cnpj: '66777888000186',
    name: 'Zeta Incorporadora Ltda',
    uf: 'SP',
    municipio: 'CAMPINAS',
    cnd: [
      cnd('federal', 'em desenvolvimento', null),
      cnd('fgts', 'regular', 12),
      cnd('trabalhista', 'regular', 12),
      cnd('estadual', 'regular', 12),
      cnd('municipal', 'regular', 12),
    ],
  },
]

export function normalizeMockCnpj(value: string): string {
  return value.replace(/\D/g, '')
}
