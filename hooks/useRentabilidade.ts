import { databaseService } from '@/services/database';
import { Movimentacao } from '@/types/movimentacao';
import { Provento } from '@/types/provento';
import { PrecoAtualInput, RentabilidadeData, RentabilidadeStats } from '@/types/rentabilidade';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface UseRentabilidadeReturn {
  // Data
  rentabilidadeData: RentabilidadeData[];
  stats: RentabilidadeStats | null;
  precosAtuais: Map<string, number>;
  
  // Loading states
  loading: boolean;
  updating: boolean;
  
  // Actions
  refreshData: () => Promise<void>;
  updatePrecoAtual: (input: PrecoAtualInput) => Promise<boolean>;
  updateMultiplosPrecos: (precos: PrecoAtualInput[]) => Promise<boolean>;
  
  // Utility
  getRentabilidadeByAtivo: (ativo: string) => RentabilidadeData | undefined;
}

export const useRentabilidade = (): UseRentabilidadeReturn => {
  const [rentabilidadeData, setRentabilidadeData] = useState<RentabilidadeData[]>([]);
  const [stats, setStats] = useState<RentabilidadeStats | null>(null);
  const [precosAtuais, setPrecosAtuais] = useState<Map<string, number>>(new Map());
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Inicialização do banco de dados
  const initializeDatabase = useCallback(async () => {
    if (initialized) return;
    
    try {
      await databaseService.init();
      setInitialized(true);
      console.log('✅ Hook useRentabilidade: Banco inicializado');
    } catch (error) {
      console.error('❌ Hook useRentabilidade: Erro ao inicializar banco:', error);
      Alert.alert('Erro', 'Falha ao inicializar banco de dados');
    }
  }, [initialized]);

  // Função para calcular preço médio de compras de um ativo
  const calcularPrecoMedio = useCallback((movimentacoes: Movimentacao[], ativo: string): number => {
    const compras = movimentacoes.filter(mov => 
      mov.ticker.toLowerCase() === ativo.toLowerCase() && mov.operacao === 'compra'
    );
    
    if (compras.length === 0) return 0;

    const totalValor = compras.reduce((sum, mov) => sum + (mov.valorUnitario * mov.quantidade), 0);
    const totalQuantidade = compras.reduce((sum, mov) => sum + mov.quantidade, 0);
    
    return totalQuantidade > 0 ? totalValor / totalQuantidade : 0;
  }, []);

  // Função para calcular quantidade total baseada nas movimentações
  const calcularQuantidadeTotal = useCallback((movimentacoes: Movimentacao[], ativo: string): number => {
    const movimentacoesAtivo = movimentacoes.filter(mov => 
      mov.ticker.toLowerCase() === ativo.toLowerCase()
    );
    
    let quantidade = 0;
    for (const mov of movimentacoesAtivo) {
      if (mov.operacao === 'compra') {
        quantidade += mov.quantidade;
      } else if (mov.operacao === 'venda') {
        quantidade -= mov.quantidade;
      }
    }
    
    return Math.max(0, quantidade); // Não permitir quantidade negativa
  }, []);

  // Função para calcular total de proventos de um ativo
  const calcularTotalProventos = useCallback((proventos: Provento[], ticker: string): number => {
    return proventos
      .filter(provento => provento.ativoTicker === ticker)
      .reduce((sum, provento) => sum + provento.valor, 0);
  }, []);

  // Função para processar dados de rentabilidade
  const processarDadosRentabilidade = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar todos os dados necessários
      const [ativos, movimentacoes, proventos] = await Promise.all([
        databaseService.getAtivos(),
        databaseService.getMovimentacoes(),
        databaseService.getProventos()
      ]);

      const dadosRentabilidade: RentabilidadeData[] = [];
      let totalInvestido = 0;
      let valorAtualTotal = 0;
      let totalProventosGeral = 0;

      // Processar cada ativo
      for (const ativo of ativos) {
        const precoMedio = calcularPrecoMedio(movimentacoes, ativo.ticker);
        const quantidadeTotal = calcularQuantidadeTotal(movimentacoes, ativo.ticker);
        const precoAtual = precosAtuais.get(ativo.ticker) || ativo.preco; // Usar preço atual se disponível, senão usar preço do cadastro
        const totalProventos = calcularTotalProventos(proventos, ativo.ticker);
        
        const investido = precoMedio * quantidadeTotal;
        const atual = precoAtual * quantidadeTotal;
        const lucroOuPrejuizo = atual - investido;
        const percentualLucroOuPrejuizo = investido > 0 ? (atual / investido) - 1 : 0;
        const rentabilidadeComProventos = investido > 0 ? ((atual + totalProventos) / investido) - 1 : 0;

        dadosRentabilidade.push({
          ativo: ativo.ticker,
          quantidade: quantidadeTotal,
          precoMedio,
          precoAtual,
          investido,
          atual,
          lucroOuPrejuizo,
          percentualLucroOuPrejuizo,
          proventos: totalProventos,
          rentabilidadeComProventos,
          segmento: ativo.segmento || 'N/A'
        });

        totalInvestido += investido;
        valorAtualTotal += atual;
        totalProventosGeral += totalProventos;
      }

      // Calcular estatísticas gerais
      const lucroOuPrejuizoTotal = valorAtualTotal - totalInvestido;
      const percentualTotal = totalInvestido > 0 ? (valorAtualTotal / totalInvestido) - 1 : 0;
      const rentabilidadeTotalComProventos = totalInvestido > 0 ? ((valorAtualTotal + totalProventosGeral) / totalInvestido) - 1 : 0;

      const statsCalculadas: RentabilidadeStats = {
        totalInvestido,
        valorAtual: valorAtualTotal,
        totalProventos: totalProventosGeral,
        lucroOuPrejuizoTotal,
        percentualTotal,
        rentabilidadeTotalComProventos,
        totalAtivos: ativos.length
      };

      setRentabilidadeData(dadosRentabilidade);
      setStats(statsCalculadas);
      
    } catch (error) {
      console.error('❌ Erro ao processar dados de rentabilidade:', error);
      Alert.alert('Erro', 'Falha ao calcular dados de rentabilidade');
    } finally {
      setLoading(false);
    }
  }, [calcularPrecoMedio, calcularQuantidadeTotal, calcularTotalProventos, precosAtuais]);

  // Atualizar preço atual de um ativo
  const updatePrecoAtual = useCallback(async (input: PrecoAtualInput): Promise<boolean> => {
    try {
      setUpdating(true);
      
      // Atualizar o mapa de preços atuais
      const novosPrecos = new Map(precosAtuais);
      novosPrecos.set(input.ticker, input.precoAtual);
      setPrecosAtuais(novosPrecos);
      
      // Recalcular dados
      await processarDadosRentabilidade();
      
      console.log(`✅ Preço atual atualizado para ${input.ticker}: R$ ${input.precoAtual}`);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao atualizar preço atual:', error);
      Alert.alert('Erro', 'Falha ao atualizar preço atual');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [precosAtuais, processarDadosRentabilidade]);

  // Atualizar múltiplos preços atuais
  const updateMultiplosPrecos = useCallback(async (precos: PrecoAtualInput[]): Promise<boolean> => {
    try {
      setUpdating(true);
      
      // Atualizar o mapa de preços atuais
      const novosPrecos = new Map(precosAtuais);
      precos.forEach(preco => {
        novosPrecos.set(preco.ticker, preco.precoAtual);
      });
      setPrecosAtuais(novosPrecos);
      
      // Recalcular dados
      await processarDadosRentabilidade();
      
      console.log(`✅ ${precos.length} preços atuais atualizados`);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao atualizar preços atuais:', error);
      Alert.alert('Erro', 'Falha ao atualizar preços atuais');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [precosAtuais, processarDadosRentabilidade]);

  // Refresh dos dados
  const refreshData = useCallback(async () => {
    await processarDadosRentabilidade();
  }, [processarDadosRentabilidade]);

  // Obter rentabilidade por ativo
  const getRentabilidadeByAtivo = useCallback((ativo: string): RentabilidadeData | undefined => {
    return rentabilidadeData.find(data => data.ativo === ativo);
  }, [rentabilidadeData]);

  // Inicialização
  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  // Carregar dados quando banco for inicializado
  useEffect(() => {
    if (initialized) {
      processarDadosRentabilidade();
    }
  }, [initialized, processarDadosRentabilidade]);

  return {
    // Data
    rentabilidadeData,
    stats,
    precosAtuais,
    
    // Loading states
    loading,
    updating,
    
    // Actions
    refreshData,
    updatePrecoAtual,
    updateMultiplosPrecos,
    
    // Utility
    getRentabilidadeByAtivo,
  };
};