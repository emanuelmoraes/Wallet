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

  // Card Styles
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },

  proventoDetails: {
    flexDirection: 'column',
    gap: 12,
  },

  modalButton: {
    marginHorizontal: 8,
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