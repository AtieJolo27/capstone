import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/app/lib/AppContext';
import { useThemeColors } from '@/app/lib/useThemeColors';
import { DashboardSkeleton } from '@/app/components/LoadingSkeleton';
import { computeSoilHealthScore } from '@/lib/soilHealthScore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as Progress from 'react-native-progress';
import { supabase } from '../../../lib/supabaseClient';
import Urgent_Card from '../../components/UrgentCard';
import { setCache, getCache, CACHE_KEYS } from '../../../lib/cache';
import { lightHaptic, mediumHaptic, warningHaptic } from '../../../lib/haptics';

type ZoneKey = 'A' | 'B' | 'C';

const ZONES: { key: ZoneKey; labelEn: string; labelTl: string }[] = [
  { key: 'A', labelEn: 'Zone A', labelTl: 'Sona A' },
  { key: 'B', labelEn: 'Zone B', labelTl: 'Sona B' },
  { key: 'C', labelEn: 'Zone C', labelTl: 'Sona C' },
];

const ZONE_LABELS: Record<ZoneKey, { en: string; tl: string }> = {
  A: { en: 'Zone A - Rice Field', tl: 'Sona A - Palayan' },
  B: { en: 'Zone B - Vegetable Plot', tl: 'Sona B - Gulayan' },
  C: { en: 'Zone C - Orchard', tl: 'Sona C - Punuan' },
};

const OPTIMAL_RANGES = {
  soil_moisture: { min: 70, max: 75, unit: '%' },
  soil_temperature: { min: 20, max: 30, unit: '°C' },
  ph: { min: 6.0, max: 7.5, unit: '' },
  nitrogen: { min: 20, max: 40, unit: 'ppm' },
  phosphorus: { min: 10, max: 30, unit: 'ppm' },
  potassium: { min: 100, max: 200, unit: 'ppm' },
} as const;

interface SensorAlert {
  field: string;
  fieldTl: string;
  message: string;
  messageTl: string;
  date: string;
  dateTl: string;
  severity: 'high' | 'medium' | 'low';
}

function computeAlerts(record: any): SensorAlert[] {
  if (!record) return [];

  const alerts: SensorAlert[] = [];
  const now = new Date();
  const recordDate = record.created_at ? new Date(record.created_at) : now;
  const timeAgo = getTimeAgo(recordDate, now);

  // Check soil temperature
  const temp = parseFloat(record.soil_temperature);
  if (!isNaN(temp)) {
    if (temp > OPTIMAL_RANGES.soil_temperature.max + 5) {
      alerts.push({
        field: 'Soil Temperature',
        fieldTl: 'Temperatura ng Lupa',
        message: `Temperature too high (${temp}°C), exceeds optimal range`,
        messageTl: `Masyadong mataas ang temperatura (${temp}°C), lampas sa optimal na antas`,
        date: timeAgo.en,
        dateTl: timeAgo.tl,
        severity: 'high',
      });
    } else if (temp < OPTIMAL_RANGES.soil_temperature.min - 5) {
      alerts.push({
        field: 'Soil Temperature',
        fieldTl: 'Temperatura ng Lupa',
        message: `Temperature too low (${temp}°C), below optimal range`,
        messageTl: `Masyadong mababa ang temperatura (${temp}°C), mababa sa optimal na antas`,
        date: timeAgo.en,
        dateTl: timeAgo.tl,
        severity: 'medium',
      });
    }
  }

  // Check soil moisture
  const moisture = parseFloat(record.soil_moisture);
  if (!isNaN(moisture)) {
    if (moisture < OPTIMAL_RANGES.soil_moisture.min - 10) {
      alerts.push({
        field: 'Soil Moisture',
        fieldTl: 'Halumigmig ng Lupa',
        message: `Moisture level too low (${moisture}%)`,
        messageTl: `Masyadong mababa ang antas ng kahalumigmigan (${moisture}%)`,
        date: timeAgo.en,
        dateTl: timeAgo.tl,
        severity: 'high',
      });
    } else if (moisture > OPTIMAL_RANGES.soil_moisture.max + 10) {
      alerts.push({
        field: 'Soil Moisture',
        fieldTl: 'Halumigmig ng Lupa',
        message: `Moisture level too high (${moisture}%) — risk of waterlogging`,
        messageTl: `Masyadong mataas ang antas ng kahalumigmigan (${moisture}%) — peligro ng pagbaha`,
        date: timeAgo.en,
        dateTl: timeAgo.tl,
        severity: 'medium',
      });
    }
  }

  // Check pH
  const ph = parseFloat(record.ph);
  if (!isNaN(ph)) {
    if (ph < OPTIMAL_RANGES.ph.min - 0.5) {
      alerts.push({
        field: 'Soil pH',
        fieldTl: 'Antas ng pH',
        message: `Soil too acidic (pH ${ph}), below optimal range`,
        messageTl: `Masyadong acidic ang lupa (pH ${ph}), mababa sa optimal na antas`,
        date: timeAgo.en,
        dateTl: timeAgo.tl,
        severity: 'high',
      });
    } else if (ph > OPTIMAL_RANGES.ph.max + 0.5) {
      alerts.push({
        field: 'Soil pH',
        fieldTl: 'Antas ng pH',
        message: `Soil too alkaline (pH ${ph}), above optimal range`,
        messageTl: `Masyadong alkaline ang lupa (pH ${ph}), mataas sa optimal na antas`,
        date: timeAgo.en,
        dateTl: timeAgo.tl,
        severity: 'medium',
      });
    }
  }

  return alerts;
}

