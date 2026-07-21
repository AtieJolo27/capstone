import { useApp } from './AppContext';

export function useThemeColors() {
  const { isDarkMode } = useApp();

  return {
    bg: isDarkMode ? '#111827' : '#F9FAFB',
    cardBg: isDarkMode ? '#1F2937' : '#FFFFFF',
    text: isDarkMode ? '#F9FAFB' : '#1F2937',
    subText: isDarkMode ? '#9CA3AF' : '#6B7280',
    mutedText: isDarkMode ? '#6B7280' : '#9CA3AF',
    border: isDarkMode ? '#374151' : '#E5E7EB',
    headerBg: isDarkMode ? '#0F3D37' : '#184B44',
    cardBorder: isDarkMode ? '#374151' : '#E5E7EB',
    sensorCardBg: isDarkMode ? '#1a2e2a' : '#F0FDF4',
    sensorCardBorder: isDarkMode ? '#374151' : '#D1D5DB',
    soilCardBg: isDarkMode ? '#1F2937' : '#F3F4F6',
    white: isDarkMode ? '#1F2937' : '#FFFFFF',
    isDarkMode,
    // For charts
    chartBg: isDarkMode ? '#1F2937' : '#ffffff',
    chartLabel: isDarkMode ? '#9CA3AF' : '#9CA3AF',
    chartGrid: isDarkMode ? '#374151' : '#E5E7EB',
  };
}

