import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { C, F } from '../constants/theme';

export default function Logo({ size = 14, pulse = false }: { size?: number; pulse?: boolean }) {
  const glow = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!pulse) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1,   duration: 1000, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const dotSize = size * 0.55;

  return (
    <View style={styles.row}>
      <Text style={[styles.text, { fontSize: size }]}>luma</Text>
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize, height: dotSize, borderRadius: dotSize / 2,
            opacity: pulse ? glow : 1,
            shadowRadius: dotSize * 1.2,
          },
        ]}
      />
      <Text style={[styles.text, { fontSize: size }]}>dot</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: {
    fontFamily: F.medium,
    color: C.text,
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  dot: {
    backgroundColor: C.accent,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    elevation: 6,
  },
});
