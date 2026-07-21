import { getSoilHistory, SoilHistoryRow } from '@/lib/getHistory';
import { useApp } from '@/app/lib/AppContext';
import { useThemeColors } from '@/app/lib/useThemeColors';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

type TooltipInfo = {
  x: number;
  y: number;
  value: number;
  label: string;
  date: string;
} | null;

function computeHealthScore(row: SoilHistoryRow): number {
  const moistureScore = Math.max(0, 100 - Math.abs((row.soil_moisture ?? 70) - 72.5) * 3.5);
  const tempScore = Math.max(0, 100 - Math.abs((row.soil_temperature ?? 25) - 25) * 8);
  const phScore = (row.ph >= 6.0 && row.ph <= 7.5)
    ? 100
    : Math.max(0, 100 - Math.abs(row.ph - 6.75) * 40);
  const humidityScore = Math.max(0, 100 - Math.abs((row.humidity ?? 70) - 70) * 2.5);
  const overall = (moistureScore * 0.30 + tempScore * 0.25 + phScore * 0.25 + humidityScore * 0.20);
  return Math.round(Math.max(0, Math.min(100, overall)));
}

function getHealthColor(score: number): string {
  if (score >= 75) return '#16A34A';
  if (score >= 50) return '#EAB308';
  return '#DC2626';
}

function getHealthLabel(score: number): string {
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

export default function SoilHealthChart() {
  const { t, isDarkMode } = useApp();
  const colors = useThemeColors();
  const [history, setHistory] = useState<SoilHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipInfo>(null);

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
        <Text style={{ color: colors.mutedText }}>{t('Loading health history...', 'Naglo-load ng kasaysayan ng kalusugan...')}</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View className="p-5">
        <Text style={{ color: colors.mutedText }}>{t('No historical data yet.', 'Wala pang makasaysayang datos.')}</Text>
      </View>
    );
  }

  const healthScores = history.map((row) => computeHealthScore(row));
  const latestScore = healthScores[healthScores.length - 1];

  const labelStep = Math.max(1, Math.ceil(history.length / 6));
  const labels = history.map((row, i) =>
    i % labelStep === 0
      ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : ''
  );

  const handleDataPointClick = (data: { index: number; value: number; x: number; y: number }) => {
    const index = data.index;
    if (index < 0 || index >= history.length) return;
    const row = history[index];
    const dateStr = new Date(row.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setTooltip({
      x: data.x,
      y: data.y,
      value: data.value,
      label: getHealthLabel(data.value),
      date: dateStr,
    });
  };

  return (
    <View className="p-3">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-bold text-lg" style={{ color: colors.text }}>
          {t('Soil Health Score', 'Iskor ng Kalusugan ng Lupa')}
        </Text>
        <View className="flex-row items-center">
          <View
            className="w-3 h-3 rounded-full mr-1.5"
            style={{ backgroundColor: getHealthColor(latestScore) }}
          />
          <Text className="font-bold text-sm" style={{ color: getHealthColor(latestScore) }}>
            {latestScore}% - {t(getHealthLabel(latestScore), getHealthLabel(latestScore))}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-center mb-3 space-x-4">
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full mr-1" style={{ backgroundColor: '#16A34A' }} />
          <Text style={{ color: colors.mutedText }} className="text-xs">{t('Excellent', 'Napakahusay')} (≥75)</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full mr-1" style={{ backgroundColor: '#EAB308' }} />
          <Text style={{ color: colors.mutedText }} className="text-xs">{t('Fair', 'Katamtaman')} (50-74)</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full mr-1" style={{ backgroundColor: '#DC2626' }} />
          <Text style={{ color: colors.mutedText }} className="text-xs">{t('Poor', 'Mahina')} ({'<'}50)</Text>
        </View>
      </View>

      <View>
        <LineChart
          data={{
            labels,
            datasets: [{ data: healthScores }],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisSuffix="%"
          yAxisInterval={1}
          fromZero={true}
          onDataPointClick={handleDataPointClick}
          chartConfig={{
            backgroundColor: colors.chartBg,
            backgroundGradientFrom: colors.chartBg,
            backgroundGradientTo: colors.chartBg,
            decimalPlaces: 0,
            color: (opacity = 1) => isDarkMode ? `rgba(74, 222, 128, ${opacity})` : `rgba(22, 163, 74, ${opacity})`,
            labelColor: () => colors.chartLabel,
            propsForDots: { r: '4', strokeWidth: '2', stroke: isDarkMode ? '#4ADE80' : '#16A34A' },
            propsForBackgroundLines: { strokeDasharray: '4', stroke: colors.chartGrid },
            propsForVerticalLabels: { fontSize: 10 },
          }}
          bezier
          style={{ borderRadius: 16 }}
        />

        {tooltip && (
          <Svg
            style={{
              position: 'absolute',
              top: -40,
              left: 0,
              width: screenWidth - 40,
              height: 280,
            }}
          >
            <Rect
              x={tooltip.x - 65}
              y={tooltip.y - 50}
              width={130}
              height={42}
              rx={8}
              ry={8}
              fill={getHealthColor(tooltip.value)}
              opacity={0.95}
            />
            <SvgText
              x={tooltip.x}
              y={tooltip.y - 36}
              fill="white"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              {tooltip.value}%
            </SvgText>
            <SvgText
              x={tooltip.x}
              y={tooltip.y - 22}
              fill="white"
              fontSize={10}
              textAnchor="middle"
            >
              {tooltip.label}
            </SvgText>
            <SvgText
              x={tooltip.x}
              y={tooltip.y - 10}
              fill="rgba(255,255,255,0.8)"
              fontSize={8}
              textAnchor="middle"
            >
              {tooltip.date}
            </SvgText>
          </Svg>
        )}
      </View>

      <TouchableOpacity
        onPress={() => setTooltip(null)}
        className="mt-1 self-center"
      >
        <Text className="text-xs" style={{ color: colors.mutedText }}>
          {tooltip ? t('Tap to dismiss', 'I-tap para alisin') : `${t('Last', 'Huling')} ${healthScores.length} ${t('readings', 'pagbasa')}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

