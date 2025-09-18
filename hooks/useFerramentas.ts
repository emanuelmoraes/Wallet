import { databaseService } from '@/services/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// Definição de tipos para gerenciamento de tipos de ativos
export interface TipoAtivo {
  id: string;
  nome: string;
  icon: string;
  ativo: boolean;
}

interface UseFerramentasReturn {
  // Data
  tiposAtivos: TipoAtivo[];
  
  // Loading states
  loading: boolean;
  saving: boolean;
  clearing: boolean;
  
  // Actions para tipos de ativos
  createTipoAtivo: (nome: string, icon: string) => Promise<boolean>;
  updateTipoAtivo: (id: string, nome: string, icon: string) => Promise<boolean>;
  deleteTipoAtivo: (id: string) => Promise<boolean>;
  toggleTipoAtivo: (id: string) => Promise<boolean>;
  
  // Actions para gerenciamento de dados - JSON (mantido para compatibilidade)
  clearAllData: () => Promise<boolean>;
  exportData: () => Promise<string | null>;
  importData: (jsonData: string) => Promise<boolean>;
  
  // Actions para gerenciamento de dados - CSV
  exportDataCSV: () => Promise<{ ativos: string; proventos: string; movimentacoes: string; stats: { ativos: number; proventos: number; movimentacoes: number } } | null>;
  importDataCSV: (csvData: { ativos?: string; proventos?: string; movimentacoes?: string }) => Promise<boolean>;
  generateCSVTemplates: () => { ativos: string; proventos: string; movimentacoes: string };
  
  // Actions para gerenciamento de dados - CSV com seleção de arquivos/diretório
  exportDataCSVToDirectory: () => Promise<boolean>;
  exportCSVTemplatesToDirectory: () => Promise<boolean>;
  selectAndImportCSVFiles: () => Promise<boolean>;
  
  // Utility
  refreshTiposAtivos: () => Promise<void>;
  getTipoAtivoById: (id: string) => TipoAtivo | undefined;
}

const TIPOS_ATIVOS_KEY = 'carteira-tipos-ativos';

// Tipos padrão do sistema
const TIPOS_PADRAO: TipoAtivo[] = [
  { id: 'acao', nome: 'Ação', icon: 'chart-line', ativo: true },
  { id: 'fii', nome: 'FII', icon: 'office-building', ativo: true },
  { id: 'renda_fixa', nome: 'Renda Fixa', icon: 'bank', ativo: true },
  { id: 'cripto', nome: 'Cripto', icon: 'bitcoin', ativo: true },
];

