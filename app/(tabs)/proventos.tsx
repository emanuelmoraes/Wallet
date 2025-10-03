import { cardBackground, primaryGreen, secondaryGreen } from '@/constants/Colors';
import { useProventos } from '@/hooks/useProventos';
import { styles } from '@/styles/proventosStyles';
import { sharedStyles } from '@/styles/sharedStyles';
import { CreateProventoInput, Provento, TipoProvento } from '@/types/provento';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
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
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProventos, setFilteredProventos] = useState<Provento[]>([]);
  const [filterType, setFilterType] = useState('todos');
  const [dateFilter, setDateFilter] = useState('todos');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [formData, setFormData] = useState<Partial<CreateProventoInput>>({
    ativoTicker: '',
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
      const proventoDate = createDateFromString(provento.data);
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
        provento.tipo.toLowerCase().includes(query)
      );
    }

    setFilteredProventos(filtered);
  }, [proventos, filterType, dateFilter, searchQuery]);

  const resetForm = () => {
    setFormData({
      ativoTicker: '',
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
        ativoTicker: provento.ativoTicker,
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
    if (!formData.ativoTicker || !formData.valor || formData.valor <= 0) {
      return;
    }

    setSaving(true);

    const proventoData: CreateProventoInput = {
      ativoTicker: formData.ativoTicker,
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
    if (!dateString) return '';
    // Evitar problemas de timezone ao exibir a data
    const [year, month, day] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('pt-BR');
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    // Evitar problemas de timezone ao exibir a data no input
    const [year, month, day] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('pt-BR');
  };

  const createDateFromString = (dateString: string) => {
    // Função auxiliar para criar Date a partir de string sem problemas de timezone
    const [year, month, day] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const onDismissDatePicker = () => {
    setDatePickerVisible(false);
  };

  const onConfirmDate = (params: any) => {
    setDatePickerVisible(false);
    if (params.date) {
      // Corrigir problema de timezone - usar data local sem conversão UTC
      const date = new Date(params.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
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
              Proventos
            </Text>
            <Text style={[sharedStyles.headerSubtitle, { color: '#FFFFFF90' }]}>
              Gestão de dividendos e rendimentos
            </Text>
          </LinearGradient>

          {/* Quick Stats Cards */}
          <View style={sharedStyles.quickStatsContainer}>
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
            <View style={styles.searchWrapper}>
              <Searchbar
                placeholder="Buscar por ativo ou tipo..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={[sharedStyles.modernSearchbar, { flex: 1 }]}
                inputStyle={{ color: '#1E293B' }}
                iconColor={'#64748B'}
                placeholderTextColor={'#64748B'}
                elevation={0}
              />
              <IconButton
                icon="filter-variant"
                mode="contained-tonal"
                size={24}
                onPress={() => setFilterModalVisible(true)}
                iconColor={primaryGreen}
                containerColor={primaryGreen + '15'}
                style={styles.filterIconButton}
              />
            </View>
          </View>

          {/* Proventos List */}

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
                  <Text style={sharedStyles.cardTitle}>
                    {provento.ativoTicker}
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
                  <Text style={sharedStyles.valueAmount}>
                    {formatDate(provento.data)}
                  </Text>
                </View>

                <View style={sharedStyles.valueContainer}>
                  <Text style={[sharedStyles.valueLabel, { color: '#64748B' }]}>
                    Tipo
                  </Text>
                  <Text style={sharedStyles.valueAmount}>
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

              <TextInput
                label="Código do Ativo *"
                value={formData.ativoTicker || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, ativoTicker: text.toUpperCase() }))}
                style={styles.input}
                mode="flat"
                placeholder="Ex: BBAS3, PETR4, VALE3"
                autoCapitalize="characters"
              />

              <TextInput
                label="Data"
                value={formatDateForInput(formData.data || '')}
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
                date={formData.data ? (() => {
                  const [year, month, day] = formData.data.split('-');
                  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                })() : new Date()}
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
                  disabled={saving || !formData.ativoTicker || !formData.valor}
                  style={[styles.modalButton, { backgroundColor: primaryGreen }]}
                  textColor="#FFFFFF"
                >
                  {editingId ? 'Atualizar' : 'Salvar'}
                </Button>
              </View>
            </ScrollView>
          </Modal>

          {/* Filter Modal */}
          <Modal
            visible={filterModalVisible}
            onDismiss={() => setFilterModalVisible(false)}
            contentContainerStyle={[styles.filterModal, { backgroundColor: cardBackground }]}
          >
            <View style={styles.filterModalContent}>
              <Text style={[styles.modalTitle, { color: '#1E293B' }]}>
                Filtrar Proventos
              </Text>

              <Text style={[styles.filterModalSubtitle, { color: '#64748B' }]}>
                Selecione o tipo e período dos proventos
              </Text>

              {/* Filtro por Tipo */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupTitle, { color: '#1E293B' }]}>
                  Tipo de Provento
                </Text>
                <View style={styles.filterOptionsContainer}>
                  {tiposProvento.map((tipo) => (
                    <Chip
                      key={tipo.value}
                      mode="flat"
                      selected={filterType === tipo.value}
                      onPress={() => setFilterType(tipo.value)}
                      style={[
                        styles.filterModalChip,
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
              </View>

              {/* Filtro por Período */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupTitle, { color: '#1E293B' }]}>
                  Período
                </Text>
                <View style={styles.filterOptionsContainer}>
                  {filtrosData.map((filtro) => (
                    <Chip
                      key={filtro.value}
                      mode="flat"
                      selected={dateFilter === filtro.value}
                      onPress={() => setDateFilter(filtro.value)}
                      style={[
                        styles.filterModalChip,
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
              </View>

              <View style={styles.filterModalActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setFilterType('todos');
                    setDateFilter('todos');
                  }}
                  style={[styles.modalButton, { flex: 0.4 }]}
                  textColor={'#1E293B'}
                >
                  Limpar
                </Button>
                <Button
                  mode="contained"
                  onPress={() => setFilterModalVisible(false)}
                  style={[styles.modalButton, { backgroundColor: primaryGreen, flex: 0.6 }]}
                  textColor="#FFFFFF"
                >
                  Aplicar Filtros
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
