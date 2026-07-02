import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import "../../global.css";

export const unstable_settings = {
  initialRouteName: 'index',
};


export default function FeedLayout() {
  return (
  <Stack screenOptions={{
      headerTitle:"GeoPulse",
      headerTitleStyle: { fontWeight: 'bold', fontSize: 20, color: 'white' },
      headerStyle: { backgroundColor: '#184B44' },
      headerRight: () => (
          <TouchableOpacity onPress={() => alert('This is a button!')}>
            <Ionicons name="person-circle-outline" size={24} color="white" />
          </TouchableOpacity>
      )
    }}>
    <Stack.Screen name="crops" options={{ title: "Crops" }} />
    <Stack.Screen name="recommendation" options={{ title: "Recommendations" }} />
    <Stack.Screen name="profile" options={{ title: "Profile" }} />
  </Stack>);
}
