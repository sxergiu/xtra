import React, { useState } from 'react';
import { View, Text, Button, Image } from 'react-native';

export default function App() {
  const [image, setImage] = useState(null);

  const generate = async () => {
    const res = await fetch('http://192.168.0.105:3000/comfy/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'a sunset over the ocean' }),
    });
    const data = await res.json();
    setImage(data.image);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Generate Image" onPress={generate} />
      {image && (
        <Image
          source={{ uri: `data:image/png;base64,${image}` }}
          style={{ width: 300, height: 300, marginTop: 20 }}
        />
      )}
    </View>
  );
}
