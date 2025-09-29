import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  error?: string;
}

const { width } = Dimensions.get('window');

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  error,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (otp.every((digit) => digit !== '')) {
      onComplete?.(otp.join(''));
    }
  }, [otp, onComplete]);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
        newOtp[index - 1] = '';
      } else {
        newOtp[index] = '';
      }
      setOtp(newOtp);
    }
  };

  const handlePaste = () => {
    // Focus first input for paste functionality
    inputRefs.current[0]?.focus();
  };

  const boxSize = Math.min((width - 60) / length - 4, 90);

  return (
    <View className="w-full">
      <TouchableOpacity 
        activeOpacity={1}
        onPress={handlePaste}
        className="flex-row justify-center gap-x-2"
      >
        {otp.map((digit, index) => (
          <View
            key={index}
            style={{ width: boxSize, height: boxSize }}
            className={`items-center justify-center rounded-2xl border-2 bg-gray-50 ${
              activeIndex === index
                ? 'border-gray-400 bg-white'
                : digit
                ? 'border-gray-300 bg-white'
                : 'border-gray-200'
            }`}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(value) => handleChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setActiveIndex(index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              className="h-full w-full font-sf-pro-rounded-semibold text-2xl text-gray-900"
              caretHidden
              selectTextOnFocus
            />
          </View>
        ))}
      </TouchableOpacity>
      {error && (
        <Text className="mt-2 text-center text-sm font-sf-pro-rounded-regular text-red-500">
          {error}
        </Text>
      )}
    </View>
  );
};