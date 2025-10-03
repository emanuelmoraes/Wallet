import { backgroundGray, cardBackground, darkBackground, darkCard } from '@/constants/Colors';
import { Platform, StyleSheet } from 'react-native';

export const sharedStyles = StyleSheet.create({
  quickStatsContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  quickStatCard: {
    flex: 1,
    backgroundColor: '#2e323dff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  quickStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // ==================== CONTAINER STYLES ====================
  container: {
    flex: 1,
    backgroundColor: darkBackground,
  },
  
  // Safe area container with modern background
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#F8FAFB',
  },

  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#64748B',
  },

  // ==================== MODERN HEADER STYLES ====================
  modernHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },

  headerSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // ==================== MODERN STATS CONTAINER ====================
  modernStatsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },

  // ==================== MODERN CARD STYLES ====================
  modernCard: {
    backgroundColor: darkCard,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // Gradient card for featured content
  gradientCard: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00D4AA15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  cardTitleContainer: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },

  // ==================== SCROLL VIEW STYLES ====================
  scrollView: {
    flex: 1,
    backgroundColor: backgroundGray,
  },

  scrollContent: {
    paddingBottom: 100, // Space for FAB
  },

  // ==================== MODERN DIVIDERS ====================
  modernDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },

  spacer: {
    height: 16,
  },

  largeSpacer: {
    height: 24,
  },

  // ==================== VALUE DISPLAY STYLES ====================
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  valueLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  valueAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  primaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00D4AA',
    textAlign: 'center',
  },

  positiveValue: {
    color: '#00D4AA',
  },

  negativeValue: {
    color: '#FF5A5A',
  },

  // ==================== SEARCH AND FILTER STYLES ====================
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },

  modernSearchbar: {
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    elevation: 0,
  },

  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },

  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  segmentedButtons: {
    borderRadius: 12,
  },

  // ==================== CHIP STYLES ====================
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },

  modernChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },

  // ==================== EMPTY STATE STYLES ====================
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    margin: 20,
    backgroundColor: cardBackground,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ==================== BUTTON STYLES ====================
  modernButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButton: {
    backgroundColor: '#00D4AA',
  },

  secondaryButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  primaryButtonText: {
    color: '#FFFFFF',
  },

  secondaryButtonText: {
    color: '#475569',
  },

  // ==================== FAB STYLES ====================
  modernFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#00D4AA',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#00D4AA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  // ==================== LEGACY COMPATIBILITY ====================
  // Keep some legacy styles for backward compatibility
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  titleSection: {
    alignItems: 'center',
    marginBottom: 16,
  },

  statsContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },

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

  searchbar: {
    marginHorizontal: 16,
    marginBottom: 8,
  },

  card: {
    marginBottom: 12,
    elevation: 2,
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

  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    marginRight: 4,
  },

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

  totalContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  totalValue: {
    fontWeight: 'bold',
  },

  observacoesContainer: {
    paddingTop: 8,
  },

  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },

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

  input: {
    marginBottom: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 4,
    color: 'black',
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
    color: '#1E293B',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },

  modalButton: {
    flex: 1,
    borderColor: '#64748B'
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
