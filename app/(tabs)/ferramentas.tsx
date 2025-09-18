import { primaryGreen, secondaryGreen } from '@/constants/Colors';
import { TipoAtivo, useFerramentas } from '@/hooks/useFerramentas';
import { styles } from '@/styles/ferramentasStyles';
import { sharedStyles } from '@/styles/sharedStyles';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
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

  // Estados para dialogs e modals
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<'clear' | 'import' | 'export' | null>(null);
  const [tipoModalVisible, setTipoModalVisible] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoAtivo | null>(null);
  const [tipoForm, setTipoForm] = useState({ nome: '', icon: '' });
  const [csvModalVisible, setCsvModalVisible] = useState(false);
  const [csvModalType, setCsvModalType] = useState<'import' | 'export' | null>(null);
  const [directoryModalVisible, setDirectoryModalVisible] = useState(false);
  const [directoryModalType, setDirectoryModalType] = useState<'templates' | 'dados' | null>(null);

  // Funções de controle de modais e dialogs
  const handleOpenDialog = (type: 'clear' | 'import' | 'export') => {
    setDialogType(type);
    setDialogVisible(true);
  };

  const handleCloseDialog = () => {
    setDialogVisible(false);
    setDialogType(null);
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

  const handleCloseCsvModal = () => {
    setCsvModalVisible(false);
    setCsvModalType(null);
  };

  const handleOpenDirectoryModal = (type: 'templates' | 'dados') => {
    setDirectoryModalType(type);
    setDirectoryModalVisible(true);
  };

  const handleCloseDirectoryModal = () => {
    setDirectoryModalVisible(false);
    setDirectoryModalType(null);
  };

  // Funções de ação
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
    const success = await clearAllData();
    if (success) {
      handleCloseDialog();
    }
  };

  const handleImportData = () => {
    setCsvModalType('import');
    setCsvModalVisible(true);
    handleCloseDialog();
  };

  const handleExportTemplates = () => {
    console.log('Botão Export Templates clicado');
    handleOpenDirectoryModal('templates');
  };

  const handleExportData = () => {
    console.log('Botão Export Data clicado');
    handleOpenDirectoryModal('dados');
  };

  // Funções de exportação
  const handleConfirmDirectory = async () => {
    handleCloseDirectoryModal();

    if (directoryModalType === 'templates') {
      await exportTemplatesWithDirectory();
    } else if (directoryModalType === 'dados') {
      await exportDataWithDirectory();
    }
  };

  const exportTemplatesWithDirectory = async () => {
    try {
      const templates = generateCSVTemplates();
      
      const timestamp = new Date().toISOString().slice(0, 10);
      const filesCreated = [
        { name: `ativos_template_${timestamp}.csv`, content: templates.ativos },
        { name: `proventos_template_${timestamp}.csv`, content: templates.proventos },
        { name: `movimentacoes_template_${timestamp}.csv`, content: templates.movimentacoes }
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
      
      const timestamp = new Date().toISOString().slice(0, 10);
      const filesCreated = [
        { name: `ativos_${timestamp}.csv`, content: ativos },
        { name: `proventos_${timestamp}.csv`, content: proventos },
        { name: `movimentacoes_${timestamp}.csv`, content: movimentacoes }
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

  // Função auxiliar para obter conteúdo do dialog
  const getDialogContent = () => {
    switch (dialogType) {
      case 'clear':
        return {
          title: 'Limpar Todos os Dados',
          content: 'Esta ação irá deletar TODOS os dados do aplicativo. Esta ação não pode ser desfeita.',
          actionText: 'Limpar Dados',
          action: handleClearData,
        };
      case 'import':
        return {
          title: 'Importar Dados',
          content: 'Deseja importar dados de um arquivo CSV?',
          actionText: 'Importar',
          action: handleImportData,
        };
      default:
        return null;
    }
  };

  const dialogContent = getDialogContent();

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

        <ScrollView 
          style={sharedStyles.scrollView}
          contentContainerStyle={sharedStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
                  onPress={handleExportData}
                  style={[styles.actionButton, { backgroundColor: primaryGreen }]}
                  contentStyle={styles.actionButtonContent}
                  icon="download"
                >
                  Exportar Dados
                </Button>

                <Button
                  mode="contained"
                  onPress={handleExportTemplates}
                  style={[styles.actionButton, { backgroundColor: secondaryGreen }]}
                  contentStyle={styles.actionButtonContent}
                  icon="file-download"
                >
                  Exportar Templates
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => handleOpenDialog('import')}
                  style={styles.actionButton}
                  contentStyle={styles.actionButtonContent}
                  icon="upload"
                >
                  Importar Dados
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => handleOpenDialog('clear')}
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
          {/* Dialog de confirmação */}
          <Dialog visible={dialogVisible} onDismiss={handleCloseDialog}>
            <Dialog.Title>{dialogContent?.title}</Dialog.Title>
            <Dialog.Content>
              <Text>{dialogContent?.content}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleCloseDialog}>Cancelar</Button>
              <Button 
                onPress={dialogContent?.action}
                loading={clearing && dialogType === 'clear'}
                disabled={clearing && dialogType === 'clear'}
              >
                {dialogContent?.actionText}
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

          {/* Modal de CSV */}
          <Modal
            visible={csvModalVisible}
            onDismiss={handleCloseCsvModal}
            contentContainerStyle={styles.csvModal}
          >
            <ScrollView contentContainerStyle={styles.csvModalContent}>
              <Text style={styles.csvModalTitle}>
                {csvModalType === 'export' ? 'Exportar Dados CSV' : 'Importar Dados CSV'}
              </Text>

              <Text style={styles.csvModalText}>
                {csvModalType === 'export' 
                  ? 'Escolha o formato e local para exportar seus dados:'
                  : 'Selecione os arquivos CSV para importar:'}
              </Text>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={handleCloseCsvModal}
                  style={styles.modalButton}
                >
                  Cancelar
                </Button>
                {csvModalType === 'export' ? (
                  <Button
                    mode="contained"
                    onPress={async () => {
                      handleCloseCsvModal();
                      await exportDataCSVToDirectory();
                    }}
                    style={styles.modalButton}
                    buttonColor={primaryGreen}
                    icon="download"
                  >
                    Exportar
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    onPress={async () => {
                      handleCloseCsvModal();
                      await selectAndImportCSVFiles();
                    }}
                    style={styles.modalButton}
                    buttonColor={primaryGreen}
                    icon="upload"
                  >
                    Selecionar e Importar
                  </Button>
                )}
              </View>
            </ScrollView>
          </Modal>

          {/* Modal para seleção de diretório */}
          <Modal
            visible={directoryModalVisible}
            onDismiss={handleCloseDirectoryModal}
            contentContainerStyle={styles.directoryModal}
          >
            <Card style={styles.directoryCard}>
              <Card.Title
                title={`${directoryModalType === 'templates' ? 'Baixar Templates' : 'Exportar Dados'}`}
                subtitle="Os arquivos serão baixados automaticamente"
                left={(props) => <Avatar.Icon {...props} icon="download" />}
              />
              
              <Card.Content>
                <Text style={styles.directoryModalText}>
                  {directoryModalType === 'templates' 
                    ? 'Os templates CSV serão baixados para sua pasta de Downloads padrão. Você poderá escolher o local final no seu gerenciador de arquivos.'
                    : 'Seus dados serão exportados e baixados para sua pasta de Downloads padrão. Você poderá escolher o local final no seu gerenciador de arquivos.'
                  }
                </Text>
              </Card.Content>
              
              <Card.Actions style={styles.directoryActions}>
                <Button
                  mode="outlined"
                  onPress={handleCloseDirectoryModal}
                  style={styles.directoryCancelButton}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleConfirmDirectory}
                  style={styles.directoryConfirmButton}
                >
                  {directoryModalType === 'templates' ? 'Baixar Templates' : 'Exportar Dados'}
                </Button>
              </Card.Actions>
            </Card>
          </Modal>

        </Portal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}