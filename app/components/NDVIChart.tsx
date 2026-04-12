import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface Props {
  labels: string[];
  values: number[];
  width?: number;
  height?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function NDVIChart({
  labels,
  values,
  width = SCREEN_WIDTH - 40,
  height = 160,
}: Props) {
  return (
    <View style={styles.container}>
      <LineChart
        data={{ labels, datasets: [{ data: values }] }}
        width={width}
        height={height}
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: '#0f1a0f',
          backgroundGradientFrom: '#0f1a0f',
          backgroundGradientTo: '#0f1a0f',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(116, 196, 118, ${opacity})`,
          labelColor: () => '#3a5a3a',
          propsForDots: {
            r: '4',
            strokeWidth: '0',
            fill: '#74c476',
          },
          propsForBackgroundLines: {
            stroke: 'rgba(255,255,255,0.04)',
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines
        withOuterLines={false}
        withShadow={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: -10,
  },
  chart: {
    borderRadius: 10,
  },
});