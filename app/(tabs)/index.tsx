import { useAtivos } from '@/hooks/useAtivos';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  List,
  ProgressBar,
  Surface,
  Text,
  Title,
  useTheme
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function PortfolioScreen() {
  const theme = useTheme();
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
            <Text style={styles.loadingText}>Carregando portfólio...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <Surface style={styles.header} elevation={2}>
          <Title style={styles.title}>Meu Portfolio</Title>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Visão geral dos seus investimentos
          </Text>
        </Surface>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Card Resumo Principal */}
          <Card style={styles.summaryCard} mode="elevated">
            <Card.Content>
              <View style={styles.summaryHeader}>
                <Avatar.Icon 
                  size={48} 
                  icon="wallet" 
                  style={{ backgroundColor: theme.colors.primaryContainer }}
                />
                <View style={styles.summaryInfo}>
                  <Text variant="labelLarge" style={styles.summaryLabel}>
                    Valor Total da Carteira
                  </Text>
                  <Title style={[styles.summaryValue, { color: theme.colors.primary }]}>
                    {portfolioStats ? formatCurrency(portfolioStats.valorTotal) : 'R$ 0,00'}
                  </Title>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.summaryMetrics}>
                <View style={styles.metricItem}>
                  <Avatar.Icon 
                    size={32} 
                    icon={portfolioStats && isPositive(portfolioStats.rendimentoTotal) ? "trending-up" : "trending-down"}
                    style={{ 
                      backgroundColor: portfolioStats && isPositive(portfolioStats.rendimentoTotal) 
                        ? theme.colors.secondary + '20' 
                        : theme.colors.error + '20' 
                    }}
                  />
                  <View style={styles.metricDetails}>
                    <Text variant="labelMedium" style={styles.metricLabel}>
                      Rendimento Total
                    </Text>
                    <Text 
                      variant="titleMedium" 
                      style={[
                        styles.metricValue,
                        { 
                          color: portfolioStats && isPositive(portfolioStats.rendimentoTotal) 
                            ? theme.colors.secondary 
                            : theme.colors.error 
                        }
                      ]}
                    >
                      {portfolioStats ? `${formatCurrency(portfolioStats.rendimentoTotal)} (${portfolioStats.rendimentoPercentual >= 0 ? '+' : ''}${portfolioStats.rendimentoPercentual.toFixed(2)}%)` : 'R$ 0,00 (0%)'}
                    </Text>
                  </View>
                </View>

                <View style={styles.metricItem}>
                  <Avatar.Icon 
                    size={32} 
                    icon="clipboard-list"
                    style={{ backgroundColor: theme.colors.tertiaryContainer }}
                  />
                  <View style={styles.metricDetails}>
                    <Text variant="labelMedium" style={styles.metricLabel}>
                      Total de Ativos
                    </Text>
                    <Text variant="titleMedium" style={styles.metricValue}>
                      {ativos.length} {ativos.length === 1 ? 'ativo' : 'ativos'}
                    </Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Distribuição por Tipo */}
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <View style={styles.cardHeader}>
                <Avatar.Icon 
                  size={32} 
                  icon="chart-pie" 
                  style={{ backgroundColor: theme.colors.primaryContainer }}
                />
                <Title style={styles.cardTitle}>Distribuição por Tipo</Title>
              </View>
              
              {distribuicaoTipos.map((item, index) => (
                <View key={item.tipo} style={styles.distributionItem}>
                  <List.Item
                    title={item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
                    description={`${formatCurrency(item.valor)} • ${item.percentual.toFixed(1)}%`}
                    left={() => (
                      <Avatar.Icon 
                        size={40} 
                        icon={getTipoIcon(item.tipo)}
                        style={{ backgroundColor: getTipoColor(item.tipo) + '20' }}
                      />
                    )}
                    right={() => (
                      <Chip 
                        mode="outlined" 
                        compact
                        style={{ backgroundColor: getTipoColor(item.tipo) + '10' }}
                        textStyle={{ color: getTipoColor(item.tipo), fontSize: 12 }}
                      >
                        {item.percentual.toFixed(1)}%
                      </Chip>
                    )}
                  />
                  <ProgressBar 
                    progress={item.percentual / 100} 
                    color={getTipoColor(item.tipo)}
                    style={styles.progressBar}
                  />
                  {index < distribuicaoTipos.length - 1 && <Divider style={styles.itemDivider} />}
                </View>
              ))}

              {distribuicaoTipos.length === 0 && (
                <View style={styles.emptyState}>
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    Nenhum ativo cadastrado
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Top Ativos */}
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <View style={styles.cardHeader}>
                <Avatar.Icon 
                  size={32} 
                  icon="star" 
                  style={{ backgroundColor: theme.colors.tertiaryContainer }}
                />
                <Title style={styles.cardTitle}>Principais Ativos</Title>
              </View>
              
              {topAtivos.map((ativo, index) => (
                <View key={ativo.id}>
                  <List.Item
                    title={ativo.ticker}
                    description={ativo.nome}
                    left={() => (
                      <View style={styles.rankContainer}>
                        <Avatar.Text 
                          size={32} 
                          label={`${index + 1}`}
                          style={{ backgroundColor: theme.colors.surfaceVariant }}
                        />
                      </View>
                    )}
                    right={() => (
                      <View style={styles.ativoValues}>
                        <Text variant="titleSmall" style={styles.ativoValor}>
                          {formatCurrency(ativo.valorTotal)}
                        </Text>
                        <Chip 
                          icon={getTipoIcon(ativo.tipo)}
                          mode="outlined" 
                          compact
                          style={{ 
                            backgroundColor: getTipoColor(ativo.tipo) + '10'
                          }}
                          textStyle={{ 
                            color: getTipoColor(ativo.tipo),
                            fontSize: 10 
                          }}
                        >
                          {ativo.tipo.toUpperCase()}
                        </Chip>
                      </View>
                    )}
                  />
                  {index < topAtivos.length - 1 && <Divider style={styles.itemDivider} />}
                </View>
              ))}

              {topAtivos.length === 0 && (
                <View style={styles.emptyState}>
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    Nenhum ativo para exibir
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Cards de Ações Rápidas */}
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Title style={styles.cardTitle}>Ações Rápidas</Title>
              <View style={styles.actionsContainer}>
                <Button 
                  mode="contained" 
                  icon="sync"
                  style={styles.actionButton}
                  onPress={refreshData}
                  loading={loading}
                  disabled={loading}
                >
                  Atualizar
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryInfo: {
    marginLeft: 16,
    flex: 1,
  },
  summaryLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  summaryMetrics: {
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricDetails: {
    marginLeft: 12,
    flex: 1,
  },
  metricLabel: {
    opacity: 0.7,
    marginBottom: 2,
  },
  metricValue: {
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 12,
    fontSize: 18,
  },
  distributionItem: {
    marginBottom: 8,
  },
  progressBar: {
    marginHorizontal: 16,
    marginTop: 4,
    height: 4,
  },
  itemDivider: {
    marginTop: 12,
  },
  rankContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ativoValues: {
    alignItems: 'flex-end',
    gap: 4,
  },
  ativoValor: {
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.7,
    textAlign: 'center',
  },
});
