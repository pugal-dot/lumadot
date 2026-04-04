import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { C, F } from '../constants/theme';
import { Article } from '../services/api';

interface Props {
  article: Article;
  bookmarked: boolean;
  onBookmark: () => void;
  onExplain?: () => void;
  dimmed?: boolean;
  delay?: number;
}

export default function NewsCard({ article, bookmarked, onBookmark, onExplain, dimmed, delay = 0 }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: dimmed ? 0.4 : 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, tension: 300 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 300 }).start();

  const openArticle = () => { if (article.url) Linking.openURL(article.url); };

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      <TouchableOpacity
        onPress={openArticle}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <BlurView intensity={40} tint="dark" style={styles.card}>
          <View style={styles.accent} />
          <View style={styles.body}>
            <View style={styles.metaRow}>
              <Text style={styles.source}>{article.source}</Text>
              <Text style={styles.time}>{article.time}</Text>
            </View>
            <Text style={styles.headline}>{article.headline}</Text>
            <Text style={styles.summary} numberOfLines={2}>{article.summary}</Text>
            <View style={styles.actions}>
              <View style={{flexDirection: 'row', gap: 16, alignItems: 'center'}}>
                <Text style={styles.readMore}>READ MORE →</Text>
                {onExplain && (
                  <TouchableOpacity onPress={onExplain}>
                     <Text style={[styles.readMore, {color: C.accent}]}>✨ EXPLAIN</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={onBookmark} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons
                  name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={16}
                  color={bookmarked ? C.accent : C.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', 
    overflow: 'hidden',
    borderRadius: 16,
  },
  accent: {
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  body: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  source: {
    fontFamily: F.body,
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
  time: {
    fontFamily: F.body,
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
  },
  headline: {
    fontFamily: F.body,
    fontSize: 20,
    color: '#FFF',
    letterSpacing: 1,
    textTransform: 'lowercase',
    lineHeight: 32,
  },
  summary: {
    fontFamily: F.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  readMore: {
    fontFamily: F.medium,
    fontSize: 9,
    color: C.textDim,
    letterSpacing: 3,
  },
});
