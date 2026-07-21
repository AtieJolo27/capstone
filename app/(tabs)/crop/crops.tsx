import BestCrop from '@/app/components/BestCrop';
import Recommended_Crops from '@/app/components/RecommendedCrops';
import { useThemeColors } from '@/app/lib/useThemeColors';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useApp } from '@/app/lib/AppContext';
import { supabase } from '../../../lib/supabaseClient';

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

  useEffect(() => {
    getCrops();

    const channel = supabase
      .channel('crop_predictions')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'crop_predictions' },
        (payload) => {
          console.log("Changes Detected", payload)
          getCrops();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  async function getCrops() {
    const { data, error } = await supabase.from('crop_predictions').select();
    console.log('data:', data);
    console.log('error:', error);
    setCrops(data ?? []);
  }

  const latest = crops[0];

  const sortedRecs = [...(latest?.recommendations ?? [])]
    .filter((r) => r.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);

  const bestRec = sortedRecs[0];
  const otherRecs = sortedRecs.slice(1);

  return (
    <View className="p-5" style={{ backgroundColor: colors.bg, flex: 1 }}>
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
      />
    </View>
  );
} 
