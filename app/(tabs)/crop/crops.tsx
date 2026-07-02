import Recommended_Crops from '@/app/components/Recommended_Crops';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { supabase } from '../../../lib/supabaseClient';

export default function Crops() {
  const [crops, setCrops] = useState<any[]>([]);

  useEffect(() => {
    getCrops();

    const channel = supabase
          .channel('crop_predictions')
          .on('postgres_changes',
            {event: '*', schema: 'public', table: 'crop_predictions'},
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