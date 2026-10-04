import { Stack, useNavigation, usePathname } from 'expo-router'
import { useEffect } from 'react'

const TAB_BAR_STYLE = {
  backgroundColor: '#111113',
  borderTopColor: '#1E1E21',
  height: 64,
  paddingBottom: 8,
  paddingTop: 8,
}

export default function MissionsLayout() {
  const navigation = useNavigation()
  const pathname = usePathname()

  useEffect(() => {
    const tabs = navigation.getParent()
    if (!tabs) return

    tabs.setOptions({
      tabBarStyle: pathname === '/tools' ? TAB_BAR_STYLE : { display: 'none' },
    })

    return () => {
      tabs.setOptions({ tabBarStyle: TAB_BAR_STYLE })
    }
  }, [navigation, pathname])

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#080809' } }} />
}
