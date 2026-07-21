import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/app/lib/useThemeColors';
import { getCropImage } from '@/app/lib/cropImages';
import { Link } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

interface BestCropProps {
    crop_name: string;
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

export default function BestCrop({ crop_name, percentage }: BestCropProps) {
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
                        className="w-12 h-12 rounded-full"
                        style={{ width: 48, height: 48, borderRadius: 24 }}
                    />
                    <View
                        className="absolute -bottom-1 -right-1 items-center justify-center rounded-full border-2 border-white"
                        style={{ backgroundColor: status.bg, width: 20, height: 20 }}
                    >
                        <Ionicons name={status.icon} size={12} color={status.color} />
                    </View>
                </View>

                <View className="flex-1">
                    <Text className="text-xs uppercase tracking-wide" style={{ color: colors.mutedText }}>
                        Best crop for your field
                    </Text>

                    <View className="flex-row items-center justify-between mt-0.5">
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
