import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, StatusBar, ImageBackground, useWindowDimensions
} from 'react-native';
import { C, F } from '../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const { width: winW, height: winH } = useWindowDimensions();
  const btnScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Simple fade-in for content
  useEffect(() => {
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 1200,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, tension: 300 }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, tension: 300 }).start();

  return (
    <View style={[styles.container, { height: winH, width: winW }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Image with Dark Overlay */}
      <ImageBackground
        source={require('../../assets/1.jpeg')}
        style={[StyleSheet.absoluteFillObject, { width: winW, height: winH }]}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>

      <Animated.View style={[styles.main, { opacity: contentOpacity }]}>
        {/* Headline */}
        <View style={styles.spaceY4}>
          <Text style={styles.headline}>WHAT'S MOVING{'\n'}THE WORLD?</Text>
        </View>

        {/* Brand */}
        <View style={styles.brandRow}>
          <Text style={styles.brandLabel}>luma</Text>
          <Text style={styles.brandLabel}>dot</Text>
        </View>

        {/* CTA */}
        <Animated.View style={{ transform: [{ scale: btnScale }], paddingTop: 32 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Fields')}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            activeOpacity={1}
          >
            <View style={styles.button}>
              <Text style={styles.buttonText}>get started</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: contentOpacity }]}>
        <Text style={styles.footerText}>BY LUMADOT</Text>
      </Animated.View>

      {/* Decorative Particle Effect Layer */}
      <View style={styles.particles} pointerEvents="none">
        <View style={[styles.particle1, { top: '25%', left: '25%' }]} />
        <View style={[styles.particle2, { bottom: '25%', left: '50%' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', overflow: 'hidden' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 48,
    zIndex: 10,
  },
  spaceY4: { gap: 16 },
  headline: {
    fontFamily: F.serifReg,
    fontSize: 44, // equivalent to text-5xl
    color: '#F5F5F5',
    textAlign: 'center',
    lineHeight: 52,
    textTransform: 'uppercase',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLabel: {
    fontFamily: F.medium,
    fontSize: 24,
    color: '#F5F5F5',
    letterSpacing: 6, // 0.3em loosely translated
    textTransform: 'uppercase',
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: F.medium,
    fontSize: 14,
    color: '#F5F5F5',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  footerText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: 'rgba(245,245,245,0.4)',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  particles: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
    zIndex: 0,
  },
  particle1: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(196,192,255,0.2)', // primary/20
  },
  particle2: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(200,196,216,0.2)', // on-surface-variant/20
  },
});