export const useFerramentas = (): UseFerramentasReturn => {
  const [tiposAtivos, setTiposAtivos] = useState<TipoAtivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Inicialização
  const initializeFerramentas = useCallback(async () => {
    if (initialized) return;
    
    try {
      await databaseService.init();
      setInitialized(true);
      console.log('✅ Hook useFerramentas: Banco inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar banco no hook ferramentas:', error);
      Alert.alert('Erro', 'Falha ao inicializar ferramentas');
    }
  }, [initialized]);

  // Carregar tipos de ativos do storage
  const loadTiposAtivos = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(TIPOS_ATIVOS_KEY);
      if (stored) {
        const tipos = JSON.parse(stored) as TipoAtivo[];
        setTiposAtivos(tipos);
      } else {
        // Primeira inicialização - usar tipos padrão
        await AsyncStorage.setItem(TIPOS_ATIVOS_KEY, JSON.stringify(TIPOS_PADRAO));
        setTiposAtivos(TIPOS_PADRAO);
        console.log('✅ Tipos de ativos inicializados com padrões');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar tipos de ativos:', error);
      setTiposAtivos(TIPOS_PADRAO); // Fallback para tipos padrão
    }
  }, []);

  // Salvar tipos de ativos no storage
  const saveTiposAtivos = useCallback(async (tipos: TipoAtivo[]) => {
    try {
      await AsyncStorage.setItem(TIPOS_ATIVOS_KEY, JSON.stringify(tipos));
      setTiposAtivos(tipos);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar tipos de ativos:', error);
      Alert.alert('Erro', 'Falha ao salvar tipos de ativos');
      return false;
    }
  }, []);

  // Criar novo tipo de ativo
  const createTipoAtivo = useCallback(async (nome: string, icon: string): Promise<boolean> => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Nome do tipo é obrigatório');
      return false;
    }

    try {
      setSaving(true);
      
      const id = nome.toLowerCase().replace(/\s+/g, '_');
      
      // Verificar se já existe
      if (tiposAtivos.some(tipo => tipo.id === id)) {
        Alert.alert('Erro', 'Já existe um tipo com este nome');
        return false;
      }

      const novoTipo: TipoAtivo = {
        id,
        nome: nome.trim(),
        icon: icon || 'help-circle',
        ativo: true
      };

      const novosTipos = [...tiposAtivos, novoTipo];
      return await saveTiposAtivos(novosTipos);
    } catch (error) {
      console.error('❌ Erro ao criar tipo de ativo:', error);
      Alert.alert('Erro', 'Falha ao criar tipo de ativo');
      return false;
    } finally {
      setSaving(false);
    }
  }, [tiposAtivos, saveTiposAtivos]);

  // Atualizar tipo de ativo existente
  const updateTipoAtivo = useCallback(async (id: string, nome: string, icon: string): Promise<boolean> => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Nome do tipo é obrigatório');
      return false;
    }

    try {
      setSaving(true);
      
      const novosTipos = tiposAtivos.map(tipo => 
        tipo.id === id 
          ? { ...tipo, nome: nome.trim(), icon: icon || tipo.icon }
          : tipo
      );

      return await saveTiposAtivos(novosTipos);
    } catch (error) {
      console.error('❌ Erro ao atualizar tipo de ativo:', error);
      Alert.alert('Erro', 'Falha ao atualizar tipo de ativo');
      return false;
    } finally {
      setSaving(false);
    }
  }, [tiposAtivos, saveTiposAtivos]);

  // Deletar tipo de ativo (não permite deletar tipos padrão)
  const deleteTipoAtivo = useCallback(async (id: string): Promise<boolean> => {
    const tiposPadraoIds = TIPOS_PADRAO.map(t => t.id);
    if (tiposPadraoIds.includes(id)) {
      Alert.alert('Erro', 'Não é possível deletar tipos padrão do sistema');
      return false;
    }

    try {
      setSaving(true);
      
      const novosTipos = tiposAtivos.filter(tipo => tipo.id !== id);
      return await saveTiposAtivos(novosTipos);
    } catch (error) {
      console.error('❌ Erro ao deletar tipo de ativo:', error);
      Alert.alert('Erro', 'Falha ao deletar tipo de ativo');
      return false;
    } finally {
      setSaving(false);
    }
  }, [tiposAtivos, saveTiposAtivos]);

  // Ativar/desativar tipo de ativo
  const toggleTipoAtivo = useCallback(async (id: string): Promise<boolean> => {
    try {
      setSaving(true);
      
      const novosTipos = tiposAtivos.map(tipo => 
        tipo.id === id 
          ? { ...tipo, ativo: !tipo.ativo }
          : tipo
      );

      return await saveTiposAtivos(novosTipos);
    } catch (error) {
      console.error('❌ Erro ao alternar tipo de ativo:', error);
      Alert.alert('Erro', 'Falha ao alternar status do tipo');
      return false;
    } finally {
      setSaving(false);
    }
  }, [tiposAtivos, saveTiposAtivos]);

  // Limpar todos os dados do aplicativo
  const clearAllData = useCallback(async (): Promise<boolean> => {
    try {
      setClearing(true);
      
      // Chaves do AsyncStorage para limpar
      const keys = [
        'carteira-investimentos-ativos',
        'carteira-investimentos-proventos', 
        'carteira-investimentos-movimentacoes',
      ];

      await AsyncStorage.multiRemove(keys);
      
      // Reinicializar banco de dados
      await databaseService.init();
      
      console.log('✅ Todos os dados foram limpos');
      Alert.alert('Sucesso', 'Todos os dados foram removidos do aplicativo');
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
      Alert.alert('Erro', 'Falha ao limpar dados do aplicativo');
      return false;
    } finally {
      setClearing(false);
    }
  }, []);

  // Exportar dados do aplicativo
  const exportData = useCallback(async (): Promise<string | null> => {
    try {
      const keys = [
        'carteira-investimentos-ativos',
        'carteira-investimentos-proventos',
        'carteira-investimentos-movimentacoes',
        TIPOS_ATIVOS_KEY
      ];

      const data: Record<string, any> = {};
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          data[key] = JSON.parse(value);
        }
      }

      data.exportDate = new Date().toISOString();
      data.appVersion = '1.0.0';

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error);
      Alert.alert('Erro', 'Falha ao exportar dados');
      return null;
    }
  }, []);

  // Importar dados no aplicativo
  const importData = useCallback(async (jsonData: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonData);
      
      // Validar estrutura básica
      if (!data || typeof data !== 'object') {
        Alert.alert('Erro', 'Formato de dados inválido');
        return false;
      }

      // Importar cada tipo de dados
      const keys = [
        'carteira-investimentos-ativos',
        'carteira-investimentos-proventos',
        'carteira-investimentos-movimentacoes',
        TIPOS_ATIVOS_KEY
      ];

      for (const key of keys) {
        if (data[key]) {
          await AsyncStorage.setItem(key, JSON.stringify(data[key]));
        }
      }

      // Recarregar dados locais
      await loadTiposAtivos();
      
      console.log('✅ Dados importados com sucesso');
      Alert.alert('Sucesso', 'Dados importados com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao importar dados:', error);
      Alert.alert('Erro', 'Falha ao importar dados. Verifique o formato do arquivo.');
      return false;
    }
  }, [loadTiposAtivos]);

  // Converter array para CSV
  const arrayToCSV = (data: any[], headers: string[]): string => {
    if (!data || data.length === 0) {
      return headers.join(',') + '\n';
    }

    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar valores que contém vírgulas ou aspas
        if (value && (value.toString().includes(',') || value.toString().includes('"'))) {
          return `"${value.toString().replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    );

    return csvHeaders + '\n' + csvRows.join('\n');
  };

  // Converter CSV para array
  const csvToArray = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  };

  // Exportar dados em formato CSV
  const exportDataCSV = useCallback(async (): Promise<{ ativos: string; proventos: string; movimentacoes: string; stats: { ativos: number; proventos: number; movimentacoes: number } } | null> => {
    try {
      // Carregar dados do AsyncStorage
      const [ativosData, proventosData, movimentacoesData] = await Promise.all([
        AsyncStorage.getItem('carteira-investimentos-ativos'),
        AsyncStorage.getItem('carteira-investimentos-proventos'),
        AsyncStorage.getItem('carteira-investimentos-movimentacoes')
      ]);

      // Headers para cada tipo de arquivo CSV
      const ativosHeaders = ['id', 'ticker', 'nome', 'tipo', 'preco', 'quantidade', 'valorTotal', 'segmento', 'administrador', 'status', 'site', 'observacoes', 'createdAt', 'updatedAt'];
      const proventosHeaders = ['id', 'ativoId', 'ativoTicker', 'ativoNome', 'data', 'valor', 'tipo', 'observacoes', 'createdAt', 'updatedAt'];
      const movimentacoesHeaders = ['id', 'ativo', 'data', 'tipo', 'operacao', 'quantidade', 'valorUnitario', 'valorTotal', 'taxas', 'segmento', 'observacao', 'createdAt', 'updatedAt'];

      // Converter dados para CSV
      const ativos = ativosData ? JSON.parse(ativosData) : [];
      const proventos = proventosData ? JSON.parse(proventosData) : [];
      const movimentacoes = movimentacoesData ? JSON.parse(movimentacoesData) : [];

      const ativosCSV = arrayToCSV(ativos, ativosHeaders);
      const proventosCSV = arrayToCSV(proventos, proventosHeaders);
      const movimentacoesCSV = arrayToCSV(movimentacoes, movimentacoesHeaders);

      // Calcular estatísticas
      const stats = {
        ativos: ativos.length,
        proventos: proventos.length,
        movimentacoes: movimentacoes.length
      };

      console.log('✅ Dados CSV gerados com sucesso');
      return {
        ativos: ativosCSV,
        proventos: proventosCSV,
        movimentacoes: movimentacoesCSV,
        stats
      };
    } catch (error) {
      console.error('❌ Erro ao exportar dados CSV:', error);
      Alert.alert('Erro', 'Falha ao exportar dados em CSV');
      return null;
    }
  }, []);

  // Gerar templates CSV para referência
  const generateCSVTemplates = useCallback((): { ativos: string; proventos: string; movimentacoes: string } => {
    // Headers para cada tipo de arquivo CSV
    const ativosHeaders = ['id', 'ticker', 'nome', 'tipo', 'preco', 'quantidade', 'valorTotal', 'segmento', 'administrador', 'status', 'site', 'observacoes', 'createdAt', 'updatedAt'];
    const proventosHeaders = ['id', 'ativoId', 'ativoTicker', 'ativoNome', 'data', 'valor', 'tipo', 'observacoes', 'createdAt', 'updatedAt'];
    const movimentacoesHeaders = ['id', 'ativo', 'data', 'tipo', 'operacao', 'quantidade', 'valorUnitario', 'valorTotal', 'taxas', 'segmento', 'observacao', 'createdAt', 'updatedAt'];

    // Dados de exemplo para templates
    const exemploAtivos = [{
      id: 1,
      ticker: 'PETR4',
      nome: 'Petrobras PN',
      tipo: 'acao',
      preco: 30.50,
      quantidade: 100,
      valorTotal: 3050.00,
      segmento: 'Energia',
      administrador: '',
      status: 'ativo',
      site: '',
      observacoes: 'Exemplo de ativo',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }];

    const exemploProventos = [{
      id: 1,
      ativoId: 1,
      ativoTicker: 'PETR4',
      ativoNome: 'Petrobras PN',
      data: '2024-06-15',
      valor: 150.50,
      tipo: 'dividendo',
      observacoes: 'Exemplo de provento',
      createdAt: '2024-06-15T00:00:00.000Z',
      updatedAt: '2024-06-15T00:00:00.000Z'
    }];

    const exemploMovimentacoes = [{
      id: 1,
      ativo: 'PETR4',
      data: '2024-01-01',
      tipo: 'acao',
      operacao: 'compra',
      quantidade: 100,
      valorUnitario: 30.50,
      valorTotal: 3050.00,
      taxas: 10.00,
      segmento: 'Energia',
      observacao: 'Exemplo de movimentação',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }];

    return {
      ativos: arrayToCSV(exemploAtivos, ativosHeaders),
      proventos: arrayToCSV(exemploProventos, proventosHeaders),
      movimentacoes: arrayToCSV(exemploMovimentacoes, movimentacoesHeaders)
    };
  }, []);

  // Importar dados em formato CSV
  const importDataCSV = useCallback(async (csvData: { ativos?: string; proventos?: string; movimentacoes?: string }): Promise<boolean> => {
    try {
      let importSuccess = false;

      // Importar ativos
      if (csvData.ativos) {
        const ativosArray = csvToArray(csvData.ativos);
        if (ativosArray.length > 0) {
          // Converter strings para números quando necessário
          const processedAtivos = ativosArray.map((ativo: any) => ({
            ...ativo,
            id: parseInt(ativo.id) || 0,
            preco: parseFloat(ativo.preco) || 0,
            quantidade: parseFloat(ativo.quantidade) || 0,
            valorTotal: parseFloat(ativo.valorTotal) || 0,
          }));
          await AsyncStorage.setItem('carteira-investimentos-ativos', JSON.stringify(processedAtivos));
          importSuccess = true;
        }
      }

      // Importar proventos
      if (csvData.proventos) {
        const proventosArray = csvToArray(csvData.proventos);
        if (proventosArray.length > 0) {
          const processedProventos = proventosArray.map((provento: any) => ({
            ...provento,
            id: parseInt(provento.id) || 0,
            ativoId: parseInt(provento.ativoId) || 0,
            valor: parseFloat(provento.valor) || 0,
          }));
          await AsyncStorage.setItem('carteira-investimentos-proventos', JSON.stringify(processedProventos));
          importSuccess = true;
        }
      }

      // Importar movimentações
      if (csvData.movimentacoes) {
        const movimentacoesArray = csvToArray(csvData.movimentacoes);
        if (movimentacoesArray.length > 0) {
          const processedMovimentacoes = movimentacoesArray.map((mov: any) => ({
            ...mov,
            id: parseInt(mov.id) || 0,
            quantidade: parseFloat(mov.quantidade) || 0,
            valorUnitario: parseFloat(mov.valorUnitario) || 0,
            valorTotal: parseFloat(mov.valorTotal) || 0,
            taxas: parseFloat(mov.taxas) || 0,
          }));
          await AsyncStorage.setItem('carteira-investimentos-movimentacoes', JSON.stringify(processedMovimentacoes));
          importSuccess = true;
        }
      }

      if (importSuccess) {
        // Recarregar dados locais
        await loadTiposAtivos();
        console.log('✅ Dados CSV importados com sucesso');
        Alert.alert('Sucesso', 'Dados CSV importados com sucesso');
        return true;
      } else {
        Alert.alert('Aviso', 'Nenhum dado válido foi encontrado nos arquivos CSV');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao importar dados CSV:', error);
      Alert.alert('Erro', 'Falha ao importar dados CSV. Verifique o formato dos arquivos.');
      return false;
    }
  }, [loadTiposAtivos]);

  // Atualizar dados
  const refreshTiposAtivos = useCallback(async () => {
    setLoading(true);
    await loadTiposAtivos();
    setLoading(false);
  }, [loadTiposAtivos]);

  // Buscar tipo por ID
  const getTipoAtivoById = useCallback((id: string): TipoAtivo | undefined => {
    return tiposAtivos.find(tipo => tipo.id === id);
  }, [tiposAtivos]);

  // Selecionar diretório para exportação (versão simplificada)
  const selectExportDirectory = useCallback(async (): Promise<string | null> => {
    try {
      // Por enquanto, vamos simular a seleção de diretório
      Alert.alert(
        'Selecionar Local de Exportação',
        'Em versões futuras, você poderá escolher onde salvar os arquivos.\n\nPor enquanto, os arquivos serão preparados para download.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', style: 'default' }
        ]
      );
      
      return '/downloads/CarteiraInvestimentos/';
    } catch (error) {
      console.error('Erro ao preparar diretório:', error);
      Alert.alert('Erro', 'Falha ao preparar diretório de exportação');
      return null;
    }
  }, []);

  // Exportar dados CSV com seleção de diretório
  const exportDataCSVToDirectory = useCallback(async (): Promise<boolean> => {
    try {
      const directory = await selectExportDirectory();
      if (!directory) return false;

      const csvData = await exportDataCSV();
      if (!csvData) return false;

      const { ativos, proventos, movimentacoes, stats } = csvData;
      
      // Por enquanto, vamos mostrar os dados no console e um Alert
      console.log('=== DADOS PARA EXPORTAÇÃO ===');
      console.log('Arquivo: ativos.csv');
      console.log(ativos);
      console.log('\nArquivo: proventos.csv');
      console.log(proventos);
      console.log('\nArquivo: movimentacoes.csv');
      console.log(movimentacoes);

      Alert.alert(
        'Exportação Preparada',
        `✅ Dados preparados para exportação!\n\n📊 Resumo:\n• ${stats.ativos} ativos\n• ${stats.proventos} proventos\n• ${stats.movimentacoes} movimentações\n\n� Verifique o console para ver os dados CSV.\n\n🔜 Em breve: salvamento real de arquivos.`,
        [{ text: 'OK' }]
      );

      return true;
    } catch (error) {
      console.error('Erro na exportação:', error);
      Alert.alert('Erro', 'Falha ao exportar dados');
      return false;
    }
  }, [exportDataCSV, selectExportDirectory]);

  // Exportar templates CSV com seleção de diretório
  const exportCSVTemplatesToDirectory = useCallback(async (): Promise<boolean> => {
    try {
      const directory = await selectExportDirectory();
      if (!directory) return false;

      const templates = generateCSVTemplates();
      
      // Por enquanto, vamos mostrar os templates no console
      console.log('=== TEMPLATES PARA EXPORTAÇÃO ===');
      console.log('Arquivo: ativos_template.csv');
      console.log(templates.ativos);
      console.log('\nArquivo: proventos_template.csv');
      console.log(templates.proventos);
      console.log('\nArquivo: movimentacoes_template.csv');
      console.log(templates.movimentacoes);

      Alert.alert(
        'Templates Preparados',
        `📄 Templates de exemplo foram preparados!\n\n� Verifique o console para ver os templates CSV.\n\n🔜 Em breve: salvamento real de arquivos.\n\n💡 Use estes dados como referência para importar seus dados.`,
        [{ text: 'OK' }]
      );

      return true;
    } catch (error) {
      console.error('Erro ao preparar templates:', error);
      Alert.alert('Erro', 'Falha ao preparar templates');
      return false;
    }
  }, [generateCSVTemplates, selectExportDirectory]);

  // Selecionar e importar arquivos CSV
  const selectAndImportCSVFiles = useCallback(async (): Promise<boolean> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return false;
      }

      const csvData: { ativos?: string; proventos?: string; movimentacoes?: string } = {};
      
      // Processar arquivos selecionados
      for (const file of result.assets) {
        // Por enquanto, vamos simular a leitura do arquivo
        // Em uma implementação real, usaríamos FileSystem.readAsStringAsync(file.uri)
        const fileName = file.name.toLowerCase();
        
        Alert.alert(
          'Arquivo Selecionado',
          `Arquivo: ${file.name}\nTipo: ${file.mimeType}\nTamanho: ${file.size} bytes\n\n🔜 Em breve: leitura real do conteúdo.`
        );
        
        // Simular conteúdo para demonstração
        if (fileName.includes('ativos')) {
          csvData.ativos = 'id,ticker,nome,tipo\n1,PETR4,Petrobras PN,acao';
        } else if (fileName.includes('proventos')) {
          csvData.proventos = 'id,ativoId,ativoTicker,data,valor,tipo\n1,1,PETR4,2024-06-15,150.50,dividendo';
        } else if (fileName.includes('movimentacoes')) {
          csvData.movimentacoes = 'id,ativo,data,tipo,operacao,quantidade,valorUnitario\n1,PETR4,2024-01-01,acao,compra,100,30.50';
        }
      }

      if (Object.keys(csvData).length === 0) {
        Alert.alert(
          'Arquivos não reconhecidos',
          'Os arquivos selecionados não seguem o padrão esperado.\n\nNomes esperados:\n• ativos.csv\n• proventos.csv\n• movimentacoes.csv'
        );
        return false;
      }

      return await importDataCSV(csvData);
    } catch (error) {
      console.error('Erro na seleção de arquivos:', error);
      Alert.alert('Erro', 'Falha ao selecionar ou importar arquivos');
      return false;
    }
  }, [importDataCSV]);

  // Inicializar na montagem
  useEffect(() => {
    initializeFerramentas();
  }, [initializeFerramentas]);

  // Carregar dados quando inicializado
  useEffect(() => {
    if (initialized) {
      loadTiposAtivos().finally(() => setLoading(false));
    }
  }, [initialized, loadTiposAtivos]);

  return {
    // Data
    tiposAtivos,
    
    // Loading states
    loading,
    saving,
    clearing,
    
    // Actions para tipos de ativos
    createTipoAtivo,
    updateTipoAtivo,
    deleteTipoAtivo,
    toggleTipoAtivo,
    
    // Actions para gerenciamento de dados - JSON (mantido para compatibilidade)
    clearAllData,
    exportData,
    importData,
    
    // Actions para gerenciamento de dados - CSV
    exportDataCSV,
    importDataCSV,
    generateCSVTemplates,
    
    // Actions para gerenciamento de dados - CSV com seleção de arquivos/diretório
    exportDataCSVToDirectory,
    exportCSVTemplatesToDirectory,
    selectAndImportCSVFiles,
    
    // Utility
    refreshTiposAtivos,
    getTipoAtivoById,
  };
};