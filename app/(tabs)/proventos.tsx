import { useProventos } from '@/hooks/useProventos';
import { buttonStyles, screenSpecificStyles, sharedStyles } from '@/styles/sharedStyles';
import { CreateProventoInput, Provento, TipoProvento } from '@/types/provento';
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
  useTheme,
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
      default: return theme.colors.outline;
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

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Carregando proventos...</Text>
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
            <Text variant="headlineSmall" style={styles.statValue}>
              {formatCurrency(stats.totalRecebido)}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Total Recebido</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={styles.statValue}>
              {formatCurrency(stats.proventosMes)}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Este Mês</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={styles.statValue}>
              {formatCurrency(stats.proventosAno)}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Este Ano</Text>
          </View>
        </Surface>

        <View style={styles.header}>
          <Title>Meus Proventos</Title>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {proventos.length} {proventos.length === 1 ? 'provento' : 'proventos'} •
            {filteredProventos.length} {filteredProventos.length === 1 ? 'exibido' : 'exibidos'}
          </Text>
        </View>

        <Searchbar
          placeholder="Buscar por ativo ou tipo..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <View style={styles.filterContainer}>
          <SegmentedButtons
            value={filterType}
            onValueChange={setFilterType}
            buttons={tiposProvento}
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
          {filteredProventos.map((provento) => (
            <Card key={provento.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Avatar.Icon
                      size={40}
                      icon={getTipoIcon(provento.tipo)}
                      style={[styles.avatar, { backgroundColor: getTipoColor(provento.tipo) }]}
                    />
                    <View style={styles.titleContainer}>
                      <Text variant="titleMedium">{provento.ativoTicker}</Text>
                      <Text variant="bodySmall" style={styles.subtitle}>
                        {provento.ativoNome}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => handleOpenModal(provento)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={theme.colors.error}
                      onPress={() => handleDeleteProvento(provento.id)}
                      disabled={deleting}
                    />
                  </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Chip
                      icon={getTipoIcon(provento.tipo)}
                      textStyle={{ color: getTipoColor(provento.tipo) }}
                      style={[styles.chip, { borderColor: getTipoColor(provento.tipo) }]}
                      mode="outlined"
                    >
                      {getTipoLabel(provento.tipo)}
                    </Chip>
                  </View>

                  <View style={styles.valuesContainer}>
                    <View style={styles.valueItem}>
                      <Text variant="bodySmall" style={styles.label}>Data</Text>
                      <Text variant="titleSmall">{formatDate(provento.data)}</Text>
                    </View>
                    <View style={styles.valueItem}>
                      <Text variant="bodySmall" style={styles.label}>Valor</Text>
                      <Text variant="titleSmall" style={styles.totalValue}>
                        {formatCurrency(provento.valor)}
                      </Text>
                    </View>
                    <View style={styles.valueItem}>
                      <Text variant="bodySmall" style={styles.label}>Tipo</Text>
                      <Text variant="titleSmall">{getTipoLabel(provento.tipo)}</Text>
                    </View>
                  </View>

                  {provento.observacoes && (
                    <View style={styles.observacoesContainer}>
                      <Text variant="bodySmall" style={styles.label}>Observações</Text>
                      <Text variant="bodySmall">{provento.observacoes}</Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}

          {filteredProventos.length === 0 && (
            <Surface style={styles.emptyState}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                {searchQuery ? 'Nenhum provento encontrado' : 'Nenhum provento cadastrado'}
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Tente ajustar sua busca ou filtros'
                  : 'Comece adicionando seu primeiro provento'
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
              <Title
                style={{ marginBottom: 16, color: theme.colors.primary }}
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
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveProvento}
                  loading={saving}
                  disabled={saving || !formData.ativoId || !formData.valor}
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
