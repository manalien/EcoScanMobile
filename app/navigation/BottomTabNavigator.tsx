import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../types/navigation';

import DashboardScreen from '../screens/DashboardScreen';
import MapScreen from '../screens/MapScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// ── Tab Icons ──────────────────────────────────────────────────────
function DashboardIcon({ focused }: { focused: boolean }) {
  const c = focused ? '#7aad6a' : '#3a5a3a';
  return (
    <View style={styles.iconWrapper}>
      <View style={[styles.gridDot, { backgroundColor: c }]} />
      <View style={[styles.gridDot, { backgroundColor: focused ? c : '#2a4a2a' }]} />
      <View style={[styles.gridDot, { backgroundColor: focused ? c : '#2a4a2a' }]} />
      <View style={[styles.gridDot, { backgroundColor: focused ? c : '#2a4a2a' }]} />
    </View>
  );
}

function MapIcon({ focused }: { focused: boolean }) {
  const c = focused ? '#7aad6a' : '#3a5a3a';
  return (
    <View style={[styles.iconWrapper, { alignItems: 'center', justifyContent: 'center' }]}>
      <View style={[styles.mapCircle, { borderColor: c }]} />
      <View style={[styles.mapCenter, { backgroundColor: c }]} />
    </View>
  );
}

function ReportsIcon({ focused }: { focused: boolean }) {
  const c = focused ? '#7aad6a' : '#3a5a3a';
  return (
    <View style={[styles.iconWrapper, { alignItems: 'center', justifyContent: 'center' }]}>
      <View style={[styles.docOuter, { borderColor: c }]}>
        <View style={[styles.docLine, { backgroundColor: c }]} />
        <View style={[styles.docLine, { backgroundColor: c, width: 10 }]} />
      </View>
    </View>
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  const c = focused ? '#7aad6a' : '#3a5a3a';
  return (
    <View style={[styles.iconWrapper, { alignItems: 'center', justifyContent: 'center' }]}>
      <View style={[styles.profileHead, { borderColor: c }]} />
      <View style={[styles.profileBody, { borderColor: c }]} />
    </View>
  );
}

// ── Navigator ──────────────────────────────────────────────────────
export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#7aad6a',
        tabBarInactiveTintColor: '#3a5a3a',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <DashboardIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ focused }) => <MapIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ focused }) => <ReportsIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0f1a0f',
    borderTopColor: '#1e3a1e',
    borderTopWidth: 0.5,
    height: 64,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  // Shared
  iconWrapper: {
    width: 22,
    height: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Dashboard grid icon
  gridDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },

  // Map icon
  mapCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    position: 'absolute',
  },
  mapCenter: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  // Reports icon
  docOuter: {
    width: 15,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 2,
    padding: 3,
    gap: 3,
  },
  docLine: {
    height: 2,
    width: 14,
    borderRadius: 1,
  },

  // Profile icon
  profileHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    marginBottom: 1,
  },
  profileBody: {
    width: 16,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1.5,
    borderBottomWidth: 0,
  },
});