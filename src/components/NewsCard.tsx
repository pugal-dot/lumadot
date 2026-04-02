import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F } from '../constants/theme';
import { Article } from '../services/api';

interface Props {
  article: Article;
  bookmarked: boolean;
  onBookmark: () => void;
  dimmed?: boolean;
  delay?: number;
}

export default function NewsCard({ article, bookmarked, onBookmark, dimmed, delay = 0 }: Props) {
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
        <View style={styles.card}>
          <View style={styles.accent} />
          <View style={styles.body}>
            <View style={styles.metaRow}>
              <Text style={styles.source}>{article.source}</Text>
              <Text style={styles.time}>{article.time}</Text>
            </View>
            <Text style={styles.headline}>{article.headline}</Text>
            <Text style={styles.summary} numberOfLines={2}>{article.summary}</Text>
            <View style={styles.actions}>
              <Text style={styles.readMore}>READ MORE →</Text>
              <TouchableOpacity onPress={onBookmark} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons
                  name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={16}
                  color={bookmarked ? C.accent : C.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: C.cardBg,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  accent: {
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  body: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  source: {
    fontFamily: F.body,
    fontSize: 9,
    color: C.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  time: {
    fontFamily: F.body,
    fontSize: 9,
    color: C.textDim,
    letterSpacing: 2,
  },
  headline: {
    fontFamily: F.body,
    fontSize: 16,
    color: C.text,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    lineHeight: 24,
  },
  summary: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 21,
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
