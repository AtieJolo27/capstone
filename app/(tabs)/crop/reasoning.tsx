import { supabase } from '@/lib/supabaseClient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

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

export default function Reasoning() {
  const { crop } = useLocalSearchParams<{ crop: string }>();
  const [latest, setLatest] = useState<CropPrediction | null>(null);
  
  // AI State variables
  const [aiResponse, setAiResponse] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);

  // 1. Fetch latest data from Supabase on mount
  useEffect(() => {
    getLatest();
  }, []);

  // 2. Automatically trigger AI when latest data or activeCrop changes
  useEffect(() => {
    const activeCrop = crop ?? latest?.best_crop;
    if (latest && activeCrop) {
      askGroqAutomatically(activeCrop, latest);
    }
  }, [latest, crop]);

  async function getLatest() {
    const { data, error } = await supabase
      .from('crop_predictions')
      .select()
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.log('Supabase error:', error);
      return;
    }
    setLatest(data);
  }

  // 3. Automated AI call formatting nutrients directly into the prompt
  async function askGroqAutomatically(targetCrop: string, data: CropPrediction) {
    setLoadingAI(true);
    setAiResponse(''); // Clear previous response

    // Structured prompt template feeding raw metrics into Groq
    const dynamicPrompt = `

    First, define the ${targetCrop}, its common tagalog term of filipino farmers and its purpose. Put tagalog translation of the sentence too.

      Explain why ${targetCrop} is suitable or the suitability of it
       for a soil with the following environmental metrics:
      - Nitrogen (N): ${data.nitrogen}
      - Phosphorus (P): ${data.phosphorus}
      - Potassium (K): ${data.potassium}
      - pH level: ${data.ph}
      - Air Temperature: ${data.air_temperature}°C
      - Humidity: ${data.humidity}%
      
      Keep the explanation clear, actionable, concise, and focused on why these specific values match the plant's needs. Don't add so much design and formatting, just bullet it. Make it concise so that farmers can quickly understand the suitability of this crop for their soil. Also add tagalog translation of the explanation in  after each english explanation. Separate it with a line break and parentheses. Don't change the terms that have no tagalog translation such as phosphorus, nitrogen, potassium, pH
    `;

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: dynamicPrompt }),
      });
      
      const json = await res.json();
      setAiResponse(json.data || json.error || 'No explanation returned.');
    } catch (err) {
      setAiResponse('Failed to reach AI server backend.');
      console.log('AI fetch error:', err);
    } finally {
      setLoadingAI(false);
    }
  }

  const activeCrop = crop ?? latest?.best_crop;
  const matchedRec = latest?.recommendations?.find(
    (r) => r.crop.toLowerCase() === activeCrop?.toLowerCase()
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text className="text-2xl font-bold mb-1 capitalize">
        {activeCrop ?? 'Loading...'}
      </Text>

      {matchedRec && (
        <Text className="text-sm text-gray-500 mb-5">
          {matchedRec.confidence}% confidence score
        </Text>
      )}

      {/* Raw Soil Metrics Card */}
      {latest && (
        <View className="w-full bg-gray-100 rounded-xl p-4 mb-4">
          <Text className="font-bold text-lg text-gray-700 mb-2">Current Soil Status</Text>
          <Text className="text-sm text-gray-600">N: {latest.nitrogen} | P: {latest.phosphorus} | K: {latest.potassium} | pH: {latest.ph}</Text>
          <Text className="text-sm text-gray-600">Temp: {latest.air_temperature}°C | Humidity: {latest.humidity}%</Text>
        </View>
      )}

      {/* Automated AI Reasoning Section */}
      <View className="w-full bg-orange-50/50 border border-orange-100 rounded-xl p-4">
        <Text className="font-bold text-lg text-orange-800 mb-2">
          ✨ AI Suitability Analysis
        </Text>
        
        {loadingAI ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#f15a24" size="small" />
            <Text style={styles.loadingText}>Analyzing soil nutrient fit...</Text>
          </View>
        ) : (
          <Text className="text-md text-gray-700 leading-relaxed">
            {aiResponse || 'Awaiting metrics to analyze...'}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: 'center', backgroundColor: '#fff' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  loadingText: { marginLeft: 10, fontSize: 13, color: '#666' }
});
