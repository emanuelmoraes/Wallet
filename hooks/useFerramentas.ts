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

// Interface para erros de validação
interface ValidationError {
  type: string;
  line: number;
  field?: string;
  value?: string;
  expected?: string;
  message: string;
}

interface UseFerramentasReturn {
  // Data
  tiposAtivos: TipoAtivo[];
  
  // Loading states
  loading: boolean;
  saving: boolean;
  clearing: boolean;
  
  // Validation errors dialog
  validationErrors: ValidationError[];
  showValidationDialog: boolean;
  clearValidationErrors: () => void;
  
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

// Função auxiliar para formatar data no formato DD/MM/AAAA
const formatDateToDDMMAAAA = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Se não conseguir converter, retorna o original
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString; // Em caso de erro, retorna o original
  }
};

// Função auxiliar para converter data DD/MM/AAAA para ISO
const parseDDMMAAAAToISO = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Se já está no formato ISO, retorna como está
    if (dateString.includes('T') || dateString.includes('-')) {
      return dateString;
    }
    
    // Se está no formato DD/MM/AAAA
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      if (day && month && year) {
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toISOString();
      }
    }
    
    return dateString;
  } catch (error) {
    return dateString;
  }
};

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
  
  // Estados para dialog de validação
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  
  // Limpar erros de validação
  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
    setShowValidationDialog(false);
  }, []);

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
      
      // Forçar recarga de ativos e proventos
      console.log('🔄 Forçando recarga dos dados importados...');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao importar dados:', error);
      Alert.alert('Erro', 'Falha ao importar dados. Verifique o formato do arquivo.');
      return false;
    }
  }, [loadTiposAtivos]);

  // Tipos de validação de CSV
  interface CSVValidationError {
    type: 'MISSING_FIELDS' | 'INVALID_TYPE' | 'INVALID_STATUS' | 'EMPTY_REQUIRED_FIELD' | 'INVALID_NUMBER' | 'INVALID_DATE' | 'EXTRA_QUOTES' | 'EMPTY_ROW';
    line: number;
    field?: string;
    value?: string;
    expected?: string;
    message: string;
  }

  interface CSVValidationResult {
    isValid: boolean;
    errors: CSVValidationError[];
    warnings: CSVValidationError[];
    processedData: any[];
  }

  // Normalizar tipos de ativo para os aceitos pelo sistema
  const normalizeAtivoType = (tipo: string): string => {
    const normalizedTipo = tipo.toLowerCase().trim();
    const typeMapping: { [key: string]: string } = {
      'acao': 'acao',
      'ação': 'acao',
      'fii': 'fii',
      'tesouro direto': 'renda_fixa',
      'lci': 'renda_fixa',
      'fi-infra': 'renda_fixa',
      'cripto': 'cripto',
      'cryptocurrency': 'cripto'
    };
    return typeMapping[normalizedTipo] || normalizedTipo;
  };

  // Normalizar status para minúsculo
  const normalizeStatus = (status: string): string => {
    return status.toLowerCase().trim();
  };

  // Validar CSV de ativos
  const validateAtivosCSV = (csvText: string): CSVValidationResult => {
    const errors: CSVValidationError[] = [];
    const warnings: CSVValidationError[] = [];
    const processedData: any[] = [];

    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        errors.push({
          type: 'EMPTY_ROW',
          line: 1,
          message: 'Arquivo CSV vazio ou sem dados'
        });
        return { isValid: false, errors, warnings, processedData };
      }

      const expectedHeaders = ['ticker', 'nome', 'tipo', 'preco', 'quantidade', 'valorTotal', 'segmento', 'administrador', 'status', 'site', 'observacoes'];
      const headers = lines[0].split('|').map(h => h.trim());

      // Validar headers
      const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        errors.push({
          type: 'MISSING_FIELDS',
          line: 1,
          message: `Headers obrigatórios ausentes: ${missingHeaders.join(', ')}`
        });
      }

      // Processar cada linha de dados
      lines.slice(1).forEach((line, index) => {
        const lineNumber = index + 2; // +2 porque index é 0-based e pulamos o header
        
        if (!line.trim()) {
          warnings.push({
            type: 'EMPTY_ROW',
            line: lineNumber,
            message: 'Linha vazia ignorada'
          });
          return;
        }

        const rawData = csvToArray(`${lines[0]}\n${line}`)[0];
        
        // Validações específicas
        const requiredFields = ['ticker', 'nome', 'tipo', 'preco', 'quantidade'];
        requiredFields.forEach(field => {
          if (!rawData[field] || rawData[field].toString().trim() === '') {
            errors.push({
              type: 'EMPTY_REQUIRED_FIELD',
              line: lineNumber,
              field,
              message: `Campo obrigatório '${field}' está vazio`
            });
          }
        });

        // Validar e normalizar tipo
        if (rawData.tipo) {
          const normalizedType = normalizeAtivoType(rawData.tipo);
          const validTypes = ['acao', 'fii', 'renda_fixa', 'cripto'];
          if (!validTypes.includes(normalizedType)) {
            errors.push({
              type: 'INVALID_TYPE',
              line: lineNumber,
              field: 'tipo',
              value: rawData.tipo,
              expected: validTypes.join(', '),
              message: `Tipo de ativo inválido: '${rawData.tipo}'. Tipos aceitos: ${validTypes.join(', ')}`
            });
          } else {
            rawData.tipo = normalizedType;
          }
        }

        // Validar e normalizar status
        if (rawData.status) {
          const normalizedStatus = normalizeStatus(rawData.status);
          const validStatuses = ['ativo', 'inativo'];
          if (!validStatuses.includes(normalizedStatus)) {
            errors.push({
              type: 'INVALID_STATUS',
              line: lineNumber,
              field: 'status',
              value: rawData.status,
              expected: validStatuses.join(', '),
              message: `Status inválido: '${rawData.status}'. Status aceitos: ${validStatuses.join(', ')}`
            });
          } else {
            rawData.status = normalizedStatus;
          }
        }

        // Validar números
        ['preco', 'quantidade', 'valorTotal'].forEach(field => {
          if (rawData[field] && rawData[field] !== '') {
            const numValue = parseFloat(rawData[field]);
            if (isNaN(numValue)) {
              errors.push({
                type: 'INVALID_NUMBER',
                line: lineNumber,
                field,
                value: rawData[field],
                message: `Valor numérico inválido no campo '${field}': '${rawData[field]}'`
              });
            } else {
              rawData[field] = numValue;
            }
          }
        });

        // Detectar aspas extras ou problemas de formatação
        if (rawData.ticker && (rawData.ticker.includes('"') || rawData.ticker.trim() !== rawData.ticker)) {
          warnings.push({
            type: 'EXTRA_QUOTES',
            line: lineNumber,
            field: 'ticker',
            value: rawData.ticker,
            message: `Possível problema de formatação no ticker: '${rawData.ticker}'`
          });
          rawData.ticker = rawData.ticker.replace(/"/g, '').trim();
        }

        if (rawData.nome && (rawData.nome.includes('"') || rawData.nome.trim() !== rawData.nome)) {
          warnings.push({
            type: 'EXTRA_QUOTES',
            line: lineNumber,
            field: 'nome',
            value: rawData.nome,
            message: `Possível problema de formatação no nome: '${rawData.nome}'`
          });
          rawData.nome = rawData.nome.replace(/"/g, '').trim();
        }

        processedData.push(rawData);
      });

    } catch (error) {
      errors.push({
        type: 'INVALID_TYPE',
        line: 0,
        message: `Erro ao processar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      processedData
    };
  };

  // Validar CSV de proventos
  const validateProventosCSV = (csvText: string): CSVValidationResult => {
    const errors: CSVValidationError[] = [];
    const warnings: CSVValidationError[] = [];
    const processedData: any[] = [];

    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        errors.push({
          type: 'EMPTY_ROW',
          line: 1,
          message: 'Arquivo CSV vazio ou sem dados'
        });
        return { isValid: false, errors, warnings, processedData };
      }

      const expectedHeaders = ['ativoTicker', 'data', 'valor', 'tipo', 'observacoes'];
      const headers = lines[0].split('|').map(h => h.trim());

      // Validar headers
      const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        errors.push({
          type: 'MISSING_FIELDS',
          line: 1,
          message: `Headers obrigatórios ausentes: ${missingHeaders.join(', ')}`
        });
      }

      // Processar cada linha de dados
      lines.slice(1).forEach((line, index) => {
        const lineNumber = index + 2;
        
        if (!line.trim()) {
          warnings.push({
            type: 'EMPTY_ROW',
            line: lineNumber,
            message: 'Linha vazia ignorada'
          });
          return;
        }

        const rawData = csvToArray(`${lines[0]}\n${line}`)[0];
        
        // Validações específicas
        const requiredFields = ['ativoTicker', 'data', 'valor', 'tipo'];
        requiredFields.forEach(field => {
          if (!rawData[field] || rawData[field].toString().trim() === '') {
            errors.push({
              type: 'EMPTY_REQUIRED_FIELD',
              line: lineNumber,
              field,
              message: `Campo obrigatório '${field}' está vazio`
            });
          }
        });

        // Validar tipo de provento
        if (rawData.tipo) {
          const normalizedType = rawData.tipo.toLowerCase().trim();
          const typeMapping: { [key: string]: string } = {
            'dividendo': 'dividendo',
            'dividendos': 'dividendo',
            'jcp': 'jcp',
            'rendimento': 'rendimento',
            'rendimentos': 'rendimento'
          };
          
          if (typeMapping[normalizedType]) {
            rawData.tipo = typeMapping[normalizedType];
          } else {
            errors.push({
              type: 'INVALID_TYPE',
              line: lineNumber,
              field: 'tipo',
              value: rawData.tipo,
              expected: Object.keys(typeMapping).join(', '),
              message: `Tipo de provento inválido: '${rawData.tipo}'. Tipos aceitos: ${Object.keys(typeMapping).join(', ')}`
            });
          }
        }

        // Validar valor
        if (rawData.valor && rawData.valor !== '') {
          const numValue = parseFloat(rawData.valor);
          if (isNaN(numValue)) {
            errors.push({
              type: 'INVALID_NUMBER',
              line: lineNumber,
              field: 'valor',
              value: rawData.valor,
              message: `Valor numérico inválido: '${rawData.valor}'`
            });
          } else {
            rawData.valor = numValue;
          }
        }

        processedData.push(rawData);
      });

    } catch (error) {
      errors.push({
        type: 'INVALID_TYPE',
        line: 0,
        message: `Erro ao processar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      processedData
    };
  };

  // Validar CSV de movimentações
  const validateMovimentacoesCSV = (csvText: string): CSVValidationResult => {
    const errors: CSVValidationError[] = [];
    const warnings: CSVValidationError[] = [];
    const processedData: any[] = [];

    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        errors.push({
          type: 'EMPTY_ROW',
          line: 1,
          message: 'Arquivo CSV vazio ou sem dados'
        });
        return { isValid: false, errors, warnings, processedData };
      }

      const expectedHeaders = ['ativo', 'data', 'tipo', 'operacao', 'quantidade', 'valorUnitario', 'segmento', 'observacao'];
      const headers = lines[0].split('|').map(h => h.trim());

      // Validar headers
      const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        errors.push({
          type: 'MISSING_FIELDS',
          line: 1,
          message: `Headers obrigatórios ausentes: ${missingHeaders.join(', ')}`
        });
      }

      // Processar cada linha de dados
      lines.slice(1).forEach((line, index) => {
        const lineNumber = index + 2;
        
        if (!line.trim()) {
          warnings.push({
            type: 'EMPTY_ROW',
            line: lineNumber,
            message: 'Linha vazia ignorada'
          });
          return;
        }

        const rawData = csvToArray(`${lines[0]}\n${line}`)[0];
        
        // Validações específicas
        const requiredFields = ['ativo', 'data', 'quantidade', 'valorUnitario', 'operacao'];
        requiredFields.forEach(field => {
          if (!rawData[field] || rawData[field].toString().trim() === '') {
            errors.push({
              type: 'EMPTY_REQUIRED_FIELD',
              line: lineNumber,
              field,
              message: `Campo obrigatório '${field}' está vazio`
            });
          }
        });

        // Mapear 'ativo' para 'ticker' (corrigir inconsistência)
        if (rawData.ativo) {
          rawData.ticker = rawData.ativo;
          delete rawData.ativo; // Remover campo antigo após mapeamento
        }

        // Validar tipo de operação
        if (rawData.operacao) {
          const normalizedOperacao = rawData.operacao.toLowerCase().trim();
          const operacaoMapping: { [key: string]: string } = {
            'compra': 'compra',
            'venda': 'venda',
            'subscrição': 'subscricao',
            'subscricao': 'subscricao',
            'assinatura': 'subscricao'
          };
          
          if (operacaoMapping[normalizedOperacao]) {
            rawData.operacao = operacaoMapping[normalizedOperacao];
          } else {
            errors.push({
              type: 'INVALID_TYPE',
              line: lineNumber,
              field: 'operacao',
              value: rawData.operacao,
              expected: Object.keys(operacaoMapping).join(', '),
              message: `Tipo de operação inválido: '${rawData.operacao}'. Operações aceitas: ${Object.keys(operacaoMapping).join(', ')}`
            });
          }
        }

        // Validar segmento
        if (rawData.segmento || rawData.tipo) {
          // Usar 'tipo' se 'segmento' não estiver presente (compatibilidade)
          const segmentoValue = rawData.segmento || rawData.tipo;
          const normalizedSegmento = segmentoValue.toLowerCase().trim();
          
          const segmentoMapping: { [key: string]: string } = {
            'ação': 'acao',
            'acao': 'acao',
            'fii': 'fii',
            'fi_infra': 'fi_infra',
            'fi-infra': 'fi_infra',
            'etf': 'etf',
            'renda_fixa': 'renda_fixa',
            'renda fixa': 'renda_fixa',
            'cripto': 'cripto',
            'criptomoeda': 'cripto'
          };
          
          if (segmentoMapping[normalizedSegmento]) {
            rawData.segmento = segmentoMapping[normalizedSegmento];
          } else {
            warnings.push({
              type: 'INVALID_TYPE',
              line: lineNumber,
              field: 'segmento',
              value: segmentoValue,
              message: `Segmento desconhecido: '${segmentoValue}'. Usando valor original.`
            });
            rawData.segmento = normalizedSegmento;
          }
          
          // Remover campo 'tipo' se foi usado
          if (rawData.tipo && rawData.segmento) {
            delete rawData.tipo;
          }
        }

        // Validar números
        ['quantidade', 'valorUnitario'].forEach(field => {
          if (rawData[field] && rawData[field] !== '') {
            const numValue = parseFloat(rawData[field]);
            if (isNaN(numValue)) {
              errors.push({
                type: 'INVALID_NUMBER',
                line: lineNumber,
                field,
                value: rawData[field],
                message: `Valor numérico inválido no campo '${field}': '${rawData[field]}'`
              });
            } else {
              rawData[field] = numValue;
            }
          }
        });

        // Limpar campos de texto
        if (rawData.ticker) {
          rawData.ticker = rawData.ticker.toString().trim().toUpperCase();
        }

        if (rawData.observacao) {
          rawData.observacao = rawData.observacao.toString().trim();
        }

        processedData.push(rawData);
      });

    } catch (error) {
      errors.push({
        type: 'INVALID_TYPE',
        line: 0,
        message: `Erro ao processar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      processedData
    };
  };

  // Converter array para CSV
  const arrayToCSV = (data: any[], headers: string[]): string => {
    if (!data || data.length === 0) {
      return headers.join('|') + '\n';
    }

    const csvHeaders = headers.join('|');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar valores que contém pipes ou aspas
        if (value && (value.toString().includes('|') || value.toString().includes('"'))) {
          return `"${value.toString().replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join('|')
    );

    return csvHeaders + '\n' + csvRows.join('\n');
  };

  // Converter CSV para array
  const csvToArray = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split('|').map(h => h.trim());
    return lines.slice(1).map(line => {
      // Parsing mais robusto para lidar com campos com aspas que podem conter pipes
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === '|' && !insideQuotes) {
          values.push(currentValue.trim().replace(/^"|"$/g, ''));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Adicionar o último valor
      values.push(currentValue.trim().replace(/^"|"$/g, ''));
      
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

      // Headers para cada tipo de arquivo CSV (sem ID, createdAt e updatedAt)
      const ativosHeaders = ['ticker', 'nome', 'tipo', 'preco', 'quantidade', 'valorTotal', 'segmento', 'administrador', 'status', 'site', 'observacoes'];
      const proventosHeaders = ['ativoTicker', 'data', 'valor', 'tipo', 'observacoes'];
      const movimentacoesHeaders = ['ativo', 'data', 'tipo', 'operacao', 'quantidade', 'valorUnitario', 'segmento', 'observacao'];

      // Converter dados para CSV
      const ativos = ativosData ? JSON.parse(ativosData) : [];
      const proventos = proventosData ? JSON.parse(proventosData) : [];
      const movimentacoes = movimentacoesData ? JSON.parse(movimentacoesData) : [];

      // Processar dados para exportação (sem createdAt e updatedAt)
      const processedAtivos = ativos.map((ativo: any) => {
        const { createdAt, updatedAt, ...ativoWithoutDates } = ativo;
        return ativoWithoutDates;
      });

      const processedProventos = proventos.map((provento: any) => {
        const { createdAt, updatedAt, ...proventoWithoutDates } = provento;
        return {
          ...proventoWithoutDates,
          data: formatDateToDDMMAAAA(provento.data)
        };
      });

      const processedMovimentacoes = movimentacoes.map((mov: any) => {
        const { createdAt, updatedAt, ticker, ...movWithoutDates } = mov;
        return {
          ativo: ticker, // Mapear 'ticker' de volta para 'ativo' no CSV
          ...movWithoutDates,
          data: formatDateToDDMMAAAA(mov.data)
        };
      });

      const ativosCSV = arrayToCSV(processedAtivos, ativosHeaders);
      const proventosCSV = arrayToCSV(processedProventos, proventosHeaders);
      const movimentacoesCSV = arrayToCSV(processedMovimentacoes, movimentacoesHeaders);

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
    // Headers para cada tipo de arquivo CSV (sem ID, createdAt e updatedAt)
    const ativosHeaders = ['ticker', 'nome', 'tipo', 'preco', 'quantidade', 'valorTotal', 'segmento', 'administrador', 'status', 'site', 'observacoes'];
    const proventosHeaders = ['ativoTicker', 'data', 'valor', 'tipo', 'observacoes'];
    const movimentacoesHeaders = ['ativo', 'data', 'tipo', 'operacao', 'quantidade', 'valorUnitario', 'segmento', 'observacao'];

    // Dados de exemplo para templates (sem ID e com datas no formato DD/MM/AAAA)
    const exemploAtivos = [{
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
      observacoes: 'Exemplo de ativo'
    }];

    const exemploProventos = [{
      ativoTicker: 'PETR4',
      data: '15/06/2024',
      valor: 150.50,
      tipo: 'dividendo',
      observacoes: 'Exemplo de provento'
    }];

    const exemploMovimentacoes = [{
      ativo: 'PETR4',
      data: '01/01/2024',
      tipo: 'acao',
      operacao: 'compra',
      quantidade: 100,
      valorUnitario: 30.50,
      segmento: 'Energia',
      observacao: 'Exemplo de movimentação'
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
      console.log('📥 Iniciando importação de dados CSV...');
      console.log('📋 Dados recebidos:', Object.keys(csvData));
      
      let importSuccess = false;
      const importDate = new Date().toISOString(); // Data de importação para todos os registros

      // Validar e importar ativos
      if (csvData.ativos) {
        console.log('🔍 Validando dados de ativos...');
        console.log(`📊 Tamanho do conteúdo de ativos: ${csvData.ativos.length} caracteres`);
        
        const validation = validateAtivosCSV(csvData.ativos);
        
        console.log(`✅ Validação de ativos concluída: ${validation.isValid}`);
        console.log(`❌ Erros encontrados: ${validation.errors.length}`);
        console.log(`⚠️ Avisos encontrados: ${validation.warnings.length}`);
        console.log(`📋 Registros processados: ${validation.processedData.length}`);
        
        if (!validation.isValid) {
          const errorMessages = validation.errors.map(err => `Linha ${err.line}: ${err.message}`).join('\n');
          console.log('❌ Erros de validação:', errorMessages);
          Alert.alert(
            'Erros na validação de Ativos',
            `Foram encontrados os seguintes erros:\n\n${errorMessages}`,
            [{ text: 'OK' }]
          );
          return false;
        }

        if (validation.warnings.length > 0) {
          const warningMessages = validation.warnings.map(warn => `Linha ${warn.line}: ${warn.message}`).join('\n');
          console.log('⚠️ Avisos de validação de Ativos:', warningMessages);
        }

        if (validation.processedData.length > 0) {
          console.log('💾 Preparando dados para salvamento...');
          const processedAtivos = validation.processedData.map((ativo: any, index: number) => ({
            ...ativo,
            id: Date.now() + index, // Gerar novo ID baseado no timestamp
            createdAt: importDate, // Data de importação
            updatedAt: '' // Deixar vazio conforme solicitado
          }));
          
          console.log('🔧 Exemplo do primeiro ativo processado:', JSON.stringify(processedAtivos[0], null, 2));
          console.log('💾 Salvando no AsyncStorage...');
          
          await AsyncStorage.setItem('carteira-investimentos-ativos', JSON.stringify(processedAtivos));
          console.log(`✅ ${processedAtivos.length} ativos importados com sucesso`);
          importSuccess = true;
        } else {
          console.log('⚠️ Nenhum ativo válido foi processado para importação');
        }
      }

      // Validar e importar proventos
      if (csvData.proventos) {
        console.log('🔍 Validando dados de proventos...');
        console.log(`📊 Tamanho do conteúdo de proventos: ${csvData.proventos.length} caracteres`);
        
        const validation = validateProventosCSV(csvData.proventos);
        
        console.log(`✅ Validação de proventos concluída: ${validation.isValid}`);
        console.log(`❌ Erros encontrados: ${validation.errors.length}`);
        console.log(`⚠️ Avisos encontrados: ${validation.warnings.length}`);
        console.log(`📋 Registros processados: ${validation.processedData.length}`);
        
        if (validation.errors.length > 0) {
          console.log('❌ Detalhes dos erros de validação:', validation.errors);
          console.log('❌ Erros de validação de Proventos - Mostrando Dialog...');
          
          // Converter erros para o formato do dialog
          const dialogErrors: ValidationError[] = validation.errors.map(err => ({
            type: err.type,
            line: err.line,
            field: err.field,
            value: err.value,
            expected: err.expected,
            message: err.message
          }));
          
          // Mostrar dialog com erros
          setValidationErrors(dialogErrors);
          setShowValidationDialog(true);
          
          console.log('❌ Dialog de erro configurado para exibição');
          return false;
        }

        if (validation.warnings.length > 0) {
          const warningMessages = validation.warnings.map(warn => `Linha ${warn.line}: ${warn.message}`).join('\n');
          console.log('⚠️ Avisos de validação de Proventos:', warningMessages);
        }

        if (validation.processedData.length > 0) {
          console.log('💾 Preparando dados de proventos para salvamento...');
          const processedProventos = validation.processedData.map((provento: any, index: number) => ({
            ...provento,
            id: Date.now() + index, // Gerar novo ID baseado no timestamp
            data: parseDDMMAAAAToISO(provento.data) || provento.data,
            createdAt: importDate, // Data de importação
            updatedAt: '' // Deixar vazio conforme solicitado
          }));
          
          console.log('🔧 Exemplo do primeiro provento processado:', JSON.stringify(processedProventos[0], null, 2));
          console.log('💾 Salvando proventos no AsyncStorage...');
          
          await AsyncStorage.setItem('carteira-investimentos-proventos', JSON.stringify(processedProventos));
          console.log(`✅ ${processedProventos.length} proventos importados com sucesso`);
          importSuccess = true;
        } else {
          console.log('⚠️ Nenhum provento válido foi processado para importação');
        }
      }

      // Importar movimentações (mantendo lógica básica por enquanto)
      if (csvData.movimentacoes) {
        console.log('🔍 Validando dados de movimentações...');
        console.log(`📊 Tamanho do conteúdo de movimentações: ${csvData.movimentacoes.length} caracteres`);
        
        const validation = validateMovimentacoesCSV(csvData.movimentacoes);
        
        console.log(`✅ Validação de movimentações concluída: ${validation.isValid}`);
        console.log(`❌ Erros encontrados: ${validation.errors.length}`);
        console.log(`⚠️ Avisos encontrados: ${validation.warnings.length}`);
        console.log(`📋 Registros processados: ${validation.processedData.length}`);
        
        if (validation.errors.length > 0) {
          console.log('❌ Detalhes dos erros de validação:', validation.errors);
          console.log('❌ Erros de validação de Movimentações - Mostrando Dialog...');
          
          // Converter erros para o formato do dialog
          const dialogErrors: ValidationError[] = validation.errors.map(err => ({
            type: err.type,
            line: err.line,
            field: err.field,
            value: err.value,
            expected: err.expected,
            message: err.message
          }));
          
          // Mostrar dialog com erros
          setValidationErrors(dialogErrors);
          setShowValidationDialog(true);
          
          console.log('❌ Dialog de erro configurado para exibição');
          return false;
        }

        if (validation.warnings.length > 0) {
          const warningMessages = validation.warnings.map(warn => `Linha ${warn.line}: ${warn.message}`).join('\n');
          console.log('⚠️ Avisos de validação de Movimentações:', warningMessages);
        }

        if (validation.processedData.length > 0) {
          console.log('💾 Preparando dados de movimentações para salvamento...');
          const processedMovimentacoes = validation.processedData.map((mov: any, index: number) => ({
            ...mov,
            id: Date.now() + index, // Gerar novo ID baseado no timestamp
            data: parseDDMMAAAAToISO(mov.data) || mov.data,
            createdAt: importDate, // Data de importação
            updatedAt: '' // Deixar vazio conforme solicitado
          }));
          
          console.log('🔧 Exemplo da primeira movimentação processada:', JSON.stringify(processedMovimentacoes[0], null, 2));
          console.log('💾 Salvando movimentações no AsyncStorage...');
          
          await AsyncStorage.setItem('carteira-investimentos-movimentacoes', JSON.stringify(processedMovimentacoes));
          console.log(`✅ ${processedMovimentacoes.length} movimentações importadas com sucesso`);
          importSuccess = true;
        } else {
          console.log('⚠️ Nenhuma movimentação válida foi processada para importação');
        }
      }

      if (importSuccess) {
        console.log('🔄 Dados importados com sucesso, iniciando recarga...');
        
        // Recarregar dados locais  
        await loadTiposAtivos();
        
        console.log('✅ Dados CSV importados com sucesso');
        Alert.alert(
          'Sucesso', 
          'Dados CSV importados com sucesso!\n\n📊 Navegue para outras telas para ver os novos dados.',
          [{ text: 'OK' }]
        );
        return true;
      } else {
        console.log('⚠️ Nenhum dado foi importado');
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

  // Função auxiliar para leitura robusta de arquivos (sem dependências da expo-file-system)
  const readFileRobust = useCallback(async (fileUri: string, fileName: string): Promise<string> => {
    console.log('📁 Iniciando leitura robusta...');
    console.log(`   URI: ${fileUri}`);
    console.log(`   Nome: ${fileName}`);
    
    // Método 1: Fetch API (funciona para todos os tipos de URI)
    try {
      console.log('🔧 Tentando Fetch API...');
      const response = await fetch(fileUri);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      console.log(`✅ Fetch API sucesso: ${content.length} chars`);
      
      // Verificar se o conteúdo não está vazio
      if (!content || content.trim().length === 0) {
        throw new Error('Arquivo está vazio ou não pôde ser lido');
      }
      
      return content;
      
    } catch (fetchError) {
      console.log('❌ Fetch API falhou, tentando XMLHttpRequest...');
      
      // Método 2: XMLHttpRequest (fallback)
      try {
        const content = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', fileUri, true);
          xhr.responseType = 'text';
          
          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve(xhr.responseText);
            } else {
              reject(new Error(`XMLHttpRequest falhou: ${xhr.status}`));
            }
          };
          
          xhr.onerror = () => reject(new Error('XMLHttpRequest error'));
          xhr.ontimeout = () => reject(new Error('XMLHttpRequest timeout'));
          
          xhr.timeout = 10000; // 10 segundos
          xhr.send();
        });
        
        console.log(`✅ XMLHttpRequest sucesso: ${content.length} chars`);
        return content;
        
      } catch (xhrError) {
        console.log('❌ XMLHttpRequest também falhou...');
        
        // Método 3: FileReader com Blob (último recurso)
        try {
          console.log('🔧 Tentando FileReader...');
          
          // Primeiro, obter o blob
          const blobResponse = await fetch(fileUri);
          if (!blobResponse.ok) {
            throw new Error(`Blob fetch falhou: ${blobResponse.status}`);
          }
          
          const blob = await blobResponse.blob();
          
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('FileReader error'));
            reader.readAsText(blob, 'utf-8');
          });
          
          console.log(`✅ FileReader sucesso: ${content.length} chars`);
          return content;
          
        } catch (readerError) {
          const fetchMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
          const xhrMsg = xhrError instanceof Error ? xhrError.message : String(xhrError);
          const readerMsg = readerError instanceof Error ? readerError.message : String(readerError);
          
          throw new Error(`Todos os métodos falharam:\n1. Fetch: ${fetchMsg}\n2. XHR: ${xhrMsg}\n3. FileReader: ${readerMsg}`);
        }
      }
    }
  }, []);

  // Selecionar e importar arquivos CSV
  const selectAndImportCSVFiles = useCallback(async (): Promise<boolean> => {
    try {
      console.log('📱 Iniciando seleção de arquivos...');
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/plain'],
        multiple: true,
        copyToCacheDirectory: true, // CRUCIAL para Content URIs do Android
      });

      console.log('📱 Resultado da seleção:', result);

      if (result.canceled) {
        console.log('❌ Seleção cancelada pelo usuário');
        return false;
      }

      const csvData: { ativos?: string; proventos?: string; movimentacoes?: string } = {};
      
      console.log(`📁 Arquivos selecionados: ${result.assets.length}`);
      
      // Processar arquivos selecionados
      for (const file of result.assets) {
        try {
          console.log(`📄 Processando arquivo: ${file.name}`);
          console.log(`📄 URI do arquivo: ${file.uri}`);
          
          // Ler o conteúdo real do arquivo
          let fileContent;
          try {
            // Usar a API mais simples e compatível
            console.log('� Lendo conteúdo do arquivo...');
            fileContent = await readFileRobust(file.uri, file.name);
            console.log(`✅ Arquivo lido com sucesso: ${fileContent.length} caracteres`);
          } catch (readError) {
            console.error(`❌ Erro ao ler arquivo ${file.name}:`, readError);
            const errorMessage = readError instanceof Error ? readError.message : String(readError);
            Alert.alert('Erro', `Não foi possível ler o arquivo ${file.name}. Erro: ${errorMessage}`);
            continue;
          }
          
          const fileName = file.name.toLowerCase();
          
          console.log(`📝 Conteúdo lido do arquivo ${file.name} (${fileContent.length} caracteres)`);
          
          // Identificar tipo de arquivo baseado no nome EXATO
          if (fileName === 'ativos.csv') {
            csvData.ativos = fileContent;
            console.log('✅ Arquivo identificado como: ATIVOS');
          } else if (fileName === 'proventos.csv') {
            csvData.proventos = fileContent;
            console.log('✅ Arquivo identificado como: PROVENTOS');
          } else if (fileName === 'movimentacoes.csv') {
            csvData.movimentacoes = fileContent;
            console.log('✅ Arquivo identificado como: MOVIMENTAÇÕES');
          } else {
            console.log(`❌ Arquivo com nome incorreto: ${file.name}`);
            console.log('📋 Nomes aceitos: ativos.csv, proventos.csv, movimentacoes.csv');
            Alert.alert(
              'Nome de arquivo incorreto', 
              `O arquivo "${file.name}" não possui um nome válido.\n\nNomes aceitos:\n• ativos.csv\n• proventos.csv\n• movimentacoes.csv\n\nRenomeie o arquivo e tente novamente.`
            );
            continue;
          }
          
        } catch (fileError) {
          console.error(`❌ Erro ao processar arquivo ${file.name}:`, fileError);
          Alert.alert(
            'Erro na leitura',
            `Não foi possível processar o arquivo ${file.name}.\n\nErro: ${fileError instanceof Error ? fileError.message : 'Erro desconhecido'}`
          );
          continue;
        }
      }

      if (Object.keys(csvData).length === 0) {
        Alert.alert(
          'Nenhum arquivo válido',
          'Nenhum arquivo com nome válido foi encontrado.\n\nNomes aceitos:\n• ativos.csv\n• proventos.csv\n• movimentacoes.csv'
        );
        return false;
      }

      console.log(`📋 Arquivos identificados: ${Object.keys(csvData).join(', ')}`);
      return await importDataCSV(csvData);
      
    } catch (error) {
      console.error('❌ Erro na seleção de arquivos:', error);
      Alert.alert('Erro', `Falha ao selecionar ou importar arquivos.\n\nErro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
    
    // Validation errors dialog
    validationErrors,
    showValidationDialog,
    clearValidationErrors,
    
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