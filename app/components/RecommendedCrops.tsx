import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/app/lib/useThemeColors';
import { getCropImage } from '@/app/lib/cropImages';
import { Link } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

interface RecommendedCropsProps {
    crop_name: string;
    percentage: number;
}

const getStatus = (percentage: number) => {
    if (percentage >= 80) {
        return { color: '#259406', bg: '#EAF7E9', icon: 'checkmark-circle' as const };
    } else if (percentage > 45) {
        return { color: '#B8A400', bg: '#FCF9E3', icon: 'alert-circle' as const };
    } else {
        return { color: '#BD0909', bg: '#FBEAEA', icon: 'close-circle' as const };
    }
};

export default function RecommendedCrops({ crop_name, percentage }: RecommendedCropsProps) {
    const colors = useThemeColors();
    const decimal = percentage / 100;
    const status = getStatus(percentage);
    const imageUrl = getCropImage(crop_name);

    return (
        <Link
            href={{ pathname: '/(tabs)/crop/reasoning', params: { crop: crop_name } }}
            asChild
        >
            <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center rounded-2xl p-3 m-1 shadow-sm"
                style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderWidth: 1 }}
            >
                <View className="mr-3">
                    <Image
                        source={{ uri: imageUrl }}
                        className="w-11 h-11 rounded-full"
                        style={{ width: 44, height: 44, borderRadius: 22 }}
                    />
                    <View
                        className="absolute -bottom-1 -right-1 items-center justify-center rounded-full border-2 border-white"
                        style={{ backgroundColor: status.bg, width: 18, height: 18 }}
                    >
                        <Ionicons name={status.icon} size={10} color={status.color} />
                    </View>
                </View>

                <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                        <Text className="font-bold text-base capitalize" style={{ color: colors.text }}>
                            {crop_name}
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
                            unfilledColor={colors.isDarkMode ? '#374151' : '#EEF2EE'}
                            borderWidth={0}
                            width={null}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );
}
