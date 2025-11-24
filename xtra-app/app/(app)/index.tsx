import { Text, View, Alert, TextInput, StyleSheet } from "react-native";
import { Button } from "../../components/Button";
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// NOTE: Use 'http://10.0.2.2:3000' for Android Emulator, 'http://localhost:3000' for iOS Simulator.
const API_URL = 'http://localhost:3000';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        fetchUserData(storedToken);
      }
    };
    loadToken();
  }, []);

  const fetchUserData = async (currentToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        // Token might be invalid, so log out
        handleLogout();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch user data.");
      handleLogout();
    }
  };

  const handleAuth = async () => {
    const url = isLogin ? `${API_URL}/auth/login` : `${API_URL}/auth/signup`;
    const body = isLogin ? { email, password } : { email, password, displayName };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        setToken(data.token);
        fetchUserData(data.token);
      } else {
        Alert.alert("Authentication Failed", data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred during authentication.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  if (token && user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {user.displayName || user.email}!</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Login" : "Sign Up"}</Text>
      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isLogin ? "Login" : "Sign Up"} onPress={handleAuth} />
      <Text style={styles.toggleText} onPress={() => setIsLogin(!isLogin)}>
        {isLogin ? "Need an account? Sign Up" : "Have an account? Login"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  toggleText: {
    marginTop: 20,
    color: 'blue',
  },
});