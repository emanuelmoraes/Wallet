import { cardBackground } from '@/constants/Colors';
import { buttonStyles, screenSpecificStyles, sharedStyles } from '@/styles/sharedStyles';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  ...sharedStyles,
  ...buttonStyles,
  ...screenSpecificStyles,

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

  // Estilos para o layout modernizado
  movimentacaoDetails: {
    gap: 16,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },

  detailItem: {
    flex: 1,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  observacaoContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  
  // Estilos específicos para layout de tabela compacta
  fullTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  
  tableItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 1,
    minWidth: 60,
  },
  
  compactLabel: {
    opacity: 0.7,
    marginBottom: 2,
    textAlign: 'center',
    fontSize: 9,
  },

  // Search wrapper styles
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  filterIconButton: {
    marginLeft: 8,
  },

  // Filter Modal styles
  filterModal: {
    backgroundColor: cardBackground,
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },

  filterModalContent: {
    paddingBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },

  filterModalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },

  filterGroup: {
    marginBottom: 24,
  },

  filterGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },

  filterModalChip: {
    marginBottom: 8,
  },

  filterModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
});