import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Informational';

export interface AlertItem {
  alert_id: string;
  region: string;
  severity: AlertSeverity;
  description: string;
  ndvi_change: number;
  area_affected: number;
  created_at: string;
}

interface Props {
  alert: AlertItem;
}

const SEVERITY_CONFIG: Record<AlertSeverity, {
  bg: string; border: string; badge: string;
  badgeText: string; dot: string; label: string;
  sub: string; meta: string; value: string;
}> = {
  Critical: {
    bg: '#2a1010', border: '#5a2020', badge: '#4a1515',
    badgeText: '#e24b4a', dot: '#e24b4a', label: '#f0a0a0',
    sub: '#a05050', meta: '#6a3a3a', value: '#e24b4a',
  },
  High: {
    bg: '#251808', border: '#5a3a10', badge: '#3a2005',
    badgeText: '#f46d43', dot: '#f46d43', label: '#f0c090',
    sub: '#a07040', meta: '#6a5030', value: '#f46d43',
  },
  Medium: {
    bg: '#1e1e08', border: '#4a4a10', badge: '#2e2e05',
    badgeText: '#d4c43a', dot: '#d4c43a', label: '#e8e090',
    sub: '#909040', meta: '#505030', value: '#d4c43a',
  },
  Informational: {
    bg: '#081820', border: '#103a50', badge: '#052030',
    badgeText: '#4a9ecf', dot: '#4a9ecf', label: '#90c8e8',
    sub: '#406878', meta: '#304858', value: '#4a9ecf',
  },
};

export default function AlertCard({ alert }: Props) {
  const config = SEVERITY_CONFIG[alert.severity];

  return (
    <View style={[styles.card, { backgroundColor: config.bg, borderColor: config.border }]}>
      <View style={styles.top}>
        <View style={styles.left}>
          <View style={[styles.dot, { backgroundColor: config.dot }]} />
          <View style={styles.textBlock}>
            <Text style={[styles.region, { color: config.label }]}>{alert.region}</Text>
            <Text style={[styles.desc, { color: config.sub }]}>{alert.description}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: config.badge }]}>
          <Text style={[styles.badgeText, { color: config.badgeText }]}>
            {alert.severity.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={[styles.meta, { borderTopColor: config.border }]}>
        <Text style={[styles.metaText, { color: config.sub }]}>
          NDVI change:{' '}
          <Text style={{ color: config.value }}>{alert.ndvi_change.toFixed(2)}</Text>
        </Text>
        <Text style={[styles.metaText, { color: config.sub }]}>
          Area: {alert.area_affected}% affected
        </Text>
        <Text style={[styles.metaText, { color: config.meta }]}>{alert.created_at}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 0.5,
    marginBottom: 8,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 3,
  },
  textBlock: {
    flex: 1,
  },
  region: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  desc: {
    fontSize: 11,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 11,
  },
});