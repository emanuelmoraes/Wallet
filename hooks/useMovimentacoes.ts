import { databaseService } from '@/services/database';
import { CreateMovimentacaoInput, Movimentacao, MovimentacaoFilter, MovimentacaoStats, UpdateMovimentacaoInput } from '@/types/movimentacao';
import { useCallback, useEffect, useState } from 'react';

export function useMovimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [stats, setStats] = useState<MovimentacaoStats>({
    totalInvestido: 0,
    totalRecebido: 0,
    saldoLiquido: 0,
    totalOperacoes: 0,
    operacoesPorTipo: { compra: 0, venda: 0, subscricao: 0 },
    volumeTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMovimentacoes = useCallback(async (filter?: MovimentacaoFilter) => {
    try {
      setLoading(true);
      setError(null);
      await databaseService.init();
      
      const [movimentacoesData, statsData] = await Promise.all([
        databaseService.getMovimentacoes(filter),
        databaseService.getMovimentacaoStats(),
      ]);
      
      setMovimentacoes(movimentacoesData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar movimentações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMovimentacao = useCallback(async (input: CreateMovimentacaoInput): Promise<boolean> => {
    try {
      setError(null);
      const id = await databaseService.createMovimentacao(input);
      if (id) {
        await loadMovimentacoes(); // Recarregar dados
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar movimentação';
      setError(errorMessage);
      console.error('Erro ao criar movimentação:', err);
      return false;
    }
  }, [loadMovimentacoes]);

  const updateMovimentacao = useCallback(async (input: UpdateMovimentacaoInput): Promise<boolean> => {
    try {
      setError(null);
      const success = await databaseService.updateMovimentacao(input);
      if (success) {
        await loadMovimentacoes(); // Recarregar dados
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar movimentação';
      setError(errorMessage);
      console.error('Erro ao atualizar movimentação:', err);
      return false;
    }
  }, [loadMovimentacoes]);

  const deleteMovimentacao = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      const success = await databaseService.deleteMovimentacao(id);
      if (success) {
        await loadMovimentacoes(); // Recarregar dados
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar movimentação';
      setError(errorMessage);
      console.error('Erro ao deletar movimentação:', err);
      return false;
    }
  }, [loadMovimentacoes]);

  const getMovimentacaoById = useCallback(async (id: number): Promise<Movimentacao | null> => {
    try {
      return await databaseService.getMovimentacaoById(id);
    } catch (err) {
      console.error('Erro ao buscar movimentação por ID:', err);
      return null;
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const statsData = await databaseService.getMovimentacaoStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao atualizar estatísticas:', err);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadMovimentacoes();
  }, [loadMovimentacoes]);

  return {
    movimentacoes,
    stats,
    loading,
    error,
    loadMovimentacoes,
    createMovimentacao,
    updateMovimentacao,
    deleteMovimentacao,
    getMovimentacaoById,
    refreshStats,
  };
}
