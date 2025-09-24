import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { FONT_CLASSES, TYPOGRAPHY_PRESETS } from '../constants/fonts';

/**
 * Font Showcase Component
 * 
 * This component displays all available SF Pro Rounded font weights
 * and semantic typography presets for testing and demonstration.
 */
export const FontShowcase: React.FC = () => {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-12">
        {/* Main Title */}
        <Text className={`${TYPOGRAPHY_PRESETS.H1} text-center mb-4 text-slate-900`}>
          SF Pro Rounded
        </Text>
        
        <Text className={`${TYPOGRAPHY_PRESETS.H2} text-center mb-8 text-slate-600`}>
          Font Integration Demo
        </Text>
        
        {/* Font Weights Section */}
        <View className="mb-8">
          <Text className={`${TYPOGRAPHY_PRESETS.H3} mb-4 text-slate-900`}>
            Font Weights:
          </Text>
          
          <Text className={`${FONT_CLASSES.SF_PRO_ROUNDED_THIN} text-body mb-2 text-slate-700`}>
            Thin - The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className={`${FONT_CLASSES.SF_PRO_ROUNDED_ULTRALIGHT} text-body mb-2 text-slate-700`}>
            Ultralight - The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className={`${FONT_CLASSES.SF_PRO_ROUNDED_LIGHT} text-body mb-2 text-slate-700`}>
            Light - The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className={`${FONT_CLASSES.SF_PRO_ROUNDED} text-body mb-2 text-slate-700`}>
            Regular - The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className={`${FONT_CLASSES.SF_PRO_ROUNDED_MEDIUM} text-body mb-2 text-slate-700`}>
            Medium - The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className={`${FONT_CLASSES.SF_PRO_ROUNDED_SEMIBOLD} text-body mb-2 text-slate-700`}>
            Semibold - The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className={`${FONT_CLASSES.SF_PRO_ROUNDED_BOLD} text-body mb-2 text-slate-700`}>
            Bold - The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className={`${FONT_CLASSES.SF_PRO_ROUNDED_HEAVY} text-body mb-2 text-slate-700`}>
            Heavy - The quick brown fox jumps over the lazy dog
          </Text>
          
          <Text className={`${FONT_CLASSES.SF_PRO_ROUNDED_BLACK} text-body mb-2 text-slate-700`}>
            Black - The quick brown fox jumps over the lazy dog
          </Text>
        </View>
        
        {/* Semantic Typography Section */}
        <View className="mb-8">
          <Text className={`${TYPOGRAPHY_PRESETS.H3} mb-4 text-slate-900`}>
            Semantic Typography:
          </Text>
          
          <Text className={`${TYPOGRAPHY_PRESETS.H1} mb-2 text-slate-900`}>
            Heading 1 - Display Text
          </Text>
          
          <Text className={`${TYPOGRAPHY_PRESETS.H2} mb-2 text-slate-800`}>
            Heading 2 - Section Header
          </Text>
          
          <Text className={`${TYPOGRAPHY_PRESETS.H3} mb-2 text-slate-800`}>
            Heading 3 - Subsection Header
          </Text>
          
          <Text className={`${TYPOGRAPHY_PRESETS.BODY} mb-2 text-slate-700`}>
            Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </Text>
          
          <Text className={`${TYPOGRAPHY_PRESETS.LABEL} mb-2 text-slate-600`}>
            Label text - Form labels and UI text elements
          </Text>
          
          <Text className={`${TYPOGRAPHY_PRESETS.CAPTION} text-slate-500`}>
            Caption text - Small descriptive text and metadata
          </Text>
        </View>

        {/* Usage Examples */}
        <View>
          <Text className={`${TYPOGRAPHY_PRESETS.H3} mb-4 text-slate-900`}>
            Usage Examples:
          </Text>
          
          <View className="bg-slate-50 p-4 rounded-lg mb-4">
            <Text className={`${FONT_CLASSES.HEADING} text-lg mb-2 text-slate-900`}>
              Investment Portfolio
            </Text>
            <Text className={`${FONT_CLASSES.BODY} mb-1 text-slate-700`}>
              Total Balance: $12,345.67
            </Text>
            <Text className={`${FONT_CLASSES.CAPTION} text-slate-500`}>
              +5.2% from last month
            </Text>
          </View>
          
          <View className="bg-slate-50 p-4 rounded-lg">
            <Text className={`${FONT_CLASSES.DISPLAY} text-2xl mb-2 text-slate-900`}>
              Welcome Back!
            </Text>
            <Text className={`${FONT_CLASSES.BODY} text-slate-700`}>
              Your investments are performing well this quarter.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};