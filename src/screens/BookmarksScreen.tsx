import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import NewsCard from '../components/NewsCard';
import { C, F } from '../constants/theme';
import { getBookmarks, removeBookmark, Article } from '../services/bookmarks';

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const [articles, setArticles] = useState<Article[]>([]);

  useFocusEffect(
    useCallback(() => { getBookmarks().then(setArticles); }, [])
  );

  const handleRemove = async (id: string) => {
    await removeBookmark(id);
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.topBar}>
        <Logo size={12} />
        <Text style={styles.screenLabel}>SAVED</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>saved<Text style={styles.titleDot}>.</Text></Text>
        <View style={styles.divider} />

        {articles.length === 0 ? (
          <View style={styles.empty}>
            {/* Dot grid illustration */}
            <View style={styles.dotGrid}>
              {Array.from({ length: 25 }).map((_, i) => (
                <View key={i} style={styles.dotGridDot} />
              ))}
            </View>
            <Text style={styles.emptyTitle}>nothing here yet</Text>
            <Text style={styles.emptyText}>start exploring and bookmark articles{'\n'}you want to read later</Text>
          </View>
        ) : (
          <View style={styles.cards}>
            {articles.map((a, i) => (
              <NewsCard
                key={a.id}
                article={a}
                bookmarked
                onBookmark={() => handleRemove(a.id)}
                delay={i * 80}
              />
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  screenLabel: { fontFamily: F.body, fontSize: 9, color: C.textMuted, letterSpacing: 5 },
  scroll:  { padding: 20 },
  title:   { fontFamily: F.serifReg, fontSize: 40, color: C.text, marginBottom: 20 },
  titleDot:{ fontFamily: F.serifItal },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.10)', marginBottom: 24 },
  empty:   { alignItems: 'center', paddingTop: 60, gap: 16 },
  dotGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    width: 110, gap: 10, marginBottom: 12, opacity: 0.2,
  },
  dotGridDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.white },
  emptyTitle: { fontFamily: F.medium, fontSize: 14, color: C.text, letterSpacing: 3, textTransform: 'uppercase' },
  emptyText:  { fontFamily: F.body, fontSize: 12, color: C.textMuted, textAlign: 'center', lineHeight: 20, letterSpacing: 1 },
  cards: { gap: 20 },
});
