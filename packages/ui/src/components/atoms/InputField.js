import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
export const InputField = ({ label, error, required = false, type = 'text', icon, value, onChangeText, placeholder, ...props }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const getKeyboardType = () => {
        switch (type) {
            case 'email':
                return 'email-address';
            case 'phone':
                return 'phone-pad';
            default:
                return 'default';
        }
    };
    const getAutoCapitalize = () => {
        if (type === 'email')
            return 'none';
        return 'sentences';
    };
    const isPassword = type === 'password';
    const hasError = !!error;
    return (_jsxs(View, { className: "mb-4", children: [_jsxs(Text, { className: "font-label text-label text-text-secondary mb-2", children: [label, required && _jsx(Text, { className: "text-semantic-danger", children: " *" })] }), _jsxs(View, { className: `
          flex-row items-center
          bg-white
          border rounded-xl
          px-4 py-4
          ${isFocused ? 'border-primary' : hasError ? 'border-semantic-danger' : 'border-text-tertiary'}
          ${hasError ? 'bg-red-50' : ''}
        `, children: [icon && (_jsx(Ionicons, { name: icon, size: 20, color: hasError ? '#DC3545' : isFocused ? '#5852FF' : '#A0A0A0', style: { marginRight: 12 } })), _jsx(TextInput, { value: value, onChangeText: onChangeText, placeholder: placeholder, placeholderTextColor: "#A0A0A0", keyboardType: getKeyboardType(), autoCapitalize: getAutoCapitalize(), autoCorrect: false, secureTextEntry: isPassword && !isPasswordVisible, onFocus: () => setIsFocused(true), onBlur: () => setIsFocused(false), className: "flex-1 font-body text-body text-text-primary", ...props }), isPassword && (_jsx(TouchableOpacity, { onPress: () => setIsPasswordVisible(!isPasswordVisible), className: "ml-2", children: _jsx(Ionicons, { name: isPasswordVisible ? 'eye-off' : 'eye', size: 20, color: hasError ? '#DC3545' : '#A0A0A0' }) }))] }), hasError && (_jsx(Text, { className: "font-caption text-caption text-semantic-danger mt-1", children: error }))] }));
};
