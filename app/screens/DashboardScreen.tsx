import React from 'react';
import {
  View, Text, ScrollView,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SectionHeader from '../components/SectionHeader';
import SearchBar from '../components/SearchBar';
import AlertCard from '../components/AlertCard';
import RegionCard, { RegionItem } from '../components/RegionCard';
import NDVIChart from '../components/NDVIChart';

import {
  mockSummary,
  mockNDVITrend,
  mockAlerts,
  mockRegions,
} from '../mock/dashboardData';

export default function DashboardScreen() {
  const handleRegionPress = (region: RegionItem) => {
    console.log('Pressed:', region.name); // hook up navigation later
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
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>GOOD MORNING</Text>
            <Text style={styles.name}>Joyce</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JM</Text>
          </View>
        </View>

        {/* Search */}
        <SearchBar />

        {/* Summary Metrics */}
        <View style={styles.section}>
          <SectionHeader title="OVERVIEW — APRIL 2025" />
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>AVG NDVI</Text>
              <Text style={styles.metricValue}>{mockSummary.avg_ndvi.toFixed(2)}</Text>
              <Text style={styles.metricChange}>+{mockSummary.ndvi_change.toFixed(2)} ↑</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>AREA (KM²)</Text>
              <Text style={styles.metricValue}>
                {(mockSummary.area_km2 / 1_000_000).toFixed(2)}M
              </Text>
              <Text style={[styles.metricChange, { color: '#5a8a52' }]}>monitored</Text>
            </View>
            <View style={[styles.metricCard, { borderColor: '#3a1a1a' }]}>
              <Text style={styles.metricLabel}>ALERTS</Text>
              <Text style={[styles.metricValue, { color: '#f46d43' }]}>
                {mockSummary.active_alerts}
              </Text>
              <Text style={[styles.metricChange, { color: '#c0503a' }]}>
                {mockSummary.critical_alerts} critical
              </Text>
            </View>
          </View>
        </View>

        {/* NDVI Chart */}
        <View style={styles.section}>
          <SectionHeader title="NDVI TREND — INDIA" />
          <NDVIChart
            labels={mockNDVITrend.labels}
            values={mockNDVITrend.values}
          />
        </View>

        {/* Alerts */}
        <View style={styles.section}>
          <SectionHeader title="ACTIVE ALERTS" action="View all" />
          {mockAlerts.map((alert) => (
            <AlertCard key={alert.alert_id} alert={alert} />
          ))}
        </View>

        {/* Top Regions */}
        <View style={styles.section}>
          <SectionHeader title="TOP REGIONS" action="See map" />
          {mockRegions.map((region) => (
            <RegionCard
              key={region.region_id}
              region={region}
              onPress={handleRegionPress}
            />
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f1a0f' },
  scroll: { flex: 1, backgroundColor: '#0f1a0f' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    flex: 1, backgroundColor: '#1a2e1a',
    borderRadius: 10, padding: 12,
    borderWidth: 0.5, borderColor: '#2d4a2d',
  },
  metricLabel: { fontSize: 10, color: '#5a8a52', letterSpacing: 0.5, marginBottom: 4 },
  metricValue: { fontSize: 20, fontWeight: '500', color: '#d4f0c8' },
  metricChange: { fontSize: 10, color: '#4a9e3a', marginTop: 2 },
});