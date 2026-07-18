import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import api from "../../services/api";

export default function HomeScreen() {
  const [soilMoisture, setSoilMoisture] = useState("");
  const [soilTemperature, setSoilTemperature] = useState("");
  const [ph, setPh] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");

  const [crop, setCrop] = useState("");

  async function analyzeSoil() {
    try {
      const response = await api.post("/predict", {
        soil_moisture: Number(soilMoisture),
        soil_temperature: Number(soilTemperature),
        ph: Number(ph),
        nitrogen: Number(nitrogen),
        phosphorus: Number(phosphorus),
        potassium: Number(potassium),
      });

      setCrop(response.data.recommended_crop);
    } catch (error) {
      Alert.alert("Error", "Cannot connect to API");
      console.log(error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌱 Soil Health Monitoring</Text>

      <TextInput
        placeholder="Soil Moisture"
        keyboardType="numeric"
        style={styles.input}
        value={soilMoisture}
        onChangeText={setSoilMoisture}
      />

      <TextInput
        placeholder="Soil Temperature"
        keyboardType="numeric"
        style={styles.input}
        value={soilTemperature}
        onChangeText={setSoilTemperature}
      />

      <TextInput
        placeholder="pH"
        keyboardType="numeric"
        style={styles.input}
        value={ph}
        onChangeText={setPh}
      />

      <TextInput
        placeholder="Nitrogen"
        keyboardType="numeric"
        style={styles.input}
        value={nitrogen}
        onChangeText={setNitrogen}
      />

      <TextInput
        placeholder="Phosphorus"
        keyboardType="numeric"
        style={styles.input}
        value={phosphorus}
        onChangeText={setPhosphorus}
      />

      <TextInput
        placeholder="Potassium"
        keyboardType="numeric"
        style={styles.input}
        value={potassium}
        onChangeText={setPotassium}
      />

      <Button
        title="Analyze Soil"
        onPress={analyzeSoil}
      />

      {crop !== "" && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>
            🌾 Recommended Crop
          </Text>

          <Text style={styles.crop}>
            {crop}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  result: {
    marginTop: 30,
    alignItems: "center",
  },

  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  crop: {
    fontSize: 28,
    color: "green",
    marginTop: 10,
    fontWeight: "bold",
  },
});