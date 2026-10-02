import '../global.css'

import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router/js-tabs'
import { StatusBar } from 'expo-status-bar'

import { AppProviders } from '@/features/core/data-access/app-providers'

const COLORS = {
  background: '#0B0B0C',
  border: '#1B1B1D',
  inactive: '#5F5F63',
  orange: '#FF6200',
}

export default function Layout() {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <AppTabs />
    </AppProviders>
  )
}

function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: COLORS.background },
        tabBarActiveTintColor: COLORS.orange,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          height: 62,
          paddingBottom: 7,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="(wallet)"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? 'home' : 'home-outline'} size={focused ? size + 1 : size} />
          ),
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? 'compass' : 'compass-outline'} size={focused ? size + 1 : size} />
          ),
          title: 'Missions',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons color={focused ? '#FFFFFF' : COLORS.orange} name={focused ? 'add-circle' : 'add-circle-outline'} size={31} />
          ),
          title: 'Create',
        }}
      />
      <Tabs.Screen
        name="updates"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? 'pulse' : 'pulse-outline'} size={focused ? size + 1 : size} />
          ),
          title: 'Activity',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? 'person' : 'person-outline'} size={focused ? size + 1 : size} />
          ),
          title: 'Profile',
        }}
      />
    </Tabs>
  )
}
