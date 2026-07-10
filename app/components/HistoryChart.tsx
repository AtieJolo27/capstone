import { getSoilHistory, SoilHistoryRow } from '@/lib/getHistory';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

type Metric = {
  key: keyof SoilHistoryRow;
  label: string;
  unit: string;
  color: string;
};

const METRICS: Metric[] = [
  { key: 'nitrogen', label: 'Nitrogen', unit: 'mg/kg', color: '#2563EB' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg/kg', color: '#7C3AED' },
  { key: 'potassium', label: 'Potassium', unit: 'mg/kg', color: '#DB2777' },
  { key: 'ph', label: 'Soil pH', unit: '', color: '#059669' },
  { key: 'air_temperature', label: 'Air Temp', unit: '°C', color: '#EA580C' },
  { key: 'soil_temperature', label: 'Soil Temp', unit: '°C', color: '#D97706' },
  { key: 'humidity', label: 'Humidity', unit: '%', color: '#0891B2' },
  { key: 'soil_moisture', label: 'Soil Moisture', unit: '%', color: '#16A34A' },
];

const screenWidth = Dimensions.get('window').width;

export default function NutrientHistoryChart() {
  const [history, setHistory] = useState<SoilHistoryRow[]>([]);
  const [selected, setSelected] = useState<Metric>(METRICS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getSoilHistory(30);
      setHistory(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View className="p-5">
        <Text className="text-gray-400">Loading history...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View className="p-5">
        <Text className="text-gray-400">No historical data yet.</Text>
      </View>
    );
  }

  const values = history.map((row) => Number(row[selected.key]));

  // show every Nth label so the x-axis doesn't get crowded
  const labelStep = Math.max(1, Math.ceil(history.length / 6));
  const labels = history.map((row, i) =>
    i % labelStep === 0
      ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : ''
  );

  return (
    <View className="p-3">
      <Text className="font-bold text-lg text-gray-800 mb-2">Nutrient & Soil History</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        {METRICS.map((metric) => (
          <TouchableOpacity
            key={metric.key}
            onPress={() => setSelected(metric)}
            className="mr-2 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: selected.key === metric.key ? metric.color : '#F3F4F6',
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: selected.key === metric.key ? 'white' : '#6B7280' }}
            >
              {metric.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <LineChart
        data={{
          labels,
          datasets: [{ data: values }],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisSuffix={selected.unit}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 1,
          color: (opacity = 1) => selected.color,
          labelColor: () => '#9CA3AF',
          propsForDots: { r: '3', strokeWidth: '1', stroke: selected.color },
        }}
        bezier
        style={{ borderRadius: 16 }}
      />

      <Text className="text-xs text-gray-400 mt-2 text-center">
        Last {history.length} readings
      </Text>
    </View>
  );
}