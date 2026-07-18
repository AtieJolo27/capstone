import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  AppState,
  AppStateStatus,
  StatusBar
} from 'react-native';
import * as Updates from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';

// Hold the native splash screen overlay completely visible on application boot
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn('Native splash containment lock failure:', err);
});

interface Todo {
  id: string;
  text: string;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isAppReady, setIsAppReady] = useState<boolean>(false);

  // 1. Initial Launch: Run validation logic tucked safely behind the Splash Screen
  useEffect(() => {
    async function initializeSystem() {
      try {
        if (!__DEV__) {
          // Check for critical structural updates prior to mounting UI layers
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync(); // Instantly reboot application container with fresh logic
            return;
          }
        }
      } catch (error) {
        // Network offline or timeout - allow application engine to boot gracefully using fallback state
        console.log('Update servers unreachable during initialization phase:', error);
      } finally {
        setIsAppReady(true);
      }
    }

    initializeSystem();
  }, []);

  // 2. Continuous Monitoring: Dynamic listener captures updates when pulling app back to foreground
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && !__DEV__) {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            Alert.alert(
              'Patch Available',
              'An updated production patch has been seamlessly synced over-the-air. Relaunch now to apply changes?',
              [
                { text: 'Postpone', style: 'cancel' },
                { text: 'Relaunch', onPress: async () => { await Updates.reloadAsync(); } }
              ]
            );
          }
        } catch (error) {
          console.log('Background pipeline check failed:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Callback triggers immediately when components lay down content pixels onto hardware screen
  const onLayoutRootView = useCallback(async () => {
    if (isAppReady) {
      // Release the splash screen lock cleanly with no transition flickers
      await SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!isAppReady) {
    return null;
  }

  // To-Do Logic Function Handlers
  const addTodo = () => {
    if (inputText.trim() === '') return;
    const newTodo: Todo = { id: Date.now().toString(), text: inputText.trim() };
    setTodos([...todos, newTodo]);
    setInputText('');
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.innerContainer}
      >
        <Text style={styles.headerTitle}></Text>
        
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.todoItem}>
              <Text style={styles.todoText}>{item.text}</Text>
              <TouchableOpacity onPress={() => deleteTodo(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Zero tracking items cataloged inside this session profile.</Text>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Log new item matrix entries..."
            placeholderTextColor="#555"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.addButton} onPress={addTodo}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  innerContainer: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#FFF', marginTop: 24, marginBottom: 8, letterSpacing: 0.2 },
  listContainer: { paddingTop: 12 },
  todoItem: { flexDirection: 'row', backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', borderColor: '#262626', borderWidth: 1 },
  todoText: { color: '#E5E5E5', fontSize: 16, flex: 1, marginRight: 12 },
  deleteButton: { backgroundColor: '#CF6679', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  deleteButtonText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  emptyText: { color: '#444', textAlign: 'center', marginTop: 60, fontSize: 15, fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', marginBottom: 24, alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#1A1A1A', color: '#FFF', padding: 16, borderRadius: 12, fontSize: 16, marginRight: 14, borderColor: '#262626', borderWidth: 1 },
  addButton: { backgroundColor: '#03DAC6', width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#000', fontSize: 28, fontWeight: 'bold' },
});
