import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, StatusBar, ImageBackground, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F, FIELDS, IMAGE_MAP } from '../constants/theme';

const GAP = 12;
const PAD = 20;

const ICON_MAP: Record<string, string> = {
  technology: 'laptop-outline', finance: 'bar-chart-outline',
  ai: 'hardware-chip-outline', health: 'flask-outline',
  space: 'rocket-outline', geopolitics: 'earth-outline',
  crypto: 'logo-bitcoin', energy: 'flash-outline',
};

function FieldCard({
  field, selected, onToggle, cardW, cardH,
}: {
  field: typeof FIELDS[0]; selected: boolean; onToggle: () => void; cardW: number; cardH: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const rotX  = useRef(new Animated.Value(0)).current;
  const rotY  = useRef(new Animated.Value(0)).current;

  const onPressIn = () => Animated.parallel([
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 300, friction: 10 }),
    Animated.timing(rotX,  { toValue: 1, duration: 120, useNativeDriver: true }),
    Animated.timing(rotY,  { toValue: 1, duration: 120, useNativeDriver: true }),
  ]).start();

  const onPressOut = () => Animated.parallel([
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }),
    Animated.spring(rotX,  { toValue: 0, useNativeDriver: true, tension: 200, friction: 8 }),
    Animated.spring(rotY,  { toValue: 0, useNativeDriver: true, tension: 200, friction: 8 }),
  ]).start();

  const rx = rotX.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '5deg'] });
  const ry = rotY.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-5deg'] });

  return (
    <TouchableOpacity
      onPress={onToggle} onPressIn={onPressIn} onPressOut={onPressOut}
      activeOpacity={1} style={{ width: cardW, height: cardH }}
    >
      <Animated.View style={[
        styles.card,
        selected && styles.cardSelected,
        { transform: [{ scale }, { perspective: 800 }, { rotateX: rx }, { rotateY: ry }] },
      ]}>
        {/* ✅ Fixed: use require() result directly, not { uri: ... } */}
        <ImageBackground
          source={IMAGE_MAP[field.id]}
          style={StyleSheet.absoluteFillObject}
          imageStyle={{ opacity: selected ? 0.85 : 0.45 }}
          resizeMode="cover"
        />
        <View style={[StyleSheet.absoluteFillObject, {
          backgroundColor: selected ? 'rgba(20,10,60,0.45)' : 'rgba(0,0,0,0.55)',
        }]} />

        <View style={{ flex: 1, padding: 16, justifyContent: 'space-between', zIndex: 10 }}>
          <Ionicons
            name={ICON_MAP[field.id] as any}
            size={22}
            color={C.text}
            style={{ opacity: selected ? 1 : 0.7 }}
          />
          <View style={styles.cardBottom}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>{field.label.toUpperCase()}</Text>
              {selected && <View style={styles.selDot} />}
            </View>
            <Text style={[styles.cardDesc, selected && styles.cardDescSel]} numberOfLines={1}>
              {field.desc}
            </Text>
          </View>
        </View>
        {selected && <View style={styles.selOverlay} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function FieldSelectorScreen({ onContinue }: { onContinue: (fields: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { width: winW, height: winH } = useWindowDimensions();
  const btnScale = useRef(new Animated.Value(1)).current;

  // ✅ Responsive: recalculate on every render based on current window width
  const isLaptop = winW >= 768;
  const COLS  = isLaptop ? 4 : 2;
  const CARD_W = (winW - PAD * 2 - GAP * (COLS - 1)) / COLS;
  const CARD_H = isLaptop ? 200 : 130;

  const toggle = (id: string) => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, tension: 300 }).start();

  return (
    <View style={[styles.container, { minHeight: winH, width: winW }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: isLaptop ? 100 : 72 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headline, { fontSize: isLaptop ? 48 : 40 }]}>
            your world<Text style={styles.headlineDot}>.</Text>
          </Text>
          <Text style={styles.sub}>PICK WHAT MOVES YOU</Text>
          {selected.size > 0 && (
            <Text style={styles.count}>{selected.size} selected</Text>
          )}
        </View>

        <View style={styles.grid}>
          {FIELDS.map(f => (
            <FieldCard
              key={f.id} field={f}
              selected={selected.has(f.id)}
              onToggle={() => toggle(f.id)}
              cardW={CARD_W} cardH={CARD_H}
            />
          ))}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            onPress={() => selected.size > 0 && onContinue(Array.from(selected))}
            onPressIn={onPressIn} onPressOut={onPressOut}
            activeOpacity={1}
          >
            <View style={[styles.cta, selected.size === 0 && styles.ctaDim]}>
              <Text style={[styles.ctaText, selected.size === 0 && styles.ctaTextDim]}>
                ENTER SESSION  →
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#000', overflow: 'hidden' },
  scroll:      { paddingHorizontal: PAD },
  header:      { marginBottom: 32, gap: 8 },
  headline:    { fontFamily: F.serifReg, color: C.text, letterSpacing: 1 },
  headlineDot: { fontFamily: F.serifItal, opacity: 0.8 },
  sub:         { fontFamily: F.body, fontSize: 10, color: C.textMuted, letterSpacing: 6 },
  count:       { fontFamily: F.body, fontSize: 10, color: C.accent, letterSpacing: 3, marginTop: 4 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  card: {
    width: '100%', height: '100%',
    backgroundColor: C.cardBg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, overflow: 'hidden',
  },
  cardSelected: {
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  cardBottom:  { gap: 4 },
  titleRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: {
    fontFamily: F.semibold, fontSize: 13,
    color: '#FFF', letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  selDot:      { width: 5, height: 5, borderRadius: 3, backgroundColor: '#FFF' },
  cardDesc: {
    fontFamily: F.body, fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  cardDescSel:  { color: 'rgba(255,255,255,0.95)' },
  selOverlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.03)' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cta:         { backgroundColor: C.white, paddingVertical: 18, alignItems: 'center', borderRadius: 99 },
  ctaDim:      { backgroundColor: 'rgba(255,255,255,0.15)' },
  ctaText:     { fontFamily: F.semibold, fontSize: 12, color: C.black, letterSpacing: 5 },
  ctaTextDim:  { color: 'rgba(255,255,255,0.4)' },
});
