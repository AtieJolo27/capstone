import { useApp } from './AppContext';

export function useThemeColors() {
  const { isDarkMode } = useApp();

  return {
    // Base backgrounds
    bg: isDarkMode ? '#0A1A0F' : '#F0FDF4',
    cardBg: isDarkMode ? '#14281A' : '#FFFFFF',
    cardBgAlt: isDarkMode ? '#1A3522' : '#DCFCE7',
    
    // Text colors
    text: isDarkMode ? '#F0FDF4' : '#1A2E05',
    subText: isDarkMode ? '#86EFAC' : '#4A6741',
    mutedText: isDarkMode ? '#4A6741' : '#6B7280',
    greenText: isDarkMode ? '#4ADE80' : '#16A34A',
    
    // Borders
    border: isDarkMode ? '#1A3522' : '#BBF7D0',
    cardBorder: isDarkMode ? '#1A3522' : '#DCFCE7',
    
    // Headers
    headerBg: isDarkMode ? '#0A4A28' : '#0D5E33',
    headerText: '#F0FDF4',
    
    // Sensor cards
    sensorCardBg: isDarkMode ? '#14281A' : '#F0FDF4',
    sensorCardBorder: isDarkMode ? '#1A3522' : '#BBF7D0',
    
    // Soil card
    soilCardBg: isDarkMode ? '#14281A' : '#DCFCE7',
    soilCardBorder: isDarkMode ? '#1A3522' : '#BBF7D0',
    
    // Utility
    white: isDarkMode ? '#14281A' : '#FFFFFF',
    isDarkMode,
    
    // Accent colors
    primary: '#16A34A',
    primaryLight: '#22C55E',
    primaryDark: '#0D5E33',
    success: '#22C55E',
    warning: '#EAB308',
    danger: '#DC2626',
    
    // Progress bar colors
    progressTrack: isDarkMode ? '#1A3522' : '#E5E7EB',
    
    // For charts
    chartBg: isDarkMode ? '#14281A' : '#FFFFFF',
    chartLabel: isDarkMode ? '#86EFAC' : '#4A6741',
    chartGrid: isDarkMode ? '#1A3522' : '#BBF7D0',
    chartLine: isDarkMode ? '#4ADE80' : '#16A34A',
    chartDot: isDarkMode ? '#22C55E' : '#0D5E33',
  };
}

