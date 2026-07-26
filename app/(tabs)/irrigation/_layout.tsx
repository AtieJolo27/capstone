import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';


export default function IrrigationLayout() {
    return (
        <Stack
        screenOptions={{
            headerTitle:"GeoPulse",
      headerTitleStyle: { fontWeight: 'bold', fontSize: 20, color: '#F0FDF4' },
      headerStyle: { backgroundColor: '#0D5E33' },
      headerTintColor: '#F0FDF4',
      headerRight: () => (
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Ionicons name="person-circle-outline" size={24} color="#F0FDF4" />
          </TouchableOpacity>
      )
        }}>
            <Stack.Screen
            name='irrigation'
            />
        </Stack>
    );
}

const styles = StyleSheet.create({})