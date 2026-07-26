
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import "../../global.css";

export const unstable_settings = {
    initialRouteName: "index",
}
export default function HistoryLayout(){
    return (
    <Stack screenOptions={{
      headerTitle:"GeoPulse",
      headerTitleStyle: { fontWeight: 'bold', fontSize: 20, color: '#F0FDF4' },
      headerStyle: { backgroundColor: '#0D5E33' },
      headerTintColor: '#F0FDF4',
      headerRight: () => (
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Ionicons name="person-circle-outline" size={24} color="#F0FDF4" />
          </TouchableOpacity>
      )
    }}>
            <Stack.Screen name="index" options={{title:"History"}} />
        </Stack>
    );
}
