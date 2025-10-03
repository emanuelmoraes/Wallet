import { primaryGreen, secondaryGreen } from '@/constants/Colors';
import { TipoAtivo, useFerramentas } from '@/hooks/useFerramentas';
import { styles } from '@/styles/ferramentasStyles';
import { sharedStyles } from '@/styles/sharedStyles';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  Icon,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function FerramentasScreen() {
  const theme = useTheme();
  const {
    tiposAtivos,
    loading,
    saving,
    clearing,
    validationErrors,
    showValidationDialog,
    clearValidationErrors,
    createTipoAtivo,
    updateTipoAtivo,
    deleteTipoAtivo,
    toggleTipoAtivo,
    clearAllData,
    exportData,
    importData,
    exportDataCSV,
    importDataCSV,
    generateCSVTemplates,
    exportDataCSVToDirectory,
    exportCSVTemplatesToDirectory,
    selectAndImportCSVFiles,
    refreshTiposAtivos,
  } = useFerramentas();

  // Estados para dialogs individuais (4 dialogs)
  const [exportDataDialogVisible, setExportDataDialogVisible] = useState(false);
  const [exportTemplatesDialogVisible, setExportTemplatesDialogVisible] = useState(false);
  const [importDataDialogVisible, setImportDataDialogVisible] = useState(false);
  const [clearDataDialogVisible, setClearDataDialogVisible] = useState(false);

  // Estado para dialog de resultado (sucesso/erro)
  const [resultDialogVisible, setResultDialogVisible] = useState(false);
  const [resultDialogData, setResultDialogData] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  // Estados para modals
  const [tipoModalVisible, setTipoModalVisible] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoAtivo | null>(null);
  const [tipoForm, setTipoForm] = useState({ nome: '', icon: '' });

  // Funções de controle de dialogs individuais
  const showResultDialog = (type: 'success' | 'error', title: string, message: string) => {
    setResultDialogData({ type, title, message });
    setResultDialogVisible(true);
  };

  const closeResultDialog = () => {
    setResultDialogVisible(false);
    setResultDialogData(null);
  };

  const handleOpenTipoModal = (tipo?: TipoAtivo) => {
    if (tipo) {
      setEditingTipo(tipo);
      setTipoForm({ nome: tipo.nome, icon: tipo.icon });
    } else {
      setEditingTipo(null);
      setTipoForm({ nome: '', icon: 'help-circle' });
    }
    setTipoModalVisible(true);
  };

  const handleCloseTipoModal = () => {
    setTipoModalVisible(false);
    setEditingTipo(null);
    setTipoForm({ nome: '', icon: '' });
  };

  // Funções de ação para cada botão
  const handleSaveTipo = async () => {
    if (!tipoForm.nome.trim()) {
      Alert.alert('Erro', 'Nome do tipo é obrigatório');
      return;
    }

    let success = false;

    if (editingTipo) {
      success = await updateTipoAtivo(editingTipo.id, tipoForm.nome, tipoForm.icon);
    } else {
      success = await createTipoAtivo(tipoForm.nome, tipoForm.icon);
    }

    if (success) {
      handleCloseTipoModal();
    }
  };

  const handleDeleteTipo = async (tipo: TipoAtivo) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja deletar o tipo "${tipo.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: () => deleteTipoAtivo(tipo.id),
        },
      ]
    );
  };

  const handleClearData = async () => {
    setClearDataDialogVisible(false);
    const success = await clearAllData();

    if (success) {
      showResultDialog(
        'success',
        'Dados Limpos com Sucesso!',
        'Todos os dados do aplicativo foram removidos.\n\n✅ Ativos, proventos e movimentações foram deletados.'
      );
    } else {
      showResultDialog(
        'error',
        'Erro ao Limpar Dados',
        'Ocorreu um erro ao tentar limpar os dados. Por favor, tente novamente.'
      );
    }
  };

  const handleImportData = async () => {
    setImportDataDialogVisible(false);
    const success = await selectAndImportCSVFiles();

    if (success) {
      showResultDialog(
        'success',
        'Importação Concluída!',
        'Os dados foram importados com sucesso!\n\n✅ Navegue para as outras telas para visualizar os dados importados.'
      );
    } else {
      showResultDialog(
        'error',
        'Erro na Importação',
        'Ocorreu um erro durante a importação dos dados.\n\nVerifique se os arquivos CSV estão no formato correto e tente novamente.'
      );
    }
  };

  const handleExportTemplates = async () => {
    console.log('Botão Export Templates clicado');
    setExportTemplatesDialogVisible(false);
    await exportTemplatesWithDirectory();
  };

  const handleExportData = async () => {
    console.log('Botão Export Data clicado');
    setExportDataDialogVisible(false);
    await exportDataWithDirectory();
  };

  const exportTemplatesWithDirectory = async () => {
    try {
      const templates = generateCSVTemplates();

      const filesCreated = [
        { name: `ativos_template.csv`, content: templates.ativos },
        { name: `proventos_template.csv`, content: templates.proventos },
        { name: `movimentacoes_template.csv`, content: templates.movimentacoes }
      ];

      console.log('=== TEMPLATES PREPARADOS ===');

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        filesCreated.forEach(file => {
          const blob = new Blob([file.content], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', file.name);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log(`📄 Arquivo baixado: ${file.name}`);
        });

        Alert.alert(
          'Templates Baixados!',
          `✅ Templates foram baixados com sucesso!\n\n📄 Arquivos:\n${filesCreated.map(f => `• ${f.name}`).join('\n')}\n\n💾 Os arquivos foram baixados!\n\n💡 Use como referência para importar dados.`,
          [{ text: 'OK' }]
        );
      } else {
        filesCreated.forEach(file => {
          console.log(`\n📄 Arquivo: ${file.name}`);
          console.log(file.content);
        });

        Alert.alert(
          'Templates Preparados!',
          `📄 Templates foram preparados!\n\n📱 Verifique o console para o conteúdo dos templates.\n\n💡 Copie o conteúdo para criar os arquivos CSV.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Erro ao exportar templates:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', `Erro ao preparar templates: ${errorMessage}`, [{ text: 'OK' }]);
    }
  };

  const exportDataWithDirectory = async () => {
    try {
      const csvData = await exportDataCSV();
      if (!csvData) return;

      const { ativos, proventos, movimentacoes, stats } = csvData;

      const filesCreated = [
        { name: `ativos.csv`, content: ativos },
        { name: `proventos.csv`, content: proventos },
        { name: `movimentacoes.csv`, content: movimentacoes }
      ];

      console.log('=== DADOS PREPARADOS ===');

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        filesCreated.forEach(file => {
          const blob = new Blob([file.content], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', file.name);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log(`📄 Arquivo baixado: ${file.name}`);
        });

        Alert.alert(
          'Dados Exportados!',
          `✅ Dados foram exportados com sucesso!\n\n📄 Arquivos:\n${filesCreated.map(f => `• ${f.name}`).join('\n')}\n\n📊 Resumo:\n• ${stats.ativos} ativos\n• ${stats.proventos} proventos\n• ${stats.movimentacoes} movimentações\n\n💾 Os arquivos foram baixados!`,
          [{ text: 'OK' }]
        );
      } else {
        filesCreated.forEach(file => {
          console.log(`\n📄 Arquivo: ${file.name}`);
          console.log(file.content);
        });

        Alert.alert(
          'Dados Preparados!',
          `📄 Dados foram preparados!\n\n📱 Verifique o console para o conteúdo dos dados.\n\n📊 Resumo:\n• ${stats.ativos} ativos\n• ${stats.proventos} proventos\n• ${stats.movimentacoes} movimentações\n\n💡 Copie o conteúdo para criar os arquivos CSV.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', `Erro ao preparar dados: ${errorMessage}`, [{ text: 'OK' }]);
    }
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[sharedStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" animating={true} />
          <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>
            Carregando ferramentas...
          </Text>
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
          <LinearGradient
            colors={['#1DD1A1', '#55efc4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Ferramentas</Text>
              <Text style={styles.headerSubtitle}>Administre seu aplicativo e dados</Text>
            </View>
          </LinearGradient>

          {/* Seção de Tipos de Ativos */}
          <Card style={styles.cardMargin}>
            <Card.Title
              title="🏢 Tipos de Ativos"
              subtitle="Gerencie os tipos de investimentos"
              left={(props) => <Icon {...props} source="office-building" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="plus"
                  onPress={() => handleOpenTipoModal()}
                />
              )}
            />
            <Card.Content>
              {tiposAtivos.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon source="help-circle" size={48} />
                  <Text style={styles.emptyStateText}>Nenhum tipo de ativo cadastrado</Text>
                  <Button
                    mode="outlined"
                    onPress={() => handleOpenTipoModal()}
                    style={styles.emptyStateButton}
                  >
                    Adicionar Novo Tipo
                  </Button>
                </View>
              ) : (
                tiposAtivos.map((tipo) => (
                  <View key={tipo.id} style={styles.tipoAtivoItem}>
                    <View style={styles.tipoAtivoContent}>
                      <View style={styles.tipoAtivoIcon}>
                        <Icon
                          source={tipo.icon || 'help-circle'}
                          size={24}
                        />
                      </View>
                      <View style={styles.tipoAtivoInfo}>
                        <Text style={styles.tipoAtivoNome}>{tipo.nome}</Text>
                        <Text style={styles.tipoAtivoDescricao}>
                          Ícone: {tipo.icon} • {tipo.ativo ? 'Ativo' : 'Inativo'}
                        </Text>
                      </View>
                      <View style={styles.tipoAtivoActions}>
                        <IconButton
                          icon={tipo.ativo ? 'eye' : 'eye-off'}
                          size={20}
                          onPress={() => toggleTipoAtivo(tipo.id)}
                        />
                        <IconButton
                          icon="pencil"
                          size={20}
                          onPress={() => handleOpenTipoModal(tipo)}
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          onPress={() => handleDeleteTipo(tipo)}
                        />
                      </View>
                    </View>
                  </View>
                ))
              )}
            </Card.Content>
          </Card>

          {/* Seção de Gerenciamento de Dados */}
          <Card style={styles.cardGap}>
            <Card.Title
              title="💾 Gerenciamento de Dados"
              subtitle="Importe, exporte ou limpe seus dados"
              left={(props) => <Icon {...props} source="database" />}
            />
            <Card.Content>
              <View style={styles.actionButtonsGrid}>
                <Button
                  mode="contained"
                  onPress={() => setExportDataDialogVisible(true)}
                  style={[styles.actionButton, { backgroundColor: primaryGreen }]}
                  contentStyle={styles.actionButtonContent}
                  icon="download"
                >
                  Exportar Dados
                </Button>

                <Button
                  mode="contained"
                  onPress={() => setExportTemplatesDialogVisible(true)}
                  style={[styles.actionButton, { backgroundColor: secondaryGreen }]}
                  contentStyle={styles.actionButtonContent}
                  icon="file-download"
                >
                  Exportar Templates
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => setImportDataDialogVisible(true)}
                  style={styles.actionButton}
                  contentStyle={styles.actionButtonContent}
                  icon="upload"
                >
                  Importar Dados
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => setClearDataDialogVisible(true)}
                  style={[styles.actionButton, { borderColor: '#EF4444' }]}
                  contentStyle={styles.actionButtonContent}
                  textColor="#EF4444"
                  icon="delete-sweep"
                >
                  Limpar Todos os Dados
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        <Portal>
          {/* DIALOG 1: Exportar Dados */}
          <Dialog
            visible={exportDataDialogVisible}
            onDismiss={() => setExportDataDialogVisible(false)}
            style={styles.customDialog}
          >
            <Dialog.Icon icon="download" size={45} color={primaryGreen} />
            <Dialog.Title style={styles.dialogTitle}>Exportar Dados</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>
                Seus dados serão exportados em formato CSV.{'\n\n'}
                📄 <Text style={styles.dialogTextBold}>Arquivos que serão baixados:</Text>{'\n'}
                • ativos.csv{'\n'}
                • proventos.csv{'\n'}
                • movimentacoes.csv{'\n\n'}
                💾 Os arquivos serão salvos na sua pasta de Downloads.
              </Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              <Button
                onPress={() => setExportDataDialogVisible(false)}
                textColor="#64748B"
              >
                Cancelar
              </Button>
              <Button
                onPress={handleExportData}
                mode="contained"
                buttonColor={primaryGreen}
                icon="download"
              >
                Exportar
              </Button>
            </Dialog.Actions>
          </Dialog>

          {/* DIALOG 2: Exportar Templates */}
          <Dialog
            visible={exportTemplatesDialogVisible}
            onDismiss={() => setExportTemplatesDialogVisible(false)}
            style={styles.customDialog}
          >
            <Dialog.Icon icon="file-download" size={45} color={secondaryGreen} />
            <Dialog.Title style={styles.dialogTitle}>Exportar Templates</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>
                Templates CSV de exemplo serão baixados para ajudá-lo na importação.{'\n\n'}
                📄 <Text style={styles.dialogTextBold}>Arquivos template:</Text>{'\n'}
                • ativos_template.csv{'\n'}
                • proventos_template.csv{'\n'}
                • movimentacoes_template.csv{'\n\n'}
                💡 Use esses templates como referência para criar seus arquivos de importação.
              </Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              <Button
                onPress={() => setExportTemplatesDialogVisible(false)}
                textColor="#64748B"
              >
                Cancelar
              </Button>
              <Button
                onPress={handleExportTemplates}
                mode="contained"
                buttonColor={secondaryGreen}
                icon="file-download"
              >
                Baixar Templates
              </Button>
            </Dialog.Actions>
          </Dialog>

          {/* DIALOG 3: Importar Dados */}
          <Dialog
            visible={importDataDialogVisible}
            onDismiss={() => setImportDataDialogVisible(false)}
            style={styles.customDialog}
          >
            <Dialog.Icon icon="upload" size={45} color={primaryGreen} />
            <Dialog.Title style={styles.dialogTitle}>Importar Dados CSV</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>
                Selecione os arquivos CSV para importar seus dados.{'\n\n'}
                📄 <Text style={styles.dialogTextBold}>Tipos de arquivo aceitos:</Text>{'\n'}
                • ativos.csv - Para importar ativos{'\n'}
                • proventos.csv - Para importar proventos{'\n'}
                • movimentacoes.csv - Para importar movimentações{'\n\n'}
                💡 <Text style={styles.dialogTextBold}>Dica:</Text> Você pode selecionar múltiplos arquivos de uma vez.
              </Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              <Button
                onPress={() => setImportDataDialogVisible(false)}
                textColor="#64748B"
              >
                Cancelar
              </Button>
              <Button
                onPress={handleImportData}
                mode="contained"
                buttonColor={primaryGreen}
                icon="upload"
              >
                Selecionar Arquivos
              </Button>
            </Dialog.Actions>
          </Dialog>

          {/* DIALOG 4: Limpar Dados */}
          <Dialog
            visible={clearDataDialogVisible}
            onDismiss={() => setClearDataDialogVisible(false)}
            style={styles.customDialog}
          >
            <Dialog.Icon icon="alert-circle" size={45} color="#EF4444" />
            <Dialog.Title style={styles.dialogTitle}>Limpar Todos os Dados</Dialog.Title>
            <Dialog.Content>
              <Text style={[styles.dialogText, styles.dialogWarningText]}>
                <Text style={styles.dialogTextBold}>⚠️ ATENÇÃO:</Text> Esta ação irá deletar <Text style={styles.dialogTextBold}>TODOS</Text> os dados do aplicativo.{'\n\n'}
                <Text style={styles.dialogTextBold}>Serão removidos:</Text>{'\n'}
                • Todos os ativos{'\n'}
                • Todos os proventos{'\n'}
                • Todas as movimentações{'\n\n'}
                ❌ <Text style={styles.dialogTextBold}>Esta ação não pode ser desfeita!</Text>
              </Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              <Button
                onPress={() => setClearDataDialogVisible(false)}
                mode="contained"
                buttonColor="#64748B"
              >
                Cancelar
              </Button>
              <Button
                onPress={handleClearData}
                mode="contained"
                buttonColor="#EF4444"
                loading={clearing}
                disabled={clearing}
                icon="delete-sweep"
              >
                Limpar Dados
              </Button>
            </Dialog.Actions>
          </Dialog>

          {/* DIALOG 5: Resultado (Sucesso ou Erro) */}
          <Dialog
            visible={resultDialogVisible}
            onDismiss={closeResultDialog}
            style={styles.customDialog}
          >
            <Dialog.Icon
              icon={resultDialogData?.type === 'success' ? 'check-circle' : 'alert-circle'}
              size={50}
              color={resultDialogData?.type === 'success' ? primaryGreen : '#EF4444'}
            />
            <Dialog.Title style={styles.dialogTitle}>
              {resultDialogData?.title}
            </Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>
                {resultDialogData?.message}
              </Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              <Button
                onPress={closeResultDialog}
                mode="contained"
                buttonColor={resultDialogData?.type === 'success' ? primaryGreen : '#EF4444'}
              >
                OK
              </Button>
            </Dialog.Actions>
          </Dialog>

          {/* Modal para criar/editar tipos de ativos */}
          <Modal
            visible={tipoModalVisible}
            onDismiss={handleCloseTipoModal}
            contentContainerStyle={styles.tipoModal}
          >
            <ScrollView contentContainerStyle={styles.tipoModalContent}>
              <Text style={styles.tipoModalTitle}>
                {editingTipo ? 'Editar Tipo de Ativo' : 'Novo Tipo de Ativo'}
              </Text>

              <TextInput
                label="Nome do Tipo"
                value={tipoForm.nome}
                onChangeText={(text) => setTipoForm(prev => ({ ...prev, nome: text }))}
                style={styles.tipoModalInput}
                mode="outlined"
                outlineColor={primaryGreen}
                activeOutlineColor={primaryGreen}
              />

              <TextInput
                label="Ícone (Material Design)"
                value={tipoForm.icon}
                onChangeText={(text) => setTipoForm(prev => ({ ...prev, icon: text }))}
                style={styles.tipoModalInput}
                mode="outlined"
                outlineColor={primaryGreen}
                activeOutlineColor={primaryGreen}
                placeholder="Ex: chart-line, office-building, bank"
                right={
                  <TextInput.Icon
                    icon={tipoForm.icon || 'help-circle'}
                  />
                }
              />

              <View style={styles.tipoModalActions}>
                <Button
                  mode="outlined"
                  onPress={handleCloseTipoModal}
                  style={styles.tipoModalButton}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveTipo}
                  style={styles.tipoModalButton}
                  buttonColor={primaryGreen}
                  loading={saving}
                  disabled={saving || !tipoForm.nome.trim()}
                >
                  {editingTipo ? 'Atualizar' : 'Criar'}
                </Button>
              </View>
            </ScrollView>
          </Modal>

          {/* Dialog de Erros de Validação */}
          <Dialog visible={showValidationDialog} onDismiss={clearValidationErrors}>
            <Dialog.Icon icon="alert-circle" size={30} />
            <Dialog.Title style={{ textAlign: 'center' }}>
              Erros de Validação CSV
            </Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                Foram encontrados erros no arquivo CSV que precisam ser corrigidos:
              </Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {validationErrors.map((error, index) => (
                  <Card key={index} style={{ marginBottom: 8, backgroundColor: '#ffebee' }}>
                    <Card.Content style={{ paddingVertical: 8 }}>
                      <Text variant="labelMedium" style={{ color: '#c62828', fontWeight: 'bold' }}>
                        Linha {error.line}
                      </Text>
                      <Text variant="bodySmall" style={{ color: '#d32f2f', marginTop: 4 }}>
                        {error.message}
                      </Text>
                      {error.field && (
                        <Text variant="bodySmall" style={{ color: '#666', marginTop: 2 }}>
                          Campo: {error.field}
                        </Text>
                      )}
                      {error.value && (
                        <Text variant="bodySmall" style={{ color: '#666', marginTop: 2 }}>
                          Valor encontrado: "{error.value}"
                        </Text>
                      )}
                      {error.expected && (
                        <Text variant="bodySmall" style={{ color: '#2e7d32', marginTop: 2 }}>
                          Valores aceitos: {error.expected}
                        </Text>
                      )}
                    </Card.Content>
                  </Card>
                ))}
              </ScrollView>
              <Text variant="bodySmall" style={{ marginTop: 16, color: '#666', fontStyle: 'italic' }}>
                💡 Corrija os erros no arquivo CSV e tente importar novamente.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={clearValidationErrors}>
                Fechar
              </Button>
            </Dialog.Actions>
          </Dialog>

        </Portal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}