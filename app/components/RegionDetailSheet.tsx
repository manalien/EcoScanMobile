import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Dimensions, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { RegionItem } from './RegionCard';
import { fetchNDVIChange } from '../services/api';

interface Props {
  region: RegionItem;
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  severe_decrease:   { label: 'Severe Decrease',   color: '#A50026' },
  moderate_decrease: { label: 'Moderate Decrease', color: '#F46D43' },
  no_change:         { label: 'No Change',          color: '#FFFFBF' },
  moderate_increase: { label: 'Moderate Increase', color: '#74C476' },
  severe_increase:   { label: 'Severe Increase',   color: '#006837' },
};

interface ChangeResult {
  ndvi_old: number;
  ndvi_new: number;
  absolute_change: number;
  percent_change: number;
  category: string;
  alert_triggered: boolean;
}

interface MonthYear {
  month: number; // 1-12
  year: number;
}

const MONTHS = [
  'Jan ', 'Feb ', 'Mar ', 'Apr ', 'May ', 'Jun ',
  'Jul ', 'Aug ', 'Sep ', 'Oct ', 'Nov ', 'Dec ',
];

const YEARS = [2024, 2025, 2026];

const getLastDay = (month: number, year: number) =>
  new Date(year, month, 0).getDate();

const formatPeriod = (m: MonthYear | null) => {
  if (!m) return 'Select month';
  return `${MONTHS[m.month - 1]} ${m.year}`;
};


// replace the entire toDateString function:
const toDateString = (m: MonthYear, isEnd: boolean) => {
  if (!isEnd) {
    // start = first day of selected month
    const mm = String(m.month).padStart(2, '0');
    return `${m.year}-${mm}-01`;
  } else {
    // end = first day of NEXT month
    const nextMonth = m.month === 12 ? 1 : m.month + 1;
    const nextYear = m.month === 12 ? m.year + 1 : m.year;
    const mm = String(nextMonth).padStart(2, '0');
    return `${nextYear}-${mm}-01`;
  }
};

