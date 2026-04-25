import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { ReportItem } from '../mock/reportsData';

interface Props {
  report: ReportItem;
  onDownload?: (report: ReportItem) => void;
}

export default function ReportCard({ report, onDownload }: Props) {
  const isPDF = report.format === 'PDF';
  const isReady = report.status === 'ready';
  const isGenerating = report.status === 'generating';

  const handleDownload = () => {
    if (onDownload) onDownload(report);
    else Alert.alert('Download', `Downloading ${report.title}...\n(Backend not connected yet)`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.left}>
          <View style={[styles.formatBox, { backgroundColor: isPDF ? '#0d3a1a' : '#1a2a0a', borderColor: isPDF ? '#2d6a2d' : '#3a5a1a' }]}>
            <Text style={[styles.formatText, { color: isPDF ? '#74c476' : '#a0c060' }]}>
              {report.format}
            </Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{report.title}</Text>
            <Text style={styles.subtitle}>{report.region} · {report.period}</Text>
          </View>
        </View>

        {isReady && (
          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} activeOpacity={0.7}>
            <Text style={styles.downloadBtnText}>↓ {report.format}</Text>
          </TouchableOpacity>
        )}

        {isGenerating && (
          <View style={styles.generatingBadge}>
            <Text style={styles.generatingText}>Processing</Text>
          </View>
        )}
      </View>

      <View style={styles.meta}>
        {isReady && (
          <>
            <Text style={styles.metaText}>Generated: {report.generated_at}</Text>
            <Text style={styles.metaText}>{report.size_mb} MB</Text>
            <Text style={[styles.metaText, { color: '#4a9e3a' }]}>Ready</Text>
          </>
        )}

        {isGenerating && (
          <View style={styles.progressRow}>
            <Text style={styles.metaText}>Requested: {report.generated_at}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${report.progress}%` }]} />
            </View>
            <Text style={styles.metaText}>{report.progress}%</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  formatBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  formatText: {
    fontSize: 10,
    fontWeight: '500',
  },
  titleBlock: { flex: 1 },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: '#d4f0c8',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: '#5a8a52',
  },
  downloadBtn: {
    backgroundColor: '#0d3a1a',
    borderWidth: 0.5,
    borderColor: '#2d6a2d',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  downloadBtnText: {
    fontSize: 10,
    color: '#74c476',
  },
  generatingBadge: {
    backgroundColor: '#1a1a1a',
    borderWidth: 0.5,
    borderColor: '#3a3a3a',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  generatingText: {
    fontSize: 10,
    color: '#5a5a5a',
  },
  meta: {
    borderTopWidth: 0.5,
    borderTopColor: '#2d4a2d',
    paddingTop: 8,
  },
  metaText: {
    fontSize: 10,
    color: '#3a5a3a',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: '#1e3a1e',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#74c476',
    borderRadius: 2,
  },
});