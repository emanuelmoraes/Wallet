import { cardBackground, primaryGreen, secondaryGreen } from '@/constants/Colors';
import { useRentabilidade } from '@/hooks/useRentabilidade';
import { buttonStyles, screenSpecificStyles, sharedStyles } from '@/styles/sharedStyles';
import { PrecoAtualInput, RentabilidadeData } from '@/types/rentabilidade';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import CurrencyInput from 'react-native-currency-input';
import {
  ActivityIndicator,
  Button,
  Icon,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  Text,
  TextInput,
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
    ticker: '',
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
        ticker: ativo,
        precoAtual: data?.precoAtual || 0,
      });
    } else {
      setEditingAtivo(null);
      setFormData({
        ticker: '',
        precoAtual: undefined,
      });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingAtivo(null);
    setFormData({
      ticker: '',
      precoAtual: undefined,
    });
  };

  const handleSavePreco = async () => {
    if (!formData.ticker || !formData.precoAtual) {
      return;
    }

    const success = await updatePrecoAtual({
      ticker: formData.ticker,
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
            <ActivityIndicator size="large" color={primaryGreen} />
            <Text style={sharedStyles.loadingText}>
              Carregando dados de rentabilidade...
            </Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={sharedStyles.container}>
        <ScrollView
          style={sharedStyles.scrollView}
          contentContainerStyle={sharedStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Modern Header */}
          <LinearGradient
            colors={[primaryGreen, secondaryGreen]}
            style={sharedStyles.modernHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[sharedStyles.headerTitle, { color: '#FFFFFF' }]}>
              Rentabilidade
            </Text>
            <Text style={[sharedStyles.headerSubtitle, { color: '#FFFFFF90' }]}>
              Acompanhe o desempenho dos seus investimentos
            </Text>
          </LinearGradient>

          {/* Modern Search */}
          <View style={sharedStyles.searchContainer}>
            <Searchbar
              placeholder="Buscar por ativo ou segmento..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={sharedStyles.modernSearchbar}
              inputStyle={{ color: '#1E293B' }}
              iconColor={'#64748B'}
              placeholderTextColor={'#64748B'}
            />
          </View>

          {/* Lista de ativos */}
          {filteredData.map((item) => (
            <View key={item.ativo} style={sharedStyles.modernCard}>
              <View style={sharedStyles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Icon
                    source={getSegmentoIcon(item.segmento)}
                    size={24}
                    color={getSegmentoColor(item.segmento)}
                  />
                </View>
                <View style={sharedStyles.cardTitleContainer}>
                  <Text variant="titleMedium" style={sharedStyles.cardTitle}>
                    {item.ativo}
                  </Text>
                  <Text variant="bodySmall" style={sharedStyles.cardSubtitle}>
                    {item.segmento}
                  </Text>
                </View>
                <View style={sharedStyles.actions}>
                  <IconButton
                    icon="currency-usd"
                    size={20}
                    iconColor={primaryGreen}
                    onPress={() => handleOpenModal(item.ativo)}
                    mode="outlined"
                  />
                </View>
              </View>

              <View style={sharedStyles.modernDivider} />

              <View style={styles.rentabilidadeDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text variant="bodySmall" style={sharedStyles.valueLabel}>Quantidade</Text>
                    <Text variant="bodyMedium" style={sharedStyles.valueAmount}>
                      {item.quantidade.toLocaleString('pt-BR')}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text variant="bodySmall" style={sharedStyles.valueLabel}>Preço Médio</Text>
                    <Text variant="bodyMedium" style={sharedStyles.valueAmount}>
                      {formatCurrency(item.precoMedio)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text variant="bodySmall" style={sharedStyles.valueLabel}>Preço Atual</Text>
                    <Text variant="bodyMedium" style={sharedStyles.valueAmount}>
                      {formatCurrency(item.precoAtual)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text variant="bodySmall" style={sharedStyles.valueLabel}>Investido</Text>
                    <Text variant="bodyMedium" style={sharedStyles.valueAmount}>
                      {formatCurrency(item.investido)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text variant="bodySmall" style={sharedStyles.valueLabel}>Valor Atual</Text>
                    <Text variant="bodyMedium" style={sharedStyles.valueAmount}>
                      {formatCurrency(item.atual)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text variant="bodySmall" style={sharedStyles.valueLabel}>Proventos</Text>
                    <Text variant="bodyMedium" style={sharedStyles.valueAmount}>
                      {formatCurrency(item.proventos)}
                    </Text>
                  </View>
                </View>

                <View style={styles.performanceRow}>
                  <View style={styles.performanceItem}>
                    <Text variant="bodySmall" style={sharedStyles.valueLabel}>L/P</Text>
                    <Text variant="titleMedium" style={[sharedStyles.valueAmount, {
                      color: getLucroColor(item.lucroOuPrejuizo),
                      fontWeight: 'bold'
                    }]}>
                      {formatCurrency(item.lucroOuPrejuizo)}
                    </Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Text variant="bodySmall" style={sharedStyles.valueLabel}>% L/P</Text>
                    <Text variant="titleMedium" style={[sharedStyles.valueAmount, {
                      color: getLucroColor(item.percentualLucroOuPrejuizo),
                      fontWeight: 'bold'
                    }]}>
                      {formatPercentage(item.percentualLucroOuPrejuizo)}
                    </Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Text variant="bodySmall" style={sharedStyles.valueLabel}>Rent. c/ Prov.</Text>
                    <Text variant="titleMedium" style={[sharedStyles.valueAmount, {
                      color: getLucroColor(item.rentabilidadeComProventos),
                      fontWeight: 'bold'
                    }]}>
                      {formatPercentage(item.rentabilidadeComProventos)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {filteredData.length === 0 && (
            <View style={sharedStyles.emptyState}>
              <Icon
                source={searchQuery ? 'magnify' : 'chart-timeline-variant'}
                size={48}
                color={'#64748B'}
              />
              <Text variant="titleMedium" style={[sharedStyles.valueAmount, { marginTop: 16, textAlign: 'center', color: '#1E293B' }]}>
                {searchQuery ? 'Nenhum ativo encontrado' : 'Nenhum dado de rentabilidade'}
              </Text>
              <Text variant="bodyMedium" style={[sharedStyles.valueLabel, { textAlign: 'center', marginTop: 8, color: '#64748B' }]}>
                {searchQuery
                  ? 'Tente ajustar sua busca'
                  : 'Cadastre ativos e movimentações para ver a rentabilidade'
                }
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Modal para atualizar preço */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={handleCloseModal}
            contentContainerStyle={sharedStyles.modal}
          >
            <Text variant="titleLarge" style={{ marginBottom: 16, color: primaryGreen }}>
              Atualizar Preço Atual
            </Text>

            <View style={{ marginBottom: 16 }}>
              <TextInput
                label="Ativo"
                value={formData.ticker || ''}
                disabled={true}
                style={sharedStyles.input}
                mode="outlined"
                textColor={'#1E293B'}
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
                    borderColor: '#64748B',
                    backgroundColor: cardBackground,
                    color: '#1E293B'
                  }]}
                />
              </View>
            </View>

            <View style={sharedStyles.modalActions}>
              <Button
                mode="outlined"
                onPress={handleCloseModal}
                style={sharedStyles.modalButton}
                textColor={'#1E293B'}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleSavePreco}
                loading={updating}
                disabled={updating || !formData.precoAtual}
                style={[sharedStyles.modalButton, { backgroundColor: primaryGreen }]}
                textColor="#FFFFFF"
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

  // Quick Stats Styles

  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  quickStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  quickStatValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },

  quickStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Estilos para detalhes da rentabilidade
  rentabilidadeDetails: {
    gap: 16,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },

  detailItem: {
    flex: 1,
  },

  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },

  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },

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