// ── Month Picker Modal ─────────────────────────────────────────────
function MonthPicker({
  visible,
  title,
  selected,
  onSelect,
  onClose,
  disableBefore,
}: {
  visible: boolean;
  title: string;
  selected: MonthYear | null;
  onSelect: (m: MonthYear) => void;
  onClose: () => void;
  disableBefore?: MonthYear | null;
}) {
  const isDisabled = (month: number, year: number) => {
    if (!disableBefore) return false;
    if (year < disableBefore.year) return true;
    if (year === disableBefore.year && month <= disableBefore.month) return true;
    return false;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={pickerStyles.overlay}>
        <TouchableOpacity style={pickerStyles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={pickerStyles.sheet}>
          <View style={pickerStyles.handle} />
          <View style={pickerStyles.header}>
            <Text style={pickerStyles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={pickerStyles.done}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {YEARS.map(year => (
              <View key={year} style={pickerStyles.yearBlock}>
                <Text style={pickerStyles.yearLabel}>{year}</Text>
                <View style={pickerStyles.monthGrid}>
                  {MONTHS.map((label, i) => {
                    const month = i + 1;
                    const disabled = isDisabled(month, year);
                    const isSelected = selected?.month === month && selected?.year === year;
                    return (
                      <TouchableOpacity
                        key={month}
                        style={[
                          pickerStyles.monthBtn,
                          isSelected && pickerStyles.monthBtnSelected,
                          disabled && pickerStyles.monthBtnDisabled,
                        ]}
                        onPress={() => {
                          if (!disabled) {
                            onSelect({ month, year });
                            onClose();
                          }
                        }}
                        disabled={disabled}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          pickerStyles.monthText,
                          isSelected && pickerStyles.monthTextSelected,
                          disabled && pickerStyles.monthTextDisabled,
                        ]}>
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
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function RegionDetailSheet({ region, onClose }: Props) {
  const [period1, setPeriod1] = useState<MonthYear | null>(null);
  const [period2, setPeriod2] = useState<MonthYear | null>(null);
  const [showPicker1, setShowPicker1] = useState(false);
  const [showPicker2, setShowPicker2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChangeResult | null>(null);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!period1 || !period2) {
      setError('Please select both periods');
      return;
    }
    setError('');
    try {
      setLoading(true);
      setResult(null);
      const data = await fetchNDVIChange(
        region.region_id,
        toDateString(period1, false),
        toDateString(period1, true),
        toDateString(period2, false),
        toDateString(period2, true),
      );
      setResult(data);
    } catch (e: any) {
      Alert.alert('Error', 'Could not fetch change data. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const category = result ? CATEGORY_CONFIG[result.category] : null;
  const isPositive = result ? result.absolute_change >= 0 : false;

  return (
    <>
      <Modal visible transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

          <View style={styles.sheet}>
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.regionName}>{region.name} </Text>
                <Text style={styles.regionSub}>{region.level} · {region.zone} </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Period selectors */}
              <View style={styles.periodsRow}>
                {/* Period 1 */}
                <TouchableOpacity
                  style={[styles.periodBtn, period1 && styles.periodBtnSelected]}
                  onPress={() => setShowPicker1(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.periodBtnLabel}>PERIOD 1 — OLDER</Text>
                  <Text style={[
                    styles.periodBtnValue,
                    !period1 && styles.periodBtnPlaceholder,
                  ]}>
                    {formatPeriod(period1)}
                  </Text>
                </TouchableOpacity>

                {/* Arrow */}
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrowText}>→</Text>
                </View>

                {/* Period 2 */}
                <TouchableOpacity
                  style={[styles.periodBtn, period2 && styles.periodBtnSelected]}
                  onPress={() => setShowPicker2(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.periodBtnLabel}>PERIOD 2 — NEWER</Text>
                  <Text style={[
                    styles.periodBtnValue,
                    !period2 && styles.periodBtnPlaceholder,
                  ]}>
                    {formatPeriod(period2)}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Error */}
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {/* Compare button */}
              <TouchableOpacity
                style={[styles.compareBtn, (!period1 || !period2 || loading) && styles.compareBtnDisabled]}
                onPress={handleCompare}
                activeOpacity={0.8}
                disabled={!period1 || !period2 || loading}
              >
                {loading
                  ? <ActivityIndicator color="#d4f0c8" size="small" />
                  : <Text style={styles.compareBtnText}>Compare Periods</Text>
                }
              </TouchableOpacity>

              {/* Results */}
              {result && (
                <View style={styles.results}>
                  <View style={[styles.categoryBanner, { borderColor: category?.color }]}>
                    <View style={[styles.categoryDot, { backgroundColor: category?.color }]} />
                    <Text style={[styles.categoryLabel, { color: category?.color }]}>
                      {category?.label}
                    </Text>
                    {result.alert_triggered && (
                      <View style={styles.alertBadge}>
                        <Text style={styles.alertBadgeText}>⚠ Alert triggered</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>NDVI {formatPeriod(period1)}</Text>
                      <Text style={styles.statValue}>{result.ndvi_old.toFixed(3)}</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>NDVI {formatPeriod(period2)}</Text>
                      <Text style={styles.statValue}>{result.ndvi_new.toFixed(3)}</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>ABSOLUTE CHANGE</Text>
                      <Text style={[styles.statValue, { color: isPositive ? '#74c476' : '#f46d43' }]}>
                        {isPositive ? '+' : ''}{result.absolute_change.toFixed(3)}
                      </Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>% CHANGE</Text>
                      <Text style={[styles.statValue, { color: isPositive ? '#74c476' : '#f46d43' }]}>
                        {isPositive ? '+' : ''}{result.percent_change.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Month pickers */}
      <MonthPicker
        visible={showPicker1}
        title="Select Period 1 (Older)"
        selected={period1}
        onSelect={setPeriod1}
        onClose={() => setShowPicker1(false)}
      />
      <MonthPicker
        visible={showPicker2}
        title="Select Period 2 (Newer)"
        selected={period2}
        onSelect={setPeriod2}
        onClose={() => setShowPicker2(false)}
        disableBefore={period1}
      />
    </>
  );
}

// ── Picker Styles ──────────────────────────────────────────────────
const pickerStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: '#0f1a0f',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    paddingHorizontal: 20,
    maxHeight: Dimensions.get('window').height * 0.75,
  },
  handle: {
    width: 36, height: 4,
    backgroundColor: '#2d4a2d',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10, marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 14, fontWeight: '500', color: '#d4f0c8' },
  done: { fontSize: 14, color: '#7aad6a', fontWeight: '500' },

  yearBlock: { marginBottom: 16 },
  yearLabel: {
    fontSize: 11,
    color: '#7aad6a',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthBtn: {
    width: '22%',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1a2e1a',
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    alignItems: 'center',
  },
  monthBtnSelected: {
    backgroundColor: '#2d4a2d',
    borderColor: '#3a6a3a',
  },
  monthBtnDisabled: {
    opacity: 0.3,
  },
  monthText: { fontSize: 12, color: '#5a8a52' },
  monthTextSelected: { color: '#7aad6a', fontWeight: '500' },
  monthTextDisabled: { color: '#3a5a3a' },
});

// ── Main Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: '#0f1a0f',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: Dimensions.get('window').height * 0.85,
  },
  handle: {
    width: 36, height: 4,
    backgroundColor: '#2d4a2d',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10, marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  regionName: { fontSize: 20, fontWeight: '500', color: '#d4f0c8', marginBottom: 3 },
  regionSub: { fontSize: 12, color: '#5a8a52' },
  closeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#1a2e1a',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 12, color: '#5a8a52' },

  periodsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  periodBtn: {
    flex: 1,
    backgroundColor: '#1a2e1a',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    padding: 12,
  },
  periodBtnSelected: {
    borderColor: '#3a6a3a',
    backgroundColor: '#1e3a1e',
  },
  periodBtnLabel: {
    fontSize: 9,
    color: '#5a8a52',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  periodBtnValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d4f0c8',
  },
  periodBtnPlaceholder: {
    color: '#3a5a3a',
    fontWeight: '400',
    fontSize: 12,
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  arrowText: { fontSize: 16, color: '#3a5a3a' },

  errorText: {
    fontSize: 12,
    color: '#e24b4a',
    textAlign: 'center',
    marginBottom: 8,
  },

  compareBtn: {
    backgroundColor: '#1e3a1e',
    borderWidth: 0.5,
    borderColor: '#3a6a3a',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 16,
  },
  compareBtnDisabled: { opacity: 0.5 },
  compareBtnText: { fontSize: 14, fontWeight: '500', color: '#7aad6a' },

  results: { gap: 10 },
  categoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a2e1a',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  categoryDot: { width: 10, height: 10, borderRadius: 5 },
  categoryLabel: { fontSize: 14, fontWeight: '500', flex: 1 },
  alertBadge: {
    backgroundColor: '#2a1010',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: '#5a2020',
  },
  alertBadgeText: { fontSize: 10, color: '#e24b4a' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: {
    width: '47%',
    backgroundColor: '#1a2e1a',
    borderRadius: 10,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
  },
  statLabel: { fontSize: 9, color: '#5a8a52', letterSpacing: 0.5, marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '500', color: '#d4f0c8' },
});