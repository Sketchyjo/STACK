import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Portfolio } from 'iconoir-react-native';
import type { TabScreenProps } from '../../types/navigation';

/**
 * Portfolio Screen Component
 * 
 * This is a placeholder screen for the Portfolio tab.
 * Will be implemented with actual functionality later.
 */
export const PortfolioScreen: React.FC<TabScreenProps> = ({
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
          <Portfolio
            width={48}
            height={48}
            color="#5852FF"
            strokeWidth={1.5}
          />
          <Text style={styles.title}>Portfolio</Text>
          <Text style={styles.subtitle}>
            Your Investment Dashboard
          </Text>
        </View>

        {/* Coming Soon Content */}
        <View style={styles.placeholderContent}>
          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>Portfolio Value</Text>
            <Text style={styles.cardDescription}>
              Real-time portfolio value, daily gains/losses, and performance charts will be displayed here.
            </Text>
          </View>

          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>Holdings</Text>
            <Text style={styles.cardDescription}>
              Detailed breakdown of all your stocks, ETFs, and other investments with current values and performance.
            </Text>
          </View>

          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>Performance Analytics</Text>
            <Text style={styles.cardDescription}>
              Advanced charts, risk metrics, diversification analysis, and portfolio optimization suggestions.
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

export default PortfolioScreen;