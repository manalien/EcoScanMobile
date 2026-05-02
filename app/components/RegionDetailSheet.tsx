import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Dimensions, ScrollView, ActivityIndicator,
  Alert, Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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

type FieldKey = 'p1Start' | 'p1End' | 'p2Start' | 'p2End';

const FIELD_LABELS: Record<FieldKey, string> = {
  p1Start: 'Period 1 — Start',
  p1End:   'Period 1 — End',
  p2Start: 'Period 2 — Start',
  p2End:   'Period 2 — End',
};

const formatDate = (date: Date) =>
  date.toISOString().split('T')[0]; // YYYY-MM-DD

const displayDate = (date: Date | null) =>
  date ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select date';

export default function RegionDetailSheet({ region, onClose }: Props) {
  const [dates, setDates] = useState<Record<FieldKey, Date | null>>({
    p1Start: null,
    p1End: null,
    p2Start: null,
    p2End: null,
  });

  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChangeResult | null>(null);
  const [validationError, setValidationError] = useState('');

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setActiveField(null); // auto-closes on Android
    }
    if (event.type === 'set' && selected && activeField) {
      setDates(prev => ({ ...prev, [activeField]: selected }));
      setValidationError('');
    }
    if (event.type === 'dismissed') {
      setActiveField(null);
    }
  };

  const confirmIOSDate = () => setActiveField(null);

  const validate = (): string | null => {
    const { p1Start, p1End, p2Start, p2End } = dates;
    if (!p1Start || !p1End || !p2Start || !p2End)
      return 'Please select all four dates';
    if (p1Start >= p1End)
      return 'Period 1 end must be after its start';
    if (p2Start >= p2End)
      return 'Period 2 end must be after its start';
    if (p2Start <= p1End)
      return 'Period 2 must start after Period 1 ends';
    return null;
  };

  const handleCompare = async () => {
    const error = validate();
    if (error) { setValidationError(error); return; }
    try {
      setLoading(true);
      setResult(null);
      setValidationError('');
      const data = await fetchNDVIChange(
        region.region_id,
        formatDate(dates.p1Start!),
        formatDate(dates.p1End!),
        formatDate(dates.p2Start!),
        formatDate(dates.p2End!),
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

  // ── Date field button ────────────────────────────────────────────
  const DateField = ({ field }: { field: FieldKey }) => (
    <TouchableOpacity
      style={[styles.dateField, activeField === field && styles.dateFieldActive]}
      onPress={() => setActiveField(field)}
      activeOpacity={0.7}
    >
      <Text style={styles.dateFieldLabel}>{FIELD_LABELS[field]}</Text>
      <Text style={[
        styles.dateFieldValue,
        !dates[field] && styles.dateFieldPlaceholder,
      ]}>
        {displayDate(dates[field])}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.regionName}>{region.name}</Text>
              <Text style={styles.regionSub}>{region.level} · {region.zone}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Period 1 */}
            <View style={styles.periodBlock}>
              <Text style={styles.periodTitle}>PERIOD 1 — OLDER</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateHalf}><DateField field="p1Start" /></View>
                <View style={styles.dateHalf}><DateField field="p1End" /></View>
              </View>
            </View>

            {/* Period 2 */}
            <View style={styles.periodBlock}>
              <Text style={styles.periodTitle}>PERIOD 2 — NEWER</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateHalf}><DateField field="p2Start" /></View>
                <View style={styles.dateHalf}><DateField field="p2End" /></View>
              </View>
            </View>

            {/* Validation error */}
            {validationError ? (
              <Text style={styles.validationError}>{validationError}</Text>
            ) : null}

            {/* Compare button */}
            <TouchableOpacity
              style={[styles.compareBtn, loading && styles.compareBtnDisabled]}
              onPress={handleCompare}
              activeOpacity={0.8}
              disabled={loading}
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
                    <Text style={styles.statLabel}>NDVI PERIOD 1</Text>
                    <Text style={styles.statValue}>{result.ndvi_old.toFixed(3)}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>NDVI PERIOD 2</Text>
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

      {/* Android: native popup, iOS: modal wrapper */}
      {activeField && Platform.OS === 'android' && (
        <DateTimePicker
          value={dates[activeField] || new Date()}
          mode="date"
          display="calendar"
          maximumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {activeField && Platform.OS === 'ios' && (
        <Modal visible transparent animationType="fade">
          <View style={styles.iosPickerOverlay}>
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <Text style={styles.iosPickerTitle}>
                  {FIELD_LABELS[activeField]}
                </Text>
                <TouchableOpacity onPress={confirmIOSDate}>
                  <Text style={styles.iosPickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dates[activeField] || new Date()}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={handleDateChange}
                themeVariant="dark"
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#0f1a0f',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: Dimensions.get('window').height * 0.88,
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
    marginBottom: 16,
  },
  regionName: { fontSize: 20, fontWeight: '500', color: '#d4f0c8', marginBottom: 3 },
  regionSub: { fontSize: 12, color: '#5a8a52' },
  closeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#1a2e1a',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 12, color: '#5a8a52' },

  periodBlock: {
    backgroundColor: '#1a2e1a',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    padding: 12,
    marginBottom: 10,
  },
  periodTitle: {
    fontSize: 10,
    color: '#7aad6a',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateHalf: { flex: 1 },

  dateField: {
    backgroundColor: '#0f1a0f',
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  dateFieldActive: {
    borderColor: '#3a6a3a',
    backgroundColor: '#152515',
  },
  dateFieldLabel: {
    fontSize: 9,
    color: '#5a8a52',
    letterSpacing: 0.3,
  },
  dateFieldValue: {
    fontSize: 12,
    color: '#d4f0c8',
    fontWeight: '500',
  },
  dateFieldPlaceholder: {
    color: '#3a5a3a',
    fontWeight: '400',
  },

  validationError: {
    fontSize: 12,
    color: '#e24b4a',
    textAlign: 'center',
    marginBottom: 4,
    backgroundColor: '#2a1010',
    borderRadius: 8,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#5a2020',
  },

  compareBtn: {
    backgroundColor: '#1e3a1e',
    borderWidth: 0.5,
    borderColor: '#3a6a3a',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginVertical: 12,
  },
  compareBtnDisabled: { opacity: 0.6 },
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

  // iOS picker
  iosPickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  iosPickerContainer: {
    backgroundColor: '#1a2e1a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    paddingBottom: 34,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2d4a2d',
  },
  iosPickerTitle: { fontSize: 13, color: '#d4f0c8', fontWeight: '500' },
  iosPickerDone: { fontSize: 14, color: '#7aad6a', fontWeight: '500' },
  iosPicker: { backgroundColor: '#1a2e1a' },
});