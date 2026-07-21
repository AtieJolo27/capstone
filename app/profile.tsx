import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '@/app/lib/AppContext';

interface EditableField {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  labelKey: string;
  labelEn: string;
  labelTl: string;
  value: string;
  key: string;
}

interface Section {
  titleKey: string;
  titleEn: string;
  titleTl: string;
  items: EditableField[];
}

const DEFAULT_SECTIONS: Section[] = [
  {
    titleKey: 'personalInfo',
    titleEn: 'Personal Information',
    titleTl: 'Personal na Impormasyon',
    items: [
      { icon: 'person-outline' as const, labelKey: 'name', labelEn: 'Name', labelTl: 'Pangalan', value: 'Juan Dela Cruz', key: 'name' },
      { icon: 'location-outline' as const, labelKey: 'location', labelEn: 'Farm Location', labelTl: 'Lokasyon ng Bukid', value: 'Barangay San Isidro, Nueva Ecija', key: 'location' },
      { icon: 'call-outline' as const, labelKey: 'contact', labelEn: 'Contact', labelTl: 'Kontak', value: '+63 912 345 6789', key: 'contact' },
    ],
  },
  {
    titleKey: 'farmDetails',
    titleEn: 'Farm Details',
    titleTl: 'Detalye ng Bukid',
    items: [
      { icon: 'map-outline' as const, labelKey: 'farmSize', labelEn: 'Farm Size', labelTl: 'Laki ng Bukid', value: '2.5 Hectares', key: 'farmSize' },
      { icon: 'leaf-outline' as const, labelKey: 'primaryCrop', labelEn: 'Primary Crop', labelTl: 'Pangunahing Pananim', value: 'Rice', key: 'primaryCrop' },
      { icon: 'water-outline' as const, labelKey: 'irrigation', labelEn: 'Irrigation Type', labelTl: 'Uri ng Patubig', value: 'Flood Irrigation', key: 'irrigation' },
    ],
  },
];

const LANGUAGE_OPTIONS = [
  { key: 'tagalog' as const, label: 'Tagalog', icon: 'chatbubbles-outline' as const },
  { key: 'english' as const, label: 'English', icon: 'language-outline' as const },
];

