import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User } from 'iconoir-react-native';
import type { TabScreenProps } from '../../types/navigation';

/**
 * Profile Screen Component
 * 
 * This is a placeholder screen for the Profile tab.
 * Will be implemented with actual functionality later.
 */
export const ProfileScreen: React.FC<TabScreenProps> = ({
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
          <User
            width={48}
            height={48}
            color="#5852FF"
            strokeWidth={1.5}
          />
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            Account & Settings
          </Text>
        </View>

        {/* Coming Soon Content */}
        <View style={styles.placeholderContent}>
          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>Account Information</Text>
            <Text style={styles.cardDescription}>
              View and edit your personal information, contact details, and verification status.
            </Text>
          </View>

          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>Investment Preferences</Text>
            <Text style={styles.cardDescription}>
              Set your risk tolerance, investment goals, preferred asset classes, and auto-invest settings.
            </Text>
          </View>

          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>Security & Privacy</Text>
            <Text style={styles.cardDescription}>
              Manage two-factor authentication, biometric login, privacy settings, and account security features.
            </Text>
          </View>

          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>Support & Help</Text>
            <Text style={styles.cardDescription}>
              Access help center, contact support, provide feedback, and view legal documents and terms of service.
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

export default ProfileScreen;