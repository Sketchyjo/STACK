import { router } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { cards, onBoard1, onBoard2, onBoard3 } from '../assets/images';

const { width, height } = Dimensions.get('window');

// Define TypeScript interfaces
interface OnboardingSlide {
  key: string;
  title: string;
  description: string;
  image: any;
  backgroundColor: string;
  textColor: string;
  indicatorBg: string;
  indicatorActiveBg: string;
  textSmall?: string;
  imageStyle?: {
    width: number;
    height: number;
  };
}

interface ViewableItemsChanged {
  viewableItems: Array<{
    index: number;
    item: OnboardingSlide;
    key: string;
    isViewable: boolean;
  }>;
}

// --- Onboarding Data ---
// This array holds the content for each slide.
const onboardingSlides: OnboardingSlide[] = [
  {
    key: '1',
    title: 'Level Up Your\nMoney Game',
    description:
      'investment turned into an epic adventure. Complete quests, earn rewards, and watch your money grow while having fun!',
    image: onBoard1,
    backgroundColor: '#1E1A3E',
    textColor: 'text-[#949FFF]',
    indicatorBg: 'bg-white/30',
    indicatorActiveBg: 'bg-white',
    textSmall: 'text-[#D7D6FF]',
    imageStyle: { width: width, height: height * 0.7 },
  },
  {
    key: '2',
    title: 'Investing\nMade Easy AF',
    description:
      'No complicated finance stuff. Just swipe, tap, and invest in what you believe in. Start with just $1!',
    image: onBoard2,
    backgroundColor: '#D4FF00',
    textColor: 'text-black',
    indicatorBg: 'bg-black/30',
    indicatorActiveBg: 'bg-black',
    imageStyle: { width: width, height: height * 0.7 },
  },
  {
    key: '3',
    title: 'Join The\nFinance Revolution',
    description:
      'Be part of a community thats changing the game. Trade, learn, and grow together with other young investors.',
    image: onBoard3,
    backgroundColor: '#EAE8FF',
    textColor: 'text-[#1E1F4B]',
    indicatorBg: 'bg-slate-400/50',
    indicatorActiveBg: 'bg-slate-800',
    imageStyle: { width: width, height: height * 0.7 },
  },
  {
    key: '4',
    title: 'Smart Cards\nSmarter Wealth',
    description:
      'Get virtual and physical cards that automatically round up purchases and invest the difference. Turn everyday spending into wealth building!',
    image: cards,
    backgroundColor: '#EAE8FF',
    textColor: 'text-[#1E1F4B]',
    indicatorBg: 'bg-slate-400/50',
    indicatorActiveBg: 'bg-slate-800',
    imageStyle: { width: width, height: height * 0.6 }, // Different size for cards image
  },
];

const SLIDE_INTERVAL = 6000; // 4 seconds

// --- Main App Component ---
export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);

  // --- Auto-scroll Logic ---
  useEffect(() => {
    const timer = setInterval(() => {
      // Move to the next slide, or loop back to the first
      const nextIndex = (currentIndex + 1) % onboardingSlides.length;
      flatListRef.current?.scrollToIndex({ animated: true, index: nextIndex });
      setCurrentIndex(nextIndex);
    }, SLIDE_INTERVAL);

    // Clear the interval when the component is unmounted or index changes
    return () => clearInterval(timer);
  }, [currentIndex]);

  // --- Handle scroll to update the current index ---
  const onViewableItemsChanged = useRef((info: ViewableItemsChanged) => {
    if (info.viewableItems.length > 0) {
      setCurrentIndex(info.viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  // --- Renders each slide item ---
  const renderItem = ({ item }: { item: OnboardingSlide }) => (
    <View
      className="flex-1 items-center"
      style={{ width: width, backgroundColor: item.backgroundColor }}>
      <View className="w-full flex-1 items-start px-4 pt-32 ">
        <Text className={`font-sf-pro-rounded-black text-[38px] tracking-wides w-full uppercase ${item.textColor}`}>
          {item.title}
        </Text>
        <Text
          className={`mt-4 max-w-xs font-sf-pro-rounded-light text-base font-bold ${item.textSmall ?? ''} opacity-80`}>
          {item.description}
        </Text>
      </View>

      <Image
        source={item.image}
        style={item.imageStyle}
        className="absolute bottom-0"
        resizeMode="cover"
        onError={(e) => console.log('Image failed to load', e.nativeEvent.error)}
      />
    </View>
  );

  // --- Renders the top progress indicators ---
  const renderIndicators = () => {
    const currentSlide = onboardingSlides[currentIndex];
    return (
      <View className="absolute left-6 right-6 top-16 flex-row space-x-2">
        {onboardingSlides.map((_, index) => (
          <View
            key={index}
            className={`h-1 flex-1 rounded-full ${index === currentIndex ? currentSlide.indicatorActiveBg : currentSlide.indicatorBg}`}>
            {index === currentIndex && (
              <View
                className={`h-1 rounded-full ${currentSlide.indicatorActiveBg}`}
                style={{ width: '100%' } as ViewStyle}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        barStyle={
          onboardingSlides[currentIndex].backgroundColor === '#D4FF00'
            ? 'dark-content'
            : 'light-content'
        }
      />
      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        bounces={false}
        scrollEventThrottle={16}
        decelerationRate={0.85}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
          }
        }}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />
      {renderIndicators()}

      {/* --- "Get Started" Button --- */}
      <View className="absolute bottom-10 w-full items-center px-6">
        <TouchableOpacity
          className="w-full rounded-full bg-slate-900 p-4"
          onPress={() => router.push('/(tabs)/home')}
        >
          <Text className="text-center text-lg font-bold text-white">Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}