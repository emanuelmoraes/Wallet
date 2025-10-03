import { cardBackground, primaryGreen, secondaryGreen } from '@/constants/Colors';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { styles } from '@/styles/movimentacoesStyles';
import { sharedStyles } from '@/styles/sharedStyles';
import { CreateMovimentacaoInput, Movimentacao, SegmentoMovimentacao, TipoOperacao } from '@/types/movimentacao';
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
  Icon,
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

export default function MovimentacoesScreen() {
  const theme = useTheme();

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const {
    movimentacoes,
    stats,
    loading,
    error,
    loadMovimentacoes,
    createMovimentacao,
    updateMovimentacao,
    deleteMovimentacao,
  } = useMovimentacoes();

  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMovimentacoes, setFilteredMovimentacoes] = useState<Movimentacao[]>([]);
  const [filterType, setFilterType] = useState('todos');
  const [dateFilter, setDateFilter] = useState('todos');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [formData, setFormData] = useState<Partial<CreateMovimentacaoInput>>({
    ticker: '',
    quantidade: undefined,
    segmento: 'acao',
    data: getTodayDateString(),
    valorUnitario: undefined,
    operacao: 'compra',
    observacao: ''
  });

  const tiposOperacao = [
    { value: 'todos', label: 'Todos' },
    { value: 'compra', label: 'Compra' },
    { value: 'venda', label: 'Venda' },
    { value: 'subscricao', label: 'Subscrição' },
  ];

  const filtrosData = [
    { value: 'todos', label: 'Todos' },
    { value: 'este_mes', label: 'Este mês' },
    { value: 'ultimos_3_meses', label: 'Últimos 3 meses' },
    { value: 'este_ano', label: 'Este ano' },
    { value: 'ano_passado', label: 'Ano passado' },
  ];

  // Filter movimentacoes by date
  const filterByDate = (movimentacoes: Movimentacao[], filter: string) => {
    if (filter === 'todos') return movimentacoes;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return movimentacoes.filter(movimentacao => {
      const movimentacaoDate = createDateFromString(movimentacao.data);
      const movimentacaoYear = movimentacaoDate.getFullYear();
      const movimentacaoMonth = movimentacaoDate.getMonth();

      switch (filter) {
        case 'este_mes':
          return movimentacaoYear === currentYear && movimentacaoMonth === currentMonth;
        case 'ultimos_3_meses':
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          return movimentacaoDate >= threeMonthsAgo;
        case 'este_ano':
          return movimentacaoYear === currentYear;
        case 'ano_passado':
          return movimentacaoYear === currentYear - 1;
        default:
          return true;
      }
    });
  };

  // Calculate filtered totals
  const calculateFilteredTotals = (movimentacoes: Movimentacao[]) => {
    const totalCompra = movimentacoes
      .filter(mov => mov.operacao === 'compra' || mov.operacao === 'subscricao')
      .reduce((total, mov) => total + (mov.quantidade * mov.valorUnitario), 0);

    const totalVenda = movimentacoes
      .filter(mov => mov.operacao === 'venda')
      .reduce((total, mov) => total + (mov.quantidade * mov.valorUnitario), 0);

    return { totalCompra, totalVenda };
  };

  // Filter and search movimentacoes
  useEffect(() => {
    let filtered = movimentacoes;

    // Filter by type
    if (filterType !== 'todos') {
      filtered = filtered.filter(movimentacao => movimentacao.operacao === filterType);
    }

    // Filter by date
    filtered = filterByDate(filtered, dateFilter);

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(movimentacao =>
        movimentacao.ticker.toLowerCase().includes(query) ||
        movimentacao.segmento.toLowerCase().includes(query) ||
        movimentacao.operacao.toLowerCase().includes(query)
      );
    }

    setFilteredMovimentacoes(filtered);
  }, [movimentacoes, filterType, dateFilter, searchQuery]);

  const resetForm = () => {
    setFormData({
      ticker: '',
      quantidade: undefined,
      segmento: 'acao',
      data: getTodayDateString(),
      valorUnitario: undefined,
      operacao: 'compra',
      observacao: ''
    });
    setEditingId(null);
  };

  const handleOpenModal = async (movimentacao?: Movimentacao) => {
    if (movimentacao) {
      setEditingId(movimentacao.id);
      setFormData({
        ticker: movimentacao.ticker,
        quantidade: movimentacao.quantidade,
        segmento: movimentacao.segmento,
        data: movimentacao.data,
        valorUnitario: movimentacao.valorUnitario,
        operacao: movimentacao.operacao,
        observacao: movimentacao.observacao || ''
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

  const handleSaveMovimentacao = async () => {
    if (!formData.ticker || !formData.quantidade || !formData.valorUnitario || formData.quantidade <= 0 || formData.valorUnitario <= 0) {
      return;
    }

    setSaving(true);

    const movimentacaoData: CreateMovimentacaoInput = {
      ticker: formData.ticker,
      quantidade: formData.quantidade,
      segmento: formData.segmento || 'acao',
      data: formData.data || getTodayDateString(),
      valorUnitario: formData.valorUnitario,
      operacao: formData.operacao || 'compra',
      observacao: formData.observacao || ''
    };

    let success = false;

    if (editingId) {
      // Update existing
      success = await updateMovimentacao({
        id: editingId,
        ...movimentacaoData
      });
    } else {
      // Create new
      success = await createMovimentacao(movimentacaoData);
    }

    setSaving(false);

    if (success) {
      handleCloseModal();
    }
  };

  const handleDeleteMovimentacao = async (id: number) => {
    setDeleting(true);
    await deleteMovimentacao(id);
    setDeleting(false);
  };

  const refreshData = () => {
    loadMovimentacoes();
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

  const getOperacaoIcon = (operacao: TipoOperacao) => {
    switch (operacao) {
      case 'compra': return 'arrow-down-bold';
      case 'venda': return 'arrow-up-bold';
      case 'subscricao': return 'plus-circle';
      default: return 'swap-horizontal';
    }
  };

  const getOperacaoColor = (operacao: TipoOperacao) => {
    switch (operacao) {
      case 'compra': return '#f44336';
      case 'venda': return '#4CAF50';
      case 'subscricao': return '#2196F3';
      default: return '#64748B';
    }
  };

  const getSegmentoIcon = (segmento: SegmentoMovimentacao) => {
    switch (segmento) {
      case 'acao': return 'chart-line';
      case 'fii': return 'office-building';
      case 'fi_infra': return 'bridge';
      case 'etf': return 'chart-box';
      case 'renda_fixa': return 'bank';
      case 'cripto': return 'bitcoin';
      default: return 'chart-pie';
    }
  };

  const getSegmentoLabel = (segmento: SegmentoMovimentacao) => {
    const labels = {
      acao: 'Ação',
      fii: 'FII',
      fi_infra: 'FI-Infra',
      etf: 'ETF',
      renda_fixa: 'Renda Fixa',
      cripto: 'Cripto'
    };
    return labels[segmento];
  };

  const { totalCompra, totalVenda } = calculateFilteredTotals(filteredMovimentacoes);

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Carregando movimentações...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={sharedStyles.container}>
        <ScrollView
          style={styles.scrollView}
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
              Movimentações
            </Text>
            <Text style={[sharedStyles.headerSubtitle, { color: '#FFFFFF90' }]}>
              Controle suas operações de compra e venda
            </Text>
          </LinearGradient>

          {/* Quick Stats Cards */}
          <View style={styles.quickStatsContainer}>
            <View style={styles.quickStatsRow}>
              <View style={styles.quickStatCard}>
                <Avatar.Icon
                  size={40}
                  icon="arrow-down"
                  style={{ backgroundColor: '#FF5A5A' + '15' }}
                  color={'#FF5A5A'}
                />
                <Text style={[styles.quickStatValue, { color: '#FF5A5A' }]}>
                  {formatCurrency(totalCompra)}
                </Text>
                <Text style={[styles.quickStatLabel, { color: '#64748B' }]}>
                  Total Compra
                </Text>
              </View>

              <View style={styles.quickStatCard}>
                <Avatar.Icon
                  size={40}
                  icon="arrow-up"
                  style={{ backgroundColor: '#4CAF50' + '15' }}
                  color={'#4CAF50'}
                />
                <Text style={[styles.quickStatValue, { color: '#4CAF50' }]}>
                  {formatCurrency(totalVenda)}
                </Text>
                <Text style={[styles.quickStatLabel, { color: '#64748B' }]}>
                  Total Venda
                </Text>
              </View>
            </View>
          </View>

          {/* Search and Filters */}
          <View style={sharedStyles.searchContainer}>
            <View style={styles.searchWrapper}>
              <Searchbar
                placeholder="Buscar por ativo, segmento ou operação..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={[sharedStyles.modernSearchbar, { flex: 1 }]}
                inputStyle={{ color: '#1E293B' }}
                iconColor={'#64748B'}
                placeholderTextColor={'#64748B'}
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

          {filteredMovimentacoes.map((movimentacao) => (
            <View key={movimentacao.id} style={sharedStyles.modernCard}>
              <View style={sharedStyles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Icon
                    source={getOperacaoIcon(movimentacao.operacao)}
                    size={24}
                    color={getOperacaoColor(movimentacao.operacao)}
                  />
                </View>
                <View style={sharedStyles.cardTitleContainer}>
                  <Text variant="titleMedium" style={sharedStyles.cardTitle}>
                    {movimentacao.ticker}
                  </Text>
                  <Text variant="bodySmall" style={sharedStyles.cardSubtitle}>
                    {getSegmentoLabel(movimentacao.segmento)}
                  </Text>
                </View>
                <View style={sharedStyles.actions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    iconColor={primaryGreen}
                    onPress={() => handleOpenModal(movimentacao)}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor={'#FF5A5A'}
                    onPress={() => handleDeleteMovimentacao(movimentacao.id)}
                    disabled={deleting}
                  />
                </View>
              </View>

              <View style={sharedStyles.modernDivider} />

              <View style={styles.movimentacaoDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text variant="bodySmall" style={sharedStyles.valueLabel}>Operação</Text>
                    <Text variant="bodyMedium" style={sharedStyles.valueAmount}>
                      {movimentacao.operacao}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text variant="bodySmall" style={sharedStyles.valueLabel}>Data</Text>
                    <Text variant="bodyMedium" style={sharedStyles.valueAmount}>
                      {formatDate(movimentacao.data)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text variant="bodySmall" style={sharedStyles.valueLabel}>Quantidade</Text>
                    <Text variant="bodyMedium" style={sharedStyles.valueAmount}>
                      {movimentacao.quantidade.toLocaleString('pt-BR')}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text variant="bodySmall" style={sharedStyles.valueLabel}>Valor Unit.</Text>
                    <Text variant="bodyMedium" style={sharedStyles.valueAmount}>
                      {formatCurrency(movimentacao.valorUnitario)}
                    </Text>
                  </View>
                </View>

                <View style={styles.totalRow}>
                  <Text variant="bodySmall" style={sharedStyles.valueLabel}>Valor Total</Text>
                  <Text variant="titleMedium" style={[sharedStyles.valueAmount, {
                    color: getOperacaoColor(movimentacao.operacao),
                    fontWeight: 'bold'
                  }]}>
                    {formatCurrency(movimentacao.quantidade * movimentacao.valorUnitario)}
                  </Text>
                </View>

                {movimentacao.observacao && (
                  <View style={styles.observacaoContainer}>
                    <Text variant="bodySmall" style={sharedStyles.valueLabel}>Observação</Text>
                    <Text variant="bodyMedium" style={sharedStyles.valueAmount}>
                      {movimentacao.observacao}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {filteredMovimentacoes.length === 0 && (
            <View style={sharedStyles.emptyState}>
              <Icon
                source={searchQuery ? 'magnify' : 'chart-line-variant'}
                size={48}
                color={'#64748B'}
              />
              <Text variant="titleMedium" style={[sharedStyles.valueAmount, { marginTop: 16, textAlign: 'center' }]}>
                {searchQuery ? 'Nenhuma movimentação encontrada' : 'Nenhuma movimentação cadastrada'}
              </Text>
              <Text variant="bodyMedium" style={[sharedStyles.valueLabel, { textAlign: 'center', marginTop: 8 }]}>
                {searchQuery
                  ? 'Tente ajustar sua busca ou filtros'
                  : 'Comece adicionando sua primeira movimentação'
                }
              </Text>
            </View>
          )}
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
              <Title style={{ marginBottom: 16, color: primaryGreen }}
              >{editingId ? 'Editar Movimentação' : 'Nova Movimentação'}</Title>

              <TextInput
                label="Ativo (Ticker)"
                value={formData.ticker || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, ticker: text.toUpperCase() }))}
                style={styles.input}
                mode="flat"
              />

              <View style={styles.formRow}>
                <TextInput
                  label="Quantidade"
                  value={formData.quantidade?.toString() || ''}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, quantidade: parseFloat(text) || undefined }))}
                  style={[styles.input, styles.halfInput]}
                  mode="flat"
                  keyboardType="numeric"
                />

                <CurrencyInput
                  value={formData.valorUnitario ?? 0}
                  onChangeValue={(value) => setFormData(prev => ({ ...prev, valorUnitario: value ?? undefined }))}
                  prefix="R$ "
                  delimiter="."
                  separator=","
                  precision={2}
                  minValue={0}
                  placeholder="R$ 0,00"
                  style={[styles.currencyInput, styles.halfInput]}
                />
              </View>

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

              <View style={styles.formGroup}>
                <Text variant="bodySmall" style={styles.pickerLabel}>Segmento</Text>
                <View style={styles.segmentoButtons}>
                  {(['acao', 'fii', 'fi_infra', 'etf', 'renda_fixa', 'cripto'] as SegmentoMovimentacao[]).map((segmento) => (
                    <Button
                      key={segmento}
                      mode={formData.segmento === segmento ? "contained" : "outlined"}
                      onPress={() => setFormData(prev => ({ ...prev, segmento }))}
                      style={styles.segmentoButton}
                      compact
                    >
                      {getSegmentoLabel(segmento)}
                    </Button>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text variant="bodySmall" style={styles.pickerLabel}>Operação</Text>
                <View style={styles.operacaoButtons}>
                  {(['compra', 'venda', 'subscricao'] as TipoOperacao[]).map((operacao) => (
                    <Button
                      key={operacao}
                      mode={formData.operacao === operacao ? "contained" : "outlined"}
                      onPress={() => setFormData(prev => ({ ...prev, operacao }))}
                      style={styles.operacaoButton}
                      compact
                    >
                      {operacao}
                    </Button>
                  ))}
                </View>
              </View>

              <TextInput
                label="Observações"
                value={formData.observacao || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, observacao: text }))}
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
                  onPress={handleSaveMovimentacao}
                  loading={saving}
                  disabled={saving || !formData.ticker || !formData.quantidade || !formData.valorUnitario}
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
                Filtrar Movimentações
              </Text>

              <Text style={[styles.filterModalSubtitle, { color: '#64748B' }]}>
                Selecione o tipo de operação e período
              </Text>

              {/* Filtro por Tipo de Operação */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupTitle, { color: '#1E293B' }]}>
                  Tipo de Operação
                </Text>
                <View style={styles.filterOptionsContainer}>
                  {tiposOperacao.map((tipo) => (
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
