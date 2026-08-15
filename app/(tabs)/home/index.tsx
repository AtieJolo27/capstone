import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/app/lib/AppContext';
import { useThemeColors } from '@/app/lib/useThemeColors';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as Progress from 'react-native-progress';
import { exportSensorReadingsPdf } from '../../../lib/exportSensorReadings';
import { supabase } from '../../../lib/supabaseClient';
import Urgent_Card from '../../components/UrgentCard';

export default function index() {
  const { t } = useApp();
  const colors = useThemeColors();

  const [modalVisible, setModalVisibility] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('sensor_readings')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sensor_readings' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  async function fetchData() {
    const { data: fetchedData, error } = await supabase.from('sensor_readings').select("*")
    setData(fetchedData ?? []);
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const { data: readings, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      await exportSensorReadingsPdf(readings ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to export sensor readings.';
      Alert.alert('Export failed', message);
    } finally {
      setIsExporting(false);
    }
  }

  const getSensorValue = (field: string, defaultValue: string = '--') => {
    if (!data || data.length === 0) return defaultValue;
    const latestRecord = data[data.length - 1];
    return latestRecord[field] !== undefined && latestRecord[field] !== null
      ? String(latestRecord[field])
      : defaultValue;
  };

  const getProgressValue = (value: any, maxValue: number): number => {
    if (value === null || value === undefined) return 0;
    const numValue = parseFloat(String(value));
    return isNaN(numValue) ? 0 : Math.min(numValue / maxValue, 1);
  };


  return (
    <ScrollView
      className="flex-1 px-7 py-5"
      contentContainerStyle={{ paddingBottom: 40 }}
      style={{ backgroundColor: colors.bg }}
    >
      <View>
        <View className="mt-4">
          <Text className="text-lg font-bold" style={{ color: colors.subText }}>
            {t('FIELD ZONES', 'SONA NG LARANGAN')}
          </Text>
        </View>
        <View className="flex flex-row justify-between gap-2 mt-4">
          <TouchableOpacity className="bg-green-600 w-1/3 border border-gray-600 rounded-2xl h-13 p-4">
            <Text className="text-md font-bold text-gray-800 text-center">Zone A</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-green-600 w-1/3 border border-gray-600 rounded-2xl h-13 p-4">
            <Text className="text-md font-bold text-gray-800 text-center">Zone B</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-green-600 w-1/3 border border-gray-600 rounded-2xl h-13 p-4">
            <Text className="text-md font-bold text-gray-800 text-center">Zone C</Text>
          </TouchableOpacity>
        </View>
        <View className="my-2">
          <Text className="text-md font-bold mt-4" style={{ color: colors.subText }}>
            {t('Zone A - Rice Field', 'Sona A - Palayan')}
          </Text>
        </View>
        <View className="my-2">
          <Text className="text-lg font-bold" style={{ color: colors.subText }}>
            {t('SOIL HEALTH SCORE', 'SKOR NG KALUSUGAN NG LUPA')}
          </Text>
        </View>
        <View className="border rounded-2xl h-13 p-4" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
          <View>
            <TouchableOpacity onPress={() => setModalVisibility(true)}>
              <Ionicons name="alert-circle-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View className="flex flex-row justify-between gap-2 mt-2">
            <View>
              <AnimatedCircularProgress
                size={71}
                width={4}
                fill={89}
                tintColor="#008000"
                onAnimationComplete={() => console.log('onAnimationComplete')}
                backgroundColor="#738f52"
              >
                {(percentage: number) => (
                  <Text className="text-2xl font-bold text-center" style={{ color: colors.text }}>
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
                <Text className="text-md font-bold text-center" style={{ color: colors.subText }}>
                  {t('Good', 'Mabuti')}
                </Text>
                <Text className="text-md font-bold text-center" style={{ color: colors.subText }}>3.2</Text>
                <Text className="text-md font-bold text-center" style={{ color: colors.subText }}>
                  {t('Medium', 'Katamtaman')}
                </Text>
                <Text className="text-md font-bold text-center" style={{ color: colors.subText }}>
                  {t('Ready for Planting', 'Handa na sa Pagtatanim')}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="my-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold" style={{ color: colors.subText }}>
              {t('LIVE SENSOR READINGS', 'BASA NG SENSOR')}
            </Text>
            <TouchableOpacity
              accessibilityLabel="Export sensor readings as PDF"
              disabled={isExporting}
              onPress={handleExport}
              style={{ opacity: isExporting ? 0.55 : 1 }}
              className="flex-row items-center rounded-lg bg-green-700 px-3 py-2"
            >
              <Ionicons name="download-outline" size={18} color="white" />
              <Text className="ml-1 font-bold text-white">
                {isExporting ? t('Exporting...', 'Ini-export...') : t('Export PDF', 'I-export ang PDF')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex flex-row gap-2 py-2">
          <SensorCard
            colors={colors}
            icon="water-outline"
            label={t('Soil Moisture', 'Halumigmig ng Lupa')}
            value={`${getSensorValue('soil_moisture', '--')}%`}
            opt="70-75%"
            progress={getProgressValue(getSensorValue('soil_moisture', '0'), 100)}
          />
          <SensorCard
            colors={colors}
            icon="thermometer-outline"
            label={t('Soil Temperature', 'TemperaturA ng Lupa')}
            value={`${getSensorValue('soil_temperature', '--')}°C`}
            opt="20-30°C"
            progress={getProgressValue(getSensorValue('soil_temperature', '0'), 50)}
          />
          <SensorCard
            colors={colors}
            icon="analytics-outline"
            label={t('Soil pH', 'Antas ng pH')}
            value={`${getSensorValue('ph', '--')}`}
            opt="6.0-7.5"
            progress={getProgressValue(getSensorValue('ph', '0'), 14)}
          />
        </View>
        <View className="flex flex-row gap-2 py-2">
          <SensorCard
            colors={colors}
            icon="flash-outline"
            label={t('Nitrogen', 'Nitrogen')}
            value={`${getSensorValue('nitrogen', '--')} ppm`}
            opt="20-40 ppm"
            progress={getProgressValue(getSensorValue('nitrogen', '0'), 100)}
          />
          <SensorCard
            colors={colors}
            icon="flower-outline"
            label={t('Phosphorus', 'Phosphorus')}
            value={`${getSensorValue('phosphorus', '--')} ppm`}
            opt="10-30 ppm"
            progress={getProgressValue(getSensorValue('phosphorus', '0'), 100)}
          />
          <SensorCard
            colors={colors}
            icon="medical-outline"
            label={t('Potassium', 'Potassium')}
            value={`${getSensorValue('potassium', '--')} ppm`}
            opt="100-200 ppm"
            progress={getProgressValue(getSensorValue('potassium', '0'), 300)}
          />
        </View>
      </View>
      <View>
        <View className="my-2">
          <Text className="text-lg font-bold" style={{ color: colors.subText }}>
            {t('URGENT NOTIFICATIONS', 'APURADONG NOTIFIKASYON')}
          </Text>
        </View>
        <Urgent_Card
          field={t('Soil Temperature', 'Temperatura ng Lupa')}
          message={t("Temperature too high, it's 90 degrees", "Masyadong mataas ang temperatura, 90 degrees")}
          date={t('2 days ago', '2 araw ang nakalipas')}
        />
        <Urgent_Card
          field={t('Soil Moisture', 'Halumigmig ng Lupa')}
          message={t("Moisture level too low", "Masyadong mababa ang antas ng kahalumigmigan")}
          date={t('1 day ago', '1 araw ang nakalipas')}
        />
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, padding: 20, justifyContent: 'center' }}>
          <View style={{ backgroundColor: colors.cardBg, borderRadius: 16, padding: 24 }}>
            <TouchableOpacity onPress={() => setModalVisibility(false)} style={{ alignSelf: 'flex-end' }}>
              <Ionicons name="close-circle-outline" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 12 }}>
              {t('Soil Health Details', 'Detalye ng Kalusugan ng Lupa')}
            </Text>
            <Text style={{ color: colors.subText, fontSize: 14, marginTop: 8 }}>
              {t('Your soil is in good condition. Continue monitoring regularly.', 'Ang iyong lupa ay nasa mabuting kondisyon. Patuloy na subaybayan nang regular.')}
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

function SensorCard({ colors, icon, label, value, opt, progress }: {
  colors: ReturnType<typeof useThemeColors>;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  opt: string;
  progress: number;
}) {
  return (
    <View className="border rounded-2xl p-3 flex-1" style={{ backgroundColor: colors.sensorCardBg, borderColor: colors.sensorCardBorder }}>
      <View className="flex flex-col items-center justify-center">
        <Ionicons name={icon} size={17} color={colors.text} />
        <Text className="text-sm" style={{ color: colors.text }}>{label}</Text>
      </View>
      <View className="py-1">
        <Text className="text-xl font-bold text-start" style={{ color: colors.text }}>
          {value}
        </Text>
      </View>
      <View>
        <Text className="text-sm font-bold text-start" style={{ color: colors.mutedText }}>
          Opt: {opt}
        </Text>
        <Progress.Bar
          progress={progress}
          height={5}
          color="rgba(0, 128, 0, 1)"
          unfilledColor="rgba(214, 228, 214, 0.8)"
          borderWidth={0}
          width={75}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({})
