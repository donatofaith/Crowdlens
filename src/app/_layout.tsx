import '../global.css'

import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router/js-tabs'
import { StatusBar } from 'expo-status-bar'

import { AppProviders } from '@/features/core/data-access/app-providers'

const COLORS = {
  background: '#0C0C0D',
  border: '#1E1E21',
  inactive: '#626266',
  orange: '#FF7A18',
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
          backgroundColor: '#111113',
          borderTopColor: COLORS.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="(wallet)"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? 'home' : 'home-outline'} size={focused ? 23 : 21} />
          ),
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? 'compass' : 'compass-outline'} size={focused ? 23 : 21} />
          ),
          title: 'Missions',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: () => (
            <Ionicons color={COLORS.orange} name="add-circle" size={33} />
          ),
          title: 'Create',
        }}
      />
      <Tabs.Screen
        name="updates"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? 'pulse' : 'pulse-outline'} size={focused ? 23 : 21} />
          ),
          title: 'Activity',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? 'person' : 'person-outline'} size={focused ? 23 : 21} />
          ),
          title: 'Profile',
        }}
      />
    </Tabs>
  )
}
