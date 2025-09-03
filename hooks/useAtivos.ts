import { databaseService } from '@/services/database';
import { Ativo, CreateAtivoInput, DistribuicaoSegmento, DistribuicaoTipo, PortfolioStats, UpdateAtivoInput } from '@/types/ativo';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface UseAtivosReturn {
  // Data
  ativos: Ativo[];
  portfolioStats: PortfolioStats | null;
  distribuicaoTipos: DistribuicaoTipo[];
  distribuicaoSegmentos: DistribuicaoSegmento[];
  topAtivos: Ativo[];
  
  // Loading states
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  
  // Actions
  createAtivo: (input: CreateAtivoInput) => Promise<boolean>;
  updateAtivo: (input: UpdateAtivoInput) => Promise<boolean>;
  deleteAtivo: (id: number) => Promise<boolean>;
  refreshData: () => Promise<void>;
  searchAtivos: (query: string) => Promise<Ativo[]>;
  
  // Utility
  getAtivoById: (id: number) => Ativo | undefined;
}

export const useAtivos = (): UseAtivosReturn => {
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [distribuicaoTipos, setDistribuicaoTipos] = useState<DistribuicaoTipo[]>([]);
  const [distribuicaoSegmentos, setDistribuicaoSegmentos] = useState<DistribuicaoSegmento[]>([]);
  const [topAtivos, setTopAtivos] = useState<Ativo[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Inicialização do banco de dados
  const initializeDatabase = useCallback(async () => {
    if (initialized) return;
    
    try {
      await databaseService.init();
      setInitialized(true);
      console.log('✅ Hook useAtivos: Banco inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar banco no hook:', error);
      Alert.alert('Erro', 'Falha ao inicializar banco de dados');
    }
  }, [initialized]);

  // Carregar todos os dados
  const loadAllData = useCallback(async () => {
    if (!initialized) return;

    try {
      setLoading(true);
      
      const [
        ativosData,
        statsData,
        tiposData,
        segmentosData,
        topData
      ] = await Promise.all([
        databaseService.getAtivos(),
        databaseService.getPortfolioStats(),
        databaseService.getDistribuicaoPorTipo(),
        databaseService.getDistribuicaoPorSegmento(),
        databaseService.getTopAtivos(5)
      ]);

      setAtivos(ativosData);
      setPortfolioStats(statsData);
      setDistribuicaoTipos(tiposData);
      setDistribuicaoSegmentos(segmentosData);
      setTopAtivos(topData);
      
      console.log(`✅ Dados carregados: ${ativosData.length} ativos`);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do banco');
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  // Inicializar na montagem
  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  // Carregar dados quando inicializado
  useEffect(() => {
    if (initialized) {
      loadAllData();
    }
  }, [initialized, loadAllData]);

  // Ações CRUD
  const createAtivo = useCallback(async (input: CreateAtivoInput): Promise<boolean> => {
    if (!initialized) {
      Alert.alert('Erro', 'Banco de dados não inicializado');
      return false;
    }

    try {
      setSaving(true);
      const id = await databaseService.createAtivo(input);
      
      if (id) {
        await loadAllData(); // Recarregar todos os dados
        Alert.alert('Sucesso', 'Ativo criado com sucesso!');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao criar ativo:', error);
      Alert.alert('Erro', 'Falha ao criar ativo');
      return false;
    } finally {
      setSaving(false);
    }
  }, [initialized, loadAllData]);

  const updateAtivo = useCallback(async (input: UpdateAtivoInput): Promise<boolean> => {
    if (!initialized) {
      Alert.alert('Erro', 'Banco de dados não inicializado');
      return false;
    }

    try {
      setSaving(true);
      await databaseService.updateAtivo(input);
      await loadAllData(); // Recarregar todos os dados
      Alert.alert('Sucesso', 'Ativo atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar ativo:', error);
      Alert.alert('Erro', 'Falha ao atualizar ativo');
      return false;
    } finally {
      setSaving(false);
    }
  }, [initialized, loadAllData]);

  const deleteAtivo = useCallback(async (id: number): Promise<boolean> => {
    if (!initialized) {
      Alert.alert('Erro', 'Banco de dados não inicializado');
      return false;
    }

    return new Promise((resolve) => {
      Alert.alert(
        'Confirmar Exclusão',
        'Tem certeza que deseja excluir este ativo? Esta ação não pode ser desfeita.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              try {
                setDeleting(true);
                await databaseService.deleteAtivo(id);
                await loadAllData(); // Recarregar todos os dados
                Alert.alert('Sucesso', 'Ativo excluído com sucesso!');
                resolve(true);
              } catch (error) {
                console.error('❌ Erro ao deletar ativo:', error);
                Alert.alert('Erro', 'Falha ao excluir ativo');
                resolve(false);
              } finally {
                setDeleting(false);
              }
            },
          },
        ]
      );
    });
  }, [initialized, loadAllData]);

  const refreshData = useCallback(async (): Promise<void> => {
    await loadAllData();
  }, [loadAllData]);

  const searchAtivos = useCallback(async (query: string): Promise<Ativo[]> => {
    if (!initialized) return [];

    try {
      const results = await databaseService.searchAtivos(query);
      return results;
    } catch (error) {
      console.error('❌ Erro ao buscar ativos:', error);
      return [];
    }
  }, [initialized]);

  const getAtivoById = useCallback((id: number): Ativo | undefined => {
    return ativos.find(ativo => ativo.id === id);
  }, [ativos]);

  return {
    // Data
    ativos,
    portfolioStats,
    distribuicaoTipos,
    distribuicaoSegmentos,
    topAtivos,
    
    // Loading states
    loading,
    saving,
    deleting,
    
    // Actions
    createAtivo,
    updateAtivo,
    deleteAtivo,
    refreshData,
    searchAtivos,
    
    // Utility
    getAtivoById,
  };
};
