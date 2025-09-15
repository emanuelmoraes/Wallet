import { useAtivos } from '@/hooks/useAtivos';
import { buttonStyles, screenSpecificStyles, sharedStyles } from '@/styles/sharedStyles';
import { Ativo, CreateAtivoInput } from '@/types/ativo';
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

  const handleSaveAtivo = async () => {
    if (!formData.nome || !formData.ticker || !formData.preco || !formData.quantidade) {
      return;
    }

    const ativoData = {
      nome: formData.nome,
      ticker: formData.ticker,
      tipo: formData.tipo || 'acao',
      preco: Number(formData.preco),
      quantidade: Number(formData.quantidade),
      segmento: formData.segmento || '',
      administrador: formData.administrador || '',
      status: formData.status || 'ativo',
      site: formData.site || '',
      observacoes: formData.observacoes || ''
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
      default: return theme.colors.outline;
    }
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Carregando ativos...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header com estatísticas */}
        <Surface style={sharedStyles.statsContainer}>
          <View style={sharedStyles.titleSection}>
            <Title style={sharedStyles.mainTitle}>Meus Ativos</Title>
          </View>
          <View style={sharedStyles.statsRow}>
            <View style={sharedStyles.statItem}>
              <Text variant="headlineSmall" style={[sharedStyles.statValue, { color: '#2196F3' }]}>
                {totalAtivos}
              </Text>
              <Text variant="bodyMedium" style={sharedStyles.statLabel}>Total</Text>
            </View>
            <View style={sharedStyles.statItem}>
              <Text variant="headlineSmall" style={[sharedStyles.statValue, { color: '#4CAF50' }]}>
                {ativosAtivos}
              </Text>
              <Text variant="bodyMedium" style={sharedStyles.statLabel}>Ativos</Text>
            </View>
            <View style={sharedStyles.statItem}>
              <Text variant="headlineSmall" style={[sharedStyles.statValue, { color: '#FF9800' }]}>
                {formatCurrency(totalInvestido)}
              </Text>
              <Text variant="bodyMedium" style={sharedStyles.statLabel}>Investido</Text>
            </View>
          </View>
        </Surface>

        <Searchbar
          placeholder="Buscar por nome, ticker ou setor..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={sharedStyles.searchbar}
        />

        <View style={sharedStyles.filterContainer}>
          <SegmentedButtons
            value={filterType}
            onValueChange={setFilterType}
            buttons={tiposAtivo}
            style={sharedStyles.segmentedButtons}
          />
        </View>

        <ScrollView 
          style={sharedStyles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshData}
            />
          }
        >
          {filteredAtivos.map((ativo) => (
            <Card key={ativo.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Avatar.Icon 
                      size={40} 
                      icon={getTipoIcon(ativo.tipo)}
                      style={[styles.avatar, { backgroundColor: getTipoColor(ativo.tipo) }]}
                    />
                    <View style={styles.titleContainer}>
                      <Text variant="titleMedium">{ativo.ticker}</Text>
                      <Text variant="bodySmall" style={styles.subtitle}>
                        {ativo.nome}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => handleOpenModal(ativo)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={theme.colors.error}
                      onPress={() => handleDeleteAtivo(ativo.id)}
                      disabled={deleting}
                    />
                  </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Chip 
                      icon={getTipoIcon(ativo.tipo)}
                      textStyle={{ color: getTipoColor(ativo.tipo) }}
                      style={[styles.chip, { borderColor: getTipoColor(ativo.tipo) }]}
                      mode="outlined"
                    >
                      {ativo.tipo.toUpperCase()}
                    </Chip>
                    {ativo.segmento && (
                      <Chip style={styles.chip} mode="outlined">
                        {ativo.segmento}
                      </Chip>
                    )}
                  </View>

                  <View style={styles.valuesContainer}>
                    <View style={styles.valueItem}>
                      <Text variant="bodySmall" style={styles.label}>Preço</Text>
                      <Text variant="titleSmall">{formatCurrency(ativo.preco)}</Text>
                    </View>
                    <View style={styles.valueItem}>
                      <Text variant="bodySmall" style={styles.label}>Quantidade</Text>
                      <Text variant="titleSmall">{ativo.quantidade.toLocaleString('pt-BR')}</Text>
                    </View>
                    <View style={styles.valueItem}>
                      <Text variant="bodySmall" style={styles.label}>Total</Text>
                      <Text variant="titleSmall" style={styles.totalValue}>
                        {formatCurrency(ativo.valorTotal)}
                      </Text>
                    </View>
                  </View>

                  {ativo.observacoes && (
                    <View style={styles.observacoesContainer}>
                      <Text variant="bodySmall" style={styles.label}>Observações</Text>
                      <Text variant="bodySmall">{ativo.observacoes}</Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}

          {filteredAtivos.length === 0 && (
            <Surface style={styles.emptyState}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                {searchQuery ? 'Nenhum ativo encontrado' : 'Nenhum ativo cadastrado'}
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                {searchQuery 
                  ? 'Tente ajustar sua busca ou filtros'
                  : 'Comece adicionando seu primeiro ativo'
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
              >{editingId ? 'Editar Ativo' : 'Novo Ativo'}</Title>
              
              <TextInput
                label="Nome do Ativo"
                value={formData.nome || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, nome: text }))}
                style={styles.input}
                mode="flat"
              />

              <TextInput
                label="Ticker/Código"
                value={formData.ticker || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, ticker: text.toUpperCase() }))}
                style={styles.input}
                mode="flat"
              />

              <View style={styles.formRow}>
                <CurrencyInput
                  value={formData.preco ?? 0}
                  onChangeValue={(value) => setFormData(prev => ({ ...prev, preco: value ?? undefined }))}
                  prefix="R$ "
                  delimiter="."
                  separator=","
                  precision={2}
                  minValue={0}
                  placeholder="R$ 0,00"
                  style={[styles.currencyInput, styles.halfInput]}
                />

                <TextInput
                  placeholder="Quantidade"
                  value={formData.quantidade?.toString() || ''}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, quantidade: parseFloat(text) || undefined }))}
                  style={[styles.input, styles.halfInput]}
                  mode="flat"
                  keyboardType="numbers-and-punctuation"
                />
              </View>

              <SegmentedButtons
                value={formData.tipo || 'acao'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as any }))}
                buttons={tiposAtivo.slice(1)} // Remove "Todos"
                style={styles.segmentedButtons}
              />

              <TextInput
                label="Segmento"
                value={formData.segmento || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, segmento: text }))}
                style={styles.input}
                mode="flat"
              />

              <TextInput
                label="Administrador"
                value={formData.administrador || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, administrador: text }))}
                style={styles.input}
                mode="flat"
              />

              <SegmentedButtons
                value={formData.status || 'ativo'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'ativo' | 'inativo' }))}
                buttons={[
                  { value: 'ativo', label: 'Ativo' },
                  { value: 'inativo', label: 'Inativo' }
                ]}
                style={styles.segmentedButtons}
              />

              <TextInput
                label="Site"
                value={formData.site || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, site: text }))}
                style={styles.input}
                mode="flat"
                placeholder="https://..."
              />

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
                  onPress={handleSaveAtivo}
                  style={styles.modalButton}
                  loading={saving}
                  disabled={saving || !formData.nome || !formData.ticker || !formData.preco || !formData.quantidade}
                >
                  {editingId ? 'Atualizar' : 'Criar'}
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
  // Override específico para modal se necessário
  modal: {
    ...sharedStyles.modal
  },
});
