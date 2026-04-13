import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { Colors, Spacing, Radius, FontSize } from '../constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🌍',
    title: 'Global Visa-Sponsored Jobs',
    description:
      'Discover thousands of jobs from top companies that actively sponsor work visas — H-1B, EU Blue Card, Skilled Worker, and more.',
    color: Colors.primary,
  },
  {
    id: '2',
    emoji: '🤖',
    title: 'AI-Powered Job Matching',
    description:
      'Our AI analyzes your skills, experience, and visa status to surface the best matches — and explains exactly why each role fits you.',
    color: '#9B59B6',
  },
  {
    id: '3',
    emoji: '⚡',
    title: 'Auto-Scraped Daily',
    description:
      'New jobs are scraped from 200+ career portals every day. Never miss a visa-sponsored opening again.',
    color: Colors.secondary,
  },
  {
    id: '4',
    emoji: '🎯',
    title: 'Your Career, Elevated',
    description:
      'Track applications, get visa guidance, and chat with our AI career coach — all in one place.',
    color: Colors.accentOrange,
  },
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const { setOnboarded } = useStore();

  const onViewChange = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
    }
  ).current;

  function handleNext() {
    if (activeIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      setOnboarded();
      router.replace('/(auth)/login');
    }
  }

  function handleSkip() {
    setOnboarded();
    router.replace('/(auth)/login');
  }

  return (
    <LinearGradient
      colors={[Colors.dark[100], Colors.dark[200], Colors.dark[300]]}
      style={[styles.container, { paddingBottom: insets.bottom + Spacing.xl }]}
    >
      <View style={[styles.skipRow, { paddingTop: insets.top + Spacing.sm }]}>
        {activeIndex < SLIDES.length - 1 ? (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewChange}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.emojiContainer, { backgroundColor: item.color + '22' }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex && { backgroundColor: Colors.primary, width: 24 },
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity activeOpacity={0.85} onPress={handleNext} style={styles.ctaWrapper}>
        <LinearGradient
          colors={Colors.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>
            {activeIndex < SLIDES.length - 1 ? 'Next' : 'Get Started'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  skipRow: {
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  skipText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
  slide: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl + 8,
  },
  emojiContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: FontSize.xxl + 2,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 34,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceBorder,
  },
  ctaWrapper: {
    width: width - Spacing.xl * 2,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md + 2,
    gap: 8,
  },
  ctaText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#fff',
  },
});
