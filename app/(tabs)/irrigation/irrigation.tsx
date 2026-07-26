import { useApp } from '@/app/lib/AppContext';
import { useThemeColors } from '@/app/lib/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CACHE_KEYS, getCache, setCache } from '../../../lib/cache';
import { supabase } from '../../../lib/supabaseClient';

interface SensorReading {
  id: number;
  soil_moisture: number | null;
  soil_temperature: number | null;
  ph: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  created_at: string;
}

interface IrrigationRecommendation {
  id: number;
  moisture: number | null;
  recommendation: string;
  confidence: number;
  created_at: string;
}

const HISTORY_LIMIT = 10;
const OPTIMAL_MOISTURE_MIN = 70;
const OPTIMAL_MOISTURE_MAX = 75;

function buildRecommendation(
  moisture: number | null,
  createdAt: string,
  id: number,
  t: (en: string, tl: string) => string
): IrrigationRecommendation {
  let recommendation = '';
  let confidence = 0;

  if (moisture === null) {
    recommendation = t('No moisture data available', 'Walang available na datos ng halumigmig');
    confidence = 0;
  } else if (moisture < OPTIMAL_MOISTURE_MIN) {
    confidence = Math.min(100, ((OPTIMAL_MOISTURE_MIN - moisture) / OPTIMAL_MOISTURE_MIN) * 100);
    recommendation = t('Needs watering', 'Kailangan ng patubig');
  } else if (moisture > OPTIMAL_MOISTURE_MAX) {
    confidence = Math.min(
      100,
      ((moisture - OPTIMAL_MOISTURE_MAX) / (100 - OPTIMAL_MOISTURE_MAX)) * 100
    );
    recommendation = t('Too wet, avoid watering', 'Sobrang basa, iwasan ang pagpapatubig');
  } else {
    const distanceFromOptimal = Math.min(
      Math.abs(moisture - OPTIMAL_MOISTURE_MIN),
      Math.abs(moisture - OPTIMAL_MOISTURE_MAX)
    );
    confidence = Math.max(0, 100 - distanceFromOptimal * 10);
    recommendation = t('Optimal moisture', 'Optimal na antas ng halumigmig');
  }

  return { id, moisture, recommendation, confidence, created_at: createdAt };
}

