
import { Text, View } from "react-native";
import { Button } from "../components/Button";

export default function Index() {
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
      <Button title="Log in with Canva" onPress={() => alert('Button Pressed!')} />
    </View>
  );
}
