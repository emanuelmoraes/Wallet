import { cardBackground, darkBackground, primaryGreen, secondaryGreen } from '@/constants/Colors';
import { useAtivos } from '@/hooks/useAtivos';
import { sharedStyles } from '@/styles/sharedStyles';
import { Ativo, CreateAtivoInput } from '@/types/ativo';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import CurrencyInput from 'react-native-currency-input';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Chip,
  FAB,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function AtivosScreen() {
  const theme = useTheme();
  
  const {
    ativos,
    loading,
    saving,
    deleting,
    createAtivo,
    updateAtivo,
    deleteAtivo,
    refreshData,
    searchAtivos,
    getAtivoById,
  } = useAtivos();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAtivos, setFilteredAtivos] = useState<Ativo[]>([]);
  const [filterType, setFilterType] = useState('todos');
  
  const [formData, setFormData] = useState<Partial<CreateAtivoInput>>({
    nome: '',
    ticker: '',
    tipo: 'acao',
    preco: undefined,
    quantidade: undefined,
    segmento: '',
    administrador: '',
    status: 'ativo',
    site: '',
    observacoes: ''
  });

  const tiposAtivo = [
    { value: 'todos', label: 'Todos' },
    { value: 'acao', label: 'Ação' },
    { value: 'fii', label: 'FII' },
    { value: 'renda_fixa', label: 'Renda Fixa' },
    { value: 'cripto', label: 'Cripto' },
  ];

  // Filter and search ativos
  useEffect(() => {
    let filtered = ativos;

    // Filter by type
    if (filterType !== 'todos') {
      filtered = filtered.filter(ativo => ativo.tipo === filterType);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ativo => 
        ativo.nome.toLowerCase().includes(query) ||
        ativo.ticker.toLowerCase().includes(query) ||
        ativo.segmento?.toLowerCase().includes(query)
      );
    }

    setFilteredAtivos(filtered);
  }, [ativos, filterType, searchQuery]);

  // Calculate ativos statistics
  const calculateAtivosStats = () => {
    const totalAtivos = ativos.length;
    const totalInvestido = ativos.reduce((total, ativo) => 
      total + (ativo.preco * ativo.quantidade), 0);
    const ativosAtivos = ativos.filter(ativo => ativo.status === 'ativo').length;
    
    return { totalAtivos, totalInvestido, ativosAtivos };
  };

  const { totalAtivos, totalInvestido, ativosAtivos } = calculateAtivosStats();

  const resetForm = () => {
    setFormData({
      nome: '',
      ticker: '',
      tipo: 'acao',
      preco: undefined,
      quantidade: undefined,
      segmento: '',
      administrador: '',
      status: 'ativo',
      site: '',
      observacoes: ''
    });
    setEditingId(null);
  };

  const handleOpenModal = (ativo?: Ativo) => {
    if (ativo) {
      setEditingId(ativo.id);
      setFormData({
        nome: ativo.nome,
        ticker: ativo.ticker,
        tipo: ativo.tipo,
        preco: ativo.preco,
        quantidade: ativo.quantidade,
        segmento: ativo.segmento,
        administrador: ativo.administrador,
        status: ativo.status,
        site: ativo.site,
        observacoes: ativo.observacoes
      });
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.ticker || !formData.preco || !formData.quantidade) {
      return;
    }

    const ativoData: CreateAtivoInput = {
      nome: formData.nome,
      ticker: formData.ticker.toUpperCase(),
      tipo: formData.tipo || 'acao',
      preco: formData.preco,
      quantidade: formData.quantidade,
      segmento: formData.segmento,
      administrador: formData.administrador,
      status: formData.status || 'ativo',
      site: formData.site,
      observacoes: formData.observacoes
    };

    let success = false;

    if (editingId) {
      // Update existing
      success = await updateAtivo({
        id: editingId,
        ...ativoData
      });
    } else {
      // Create new
      success = await createAtivo(ativoData);
    }

    if (success) {
      handleCloseModal();
    }
  };

  const handleDeleteAtivo = async (id: number) => {
    await deleteAtivo(id);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'acao': return 'chart-line';
      case 'fii': return 'office-building';
      case 'renda_fixa': return 'bank';
      case 'cripto': return 'bitcoin';
      default: return 'chart-pie';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'acao': return theme.colors.primary;
      case 'fii': return theme.colors.secondary;
      case 'renda_fixa': return '#4CAF50';
      case 'cripto': return '#FF9800';
      default: return '#64748B';
    }
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={sharedStyles.container}>
          <View style={sharedStyles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryGreen} />
            <Text style={sharedStyles.loadingText}>
              Carregando ativos...
            </Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={sharedStyles.container}>
        {/* Modern Header */}
        <LinearGradient
          colors={[primaryGreen, secondaryGreen]}
          style={sharedStyles.modernHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[sharedStyles.headerTitle, { color: '#FFFFFF' }]}>
            Meus Ativos
          </Text>
          <Text style={[sharedStyles.headerSubtitle, { color: '#FFFFFF90' }]}>
            Gerencie seus investimentos
          </Text>
        </LinearGradient>

        {/* Quick Stats Cards */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatCard}>
              <Avatar.Icon 
                size={40} 
                icon="wallet" 
                style={{ backgroundColor: primaryGreen + '15' }}
                color={primaryGreen}
              />
              <Text style={[styles.quickStatValue, { color: primaryGreen }]}>
                {totalAtivos}
              </Text>
              <Text style={[styles.quickStatLabel, { color: '#64748B' }]}>
                Total
              </Text>
            </View>

            <View style={styles.quickStatCard}>
              <Avatar.Icon 
                size={40} 
                icon="check-circle" 
                style={{ backgroundColor: '#4CAF50' + '15' }}
                color={'#4CAF50'}
              />
              <Text style={[styles.quickStatValue, { color: '#4CAF50' }]}>
                {ativosAtivos}
              </Text>
              <Text style={[styles.quickStatLabel, { color: '#64748B' }]}>
                Ativos
              </Text>
            </View>

            <View style={styles.quickStatCard}>
              <Avatar.Icon 
                size={40} 
                icon="trending-up" 
                style={{ backgroundColor: '#FFB946' + '15' }}
                color={'#FFB946'}
              />
              <Text style={[styles.quickStatValue, { color: '#FFB946' }]}>
                {formatCurrency(totalInvestido)}
              </Text>
              <Text style={[styles.quickStatLabel, { color: '#64748B' }]}>
                Investido
              </Text>
            </View>
          </View>
        </View>

        {/* Search and Filter */}
        <View style={sharedStyles.searchContainer}>
          <Searchbar
            placeholder="Buscar por nome, ticker ou setor..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={sharedStyles.modernSearchbar}
            inputStyle={{ color: '#1E293B' }}
            iconColor={'#64748B'}
            placeholderTextColor={'#64748B'}
          />
        </View>

        <View style={[styles.filtersContainer, { backgroundColor: cardBackground }]}>
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: '#64748B' }]}>
              Filtrar por tipo
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              {tiposAtivo.map((tipo) => (
                <Chip
                  key={tipo.value}
                  mode="flat"
                  selected={filterType === tipo.value}
                  onPress={() => setFilterType(tipo.value)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: filterType === tipo.value ? primaryGreen : cardBackground,
                    }
                  ]}
                  textStyle={{
                    color: filterType === tipo.value ? '#FFFFFF' : '#1E293B'
                  }}
                >
                  {tipo.label}
                </Chip>
              ))}
            </ScrollView>
          </View>
        </View>

        <ScrollView 
          style={sharedStyles.scrollView}
          contentContainerStyle={sharedStyles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshData}
            />
          }
        >
          {filteredAtivos.map((ativo) => (
            <View key={ativo.id} style={sharedStyles.modernCard}>
              <View style={sharedStyles.cardHeader}>
                <View style={[sharedStyles.cardIcon, { backgroundColor: getTipoColor(ativo.tipo) + '15' }]}>
                  <Avatar.Icon 
                    size={32} 
                    icon={getTipoIcon(ativo.tipo)}
                    style={{ backgroundColor: 'transparent' }}
                    color={getTipoColor(ativo.tipo)}
                  />
                </View>
                <View style={sharedStyles.cardTitleContainer}>
                  <Text style={[sharedStyles.cardTitle, { color: '#1E293B' }]}>
                    {ativo.ticker}
                  </Text>
                  <Text style={[sharedStyles.cardSubtitle, { color: '#64748B' }]}>
                    {ativo.nome}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <IconButton
                    icon="pencil"
                    mode="contained-tonal"
                    size={20}
                    onPress={() => handleOpenModal(ativo)}
                    iconColor={primaryGreen}
                    containerColor={primaryGreen + '15'}
                  />
                  <IconButton
                    icon="delete"
                    mode="contained-tonal"
                    size={20}
                    onPress={() => handleDeleteAtivo(ativo.id)}
                    loading={deleting}
                    iconColor={'#FF5A5A'}
                    containerColor={'#FF5A5A' + '15'}
                  />
                </View>
              </View>

              <View style={sharedStyles.modernDivider} />

              <View style={styles.ativoDetails}>
                <View style={sharedStyles.valueContainer}>
                  <Text style={[sharedStyles.valueLabel, { color: '#64748B' }]}>
                    Quantidade
                  </Text>
                  <Text style={[sharedStyles.valueAmount, { color: '#1E293B' }]}>
                    {ativo.quantidade.toLocaleString('pt-BR')}
                  </Text>
                </View>
                
                <View style={sharedStyles.valueContainer}>
                  <Text style={[sharedStyles.valueLabel, { color: '#64748B' }]}>
                    Preço Médio
                  </Text>
                  <Text style={[sharedStyles.valueAmount, { color: '#1E293B' }]}>
                    {formatCurrency(ativo.preco)}
                  </Text>
                </View>

                <View style={sharedStyles.valueContainer}>
                  <Text style={[sharedStyles.valueLabel, { color: '#64748B' }]}>
                    Valor Total
                  </Text>
                  <Text style={[sharedStyles.primaryValue, { color: primaryGreen }]}>
                    {formatCurrency(ativo.valorTotal)}
                  </Text>
                </View>
              </View>

              {(ativo.segmento || ativo.administrador) && (
                <>
                  <View style={sharedStyles.modernDivider} />
                  <View style={sharedStyles.chipContainer}>
                    {ativo.segmento && (
                      <View style={[sharedStyles.modernChip, { backgroundColor: '#F1F5F9' }]}>
                        <Text style={[sharedStyles.chipText, { color: '#64748B' }]}>
                          {ativo.segmento}
                        </Text>
                      </View>
                    )}
                    {ativo.administrador && (
                      <View style={[sharedStyles.modernChip, { backgroundColor: '#F1F5F9' }]}>
                        <Text style={[sharedStyles.chipText, { color: '#64748B' }]}>
                          {ativo.administrador}
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </View>
          ))}

          {filteredAtivos.length === 0 && (
            <View style={sharedStyles.emptyState}>
              <Avatar.Icon 
                size={48} 
                icon="briefcase-outline" 
                style={{ backgroundColor: 'transparent' }}
                color={'#64748B'}
              />
              <Text style={[sharedStyles.emptyTitle, { color: '#1E293B', marginTop: 16, textAlign: 'center' }]}>
                {searchQuery ? 'Nenhum ativo encontrado' : 'Nenhum ativo cadastrado'}
              </Text>
              <Text style={[sharedStyles.emptySubtitle, { color: '#64748B', textAlign: 'center', marginTop: 8 }]}>
                {searchQuery 
                  ? 'Tente buscar por outro termo' 
                  : 'Comece adicionando seus primeiros investimentos'
                }
              </Text>
            </View>
          )}

          <View style={sharedStyles.largeSpacer} />
        </ScrollView>

        {/* Modern FAB */}
        <FAB
          icon="plus"
          style={[sharedStyles.modernFab, { backgroundColor: primaryGreen }]}
          onPress={() => handleOpenModal()}
          loading={saving}
          disabled={saving}
          color="#FFFFFF"
        />

        {/* Modal for Create/Edit */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={handleCloseModal}
            contentContainerStyle={[styles.modal, { backgroundColor: cardBackground }]}
          >
            <ScrollView style={styles.modalContent}>
              <Text style={[styles.modalTitle, { color: '#1E293B' }]}>
                {editingId ? 'Editar Ativo' : 'Novo Ativo'}
              </Text>

              <TextInput
                label="Nome do Ativo"
                value={formData.nome}
                onChangeText={(text) => setFormData(prev => ({ ...prev, nome: text }))}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Ticker"
                value={formData.ticker}
                onChangeText={(text) => setFormData(prev => ({ ...prev, ticker: text.toUpperCase() }))}
                style={styles.input}
                mode="outlined"
              />

              <View style={styles.formRow}>
                <View style={styles.halfInput}>
                  <Text style={[styles.pickerLabel, { color: '#1E293B' }]}>Tipo</Text>
                  <SegmentedButtons
                    value={formData.tipo || 'acao'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as any }))}
                    buttons={[
                      { value: 'acao', label: 'Ação' },
                      { value: 'fii', label: 'FII' },
                      { value: 'renda_fixa', label: 'R.Fixa' },
                      { value: 'cripto', label: 'Cripto' },
                    ]}
                    style={styles.segmentedButtons}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.halfInput}>
                  <Text style={[styles.pickerLabel, { color: '#1E293B' }]}>Preço</Text>
                  <CurrencyInput
                    value={formData.preco || 0}
                    onChangeValue={(value) => setFormData(prev => ({ ...prev, preco: value || 0 }))}
                    prefix="R$ "
                    delimiter="."
                    separator=","
                    precision={2}
                    style={[styles.currencyInput, { borderColor: '#E2E8F0', color: '#1E293B' }]}
                    placeholder="0,00"
                  />
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    label="Quantidade"
                    value={formData.quantidade?.toString()}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, quantidade: parseInt(text) || undefined }))}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TextInput
                label="Segmento (opcional)"
                value={formData.segmento}
                onChangeText={(text) => setFormData(prev => ({ ...prev, segmento: text }))}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Administrador (opcional)"
                value={formData.administrador}
                onChangeText={(text) => setFormData(prev => ({ ...prev, administrador: text }))}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Site (opcional)"
                value={formData.site}
                onChangeText={(text) => setFormData(prev => ({ ...prev, site: text }))}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Observações (opcional)"
                value={formData.observacoes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, observacoes: text }))}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={handleCloseModal}
                  style={styles.modalButton}
                  textColor={'#1E293B'}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={saving}
                  disabled={saving}
                  style={[styles.modalButton, { backgroundColor: primaryGreen }]}
                  textColor="#FFFFFF"
                >
                  {editingId ? 'Atualizar' : 'Salvar'}
                </Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Quick Stats Styles
  quickStatsContainer: {
    backgroundColor: darkBackground,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  quickStatCard: {
    flex: 1,
    backgroundColor: '#2e323dff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  quickStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Filter Styles
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  filterSection: {
    marginBottom: 16,
  },

  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },

  filterChips: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },

  filterChip: {
    marginRight: 8,
  },

  // Card actions
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  // Ativo details
  ativoDetails: {
    gap: 12,
  },

  // Modal styles
  modal: {
    backgroundColor: cardBackground,
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  
  modalContent: {
    paddingBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },

  // Form styles
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  
  currencyInput: {
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    borderRadius: 4,
    height: 56,
  },
  
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  
  halfInput: {
    flex: 1,
  },
  
  pickerLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },

  segmentedButtons: {
    marginBottom: 12,
  },

  // Modal actions
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  
  modalButton: {
    flex: 1,
  },
});