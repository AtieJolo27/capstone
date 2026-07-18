import BestFertilizer from '@/app/components/BestFertilizer';
import RecommendedFertilizer from '@/app/components/RecommendedFertilizer';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { supabase } from '../../../lib/supabaseClient';

interface FertilizerRecommendation {
  fertilizer: string;
  confidence: number;
}

interface FertilizerPrediction {
  id: number;
  best_fertilizer: string;
  recommendations: FertilizerRecommendation[];
  [key: string]: any;
}

export default function Fertilizers() {
  const [fertilizers, setFertilizers] = useState<FertilizerPrediction[]>([]);

  useEffect(() => {
    getFertilizers();

    const channel = supabase
      .channel('fertilizer_predictions')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'fertilizer_predictions' },
        (payload) => {
          console.log("Changes Detected", payload)
          getFertilizers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  async function getFertilizers() {
    const { data, error } = await supabase.from('fertilizer_predictions').select();
    console.log('data:', data);
    console.log('error:', error);
    setFertilizers(data ?? []);
  }

  // assuming one active reading — grab the latest row
  const latest = fertilizers[0];

  const sortedRecs = [...(latest?.recommendations ?? [])]
    .filter((r) => r.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);

  const bestRec = sortedRecs[0];
  const otherRecs = sortedRecs.slice(1);

  return (
    <View className="p-5">
      {latest && bestRec && (
        <BestFertilizer
          fertilizer_name={latest.best_fertilizer}
          percentage={Math.round(bestRec.confidence)}
        />
      )}

      <View className="mt-4 mb-2">
        <Text className="text-lg font-bold text-gray-600">Other Recommendations</Text>
      </View>

      <FlatList
        data={otherRecs}
        keyExtractor={(item) => item.fertilizer}
        renderItem={({ item }) => (
          <RecommendedFertilizer
            fertilizer_name={item.fertilizer}
            percentage={Math.round(item.confidence)}
          />
        )}
        scrollEnabled={false}
      />
    </View>
  );
} 