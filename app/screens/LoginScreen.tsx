import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../store/AuthContext';

export default function LoginScreen() {
  const { login, loading, error } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#7aad6a" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#0f1a0f" barStyle="light-content" />
      <View style={styles.topDecoration}>
        <View style={styles.decorCircleLarge} />
        <View style={styles.decorCircleSmall} />
      </View>
      <View style={styles.logoArea}>
        <View style={styles.logoIcon}>
          <View style={styles.logoLeaf} />
        </View>
        <Text style={styles.logoText}>EcoScan</Text>
        <Text style={styles.logoSub}>Greenery Monitoring System</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>28</Text>
          <Text style={styles.statLabel}>States</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>700+</Text>
          <Text style={styles.statLabel}>Districts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>10m</Text>
          <Text style={styles.statLabel}>Resolution</Text>
        </View>
      </View>
      <View style={styles.signInArea}>
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={login}
          activeOpacity={0.8}
        >
          <View style={styles.googleIcon}>
            <Text style={styles.googleG}>G</Text>
          </View>
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>
          By continuing, you agree to EcoScan's terms of use.{'\n'}
          Data sourced from Sentinel-2 via Google Earth Engine.
        </Text>
      </View>
      <View style={styles.bottomTag}>
        <View style={styles.ndviDot} />
        <Text style={styles.bottomTagText}>Powered by Sentinel-2 · NIT Delhi</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0f1a0f',
    justifyContent: 'space-between',
    paddingHorizontal: 28, paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1, backgroundColor: '#0f1a0f',
    alignItems: 'center', justifyContent: 'center',
  },
  topDecoration: { position: 'absolute', top: -60, right: -60 },
  decorCircleLarge: {
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 1, borderColor: '#1e3a1e',
  },
  decorCircleSmall: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 1, borderColor: '#2d4a2d',
    position: 'absolute', top: 40, left: 40,
  },
  logoArea: { alignItems: 'center', marginTop: 60 },
  logoIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: '#1a2e1a', borderWidth: 1,
    borderColor: '#3a6a3a', alignItems: 'center',
    justifyContent: 'center', marginBottom: 16,
  },
  logoLeaf: {
    width: 28, height: 28, borderRadius: 14,
    borderTopRightRadius: 2, backgroundColor: '#74c476',
    transform: [{ rotate: '45deg' }],
  },
  logoText: { fontSize: 36, fontWeight: '500', color: '#d4f0c8', letterSpacing: 1 },
  logoSub: { fontSize: 13, color: '#5a8a52', marginTop: 6, letterSpacing: 0.3 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#1a2e1a',
    borderRadius: 14, borderWidth: 0.5,
    borderColor: '#2d4a2d', paddingVertical: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '500', color: '#74c476' },
  statLabel: { fontSize: 11, color: '#5a8a52', marginTop: 2, letterSpacing: 0.3 },
  statDivider: { width: 0.5, height: 32, backgroundColor: '#2d4a2d' },
  signInArea: { gap: 14 },
  errorBox: {
    backgroundColor: '#2a1010', borderRadius: 10,
    borderWidth: 0.5, borderColor: '#5a2020', padding: 12,
  },
  errorText: { color: '#e24b4a', fontSize: 13, textAlign: 'center' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#ffffff',
    borderRadius: 12, paddingVertical: 14, gap: 10,
  },
  googleIcon: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  googleG: { fontSize: 15, fontWeight: '500', color: '#4285F4' },
  googleBtnText: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  disclaimer: { fontSize: 11, color: '#3a5a3a', textAlign: 'center', lineHeight: 17 },
  bottomTag: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  ndviDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3a6a3a' },
  bottomTagText: { fontSize: 11, color: '#3a5a3a', letterSpacing: 0.3 },
});