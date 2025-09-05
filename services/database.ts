import { Ativo, CreateAtivoInput, DistribuicaoSegmento, DistribuicaoTipo, PortfolioStats, UpdateAtivoInput } from '@/types/ativo';
import { CreateMovimentacaoInput, Movimentacao, MovimentacaoFilter, MovimentacaoStats, UpdateMovimentacaoInput } from '@/types/movimentacao';
import { CreateProventoInput, Provento, ProventoFilter, ProventoStats, UpdateProventoInput } from '@/types/provento';
import AsyncStorage from '@react-native-async-storage/async-storage';

class DatabaseService {
  private isInitialized = false;
  private readonly STORAGE_KEY = 'carteira-investimentos-ativos';
  private readonly PROVENTOS_STORAGE_KEY = 'carteira-investimentos-proventos';
  private readonly MOVIMENTACOES_STORAGE_KEY = 'carteira-investimentos-movimentacoes';

  constructor() {
    // AsyncStorage não precisa de configuração inicial
  }

  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Verificar se existem dados de ativos
      const ativosData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!ativosData) {
        // Inicializar com array vazio
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        console.log('✅ Armazenamento de ativos inicializado com dados vazios');
      }

      // Verificar se existem dados de proventos
      const proventosData = await AsyncStorage.getItem(this.PROVENTOS_STORAGE_KEY);
      if (!proventosData) {
        // Inicializar com array vazio
        await AsyncStorage.setItem(this.PROVENTOS_STORAGE_KEY, JSON.stringify([]));
        console.log('✅ Armazenamento de proventos inicializado com dados vazios');
      }

      // Verificar se existem dados de movimentações
      const movimentacoesData = await AsyncStorage.getItem(this.MOVIMENTACOES_STORAGE_KEY);
      if (!movimentacoesData) {
        // Inicializar com array vazio
        await AsyncStorage.setItem(this.MOVIMENTACOES_STORAGE_KEY, JSON.stringify([]));
        console.log('✅ Armazenamento de movimentações inicializado com dados vazios');
      }
      
      this.isInitialized = true;
      console.log('✅ Banco de dados AsyncStorage inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar AsyncStorage:', error);
      throw error;
    }
  }

  // Métodos auxiliares para armazenamento
  private async saveAtivos(ativos: Ativo[]): Promise<void> {
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(ativos));
  }

  private async getAtivosFromStorage(): Promise<Ativo[]> {
    try {
      const ativosString = await AsyncStorage.getItem(this.STORAGE_KEY);
      return ativosString ? JSON.parse(ativosString) : [];
    } catch (error) {
      console.error('❌ Erro ao carregar ativos:', error);
      return [];
    }
  }

  private async generateId(): Promise<number> {
    const ativos = await this.getAtivosFromStorage();
    return ativos.length > 0 ? Math.max(...ativos.map(a => a.id)) + 1 : 1;
  }

  // Métodos auxiliares para proventos
  private async saveProventos(proventos: Provento[]): Promise<void> {
    await AsyncStorage.setItem(this.PROVENTOS_STORAGE_KEY, JSON.stringify(proventos));
  }

  private async getProventosFromStorage(): Promise<Provento[]> {
    try {
      const proventosString = await AsyncStorage.getItem(this.PROVENTOS_STORAGE_KEY);
      return proventosString ? JSON.parse(proventosString) : [];
    } catch (error) {
      console.error('❌ Erro ao carregar proventos:', error);
      return [];
    }
  }

  private async generateProventoId(): Promise<number> {
    const proventos = await this.getProventosFromStorage();
    return proventos.length > 0 ? Math.max(...proventos.map(p => p.id)) + 1 : 1;
  }

  // Métodos auxiliares para movimentações
  private async saveMovimentacoes(movimentacoes: Movimentacao[]): Promise<void> {
    await AsyncStorage.setItem(this.MOVIMENTACOES_STORAGE_KEY, JSON.stringify(movimentacoes));
  }

  private async getMovimentacoesFromStorage(): Promise<Movimentacao[]> {
    try {
      const movimentacoesString = await AsyncStorage.getItem(this.MOVIMENTACOES_STORAGE_KEY);
      return movimentacoesString ? JSON.parse(movimentacoesString) : [];
    } catch (error) {
      console.error('❌ Erro ao carregar movimentações:', error);
      return [];
    }
  }

  private async generateMovimentacaoId(): Promise<number> {
    const movimentacoes = await this.getMovimentacoesFromStorage();
    return movimentacoes.length > 0 ? Math.max(...movimentacoes.map(m => m.id)) + 1 : 1;
  }

  // CREATE
  async createAtivo(input: CreateAtivoInput): Promise<number | null> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const ativos = await this.getAtivosFromStorage();
      const id = await this.generateId();
      const now = new Date().toISOString();

      const novoAtivo: Ativo = {
        id,
        ticker: input.ticker,
        nome: input.nome,
        tipo: input.tipo,
        preco: input.preco,
        quantidade: input.quantidade,
        valorTotal: input.preco * input.quantidade,
        segmento: input.segmento,
        administrador: input.administrador,
        status: input.status,
        site: input.site,
        observacoes: input.observacoes,
        createdAt: now,
        updatedAt: now,
      };

      ativos.push(novoAtivo);
      await this.saveAtivos(ativos);

      console.log(`✅ Ativo criado com ID: ${id}`);
      return id;
    } catch (error) {
      console.error('❌ Erro ao criar ativo:', error);
      throw error;
    }
  }

  // READ
  async getAtivos(): Promise<Ativo[]> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const ativos = await this.getAtivosFromStorage();
      // Ordenar por data de criação (mais recentes primeiro)
      return ativos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('❌ Erro ao buscar ativos:', error);
      throw error;
    }
  }

  async getAtivoById(id: number): Promise<Ativo | null> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const ativos = await this.getAtivosFromStorage();
      const ativo = ativos.find(a => a.id === id);
      return ativo || null;
    } catch (error) {
      console.error('❌ Erro ao buscar ativo por ID:', error);
      throw error;
    }
  }

  // UPDATE
  async updateAtivo(input: UpdateAtivoInput): Promise<void> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const ativos = await this.getAtivosFromStorage();
      const index = ativos.findIndex(a => a.id === input.id);

      if (index === -1) {
        throw new Error(`Ativo com ID ${input.id} não encontrado`);
      }

      const ativoAtualizado: Ativo = {
        ...ativos[index],
        ticker: input.ticker,
        nome: input.nome,
        tipo: input.tipo,
        preco: input.preco,
        quantidade: input.quantidade,
        valorTotal: input.preco * input.quantidade,
        segmento: input.segmento,
        administrador: input.administrador,
        status: input.status,
        site: input.site,
        observacoes: input.observacoes,
        updatedAt: new Date().toISOString(),
      };

      ativos[index] = ativoAtualizado;
      await this.saveAtivos(ativos);

      console.log(`✅ Ativo ${input.id} atualizado com sucesso`);
    } catch (error) {
      console.error('❌ Erro ao atualizar ativo:', error);
      throw error;
    }
  }

  // DELETE
  async deleteAtivo(id: number): Promise<void> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const ativos = await this.getAtivosFromStorage();
      const index = ativos.findIndex(a => a.id === id);

      if (index === -1) {
        throw new Error(`Ativo com ID ${id} não encontrado`);
      }

      ativos.splice(index, 1);
      await this.saveAtivos(ativos);

      console.log(`✅ Ativo ${id} removido com sucesso`);
    } catch (error) {
      console.error('❌ Erro ao deletar ativo:', error);
      throw error;
    }
  }

  // SEARCH
  async searchAtivos(query: string): Promise<Ativo[]> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const ativos = await this.getAtivosFromStorage();
      const searchTerm = query.toLowerCase();

      const resultado = ativos.filter(ativo => 
        ativo.ticker.toLowerCase().includes(searchTerm) ||
        ativo.nome.toLowerCase().includes(searchTerm) ||
        (ativo.segmento && ativo.segmento.toLowerCase().includes(searchTerm))
      );

      // Ordenar por ticker
      return resultado.sort((a, b) => a.ticker.localeCompare(b.ticker));
    } catch (error) {
      console.error('❌ Erro ao buscar ativos:', error);
      throw error;
    }
  }

  // PORTFOLIO STATS
  async getPortfolioStats(): Promise<PortfolioStats | null> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const ativos = await this.getAtivosFromStorage();
      
      if (ativos.length === 0) {
        return {
          valorTotal: 0,
          rendimentoTotal: 0,
          rendimentoPercentual: 0,
          ativosTotal: 0,
        };
      }

      const valorTotal = ativos.reduce((sum, ativo) => sum + ativo.valorTotal, 0);

      return {
        valorTotal,
        rendimentoTotal: 0, // Será implementado quando tiver histórico de preços
        rendimentoPercentual: 0, // Será implementado quando tiver histórico de preços
        ativosTotal: ativos.length,
      };
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas do portfolio:', error);
      throw error;
    }
  }

  // DISTRIBUIÇÃO POR TIPO
  async getDistribuicaoPorTipo(): Promise<DistribuicaoTipo[]> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const ativos = await this.getAtivosFromStorage();
      const valorTotal = ativos.reduce((sum, ativo) => sum + ativo.valorTotal, 0);

      if (valorTotal === 0) return [];

      // Agrupar por tipo
      const grupos: { [key: string]: { valor: number; quantidade: number } } = {};

      ativos.forEach(ativo => {
        if (!grupos[ativo.tipo]) {
          grupos[ativo.tipo] = { valor: 0, quantidade: 0 };
        }
        grupos[ativo.tipo].valor += ativo.valorTotal;
        grupos[ativo.tipo].quantidade += 1;
      });

      // Converter para array e calcular percentuais
      const resultado: DistribuicaoTipo[] = Object.entries(grupos).map(([tipo, dados]) => ({
        tipo: tipo as 'acao' | 'fii' | 'renda_fixa' | 'cripto',
        valor: dados.valor,
        percentual: (dados.valor / valorTotal) * 100,
        quantidade: dados.quantidade,
      }));

      // Ordenar por valor (maior primeiro)
      return resultado.sort((a, b) => b.valor - a.valor);
    } catch (error) {
      console.error('❌ Erro ao calcular distribuição por tipo:', error);
      return [];
    }
  }

  // DISTRIBUIÇÃO POR SEGMENTO
  async getDistribuicaoPorSegmento(): Promise<DistribuicaoSegmento[]> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const ativos = await this.getAtivosFromStorage();
      const valorTotal = ativos.reduce((sum, ativo) => sum + ativo.valorTotal, 0);

      if (valorTotal === 0) return [];

      // Agrupar por segmento
      const grupos: { [key: string]: { valor: number; quantidade: number } } = {};

      ativos.forEach(ativo => {
        const segmento = ativo.segmento || 'Sem segmento';
        if (!grupos[segmento]) {
          grupos[segmento] = { valor: 0, quantidade: 0 };
        }
        grupos[segmento].valor += ativo.valorTotal;
        grupos[segmento].quantidade += 1;
      });

      // Converter para array e calcular percentuais
      const resultado: DistribuicaoSegmento[] = Object.entries(grupos).map(([segmento, dados]) => ({
        segmento,
        valor: dados.valor,
        percentual: (dados.valor / valorTotal) * 100,
        quantidade: dados.quantidade,
      }));

      // Ordenar por valor (maior primeiro)
      return resultado.sort((a, b) => b.valor - a.valor);
    } catch (error) {
      console.error('❌ Erro ao calcular distribuição por segmento:', error);
      return [];
    }
  }

  // TOP ATIVOS
  async getTopAtivos(limit: number = 5): Promise<Ativo[]> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const ativos = await this.getAtivosFromStorage();
      
      return ativos
        .sort((a, b) => b.valorTotal - a.valorTotal)
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Erro ao buscar top ativos:', error);
      return [];
    }
  }

  // UTILITY METHODS
  async getAtivosByTipo(tipo: string): Promise<Ativo[]> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const ativos = await this.getAtivosFromStorage();
      const resultado = ativos.filter(ativo => ativo.tipo === tipo);
      
      return resultado.sort((a, b) => a.ticker.localeCompare(b.ticker));
    } catch (error) {
      console.error('❌ Erro ao buscar ativos por tipo:', error);
      return [];
    }
  }

  async getAtivosBySegmento(segmento: string): Promise<Ativo[]> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const ativos = await this.getAtivosFromStorage();
      const resultado = ativos.filter(ativo => ativo.segmento === segmento);
      
      return resultado.sort((a, b) => a.ticker.localeCompare(b.ticker));
    } catch (error) {
      console.error('❌ Erro ao buscar ativos por segmento:', error);
      return [];
    }
  }

  // DATABASE MANAGEMENT
  async clearAllData(): Promise<void> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
      console.log('✅ Todos os dados foram removidos');
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
      throw error;
    }
  }

  async closeDatabase(): Promise<void> {
    try {
      // AsyncStorage não precisa ser fechado explicitamente
      this.isInitialized = false;
      console.log('✅ Banco de dados fechado');
    } catch (error) {
      console.error('❌ Erro ao fechar banco de dados:', error);
      throw error;
    }
  }

  // MÉTODOS EXTRAS PARA AsyncStorage
  async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        if (key.startsWith('carteira-investimentos')) {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            totalSize += new Blob([value]).size;
          }
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('❌ Erro ao calcular tamanho do storage:', error);
      return 0;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(key => key.startsWith('carteira-investimentos'));
    } catch (error) {
      console.error('❌ Erro ao obter chaves:', error);
      return [];
    }
  }

  async exportData(): Promise<string> {
    const ativos = await this.getAtivosFromStorage();
    return JSON.stringify({
      ativos,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      if (data.ativos && Array.isArray(data.ativos)) {
        await this.saveAtivos(data.ativos);
        console.log('✅ Dados importados com sucesso');
      } else {
        throw new Error('Formato de dados inválido');
      }
    } catch (error) {
      console.error('❌ Erro ao importar dados:', error);
      throw error;
    }
  }

  // =============================================================================
  // MÉTODOS PARA PROVENTOS
  // =============================================================================

  // CREATE PROVENTO
  async createProvento(input: CreateProventoInput): Promise<number | null> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const proventos = await this.getProventosFromStorage();
      const ativos = await this.getAtivosFromStorage();
      
      // Verificar se o ativo existe
      const ativo = ativos.find(a => a.id === input.ativoId);
      if (!ativo) {
        throw new Error('Ativo não encontrado');
      }

      const id = await this.generateProventoId();
      const now = new Date().toISOString();

      const novoProvento: Provento = {
        id,
        ativoId: input.ativoId,
        ativoTicker: ativo.ticker,
        ativoNome: ativo.nome,
        data: input.data,
        valor: input.valor,
        tipo: input.tipo,
        observacoes: input.observacoes,
        createdAt: now,
        updatedAt: now,
      };

      proventos.push(novoProvento);
      await this.saveProventos(proventos);

      console.log(`✅ Provento criado com ID: ${id}`);
      return id;
    } catch (error) {
      console.error('❌ Erro ao criar provento:', error);
      throw error;
    }
  }

  // READ PROVENTOS
  async getProventos(filter?: ProventoFilter): Promise<Provento[]> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      let proventos = await this.getProventosFromStorage();
      
      // Aplicar filtros se fornecidos
      if (filter) {
        if (filter.ativoId) {
          proventos = proventos.filter(p => p.ativoId === filter.ativoId);
        }
        if (filter.tipo) {
          proventos = proventos.filter(p => p.tipo === filter.tipo);
        }
        if (filter.dataInicio) {
          proventos = proventos.filter(p => p.data >= filter.dataInicio!);
        }
        if (filter.dataFim) {
          proventos = proventos.filter(p => p.data <= filter.dataFim!);
        }
        if (filter.valorMinimo) {
          proventos = proventos.filter(p => p.valor >= filter.valorMinimo!);
        }
        if (filter.valorMaximo) {
          proventos = proventos.filter(p => p.valor <= filter.valorMaximo!);
        }
      }

      // Ordenar por data (mais recentes primeiro)
      return proventos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    } catch (error) {
      console.error('❌ Erro ao buscar proventos:', error);
      return [];
    }
  }

  // GET PROVENTO BY ID
  async getProventoById(id: number): Promise<Provento | null> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const proventos = await this.getProventosFromStorage();
      return proventos.find(p => p.id === id) || null;
    } catch (error) {
      console.error('❌ Erro ao buscar provento por ID:', error);
      return null;
    }
  }

  // UPDATE PROVENTO
  async updateProvento(input: UpdateProventoInput): Promise<boolean> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const proventos = await this.getProventosFromStorage();
      const ativos = await this.getAtivosFromStorage();
      const index = proventos.findIndex(p => p.id === input.id);

      if (index === -1) {
        throw new Error('Provento não encontrado');
      }

      // Verificar se o ativo existe
      const ativo = ativos.find(a => a.id === input.ativoId);
      if (!ativo) {
        throw new Error('Ativo não encontrado');
      }

      const now = new Date().toISOString();
      proventos[index] = {
        ...proventos[index],
        ativoId: input.ativoId,
        ativoTicker: ativo.ticker,
        ativoNome: ativo.nome,
        data: input.data,
        valor: input.valor,
        tipo: input.tipo,
        observacoes: input.observacoes,
        updatedAt: now,
      };

      await this.saveProventos(proventos);
      console.log(`✅ Provento atualizado: ${input.id}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar provento:', error);
      throw error;
    }
  }

  // DELETE PROVENTO
  async deleteProvento(id: number): Promise<boolean> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const proventos = await this.getProventosFromStorage();
      const index = proventos.findIndex(p => p.id === id);

      if (index === -1) {
        throw new Error('Provento não encontrado');
      }

      proventos.splice(index, 1);
      await this.saveProventos(proventos);

      console.log(`✅ Provento deletado: ${id}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar provento:', error);
      throw error;
    }
  }

  // ESTATÍSTICAS DOS PROVENTOS
  async getProventoStats(): Promise<ProventoStats> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const proventos = await this.getProventosFromStorage();
      const now = new Date();
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
      const inicioAno = new Date(now.getFullYear(), 0, 1);

      const totalRecebido = proventos.reduce((sum, p) => sum + p.valor, 0);
      
      const totalPorTipo = {
        rendimento: proventos.filter(p => p.tipo === 'rendimento').reduce((sum, p) => sum + p.valor, 0),
        jcp: proventos.filter(p => p.tipo === 'jcp').reduce((sum, p) => sum + p.valor, 0),
        dividendo: proventos.filter(p => p.tipo === 'dividendo').reduce((sum, p) => sum + p.valor, 0),
      };

      const proventosMes = proventos
        .filter(p => new Date(p.data) >= inicioMes)
        .reduce((sum, p) => sum + p.valor, 0);

      const proventosAno = proventos
        .filter(p => new Date(p.data) >= inicioAno)
        .reduce((sum, p) => sum + p.valor, 0);

      return {
        totalRecebido,
        totalPorTipo,
        proventosMes,
        proventosAno,
      };
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas de proventos:', error);
      return {
        totalRecebido: 0,
        totalPorTipo: { rendimento: 0, jcp: 0, dividendo: 0 },
        proventosMes: 0,
        proventosAno: 0,
      };
    }
  }

  // =============================================================================
  // MÉTODOS PARA MOVIMENTAÇÕES
  // =============================================================================

  // CREATE MOVIMENTACAO
  async createMovimentacao(input: CreateMovimentacaoInput): Promise<number | null> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const movimentacoes = await this.getMovimentacoesFromStorage();
      const id = await this.generateMovimentacaoId();
      const now = new Date().toISOString();

      const valorTotal = input.valorUnitario * input.quantidade;

      const novaMovimentacao: Movimentacao = {
        id,
        ativo: input.ativo.toUpperCase(),
        quantidade: input.quantidade,
        segmento: input.segmento,
        data: input.data,
        valorUnitario: input.valorUnitario,
        valorTotal,
        operacao: input.operacao,
        observacao: input.observacao,
        createdAt: now,
        updatedAt: now,
      };

      movimentacoes.push(novaMovimentacao);
      await this.saveMovimentacoes(movimentacoes);

      console.log(`✅ Movimentação criada com ID: ${id}`);
      return id;
    } catch (error) {
      console.error('❌ Erro ao criar movimentação:', error);
      throw error;
    }
  }

  // READ MOVIMENTACOES
  async getMovimentacoes(filter?: MovimentacaoFilter): Promise<Movimentacao[]> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      let movimentacoes = await this.getMovimentacoesFromStorage();
      
      // Aplicar filtros se fornecidos
      if (filter) {
        if (filter.ativo) {
          movimentacoes = movimentacoes.filter(m => m.ativo.toLowerCase().includes(filter.ativo!.toLowerCase()));
        }
        if (filter.segmento) {
          movimentacoes = movimentacoes.filter(m => m.segmento === filter.segmento);
        }
        if (filter.operacao) {
          movimentacoes = movimentacoes.filter(m => m.operacao === filter.operacao);
        }
        if (filter.dataInicio) {
          movimentacoes = movimentacoes.filter(m => m.data >= filter.dataInicio!);
        }
        if (filter.dataFim) {
          movimentacoes = movimentacoes.filter(m => m.data <= filter.dataFim!);
        }
        if (filter.valorMinimo) {
          movimentacoes = movimentacoes.filter(m => m.valorTotal >= filter.valorMinimo!);
        }
        if (filter.valorMaximo) {
          movimentacoes = movimentacoes.filter(m => m.valorTotal <= filter.valorMaximo!);
        }
      }

      // Ordenar por data (mais recentes primeiro)
      return movimentacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    } catch (error) {
      console.error('❌ Erro ao buscar movimentações:', error);
      return [];
    }
  }

  // GET MOVIMENTACAO BY ID
  async getMovimentacaoById(id: number): Promise<Movimentacao | null> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const movimentacoes = await this.getMovimentacoesFromStorage();
      return movimentacoes.find(m => m.id === id) || null;
    } catch (error) {
      console.error('❌ Erro ao buscar movimentação por ID:', error);
      return null;
    }
  }

  // UPDATE MOVIMENTACAO
  async updateMovimentacao(input: UpdateMovimentacaoInput): Promise<boolean> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const movimentacoes = await this.getMovimentacoesFromStorage();
      const index = movimentacoes.findIndex(m => m.id === input.id);

      if (index === -1) {
        throw new Error('Movimentação não encontrada');
      }

      const now = new Date().toISOString();
      const valorTotal = input.valorUnitario * input.quantidade;

      movimentacoes[index] = {
        ...movimentacoes[index],
        ativo: input.ativo.toUpperCase(),
        quantidade: input.quantidade,
        segmento: input.segmento,
        data: input.data,
        valorUnitario: input.valorUnitario,
        valorTotal,
        operacao: input.operacao,
        observacao: input.observacao,
        updatedAt: now,
      };

      await this.saveMovimentacoes(movimentacoes);
      console.log(`✅ Movimentação atualizada: ${input.id}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar movimentação:', error);
      throw error;
    }
  }

  // DELETE MOVIMENTACAO
  async deleteMovimentacao(id: number): Promise<boolean> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const movimentacoes = await this.getMovimentacoesFromStorage();
      const index = movimentacoes.findIndex(m => m.id === id);

      if (index === -1) {
        throw new Error('Movimentação não encontrada');
      }

      movimentacoes.splice(index, 1);
      await this.saveMovimentacoes(movimentacoes);

      console.log(`✅ Movimentação deletada: ${id}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar movimentação:', error);
      throw error;
    }
  }

  // ESTATÍSTICAS DAS MOVIMENTAÇÕES
  async getMovimentacaoStats(): Promise<MovimentacaoStats> {
    try {
      if (!this.isInitialized) throw new Error('Database not initialized');

      const movimentacoes = await this.getMovimentacoesFromStorage();

      const totalInvestido = movimentacoes
        .filter(m => m.operacao === 'compra' || m.operacao === 'subscricao')
        .reduce((sum, m) => sum + m.valorTotal, 0);

      const totalRecebido = movimentacoes
        .filter(m => m.operacao === 'venda')
        .reduce((sum, m) => sum + m.valorTotal, 0);

      const saldoLiquido = totalRecebido - totalInvestido;
      const totalOperacoes = movimentacoes.length;

      const operacoesPorTipo = {
        compra: movimentacoes.filter(m => m.operacao === 'compra').length,
        venda: movimentacoes.filter(m => m.operacao === 'venda').length,
        subscricao: movimentacoes.filter(m => m.operacao === 'subscricao').length,
      };

      const volumeTotal = movimentacoes.reduce((sum, m) => sum + m.valorTotal, 0);

      return {
        totalInvestido,
        totalRecebido,
        saldoLiquido,
        totalOperacoes,
        operacoesPorTipo,
        volumeTotal,
      };
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas de movimentações:', error);
      return {
        totalInvestido: 0,
        totalRecebido: 0,
        saldoLiquido: 0,
        totalOperacoes: 0,
        operacoesPorTipo: { compra: 0, venda: 0, subscricao: 0 },
        volumeTotal: 0,
      };
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
