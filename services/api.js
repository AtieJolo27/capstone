import axios from "axios";
import Constants from "expo-constants";

const host = Constants.expoConfig?.hostUri?.split(":")[0];

console.log("Host:", host);

const api = axios.create({
  baseURL: `http://${host}:8000`,
});

export default api;