import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button } from '../../components/ui';

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, check if email is verified
      // For demo, navigate to email verification
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: formData.email },
      });
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Content */}
          <View className="flex-1 px-6 pb-6">
            {/* Title */}
            <View className="mb-8 mt-4">
              <Text className="font-sf-pro-rounded-bold text-[35px] text-gray-900">
                Welcome Back
              </Text>
              <Text className="mt-2 font-sf-pro-rounded-regular text-base text-gray-600">
                Sign in to continue your investment journey
              </Text>
            </View>

            {/* Form */}
            <View className="gap-y-4">
              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                error={errors.email}
                leftIcon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                error={errors.password}
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? "eye-outline" : "eye-off-outline"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                secureTextEntry={!showPassword}
                textContentType="password"
              />
            </View>

            {/* Forgot Password */}
            <View className="mt-4">
              <TouchableOpacity className="self-end">
                <Text className="font-sf-pro-rounded-bold text-[14px] text-gray-600">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
             <View className="absolute bottom-0 right-0 left-0 mx-[24px]">
              <Button
                title="Sign in"
                onPress={handleSignIn}
                loading={isLoading}
                className='rounded-full'
              />

                <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text className="font-sf-pro-rounded-semibold text-center text-[14px] text-gray-900">
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
           
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}