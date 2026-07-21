import NutrientHistoryChart from '@/app/components/HistoryChart'
import SoilHealthChart from '@/app/components/SoilHealthChart'
import { useThemeColors } from '@/app/lib/useThemeColors'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

const index = () => {
  const colors = useThemeColors()

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <SoilHealthChart />
      <View className="my-2 mx-4" style={{ borderTopWidth: 1, borderTopColor: colors.border }} />
      <NutrientHistoryChart />
    </ScrollView>
  )
}

export default index

const styles = StyleSheet.create({})
