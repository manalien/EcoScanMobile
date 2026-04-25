import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Polygon, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import SectionHeader from '../components/SectionHeader';
import SearchBar from '../components/SearchBar';
import AlertCard, { AlertItem } from '../components/AlertCard';
import {
  mockRegionPolygons,
  mockMapAlerts,
  NDVI_COLORS,
  RegionPolygon,
} from '../mock/mapData';

const INDIA_REGION = {
  latitude: 22.5,
  longitude: 80.0,
  latitudeDelta: 22,
  longitudeDelta: 18,
};

const COMPOSITE_OPTIONS = ['Monthly', 'Weekly', 'Yearly'];

// convert mockMapAlerts to AlertItem shape
const alertItems: AlertItem[] = mockMapAlerts.map(a => ({
  alert_id: a.id,
  region: `${a.state}`,
  severity: a.severity as AlertItem['severity'],
  description: a.ndvi_change < -0.2
    ? 'Severe vegetation loss detected'
    : 'Moderate decrease in greenery',
  ndvi_change: a.ndvi_change,
  area_affected: Math.abs(Math.round(a.ndvi_change * 80)),
  created_at: '2h ago',
}));

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionPolygon | null>(null);
  const [activeComposite, setActiveComposite] = useState('Monthly');

  const handleRegionPress = (region: RegionPolygon) => {
    setSelectedRegion(prev => prev?.id === region.id ? null : region);
    const center = {
      latitude: region.coordinates.reduce((s, c) => s + c.latitude, 0) / region.coordinates.length,
      longitude: region.coordinates.reduce((s, c) => s + c.longitude, 0) / region.coordinates.length,
    };
    mapRef.current?.animateToRegion({
      ...center,
      latitudeDelta: 6,
      longitudeDelta: 6,
    }, 600);
  };

  const handleReset = () => {
    setSelectedRegion(null);
    mapRef.current?.animateToRegion(INDIA_REGION, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#0f1a0f" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <SectionHeader title="NDVI MAP" />
        <View style={styles.compositeRow}>
          {COMPOSITE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.compositeBtn, activeComposite === opt && styles.compositeBtnActive]}
              onPress={() => setActiveComposite(opt)}
            >
              <Text style={[styles.compositeBtnText, activeComposite === opt && styles.compositeBtnTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <SearchBar 
        placeholder="Search state or district..."
        style={{ marginHorizontal: 20 }}
      />

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={INDIA_REGION}
          // customMapStyle={darkMapStyle}
        >
          {mockRegionPolygons.map(region => (
            <Polygon
              key={region.id}
              coordinates={region.coordinates}
              fillColor={NDVI_COLORS[region.category] + 'B0'}
              strokeColor={NDVI_COLORS[region.category]}
              strokeWidth={selectedRegion?.id === region.id ? 2.5 : 1}
              tappable
              onPress={() => handleRegionPress(region)}
            />
          ))}

          {mockMapAlerts.map(alert => (
            <Marker
              key={alert.id}
              coordinate={alert.coordinates}
              onPress={() => {
                const region = mockRegionPolygons.find(r => r.id === alert.id);
                if (region) handleRegionPress(region);
              }}
            >
              <View style={[
                styles.markerOuter,
                { borderColor: alert.severity === 'Critical' ? '#e24b4a' : '#f46d43' }
              ]}>
                <View style={[
                  styles.markerInner,
                  { backgroundColor: alert.severity === 'Critical' ? '#e24b4a' : '#f46d43' }
                ]}>
                  <Text style={styles.markerText}>!</Text>
                </View>
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Reset button */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>⊕ India</Text>
        </TouchableOpacity>

        {/* Selected region tooltip */}
        {selectedRegion && (
          <View style={styles.tooltip}>
            <View>
              <Text style={styles.tooltipName}>{selectedRegion.name}</Text>
              <Text style={styles.tooltipSub}>{selectedRegion.zone} · Tap again to dismiss</Text>
            </View>
            <View style={styles.tooltipRight}>
              <Text style={[
                styles.tooltipNDVI,
                { color: selectedRegion.ndvi_change >= 0 ? '#74c476' : '#f46d43' }
              ]}>
                {selectedRegion.ndvi_mean.toFixed(2)}
              </Text>
              <Text style={[
                styles.tooltipChange,
                { color: selectedRegion.ndvi_change >= 0 ? '#4a8a4a' : '#c05030' }
              ]}>
                {selectedRegion.ndvi_change >= 0 ? '+' : ''}
                {selectedRegion.ndvi_change.toFixed(2)} {selectedRegion.ndvi_change >= 0 ? '↑' : '↓'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>NDVI CHANGE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.legendRow}>
            {Object.entries(NDVI_COLORS).map(([key, color]) => (
              <View key={key} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendLabel}>
                  {key.replace('_', ' ').replace('decrease', '−').replace('increase', '+').replace('no change', '~')}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Alerts list */}
      <ScrollView
        style={styles.alertsScroll}
        contentContainerStyle={styles.alertsContent}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <SectionHeader title="ACTIVE ALERTS" />
        {alertItems.map(alert => (
          <AlertCard key={alert.alert_id} alert={alert} />
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Dark map style for Google Maps
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0d1a0d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5a8a52' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f1a0f' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2d4a2d' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#3a5a3a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2e1a' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#3a5a3a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e3a1e' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#4a7a4a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1a2e1a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1a2a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#2a4a6a' }] },
];

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f1a0f' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compositeRow: { flexDirection: 'row', gap: 4 },
  compositeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  compositeBtnActive: {
    backgroundColor: '#2d4a2d',
  },
  compositeBtnText: { fontSize: 11, color: '#5a8a52' },
  compositeBtnTextActive: { color: '#7aad6a' },

  mapContainer: {
    height: Dimensions.get('window').height * 0.38,
    marginHorizontal: 20,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    marginBottom: 10,
  },
  map: { flex: 1 },

  resetBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#1a2e1a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: '#3a6a3a',
  },
  resetBtnText: { fontSize: 11, color: '#7aad6a' },

  tooltip: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(15,26,15,0.95)',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#3a6a3a',
  },
  tooltipName: { fontSize: 13, fontWeight: '500', color: '#d4f0c8', marginBottom: 2 },
  tooltipSub: { fontSize: 10, color: '#5a8a52' },
  tooltipRight: { alignItems: 'flex-end' },
  tooltipNDVI: { fontSize: 18, fontWeight: '500' },
  tooltipChange: { fontSize: 11, marginTop: 1 },

  legend: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1e3a1e',
  },
  legendTitle: {
    fontSize: 10,
    color: '#5a8a52',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  legendRow: { flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLabel: { fontSize: 9, color: '#5a8a52', textTransform: 'capitalize' },

  alertsScroll: { flex: 1 },
  alertsContent: { paddingHorizontal: 20, paddingTop: 12 },

  markerOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,26,15,0.6)',
  },
  markerInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: { fontSize: 11, fontWeight: '700', color: 'white' },
});