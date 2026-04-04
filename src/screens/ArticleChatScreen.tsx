import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Animated, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { C, F } from '../constants/theme';
import { Article, chatAboutArticle } from '../services/api';

interface Msg {
  role: 'user' | 'assistant';
  text: string;
}

export default function ArticleChatScreen({ navigation, route }: { navigation: NativeStackNavigationProp<any>, route: any }) {
  const article: Article = route.params.article;
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', text: `I read "${article.headline}". What do you want me to explain?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (preset?: string) => {
    const txt = preset || input.trim();
    if (!txt) return;

    setMessages(prev => [...prev, { role: 'user', text: txt }]);
    setInput('');
    setLoading(true);

    const articleContext = `${article.headline}\n${article.summary}\n${article.raw || ''}`;
    const response = await chatAboutArticle(articleContext, txt);

    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Header */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RAG EXPLORER</Text>
        <View style={{ width: 44 }} />
      </BlurView>

      {/* Chat History */}
      <ScrollView contentContainerStyle={styles.chatScroll}>
        <View style={styles.articleRef}>
          <Text style={styles.articleRefLabel}>CONTEXT LOADED</Text>
          <Text style={styles.articleRefText} numberOfLines={2}>{article.headline}</Text>
        </View>

        {messages.map((m, i) => (
          <View key={i} style={[styles.msgRow, m.role === 'user' ? styles.userRow : styles.aiRow]}>
            <View style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={styles.msgText}>{m.text}</Text>
            </View>
          </View>
        ))}

        {loading && (
          <View style={[styles.msgRow, styles.aiRow]}>
            <View style={[styles.bubble, styles.aiBubble]}>
              <ActivityIndicator size="small" color={C.accent} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Prompts & Input */}
      <View style={styles.inputArea}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.prompts}>
          <TouchableOpacity style={styles.promptBtn} onPress={() => sendMessage("Why is this moving the market?")}>
            <Text style={styles.promptText}>Market Impact?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.promptBtn} onPress={() => sendMessage("Break this down for a 5-year-old.")}>
            <Text style={styles.promptText}>Simplify</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.promptBtn} onPress={() => sendMessage("Who are the key players involved?")}>
            <Text style={styles.promptText}>Key Players</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask anything..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()}>
            <Ionicons name="arrow-up" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  headerTitle: { fontFamily: F.body, fontSize: 13, color: '#FFF', letterSpacing: 4 },
  chatScroll: { padding: 20, paddingBottom: 40 },
  articleRef: {
    padding: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 24,
  },
  articleRefLabel: { fontFamily: F.body, fontSize: 9, color: C.accent, letterSpacing: 2, marginBottom: 4 },
  articleRefText: { fontFamily: F.semibold, fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },
  msgRow: { marginBottom: 16 },
  userRow: { alignItems: 'flex-end' },
  aiRow: { alignItems: 'flex-start' },
  bubble: { maxWidth: '80%', padding: 16, borderRadius: 16 },
  userBubble: { backgroundColor: C.accent, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: 'rgba(255,255,255,0.1)', borderBottomLeftRadius: 4 },
  msgText: { fontFamily: F.body, fontSize: 14, color: '#FFF', lineHeight: 22 },
  inputArea: {
    paddingBottom: 40, paddingTop: 10, paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.9)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)'
  },
  prompts: { gap: 8, paddingBottom: 12, alignItems: 'center' },
  promptBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  promptText: { fontFamily: F.body, fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: {
    flex: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24, paddingHorizontal: 20,
    fontFamily: F.body, fontSize: 14, color: '#FFF',
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF',
    alignItems: 'center', justifyContent: 'center'
  }
});
