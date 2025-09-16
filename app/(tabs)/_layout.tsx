import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
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
        tabBarStyle: {
          backgroundColor: colors.tabBackground,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
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
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              size={24} 
              name="chart.pie.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ativos"
        options={{
          title: 'Ativos',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              size={24} 
              name="list.bullet.clipboard.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="proventos"
        options={{
          title: 'Proventos',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              size={24} 
              name="dollarsign.circle.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="movimentacoes"
        options={{
          title: 'Movimentações',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              size={24} 
              name="arrow.left.arrow.right.circle.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rentabilidade"
        options={{
          title: 'Rentabilidade',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              size={24} 
              name="chart.line.uptrend.xyaxis.circle.fill" 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}