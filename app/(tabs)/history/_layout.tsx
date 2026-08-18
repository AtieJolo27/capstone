import NutrientHistoryChart from '@/app/components/HistoryChart'
import SoilHealthChart from '@/app/components/SoilHealthChart'
import { exportSoilHistoryPDF } from '@/app/lib/exportSoilPDF'
import { useThemeColors } from '@/app/lib/useThemeColors'
import React, { useState } from 'react'
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

const index = () => {

  const colors = useThemeColors()

  const [exporting, setExporting] =
    useState(false)

  const handleExportPDF = async () => {

    try {

      setExporting(true)

      await exportSoilHistoryPDF()

    } catch (error) {

      console.error(
        'PDF export error:',
        error
      )

      Alert.alert(
        'Export Failed',
        'Unable to generate the soil report.'
      )

    } finally {

      setExporting(false)

    }
  }

  return (
    <ScrollView
      className="flex-1"
      style={{
        backgroundColor: colors.bg,
      }}
    >

      <SoilHealthChart />

      <View
        className="my-2 mx-4"
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      />

      <NutrientHistoryChart />


      {/* EXPORT PDF */}

      <TouchableOpacity
        onPress={handleExportPDF}
        disabled={exporting}
        className="mx-4 mb-6 rounded-xl py-4 items-center"
        style={{
          backgroundColor:
            exporting
              ? colors.mutedText
              : '#0D5E33',
        }}
      >

        <Text className="text-white font-bold text-base">

          {exporting
            ? 'Generating PDF...'
            : 'Export PDF Report'}

        </Text>

      </TouchableOpacity>

    </ScrollView>
  )
}

export default index