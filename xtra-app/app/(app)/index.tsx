import { Text, View, Alert } from "react-native";
import { Button } from "../../components/Button";
import * as WebBrowser from 'expo-web-browser';

export default function Index() {
  const handleCanvaLogin = async () => {
    try {
      // 1. Get the Authorization URL from the backend
      // Note: For Android Emulator use 'http://10.0.2.2:3000', for iOS Simulator 'http://localhost:3000'
      // For physical device, use your machine's LAN IP.
      // Using localhost for now assuming web or iOS simulator.
      const response = await fetch('http://localhost:3000/auth/canva/url');
      const data = await response.json();

      if (data.url) {
        // 2. Open the URL in the browser
        await WebBrowser.openBrowserAsync(data.url);
      } else {
        Alert.alert("Error", "Failed to get authorization URL");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while connecting to Canva");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Text>Xtra App</Text>
      <Button title="Log in with Canva" onPress={handleCanvaLogin} />
    </View>
  );
}
