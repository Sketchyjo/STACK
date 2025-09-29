import "../global.css"
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react'
import { TouchableOpacity, Text } from "react-native";
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from '../components/SplashScreen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.hideAsync();

const App = () => {
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
    // Outward fonts
    'Outward-Block': require('../assets/fonts/outward-block.ttf'),
    'Outward-Borders': require('../assets/fonts/outward-borders.ttf'),
    'Outward-Round': require('../assets/fonts/outward-round.ttf'),
  });
  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='(auth)' />
      <Stack.Screen name='(tabs)' />
    </Stack>
  )
}

export default function _layout() {
  return (
    <>
      <App />
      <TouchableOpacity onPress={() => router.replace('/(auth)/verify-email')} className="absolute items-center justify-center bottom-6 left-6 bg-gray-100 h-[50] w-[50] rounded-full">
        <Text className="font-sf-pro-rounded-regular text-base text-gray-600">
          reset
        </Text>
      </TouchableOpacity>
    </>
  )
}