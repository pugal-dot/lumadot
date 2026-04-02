import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, StatusBar,
} from 'react-native';
import { C, F } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height,
  delay: Math.random() * 4000,
  size: Math.random() > 0.7 ? 2 : 1,
}));

function Particle({ x, y, delay, size }: { x: number; y: number; delay: number; size: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const ty      = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.5,  duration: 2500, useNativeDriver: true }),
          Animated.timing(ty,      { toValue: -16,  duration: 3500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0,    duration: 2500, useNativeDriver: true }),
          Animated.timing(ty,      { toValue: 0,    duration: 3500, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.particle,
        { left: x, top: y, width: size, height: size, borderRadius: size / 2, opacity, transform: [{ translateY: ty }] },
      ]}
    />
  );
}

export default function SplashScreen({ onStart }: { onStart: () => void }) {
  const hOpacity = useRef(new Animated.Value(0)).current;
  const hY       = useRef(new Animated.Value(50)).current;
  const lOpacity = useRef(new Animated.Value(0)).current;
  const lScale   = useRef(new Animated.Value(0.88)).current;
  const bOpacity = useRef(new Animated.Value(0)).current;
  const bY       = useRef(new Animated.Value(24)).current;
  const dotScale = useRef(new Animated.Value(1)).current;
  const dotGlow  = useRef(new Animated.Value(0.5)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // headline
    Animated.parallel([
      Animated.timing(hOpacity, { toValue: 1,  duration: 900, delay: 200, useNativeDriver: true }),
      Animated.timing(hY,       { toValue: 0,  duration: 900, delay: 200, useNativeDriver: true }),
    ]).start();
    // logo
    Animated.parallel([
      Animated.timing(lOpacity, { toValue: 1, duration: 700, delay: 800, useNativeDriver: true }),
      Animated.spring(lScale,   { toValue: 1, delay: 800,    useNativeDriver: true, tension: 80, friction: 8 }),
    ]).start();
    // dot heartbeat
    setTimeout(() => {
      Animated.sequence([
        Animated.spring(dotScale, { toValue: 1.8, useNativeDriver: true, tension: 300, friction: 5 }),
        Animated.spring(dotScale, { toValue: 1,   useNativeDriver: true, tension: 300, friction: 5 }),
        Animated.delay(180),
        Animated.spring(dotScale, { toValue: 1.4, useNativeDriver: true, tension: 300, friction: 5 }),
        Animated.spring(dotScale, { toValue: 1,   useNativeDriver: true, tension: 300, friction: 5 }),
      ]).start();
    }, 1000);
    // button
    Animated.parallel([
      Animated.timing(bOpacity, { toValue: 1, duration: 700, delay: 1400, useNativeDriver: true }),
      Animated.timing(bY,       { toValue: 0, duration: 700, delay: 1400, useNativeDriver: true }),
    ]).start();
    // dot breathing loop
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotGlow, { toValue: 1,   duration: 1200, useNativeDriver: true }),
          Animated.timing(dotGlow, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    }, 1800);
  }, []);

  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, tension: 300 }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, tension: 300 }).start();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {PARTICLES.map(p => <Particle key={p.id} {...p} />)}

      <View style={styles.center}>
        {/* Headline */}
        <Animated.Text style={[styles.headline, { opacity: hOpacity, transform: [{ translateY: hY }] }]}>
          WHAT'S MOVING{'\n'}THE WORLD?
        </Animated.Text>

        {/* Logo */}
        <Animated.View style={[styles.logoRow, { opacity: lOpacity, transform: [{ scale: lScale }] }]}>
          <Text style={styles.logoText}>luma</Text>
          <Animated.View style={[styles.dot, { transform: [{ scale: dotScale }], opacity: dotGlow }]} />
          <Text style={styles.logoText}>dot</Text>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={{ opacity: bOpacity, transform: [{ translateY: bY }, { scale: btnScale }] }}>
          <TouchableOpacity onPress={onStart} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>GET STARTED</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Text style={styles.footer}>BY LUMA.DOT</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.black, alignItems: 'center', justifyContent: 'center' },
  particle:   { position: 'absolute', backgroundColor: C.accent },
  center:     { alignItems: 'center', gap: 48 },
  headline: {
    fontFamily: F.semibold,
    fontSize: 32,
    color: C.text,
    textAlign: 'center',
    letterSpacing: 6,
    lineHeight: 48,
    textTransform: 'uppercase',
  },
  logoRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoText: { fontFamily: F.medium, fontSize: 20, color: C.text, letterSpacing: 10, textTransform: 'uppercase' },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.accent,
    shadowColor: C.accent, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 8,
  },
  button: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999, paddingHorizontal: 48, paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  buttonText: { fontFamily: F.medium, fontSize: 12, color: C.text, letterSpacing: 6 },
  footer: {
    position: 'absolute', bottom: 48,
    fontFamily: F.body, fontSize: 10,
    color: 'rgba(255,255,255,0.20)', letterSpacing: 5,
  },
});
