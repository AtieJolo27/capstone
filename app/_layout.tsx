import { AppProvider } from '@/app/lib/AppContext';
import { Stack } from 'expo-router';
import './global.css';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
    </AppProvider>
  );
}

