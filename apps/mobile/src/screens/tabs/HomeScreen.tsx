import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home } from 'iconoir-react-native';
import { TYPOGRAPHY_PRESETS } from '../../constants/fonts';
import type { TabScreenProps } from '../../types/navigation';

/**
 * Home Screen Component
 * 
 * This is a placeholder screen for the Home tab.
 * Will be implemented with actual functionality later.
 */
export const HomeScreen: React.FC<TabScreenProps> = ({
  route,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Home
            width={48}
            height={48}
            color="#5852FF"
            strokeWidth={1.5}
          />
          <Text style={styles.title}>Home</Text>
          <Text style={styles.subtitle}>
            Welcome to STACK
          </Text>
        </View>

        {/* Coming Soon Content */}
        <View style={styles.placeholderContent}>
          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>Dashboard Overview</Text>
            <Text style={styles.cardDescription}>
              Your investment portfolio summary, recent transactions, and market insights will appear here.
            </Text>
          </View>

          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <Text style={styles.cardDescription}>
              Fast access to buy, sell, transfer, and other common actions will be available here.
            </Text>
          </View>

          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>Market Highlights</Text>
            <Text style={styles.cardDescription}>
              Trending stocks, market news, and personalized investment recommendations will be displayed here.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra padding for tab bar
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'SF-Pro-Rounded-Bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Rounded-Regular',
    color: '#545454',
    textAlign: 'center',
  },
  placeholderContent: {
    gap: 16,
  },
  placeholderCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAE2FF',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'SF-Pro-Rounded-Semibold',
    color: '#000000',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Rounded-Regular',
    color: '#545454',
    lineHeight: 20,
  },
});

export default HomeScreen;