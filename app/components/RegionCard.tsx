import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface RegionItem {
  region_id: string;
  name: string;
  level: string;
  zone: string;
  ndvi_mean: number;
  ndvi_change: number;
}

interface Props {
  region: RegionItem;
  onPress?: (region: RegionItem) => void;
}

function getDotColor(ndvi: number): string {
  if (ndvi >= 0.6) return '#006837';
  if (ndvi >= 0.4) return '#3b6d11';
  return '#ba7517';
}

export default function RegionCard({ region, onPress }: Props) {
  const isPositive = region.ndvi_change >= 0;
  const dotColor = getDotColor(region.ndvi_mean);
  const dotBoxColor = region.ndvi_mean >= 0.4 ? '#0d3a1a' : '#2a2010';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress?.(region)}
    >
      <View style={styles.left}>
        <View style={[styles.dotBox, { backgroundColor: dotBoxColor }]}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
        </View>
        <View>
          <Text style={styles.name}>{region.name}</Text>
          <Text style={styles.sub}>{region.level} · {region.zone} </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.ndvi, { color: isPositive ? '#74c476' : '#f46d43' }]}>
          {region.ndvi_mean.toFixed(2)}
        </Text>
        <Text style={[styles.change, { color: isPositive ? '#4a8a4a' : '#c05030' }]}>
          {isPositive ? '+' : ''}{region.ndvi_change.toFixed(2)} {isPositive ? '↑' : '↓'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a2e1a',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dotBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    color: '#d4f0c8',
  },
  sub: {
    fontSize: 11,
    color: '#5a8a52',
  },
  right: {
    alignItems: 'flex-end',
  },
  ndvi: {
    fontSize: 14,
    fontWeight: '500',
  },
  change: {
    fontSize: 10,
    marginTop: 1,
  },
});