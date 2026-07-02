import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Urgent_CardProps {
  field: string,
  message: string,
  date: string,
}
export default function Urgent_Card({ field, message, date }: Urgent_CardProps) {

  return (
    <Link href="/(tabs)/crop/profile" asChild>
      <TouchableOpacity className="flex-1 flex-row border border-gray-400 border-solid rounded-lg m-1">
        <View className="p-2">
          <Ionicons name="alert-circle-outline" size={24} color="red" />

        </View>
        <View>

          <View className="py-2">
            <Text className="font-bold text-lg text-gray-600">
              {field}
            </Text>
            <Text className="font-light text-sm text-gray-600">
              {date}
            </Text>
            <Text>
              {message}
            </Text>
          </View>
        </View>

      </TouchableOpacity>
    </Link>

  );
}

const styles = StyleSheet.create({})