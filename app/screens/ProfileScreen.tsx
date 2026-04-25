import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  StatusBar, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../store/AuthContext';

interface NotificationPrefs {
  critical: boolean;
  high: boolean;
  medium: boolean;
  informational: boolean;
}

interface AppSettings {
  offlineCaching: boolean;
  defaultComposite: 'Monthly' | 'Weekly' | 'Yearly';
}

const COMPOSITE_OPTIONS = ['Monthly', 'Weekly', 'Yearly'] as const;

const SEVERITY_CONFIG = [
  {
    key: 'critical' as const,
    label: 'Critical',
    channels: 'Push · Email · SMS',
    dot: '#e24b4a',
  },
  {
    key: 'high' as const,
    label: 'High',
    channels: 'Push · Email',
    dot: '#f46d43',
  },
  {
    key: 'medium' as const,
    label: 'Medium',
    channels: 'Push only',
    dot: '#d4c43a',
  },
  {
    key: 'informational' as const,
    label: 'Informational',
    channels: 'In-app only',
    dot: '#4a9ecf',
  },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    critical: true,
    high: true,
    medium: false,
    informational: false,
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    offlineCaching: true,
    defaultComposite: 'Monthly',
  });

  const [showCompositeOptions, setShowCompositeOptions] = useState(false);

  // Get initials from Firebase display name or email
  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const getName = () => user?.displayName || 'EcoScan User';
  const getEmail = () => user?.email || '';

  const toggleNotif = (key: keyof NotificationPrefs) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#0f1a0f" barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {/* Header */}
        <Text style={styles.screenTitle}>PROFILE</Text>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{getName()}</Text>
            <Text style={styles.userEmail}>{getEmail()}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>User · NIT Delhi</Text>
            </View>
          </View>
        </View>

        {/* Notification preferences */}
        <Text style={styles.sectionTitle}>ALERT NOTIFICATIONS</Text>
        <View style={styles.card}>
          {SEVERITY_CONFIG.map((item, index) => (
            <View
              key={item.key}
              style={[
                styles.row,
                index < SEVERITY_CONFIG.length - 1 && styles.rowBorder,
              ]}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.severityDot, { backgroundColor: item.dot }]} />
                <View>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowSub}>{item.channels}</Text>
                </View>
              </View>
              <Switch
                value={notifPrefs[item.key]}
                onValueChange={() => toggleNotif(item.key)}
                trackColor={{ false: '#1e3a1e', true: '#006837' }}
                thumbColor={notifPrefs[item.key] ? '#d4f0c8' : '#5a8a52'}
              />
            </View>
          ))}
        </View>

        {/* App settings */}
        <Text style={styles.sectionTitle}>APP SETTINGS</Text>
        <View style={styles.card}>
          {/* Offline caching toggle */}
          <View style={[styles.row, styles.rowBorder]}>
            <View>
              <Text style={styles.rowLabel}>Offline caching</Text>
              <Text style={styles.rowSub}>Last 7 days of NDVI data</Text>
            </View>
            <Switch
              value={appSettings.offlineCaching}
              onValueChange={v => setAppSettings(prev => ({ ...prev, offlineCaching: v }))}
              trackColor={{ false: '#1e3a1e', true: '#006837' }}
              thumbColor={appSettings.offlineCaching ? '#d4f0c8' : '#5a8a52'}
            />
          </View>

          {/* Default composite */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowCompositeOptions(v => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>Default composite</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{appSettings.defaultComposite}</Text>
              <Text style={styles.rowChevron}>
                {showCompositeOptions ? '▲' : '›'}
              </Text>
            </View>
          </TouchableOpacity>

          {showCompositeOptions && (
            <View style={styles.compositeOptions}>
              {COMPOSITE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.compositeOption,
                    appSettings.defaultComposite === opt && styles.compositeOptionActive,
                  ]}
                  onPress={() => {
                    setAppSettings(prev => ({ ...prev, defaultComposite: opt }));
                    setShowCompositeOptions(false);
                  }}
                >
                  <Text style={[
                    styles.compositeOptionText,
                    appSettings.defaultComposite === opt && styles.compositeOptionTextActive,
                  ]}>
                    {opt}
                  </Text>
                  {appSettings.defaultComposite === opt && (
                    <Text style={styles.compositeTick}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* App info */}
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.card}>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.rowLabel}>Data source</Text>
            <Text style={styles.rowValue}>Sentinel-2 · GEE</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Institution</Text>
            <Text style={styles.rowValue}>NIT Delhi</Text>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f1a0f' },
  scroll: { flex: 1, backgroundColor: '#0f1a0f' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },

  screenTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7aad6a',
    letterSpacing: 0.8,
    marginBottom: 16,
  },

  // User card
  userCard: {
    backgroundColor: '#1a2e1a',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e3a1e',
    borderWidth: 2,
    borderColor: '#3a6a3a',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#7aad6a',
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#d4f0c8',
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 12,
    color: '#5a8a52',
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: '#0d3a1a',
    borderWidth: 0.5,
    borderColor: '#2d6a2d',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 10,
    color: '#74c476',
  },

  // Section
  sectionTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#7aad6a',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#1a2e1a',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    overflow: 'hidden',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#2d4a2d',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowLabel: {
    fontSize: 13,
    color: '#d4f0c8',
  },
  rowSub: {
    fontSize: 10,
    color: '#5a8a52',
    marginTop: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 12,
    color: '#5a8a52',
  },
  rowChevron: {
    fontSize: 12,
    color: '#3a5a3a',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Composite options
  compositeOptions: {
    borderTopWidth: 0.5,
    borderTopColor: '#2d4a2d',
    backgroundColor: '#152515',
  },
  compositeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1e3a1e',
  },
  compositeOptionActive: {
    backgroundColor: '#1e3a1e',
  },
  compositeOptionText: {
    fontSize: 12,
    color: '#5a8a52',
  },
  compositeOptionTextActive: {
    color: '#7aad6a',
  },
  compositeTick: {
    fontSize: 12,
    color: '#74c476',
  },

  // Sign out
  signOutBtn: {
    backgroundColor: '#2a1010',
    borderWidth: 0.5,
    borderColor: '#5a2020',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#e24b4a',
  },
});