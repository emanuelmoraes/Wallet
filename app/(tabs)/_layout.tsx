import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: true,
        tabBarIcon: () => null, // Remove todos os ícones globalmente
        tabBarStyle: {
          backgroundColor: colors.tabBackground,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 65 : 55, // Altura menor sem ícones
          paddingBottom: Platform.OS === 'ios' ? 15 : 5,
          paddingTop: 5,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: colors.shadowOpacity,
          shadowRadius: 8,
          elevation: 8,
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 0,
          marginBottom: 0,
          textAlign: 'center',
        },
        tabBarIconStyle: {
          display: 'none', // Esconde completamente o espaço dos ícones
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Portfolio',
        }}
      />
      <Tabs.Screen
        name="ativos"
        options={{
          title: 'Ativos',
        }}
      />
      <Tabs.Screen
        name="proventos"
        options={{
          title: 'Proventos',
        }}
      />
      <Tabs.Screen
        name="movimentacoes"
        options={{
          title: 'Movimentações',
        }}
      />
      <Tabs.Screen
        name="rentabilidade"
        options={{
          title: 'Rentabilidade',
        }}
      />
      <Tabs.Screen
        name="ferramentas"
        options={{
          title: 'Ferramentas',
        }}
      />
    </Tabs>
  );
}