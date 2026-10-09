import '../global.css'

import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { AppProviders } from '@/features/core/data-access/app-providers'

export default function WebLayout() {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FF7A18',
          tabBarInactiveTintColor: '#626266',
          tabBarStyle: { backgroundColor: '#111113', borderTopColor: '#1E1E21' },
        }}
      >
        <Tabs.Screen name="(wallet)" options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons name="home-outline" color={color} size={22} /> }} />
        <Tabs.Screen name="tools" options={{ title: 'Missions', tabBarIcon: ({ color }) => <Ionicons name="compass-outline" color={color} size={22} /> }} />
        <Tabs.Screen name="create" options={{ title: 'Create', tabBarIcon: ({ color }) => <Ionicons name="add-circle-outline" color={color} size={22} /> }} />
        <Tabs.Screen name="updates" options={{ title: 'Activity', tabBarIcon: ({ color }) => <Ionicons name="pulse-outline" color={color} size={22} /> }} />
        <Tabs.Screen name="settings" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Ionicons name="person-outline" color={color} size={22} /> }} />
      </Tabs>
    </AppProviders>
  )
}
