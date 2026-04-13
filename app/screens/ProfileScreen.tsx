import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../store/AuthContext';

export default function ProfileScreen() {
  const { logout } = useAuth();
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.center}>
        <Text style={styles.text}>Profile — coming soon</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Test logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1a0f' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  text: { color: '#5a8a52', fontSize: 14 },
  logoutBtn: {
    borderWidth: 0.5, borderColor: '#3a5a3a',
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8,
  },
  logoutText: { color: '#5a8a52', fontSize: 13 },
});