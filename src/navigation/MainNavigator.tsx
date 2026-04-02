import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NewsFeedScreen from '../screens/NewsFeedScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import { C, F } from '../constants/theme';

const Tab = createBottomTabNavigator();

// Custom tab bar matching Stitch glassmorphism design
function TabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const TABS = [
    { name: 'Feed',      icon: 'home-outline',      iconActive: 'home'           },
    { name: 'Bookmarks', icon: 'bookmark-outline',   iconActive: 'bookmark'       },
  ];

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]}>
      {TABS.map((tab, i) => {
        const focused = state.index === i;
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            style={styles.tabBtn}
          >
            <View style={[styles.tabInner, focused && styles.tabInnerActive]}>
              <Ionicons
                name={(focused ? tab.iconActive : tab.icon) as any}
                size={20}
                color={focused ? C.text : 'rgba(255,255,255,0.30)'}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MainNavigator({ selectedFields }: { selectedFields: string[] }) {
  const [activeField, setActiveField] = useState(selectedFields[0] ?? 'technology');

  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Feed">
        {(props) => (
          <NewsFeedScreen
            {...props}
            selectedFields={selectedFields}
            activeField={activeField}
            onChangeField={setActiveField}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    backgroundColor: C.navBg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  tabBtn:      { flex: 1, alignItems: 'center' },
  tabInner: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 22,
  },
  tabInnerActive: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
