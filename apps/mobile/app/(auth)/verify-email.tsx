import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OTPInput, Button } from '../../components/ui';

export default function VerifyEmail() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOTPComplete = (code: string) => {
    setOtp(code);
    setError('');
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // For demo purposes, accept any complete 6-digit code
      if (otp === '123456') {
        // Navigate to main app or dashboard
        Alert.alert(
          'Success!',
          'Email verified successfully',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        setError('Invalid verification code. Try 123456 for demo.');
      }
    }, 2000);
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsResendLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setIsResendLoading(false);
      setResendTimer(60);
      setCanResend(false);
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    }, 1500);
  };

  const handlePasteCode = () => {
    // This would typically handle clipboard paste
    // For demo, we'll just focus the first input
    Alert.alert(
      'Paste Code',
      'In a real app, this would paste the code from your clipboard or from SMS.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
      </View> */}

      {/* Main Content */}
      <View className="flex-1 px-6 pb-6">
        {/* Title */}
        <View className="mb-8 mt-8">
          <Text className="font-sf-pro-rounded-bold text-[40px] text-gray-900">
            Confirm email
          </Text>
          <View className="mt-4">
            <Text className="font-sf-pro-rounded-medium text-base text-gray-600">
              The code has been sent to
            </Text>
            <Text className="mt-1 font-sf-pro-rounded-bold text-[28px] text-gray-900">
              {email || 'your email'}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View className="mb-8">
          <Text className="font-sf-pro-rounded-medium text-base text-gray-600">
            Please check your inbox and{'\n'}paste the code from the email below
          </Text>
        </View>

        {/* OTP Input */}
        <View className="mb-8">
          <OTPInput
            length={6}
            onComplete={handleOTPComplete}
            error={error}
          />
        <TouchableOpacity
          onPress={handlePasteCode}
          className="mt-4 items-center justify-center mx-auto rounded-full bg-gray-100 px-4 py-2 w-[30%]"
        >
          <Text className="font-sf-pro-rounded-medium text-base text-gray-600">
            Paste
          </Text>
        </TouchableOpacity>
     
        </View>
    
    
        <View className="flex-1" />

        {/* Verify Button */}
        <View className="mb-6">
          <Button
            title="Verify Email"
            onPress={handleVerify}
            loading={isLoading}
            disabled={otp.length !== 6}
            className='rounded-full'
          />
        </View>

        {/* Resend Code */}
        <View className="items-center">
          {canResend ? (
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={isResendLoading}
              className="py-2"
            >
              <Text className="font-sf-pro-rounded-medium text-base text-gray-900">
                {isResendLoading ? 'Sending...' : "Didn't receive the code? Resend"}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="py-2 font-sf-pro-rounded-semibold text-base text-gray-500">
              Resend code in {resendTimer}s
            </Text>
          )}
        </View>

        {/* Bottom branding - matching the reference image */}
        {/* <View className="mt-8 items-center">
          <Text className="font-sf-pro-rounded-regular text-sm text-gray-400">
            powered by turnkey
          </Text>
        </View> */}
      </View>
    </SafeAreaView>
  );
}