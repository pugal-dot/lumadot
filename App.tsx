import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import SearchTopicScreen  from './src/screens/SearchTopicScreen';
import ArticleChatScreen  from './src/screens/ArticleChatScreen';
import { C } from './src/constants/theme';

const Stack = createNativeStackNavigator();

export default function App() {
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
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Fields">
            {props => (
              <FieldSelectorScreen 
                {...props}
                onContinue={(fields) => {
                  setSelectedFields(fields);
                  props.navigation.navigate('Main');
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Main">
            {props => <MainNavigator {...props} selectedFields={selectedFields} />}
          </Stack.Screen>
          <Stack.Screen name="SearchTopic" component={SearchTopicScreen} />
          <Stack.Screen name="ArticleChat" component={ArticleChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },
  blank: { flex: 1, backgroundColor: C.bg },
});
