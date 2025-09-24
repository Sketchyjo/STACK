import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard } from 'iconoir-react-native';
import type { TabScreenProps } from '../../types/navigation';

/**
 * Card Screen Component (Featured Tab)
 * 
 * This is a placeholder screen for the Card tab.
 * This is a featured tab with special accent styling.
 * Will be implemented with actual functionality later.
 */
export const CardScreen: React.FC<TabScreenProps> = ({
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
        {/* Header with Featured Styling */}
        <View style={styles.header}>
          <View style={styles.featuredIconContainer}>
            <CreditCard
              width={48}
              height={48}
              color="#B9FF4B"
              strokeWidth={2}
            />
          </View>
          <Text style={styles.title}>STACK Card</Text>
          <Text style={styles.subtitle}>
            Smart Investment Card
          </Text>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>FEATURED</Text>
          </View>
        </View>

        {/* Coming Soon Content */}
        <View style={styles.placeholderContent}>
          <View style={[styles.placeholderCard, styles.featuredCard]}>
            <Text style={styles.cardTitle}>Virtual & Physical Cards</Text>
            <Text style={styles.cardDescription}>
              Get virtual cards instantly and order physical cards. Both cards automatically round up purchases and invest the spare change.
            </Text>
          </View>

          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>Spend & Invest</Text>
            <Text style={styles.cardDescription}>
              Every purchase rounds up to the nearest dollar, and the difference is automatically invested in your chosen portfolio.
            </Text>
          </View>

          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>Card Management</Text>
            <Text style={styles.cardDescription}>
              Freeze/unfreeze cards, set spending limits, view transaction history, and manage security settings.
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
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  featuredIconContainer: {
    backgroundColor: 'rgba(185, 255, 75, 0.1)',
    borderRadius: 32,
    padding: 16,
    borderWidth: 2,
    borderColor: '#B9FF4B',
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
    marginBottom: 12,
  },
  featuredBadge: {
    backgroundColor: '#B9FF4B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontFamily: 'SF-Pro-Rounded-Bold',
    color: '#000000',
    letterSpacing: 0.5,
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
  featuredCard: {
    backgroundColor: 'rgba(185, 255, 75, 0.05)',
    borderColor: '#B9FF4B',
    borderWidth: 2,
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

export default CardScreen;