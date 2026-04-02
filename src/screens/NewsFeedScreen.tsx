import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import NewsCard from '../components/NewsCard';
import { C, F, FIELDS, CATEGORY_MAP } from '../constants/theme';
import { fetchAndSummarise, Article, FALLBACK_NEWS } from '../services/api';
import { addBookmark, removeBookmark, isBookmarked, getBookmarks } from '../services/bookmarks';

// Live pulsing dot
function LiveDot() {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.9, duration: 900, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,   duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={styles.liveDotWrap}>
      <Animated.View style={[styles.liveDotRing, {
        transform: [{ scale }],
        opacity: scale.interpolate({ inputRange: [1, 1.9], outputRange: [0.6, 0] }),
      }]} />
      <View style={styles.liveDot} />
    </View>
  );
}

interface Props {
  selectedFields: string[];
  activeField:    string;
  onChangeField:  (f: string) => void;
  navigation:     any;
}

export default function NewsFeedScreen({ selectedFields, activeField, onChangeField, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [articles,    setArticles]    = useState<Article[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [bookmarked,  setBookmarked]  = useState<Record<string, boolean>>({});

  const load = useCallback(async (field: string) => {
    setLoading(true);
    const category = CATEGORY_MAP[field] ?? 'general';
    const data = await fetchAndSummarise(category);
    setArticles(data.length ? data : FALLBACK_NEWS);
    // load bookmark states
    const bm: Record<string, boolean> = {};
    for (const a of data) { bm[a.id] = await isBookmarked(a.id); }
    setBookmarked(bm);
    setLoading(false);
  }, []);

  useEffect(() => { load(activeField); }, [activeField]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(activeField);
    setRefreshing(false);
  };

  const toggleBookmark = async (article: Article) => {
    const was = bookmarked[article.id];
    setBookmarked(prev => ({ ...prev, [article.id]: !was }));
    was ? await removeBookmark(article.id) : await addBookmark(article);
  };

  const fieldLabel = activeField.charAt(0).toUpperCase() + activeField.slice(1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Logo size={12} pulse />
        <View style={styles.fieldBadge}>
          <LiveDot />
          <Text style={styles.fieldLabel}>{fieldLabel.toUpperCase()}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* Field tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
        {selectedFields.map(f => (
          <TouchableOpacity key={f} onPress={() => onChangeField(f)} style={[styles.tab, activeField === f && styles.tabActive]}>
            <Text style={[styles.tabText, activeField === f && styles.tabTextActive]}>
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={C.accent} size="small" />
          <Text style={styles.loadingText}>fetching {fieldLabel} news…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />
          }
        >
          {/* Header */}
          <View style={styles.feedHeader}>
            <Text style={styles.feedTitle}>{fieldLabel.toLowerCase()}{'\n'}insights</Text>
            <Text style={styles.vol}>VOL. 24.08</Text>
          </View>
          <View style={styles.divider} />

          {/* Cards */}
          <View style={styles.cards}>
            {articles.map((a, i) => (
              <NewsCard
                key={a.id}
                article={a}
                bookmarked={!!bookmarked[a.id]}
                onBookmark={() => toggleBookmark(a)}
                dimmed={i === articles.length - 1}
                delay={i * 100}
              />
            ))}
          </View>

          {/* Volatility widget */}
          <View style={styles.widget}>
            <View>
              <Text style={styles.widgetLabel}>MARKET SIGNAL</Text>
              <Text style={styles.widgetValue}>low stable • 12.4</Text>
            </View>
            <View style={styles.bars}>
              {[3, 5, 4, 7, 5, 3, 6].map((h, i) => (
                <View key={i} style={[styles.bar, { height: h * 5, opacity: 0.08 + i * 0.07 }]} />
              ))}
            </View>
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  fieldBadge:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldLabel:   { fontFamily: F.body, fontSize: 9, color: C.textMuted, letterSpacing: 5 },
  liveDotWrap:  { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  liveDot: {
    width: 6, height: 6, borderRadius: 3, position: 'absolute',
    backgroundColor: C.accent,
    shadowColor: C.accent, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 4,
  },
  liveDotRing: {
    width: 14, height: 14, borderRadius: 7, position: 'absolute',
    backgroundColor: C.accent,
  },
  iconBtn:  { padding: 4 },
  tabs: { borderBottomWidth: 1, borderBottomColor: C.border, maxHeight: 44 },
  tabsContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  tab: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'transparent',
  },
  tabActive:     { borderBottomColor: C.text },
  tabText:       { fontFamily: F.body, fontSize: 9, color: C.textDim, letterSpacing: 4 },
  tabTextActive: { color: C.text },
  loadingWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:   { fontFamily: F.body, fontSize: 11, color: C.textMuted, letterSpacing: 3 },
  scroll:        { paddingBottom: 20 },
  feedHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 20, paddingTop: 28, paddingBottom: 16,
  },
  feedTitle: {
    fontFamily: F.body, fontSize: 24,
    color: C.text, letterSpacing: 5,
    textTransform: 'uppercase', lineHeight: 34,
  },
  vol:     { fontFamily: F.body, fontSize: 9, color: C.textDim, letterSpacing: 3 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.10)', marginHorizontal: 20, marginBottom: 24 },
  cards:   { paddingHorizontal: 20, gap: 20 },
  widget: {
    marginHorizontal: 20, marginTop: 24,
    borderWidth: 1, borderColor: C.border,
    backgroundColor: C.cardBg,
    padding: 20, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  widgetLabel: { fontFamily: F.body, fontSize: 9, color: C.textDim, letterSpacing: 3, marginBottom: 6 },
  widgetValue: { fontFamily: F.body, fontSize: 13, color: C.text, letterSpacing: 2 },
  bars:        { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar:         { width: 4, backgroundColor: C.white },
});
