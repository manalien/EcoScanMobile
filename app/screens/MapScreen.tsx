import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.center}>
        <Text style={styles.text}>Map — coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1a0f' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#5a8a52', fontSize: 14 },
});