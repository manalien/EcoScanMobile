import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  StatusBar, TouchableOpacity, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SectionHeader from '../components/SectionHeader';
import ReportCard from '../components/ReportCard';
import {
  mockReports, ReportItem,
  REGIONS, REPORT_TYPES, PERIODS,
} from '../mock/reportsData';

type FilterType = 'period' | 'region' | 'type' | null;

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('All periods');
  const [selectedRegion, setSelectedRegion] = useState('All regions');
  const [selectedType, setSelectedType] = useState('All types');
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);

  const filtered = useMemo(() => {
    return mockReports.filter(r => {
      const periodMatch = selectedPeriod === 'All periods' || r.period === selectedPeriod;
      const regionMatch = selectedRegion === 'All regions' || r.region === selectedRegion;
      const typeMatch = selectedType === 'All types' || r.type === selectedType;
      return periodMatch && regionMatch && typeMatch;
    });
  }, [selectedPeriod, selectedRegion, selectedType]);

  const handleGenerate = () => {
    Alert.alert(
      'Generate Report',
      'This will request a new report from the backend.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Generate', onPress: () => Alert.alert('Requested', 'Report generation started. Check back shortly.') },
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
      <StatusBar backgroundColor="#0f1a0f" barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <SectionHeader title="REPORTS" />
          <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} activeOpacity={0.7}>
            <Text style={styles.generateBtnText}>+ Generate</Text>
          </TouchableOpacity>
        </View>

        {/* Filter bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterBtn, activeFilter === 'period' && styles.filterBtnActive]}
            onPress={() => setActiveFilter(activeFilter === 'period' ? null : 'period')}
          >
            <Text style={styles.filterBtnText}>
              {selectedPeriod === 'All periods' ? 'Period' : selectedPeriod}
            </Text>
            <Text style={styles.filterArrow}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, activeFilter === 'region' && styles.filterBtnActive]}
            onPress={() => setActiveFilter(activeFilter === 'region' ? null : 'region')}
          >
            <Text style={styles.filterBtnText}>
              {selectedRegion === 'All regions' ? 'Region' : selectedRegion}
            </Text>
            <Text style={styles.filterArrow}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, activeFilter === 'type' && styles.filterBtnActive]}
            onPress={() => setActiveFilter(activeFilter === 'type' ? null : 'type')}
          >
            <Text style={styles.filterBtnText}>
              {selectedType === 'All types' ? 'Type' : selectedType.split(' ')[0]}
            </Text>
            <Text style={styles.filterArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Dropdown options */}
        {activeFilter === 'period' && renderFilterOptions(PERIODS, selectedPeriod, setSelectedPeriod)}
        {activeFilter === 'region' && renderFilterOptions(REGIONS, selectedRegion, setSelectedRegion)}
        {activeFilter === 'type' && renderFilterOptions(REPORT_TYPES, selectedType, setSelectedType)}

        {/* Results count */}
        <Text style={styles.resultsCount}>
          {filtered.length} REPORT{filtered.length !== 1 ? 'S' : ''} FOUND
        </Text>

        {/* Report list */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No reports match your filters</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  generateBtn: {
    backgroundColor: '#1e3a1e',
    borderWidth: 0.5,
    borderColor: '#3a6a3a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  generateBtnText: { fontSize: 11, color: '#7aad6a' },

  filterBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a2e1a',
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  filterBtnActive: {
    borderColor: '#3a6a3a',
    backgroundColor: '#1e3a1e',
  },
  filterBtnText: { fontSize: 11, color: '#5a8a52' },
  filterArrow: { fontSize: 8, color: '#3a5a3a' },

  filterOptions: {
    backgroundColor: '#1a2e1a',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    marginBottom: 8,
    overflow: 'hidden',
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2d4a2d',
  },
  filterOptionActive: {
    backgroundColor: '#1e3a1e',
  },
  filterOptionText: { fontSize: 12, color: '#5a8a52' },
  filterOptionTextActive: { color: '#7aad6a' },

  resultsCount: {
    fontSize: 10,
    color: '#5a8a52',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: { fontSize: 13, color: '#5a8a52' },
  emptyAction: { fontSize: 12, color: '#7aad6a' },
});