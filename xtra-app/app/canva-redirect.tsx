import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function CanvaRedirectScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Canva Redirect' }} />
      <Text style={styles.message}>Successfully redirected from Canva! You can close this window.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
  },
});
