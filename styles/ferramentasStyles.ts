import { cardBackground } from '@/constants/Colors';
import { buttonStyles, screenSpecificStyles, sharedStyles } from '@/styles/sharedStyles';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  ...sharedStyles,
  ...buttonStyles,
  ...screenSpecificStyles,

  // Seção de Tipos de Ativos
  tipoAtivoItem: {
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: '#F8FAFC',
  },

  tipoAtivoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  tipoAtivoIcon: {
    marginRight: 16,
  },

  tipoAtivoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  tipoAtivoInfo: {
    flex: 1,
  },

  tipoAtivoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },

  tipoAtivoDescricao: {
    fontSize: 12,
    color: '#64748B',
  },

  // Botões de ação
  actionButton: {
    marginVertical: 6,
    borderRadius: 12,
  },

  actionButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  actionButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  destructiveButton: {
    borderColor: '#EF4444',
  },

  primaryButton: {
    borderColor: '#10B981',
  },

  // Seção de gerenciamento de dados
  dataManagementSection: {
    gap: 12,
  },

  // Modal de tipos de ativos
  tipoModal: {
    backgroundColor: cardBackground,
    margin: 20,
    borderRadius: 16,
    padding: 0,
    maxHeight: '80%',
  },

  tipoModalContent: {
    padding: 20,
    gap: 16,
  },

  tipoModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },

  tipoModalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },

  tipoModalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  tipoModalButton: {
    flex: 1,
    borderRadius: 8,
  },

  modalButton: {
    flex: 1,
    borderRadius: 8,
  },

  // Lista de tipos existentes
  tiposList: {
    maxHeight: 300,
  },

  tipoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },

  tipoItemInfo: {
    flex: 1,
  },

  tipoItemNome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },

  tipoItemId: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  tipoItemActions: {
    flexDirection: 'row',
    gap: 8,
  },

  // Informações de versão e sobre
  infoSection: {
    paddingVertical: 8,
  },

  infoItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  lastInfoItem: {
    borderBottomWidth: 0,
  },

  // Estados de loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },

  // Alertas e confirmações
  alertContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },

  alertText: {
    color: '#B91C1C',
    fontSize: 14,
    textAlign: 'center',
  },

  emptyState: {
    alignItems: 'center',
    padding: 24,
  },

  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },

  emptyStateButton: {
    borderColor: '#10B981',
  },

  // Header
  headerGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  headerContent: {
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },

  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },

  // Espaçamentos
  cardMargin: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  sectionGap: {
    marginBottom: 20,
  },

  cardGap: {
    marginHorizontal: 20,
    marginVertical: 20,
  },

  // Modal de seleção de diretório
  directoryModal: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 4,
  },

  directoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
  },

  directoryModalText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },

  directoryInput: {
    marginBottom: 16,
  },

  directoryHint: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },

  directoryActions: {
    justifyContent: 'flex-end',
    gap: 8,
  },

  directoryCancelButton: {
    borderColor: '#E5E7EB',
  },

  directoryConfirmButton: {
    backgroundColor: '#10B981',
  },

  // Modal CSV
  csvModal: {
    backgroundColor: cardBackground,
    margin: 20,
    borderRadius: 16,
    padding: 0,
    maxHeight: '80%',
  },

  csvModalContent: {
    padding: 20,
    gap: 16,
  },

  csvModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },

  csvModalText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  // Estilos para Dialogs Customizadas (4 dialogs individuais)
  customDialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxWidth: 500,
    marginHorizontal: 20,
  },

  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 8,
  },

  dialogText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    textAlign: 'left',
  },

  dialogTextBold: {
    fontWeight: '700',
    color: '#1E293B',
  },

  dialogWarningText: {
    color: '#7C2D12',
  },

  dialogActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 8,
  },
});