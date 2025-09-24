import React from 'react';
import { Tabs } from 'expo-router';
import { TabBar } from '../../src/components/navigation/TabBar';
import { TAB_CONFIG } from '../../src/config/tabs';
import type { TabRoute } from '../../src/types/navigation';

/**
 * Tabs Layout Component
 * 
 * This component sets up the tab-based navigation structure using Expo Router
 * with our custom TabBar component and Iconoir icons.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => {
        // Extract current route from navigation state
        const activeRoute = props.state.routes[props.state.index]?.name as TabRoute;
        
        return (
          <TabBar
            activeRoute={activeRoute}
            onTabPress={(route) => {
              const routeIndex = props.state.routes.findIndex(
                (r) => r.name === route
              );
              if (routeIndex >= 0) {
                props.navigation.navigate(props.state.routes[routeIndex].name);
              }
            }}
          />
        );
      }}
    >
      {/* Define each tab screen */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarLabel: 'Portfolio',
        }}
      />
      <Tabs.Screen
        name="card"
        options={{
          title: 'Card',
          tabBarLabel: 'Card',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}
