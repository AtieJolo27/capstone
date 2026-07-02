import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';


interface Recommend_CropsProps {
    crop_name: string,
    percentage: number,
}


export default function Recommended_Crops({ crop_name, percentage }: Recommend_CropsProps) {
    const decimal = percentage / 100;
    const getColor = (percentage: number) => {
        if (percentage > 79 || percentage === 100) {
            return 'rgb(37, 148, 6)';
        } else if (percentage <= 79 && percentage > 45) {
            return 'rgb(222, 209, 4)';
        } else {
            return 'rgb(189, 9, 9)';
        }
    }

    return (
        <Link href="/(tabs)/crop/profile" asChild>
            <TouchableOpacity className="flex-1 flex-row border items-center border-gray-400 border-solid rounded-lg m-1">
                <View className="p-2">
                    <Ionicons name="checkmark-circle-outline" size={24} color="green" />

                </View>
                <View>

                    <View className="py-2">
                        <Text className="font-bold text-lg text-gray-600  capitalize">
                            {crop_name}
                        </Text>
                        <View className="flex flex-row justify-center items-center">
                            <Progress.Bar className="mr-1" progress={decimal} height={5} color={getColor(percentage)}
                            unfilledColor="rgba(214, 228, 214, 0.8)" borderWidth={0} width={280} />
                            <Text className="font-bold text-lg text-gray-600 ml-1">
                                {percentage}%
                            </Text>
                        </View>


                    </View>
                </View>

            </TouchableOpacity>
        </Link>

    );
}

const styles = StyleSheet.create({})