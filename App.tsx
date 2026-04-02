import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold_Italic,
} from '@expo-google-fonts/playfair-display';

import SplashScreen       from './src/screens/SplashScreen';
import FieldSelectorScreen from './src/screens/FieldSelectorScreen';
import MainNavigator      from './src/navigation/MainNavigator';
import { C } from './src/constants/theme';

type Screen = 'splash' | 'fields' | 'main';

export default function App() {
  const [screen,          setScreen]          = useState<Screen>('splash');
  const [selectedFields,  setSelectedFields]  = useState<string[]>([]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold_Italic,
  });

  if (!fontsLoaded) return <View style={styles.blank} />;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={styles.root}>
          {screen === 'splash' && (
            <SplashScreen onStart={() => setScreen('fields')} />
          )}
          {screen === 'fields' && (
            <FieldSelectorScreen
              onContinue={(fields) => {
                setSelectedFields(fields);
                setScreen('main');
              }}
            />
          )}
          {screen === 'main' && (
            <MainNavigator selectedFields={selectedFields} />
          )}
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },
  blank: { flex: 1, backgroundColor: C.bg },
});
