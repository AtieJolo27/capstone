import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatScreen() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    
    try {
      // In local development, Expo maps API routes relative to your origin
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const json = await res.json();
      setResponse(json.data || json.error);
    } catch (err) {
      setResponse('Failed to reach server backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type a message for Groq..."
        value={prompt}
        onChangeText={setPrompt}
      />
      <TouchableOpacity style={styles.button} onPress={handleAskAI}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send</Text>}
      </TouchableOpacity>
      <Text style={styles.resultText}>{response}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 10 },
  button: { backgroundColor: '#f15a24', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  resultText: { marginTop: 20, fontSize: 16, color: '#333' },
});
