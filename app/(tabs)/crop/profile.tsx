import { getCropReasoning, getMatchSummary } from '@/lib/recommendation_reasoning';
import { supabase } from '@/lib/supabaseClient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CropRecommendation {
  crop: string;
  confidence: number;
}

interface CropPrediction {
  id: number;
  best_crop: string;
  recommendations: CropRecommendation[];
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  air_temperature: number;
  humidity: number;
  [key: string]: any;
}

export default function Profile() {
  const { crop } = useLocalSearchParams<{ crop: string }>();
  const [latest, setLatest] = useState<CropPrediction | null>(null);

  useEffect(() => {
    getLatest();
  }, []);

  async function getLatest() {
    const { data, error } = await supabase
      .from('crop_predictions')
      .select()
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.log('error:', error);
      return;
    }
    setLatest(data);
  }

  // gamitin yung crop param kung meron, fallback sa best_crop kung wala
  const activeCrop = crop ?? latest?.best_crop;

  const matchedRec = latest?.recommendations?.find(
    (r) => r.crop.toLowerCase() === activeCrop?.toLowerCase()
  );

  const reasoning = latest && activeCrop ? getCropReasoning(activeCrop, latest) : [];
  const matchSummary = latest && activeCrop ? getMatchSummary(activeCrop, latest) : null;

  console.log('crop param:', crop);
  console.log('activeCrop:', activeCrop);

  return (
    <View className="flex-1 items-center justify-center p-5">
      <Text className="text-lg font-bold mb-1 capitalize">
        {activeCrop ?? 'Loading...'}
      </Text>

      {matchedRec && (
        <Text className="text-sm text-gray-500 mb-3">
          {matchedRec.confidence}% confidence
        </Text>
      )}

      {latest && activeCrop && (
        <View className="w-full bg-gray-50 rounded-xl p-3">
          <Text className="font-bold text-sm text-gray-700 mb-2">
            Why {activeCrop}? ({matchSummary?.matched}/{matchSummary?.total} factors matched)
          </Text>
          {reasoning.map((line, i) => (
            <Text key={i} className="text-xs text-gray-500 mb-1">
              • {line}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({});