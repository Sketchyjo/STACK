import { Tabs } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="portfolio" />
      <Tabs.Screen name="card" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}