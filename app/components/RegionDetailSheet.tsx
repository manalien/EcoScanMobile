import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Dimensions,
} from 'react-native';
import { RegionItem } from './RegionCard';
import NDVIChart from './NDVIChart';

interface Props {
  region: RegionItem;
  onClose: () => void;
}

// Mock historical NDVI for the detail chart
const getMockHistory = (current: number) => ({
  labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
  values: [
    +(current - 0.07).toFixed(2),
    +(current - 0.03).toFixed(2),
    +(current - 0.06).toFixed(2),
    +(current - 0.09).toFixed(2),
    +(current - 0.04).toFixed(2),
    +(current - 0.01).toFixed(2),
    +current.toFixed(2),
  ],
});

const NDVI_CATEGORY = (ndvi: number) => {
  if (ndvi >= 0.6) return { label: 'Healthy', color: '#74c476' };
  if (ndvi >= 0.4) return { label: 'Moderate', color: '#FFFFBF' };
  if (ndvi >= 0.2) return { label: 'Sparse', color: '#F46D43' };
  return { label: 'Bare/Critical', color: '#A50026' };
};

export default function RegionDetailSheet({ region, onClose }: Props) {
  const history = getMockHistory(region.ndvi_mean);
  const isPositive = region.ndvi_change >= 0;
  const category = NDVI_CATEGORY(region.ndvi_mean);
  const screenWidth = Dimensions.get('window').width;

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
          {/* Handle */}
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

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>NDVI</Text>
              <Text style={[styles.statValue, { color: isPositive ? '#74c476' : '#f46d43' }]}>
                {region.ndvi_mean.toFixed(2)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>CHANGE</Text>
              <Text style={[styles.statValue, { color: isPositive ? '#74c476' : '#f46d43' }]}>
                {isPositive ? '+' : ''}{region.ndvi_change.toFixed(2)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>STATUS</Text>
              <Text style={[styles.statValue, { color: category.color, fontSize: 12 }]}>
                {category.label}
              </Text>
            </View>
          </View>

          {/* Chart */}
          <Text style={styles.chartTitle}>NDVI TREND — OCT 2024 TO APR 2025</Text>
          <NDVIChart
            labels={history.labels}
            values={history.values}
            width={screenWidth - 48}
            height={140}
          />

          {/* Change breakdown */}
          <View style={styles.breakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Period</Text>
              <Text style={styles.breakdownValue}>Mar → Apr 2025</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Absolute change</Text>
              <Text style={[styles.breakdownValue, { color: isPositive ? '#74c476' : '#f46d43' }]}>
                {isPositive ? '+' : ''}{region.ndvi_change.toFixed(2)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>% change</Text>
              <Text style={[styles.breakdownValue, { color: isPositive ? '#74c476' : '#f46d43' }]}>
                {isPositive ? '+' : ''}{((region.ndvi_change / (region.ndvi_mean - region.ndvi_change)) * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={[styles.breakdownRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.breakdownLabel}>Composite type</Text>
              <Text style={styles.breakdownValue}>Monthly</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
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
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#2d4a2d',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  regionName: {
    fontSize: 20,
    fontWeight: '500',
    color: '#d4f0c8',
    marginBottom: 3,
  },
  regionSub: {
    fontSize: 12,
    color: '#5a8a52',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a2e1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    color: '#5a8a52',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a2e1a',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    color: '#5a8a52',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '500',
    color: '#d4f0c8',
  },

  chartTitle: {
    fontSize: 10,
    color: '#5a8a52',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  breakdown: {
    backgroundColor: '#1a2e1a',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    marginTop: 14,
    overflow: 'hidden',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2d4a2d',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#5a8a52',
  },
  breakdownValue: {
    fontSize: 12,
    color: '#d4f0c8',
  },
});