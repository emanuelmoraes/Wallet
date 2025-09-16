import { cardBackground, primaryGreen, secondaryGreen } from '@/constants/Colors';
import { useProventos } from '@/hooks/useProventos';
import { buttonStyles, screenSpecificStyles, sharedStyles } from '@/styles/sharedStyles';
import { CreateProventoInput, Provento, TipoProvento } from '@/types/provento';
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
    Text,
    TextInput,
    Title,
    useTheme
} from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function ProventosScreen() {
  const theme = useTheme();
  
  const {
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
  } = useProventos();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProventos, setFilteredProventos] = useState<Provento[]>([]);
  const [filterType, setFilterType] = useState('todos');
  const [dateFilter, setDateFilter] = useState('todos');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [formData, setFormData] = useState<Partial<CreateProventoInput>>({
    ativoId: 0,
    data: new Date().toISOString().split('T')[0],
    valor: undefined,
    tipo: 'dividendo',
    observacoes: ''
  });

  const tiposProvento = [
    { value: 'todos', label: 'Todos' },
    { value: 'dividendo', label: 'Dividendo' },
    { value: 'jcp', label: 'JCP' },
    { value: 'rendimento', label: 'Rendimento' },
  ];

  const filtrosData = [
    { value: 'todos', label: 'Todos' },
    { value: 'este_mes', label: 'Este mês' },
    { value: 'ultimos_3_meses', label: 'Últimos 3 meses' },
    { value: 'este_ano', label: 'Este ano' },
    { value: 'ano_passado', label: 'Ano passado' },
  ];

  // Filter proventos by date
  const filterByDate = (proventos: Provento[], filter: string) => {
    if (filter === 'todos') return proventos;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return proventos.filter(provento => {
      const proventoDate = new Date(provento.data);
      const proventoYear = proventoDate.getFullYear();
      const proventoMonth = proventoDate.getMonth();

      switch (filter) {
        case 'este_mes':
          return proventoYear === currentYear && proventoMonth === currentMonth;
        case 'ultimos_3_meses':
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          return proventoDate >= threeMonthsAgo;
        case 'este_ano':
          return proventoYear === currentYear;
        case 'ano_passado':
          return proventoYear === currentYear - 1;
        default:
          return true;
      }
    });
  };

  // Filter and search proventos
  useEffect(() => {
    let filtered = proventos;

    // Filter by type
    if (filterType !== 'todos') {
      filtered = filtered.filter(provento => provento.tipo === filterType);
    }

    // Filter by date
    filtered = filterByDate(filtered, dateFilter);

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(provento =>
        provento.ativoTicker.toLowerCase().includes(query) ||
        provento.ativoNome.toLowerCase().includes(query) ||
        provento.tipo.toLowerCase().includes(query)
      );
    }

    setFilteredProventos(filtered);
  }, [proventos, filterType, dateFilter, searchQuery]);

  const resetForm = () => {
    setFormData({
      ativoId: 0,
      data: new Date().toISOString().split('T')[0],
      valor: undefined,
      tipo: 'dividendo',
      observacoes: ''
    });
    setEditingId(null);
  };

  const handleOpenModal = async (provento?: Provento) => {
    if (provento) {
      setEditingId(provento.id);
      setFormData({
        ativoId: provento.ativoId,
        data: provento.data,
        valor: provento.valor,
        tipo: provento.tipo,
        observacoes: provento.observacoes || ''
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

  const handleSaveProvento = async () => {
    if (!formData.ativoId || !formData.valor || formData.valor <= 0) {
      return;
    }

    setSaving(true);

    const proventoData: CreateProventoInput = {
      ativoId: formData.ativoId,
      data: formData.data || new Date().toISOString().split('T')[0],
      valor: formData.valor,
      tipo: formData.tipo || 'dividendo',
      observacoes: formData.observacoes || ''
    };

    let success = false;

    if (editingId) {
      // Update existing
      success = await updateProvento({
        id: editingId,
        ...proventoData
      });
    } else {
      // Create new
      success = await createProvento(proventoData);
    }

    setSaving(false);

    if (success) {
      handleCloseModal();
    }
  };

  const handleDeleteProvento = async (id: number) => {
    setDeleting(true);
    await deleteProvento(id);
    setDeleting(false);
  };

  const refreshData = () => {
    loadProventos();
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const onDismissDatePicker = () => {
    setDatePickerVisible(false);
  };

  const onConfirmDate = (params: any) => {
    setDatePickerVisible(false);
    if (params.date) {
      const formattedDate = params.date.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, data: formattedDate }));
    }
  };

  const getTipoIcon = (tipo: TipoProvento) => {
    switch (tipo) {
      case 'dividendo': return 'cash-multiple';
      case 'jcp': return 'account-cash';
      case 'rendimento': return 'trending-up';
      default: return 'cash';
    }
  };

  const getTipoColor = (tipo: TipoProvento) => {
    switch (tipo) {
      case 'dividendo': return '#4CAF50';
      case 'jcp': return '#FF9800';
      case 'rendimento': return '#2196F3';
      default: return '#64748B';
    }
  };

  const getTipoLabel = (tipo: TipoProvento) => {
    const labels = {
      dividendo: 'Dividendo',
      jcp: 'JCP',
      rendimento: 'Rendimento'
    };
    return labels[tipo];
  };

  if (loading && proventos.length === 0) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={sharedStyles.container}>
          <View style={sharedStyles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryGreen} />
            <Text style={sharedStyles.loadingText}>
              Carregando proventos...
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
            Proventos
          </Text>
          <Text style={[sharedStyles.headerSubtitle, { color: '#FFFFFF90' }]}>
            Gestão de dividendos e rendimentos
          </Text>
        </LinearGradient>

        {/* Quick Stats Cards */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatCard}>
              <Avatar.Icon 
                size={40} 
                icon="cash-multiple" 
                style={{ backgroundColor: '#4CAF50' + '15' }}
                color={'#4CAF50'}
              />
              <Text style={[styles.quickStatValue, { color: '#4CAF50' }]}>
                {formatCurrency(stats.totalRecebido)}
              </Text>
              <Text style={[styles.quickStatLabel, { color: '#64748B' }]}>
                Total Recebido
              </Text>
            </View>

            <View style={styles.quickStatCard}>
              <Avatar.Icon 
                size={40} 
                icon="calendar-check" 
                style={{ backgroundColor: primaryGreen + '15' }}
                color={primaryGreen}
              />
              <Text style={[styles.quickStatValue, { color: primaryGreen }]}>
                {formatCurrency(stats.proventosMes)}
              </Text>
              <Text style={[styles.quickStatLabel, { color: '#64748B' }]}>
                Este Mês
              </Text>
            </View>

            <View style={styles.quickStatCard}>
              <Avatar.Icon 
                size={40} 
                icon="chart-bar" 
                style={{ backgroundColor: '#FFB946' + '15' }}
                color={'#FFB946'}
              />
              <Text style={[styles.quickStatValue, { color: '#FFB946' }]}>
                {formatCurrency(stats.proventosAno)}
              </Text>
              <Text style={[styles.quickStatLabel, { color: '#64748B' }]}>
                Este Ano
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={sharedStyles.searchContainer}>
          <Searchbar
            placeholder="Buscar por ativo ou tipo..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={sharedStyles.modernSearchbar}
            inputStyle={{ color: '#1E293B' }}
            iconColor={'#64748B'}
            placeholderTextColor={'#64748B'}
            elevation={0}
          />
        </View>

        {/* Filters */}
        <View style={[styles.filtersContainer, { backgroundColor: '#F8FAFB' }]}>
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: '#64748B' }]}>
              Tipo
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {tiposProvento.map((tipo) => (
                  <Chip
                    key={tipo.value}
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
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: '#64748B' }]}>
              Período
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {filtrosData.map((filtro) => (
                  <Chip
                    key={filtro.value}
                    selected={dateFilter === filtro.value}
                    onPress={() => setDateFilter(filtro.value)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: dateFilter === filtro.value ? primaryGreen : cardBackground,
                      }
                    ]}
                    textStyle={{
                      color: dateFilter === filtro.value ? '#FFFFFF' : '#1E293B'
                    }}
                  >
                    {filtro.label}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Proventos List */}
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
          {filteredProventos.map((provento) => (
            <View key={provento.id} style={sharedStyles.modernCard}>
              <View style={sharedStyles.cardHeader}>
                <View style={[sharedStyles.cardIcon, { backgroundColor: getTipoColor(provento.tipo) + '15' }]}>
                  <Avatar.Icon
                    size={32}
                    icon={getTipoIcon(provento.tipo)}
                    style={{ backgroundColor: 'transparent' }}
                    color={getTipoColor(provento.tipo)}
                  />
                </View>
                <View style={sharedStyles.cardTitleContainer}>
                  <Text style={[sharedStyles.cardTitle, { color: '#1E293B' }]}>
                    {provento.ativoTicker}
                  </Text>
                  <Text style={[sharedStyles.cardSubtitle, { color: '#64748B' }]}>
                    {provento.ativoNome}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <IconButton
                    icon="pencil"
                    mode="contained-tonal"
                    size={20}
                    onPress={() => handleOpenModal(provento)}
                    iconColor={primaryGreen}
                    containerColor={primaryGreen + '15'}
                  />
                  <IconButton
                    icon="delete"
                    mode="contained-tonal"
                    size={20}
                    onPress={() => handleDeleteProvento(provento.id)}
                    loading={deleting}
                    iconColor={'#FF5A5A'}
                    containerColor={'#FF5A5A' + '15'}
                  />
                </View>
              </View>

              <View style={sharedStyles.modernDivider} />

              <View style={styles.proventoDetails}>
                <View style={sharedStyles.valueContainer}>
                  <Text style={[sharedStyles.valueLabel, { color: '#64748B' }]}>
                    Valor
                  </Text>
                  <Text style={[sharedStyles.primaryValue, { color: '#4CAF50' }]}>
                    {formatCurrency(provento.valor)}
                  </Text>
                </View>
                
                <View style={sharedStyles.valueContainer}>
                  <Text style={[sharedStyles.valueLabel, { color: '#64748B' }]}>
                    Data
                  </Text>
                  <Text style={[sharedStyles.valueAmount, { color: '#1E293B' }]}>
                    {formatDate(provento.data)}
                  </Text>
                </View>

                <View style={sharedStyles.valueContainer}>
                  <Text style={[sharedStyles.valueLabel, { color: '#64748B' }]}>
                    Tipo
                  </Text>
                  <Text style={[sharedStyles.valueAmount, { color: '#1E293B' }]}>
                    {getTipoLabel(provento.tipo)}
                  </Text>
                </View>
              </View>

              {provento.observacoes && (
                <>
                  <View style={sharedStyles.modernDivider} />
                  <View style={sharedStyles.chipContainer}>
                    <View style={[sharedStyles.modernChip, { backgroundColor: '#F1F5F9' }]}>
                      <Text style={[sharedStyles.chipText, { color: '#64748B' }]}>
                        {provento.observacoes}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          ))}

          {filteredProventos.length === 0 && (
            <View style={sharedStyles.emptyState}>
              <Avatar.Icon 
                size={48} 
                icon="cash-multiple" 
                style={{ backgroundColor: 'transparent' }}
                color={'#64748B'}
              />
              <Text style={[sharedStyles.emptyTitle, { color: '#1E293B', marginTop: 16, textAlign: 'center' }]}>
                {searchQuery ? 'Nenhum provento encontrado' : 'Nenhum provento cadastrado'}
              </Text>
              <Text style={[sharedStyles.emptySubtitle, { color: '#64748B', textAlign: 'center', marginTop: 8 }]}>
                {searchQuery 
                  ? 'Tente buscar por outro termo' 
                  : 'Comece adicionando seus primeiros proventos'
                }
              </Text>
            </View>
          )}

          <View style={sharedStyles.largeSpacer} />
        </ScrollView>

        <FAB
          icon="plus"
          style={[sharedStyles.modernFab, { backgroundColor: primaryGreen }]}
          onPress={() => handleOpenModal()}
          loading={saving}
          disabled={saving}
          color="#FFFFFF"
        />

        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={handleCloseModal}
            contentContainerStyle={styles.modal}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
            >
              <Title
                style={{ marginBottom: 16, color: primaryGreen }}
              >{editingId ? 'Editar Provento' : 'Novo Provento'}</Title>

              <View style={styles.formGroup}>
                <Text variant="bodySmall" style={styles.pickerLabel}>Ativo *</Text>
                <ScrollView style={styles.ativoSelector} nestedScrollEnabled horizontal>
                  {ativos.map((ativo) => (
                    <Button
                      key={ativo.id}
                      mode={formData.ativoId === ativo.id ? "contained" : "outlined"}
                      onPress={() => setFormData(prev => ({ ...prev, ativoId: ativo.id }))}
                      style={styles.ativoButton}
                      compact
                    >
                      {ativo.ticker} - {ativo.nome}
                    </Button>
                  ))}
                </ScrollView>
              </View>

              <TextInput
                label="Data"
                value={formData.data ? new Date(formData.data).toLocaleDateString('pt-BR') : ''}
                style={styles.input}
                mode="flat"
                right={<TextInput.Icon icon="calendar" onPress={() => setDatePickerVisible(true)} />}
                onPress={() => setDatePickerVisible(true)}
                showSoftInputOnFocus={false}
                editable={false}
              />

              <DatePickerModal
                locale="pt-BR"
                mode="single"
                visible={datePickerVisible}
                onDismiss={onDismissDatePicker}
                date={formData.data ? new Date(formData.data) : new Date()}
                onConfirm={onConfirmDate}
              />

              <View style={styles.formRow}>
                <CurrencyInput
                  value={formData.valor ?? 0}
                  onChangeValue={(value) => setFormData(prev => ({ ...prev, valor: value ?? undefined }))}
                  prefix="R$ "
                  delimiter="."
                  separator=","
                  precision={2}
                  minValue={0}
                  placeholder="R$ 0,00"
                  style={[styles.currencyInput, styles.halfInput]}
                />

                <View style={styles.halfInput}>
                  {/* <Text variant="bodySmall" style={styles.pickerLabel}>Tipo</Text> */}
                  <View style={styles.typeButtons}>
                    {(['dividendo', 'jcp', 'rendimento'] as TipoProvento[]).map((tipo) => (
                      <Button
                        key={tipo}
                        mode={formData.tipo === tipo ? "contained" : "outlined"}
                        onPress={() => setFormData(prev => ({ ...prev, tipo }))}
                        style={styles.typeButton}
                        compact
                      >
                        {getTipoLabel(tipo)}
                      </Button>
                    ))}
                  </View>
                </View>
              </View>

              <TextInput
                label="Observações"
                value={formData.observacoes || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, observacoes: text }))}
                style={styles.input}
                mode="flat"
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
                  onPress={handleSaveProvento}
                  loading={saving}
                  disabled={saving || !formData.ativoId || !formData.valor}
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
  ...sharedStyles,
  ...buttonStyles,
  ...screenSpecificStyles,
  
  // Quick Stats Styles (similar to index.tsx)
  quickStatsContainer: {
    backgroundColor: '#F8FAFB',
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
    backgroundColor: cardBackground,
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

  // Card Styles
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },

  proventoDetails: {
    flexDirection: 'column',
    gap: 12,
  },

  modalButton: {
    marginHorizontal: 8,
  },
});