export default function ProfileScreen() {
  const { isDarkMode, toggleTheme, language, setLanguage, t } = useApp();

  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingItem, setEditingItem] = useState<EditableField | null>(null);
  const [editValue, setEditValue] = useState('');

  const [farmerName, setFarmerName] = useState('Juan Dela Cruz');
  const [farmerRole, setFarmerRole] = useState(t('Farmer', 'Magsasaka') + ' • Nueva Ecija');
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [editNameValue, setEditNameValue] = useState(farmerName);
  const [editRoleValue, setEditRoleValue] = useState(farmerRole);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleOpenEdit = (section: Section, item: EditableField) => {
    setEditingSection(section);
    setEditingItem(item);
    setEditValue(item.value);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingSection || !editingItem) return;

    const updatedSections = sections.map((sec) => {
      if (sec.titleKey === editingSection.titleKey) {
        return {
          ...sec,
          items: sec.items.map((it) => {
            if (it.key === editingItem.key) {
              return { ...it, value: editValue };
            }
            return it;
          }),
        };
      }
      return sec;
    });

    setSections(updatedSections);
    setEditModalVisible(false);
    setEditingSection(null);
    setEditingItem(null);
    setEditValue('');

    Alert.alert(
      t('Saved', 'Na-save'),
      t('Your information has been updated successfully.', 'Matagumpay na na-update ang iyong impormasyon.')
    );
  };

  const handleSaveName = () => {
    setFarmerName(editNameValue);
    setFarmerRole(editRoleValue);
    setEditNameVisible(false);

    const updatedSections = sections.map((sec) => {
      if (sec.titleKey === 'personalInfo') {
        return {
          ...sec,
          items: sec.items.map((it) => {
            if (it.key === 'name') {
              return { ...it, value: editNameValue };
            }
            return it;
          }),
        };
      }
      return sec;
    });
    setSections(updatedSections);

    Alert.alert(
      t('Saved', 'Na-save'),
      t('Your name has been updated successfully.', 'Matagumpay na na-update ang iyong pangalan.')
    );
  };

  const handleLanguageSelect = (lang: 'tagalog' | 'english') => {
    setLanguage(lang);
    setLanguageModalVisible(false);
    setFarmerRole(
      (lang === 'tagalog' ? 'Magsasaka' : 'Farmer') + ' • Nueva Ecija'
    );
    Alert.alert(
      t('Language Changed', 'Binago ang Wika'),
      lang === 'tagalog'
        ? 'Ang wika ay nakatakda sa Tagalog.'
        : 'Language has been set to English.'
    );
  };

  const bgColor = isDarkMode ? '#111827' : '#F9FAFB';
  const cardBg = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textColor = isDarkMode ? '#F9FAFB' : '#1F2937';
  const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = isDarkMode ? '#374151' : '#E5E7EB';
  const headerBg = isDarkMode ? '#0F3D37' : '#184B44';

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <View className="pt-12 pb-8 px-6 rounded-b-3xl" style={{ backgroundColor: headerBg }}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">
            {t('Profile', 'Profile')}
          </Text>
          <TouchableOpacity onPress={() => alert(t('Settings', 'Settings'))}>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View className="items-center">
          <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-3 relative">
            <Ionicons name="person" size={40} color="white" />
            <TouchableOpacity
              className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md"
              onPress={() => alert(t('Change profile picture', 'Palitan ang larawan'))}
            >
              <Ionicons name="camera" size={14} color="#184B44" />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center">
            <Text className="text-white font-bold text-xl">{farmerName}</Text>
            <TouchableOpacity
              onPress={() => {
                setEditNameValue(farmerName);
                setEditRoleValue(farmerRole);
                setEditNameVisible(true);
              }}
              className="ml-2 bg-white/20 rounded-full p-1.5"
            >
              <Ionicons name="pencil" size={14} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-white/70 text-sm">{farmerRole}</Text>
        </View>
      </View>

      {/* Profile Sections */}
      <ScrollView className="flex-1 px-4 -mt-4">
        {sections.map((section, sIndex) => (
          <View
            key={sIndex}
            className="rounded-2xl p-4 mb-4 shadow-sm"
            style={{ backgroundColor: cardBg, borderColor, borderWidth: 1 }}
          >
            <Text className="text-gray-500 font-semibold text-sm uppercase tracking-wide mb-3">
              {section.titleEn}
            </Text>
            {section.items.map((item, iIndex) => (
              <TouchableOpacity
                key={iIndex}
                onPress={() => handleOpenEdit(section, item)}
                className="flex-row items-center py-3"
                style={{
                  borderBottomWidth: iIndex === section.items.length - 1 ? 0 : 1,
                  borderBottomColor: borderColor,
                }}
              >
                <View className="w-8 h-8 bg-green-50 rounded-full items-center justify-center mr-3">
                  <Ionicons name={item.icon} size={16} color="#184B44" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: textColor }} className="font-medium text-sm">
                    {language === 'tagalog' ? item.labelTl : item.labelEn}
                  </Text>
                  <Text style={{ color: subTextColor }} className="text-xs mt-0.5">
                    {item.value}
                  </Text>
                </View>
                <Ionicons name="pencil-outline" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Settings Section */}
        <View
          className="rounded-2xl p-4 mb-4 shadow-sm"
          style={{ backgroundColor: cardBg, borderColor, borderWidth: 1 }}
        >
          <Text className="text-gray-500 font-semibold text-sm uppercase tracking-wide mb-3">
            {t('Settings', 'Settings')}
          </Text>

          {/* Dark Mode Toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            className="flex-row items-center py-3"
            style={{ borderBottomWidth: 1, borderBottomColor: borderColor }}
          >
            <View className="w-8 h-8 bg-green-50 rounded-full items-center justify-center mr-3">
              <Ionicons
                name={isDarkMode ? 'moon' : 'moon-outline'}
                size={16}
                color="#184B44"
              />
            </View>
            <View className="flex-1">
              <Text style={{ color: textColor }} className="font-medium text-sm">
                {t('Dark Mode', 'Dark Mode')}
              </Text>
            </View>
            <View
              className={`w-10 h-5 rounded-full items-center justify-center`}
              style={{
                backgroundColor: isDarkMode ? '#16A34A' : '#D1D5DB',
              }}
            >
              <View
                className="w-4 h-4 rounded-full bg-white shadow-sm"
                style={{
                  alignSelf: isDarkMode ? 'flex-end' : 'flex-start',
                  marginHorizontal: 2,
                }}
              />
            </View>
          </TouchableOpacity>

          {/* Language Selector */}
          <TouchableOpacity
            onPress={() => setLanguageModalVisible(true)}
            className="flex-row items-center py-3"
          >
            <View className="w-8 h-8 bg-green-50 rounded-full items-center justify-center mr-3">
              <Ionicons name="language-outline" size={16} color="#184B44" />
            </View>
            <View className="flex-1">
              <Text style={{ color: textColor }} className="font-medium text-sm">
                {t('Language', 'Wika')}
              </Text>
              <Text style={{ color: subTextColor }} className="text-xs mt-0.5">
                {language === 'tagalog' ? 'Tagalog' : 'English'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View
          className="rounded-2xl p-4 mb-6 shadow-sm"
          style={{ backgroundColor: cardBg, borderColor, borderWidth: 1 }}
        >
          <Text className="text-gray-500 font-semibold text-sm uppercase tracking-wide mb-3">
            {t('Account Statistics', 'Estadistika ng Account')}
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold" style={{ color: '#184B44' }}>156</Text>
              <Text style={{ color: subTextColor }} className="text-xs">
                {t('Readings', 'Pagbasa')}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold" style={{ color: '#184B44' }}>12</Text>
              <Text style={{ color: subTextColor }} className="text-xs">
                {t('Recommendations', 'Rekomendasyon')}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold" style={{ color: '#184B44' }}>3</Text>
              <Text style={{ color: subTextColor }} className="text-xs">
                {t('Zones', 'Sona')}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={() => alert(t('Logout pressed', 'Nag-logout'))}
          className="flex-row items-center justify-center rounded-2xl p-4 mb-8"
          style={{ backgroundColor: cardBg, borderColor: '#FECACA', borderWidth: 1 }}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text className="text-red-600 font-semibold ml-2">
            {t('Logout', 'Logout')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Field Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl w-full p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">
                {t('Edit', 'Baguhin')} {editingItem ? (language === 'tagalog' ? editingItem.labelTl : editingItem.labelEn) : ''}
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <TextInput
              className="border border-gray-300 rounded-xl p-3 text-gray-800 text-base mb-4"
              value={editValue}
              onChangeText={setEditValue}
              placeholder={t('Enter', 'Ilagay ang') + ' ' + (editingItem ? (language === 'tagalog' ? editingItem.labelTl.toLowerCase() : editingItem.labelEn.toLowerCase()) : '')}
              autoFocus
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
              >
                <Text className="text-gray-600 font-semibold">
                  {t('Cancel', 'Kanselahin')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveEdit}
                className="flex-1 bg-[#184B44] rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold">
                  {t('Save', 'I-save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal visible={editNameVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl w-full p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">
                {t('Edit Profile', 'Baguhin ang Profile')}
              </Text>
              <TouchableOpacity onPress={() => setEditNameVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-500 text-xs font-semibold uppercase mb-1">
              {t('Full Name', 'Buong Pangalan')}
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-3 text-gray-800 text-base mb-4"
              value={editNameValue}
              onChangeText={setEditNameValue}
              placeholder={t('Enter your full name', 'Ilagay ang iyong buong pangalan')}
              autoFocus
            />

            <Text className="text-gray-500 text-xs font-semibold uppercase mb-1">
              {t('Role / Location', 'Tungkulin / Lokasyon')}
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-3 text-gray-800 text-base mb-4"
              value={editRoleValue}
              onChangeText={setEditRoleValue}
              placeholder={t('e.g. Farmer', 'Hal. Magsasaka') + ' • Nueva Ecija'}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setEditNameVisible(false)}
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
              >
                <Text className="text-gray-600 font-semibold">
                  {t('Cancel', 'Kanselahin')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveName}
                className="flex-1 bg-[#184B44] rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold">
                  {t('Save', 'I-save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal visible={languageModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl w-full p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">
                {t('Select Language', 'Pumili ng Wika')}
              </Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {LANGUAGE_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => handleLanguageSelect(option.key)}
                className="flex-row items-center py-4 px-2"
                style={{
                  borderBottomWidth: index === LANGUAGE_OPTIONS.length - 1 ? 0 : 1,
                  borderBottomColor: '#E5E7EB',
                }}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={language === option.key ? '#184B44' : '#9CA3AF'}
                />
                <Text
                  className="flex-1 ml-3 font-medium text-base"
                  style={{
                    color: language === option.key ? '#184B44' : '#4B5563',
                  }}
                >
                  {option.label}
                </Text>
                {language === option.key && (
                  <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

