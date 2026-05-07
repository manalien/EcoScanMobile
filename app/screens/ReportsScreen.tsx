import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Modal, ActivityIndicator,
  Alert, Platform, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import SectionHeader from '../components/SectionHeader';
import { fetchReports, createReport, fetchRegions } from '../services/api';
import { USE_MOCK_DATA } from '../constants/config';
import { mockReports } from '../mock/reportsData';

interface Report {
  report_id: string;
  title: string;
  format: 'PDF' | 'Excel';
  region_name: string;
  period_start: string;
  period_end: string;
  status: 'ready' | 'generating' | 'failed';
  size_mb: number;
  created_at: string;
  download_url?: string;
}

interface Region {
  region_id: string;
  name: string;
}

const MONTHS = [
  'Jan ', 'Feb ', 'Mar ', 'Apr ', 'May ', 'Jun ',
  'Jul ', 'Aug ', 'Sep ', 'Oct ', 'Nov ', 'Dec ',
];
const YEARS = [2024, 2025, 2026];
const FORMATS = ['PDF', 'Excel'] as const;

interface MonthYear { month: number; year: number; }

const toDateString = (m: MonthYear, isEnd: boolean) => {
  if (!isEnd) {
    return `${m.year}-${String(m.month).padStart(2, '0')}-01`;
  }
  const nextMonth = m.month === 12 ? 1 : m.month + 1;
  const nextYear = m.month === 12 ? m.year + 1 : m.year;
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
};

