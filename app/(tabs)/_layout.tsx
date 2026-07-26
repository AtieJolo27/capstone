import { Ionicons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#184B44',
      },
      tabBarActiveTintColor: 'green',
      tabBarInactiveTintColor: 'white',

     }}>
      <Tabs.Screen name='home'
      options={{
        title: "Home",
        tabBarIcon: ({color, size}) =>
          <Ionicons name="home" color={color} size={size} />
      }}
      />
      <Tabs.Screen name="crop"
        options={{
          title: "Crops",
          tabBarIcon: ({color, size}) =>
            <Ionicons name="leaf-outline" color={color} size={size} />
        }}
        />
        <Tabs.Screen name="fertilizer"
        options={{
          title: "Fertilizers",
          tabBarIcon: ({color, size}) =>
            <Ionicons name="checkmark-circle-outline" color={color} size={size} />
        }}
        />
        <Tabs.Screen name="history"
        options={{
          title: "History",
          tabBarIcon: ({color, size}) =>
            <Ionicons name="receipt-outline" color={color} size={size} />
        }}
        />

    </Tabs>
  );
}