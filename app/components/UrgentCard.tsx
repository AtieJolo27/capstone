import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/app/lib/useThemeColors';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UrgentCardProps {
  field: string,
  message: string,
  date: string,
}
export default function UrgentCard({ field, message, date }: UrgentCardProps) {
  const colors = useThemeColors();

  return (
    <Link href="/(tabs)/crop/reasoning" asChild>
      <TouchableOpacity
        className="flex-1 flex-row border border-solid rounded-lg m-1"
        style={{ borderColor: colors.isDarkMode ? '#DC2626' : '#FCA5A5', backgroundColor: colors.isDarkMode ? '#1F2937' : '#FFFFFF' }}
      >
        <View className="p-2">
          <Ionicons name="alert-circle-outline" size={24} color="#DC2626" />
        </View>
        <View>
          <View className="py-2">
            <Text className="font-bold text-lg" style={{ color: colors.text }}>
              {field}
            </Text>
            <Text className="font-light text-sm" style={{ color: colors.subText }}>
              {date}
            </Text>
            <Text style={{ color: colors.text }}>
              {message}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({})
