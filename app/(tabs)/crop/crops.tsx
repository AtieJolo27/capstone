import BestCrop from '@/app/components/BestCrop';
import Recommended_Crops from '@/app/components/RecommendedCrops';
import { useThemeColors } from '@/app/lib/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '@/app/lib/AppContext';
import { supabase } from '../../../lib/supabaseClient';
import { setCache, getCache, CACHE_KEYS } from '../../../lib/cache';

interface CropRecommendation {
  crop: string;
  confidence: number;
}

interface CropPrediction {
  id: number;
  best_crop: string;
  recommendations: CropRecommendation[];
  [key: string]: any;
}

export default function Crops() {
  const { t } = useApp();
  const colors = useThemeColors();
  const [crops, setCrops] = useState<CropPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const getCrops = useCallback(async () => {
    try {
      setError(null);

      // Try cache first
      const cached = await getCache<CropPrediction[]>(CACHE_KEYS.CROP_PREDICTIONS);
      if (cached && cached.length > 0) {
        setCrops(cached);
        setLoading(false);
      }

      const { data, error: fetchError } = await supabase
        .from('crop_predictions')
        .select()
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const fetched = data ?? [];
      setCrops(fetched);

      // Update cache in background
      if (fetched.length > 0) {
        await setCache(CACHE_KEYS.CROP_PREDICTIONS, fetched);
      }
    } catch (err: any) {
      console.warn('getCrops error:', err);
      setError(err.message || 'Failed to fetch crop recommendations');
      // Keep stale cache if available
      if (crops.length === 0) {
        const cached = await getCache<CropPrediction[]>(CACHE_KEYS.CROP_PREDICTIONS);
        if (cached) {
          setCrops(cached);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    getCrops();

    const channel = supabase
      .channel('crop_predictions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crop_predictions' },
        (payload) => {
          console.log('Changes Detected', payload);
          getCrops();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getCrops]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getCrops();
  }, [getCrops]);

  // Loading state
  if (loading && crops.length === 0) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color="#184B44" />
        <Text className="mt-4 text-sm" style={{ color: colors.subText }}>
          {t('Loading crop recommendations...', 'Naglo-load ng mga rekomendasyon sa pananim...')}
        </Text>
      </View>
    );
  }

  // Error state
  if (error && crops.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.bg }}>
        <Ionicons name="alert-circle-outline" size={64} color="#DC2626" />
        <Text className="text-lg font-bold mt-4 text-center" style={{ color: colors.text }}>
          {t('Error Loading Crops', 'Error sa Pag-load ng mga Pananim')}
        </Text>
        <Text className="text-sm mt-2 text-center" style={{ color: colors.subText }}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={getCrops}
          className="mt-6 bg-[#184B44] rounded-xl py-3 px-8"
        >
          <Text className="text-white font-bold">
            {t('Retry', 'Subukan Muli')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (crops.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.bg }}>
        <Ionicons name="leaf-outline" size={64} color={colors.mutedText} />
        <Text className="text-lg font-bold mt-4 text-center" style={{ color: colors.text }}>
          {t('No Recommendations Yet', 'Wala Pang Rekomendasyon')}
        </Text>
        <Text className="text-sm mt-2 text-center" style={{ color: colors.subText }}>
          {t(
            'Submit soil sensor readings to get crop recommendations.',
            'Magsumite ng mga pagbasa ng sensor ng lupa para makakuha ng mga rekomendasyon sa pananim.'
          )}
        </Text>
      </View>
    );
  }

  const latest = crops[0];

  const sortedRecs = [...(latest?.recommendations ?? [])]
    .filter((r) => r.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);

  const bestRec = sortedRecs[0];
  const otherRecs = sortedRecs.slice(1);

  return (
    <View
      className="p-5"
      style={{ backgroundColor: colors.bg, flex: 1 }}
    >
      {latest && bestRec && (
        <BestCrop
          crop_name={latest.best_crop}
          percentage={Math.round(bestRec.confidence)}
        />
      )}

      <View className="mt-4 mb-2">
        <Text className="text-lg font-bold" style={{ color: colors.subText }}>
          {t('Other Recommendations', 'Iba Pang Rekomendasyon')}
        </Text>
      </View>

      <FlatList
        data={otherRecs}
        keyExtractor={(item) => item.crop}
        renderItem={({ item }) => (
          <Recommended_Crops
            crop_name={item.crop}
            percentage={Math.round(item.confidence)}
          />
        )}
        scrollEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text}
            colors={['#184B44']}
          />
        }
      />
    </View>
  );
}

