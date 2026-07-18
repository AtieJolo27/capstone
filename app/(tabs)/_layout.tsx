import { Ionicons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    // <Tabs
    //   screenOptions={{
    //     tabBarActiveTintColor: "white",
    //     tabBarInactiveTintColor: "white",
    //     tabBarStyle: { backgroundColor: "green" },
    //     headerStyle: { backgroundColor: "darkgreen" },
    //     headerTintColor: "#fff",
    //     headerTitle: "Geo Pulse",
    //     headerRight: () => (
    //       <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginRight: 16 }}>
    //         <TouchableOpacity onPress={() => alert("Profile")}>
    //           <Ionicons name="notifications" size={24} color="#fff" />
    //         </TouchableOpacity>
    //         <TouchableOpacity
    //           onPress={() => alert("Notifications")}
    //           style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
    //         >
    //           <Ionicons name="person" size={24} color="#fff" />
    //           <Text style={{ color: "#fff" }}>User</Text>
    //         </TouchableOpacity>
          
    //       </View>
    //     ),
    //   }}
    // >
    //   <Tabs.Screen
    //     name="index"
    //     options={{
    //       title: "Home",
    //       tabBarIcon: ({ color, size }) => (
    //         <Ionicons name="home" color={color} size={size} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="profile"
    //     options={{
    //       title: "Profile",
    //       tabBarIcon: ({ color, size }) => (
    //         <Ionicons name="person" color={color} size={size} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="crop"
    //     options={{
    //       title: "Crops",
    //       tabBarIcon: ({ color, size }) => (
    //         <Ionicons name="person" color={color} size={size} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="recommendations"
    //     options={{
    //       title: "Recommendations",
    //       tabBarIcon: ({ color, size }) => (
    //         <Ionicons name="person" color={color} size={size} />
    //       ),
    //     }}
    //   />
    // </Tabs>

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