import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  StatusBar, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SectionHeader from '../components/SectionHeader';
import ReportCard from '../components/ReportCard';
import { REGIONS, REPORT_TYPES, PERIODS } from '../mock/reportsData';
import { fetchReports, createReport } from '../services/api';
import { USE_MOCK_DATA } from '../constants/config';
import { mockReports } from '../mock/reportsData';
import { Platform } from 'react-native';

type FilterType = 'period' | 'region' | 'type' | null;

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('All periods');
  const [selectedRegion, setSelectedRegion] = useState('All regions');
  const [selectedType, setSelectedType] = useState('All types');
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (USE_MOCK_DATA) {
        setReports(mockReports);
        setLoading(false);
        return;
      }
      try {
        const data = await fetchReports();
        setReports(data);
      } catch (e) {
        console.error('Reports fetch error:', e);
        setReports(mockReports);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return reports.filter(r => {
      const periodMatch = selectedPeriod === 'All periods' || r.period === selectedPeriod;
      const regionMatch = selectedRegion === 'All regions' || r.region === selectedRegion;
      const typeMatch = selectedType === 'All types' || r.type === selectedType;
      return periodMatch && regionMatch && typeMatch;
    });
  }, [selectedPeriod, selectedRegion, selectedType, reports]);

  const handleGenerate = () => {
    Alert.alert(
      'Generate Report',
      'This will request a new report from the backend.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            try {
              await createReport({ type: selectedType, region: selectedRegion, period: selectedPeriod });
              Alert.alert('Requested', 'Report generation started. Check back shortly.');
            } catch (e) {
              Alert.alert('Error', 'Failed to generate report. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderFilterOptions = (options: string[], selected: string, onSelect: (v: string) => void) => (
    <View style={styles.filterOptions}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.filterOption, selected === opt && styles.filterOptionActive]}
          onPress={() => { onSelect(opt); setActiveFilter(null); }}
        >
          <Text style={[styles.filterOptionText, selected === opt && styles.filterOptionTextActive]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <View style={styles.headerRow}>
          <SectionHeader title="REPORTS" />
          <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} activeOpacity={0.7}>
            <Text style={styles.generateBtnText}>+ Generate</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterBar}>
          {(['period', 'region', 'type'] as FilterType[]).map(f => {
            const label = f === 'period' ? selectedPeriod === 'All periods' ? 'Period' : selectedPeriod
              : f === 'region' ? selectedRegion === 'All regions' ? 'Region' : selectedRegion
              : selectedType === 'All types' ? 'Type' : selectedType.split(' ')[0];
            return (
              <TouchableOpacity
                key={f!}
                style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
                onPress={() => setActiveFilter(activeFilter === f ? null : f)}
              >
                <Text style={styles.filterBtnText}>{label} </Text>
                <Text style={styles.filterArrow}>▼</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeFilter === 'period' && renderFilterOptions(PERIODS, selectedPeriod, setSelectedPeriod)}
        {activeFilter === 'region' && renderFilterOptions(REGIONS, selectedRegion, setSelectedRegion)}
        {activeFilter === 'type' && renderFilterOptions(REPORT_TYPES, selectedType, setSelectedType)}

        {loading ? (
          <ActivityIndicator color="#7aad6a" style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={styles.resultsCount}>
              {filtered.length} REPORT{filtered.length !== 1 ? 'S' : ''} FOUND
            </Text>
            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No reports match your filters  </Text>
                <TouchableOpacity onPress={() => {
                  setSelectedPeriod('All periods');
                  setSelectedRegion('All regions');
                  setSelectedType('All types');
                }}>
                  <Text style={styles.emptyAction}>Clear filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filtered.map(report => (
                <ReportCard key={report.report_id} report={report} />
              ))
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f1a0f' },
  scroll: { flex: 1, backgroundColor: '#0f1a0f' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  generateBtn: {
    backgroundColor: '#1e3a1e', borderWidth: 0.5,
    borderColor: '#3a6a3a', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  generateBtnText: { fontSize: 11, color: '#7aad6a' },
  filterBar: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  filterBtn: {
    flex: 1, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#1a2e1a',
    borderWidth: 0.5, borderColor: '#2d4a2d',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7,
  },
  filterBtnActive: { borderColor: '#3a6a3a', backgroundColor: '#1e3a1e' },
  filterBtnText: { fontSize: 11, color: '#5a8a52' },
  filterArrow: { fontSize: 8, color: '#3a5a3a' },
  filterOptions: {
    backgroundColor: '#1a2e1a', borderRadius: 10,
    borderWidth: 0.5, borderColor: '#2d4a2d',
    marginBottom: 8, overflow: 'hidden',
  },
  filterOption: {
    paddingVertical: 10, paddingHorizontal: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#2d4a2d',
  },
  filterOptionActive: { backgroundColor: '#1e3a1e' },
  filterOptionText: { fontSize: 12, color: '#5a8a52' },
  filterOptionTextActive: { color: '#7aad6a' },
  resultsCount: { fontSize: 10, color: '#5a8a52', letterSpacing: 0.5, marginBottom: 8 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 13, color: '#5a8a52' },
  emptyAction: { fontSize: 12, color: '#7aad6a' },
});