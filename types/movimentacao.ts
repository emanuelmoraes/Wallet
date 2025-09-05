export type TipoOperacao = 'compra' | 'venda' | 'subscricao';
export type SegmentoMovimentacao = 'acao' | 'fii' | 'fi_infra' | 'etf' | 'renda_fixa' | 'cripto';

export interface Movimentacao {
  id: number;
  ativo: string; // Ticker do ativo
  quantidade: number;
  segmento: SegmentoMovimentacao;
  data: string;
  valorUnitario: number;
  valorTotal: number;
  operacao: TipoOperacao;
  observacao?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovimentacaoInput {
  ativo: string;
  quantidade: number;
  segmento: SegmentoMovimentacao;
  data: string;
  valorUnitario: number;
  operacao: TipoOperacao;
  observacao?: string;
}

export interface UpdateMovimentacaoInput {
  id: number;
  ativo: string;
  quantidade: number;
  segmento: SegmentoMovimentacao;
  data: string;
  valorUnitario: number;
  operacao: TipoOperacao;
  observacao?: string;
}

export interface MovimentacaoFilter {
  ativo?: string;
  segmento?: SegmentoMovimentacao;
  operacao?: TipoOperacao;
  dataInicio?: string;
  dataFim?: string;
  valorMinimo?: number;
  valorMaximo?: number;
}

export interface MovimentacaoStats {
  totalInvestido: number;
  totalRecebido: number;
  saldoLiquido: number;
  totalOperacoes: number;
  operacoesPorTipo: {
    compra: number;
    venda: number;
    subscricao: number;
  };
  volumeTotal: number;
}