const formatPeriod = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  return `${MONTHS[s.getMonth()]} ${s.getFullYear()} → ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export default function ReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);

  // Generate form state
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<MonthYear | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'Excel'>('PDF');
  const [generating, setGenerating] = useState(false);

  // Picker sub-state
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadReports = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (USE_MOCK_DATA) {
        setReports(mockReports.map((r: any) => ({
          report_id: r.report_id,
          title: r.title,
          format: r.format,
          region_name: r.region,
          period_start: '2025-10-01',
          period_end: '2025-11-01',
          status: r.status,
          size_mb: r.size_mb,
          created_at: new Date().toISOString(),
          download_url: undefined,
        })));
        return;
      }
      const data = await fetchReports();
      setReports(data);

      // stop polling if no generating reports
      const hasGenerating = data.some((r: Report) => r.status === 'generating');
      if (!hasGenerating && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    } catch (e) {
      console.error('Reports fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadRegions = async () => {
    try {
      const data = await fetchRegions();
      setRegions(data);
    } catch (e) {
      console.error('Regions fetch error:', e);
    }
  };

  useEffect(() => {
    loadReports();
    loadRegions();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Start polling when there are generating reports
  const startPolling = () => {
    if (pollRef.current) return;
    pollRef.current = setInterval(() => loadReports(true), 5000);
  };

  const handleGenerate = async () => {
    if (!selectedRegion || !selectedMonth) {
      Alert.alert('Missing info', 'Please select a region and period. ');
      return;
    }
    try {
      setGenerating(true);
      await createReport({
        region_id: selectedRegion.region_id,
        period_start: toDateString(selectedMonth, false),
        period_end: toDateString(selectedMonth, true),
        format: selectedFormat,
      });
      setShowGenerate(false);
      setSelectedRegion(null);
      setSelectedMonth(null);
      setSelectedFormat('PDF');
      await loadReports();
      startPolling();
      Alert.alert('Report requested', 'Your report is being generated. It will appear here when ready.');
    } catch (e) {
      Alert.alert('Error', 'Could not request report. Please try again.');
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report: Report) => {
    if (!report.download_url) {
      Alert.alert('Not available', 'Download URL is not available yet.');
      return;
    }
    try {
      await Linking.openURL(report.download_url);
    } catch (e) {
      Alert.alert('Error', 'Could not open download link.');
    }
  };

  const generatingCount = reports.filter(r => r.status === 'generating').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadReports(); }}
            tintColor="#7aad6a"
            colors={['#7aad6a']}
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <SectionHeader title="REPORTS" />
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={() => setShowGenerate(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.generateBtnText}>+ Generate </Text>
          </TouchableOpacity>
        </View>

        {/* Generating banner */}
        {generatingCount > 0 && (
          <View style={styles.generatingBanner}>
            <ActivityIndicator size="small" color="#7aad6a" />
            <Text style={styles.generatingBannerText}>
              {generatingCount} report{generatingCount > 1 ? 's' : ''} being generated...
            </Text>
          </View>
        )}

        {/* Report list */}
        {loading ? (
          <ActivityIndicator color="#7aad6a" style={{ marginTop: 40 }} />
        ) : reports.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No reports yet  </Text>
            <Text style={styles.emptySubText}>Tap "+ Generate" to create your first report  </Text>
          </View>
        ) : (
          reports.map(report => (
            <ReportCard
              key={report.report_id}
              report={report}
              onDownload={handleDownload}
            />
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Generate Modal */}
      <Modal
        visible={showGenerate}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGenerate(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setShowGenerate(false)}
            activeOpacity={1}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Report</Text>
              <TouchableOpacity onPress={() => setShowGenerate(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Region picker */}
            <Text style={styles.fieldLabel}>REGION</Text>
            <TouchableOpacity
              style={styles.pickerField}
              onPress={() => setShowRegionPicker(true)}
            >
              <Text style={[styles.pickerFieldText, !selectedRegion && styles.pickerFieldPlaceholder]}>
                {selectedRegion?.name + ' ' || 'Select region'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Period picker */}
            <Text style={styles.fieldLabel}>PERIOD</Text>
            <TouchableOpacity
              style={styles.pickerField}
              onPress={() => setShowMonthPicker(true)}
            >
              <Text style={[styles.pickerFieldText, !selectedMonth && styles.pickerFieldPlaceholder]}>
                {selectedMonth
                  ? `${MONTHS[selectedMonth.month - 1]} ${selectedMonth.year}`
                  : 'Select month'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Format selector */}
            <Text style={styles.fieldLabel}>FORMAT</Text>
            <View style={styles.formatRow}>
              {FORMATS.map(fmt => (
                <TouchableOpacity
                  key={fmt}
                  style={[styles.formatBtn, selectedFormat === fmt && styles.formatBtnActive]}
                  onPress={() => setSelectedFormat(fmt)}
                >
                  <Text style={[styles.formatBtnText, selectedFormat === fmt && styles.formatBtnTextActive]}>{fmt} </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!selectedRegion || !selectedMonth || generating) && styles.submitBtnDisabled,
              ]}
              onPress={handleGenerate}
              disabled={!selectedRegion || !selectedMonth || generating}
              activeOpacity={0.8}
            >
              {generating
                ? <ActivityIndicator color="#d4f0c8" size="small" />
                : <Text style={styles.submitBtnText}>Request Report</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Region picker modal */}
      <Modal
        visible={showRegionPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRegionPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowRegionPicker(false)} activeOpacity={1} />
          <View style={[styles.modalSheet, { maxHeight: '60%' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { marginBottom: 12 }]}>Select Region</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {regions.map(r => (
                <TouchableOpacity
                  key={r.region_id}
                  style={[styles.listItem, selectedRegion?.region_id === r.region_id && styles.listItemActive]}
                  onPress={() => { setSelectedRegion(r); setShowRegionPicker(false); }}
                >
                  <Text style={[styles.listItemText, selectedRegion?.region_id === r.region_id && styles.listItemTextActive]}>
                    {r.name + ' '}
                  </Text>
                  {selectedRegion?.region_id === r.region_id && (
                    <Text style={styles.listItemTick}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Month picker modal */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowMonthPicker(false)} activeOpacity={1} />
          <View style={[styles.modalSheet, { maxHeight: '65%' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { marginBottom: 12 }]}>Select Period</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {YEARS.map(year => (
                <View key={year} style={styles.yearBlock}>
                  <Text style={styles.yearLabel}>{year}</Text>
                  <View style={styles.monthGrid}>
                    {MONTHS.map((label, i) => {
                      const month = i + 1;
                      const isSelected = selectedMonth?.month === month && selectedMonth?.year === year;
                      return (
                        <TouchableOpacity
                          key={month}
                          style={[styles.monthBtn, isSelected && styles.monthBtnActive]}
                          onPress={() => { setSelectedMonth({ month, year }); setShowMonthPicker(false); }}
                        >
                          <Text style={[styles.monthBtnText, isSelected && styles.monthBtnTextActive]}>
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Report Card ────────────────────────────────────────────────────
function ReportCard({
  report,
  onDownload,
}: {
  report: Report;
  onDownload: (r: Report) => void;
}) {
  const isPDF = report.format === 'PDF';
  const isReady = report.status === 'ready';
  const isGenerating = report.status === 'generating';
  const isFailed = report.status === 'failed';

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.top}>
        <View style={cardStyles.left}>
          <View style={[cardStyles.formatBox, {
            backgroundColor: isPDF ? '#0d3a1a' : '#1a2a0a',
            borderColor: isPDF ? '#2d6a2d' : '#3a5a1a',
          }]}>
            <Text style={[cardStyles.formatText, { color: isPDF ? '#74c476' : '#a0c060' }]}>
              {report.format}
            </Text>
          </View>
          <View style={cardStyles.titleBlock}>
            <Text style={cardStyles.title}>{report.title ?? `${report.region_name} Report`}</Text>
            <Text style={cardStyles.subtitle}>
              {report.region_name} · {formatPeriod(report.period_start, report.period_end)}
            </Text>
          </View>
        </View>

        {isReady && (
          <TouchableOpacity style={cardStyles.downloadBtn} onPress={() => onDownload(report)}>
            <Text style={cardStyles.downloadBtnText}>↓ {report.format}</Text>
          </TouchableOpacity>
        )}
        {isGenerating && (
          <View style={cardStyles.processingBadge}>
            <ActivityIndicator size="small" color="#7aad6a" style={{ marginRight: 4 }} />
            <Text style={cardStyles.processingText}>Processing</Text>
          </View>
        )}
        {isFailed && (
          <View style={cardStyles.failedBadge}>
            <Text style={cardStyles.failedText}>Failed</Text>
          </View>
        )}
      </View>

      <View style={cardStyles.meta}>
        <Text style={cardStyles.metaText}>
          {isGenerating ? 'Generating...' : formatDate(report.created_at)}
        </Text>
        {isReady && report.size_mb > 0 && (
          <Text style={cardStyles.metaText}>{report.size_mb.toFixed(1)} MB</Text>
        )}
        {isReady && (
          <Text style={[cardStyles.metaText, { color: '#4a9e3a' }]}>Ready</Text>
        )}
        {isFailed && (
          <Text style={[cardStyles.metaText, { color: '#e24b4a' }]}>Generation failed</Text>
        )}
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#1a2e1a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    marginBottom: 8,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  left: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  formatBox: {
    width: 36, height: 36, borderRadius: 8,
    borderWidth: 0.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  formatText: { fontSize: 10, fontWeight: '500' },
  titleBlock: { flex: 1 },
  title: { fontSize: 13, fontWeight: '500', color: '#d4f0c8', marginBottom: 2 },
  subtitle: { fontSize: 11, color: '#5a8a52' },
  downloadBtn: {
    backgroundColor: '#0d3a1a', borderWidth: 0.5, borderColor: '#2d6a2d',
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8,
  },
  downloadBtnText: { fontSize: 10, color: '#74c476' },
  processingBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a2e1a', borderWidth: 0.5,
    borderColor: '#2d4a2d', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8,
  },
  processingText: { fontSize: 10, color: '#7aad6a' },
  failedBadge: {
    backgroundColor: '#2a1010', borderWidth: 0.5, borderColor: '#5a2020',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8,
  },
  failedText: { fontSize: 10, color: '#e24b4a' },
  meta: {
    borderTopWidth: 0.5, borderTopColor: '#2d4a2d',
    paddingTop: 8, flexDirection: 'row', gap: 12,
  },
  metaText: { fontSize: 10, color: '#3a5a3a' },
});

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

  generatingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1a2e1a', borderRadius: 8,
    borderWidth: 0.5, borderColor: '#2d4a2d',
    padding: 10, marginBottom: 12,
  },
  generatingBannerText: { fontSize: 12, color: '#7aad6a' },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 14, color: '#5a8a52' },
  emptySubText: { fontSize: 12, color: '#3a5a3a' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: '#0f1a0f',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 0.5, borderColor: '#2d4a2d',
    paddingHorizontal: 20, paddingBottom: 34,
  },
  modalHandle: {
    width: 36, height: 4, backgroundColor: '#2d4a2d',
    borderRadius: 2, alignSelf: 'center',
    marginTop: 10, marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: '500', color: '#d4f0c8' },
  modalClose: { fontSize: 14, color: '#5a8a52', padding: 4 },

  fieldLabel: {
    fontSize: 10, color: '#5a8a52',
    letterSpacing: 0.5, marginBottom: 6,
  },
  pickerField: {
    backgroundColor: '#1a2e1a', borderRadius: 10,
    borderWidth: 0.5, borderColor: '#2d4a2d',
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  pickerFieldText: { fontSize: 14, color: '#d4f0c8' },
  pickerFieldPlaceholder: { color: '#3a5a3a' },
  chevron: { fontSize: 16, color: '#3a5a3a' },

  formatRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  formatBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#1a2e1a', borderWidth: 0.5,
    borderColor: '#2d4a2d', alignItems: 'center',
  },
  formatBtnActive: { backgroundColor: '#2d4a2d', borderColor: '#3a6a3a' },
  formatBtnText: { fontSize: 13, color: '#5a8a52' },
  formatBtnTextActive: { color: '#7aad6a', fontWeight: '500' },

  submitBtn: {
    backgroundColor: '#1e3a1e', borderWidth: 0.5,
    borderColor: '#3a6a3a', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 14, fontWeight: '500', color: '#7aad6a' },

  // List items
  listItem: {
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: 0.5, borderBottomColor: '#1e3a1e',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  listItemActive: { backgroundColor: '#1a2e1a' },
  listItemText: { fontSize: 14, color: '#5a8a52' },
  listItemTextActive: { color: '#7aad6a' },
  listItemTick: { fontSize: 14, color: '#74c476' },

  // Year/month grid
  yearBlock: { marginBottom: 16 },
  yearLabel: { fontSize: 11, color: '#7aad6a', letterSpacing: 0.5, marginBottom: 8 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  monthBtn: {
    width: '22%', paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#1a2e1a', borderWidth: 0.5,
    borderColor: '#2d4a2d', alignItems: 'center',
  },
  monthBtnActive: { backgroundColor: '#2d4a2d', borderColor: '#3a6a3a' },
  monthBtnText: { fontSize: 12, color: '#5a8a52' },
  monthBtnTextActive: { color: '#7aad6a', fontWeight: '500' },
});