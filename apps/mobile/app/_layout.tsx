import "../global.css"
import React from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'SF-Pro-Rounded-Thin': require('../assets/fonts/SF-Pro-Rounded-Thin.otf'),
    'SF-Pro-Rounded-Ultralight': require('../assets/fonts/SF-Pro-Rounded-Ultralight.otf'),
    'SF-Pro-Rounded-Light': require('../assets/fonts/SF-Pro-Rounded-Light.otf'),
    'SF-Pro-Rounded-Regular': require('../assets/fonts/SF-Pro-Rounded-Regular.otf'),
    'SF-Pro-Rounded-Medium': require('../assets/fonts/SF-Pro-Rounded-Medium.otf'),
    'SF-Pro-Rounded-Semibold': require('../assets/fonts/SF-Pro-Rounded-Semibold.otf'),
    'SF-Pro-Rounded-Bold': require('../assets/fonts/SF-Pro-Rounded-Bold.otf'),
    'SF-Pro-Rounded-Heavy': require('../assets/fonts/SF-Pro-Rounded-Heavy.otf'),
    'SF-Pro-Rounded-Black': require('../assets/fonts/SF-Pro-Rounded-Black.otf'),
  });

  if (!fontsLoaded) {
    return null; // or a loading screen
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  ) 
}
