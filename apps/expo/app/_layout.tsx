import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import { useColorScheme } from 'react-native'
import { TamaguiProvider, Theme } from 'tamagui'
import config from '../../../packages/ui/src/tamagui.config'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync()

export default function Layout() {
  const colorScheme = useColorScheme()
  
  const [fontsLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    InterSemiBold: require('@tamagui/font-inter/otf/Inter-SemiBold.otf'),
    InterMedium: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
  })
  
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])
  
  if (!fontsLoaded) {
    return null
  }
  
  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
      <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </Theme>
    </TamaguiProvider>
  )
} 