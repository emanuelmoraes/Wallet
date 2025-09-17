import { cardBackground } from '@/constants/Colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

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

  // Card actions
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  // Ativo details
  ativoDetails: {
    gap: 12,
  },

  // Modal styles
  modal: {
    backgroundColor: cardBackground,
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  
  modalContent: {
    paddingBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },

  // Form styles
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  
  currencyInput: {
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    borderRadius: 4,
    height: 56,
  },
  
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  
  halfInput: {
    flex: 1,
  },
  
  pickerLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },

  segmentedButtons: {
    marginBottom: 12,
  },

  // Modal actions
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  
  modalButton: {
    flex: 1,
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
    maxHeight: '70%',
  },

  filterModalContent: {
    paddingBottom: 20,
  },

  filterModalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },

  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 24,
  },

  filterModalChip: {
    marginBottom: 8,
  },

  filterModalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});