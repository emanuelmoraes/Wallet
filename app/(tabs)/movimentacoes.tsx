import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { buttonStyles, screenSpecificStyles, sharedStyles } from '@/styles/sharedStyles';
import { CreateMovimentacaoInput, Movimentacao, SegmentoMovimentacao, TipoOperacao } from '@/types/movimentacao';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import CurrencyInput from 'react-native-currency-input';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  FAB,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  SegmentedButtons,
  Surface,
  Text,
  TextInput,
  Title,
  useTheme
} from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function MovimentacoesScreen() {
  const theme = useTheme();
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMovimentacoes, setFilteredMovimentacoes] = useState<Movimentacao[]>([]);
  const [filterType, setFilterType] = useState('todos');
  const [dateFilter, setDateFilter] = useState('todos');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [formData, setFormData] = useState<Partial<CreateMovimentacaoInput>>({
    ativo: '',
    quantidade: undefined,
    segmento: 'acao',
    data: new Date().toISOString().split('T')[0],
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
      const movimentacaoDate = new Date(movimentacao.data);
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
        movimentacao.ativo.toLowerCase().includes(query) ||
        movimentacao.segmento.toLowerCase().includes(query) ||
        movimentacao.operacao.toLowerCase().includes(query)
      );
    }

    setFilteredMovimentacoes(filtered);
  }, [movimentacoes, filterType, dateFilter, searchQuery]);

  const resetForm = () => {
    setFormData({
      ativo: '',
      quantidade: undefined,
      segmento: 'acao',
      data: new Date().toISOString().split('T')[0],
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
        ativo: movimentacao.ativo,
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
    if (!formData.ativo || !formData.quantidade || !formData.valorUnitario || formData.quantidade <= 0 || formData.valorUnitario <= 0) {
      return;
    }

    setSaving(true);

    const movimentacaoData: CreateMovimentacaoInput = {
      ativo: formData.ativo,
      quantidade: formData.quantidade,
      segmento: formData.segmento || 'acao',
      data: formData.data || new Date().toISOString().split('T')[0],
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
      default: return theme.colors.outline;
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

  const getOperacaoLabel = (operacao: TipoOperacao) => {
    const labels = {
      compra: 'Compra',
      venda: 'Venda',
      subscricao: 'Subscrição'
    };
    return labels[operacao];
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
      <SafeAreaView style={styles.container}>
        {/* Header com estatísticas */}
        <Surface style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={[styles.statValue, { color: '#f44336' }]}>
              {formatCurrency(stats.totalInvestido)}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Total Investido</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={[styles.statValue, { color: '#4CAF50' }]}>
              {formatCurrency(stats.totalRecebido)}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Total Recebido</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={[styles.statValue, { color: stats.saldoLiquido >= 0 ? '#4CAF50' : '#f44336' }]}>
              {formatCurrency(stats.saldoLiquido)}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Saldo Líquido</Text>
          </View>
        </Surface>

        <View style={styles.header}>
          <Title>Minhas Movimentações</Title>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {movimentacoes.length} {movimentacoes.length === 1 ? 'movimentação' : 'movimentações'} •
            {filteredMovimentacoes.length} {filteredMovimentacoes.length === 1 ? 'exibida' : 'exibidas'}
          </Text>
        </View>

        <Searchbar
          placeholder="Buscar por ativo, segmento ou operação..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <View style={styles.filterContainer}>
          <SegmentedButtons
            value={filterType}
            onValueChange={setFilterType}
            buttons={tiposOperacao}
            style={styles.segmentedButtons}
          />
        </View>

        <View style={styles.filterContainer}>
          <Text variant="bodyMedium" style={styles.filterLabel}>Filtrar por período:</Text>
          <SegmentedButtons
            value={dateFilter}
            onValueChange={setDateFilter}
            buttons={filtrosData}
            style={styles.segmentedButtons}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshData}
            />
          }
        >
          {filteredMovimentacoes.map((movimentacao) => (
            <Card key={movimentacao.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Avatar.Icon
                      size={40}
                      icon={getOperacaoIcon(movimentacao.operacao)}
                      style={[styles.avatar, { backgroundColor: getOperacaoColor(movimentacao.operacao) }]}
                    />
                    <View style={styles.titleContainer}>
                      <Text variant="titleMedium">{movimentacao.ativo}</Text>
                      <Text variant="bodySmall" style={styles.subtitle}>
                        {getSegmentoLabel(movimentacao.segmento)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => handleOpenModal(movimentacao)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={theme.colors.error}
                      onPress={() => handleDeleteMovimentacao(movimentacao.id)}
                      disabled={deleting}
                    />
                  </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Chip
                      icon={getOperacaoIcon(movimentacao.operacao)}
                      textStyle={{ color: getOperacaoColor(movimentacao.operacao) }}
                      style={[styles.chip, { borderColor: getOperacaoColor(movimentacao.operacao) }]}
                      mode="outlined"
                    >
                      {getOperacaoLabel(movimentacao.operacao)}
                    </Chip>
                    <Chip
                      icon={getSegmentoIcon(movimentacao.segmento)}
                      style={styles.chip}
                      mode="outlined"
                    >
                      {getSegmentoLabel(movimentacao.segmento)}
                    </Chip>
                  </View>

                  <View style={styles.valuesContainer}>
                    <View style={styles.valueItem}>
                      <Text variant="bodySmall" style={styles.label}>Data</Text>
                      <Text variant="titleSmall">{formatDate(movimentacao.data)}</Text>
                    </View>
                    <View style={styles.valueItem}>
                      <Text variant="bodySmall" style={styles.label}>Quantidade</Text>
                      <Text variant="titleSmall">{movimentacao.quantidade.toLocaleString('pt-BR')}</Text>
                    </View>
                    <View style={styles.valueItem}>
                      <Text variant="bodySmall" style={styles.label}>Valor Unit.</Text>
                      <Text variant="titleSmall">{formatCurrency(movimentacao.valorUnitario)}</Text>
                    </View>
                  </View>

                  <View style={styles.totalContainer}>
                    <Text variant="bodySmall" style={styles.label}>Valor Total</Text>
                    <Text variant="titleLarge" style={[styles.totalValue, { color: getOperacaoColor(movimentacao.operacao) }]}>
                      {formatCurrency(movimentacao.valorTotal)}
                    </Text>
                  </View>

                  {movimentacao.observacao && (
                    <View style={styles.observacoesContainer}>
                      <Text variant="bodySmall" style={styles.label}>Observações</Text>
                      <Text variant="bodySmall">{movimentacao.observacao}</Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}

          {filteredMovimentacoes.length === 0 && (
            <Surface style={styles.emptyState}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                {searchQuery ? 'Nenhuma movimentação encontrada' : 'Nenhuma movimentação cadastrada'}
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Tente ajustar sua busca ou filtros'
                  : 'Comece adicionando sua primeira movimentação'
                }
              </Text>
            </Surface>
          )}
        </ScrollView>

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => handleOpenModal()}
          loading={saving}
          disabled={saving}
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
              <Title style={{ marginBottom: 16, color: theme.colors.primary }}
              >{editingId ? 'Editar Movimentação' : 'Nova Movimentação'}</Title>

              <TextInput
                label="Ativo (Ticker)"
                value={formData.ativo || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, ativo: text.toUpperCase() }))}
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
                      {getOperacaoLabel(operacao)}
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
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveMovimentacao}
                  loading={saving}
                  disabled={saving || !formData.ativo || !formData.quantidade || !formData.valorUnitario}
                  style={styles.modalButton}
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
});
