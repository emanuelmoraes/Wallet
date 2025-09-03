import { Ativo, CreateAtivoInput, DistribuicaoSegmento, DistribuicaoTipo, PortfolioStats, UpdateAtivoInput } from '@/types/ativo';
import AsyncStorage from '@react-native-async-storage/async-storage';

class DatabaseService {
  private isInitialized = false;
  private readonly STORAGE_KEY = 'carteira-investimentos-ativos';

  constructor() {
    // AsyncStorage não precisa de configuração inicial
  }

  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Verificar se existem dados
      const ativosData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!ativosData) {
        // Inicializar com array vazio
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        console.log('✅ Armazenamento inicializado com dados vazios');
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
}

// Export singleton instance
export const databaseService = new DatabaseService();
