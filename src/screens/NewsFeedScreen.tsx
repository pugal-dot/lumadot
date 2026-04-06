import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar, RefreshControl, ActivityIndicator, ImageBackground, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import NewsCard from '../components/NewsCard';
import { C, F, CATEGORY_MAP, IMAGE_MAP } from '../constants/theme';
import { fetchAndSummarise, Article, FALLBACK_NEWS, fetchMarketSentiment, generatePersonalBriefing } from '../services/api';
import { addBookmark, removeBookmark, isBookmarked } from '../services/bookmarks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  navigation:     NativeStackNavigationProp<any>;
}

export default function NewsFeedScreen({ selectedFields, activeField, onChangeField, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const [articles,    setArticles]    = useState<Article[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [bookmarked,  setBookmarked]  = useState<Record<string, boolean>>({});
  
  // AI States
  const [briefing, setBriefing] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState('calculating AI sentiment...');

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

    // Call AI functions in parallel without blocking user interaction
    setBriefing([]); 
    setSentiment('calculating AI sentiment...');
    fetchMarketSentiment(data).then(setSentiment);
    generatePersonalBriefing(selectedFields, data).then(setBriefing);
  }, [selectedFields]);

  useEffect(() => { load(activeField); }, [activeField, load]);

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
    <View style={[styles.container, { minHeight: winH, width: winW }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {/* ✅ Fixed: explicit width/height so image fills full laptop screen */}
      <ImageBackground
        source={IMAGE_MAP[activeField]}
        style={[StyleSheet.absoluteFillObject, { width: winW, height: winH }]}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <Logo size={12} pulse />
          <Text style={styles.brandText}>LUMADOT</Text>
        </View>
        <View style={styles.fieldBadge}>
          <LiveDot />
          <Text style={styles.fieldLabel}>{fieldLabel.toLowerCase()}</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('SearchTopic')}>
            <Ionicons name="search" size={22} color={C.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={C.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Field tabs */}
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
          {selectedFields.map(f => (
            <TouchableOpacity key={f} onPress={() => onChangeField(f)} style={[styles.tab, activeField === f && styles.tabActive]}>
              <Text style={[styles.tabText, activeField === f && styles.tabTextActive]}>
                {f.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
            <View>
              <Text style={styles.feedTitle}>market{'\n'}insights</Text>
            </View>
            <Text style={styles.vol}>VOL. 24.08</Text>
          </View>
          <View style={styles.divider} />

          {/* AI Briefing Banner */}
          {briefing.length > 0 ? (
             <View style={styles.briefingBox}>
               <Text style={styles.briefingLabel}>AI PERSONAL BRIEFING</Text>
               {briefing.map((b, i) => (
                 <Text key={i} style={styles.briefingBullet}>• {b}</Text>
               ))}
             </View>
          ) : (
             <View style={styles.briefingBox}>
               <ActivityIndicator size="small" color={C.accent} style={{ alignSelf: 'flex-start' }} />
               <Text style={styles.briefingBullet}>Generating AI briefing...</Text>
             </View>
          )}

          {/* Cards */}
          <View style={styles.cards}>
            {articles.map((a, i) => (
              <NewsCard
                key={a.id}
                article={a}
                bookmarked={!!bookmarked[a.id]}
                onBookmark={() => toggleBookmark(a)}
                onExplain={() => navigation.navigate('ArticleChat', { article: a })}
                dimmed={i === articles.length - 1}
                delay={i * 100}
              />
            ))}
          </View>

          {/* Volatility widget */}
          <View style={styles.widget}>
            <View>
              <Text style={styles.widgetLabel}>MARKET SIGNAL</Text>
              <Text style={styles.widgetValue}>{sentiment}</Text>
            </View>
            <View style={styles.bars}>
              {[3, 5, 4, 7, 5, 3, 6].map((h, i) => (
                <View key={i} style={[styles.bar, { height: h * 5, opacity: 0.08 + i * 0.07 }]} />
              ))}
            </View>
          </View>
          <View style={{ height: 160 }} />
        </ScrollView>
      )}

      {/* Footer Back Button */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>←  CHANGE FIELDS</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#000', overflow: 'hidden' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  brandText: {
    fontFamily: F.body, fontSize: 13, color: '#FFF',
    letterSpacing: 6, textTransform: 'uppercase',
  },
  fieldBadge:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldLabel:   { fontFamily: F.body, fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: 4 },
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
  tabsWrap: { backgroundColor: 'rgba(0,0,0,0.3)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  tabs: { maxHeight: 44 },
  tabsContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  tab: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'transparent',
  },
  tabActive:     { borderBottomColor: C.text },
  tabText:       { fontFamily: F.body, fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 4 },
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
    color: '#FFF', letterSpacing: 5,
    textTransform: 'uppercase', lineHeight: 34,
  },
  vol:     { fontFamily: F.body, fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, marginBottom: 4 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 20, marginBottom: 24 },
  cards:   { paddingHorizontal: 20, gap: 20 },
  widget: {
    marginHorizontal: 20, marginTop: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  widgetLabel: { fontFamily: F.body, fontSize: 9, color: C.textDim, letterSpacing: 3, marginBottom: 6 },
  widgetValue: { fontFamily: F.body, fontSize: 13, color: '#FFF', letterSpacing: 2 },
  bars:        { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar:         { width: 4, backgroundColor: C.white },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cta: {
    backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 18,
    alignItems: 'center', borderRadius: 99,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  ctaText: { fontFamily: F.semibold, fontSize: 12, color: C.white, letterSpacing: 4 },
  briefingBox: {
    marginHorizontal: 20, marginBottom: 24, padding: 16,
    backgroundColor: 'rgba(91,79,232,0.1)', borderWidth: 1, borderColor: C.accentDim,
    borderRadius: 8, gap: 8,
  },
  briefingLabel: { fontFamily: F.semibold, fontSize: 9, color: C.accent, letterSpacing: 3 },
  briefingBullet: { fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
});
