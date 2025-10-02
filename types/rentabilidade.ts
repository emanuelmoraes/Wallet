export interface RentabilidadeData {
  ativo: string; // ticker do ativo
  quantidade: number;
  precoMedio: number;
  precoAtual: number;
  investido: number; // precoMedio * quantidade
  atual: number; // precoAtual * quantidade
  lucroOuPrejuizo: number; // atual - investido
  percentualLucroOuPrejuizo: number; // (atual / investido) - 1
  proventos: number; // total de proventos recebidos
  rentabilidadeComProventos: number; // ((atual + proventos) / investido) - 1
  segmento: string; // informação do ativo
}

export interface RentabilidadeStats {
  totalInvestido: number;
  valorAtual: number;
  totalProventos: number;
  lucroOuPrejuizoTotal: number;
  percentualTotal: number;
  rentabilidadeTotalComProventos: number;
  totalAtivos: number;
}

export interface PrecoAtualInput {
  ticker: string;
  precoAtual: number;
}