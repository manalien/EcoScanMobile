import React, { useState, useEffect } from 'react';
import { Platform, ActivityIndicator } from 'react-native';
import {
  View, Text, ScrollView, StyleSheet,
  StatusBar, Modal, TouchableOpacity,
  TextInput, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../types/navigation';

import SectionHeader from '../components/SectionHeader';
import AlertCard from '../components/AlertCard';
import RegionCard, { RegionItem } from '../components/RegionCard';
import NDVIChart from '../components/NDVIChart';
import SearchBar from '../components/SearchBar';
import RegionDetailSheet from '../components/RegionDetailSheet';

import { fetchAlerts, fetchRegions } from '../services/api';
import { USE_MOCK_DATA } from '../constants/config';
import { useAuth } from '../store/AuthContext';

import {
  mockSummary as _mockSummary,
  mockNDVITrend as _mockNDVITrend,
  mockAlerts as _mockAlerts,
  mockRegions as _mockRegions,
} from '../mock/dashboardData';

type DashboardNavProp = BottomTabNavigationProp<BottomTabParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavProp>();
  const { user } = useAuth();

  const [selectedRegion, setSelectedRegion] = useState<RegionItem | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Derive name + initials from Firebase user ──────────────────
  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const getFirstName = () => {
    if (user?.displayName) return user.displayName.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'there';
  };

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setAlerts(_mockAlerts);
      setRegions(_mockRegions);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [alertsData, regionsData] = await Promise.all([
          fetchAlerts(),
          fetchRegions(),
        ]);

        const mappedAlerts = alertsData.map((a: any) => ({
          alert_id: a.alert_id,
          region: a.region_name,
          severity: a.severity,
          description: a.message,
          ndvi_change: a.ndvi_change,
          area_affected: Math.abs(Math.round(a.percent_change)),
          created_at: new Date(a.created_at).toLocaleString(),
        }));

        const mappedRegions = regionsData.map((r: any) => ({
          region_id: r.region_id,
          name: r.name,
          level: r.level,
          zone: r.zone ?? '—',
          ndvi_mean: r.ndvi_mean ?? 0,
          ndvi_change: r.ndvi_change ?? 0,
        }));

        setAlerts(mappedAlerts);
        setRegions(mappedRegions);
      } catch (e) {
        console.error('Dashboard fetch error:', e);
        setAlerts(_mockAlerts);
        setRegions(_mockRegions);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const summary = USE_MOCK_DATA ? _mockSummary : {
    avg_ndvi: regions.length
      ? regions.reduce((s, r) => s + (r.ndvi_mean ?? 0), 0) / regions.length
      : 0,
    ndvi_change: 0,
    area_km2: 3287263,
    active_alerts: alerts.length,
    critical_alerts: alerts.filter((a: any) => a.severity === 'Critical').length,
  };

  const ndviTrend = _mockNDVITrend;

  const searchResults = regions.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>GOOD MORNING</Text>
            <Text style={styles.name}>{getFirstName()}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
        </View>

        <SearchBar onPress={() => setSearchVisible(true)} />

        {loading ? (
          <ActivityIndicator color="#7aad6a" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Summary Metrics */}
            <View style={styles.section}>
              <SectionHeader title="OVERVIEW" />
              <View style={styles.metricsRow}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>AVG NDVI</Text>
                  <Text style={styles.metricValue}>{summary.avg_ndvi.toFixed(2)}</Text>
                  <Text style={styles.metricChange}>
                    {summary.ndvi_change >= 0 ? '+' : ''}{summary.ndvi_change.toFixed(2)} ↑
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>AREA (KM²)</Text>
                  <Text style={styles.metricValue}>
                    {(summary.area_km2 / 1_000_000).toFixed(2)}M
                  </Text>
                  <Text style={[styles.metricChange, { color: '#5a8a52' }]}>monitored</Text>
                </View>
                <View style={[styles.metricCard, { borderColor: '#3a1a1a' }]}>
                  <Text style={styles.metricLabel}>ALERTS</Text>
                  <Text style={[styles.metricValue, { color: '#f46d43' }]}>
                    {summary.active_alerts}
                  </Text>
                  <Text style={[styles.metricChange, { color: '#c0503a' }]}>
                    {summary.critical_alerts} critical
                  </Text>
                </View>
              </View>
            </View>

            {/* NDVI Chart */}
            <View style={styles.section}>
              <SectionHeader title="NDVI TREND — INDIA" />
              <NDVIChart labels={ndviTrend.labels} values={ndviTrend.values} />
            </View>

            {/* Alerts */}
            <View style={styles.section}>
              <SectionHeader
                title="ACTIVE ALERTS"
                action="View all"
                onAction={() => navigation.navigate('Map')}
              />
              {alerts.map((alert: any) => (
                <AlertCard key={alert.alert_id} alert={alert} />
              ))}
            </View>

            {/* Top Regions */}
            <View style={styles.section}>
              <SectionHeader
                title="TOP REGIONS"
                action="See map"
                onAction={() => navigation.navigate('Map')}
              />
              {regions.map(region => (
                <RegionCard
                  key={region.region_id}
                  region={region}
                  onPress={setSelectedRegion}
                />
              ))}
            </View>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {selectedRegion && (
        <RegionDetailSheet
          region={selectedRegion}
          onClose={() => setSelectedRegion(null)}
        />
      )}

      <Modal
        visible={searchVisible}
        animationType="slide"
        transparent
        onRequestClose={() => { setSearchVisible(false); setSearchQuery(''); }}
      >
        <View style={styles.searchOverlay}>
          <SafeAreaView style={styles.searchContainer} edges={['top']}>
            <View style={styles.searchHeader}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search regions, districts..."
                placeholderTextColor="#5a8a52"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => { setSearchVisible(false); setSearchQuery(''); }}
                style={styles.searchCancelBtn}
              >
                <Text style={styles.searchCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {searchQuery.length === 0 ? (
              <View style={styles.searchEmpty}>
                <Text style={styles.searchEmptyText}>Type to search regions</Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.searchEmpty}>
                <Text style={styles.searchEmptyText}>No results for "{searchQuery}"</Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={item => item.region_id}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8 }}
                renderItem={({ item }) => (
                  <RegionCard
                    region={item}
                    onPress={r => {
                      setSearchVisible(false);
                      setSearchQuery('');
                      setSelectedRegion(r);
                    }}
                  />
                )}
              />
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f1a0f' },
  scroll: { flex: 1, backgroundColor: '#0f1a0f' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  greeting: { fontSize: 12, color: '#5a8a52', letterSpacing: 0.8, marginBottom: 2 },
  name: { fontSize: 24, fontWeight: '500', color: '#d4f0c8' },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1e3a1e', borderWidth: 1.5,
    borderColor: '#3a6a3a', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '500', color: '#7aad6a' },
  section: { marginBottom: 20 },
  metricsRow: { flexDirection: 'row', gap: 8 },
  metricCard: {
    flex: 1, backgroundColor: '#1a2e1a', borderRadius: 10,
    padding: 12, borderWidth: 0.5, borderColor: '#2d4a2d',
  },
  metricLabel: { fontSize: 10, color: '#5a8a52', letterSpacing: 0.5, marginBottom: 4 },
  metricValue: { fontSize: 20, fontWeight: '500', color: '#d4f0c8' },
  metricChange: { fontSize: 10, color: '#4a9e3a', marginTop: 2 },
  searchOverlay: { flex: 1, backgroundColor: '#0f1a0f' },
  searchContainer: { flex: 1 },
  searchHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12, gap: 10,
    borderBottomWidth: 0.5, borderBottomColor: '#1e3a1e',
  },
  searchInput: {
    flex: 1, backgroundColor: '#1a2e1a', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: '#d4f0c8',
    borderWidth: 0.5, borderColor: '#2d4a2d',
  },
  searchCancelBtn: { paddingVertical: 8 },
  searchCancelText: { fontSize: 13, color: '#7aad6a' },
  searchEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchEmptyText: { fontSize: 13, color: '#5a8a52' },
});