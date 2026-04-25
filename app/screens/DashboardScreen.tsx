import React, { useState } from 'react';
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

import {
  mockSummary,
  mockNDVITrend,
  mockAlerts,
  mockRegions,
} from '../mock/dashboardData';

type DashboardNavProp = BottomTabNavigationProp<BottomTabParamList, 'Dashboard'>;

// All searchable regions
const ALL_REGIONS = [
  { region_id: '1', name: 'Kerala', level: 'State', zone: 'Southern', ndvi_mean: 0.74, ndvi_change: 0.06 },
  { region_id: '2', name: 'Assam', level: 'State', zone: 'Eastern', ndvi_mean: 0.69, ndvi_change: 0.03 },
  { region_id: '3', name: 'Rajasthan', level: 'State', zone: 'Western', ndvi_mean: 0.28, ndvi_change: -0.09 },
  { region_id: '4', name: 'Madhya Pradesh', level: 'State', zone: 'Central', ndvi_mean: 0.42, ndvi_change: -0.14 },
  { region_id: '5', name: 'Karnataka', level: 'State', zone: 'Southern', ndvi_mean: 0.62, ndvi_change: 0.08 },
  { region_id: '6', name: 'West Bengal', level: 'State', zone: 'Eastern', ndvi_mean: 0.65, ndvi_change: 0.04 },
  { region_id: '7', name: 'Maharashtra', level: 'State', zone: 'Western', ndvi_mean: 0.48, ndvi_change: -0.02 },
  { region_id: '8', name: 'Uttarakhand', level: 'State', zone: 'Northern', ndvi_mean: 0.71, ndvi_change: 0.09 },
  { region_id: '9', name: 'Jaisalmer', level: 'District', zone: 'Western', ndvi_mean: 0.18, ndvi_change: -0.31 },
  { region_id: '10', name: 'Shivpuri', level: 'District', zone: 'Central', ndvi_mean: 0.38, ndvi_change: -0.14 },
];

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavProp>();
  const [selectedRegion, setSelectedRegion] = useState<RegionItem | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = ALL_REGIONS.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegionPress = (region: RegionItem) => {
    setSelectedRegion(region);
  };

  const handleSearchRegionPress = (region: RegionItem) => {
    setSearchVisible(false);
    setSearchQuery('');
    setSelectedRegion(region);
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
        <SearchBar onPress={() => setSearchVisible(true)} />

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
          <SectionHeader
            title="ACTIVE ALERTS"
            action="View all"
            onAction={() => navigation.navigate('Map')}
          />
          {mockAlerts.map(alert => (
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
          {mockRegions.map(region => (
            <RegionCard
              key={region.region_id}
              region={region}
              onPress={handleRegionPress}
            />
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Region detail bottom sheet */}
      {selectedRegion && (
        <RegionDetailSheet
          region={selectedRegion}
          onClose={() => setSelectedRegion(null)}
        />
      )}

      {/* Search modal */}
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
                <Text style={styles.searchEmptyText}>Type to search regions or districts</Text>
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
                    onPress={handleSearchRegionPress}
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

  // Search modal
  searchOverlay: {
    flex: 1,
    backgroundColor: '#0f1a0f',
  },
  searchContainer: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1e3a1e',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a2e1a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#d4f0c8',
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
  },
  searchCancelBtn: { paddingVertical: 8 },
  searchCancelText: { fontSize: 13, color: '#7aad6a' },
  searchEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchEmptyText: { fontSize: 13, color: '#5a8a52' },
});