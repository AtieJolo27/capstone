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
import { useApp } from '@/app/lib/AppContext';
import { useThemeColors } from '@/app/lib/useThemeColors';

interface SoilData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  air_temperature: number;
  humidity: number;
}

export default function Reasoning() {
  const { t, language } = useApp();
  const colors = useThemeColors();
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
  }, [soilData, fertilizer, language]);

  async function getLatestSoil() {
    const { data, error } = await supabase
      .from('crop_predictions')
      .select('nitrogen, phosphorus, potassium, ph, air_temperature, humidity')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setSoilData(data);
  }

  async function askGroqAutomatically(targetFertilizer: string, data: SoilData) {
    setLoadingAI(true);
    setAiResponse('');

    const responseLanguage = language === 'tagalog'
      ? `Respond entirely in Tagalog (Filipino). Use Filipino farming terms where appropriate.`
      : `Respond entirely in English.`;

    const dynamicPrompt = `
First, define what ${targetFertilizer} is and its purpose for farming.

      Explain why ${targetFertilizer} is suitable or the suitability of it
       for a soil with the following environmental metrics:
      - Nitrogen (N): ${data.nitrogen}
      - Phosphorus (P): ${data.phosphorus}
      - Potassium (K): ${data.potassium}
      - pH level: ${data.ph}
      - Air Temperature: ${data.air_temperature}°C
      - Humidity: ${data.humidity}%
      
      Keep the explanation clear, actionable, concise, and focused on why these specific values match the plant's needs. Don't add so much design and formatting, just bullet it. Make it concise so that farmers can quickly understand the suitability of this fertilizer for their soil.
      
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
      console.log(err);
      setAiResponse('Failed to reach AI backend.');
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.bg }]}>
      <Text className="text-2xl font-bold mb-5 capitalize" style={{ color: colors.text }}>
        {fertilizer}
      </Text>

      {soilData && (
        <View className="w-full rounded-xl p-4 mb-4" style={{ backgroundColor: colors.soilCardBg }}>
          <Text className="font-bold text-lg mb-2" style={{ color: colors.text }}>
            {t('Current Soil Status', 'Kasalukuyang Katayuan ng Lupa')}
          </Text>

          <Text className="text-sm" style={{ color: colors.subText }}>
            N: {soilData.nitrogen} | P: {soilData.phosphorus} | K: {soilData.potassium} | pH: {soilData.ph}
          </Text>

          <Text className="text-sm" style={{ color: colors.subText }}>
            {t('Temp', 'Temp')}: {soilData.air_temperature}°C | {t('Humidity', 'Halumigmig')}: {soilData.humidity}%
          </Text>
        </View>
      )}

      <View className="w-full rounded-xl p-4" style={{ backgroundColor: colors.isDarkMode ? '#2D1F14' : '#FFF7ED', borderColor: colors.isDarkMode ? '#4A2D1A' : '#FFEDD5', borderWidth: 1 }}>
        <Text className="font-bold text-lg mb-2" style={{ color: colors.isDarkMode ? '#FDBA74' : '#9A3412' }}>
          ✨ {t('AI Suitability Analysis', 'Pagsusuri ng Kaangkupan ng AI')}
        </Text>

        {loadingAI ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#f15a24" />
            <Text style={[styles.loadingText, { color: colors.mutedText }]}>
              {t('Analyzing soil nutrient fit...', 'Sinusuri ang akma ng nutrisyon ng lupa...')}
            </Text>
          </View>
        ) : (
          <Text className="text-base leading-relaxed" style={{ color: colors.subText }}>
            {aiResponse || t('Awaiting metrics to analyze...', 'Naghihintay ng sukatan para suriin...')}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: 'center' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  loadingText: { marginLeft: 10, fontSize: 13 },
});
