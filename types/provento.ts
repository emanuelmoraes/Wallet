export type TipoProvento = 'rendimento' | 'jcp' | 'dividendo';

export interface Provento {
  id: number;
  ativoTicker: string;
  ativoNome: string;
  data: string;
  valor: number;
  tipo: TipoProvento;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProventoInput {
  ativoTicker: string;
  data: string;
  valor: number;
  tipo: TipoProvento;
  observacoes?: string;
}

export interface UpdateProventoInput {
  id: number;
  ativoTicker: string;
  data: string;
  valor: number;
  tipo: TipoProvento;
  observacoes?: string;
}

export interface ProventoFilter {
  ativoTicker?: string;
  tipo?: TipoProvento;
  dataInicio?: string;
  dataFim?: string;
  valorMinimo?: number;
  valorMaximo?: number;
}

export interface ProventoStats {
  totalRecebido: number;
  totalPorTipo: {
    rendimento: number;
    jcp: number;
    dividendo: number;
  };
  proventosMes: number;
  proventosAno: number;
}