export default function Irrigation() {
  const { t, fontScale } = useApp();
  const colors = useThemeColors();
  const fs = (size: number) => Math.round(size * fontScale);

  const [recommendations, setRecommendations] = useState<IrrigationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // skipCache=true is used for realtime-triggered and pull-to-refresh fetches,
  // so a stale cache entry can't shadow a fresh update.
  const fetchIrrigation = useCallback(
    async (skipCache: boolean = false) => {
      try {
        setError(null);

        if (!skipCache) {
          const cached = await getCache<IrrigationRecommendation[]>(
            CACHE_KEYS.IRRIGATION_RECOMMENDATIONS
          );
          if (cached && cached.length > 0) {
            setRecommendations(cached);
            setLoading(false);
            // Fall through to a fresh fetch in the background instead of
            // returning, so realtime data isn't permanently masked by cache.
          }
        }

        const { data, error: fetchError } = await supabase
          .from('sensor_readings')
          .select('id, soil_moisture, created_at')
          .order('created_at', { ascending: false })
          .limit(HISTORY_LIMIT);

        if (fetchError) throw fetchError;

        const fetched = data ?? [];
        const built = fetched.map((row) =>
          buildRecommendation(row.soil_moisture ?? null, row.created_at, row.id, t)
        );

        setRecommendations(built);
        if (built.length > 0) {
          await setCache(CACHE_KEYS.IRRIGATION_RECOMMENDATIONS, built);
        }
      } catch (err: any) {
        console.warn('fetchIrrigation error:', err);
        setError(err.message || 'Failed to fetch irrigation recommendation');

        const cached = await getCache<IrrigationRecommendation[]>(
          CACHE_KEYS.IRRIGATION_RECOMMENDATIONS
        );
        if (cached) {
          setRecommendations(cached);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [t]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIrrigation(true);
  }, [fetchIrrigation]);

  useEffect(() => {
    fetchIrrigation();

    const channel = supabase
      .channel('sensor_readings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sensor_readings' },
        () => {
          fetchIrrigation(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIrrigation]);

  // Loading state
  if (loading && recommendations.length === 0) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.bg }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{ fontSize: fs(14), marginTop: 16, color: colors.subText }}
        >
          {t(
            'Loading irrigation recommendation...',
            'Naglo-load ng rekomendasyon sa patubig...'
          )}
        </Text>
      </View>
    );
  }

  // Error state
  if (error && recommendations.length === 0) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.bg }}
      >
        <Ionicons name="alert-circle-outline" size={64} color="#DC2626" />
        <Text
          style={{
            fontSize: fs(18),
            fontWeight: 'bold',
            marginTop: 16,
            textAlign: 'center',
            color: colors.text,
          }}
        >
          {t('Error Loading Recommendation', 'Error sa Pag-load ng Rekomendasyon')}
        </Text>
        <Text
          style={{
            fontSize: fs(14),
            marginTop: 8,
            textAlign: 'center',
            color: colors.subText,
          }}
        >
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => fetchIrrigation(true)}
          className="mt-6 rounded-xl py-3 px-8"
          style={{ backgroundColor: colors.primary }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: fs(14), color: '#F0FDF4' }}>
            {t('Retry', 'Subukan Muli')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (recommendations.length === 0) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.bg }}
      >
        <Ionicons name="water-outline" size={64} color={colors.greenText} />
        <Text
          style={{
            fontSize: fs(18),
            fontWeight: 'bold',
            marginTop: 16,
            textAlign: 'center',
            color: colors.text,
          }}
        >
          {t('No Data Yet', 'Wala Pang Data')}
        </Text>
        <Text
          style={{
            fontSize: fs(14),
            marginTop: 8,
            textAlign: 'center',
            color: colors.subText,
          }}
        >
          {t(
            'Wait for sensor readings to appear.',
            'Maghintay hanggang lumabas ang mga pagbasa ng sensor.'
          )}
        </Text>
      </View>
    );
  }

  const latest = recommendations[0];
  const history = recommendations.slice(1);

  return (
    <View className="p-5" style={{ backgroundColor: colors.bg, flex: 1 }}>
      <View className="mb-4">
        <Text style={{ fontSize: fs(18), fontWeight: 'bold', color: colors.subText }}>
          {t('Soil Moisture Level', 'Antas ng Halumigmig ng Lupa')}
        </Text>
      </View>

      <View
        className="border rounded-2xl p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
      >
        <View className="items-center gap-2">
          <Text
            style={{
              fontSize: fs(24),
              fontWeight: 'bold',
              color: latest.moisture === null ? colors.subText : colors.text,
            }}
          >
            {latest.moisture === null ? '—' : `${latest.moisture.toFixed(1)}%`}
          </Text>
          <Text style={{ fontSize: fs(14), color: colors.subText }}>
            {t('Moisture %', 'Porsyento ng Halumigmig')}
          </Text>
        </View>
      </View>

      <View className="mt-4">
        <Text style={{ fontSize: fs(18), fontWeight: 'bold', color: colors.subText }}>
          {t('Recommendation', 'Rekomendasyon')}
        </Text>
      </View>

      <View
        className="border rounded-2xl p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
      >
        <View className="items-center gap-2">
          <Text
            style={{
              fontSize: fs(16),
              fontWeight: 'bold',
              color: getRecommendationColor(latest.recommendation),
            }}
          >
            {latest.recommendation}
          </Text>
          <Text style={{ fontSize: fs(14), color: colors.subText }}>
            {t('Confidence', 'Katiyakan')}: {Math.round(latest.confidence)}%
          </Text>
        </View>
      </View>

      <View className="mt-4">
        <Text style={{ fontSize: fs(18), fontWeight: 'bold', color: colors.subText }}>
          {t('Last Updated', 'Huling Update')}
        </Text>
      </View>

      <View
        className="border rounded-2xl p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
      >
        <Text style={{ fontSize: fs(14), color: colors.text }}>
          {new Date(latest.created_at).toLocaleString()}
        </Text>
      </View>

      <View className="mt-4">
        <Text style={{ fontSize: fs(18), fontWeight: 'bold', color: colors.subText }}>
          {t('Recent Readings', 'Kamakailang mga Pagbasa')}
        </Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            className="border rounded-xl p-3 mb-2"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.cardBgAlt,
            }}
          >
            <View className="flex-row justify-between">
              <Text style={{ fontSize: fs(14), color: colors.subText }}>
                {t('Moisture', 'Halumigmig')}:{' '}
                {item.moisture === null ? '—' : `${item.moisture.toFixed(1)}%`}
              </Text>
              <Text style={{ fontSize: fs(14), color: colors.subText }}>
                {t('Time', 'Oras')}: {new Date(item.created_at).toLocaleTimeString()}
              </Text>
            </View>
            <Text
              style={{ fontSize: fs(14), color: colors.text, marginTop: 4 }}
            >
              {item.recommendation}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text
            style={{
              fontSize: fs(13),
              color: colors.subText,
              textAlign: 'center',
              paddingVertical: 8,
            }}
          >
            {t('No earlier readings yet', 'Wala pang naunang pagbasa')}
          </Text>
        }
        scrollEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
}

function getRecommendationColor(recommendation: string): string {
  const lower = recommendation.toLowerCase();
  if (lower.includes('water') || lower.includes('patubig')) {
    return '#3B82F6';
  }
  if (lower.includes('optimal')) {
    return '#22C55E';
  }
  return '#EF4444';
}