
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import "../../global.css";

export const unstable_settings = {
    initialRouteName: "index",
}
export default function RecommendationLayout(){
    return (
        <Stack screenOptions={{
      headerTitle:"GeoPulse",
      headerTitleStyle: { fontWeight: 'bold', fontSize: 20, color: 'white' },
      headerStyle: { backgroundColor: '#184B44' },
      headerRight: () => (
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Ionicons name="person-circle-outline" size={24} color="white" />
          </TouchableOpacity>
      )
    }}>
            <Stack.Screen name="fertilizers" options={{title:"Fertilizers"}} />
        </Stack>
    );
}
