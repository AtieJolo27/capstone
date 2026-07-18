import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as Progress from 'react-native-progress';
import { supabase } from '../../../lib/supabaseClient';
import Urgent_Card from '../../components/UrgentCard';


export default function index(){

        const [modalVisible, setModalVisibility] = useState(false);

        const trigger = () => {
            setModalVisibility(!modalVisible);
        }


        useEffect(() => {
            fetchData();
            const channel = supabase
            .channel('sensor_readings')
                      .on('postgres_changes',
                        {event: '*', schema: 'public', table: 'sensor_readings'},
                        (payload) => {
                          console.log("Changes Detected", payload)
                          fetchData();
                        }
                      )
                      .subscribe();
            
                      return () => {
                        supabase.removeChannel(channel);
                      }
        }, []);

        const [data, setData] = useState<any[]>([]);
        async function fetchData(){
            const {data: fetchedData, error} = await supabase.from('sensor_readings').select("*")
            setData(fetchedData ?? []);
        }

    // Helper function to safely get sensor value with fallback
    const getSensorValue = (field: string, defaultValue: string = '--') => {
      if (!data || data.length === 0) return defaultValue;

      // Assuming the data array has at least one record with sensor readings
      const latestRecord = data[data.length - 1]; // Get the most recent record
      return latestRecord[field] !== undefined && latestRecord[field] !== null
        ? latestRecord[field]
        : defaultValue;
    };

    // Helper function to convert sensor value to progress percentage (0-1)
    const getProgressValue = (value: any, maxValue: number): number => {
      if (value === null || value === undefined) return 0;
      const numValue = parseFloat(value);
      return isNaN(numValue) ? 0 : Math.min(numValue / maxValue, 1);
    };

    return (
        <ScrollView
            className="flex-1 px-7 py-5"
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            <View>
                <View className="mt-4">
                    <Text className="text-lg font-bold color-gray-600">FIELD ZONES</Text>
                </View>
                <View className="flex flex-row justify-between gap-2 mt-4 ">
                    <TouchableOpacity className="bg-green-600 w-1/3 border border-gray-600 rounded-2xl h-13 p-4">
                        <Text className="text-md font-bold color-gray-800 text-center al ign-center">Zone A</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-green-600 w-1/3 border border-gray-600 rounded-2xl h-13 p-4">
                        <Text className="text-md font-bold color-gray-800 text-center">Zone B</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-green-600 w-1/3 border border-gray-600 rounded-2xl h-13 p-4">
                        <Text className="text-md font-bold color-gray-800 text-center">Zone C</Text>
                    </TouchableOpacity>
                </View>
                <View className="my-2">
                    <Text className="text-md font-bold color-gray-600 mt-4">Zone A - Rice Field</Text>
                </View>
                <View className="my-2">
                    <Text className="text-lg font-bold color-gray-600">SOIL HEALTH SCORE</Text>
                </View>
                <View className="border border-gray-600 rounded-2xl h-13 p-4">
                    <View>
                        <TouchableOpacity onPress={() => setModalVisibility(true)}>
                            <Ionicons name="alert-circle-outline" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    <View className="flex flex-row justify-between gap-2 mt-2">
                        <View>
                            <AnimatedCircularProgress
                                size={70}
                                width={4}
                                fill={89}
                                tintColor="#008000"
                                onAnimationComplete={() => console.log('onAnimationComplete')}
                                backgroundColor="#738f52"
                            >
                                {percentage => (
                                    <Text className="text-2xl font-bold color-gray-600 text-center">{percentage}%</Text>
                                )}
                            </AnimatedCircularProgress>

                        </View>
                        <View className="flex flex-row gap-5- justify-between">
                            <View className="flex flex-col justify-start gap-2">
                                <Text className="text-md font-bold color-gray-600">Soil Type:</Text>
                                <Text className="text-md font-bold color-gray-600">Organic Matter:</Text>
                                <Text className="text-md font-bold color-gray-600">Texture:</Text>
                                <Text className="text-md font-bold color-gray-600">Status:</Text>
                            </View>
                            <View className="flex flex-col justify-start gap-2">
                                <Text className="text-md font-bold color-gray-600 text-center"> Good</Text>
                                <Text className="text-md font-bold color-gray-600 text-center">3.2</Text>
                                <Text className="text-md font-bold color-gray-600 text-center">Medium</Text>
                                <Text className="text-md font-bold color-gray-600 text-center">Ready for Planting</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View className="my-2">
                    <Text className="text-lg font-bold color-gray-600">LIVE SENSOR READINGS</Text>
                </View>
                <View className="flex flex-row gap-2 py-2">
                    <View className=" bg-green-100 border border-gray-400 rounded-2xl p-3">
                        <View className="flex flex-col align-center justify-center">
                            <Ionicons name="water-outline" size={17} />
                            <Text className="text-sm">Soil Moisture</Text>
                        </View>
                        <View className="py-1">
                            <Text className="text-xl font-bold text-gray-600 text-start">
                              {getSensorValue('soil_moisture', '--')}%
                            </Text>
                        </View>
                        <View className="">
                            <Text className="text-sm font-bold text-gray-500 text-start">Opt: 70-75%</Text>
                            <Progress.Bar
                              progress={getProgressValue(getSensorValue('soil_moisture', 0), 100)}
                              height={5}
                              color="rgba(0, 128, 0, 1)"
                              unfilledColor="rgba(214, 228, 214, 0.8)"
                              borderWidth={0}
                              width={75}
                            />
                        </View>

                    </View>
                    <View className=" bg-green-100 border border-gray-400 rounded-2xl p-3">
                        <View className="flex flex-column align-center justify-center">
                            <Ionicons name="thermometer-outline" size={17} />
                            <Text className="text-sm">Soil Temperature</Text>
                        </View>
                        <View className="py-1">
                            <Text className="text-xl font-bold text-gray-600 text-start">
                              {getSensorValue('soil_temperature', '--')}°C
                            </Text>
                        </View>
                        <View className="">
                            <Text className="text-sm font-bold text-gray-500 text-start">Opt: 20-30°C</Text>
                            <Progress.Bar
                              progress={getProgressValue(getSensorValue('soil_temperature', 0), 50)}
                              height={5}
                              color="rgba(0, 128, 0, 1)"
                              unfilledColor="rgba(214, 228, 214, 0.8)"
                              borderWidth={0}
                              width={75}
                            />
                        </View>

                    </View>
                    <View className=" bg-green-100 border border-gray-400 rounded-2xl p-3">
                        <View className="flex flex-column align-center justify-center">
                            <Ionicons name="analytics-outline" size={17} />
                            <Text className="text-sm">Soil pH Level</Text>
                        </View>
                        <View className="py-1">
                            <Text className="text-xl font-bold text-gray-600 text-start">
                              {getSensorValue('ph', '--')}
                            </Text>
                        </View> 
                        <View className="">
                            <Text className="text-sm font-bold text-gray-500 text-start">Opt: 6.0-7.5</Text>
                            <Progress.Bar
                              progress={getProgressValue(getSensorValue('ph', 0), 14)}
                              height={5}
                              color="rgba(0, 128, 0, 1)"
                              unfilledColor="rgba(214, 228, 214, 0.8)"
                              borderWidth={0}
                              width={75}
                            />
                        </View>

                    </View>

                </View>
                <View className="flex flex-row gap-2 py-2">
                    <View className=" bg-green-100 border border-gray-400 rounded-2xl p-3">
                        <View className="flex flex-col align-center justify-center">
                            <Ionicons name="flash-outline" size={17} />
                            <Text className="text-sm">Nitrogen</Text>
                        </View>
                        <View className="py-1">
                            <Text className="text-xl font-bold text-gray-600 text-start">
                              {getSensorValue('nitrogen', '--')} ppm
                            </Text>
                        </View>
                        <View className="">
                            <Text className="text-sm font-bold text-gray-500 text-start">Opt: 20-40 ppm</Text>
                            <Progress.Bar
                              progress={getProgressValue(getSensorValue('nitrogen', 0), 100)}
                              height={5}
                              color="rgba(0, 128, 0, 1)"
                              unfilledColor="rgba(214, 228, 214, 0.8)"
                              borderWidth={0}
                              width={75}
                            />
                        </View>

                    </View>
                    <View className=" bg-green-100 border border-gray-400 rounded-2xl p-3">
                        <View className="flex flex-col align-center justify-center">
                            <Ionicons name="flower-outline" size={17} />
                            <Text className="text-sm">Phosphorus</Text>
                        </View>
                        <View className="py-1">
                            <Text className="text-xl font-bold text-gray-600 text-start">
                              {getSensorValue('phosphorus', '--')} ppm
                            </Text>
                        </View>
                        <View className="py-">
                            <Text className="text-sm font-bold text-gray-500 text-start">Opt: 10-30 ppm</Text>
                            <Progress.Bar
                              progress={getProgressValue(getSensorValue('phosphorus', 0), 100)}
                              height={5}
                              color="rgba(0, 128, 0, 1)"
                              unfilledColor="rgba(214, 228, 214, 0.8)"
                              borderWidth={0}
                              width={75}
                            />
                        </View>

                    </View>
                    <View className=" bg-green-100 border border-gray-400 rounded-2xl p-3">
                        <View className="flex flex-col align-center justify-center">
                            <Ionicons name="medical-outline" size={17} />
                            <Text className="text-sm">Potassium</Text>
                        </View>
                        <View className="py-1">
                            <Text className="text-xl font-bold text-gray-600 text-start">
                              {getSensorValue('potassium', '--')} ppm
                            </Text>
                        </View>
                        <View className="">
                            <Text className="text-sm font-bold text-gray-500 text-start">Opt: 100-200 ppm</Text>
                            <Progress.Bar
                              progress={getProgressValue(getSensorValue('potassium', 0), 300)}
                              height={5}
                              color="rgba(0, 128, 0, 1)"
                              unfilledColor="rgba(214, 228, 214, 0.8)"
                              borderWidth={0}
                              width={75}
                            />
                        </View>

                    </View>

                </View>
            </View>
            <View>
                <View className="my-2">
                    <Text className="text-lg font-bold color-gray-600">URGENT NOTIFICATIONS</Text>
                </View>
                <Urgent_Card field="Soil Temperature" message="Temperature too high, it's 90 degrees" date="2 days ago" />
                <Urgent_Card field="Soil Temperature" message="Temperature too high, it's 90 degrees" date="2 days ago" />
            </View>

            <Modal className="flex-1 p-2 flex-column" visible={modalVisible}>
                <TouchableOpacity onPress={()=> setModalVisibility(false)   }>
                    <Ionicons name="close-circle-outline" size={24} color="black" />
                </TouchableOpacity>
                <Text>
                    Hello
                </Text>
            </Modal>
        </ScrollView>
    )
}


const styles = StyleSheet.create({})