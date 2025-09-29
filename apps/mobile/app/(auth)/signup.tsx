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

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to email verification screen
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
              <Text className="font-sf-pro-rounded-bold text-[32px] text-gray-900">
                Enter you email address
              </Text>
              <Text className="mt-2 font-sf-pro-rounded-regular text-[14px] text-gray-600">
                Join thousands of investors building their wealth
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChangeText={(value) => updateField('fullName', value)}
                error={errors.fullName}
                // leftIcon="person-outline"
                autoCapitalize="words"
                textContentType="name"
                className='text-[14px]'
              />

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
                placeholder="Create a strong password"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                error={errors.password}
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? "eye-outline" : "eye-off-outline"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                secureTextEntry={!showPassword}
                textContentType="newPassword"
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                error={errors.confirmPassword}
                leftIcon="lock-closed-outline"
                rightIcon={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                secureTextEntry={!showConfirmPassword}
                textContentType="newPassword"
              />
            </View>

            {/* Terms */}
            <View className="mt-6">
              <Text className="text-center font-sf-pro-rounded-regular text-sm text-gray-500">
                By creating an account, you agree to our{' '}
                <Text className="text-gray-900 underline">Terms of Service</Text>{' '}
                and{' '}
                <Text className="text-gray-900 underline">Privacy Policy</Text>
              </Text>
            </View>

            {/* Sign Up Button */}
            <View className="absolute bottom-0 gap-y-2 right-0 left-0 mx-[24px]">
              <Button
                title="Create Account"
                onPress={handleSignUp}
                loading={isLoading}
                className='rounded-full'
              />
               <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
                <Text className="font-sf-pro-rounded-semibold text-center text-[14px] text-gray-900">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}