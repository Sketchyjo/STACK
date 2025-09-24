import { Redirect } from 'expo-router';

/**
 * Default redirect to home tab when accessing /tabs
 */
export default function TabsIndex() {
  return <Redirect href="/(tabs)/home" />;
}