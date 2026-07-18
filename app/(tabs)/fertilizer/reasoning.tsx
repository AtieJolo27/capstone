import { supabase } from '@/lib/supabaseClient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface SoilData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  air_temperature: number;
  humidity: number;
}

export default function Reasoning() {
  const { fertilizer } = useLocalSearchParams<{ fertilizer: string }>();

  const [soilData, setSoilData] = useState<SoilData | null>(null);

  const [aiResponse, setAiResponse] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    getLatestSoil();
  }, []);

  useEffect(() => {
    if (soilData && fertilizer) {
      askGroqAutomatically(fertilizer, soilData);
    }
  }, [soilData, fertilizer]);

  async function getLatestSoil() {
    const { data, error } = await supabase
      .from('crop_predictions')
      .select(
        'nitrogen, phosphorus, potassium, ph, air_temperature, humidity'
      )
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setSoilData(data);
  }

  async function askGroqAutomatically(
    targetFertilizer: string,
    data: SoilData
  ) {
    setLoadingAI(true);
    setAiResponse('');

    const dynamicPrompt = `
First, define the ${targetFertilizer} and its purpose. Put tagalog translation too.



      Explain why ${targetFertilizer} is suitable or the suitability of it
       for a soil with the following environmental metrics:
      - Nitrogen (N): ${data.nitrogen}
      - Phosphorus (P): ${data.phosphorus}
      - Potassium (K): ${data.potassium}
      - pH level: ${data.ph}
      - Air Temperature: ${data.air_temperature}°C
      - Humidity: ${data.humidity}%
      
      
      Keep the explanation clear, actionable, concise, and focused on why these specific values match the plant's needs. Don't add so much design and formatting, just bullet it. Make it concise so that farmers can quickly understand the suitability of this fertilizer for their soil. Also add tagalog translation of the explanation in  after each english explanation in this format (Sa tagalog). Separate it with a line break and parentheses. Don't change the terms that have no tagalog translation such as phosphorus, nitrogen, potassium, pH
    `;

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: dynamicPrompt,
        }),
      });

      const json = await res.json();

      setAiResponse(json.data || json.error || 'No explanation returned.');
    } catch (err) {
      console.log(err);
      setAiResponse('Failed to reach AI backend.');
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text className="text-2xl font-bold mb-5 capitalize">
        {fertilizer}
      </Text>

      {soilData && (
        <View className="w-full bg-gray-100 rounded-xl p-4 mb-4">
          <Text className="font-bold text-lg text-gray-700 mb-2">
            Current Soil Status
          </Text>

          <Text className="text-sm text-gray-600">
            N: {soilData.nitrogen} | P: {soilData.phosphorus} | K:{' '}
            {soilData.potassium} | pH: {soilData.ph}
          </Text>

          <Text className="text-sm text-gray-600">
            Temp: {soilData.air_temperature}°C | Humidity:{' '}
            {soilData.humidity}%
          </Text>
        </View>
      )}

      <View className="w-full bg-orange-50 border border-orange-100 rounded-xl p-4">
        <Text className="font-bold text-lg text-orange-800 mb-2">
          ✨ AI Suitability Analysis
        </Text>

        {loadingAI ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#f15a24" />
            <Text style={styles.loadingText}>
              Analyzing soil nutrient fit...
            </Text>
          </View>
        ) : (
          <Text className="text-base text-gray-700">
            {aiResponse || 'Awaiting metrics to analyze...'}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  loadingText: {
    marginLeft: 10,
    fontSize: 13,
    color: '#666',
  },
});