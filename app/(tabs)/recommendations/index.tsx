import Recommended_Crops from '@/app/components/Recommended_Crops';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../../lib/supabaseClient';

export default function index() {
  const [crops, setCrops] = useState<any[]>([]);

  useEffect(() => {
    getCrops();

    const channel = supabase
      .channel('crop_predictions')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'crop_predictions' },
        (payload) => {
          console.log("Changes Detected", payload)
          getCrops();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  async function getCrops() {
    const { data, error } = await supabase.from('crop_predictions').select()
    console.log('data:', data)
    console.log('error:', error)
    setCrops(data ?? [])
  }
  return (
    <View>
      <View className="flex flex-row items-center justify-center gap-3 m-2">
        <View className=" bg-red-300 p-2 rounded-lg">
          <View className="flex flex-col items-center justify-center size-24">
            <Text className="font-bold text-gray-800 ">Nitrogen</Text>
            <Text className="font-bold text-2xl text-gray-800 ">Low</Text>
            <Text className="">21 vs 30+</Text>
          </View>
        </View>
       <View className=" bg-gray-400 p-2 rounded-lg">
          <View className="flex flex-col items-center justify-center size-24">
            <Text className="font-bold text-gray-800 ">Nitrogen</Text>
            <Text className="font-bold text-2xl text-gray-800 ">Low</Text>
            <Text className="">21 vs 30+</Text>
          </View>
        </View>
       <View className=" bg-gray-400 p-2 rounded-lg">
          <View className="flex flex-col items-center justify-center size-24">
            <Text className="font-bold text-gray-800 ">Nitrogen</Text>
            <Text className="font-bold text-2xl text-gray-800 ">Low</Text>
            <Text className="">21 vs 30+</Text>
          </View>
        </View>
      </View>
      <FlatList
        data={crops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (

          <Recommended_Crops crop_name={item.best_crop} percentage={70} />

        )}
      />
      <FlatList
        data={crops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (

          <Recommended_Crops crop_name={item.recommended_crop} percentage={70} />

        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({})