import { useRentabilidade } from '@/hooks/useRentabilidade';
import { buttonStyles, screenSpecificStyles, sharedStyles } from '@/styles/sharedStyles';
import { PrecoAtualInput, RentabilidadeData } from '@/types/rentabilidade';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import CurrencyInput from 'react-native-currency-input';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  Surface,
  Text,
  TextInput,
  Title,
  useTheme
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function RentabilidadeScreen() {
  const theme = useTheme();
  const {
    rentabilidadeData,
    stats,
    loading,
    updating,
    refreshData,
    updatePrecoAtual,
  } = useRentabilidade();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAtivo, setEditingAtivo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<RentabilidadeData[]>([]);
  
  const [formData, setFormData] = useState<Partial<PrecoAtualInput>>({
    ativo: '',
    precoAtual: undefined,
  });

  // Filter data based on search
  useEffect(() => {
    if (!rentabilidadeData) {
      setFilteredData([]);
      return;
    }

    let filtered = rentabilidadeData;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.ativo.toLowerCase().includes(query) ||
        item.segmento.toLowerCase().includes(query)
      );
    }

    setFilteredData(filtered);
  }, [rentabilidadeData, searchQuery]);

  const handleOpenModal = (ativo?: string) => {
    if (ativo) {
      const data = rentabilidadeData.find(item => item.ativo === ativo);
      setEditingAtivo(ativo);
      setFormData({
        ativo: ativo,
        precoAtual: data?.precoAtual || 0,
      });
    } else {
      setEditingAtivo(null);
      setFormData({
        ativo: '',
        precoAtual: undefined,
      });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingAtivo(null);
    setFormData({
      ativo: '',
      precoAtual: undefined,
    });
  };

  const handleSavePreco = async () => {
    if (!formData.ativo || !formData.precoAtual) {
      return;
    }

    const success = await updatePrecoAtual({
      ativo: formData.ativo,
      precoAtual: formData.precoAtual,
    });

    if (success) {
      handleCloseModal();
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getSegmentoIcon = (segmento: string) => {
    switch (segmento.toLowerCase()) {
      case 'ação':
      case 'acao': return 'chart-line';
      case 'fii':
      case 'fi': return 'office-building';
      case 'etf': return 'chart-donut';
      case 'fi_infra': return 'road-variant';
      default: return 'chart-pie';
    }
  };

  const getSegmentoColor = (segmento: string) => {
    switch (segmento.toLowerCase()) {
      case 'ação':
      case 'acao': return theme.colors.primary;
      case 'fii':
      case 'fi': return theme.colors.secondary;
      case 'etf': return '#2196F3';
      case 'fi_infra': return '#9C27B0';
      default: return theme.colors.outline;
    }
  };

  const getLucroColor = (valor: number) => {
    if (valor > 0) return '#4CAF50'; // Verde para lucro
    if (valor < 0) return '#F44336'; // Vermelho para prejuízo
    return theme.colors.onSurface; // Cor padrão para zero
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={sharedStyles.container}>
          <View style={sharedStyles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={sharedStyles.loadingText}>Carregando dados de rentabilidade...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={sharedStyles.container}>
        {/* Header com estatísticas */}
        {stats && (
          <Surface style={sharedStyles.statsContainer}>
            <View style={sharedStyles.titleSection}>
              <Title style={sharedStyles.mainTitle}>Resumo da Carteira</Title>
            </View>
            <View style={sharedStyles.statsRow}>
              <View style={sharedStyles.statItem}>
                <Text variant="headlineSmall" style={[sharedStyles.statValue, { color: '#f44336' }]}>
                  {formatCurrency(stats.totalInvestido)}
                </Text>
                <Text variant="bodyMedium" style={sharedStyles.statLabel}>Total Investido</Text>
              </View>
              <View style={sharedStyles.statItem}>
                <Text variant="headlineSmall" style={[sharedStyles.statValue, { color: '#2196F3' }]}>
                  {formatCurrency(stats.valorAtual)}
                </Text>
                <Text variant="bodyMedium" style={sharedStyles.statLabel}>Valor Atual</Text>
              </View>
              <View style={sharedStyles.statItem}>
                <Text variant="headlineSmall" style={[sharedStyles.statValue, { color: '#4CAF50' }]}>
                  {formatCurrency(stats.totalProventos)}
                </Text>
                <Text variant="bodyMedium" style={sharedStyles.statLabel}>Proventos</Text>
              </View>
            </View>
          </Surface>
        )}

        {/* Search */}
        <Searchbar
          placeholder="Buscar por ativo ou segmento..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={sharedStyles.searchbar}
        />

        {/* Lista de ativos */}
        <ScrollView
          style={sharedStyles.scrollView}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refreshData} />
          }
        >
          {filteredData.map((item) => (
            <Card key={item.ativo} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Avatar.Icon 
                      size={40} 
                      icon={getSegmentoIcon(item.segmento)}
                      style={[styles.avatar, { backgroundColor: getSegmentoColor(item.segmento) }]}
                    />
                    <View style={styles.titleContainer}>
                      <Text variant="titleMedium">{item.ativo}</Text>
                      <Text variant="bodySmall" style={styles.subtitle}>
                        {item.segmento}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <IconButton
                      icon="currency-usd"
                      size={20}
                      onPress={() => handleOpenModal(item.ativo)}
                      mode="outlined"
                    />
                  </View>
                </View>

                <Divider style={styles.divider} />

                {/* Todas as informações em uma única linha horizontal - Segunda linha */}
                <View style={styles.cardBody}>
                  <View style={styles.fullTableRow}>
                    <View style={styles.tableItem}>
                      <Text variant="bodySmall" style={styles.compactLabel}>Quantidade</Text>
                      <Text variant="bodySmall">{item.quantidade.toLocaleString('pt-BR')}</Text>
                    </View>
                    <View style={styles.tableItem}>
                      <Text variant="bodySmall" style={styles.compactLabel}>Preço Médio</Text>
                      <Text variant="bodySmall">{formatCurrency(item.precoMedio)}</Text>
                    </View>
                    <View style={styles.tableItem}>
                      <Text variant="bodySmall" style={styles.compactLabel}>Preço Atual</Text>
                      <Text variant="bodySmall">{formatCurrency(item.precoAtual)}</Text>
                    </View>
                    <View style={styles.tableItem}>
                      <Text variant="bodySmall" style={styles.compactLabel}>Investido</Text>
                      <Text variant="bodySmall">{formatCurrency(item.investido)}</Text>
                    </View>
                    <View style={styles.tableItem}>
                      <Text variant="bodySmall" style={styles.compactLabel}>Atual</Text>
                      <Text variant="bodySmall">{formatCurrency(item.atual)}</Text>
                    </View>
                    <View style={styles.tableItem}>
                      <Text variant="bodySmall" style={styles.compactLabel}>L/P</Text>
                      <Text 
                        variant="bodySmall" 
                        style={{ 
                          color: getLucroColor(item.lucroOuPrejuizo),
                          fontWeight: 'bold'
                        }}
                      >
                        {formatCurrency(item.lucroOuPrejuizo)}
                      </Text>
                    </View>
                    <View style={styles.tableItem}>
                      <Text variant="bodySmall" style={styles.compactLabel}>% L/P</Text>
                      <Text 
                        variant="bodySmall"
                        style={{ 
                          color: getLucroColor(item.percentualLucroOuPrejuizo),
                          fontWeight: 'bold'
                        }}
                      >
                        {formatPercentage(item.percentualLucroOuPrejuizo)}
                      </Text>
                    </View>
                    <View style={styles.tableItem}>
                      <Text variant="bodySmall" style={styles.compactLabel}>Proventos</Text>
                      <Text variant="bodySmall" style={{ color: '#4CAF50' }}>
                        {formatCurrency(item.proventos)}
                      </Text>
                    </View>
                    <View style={styles.tableItem}>
                      <Text variant="bodySmall" style={styles.compactLabel}>Rent. c/ Prov.</Text>
                      <Text 
                        variant="bodySmall"
                        style={{ 
                          color: getLucroColor(item.rentabilidadeComProventos),
                          fontWeight: 'bold'
                        }}
                      >
                        {formatPercentage(item.rentabilidadeComProventos)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}

          {filteredData.length === 0 && (
            <Surface style={styles.emptyState}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                {searchQuery ? 'Nenhum ativo encontrado' : 'Nenhum dado de rentabilidade'}
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                {searchQuery 
                  ? 'Tente ajustar sua busca'
                  : 'Cadastre ativos e movimentações para ver a rentabilidade'
                }
              </Text>
            </Surface>
          )}
        </ScrollView>

        {/* Modal para atualizar preço */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={handleCloseModal}
            contentContainerStyle={[sharedStyles.modal, { backgroundColor: theme.colors.surface }]}
          >
            <Text variant="titleLarge" style={{ marginBottom: 16 }}>
              Atualizar Preço Atual
            </Text>
            
            <View style={{ marginBottom: 16 }}>
              <TextInput
                label="Ativo"
                value={formData.ativo || ''}
                disabled={true}
                style={sharedStyles.input}
                mode="outlined"
              />

              <View style={sharedStyles.formGroup}>
                <Text style={sharedStyles.pickerLabel}>Preço Atual (R$)</Text>
                <CurrencyInput
                  value={formData.precoAtual || null}
                  onChangeValue={(value) => setFormData(prev => ({ ...prev, precoAtual: value || 0 }))}
                  prefix="R$ "
                  delimiter="."
                  separator=","
                  precision={2}
                  minValue={0}
                  style={[sharedStyles.currencyInput, { 
                    borderColor: theme.colors.outline,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface
                  }]}
                />
              </View>
            </View>

            <View style={sharedStyles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={handleCloseModal}
                style={sharedStyles.modalButton}
              >
                Cancelar
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSavePreco}
                loading={updating}
                disabled={updating || !formData.precoAtual}
                style={sharedStyles.modalButton}
              >
                Salvar
              </Button>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  ...sharedStyles,
  ...screenSpecificStyles,
  ...buttonStyles,
  
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  allInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  
  compactInfoItem: {
    width: '32%',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  singleRowGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  singleRowItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  
  fullTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  
  tableItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 1,
    minWidth: 60,
  },
  
  compactLabel: {
    opacity: 0.7,
    marginBottom: 2,
    textAlign: 'center',
    fontSize: 9,
  },
  
  miniDivider: {
    marginVertical: 8,
  },
  
  rentabilidadeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  
  rentabilidadeItem: {
    flex: 1,
    alignItems: 'center',
  },
});