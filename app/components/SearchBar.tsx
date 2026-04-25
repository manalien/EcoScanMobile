import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  placeholder?: string;
  onPress?: () => void;
  style?: object;
}

export default function SearchBar({
  placeholder = 'Search regions, districts...',
  onPress,
  style
}: Props) {
  return (
    <TouchableOpacity style={[styles.container, style]} activeOpacity={0.7} onPress={onPress}>
      <Text style={styles.text}>{placeholder}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a2e1a',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 0.5,
    borderColor: '#2d4a2d',
    marginBottom: 20,
  },
  text: {
    fontSize: 13,
    color: '#5a8a52',
  },
});