function getTimeAgo(date: Date, now: Date): { en: string; tl: string } {
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return { en: 'Just now', tl: 'Ngayon lang' };
  if (diffMins < 60) return { en: `${diffMins} min ago`, tl: `${diffMins} minuto ang nakalipas` };
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return { en: `${diffHours} hr ago`, tl: `${diffHours} oras ang nakalipas` };
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return { en: '1 day ago', tl: '1 araw ang nakalipas' };
  return { en: `${diffDays} days ago`, tl: `${diffDays} araw ang nakalipas` };
}

function computeHealthScore(record: any): { score: number; breakdown: { label: string; score: number; max: number }[]; interpretation?: { en: string; tl: string } } {
  if (!record) return { score: 0, breakdown: [] };

  // Use the scientific formula from lib/soilHealthScore.ts
  const result = computeSoilHealthScore(record);

  const breakdown = result.factors.map((f) => ({
    label: `${f.label} (${f.optimalMin}-${f.optimalMax} ${f.unit})`,
    score: f.score,
    max: 100,
  }));

  return {
    score: result.overall,
    breakdown,
    interpretation: result.interpretation,
  };
}

export default function index() {
  const { t } = useApp();
  const colors = useThemeColors();

  const [modalVisible, setModalVisibility] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ZoneKey>('A');

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      // Try cache first
      const cached = await getCache<any[]>(CACHE_KEYS.SENSOR_READINGS);
      if (cached && cached.length > 0) {
        setData(cached);
        setLoading(false);
      }

      const { data: fetchedData, error: fetchError } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const orderedData = (fetchedData ?? []).reverse();
      setData(orderedData);

      if (orderedData.length > 0) {
        await setCache(CACHE_KEYS.SENSOR_READINGS, orderedData);
      }
    } catch (err: any) {
      console.warn('fetchData error:', err);
      setError(err.message || 'Failed to fetch sensor data');
      if (data.length === 0) {
        const cached = await getCache<any[]>(CACHE_KEYS.SENSOR_READINGS);
        if (cached) {
          setData(cached);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('sensor_readings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sensor_readings' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    lightHaptic();
    fetchData();
  }, [fetchData]);

  const latestRecord = data.length > 0
    ? data.reduce((latest, curr) =>
        new Date(curr.created_at) > new Date(latest.created_at) ? curr : latest
      )
    : null;

  const getSensorValue = (field: string, defaultValue: string = '--') => {
    if (!latestRecord) return defaultValue;
    const value = latestRecord[field];
    return value !== undefined && value !== null ? String(value) : defaultValue;
  };

  const getProgressValue = (value: any, maxValue: number): number => {
    if (value === null || value === undefined) return 0;
    const numValue = parseFloat(String(value));
    return isNaN(numValue) ? 0 : Math.min(numValue / maxValue, 1);
  };

  // Compute dynamic alerts from actual sensor data
  const alerts = computeAlerts(latestRecord);
  // Compute dynamic health score
  const healthInfo = computeHealthScore(latestRecord);

  // If initial loading, show skeleton
  if (loading && data.length === 0) {
    return <DashboardSkeleton />;
  }

  // If error and no data at all, show error state
  if (error && data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.bg }}>
        <Ionicons name="cloud-offline-outline" size={64} color={colors.greenText} />
        <Text className="text-lg font-bold mt-4 text-center" style={{ color: colors.text }}>
          {t('Connection Error', 'Error sa Koneksyon')}
        </Text>
        <Text className="text-sm mt-2 text-center" style={{ color: colors.subText }}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={fetchData}
          className="mt-6 rounded-xl py-3 px-8"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="font-bold" style={{ color: '#F0FDF4' }}>
            {t('Retry', 'Subukan Muli')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const zoneLabel = ZONE_LABELS[selectedZone];
  const totalAlerts = alerts.length;

  return (
    <ScrollView
      className="flex-1 px-7 py-5"
      contentContainerStyle={{ paddingBottom: 100 }}
      style={{ backgroundColor: colors.bg }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary, colors.primaryLight]}
        />
      }
    >
      <View>
        {/* Zone selector */}
        <View className="mt-4">
          <Text className="text-lg font-bold" style={{ color: colors.subText }}>
            {t('FIELD ZONES', 'SONA NG LARANGAN')}
          </Text>
        </View>
        <View className="flex flex-row justify-between gap-2 mt-4">
          {ZONES.map((zone) => {
            const isActive = selectedZone === zone.key;
            return (
              <TouchableOpacity
                key={zone.key}
                onPress={() => {
                  lightHaptic();
                  setSelectedZone(zone.key);
                }}
                className="w-1/3 border rounded-2xl h-13 p-4"
                style={{
                  backgroundColor: isActive ? '#16A34A' : colors.isDarkMode ? '#1A3522' : '#DCFCE7',
                  borderColor: isActive ? '#16A34A' : colors.border,
                  shadowColor: isActive ? '#16A34A' : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isActive ? 0.3 : 0,
                  shadowRadius: 4,
                  elevation: isActive ? 4 : 0,
                }}
                accessibilityRole="button"
                accessibilityLabel={t(`Select ${zone.labelEn}`, `Piliin ang ${zone.labelTl}`)}
              >
                <Text
                  className="text-md font-bold text-center"
                  style={{ color: isActive ? 'white' : colors.text }}
                >
                  {t(zone.labelEn, zone.labelTl)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="my-2">
          <Text className="text-md font-bold mt-4" style={{ color: colors.subText }}>
            {t(zoneLabel.en, zoneLabel.tl)}
          </Text>
        </View>

        {/* Soil Health Score */}
        <View className="my-2">
          <Text className="text-lg font-bold" style={{ color: colors.greenText }}>
            {t('SOIL HEALTH SCORE', 'SKOR NG KALUSUGAN NG LUPA')}
          </Text>
        </View>
        <View
          className="border rounded-2xl h-13 p-4"
          style={{ 
            borderColor: colors.soilCardBorder, 
            backgroundColor: colors.soilCardBg,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => {
                mediumHaptic();
                setModalVisibility(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('View soil health details', 'Tingnan ang detalye ng kalusugan ng lupa')}
            >
              <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: colors.cardBgAlt }}>
              <Text className="text-xs font-bold" style={{ color: colors.primary }}>
                {t('Details', 'Detalye')}
              </Text>
            </View>
          </View>
          <View className="flex flex-row justify-between gap-2 mt-2">
            <View>
              <AnimatedCircularProgress
                size={71}
                width={5}
                fill={healthInfo.score}
                tintColor={healthInfo.score >= 80 ? '#16A34A' : healthInfo.score >= 60 ? '#EAB308' : healthInfo.score >= 40 ? '#F97316' : '#DC2626'}
                onAnimationComplete={() => {}}
                backgroundColor={colors.isDarkMode ? '#1A3522' : '#DCFCE7'}
              >
                {(percentage: number) => (
                  <Text
                    className="text-2xl font-bold text-center"
                    style={{ color: colors.text }}
                  >
                    {Math.round(percentage)}%
                  </Text>
                )}
              </AnimatedCircularProgress>
            </View>
            <View className="flex flex-row gap-5 justify-between">
              <View className="flex flex-col justify-start gap-2">
                <Text className="text-md font-bold" style={{ color: colors.text }}>
                  {t('Soil Type:', 'Uri ng Lupa:')}
                </Text>
                <Text className="text-md font-bold" style={{ color: colors.text }}>
                  {t('Organic Matter:', 'Organikong Bagay:')}
                </Text>
                <Text className="text-md font-bold" style={{ color: colors.text }}>
                  {t('Texture:', 'Tekstura:')}
                </Text>
                <Text className="text-md font-bold" style={{ color: colors.text }}>
                  {t('Status:', 'Katayuan:')}
                </Text>
              </View>
              <View className="flex flex-col justify-start gap-2">
                <Text className="text-md font-bold text-center" style={{ color: colors.greenText }}>
                  {t('Good', 'Mabuti')}
                </Text>
                <Text className="text-md font-bold text-center" style={{ color: colors.greenText }}>3.2</Text>
                <Text className="text-md font-bold text-center" style={{ color: colors.greenText }}>
                  {t('Medium', 'Katamtaman')}
                </Text>
                <Text className="text-md font-bold text-center" style={{ color: colors.greenText }}>
                  {t('Ready for Planting', 'Handa na sa Pagtatanim')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Live Sensor Readings */}
        <View className="my-2">
          <Text className="text-lg font-bold" style={{ color: colors.subText }}>
            {t('LIVE SENSOR READINGS', 'BASA NG SENSOR')}
          </Text>
        </View>
        <View className="flex flex-row gap-2 py-2">
          <SensorCard
            colors={colors}
            icon="water-outline"
            label={t('Soil Moisture', 'Halumigmig ng Lupa')}
            value={`${getSensorValue('soil_moisture', '--')}%`}
            opt={`${OPTIMAL_RANGES.soil_moisture.min}-${OPTIMAL_RANGES.soil_moisture.max}%`}
            progress={getProgressValue(getSensorValue('soil_moisture', '0'), 100)}
          />
          <SensorCard
            colors={colors}
            icon="thermometer-outline"
            label={t('Soil Temperature', 'TemperaturA ng Lupa')}
            value={`${getSensorValue('soil_temperature', '--')}°C`}
            opt={`${OPTIMAL_RANGES.soil_temperature.min}-${OPTIMAL_RANGES.soil_temperature.max}°C`}
            progress={getProgressValue(getSensorValue('soil_temperature', '0'), 50)}
          />
          <SensorCard
            colors={colors}
            icon="analytics-outline"
            label={t('Soil pH', 'Antas ng pH')}
            value={`${getSensorValue('ph', '--')}`}
            opt={`${OPTIMAL_RANGES.ph.min}-${OPTIMAL_RANGES.ph.max}`}
            progress={getProgressValue(getSensorValue('ph', '0'), 14)}
          />
        </View>
        <View className="flex flex-row gap-2 py-2">
          <SensorCard
            colors={colors}
            icon="flash-outline"
            label={t('Nitrogen', 'Nitrogen')}
            value={`${getSensorValue('nitrogen', '--')} ppm`}
            opt={`${OPTIMAL_RANGES.nitrogen.min}-${OPTIMAL_RANGES.nitrogen.max} ppm`}
            progress={getProgressValue(getSensorValue('nitrogen', '0'), 100)}
          />
          <SensorCard
            colors={colors}
            icon="flower-outline"
            label={t('Phosphorus', 'Phosphorus')}
            value={`${getSensorValue('phosphorus', '--')} ppm`}
            opt={`${OPTIMAL_RANGES.phosphorus.min}-${OPTIMAL_RANGES.phosphorus.max} ppm`}
            progress={getProgressValue(getSensorValue('phosphorus', '0'), 100)}
          />
          <SensorCard
            colors={colors}
            icon="medical-outline"
            label={t('Potassium', 'Potassium')}
            value={`${getSensorValue('potassium', '--')} ppm`}
            opt={`${OPTIMAL_RANGES.potassium.min}-${OPTIMAL_RANGES.potassium.max} ppm`}
            progress={getProgressValue(getSensorValue('potassium', '0'), 300)}
          />
        </View>
      </View>

      {/* Urgent Notifications — Dynamic from sensor data */}
      <View>
        <View className="my-2 flex-row items-center justify-between">
          <Text className="text-lg font-bold" style={{ color: colors.subText }}>
            {t('URGENT NOTIFICATIONS', 'APURADONG NOTIFIKASYON')}
          </Text>
          {totalAlerts > 0 && (
            <View className="bg-red-500 rounded-full px-2 py-0.5">
              <Text className="text-white text-xs font-bold">{totalAlerts}</Text>
            </View>
          )}
        </View>

        {alerts.length === 0 ? (
          <View
            className="border rounded-2xl p-4"
            style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
          >
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
              <Text className="ml-2 font-medium" style={{ color: colors.text }}>
                {t('No alerts — all sensors within optimal range', 'Walang alerto — lahat ng sensor ay nasa optimal na antas')}
              </Text>
            </View>
          </View>
        ) : (
          alerts.map((alert, index) => (
            <Urgent_Card
              key={index}
              field={t(alert.field, alert.fieldTl)}
              message={t(alert.message, alert.messageTl)}
              date={t(alert.date, alert.dateTl)}
              severity={alert.severity}
            />
          ))
        )}
      </View>

      {/* Soil Health Detail Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            flex: 1,
            padding: 20,
            justifyContent: 'center',
          }}
        >
          <View
            style={{ 
              backgroundColor: colors.cardBg, 
              borderRadius: 20, 
              padding: 24,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                mediumHaptic();
                setModalVisibility(false);
              }}
              style={{ alignSelf: 'flex-end' }}
              accessibilityRole="button"
              accessibilityLabel={t('Close', 'Isara')}
            >
              <Ionicons name="close-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
            <View className="flex-row items-center mb-4 mt-2">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.cardBgAlt }}>
                <Ionicons name="leaf-outline" size={20} color={colors.primary} />
              </View>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                {t('Soil Health Score Breakdown', 'Paghiwa-hiwalay ng Skor ng Kalusugan ng Lupa')}
              </Text>
            </View>

            {healthInfo.breakdown.map((item, index) => (
              <View key={index} className="mt-4">
                <View className="flex-row justify-between mb-1">
                  <Text style={{ color: colors.subText, fontSize: 13 }}>{item.label}</Text>
                  <Text
                    style={{
                      color: item.score >= 75 ? colors.primary : item.score >= 50 ? '#EAB308' : '#DC2626',
                      fontWeight: 'bold',
                      fontSize: 13,
                    }}
                  >
                    {item.score}/{item.max}
                  </Text>
                </View>
                <Progress.Bar
                  progress={item.score / item.max}
                  height={8}
                  color={item.score >= 80 ? colors.primary : item.score >= 60 ? '#EAB308' : item.score >= 40 ? '#F97316' : '#DC2626'}
                  unfilledColor={colors.progressTrack}
                  borderWidth={0}
                  width={null}
                  borderRadius={4}
                />
              </View>
            ))}

            <View className="mt-6 pt-4" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text className="font-bold text-center text-lg" style={{ color: colors.text }}>
                {t('Overall Score', 'Kabuuang Skor')}: {healthInfo.score}%
              </Text>
              <Text className="text-center text-sm mt-1" style={{ color: colors.subText }}>
                {t(
                  healthInfo.interpretation?.en || 'Your soil condition is being evaluated based on 6 key parameters.',
                  healthInfo.interpretation?.tl || 'Ang kondisyon ng iyong lupa ay sinusuri batay sa 6 na pangunahing parameter.'
                )}
              </Text>
              <Text className="text-center text-xs mt-2" style={{ color: colors.greenText }}>
                {t('Score based on N, P, K, pH, temperature & humidity', 'Skor batay sa N, P, K, pH, temperatura at halumigmig')}
              </Text>
              <Text className="text-center text-xs" style={{ color: colors.greenText }}>
                {t('Each factor scored against general crop optimal ranges', 'Bawat factor ay isinama laban sa general optimal range ng pananim')}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function SensorCard({
  colors,
  icon,
  label,
  value,
  opt,
  progress,
}: {
  colors: ReturnType<typeof useThemeColors>;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  opt: string;
  progress: number;
}) {
  return (
    <View
      className="border rounded-2xl p-3 flex-1"
      style={{
        backgroundColor: colors.sensorCardBg,
        borderColor: colors.sensorCardBorder,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
      }}
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}, optimal range: ${opt}`}
    >
      <View className="flex flex-col items-center justify-center">
        <View className="w-8 h-8 rounded-full items-center justify-center mb-1" style={{ backgroundColor: colors.cardBgAlt }}>
          <Ionicons name={icon} size={16} color={colors.primary} />
        </View>
        <Text className="text-xs font-semibold" style={{ color: colors.subText }}>
          {label}
        </Text>
      </View>
      <View className="py-1">
        <Text
          className="text-xl font-bold text-start"
          style={{ color: colors.text }}
        >
          {value}
        </Text>
      </View>
      <View>
        <Text className="text-xs font-semibold text-start" style={{ color: colors.greenText }}>
          Opt: {opt}
        </Text>
        <Progress.Bar
          progress={progress}
          height={5}
          color={colors.primary}
          unfilledColor={colors.isDarkMode ? '#1A3522' : '#DCFCE7'}
          borderWidth={0}
          width={75}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});

