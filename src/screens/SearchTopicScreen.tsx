import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, StatusBar, ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { C, F } from '../constants/theme';
import { fetchAndSummarise, Article } from '../services/api';
import NewsCard from '../components/NewsCard';
import { isBookmarked, addBookmark, removeBookmark } from '../services/bookmarks';

type Props = NativeStackScreenProps<any, 'SearchTopic'>;

export default function SearchTopicScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const data = await fetchAndSummarise('general', query);
    setArticles(data);

    // load bookmark states
    const bm: Record<string, boolean> = {};
    for (const a of data) { bm[a.id] = await isBookmarked(a.id); }
    setBookmarked(bm);

    setLoading(false);
  };

  const toggleBookmark = async (article: Article) => {
    const was = bookmarked[article.id];
    setBookmarked(prev => ({ ...prev, [article.id]: !was }));
    was ? await removeBookmark(article.id) : await addBookmark(article);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={{ uri: 'https://lh3.googleusercontent.com/aida/ADBb0uh4Tj79l1hyZ_g9hXs-05QIJVWpI4FQPVR259GkbWztI3MJnqBB5-Es6UeYnuL2AVupwsGXwwItNLv1EEQfN4CsM7J6d1Mu65X2YaV9PulFZKnGzOvpBNtupTMqdeKj38_jV5zAlTd3OvnWSR-NT9mX_qzG66zaGn-3V4j5oSWzPPbyYiTQtSzgkuUg9NnMpWAB5RIhPdzSKUNiEXd_yz0Zs8yX_lDBmifsdTX5AE10fHsnxHqHO38f0dtpxfeYO5PhiTrF-Hqd' }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="SEARCH TOPIC..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
        />
        <TouchableOpacity onPress={handleSearch} style={styles.iconBtn}>
          <Ionicons name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={C.accent} size="large" />
          </View>
        ) : articles.length > 0 ? (
          <View style={styles.cards}>
            {articles.map((a, i) => (
              <NewsCard
                key={a.id}
                article={a}
                bookmarked={!!bookmarked[a.id]}
                onBookmark={() => toggleBookmark(a)}
                delay={i * 100}
              />
            ))}
          </View>
        ) : (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Enter a topic to get the latest insights.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iconBtn: { padding: 8 },
  searchInput: {
    flex: 1,
    marginHorizontal: 12,
    color: '#FFF',
    fontFamily: F.body,
    fontSize: 14,
    letterSpacing: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  scroll: { padding: 20, paddingBottom: 100 },
  center: { marginTop: 100, alignItems: 'center' },
  emptyText: {
    fontFamily: F.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
  },
  cards: { gap: 20 },
});
