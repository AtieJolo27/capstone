import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

interface BestFertilizerProps {
    fertilizer_name: string;
    percentage: number;
}

const getStatus = (percentage: number) => {
    if (percentage >= 80) {
        return { color: '#259406', bg: '#EAF7E9', icon: 'checkmark-circle' as const, label: 'Great match' };
    } else if (percentage > 45) {
        return { color: '#B8A400', bg: '#FCF9E3', icon: 'alert-circle' as const, label: 'Fair match' };
    } else {
        return { color: '#BD0909', bg: '#FBEAEA', icon: 'close-circle' as const, label: 'Poor match' };
    }
};

export default function BestFertilizer({ fertilizer_name, percentage }: BestFertilizerProps) {
    const decimal = percentage / 100;
    const status = getStatus(percentage);

    return (
        <Link
            href={{ pathname: '/(tabs)/fertilizer/reasoning', params: { fertilizer: fertilizer_name } }}
            asChild
        >
            <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center bg-white border border-gray-200 rounded-2xl p-3 m-1 shadow-sm"
            >
                <View
                    className="items-center justify-center rounded-full mr-3"
                    style={{ backgroundColor: status.bg, width: 44, height: 44 }}
                >
                    <Ionicons name={status.icon} size={24} color={status.color} />
                </View>

                <View className="flex-1">
                    <Text className="text-xs text-gray-600 uppercase tracking-wide">
                        Best fertilizer for your field
                    </Text>

                    <View className="flex-row items-center justify-between mt-0.5">
                        <Text className="font-bold text-base text-gray-800 capitalize">
                            {fertilizer_name}
                        </Text>
                        <Text className="font-bold text-sm" style={{ color: status.color }}>
                            {percentage}%
                        </Text>
                    </View>

                    <View className="mt-2">
                        <Progress.Bar
                            progress={decimal}
                            height={6}
                            color={status.color}
                            unfilledColor="#EEF2EE"
                            borderWidth={0}
                            width={null}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );
}