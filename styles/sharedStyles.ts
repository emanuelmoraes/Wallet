import { StyleSheet } from 'react-native';

export const sharedStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    textAlign: 'center',
  },

  // Stats header styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
  },

  // Header styles
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerWithPadding: {
    padding: 16,
    paddingBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },

  // Search and filter styles
  searchbar: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterLabel: {
    marginBottom: 8,
    paddingHorizontal: 8,
    opacity: 0.7,
  },
  segmentedButtons: {
    marginVertical: 8,
  },

  // Scroll view styles
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Card styles
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  divider: {
    marginVertical: 12,
  },
  cardBody: {
    gap: 12,
  },

  // Info and chips styles
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 4,
  },

  // Values container styles
  valuesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueItem: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    opacity: 0.7,
    marginBottom: 4,
  },

  // Total value styles
  totalContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalValue: {
    fontWeight: 'bold',
  },

  // Observações styles
  observacoesContainer: {
    paddingTop: 8,
  },

  // Empty state styles
  emptyState: {
    padding: 32,
    margin: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },

  // FAB styles
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },

  // Modal styles
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalContent: {
    paddingBottom: 20,
  },

  // Form styles
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 4,
  },
  currencyInput: {
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderRadius: 4,
    height: 59,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  pickerLabel: {
    marginBottom: 8,
    opacity: 0.7,
    color: '#000000',
  },

  // Modal action styles
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

// Estilos específicos para diferentes tipos de botões de seleção
export const buttonStyles = StyleSheet.create({
  // Buttons container styles
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  button: {
    marginBottom: 4,
  },
  
  // Tipo buttons (proventos)
  typeButtons: {
    gap: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
  },
  typeButton: {
    marginTop: 4,
    marginBottom: 2,
    width: '32%',
  },

  // Segmento buttons (movimentações)
  segmentoButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  segmentoButton: {
    flex: 1,
    marginBottom: 4,
    minWidth: 80,
  },

  // Operação buttons (movimentações)
  operacaoButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  operacaoButton: {
    flex: 1,
    marginBottom: 4,
  },
});

// Estilos específicos para diferentes telas
export const screenSpecificStyles = StyleSheet.create({
  // Ativos screen specific styles
  ativoSelector: {
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
  },
  ativoButton: {
    marginBottom: 4,
    justifyContent: 'flex-start',
    maxWidth: '20%',
  },

  // Picker container styles (quando necessário)
  pickerContainer: {
    flex: 1,
  },
  pickerButton: {
    marginBottom: 4,
  },

  // Total container specific styles for different contexts
  totalContainerCentered: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
