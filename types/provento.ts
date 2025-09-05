export type TipoProvento = 'rendimento' | 'jcp' | 'dividendo';

export interface Provento {
  id: number;
  ativoId: number;
  ativoTicker: string; // Para facilitar exibição
  ativoNome: string; // Para facilitar exibição
  data: string;
  valor: number;
  tipo: TipoProvento;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProventoInput {
  ativoId: number;
  data: string;
  valor: number;
  tipo: TipoProvento;
  observacoes?: string;
}

export interface UpdateProventoInput {
  id: number;
  ativoId: number;
  data: string;
  valor: number;
  tipo: TipoProvento;
  observacoes?: string;
}

export interface ProventoFilter {
  ativoId?: number;
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
