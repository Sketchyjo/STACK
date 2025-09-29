import React, { useEffect, useState } from 'react';
import { View, Image, Animated, useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

interface CustomSplashScreenProps {
  onFinish: () => void;
  isAppReady: boolean;
}

export const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ 
  onFinish, 
  isAppReady 
}) => {
  const colorScheme = useColorScheme();
  const [fadeAnim] = useState(new Animated.Value(1));

  const splashIcon = colorScheme === 'dark' 
    ? require('../assets/app-icon/splash-icon-dark.png')
    : require('../assets/app-icon/splash-icon-light.png');

  const backgroundColor = colorScheme === 'dark' ? '#000000' : '#ffffff';

  useEffect(() => {
    if (isAppReady) {
      // Start fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }
  }, [isAppReady, fadeAnim, onFinish]);

  return (
    <Animated.View 
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#000",
        opacity: fadeAnim,
      }}
    >
      <Image
        source={splashIcon}
        style={{
          width: 120,
          height: 120,
        }}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

export default CustomSplashScreen;