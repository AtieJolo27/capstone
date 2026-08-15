import { supabase } from '@/lib/supabaseClient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/app/lib/AppContext';
import { useThemeColors } from '@/app/lib/useThemeColors';

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
  const { t, language } = useApp();
  const colors = useThemeColors();
  const { crop } = useLocalSearchParams<{ crop: string }>();
  const [latest, setLatest] = useState<CropPrediction | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);

  useEffect(() => {
    getLatest();
  }, []);

  useEffect(() => {
    const activeCrop = crop ?? latest?.best_crop;
    if (latest && activeCrop) {
      askGroqAutomatically(activeCrop, latest);
    }
  }, [latest, crop, language]);

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

  async function askGroqAutomatically(targetCrop: string, data: CropPrediction) {
    setLoadingAI(true);
    setAiResponse('');

    const responseLanguage = language === 'tagalog'
      ? `Respond entirely in Tagalog (Filipino). Use Filipino farming terms where appropriate.`
      : `Respond entirely in English.`;

    const dynamicPrompt = `
    First, define what ${targetCrop} is and its purpose for farming.

      Explain why ${targetCrop} is suitable or the suitability of it
       for a soil with the following environmental metrics:
      - Nitrogen (N): ${data.nitrogen}
      - Phosphorus (P): ${data.phosphorus}
      - Potassium (K): ${data.potassium}
      - pH level: ${data.ph}
      - Air Temperature: ${data.air_temperature}°C
      - Humidity: ${data.humidity}%
      
      Keep the explanation clear, actionable, concise, and focused on why these specific values match the plant's needs. Don't add so much design and formatting, just bullet it. Make it concise so that farmers can quickly understand the suitability of this crop for their soil.
      
      CRITICAL: ${responseLanguage} Do NOT provide bilingual or dual-language responses. Use ONLY the specified language. Don't change terms that have no direct translation such as phosphorus, nitrogen, potassium, pH.
    `;

    try {
      const res = await fetch('http://192.168.1.19:8081/api/groq', {
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
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.bg }]}>
      <Text className="text-2xl font-bold mb-1 capitalize" style={{ color: colors.text }}>
        {activeCrop ?? t('Loading...', 'Naglo-load...')}
      </Text>

      {matchedRec && (
        <Text className="text-sm mb-5" style={{ color: colors.mutedText }}>
          {matchedRec.confidence}% {t('confidence score', 'puntos ng kumpiyansa')}
        </Text>
      )}

      {latest && (
        <View className="w-full rounded-xl p-4 mb-4" style={{ backgroundColor: colors.soilCardBg }}>
          <Text className="font-bold text-lg mb-2" style={{ color: colors.text }}>
            {t('Current Soil Status', 'Kasalukuyang Katayuan ng Lupa')}
          </Text>
          <Text className="text-sm" style={{ color: colors.subText }}>
            N: {latest.nitrogen} | P: {latest.phosphorus} | K: {latest.potassium} | pH: {latest.ph}
          </Text>
          <Text className="text-sm" style={{ color: colors.subText }}>
            {t('Temp', 'Temp')}: {latest.air_temperature}°C | {t('Humidity', 'Halumigmig')}: {latest.humidity}%
          </Text>
        </View>
      )}

      <View className="w-full rounded-xl p-4" style={{ backgroundColor: isDark(colors) ? '#2D1F14' : '#FFF7ED', borderColor: isDark(colors) ? '#4A2D1A' : '#FFEDD5', borderWidth: 1 }}>
        <Text className="font-bold text-lg mb-2" style={{ color: isDark(colors) ? '#FDBA74' : '#9A3412' }}>
          ✨ {t('AI Suitability Analysis', 'Pagsusuri ng Kaangkupan ng AI')}
        </Text>
        
        {loadingAI ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#f15a24" size="small" />
            <Text style={styles.loadingText}>{t('Analyzing soil nutrient fit...', 'Sinusuri ang akma ng nutrisyon ng lupa...')}</Text>
          </View>
        ) : (
          <Text className="text-md leading-relaxed" style={{ color: colors.subText }}>
            {aiResponse || t('Awaiting metrics to analyze...', 'Naghihintay ng sukatan para suriin...')}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

function isDark(colors: ReturnType<typeof useThemeColors>) {
  return colors.isDarkMode;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: 'center' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  loadingText: { marginLeft: 10, fontSize: 13, color: '#666' }
});
