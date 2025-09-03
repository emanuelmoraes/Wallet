export interface Ativo {
  id: number;
  ticker: string;
  nome: string;
  tipo: 'acao' | 'fii' | 'renda_fixa' | 'cripto';
  preco: number;
  quantidade: number;
  valorTotal: number;
  segmento?: string;
  administrador?: string;
  status: 'ativo' | 'inativo';
  site?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAtivoInput {
  ticker: string;
  nome: string;
  tipo: 'acao' | 'fii' | 'renda_fixa' | 'cripto';
  preco: number;
  quantidade: number;
  segmento?: string;
  administrador?: string;
  status: 'ativo' | 'inativo';
  site?: string;
  observacoes?: string;
}

export interface UpdateAtivoInput {
  id: number;
  ticker: string;
  nome: string;
  tipo: 'acao' | 'fii' | 'renda_fixa' | 'cripto';
  preco: number;
  quantidade: number;
  segmento?: string;
  administrador?: string;
  status: 'ativo' | 'inativo';
  site?: string;
  observacoes?: string;
}

export interface PortfolioStats {
  valorTotal: number;
  rendimentoTotal: number;
  rendimentoPercentual: number;
  ativosTotal: number;
}

export interface DistribuicaoTipo {
  tipo: string;
  valor: number;
  percentual: number;
  quantidade: number;
}

export interface DistribuicaoSegmento {
  segmento: string;
  valor: number;
  percentual: number;
  quantidade: number;
}

export interface HistoricoPreco {
  id: number;
  ativoId: number;
  preco: number;
  data: string;
  fonte?: string;
}

export interface Rendimento {
  id: number;
  ativoId: number;
  valor: number;
  tipo: 'Dividendo' | 'JCP' | 'Rendimento' | 'Amortização';
  dataComExData: string;
  dataPagamento: string;
  observacoes?: string;
}
