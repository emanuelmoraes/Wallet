import { Colors } from '@/constants/Colors';
import { useAtivos } from '@/hooks/useAtivos';
import { useColorScheme } from '@/hooks/useColorScheme';
import { sharedStyles } from '@/styles/sharedStyles';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Divider,
  ProgressBar,
  Text,
  useTheme
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PortfolioScreen() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const {
    ativos,
    portfolioStats,
    distribuicaoTipos,
    distribuicaoSegmentos,
    topAtivos,
    loading,
    refreshData,
  } = useAtivos();

  const isPositive = (value: number) => value >= 0;
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
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
      case 'acao': return colors.primary;
      case 'fii': return colors.secondary;
      case 'renda_fixa': return '#4CAF50';
      case 'cripto': return '#FF9800';
      default: return colors.icon;
    }
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[sharedStyles.container, { backgroundColor: colors.background }]}>
          <View style={sharedStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[sharedStyles.loadingText, { color: colors.textSecondary }]}>
              Carregando portfólio...
            </Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[sharedStyles.container, { backgroundColor: colors.background }]}>
        {/* Modern Header with Balance */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.gradientHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Bem-vindo ao seu</Text>
            <Text style={styles.portfolioTitle}>Portfolio</Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Valor Total</Text>
              <Text style={styles.balanceValue}>
                {portfolioStats ? formatCurrency(portfolioStats.valorTotal) : 'R$ 0,00'}
              </Text>
              {portfolioStats && (
                <View style={styles.returnContainer}>
                  <Text style={[
                    styles.returnText,
                    { color: isPositive(portfolioStats.rendimentoTotal) ? '#FFFFFF' : '#FFE5E5' }
                  ]}>
                    {formatPercentage(portfolioStats.rendimentoPercentual)}
                  </Text>
                  <Text style={styles.returnValue}>
                    {formatCurrency(portfolioStats.rendimentoTotal)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats Cards */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStatsRow}>
            <View style={[styles.quickStatCard, { backgroundColor: colors.surface }]}>
              <Avatar.Icon 
                size={40} 
                icon="chart-line" 
                style={{ backgroundColor: colors.primary + '15' }}
                color={colors.primary}
              />
              <Text style={[styles.quickStatValue, { color: colors.primary }]}>
                {portfolioStats ? portfolioStats.valorTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '0'}
              </Text>
              <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Investido</Text>
            </View>
            
            <View style={[styles.quickStatCard, { backgroundColor: colors.surface }]}>
              <Avatar.Icon 
                size={40} 
                icon="trending-up" 
                style={{ backgroundColor: colors.success + '15' }}
                color={colors.success}
              />
              <Text style={[styles.quickStatValue, { color: colors.success }]}>
                {portfolioStats ? portfolioStats.rendimentoTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '0'}
              </Text>
              <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Retorno</Text>
            </View>
            
            <View style={[styles.quickStatCard, { backgroundColor: colors.surface }]}>
              <Avatar.Icon 
                size={40} 
                icon="briefcase" 
                style={{ backgroundColor: colors.warning + '15' }}
                color={colors.warning}
              />
              <Text style={[styles.quickStatValue, { color: colors.warning }]}>
                {ativos.length}
              </Text>
              <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Ativos</Text>
            </View>
          </View>
        </View>

        <ScrollView style={sharedStyles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Portfolio Summary Card */}
          <View style={[sharedStyles.modernCard, { backgroundColor: colors.surface }]}>
            <View style={sharedStyles.cardHeader}>
              <View style={[sharedStyles.cardIcon, { backgroundColor: colors.primaryContainer }]}>
                <Avatar.Icon 
                  size={32} 
                  icon="wallet" 
                  style={{ backgroundColor: 'transparent' }}
                  color={colors.primary}
                />
              </View>
              <View style={sharedStyles.cardTitleContainer}>
                <Text style={[sharedStyles.cardTitle, { color: colors.text }]}>
                  Resumo do Portfolio
                </Text>
                <Text style={[sharedStyles.cardSubtitle, { color: colors.textSecondary }]}>
                  Visão geral dos seus investimentos
                </Text>
              </View>
            </View>

            <View style={sharedStyles.modernDivider} />

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  Rendimento Total
                </Text>
                <Text style={[
                  styles.metricValue,
                  { 
                    color: portfolioStats && isPositive(portfolioStats.rendimentoTotal) 
                      ? colors.success 
                      : colors.error 
                  }
                ]}>
                  {portfolioStats ? formatCurrency(portfolioStats.rendimentoTotal) : 'R$ 0,00'}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  % Rendimento
                </Text>
                <Text style={[
                  styles.metricValue,
                  { 
                    color: portfolioStats && isPositive(portfolioStats.rendimentoPercentual) 
                      ? colors.success 
                      : colors.error 
                  }
                ]}>
                  {portfolioStats ? formatPercentage(portfolioStats.rendimentoPercentual) : '0%'}
                </Text>
              </View>
            </View>
          </View>

          {/* Distribution by Type */}
          {distribuicaoTipos && distribuicaoTipos.length > 0 && (
            <View style={[sharedStyles.modernCard, { backgroundColor: colors.surface }]}>
              <View style={sharedStyles.cardHeader}>
                <View style={[sharedStyles.cardIcon, { backgroundColor: colors.secondaryContainer }]}>
                  <Avatar.Icon 
                    size={32} 
                    icon="chart-donut" 
                    style={{ backgroundColor: 'transparent' }}
                    color={colors.secondary}
                  />
                </View>
                <View style={sharedStyles.cardTitleContainer}>
                  <Text style={[sharedStyles.cardTitle, { color: colors.text }]}>
                    Distribuição por Tipo
                  </Text>
                  <Text style={[sharedStyles.cardSubtitle, { color: colors.textSecondary }]}>
                    Diversificação da carteira
                  </Text>
                </View>
              </View>

              <View style={sharedStyles.modernDivider} />

              {distribuicaoTipos.map((item, index) => (
                <View key={index} style={styles.distributionItem}>
                  <View style={styles.distributionHeader}>
                    <Avatar.Icon 
                      size={32} 
                      icon={getTipoIcon(item.tipo)} 
                      style={{ backgroundColor: getTipoColor(item.tipo) + '15' }}
                      color={getTipoColor(item.tipo)}
                    />
                    <View style={styles.distributionInfo}>
                      <Text style={[styles.distributionName, { color: colors.text }]}>
                        {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
                      </Text>
                      <Text style={[styles.distributionValue, { color: colors.textSecondary }]}>
                        {formatCurrency(item.valor)} ({item.percentual.toFixed(1)}%)
                      </Text>
                    </View>
                  </View>
                  <ProgressBar 
                    progress={item.percentual / 100} 
                    color={getTipoColor(item.tipo)}
                    style={styles.progressBar}
                  />
                  {index < distribuicaoTipos.length - 1 && (
                    <Divider style={sharedStyles.modernDivider} />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Top Assets */}
          {topAtivos && topAtivos.length > 0 && (
            <View style={[sharedStyles.modernCard, { backgroundColor: colors.surface }]}>
              <View style={sharedStyles.cardHeader}>
                <View style={[sharedStyles.cardIcon, { backgroundColor: colors.warning + '15' }]}>
                  <Avatar.Icon 
                    size={32} 
                    icon="star" 
                    style={{ backgroundColor: 'transparent' }}
                    color={colors.warning}
                  />
                </View>
                <View style={sharedStyles.cardTitleContainer}>
                  <Text style={[sharedStyles.cardTitle, { color: colors.text }]}>
                    Principais Ativos
                  </Text>
                  <Text style={[sharedStyles.cardSubtitle, { color: colors.textSecondary }]}>
                    Maiores posições da carteira
                  </Text>
                </View>
              </View>

              <View style={sharedStyles.modernDivider} />

              {topAtivos.map((ativo, index) => (
                <View key={ativo.id} style={styles.assetItem}>
                  <View style={styles.assetHeader}>
                    <View style={styles.assetRank}>
                      <Text style={[styles.rankNumber, { color: colors.primary }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.assetInfo}>
                      <Text style={[styles.assetName, { color: colors.text }]}>
                        {ativo.ticker}
                      </Text>
                      <Text style={[styles.assetType, { color: colors.textSecondary }]}>
                        {ativo.nome}
                      </Text>
                    </View>
                    <View style={styles.assetValues}>
                      <Text style={[styles.assetValue, { color: colors.text }]}>
                        {formatCurrency(ativo.valorTotal)}
                      </Text>
                      <Text style={[
                        styles.assetReturn,
                        { 
                          color: isPositive(ativo.valorTotal - (ativo.preco * ativo.quantidade)) 
                            ? colors.success 
                            : colors.error 
                        }
                      ]}>
                        {formatPercentage(((ativo.valorTotal - (ativo.preco * ativo.quantidade)) / (ativo.preco * ativo.quantidade)) * 100)}
                      </Text>
                    </View>
                  </View>
                  {index < topAtivos.length - 1 && (
                    <Divider style={sharedStyles.modernDivider} />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Refresh Button */}
          <View style={styles.actionsContainer}>
            <Button 
              mode="contained" 
              onPress={refreshData}
              style={[styles.refreshButton, { backgroundColor: colors.primary }]}
              contentStyle={styles.buttonContent}
            >
              Atualizar Dados
            </Button>
          </View>

          <View style={sharedStyles.largeSpacer} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // ==================== GRADIENT HEADER ====================
  gradientHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerContent: {
    alignItems: 'center',
  },

  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },

  portfolioTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },

  balanceContainer: {
    alignItems: 'center',
  },

  balanceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 8,
  },

  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  returnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  returnText: {
    fontSize: 16,
    fontWeight: '600',
  },

  returnValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },

  // ==================== QUICK STATS ====================
  quickStatsContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },

  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  quickStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },

  quickStatLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ==================== METRICS GRID ====================
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
  },

  metricItem: {
    flex: 1,
    alignItems: 'center',
  },

  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },

  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },

  // ==================== DISTRIBUTION ====================
  distributionItem: {
    marginBottom: 16,
  },

  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  distributionInfo: {
    flex: 1,
    marginLeft: 12,
  },

  distributionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  distributionValue: {
    fontSize: 14,
  },

  progressBar: {
    height: 8,
    borderRadius: 4,
  },

  // ==================== ASSETS ====================
  assetItem: {
    marginBottom: 16,
  },

  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  assetRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00D4AA15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
  },

  assetInfo: {
    flex: 1,
  },

  assetName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  assetType: {
    fontSize: 12,
  },

  assetValues: {
    alignItems: 'flex-end',
  },

  assetValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  assetReturn: {
    fontSize: 14,
    fontWeight: '500',
  },

  // ==================== ACTIONS ====================
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },

  refreshButton: {
    borderRadius: 12,
  },

  buttonContent: {
    paddingVertical: 8,
  },
});