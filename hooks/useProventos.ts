import { databaseService } from '@/services/database';
import { Ativo } from '@/types/ativo';
import { CreateProventoInput, Provento, ProventoFilter, ProventoStats, UpdateProventoInput } from '@/types/provento';
import { useCallback, useEffect, useState } from 'react';

export function useProventos() {
  const [proventos, setProventos] = useState<Provento[]>([]);
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [stats, setStats] = useState<ProventoStats>({
    totalRecebido: 0,
    totalPorTipo: { rendimento: 0, jcp: 0, dividendo: 0 },
    proventosMes: 0,
    proventosAno: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProventos = useCallback(async (filter?: ProventoFilter) => {
    try {
      setLoading(true);
      setError(null);
      await databaseService.init();
      
      const [proventosData, ativosData, statsData] = await Promise.all([
        databaseService.getProventos(filter),
        databaseService.getAtivos(),
        databaseService.getProventoStats(),
      ]);
      
      setProventos(proventosData);
      setAtivos(ativosData.filter(a => a.status === 'ativo'));
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar proventos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProvento = useCallback(async (input: CreateProventoInput): Promise<boolean> => {
    try {
      setError(null);
      const id = await databaseService.createProvento(input);
      if (id) {
        await loadProventos(); // Recarregar dados
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar provento';
      setError(errorMessage);
      console.error('Erro ao criar provento:', err);
      return false;
    }
  }, [loadProventos]);

  const updateProvento = useCallback(async (input: UpdateProventoInput): Promise<boolean> => {
    try {
      setError(null);
      const success = await databaseService.updateProvento(input);
      if (success) {
        await loadProventos(); // Recarregar dados
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar provento';
      setError(errorMessage);
      console.error('Erro ao atualizar provento:', err);
      return false;
    }
  }, [loadProventos]);

  const deleteProvento = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      const success = await databaseService.deleteProvento(id);
      if (success) {
        await loadProventos(); // Recarregar dados
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar provento';
      setError(errorMessage);
      console.error('Erro ao deletar provento:', err);
      return false;
    }
  }, [loadProventos]);

  const getProventoById = useCallback(async (id: number): Promise<Provento | null> => {
    try {
      return await databaseService.getProventoById(id);
    } catch (err) {
      console.error('Erro ao buscar provento por ID:', err);
      return null;
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const statsData = await databaseService.getProventoStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao atualizar estatísticas:', err);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadProventos();
  }, [loadProventos]);

  return {
    proventos,
    ativos,
    stats,
    loading,
    error,
    loadProventos,
    createProvento,
    updateProvento,
    deleteProvento,
    getProventoById,
    refreshStats,
  };
}
