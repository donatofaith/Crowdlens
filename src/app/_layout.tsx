import '../global.css'

import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router/js-tabs'
import { StatusBar } from 'expo-status-bar'

import { AppProviders } from '@/features/core/data-access/app-providers'

const COLORS = {
  background: '#0A0A0A',
  border: '#202020',
  inactive: '#696969',
  orange: '#FF5A00',
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
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          height: 72,
          paddingBottom: 10,
          paddingTop: 7,
        },
      }}
    >
      <Tabs.Screen
        name="(wallet)"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? 'home' : 'home-outline'} size={size} />
          ),
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? 'compass' : 'compass-outline'} size={size} />
          ),
          title: 'Missions',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={focused ? COLORS.orange : color} name={focused ? 'add-circle' : 'add-circle-outline'} size={30} />
          ),
          title: 'Create',
        }}
      />
      <Tabs.Screen
        name="updates"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? 'pulse' : 'pulse-outline'} size={size} />
          ),
          title: 'Activity',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? 'person' : 'person-outline'} size={size} />
          ),
          title: 'Profile',
        }}
      />
    </Tabs>
  )
}
