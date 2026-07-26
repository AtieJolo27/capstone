import { supabase } from '@/lib/supabaseClient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/app/lib/AppContext';
import { useThemeColors } from '@/app/lib/useThemeColors';
import { getApiUrl } from '@/lib/apiConfig';
import { Ionicons } from '@expo/vector-icons';

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
  const { t, language, fontScale } = useApp();
  const colors = useThemeColors();
  const fs = (size: number) => Math.round(size * fontScale);
  const { crop } = useLocalSearchParams<{ crop: string }>();
  const [latest, setLatest] = useState<CropPrediction | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

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
    try {
      setFetchError(null);
      setLoadingData(true);

      const { data, error } = await supabase
        .from('crop_predictions')
        .select()
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setLatest(data);
    } catch (err: any) {
      console.warn('Supabase error:', err);
      setFetchError(err.message || 'Failed to load soil data');
    } finally {
      setLoadingData(false);
    }
  }

  async function askGroqAutomatically(targetCrop: string, data: CropPrediction) {
    setLoadingAI(true);
    setAiResponse('');
    setAiError(null);

    const responseLanguage =
      language === 'tagalog'
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
      const apiUrl = getApiUrl('/api/groq');

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: dynamicPrompt }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `API error: ${res.status}`);
      }

      setAiResponse(json.data || 'No explanation returned.');
    } catch (err: any) {
      console.warn('AI fetch error:', err);
      setAiError(err.message || 'Failed to reach AI server.');
      setAiResponse('');
    } finally {
      setLoadingAI(false);
    }
  }

  const activeCrop = crop ?? latest?.best_crop;
  const matchedRec = latest?.recommendations?.find(
    (r) => r.crop.toLowerCase() === activeCrop?.toLowerCase()
  );

  // Loading state for initial data fetch
  if (loadingData) {
    return (
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ fontSize: fs(14), marginTop: 16, color: colors.subText }}>
          {t('Loading soil data...', 'Naglo-load ng datos ng lupa...')}
        </Text>
      </ScrollView>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.bg }]}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.mutedText} />
        <Text style={{ fontSize: fs(18), fontWeight: 'bold', marginTop: 16, textAlign: 'center', color: colors.text }}>
          {t('Error Loading Data', 'Error sa Pag-load ng Datos')}
        </Text>
        <Text style={{ fontSize: fs(14), marginTop: 8, textAlign: 'center', color: colors.subText }}>
          {fetchError}
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={{ fontSize: fs(24), fontWeight: 'bold', marginBottom: 4, textTransform: 'capitalize', color: colors.text }}>
        {activeCrop ?? t('Loading...', 'Naglo-load...')}
      </Text>

      {matchedRec && (
        <Text style={{ fontSize: fs(14), marginBottom: 20, color: colors.mutedText }}>
          {matchedRec.confidence}% {t('confidence score', 'puntos ng kumpiyansa')}
        </Text>
      )}

      {latest && (
        <View
          className="w-full rounded-xl p-4 mb-4"
          style={{ backgroundColor: colors.soilCardBg, borderColor: colors.soilCardBorder, borderWidth: 1 }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: fs(18), marginBottom: 8, color: colors.text }}>
            {t('Current Soil Status', 'Kasalukuyang Katayuan ng Lupa')}
          </Text>
          <Text style={{ fontSize: fs(14), color: colors.subText }}>
            N: {latest.nitrogen} | P: {latest.phosphorus} | K: {latest.potassium} | pH: {latest.ph}
          </Text>
          <Text style={{ fontSize: fs(14), color: colors.subText }}>
            {t('Temp', 'Temp')}: {latest.air_temperature}°C | {t('Humidity', 'Halumigmig')}: {latest.humidity}%
          </Text>
        </View>
      )}

      <View
        className="w-full rounded-xl p-4"
        style={{
          backgroundColor: colors.isDarkMode ? '#2D1F14' : '#FFF7ED',
          borderColor: colors.isDarkMode ? '#4A2D1A' : '#FFEDD5',
          borderWidth: 1,
        }}
      >
        <Text
          style={{ fontWeight: 'bold', fontSize: fs(18), marginBottom: 8, color: colors.isDarkMode ? '#FDBA74' : '#9A3412' }}
        >
          ✨ {t('AI Suitability Analysis', 'Pagsusuri ng Kaangkupan ng AI')}
        </Text>

        {loadingAI ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={{ marginLeft: 10, fontSize: fs(13), color: colors.subText }}>
              {t('Analyzing soil nutrient fit...', 'Sinusuri ang akma ng nutrisyon ng lupa...')}
            </Text>
          </View>
        ) : aiError ? (
          <View>
            <Text style={{ fontSize: fs(16), lineHeight: 24, color: '#DC2626' }}>
              {t('AI analysis unavailable.', 'Hindi available ang pagsusuri ng AI.')}
            </Text>
            <Text style={{ fontSize: fs(14), marginTop: 8, color: colors.subText }}>
              {aiError}
            </Text>
          </View>
        ) : (
          <Text style={{ fontSize: fs(16), lineHeight: 24, color: colors.subText }}>
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
});
