import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { JobCard } from '../../components/JobCard';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../constants/theme';
import { JOB_CATEGORIES, TOP_COUNTRIES, MOCK_NOTIFICATIONS } from '../../constants/data';
import type { JobCategory } from '../../types';

const { width } = Dimensions.get('window');

export default function Home() {
  const insets = useSafeAreaInsets();
  const { user, featuredJobs, jobs, toggleSaveJob, isJobSaved, unreadCount, setFilters } = useStore();

  useEffect(() => {
    // no-op: jobs already loaded from store
  }, []);

  const recentJobs = jobs.slice(0, 5);

  function handleCategoryPress(categoryId: JobCategory) {
    setFilters({ category: categoryId });
    router.push('/(tabs)/search');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => {}}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Hero card */}
        <LinearGradient colors={Colors.gradient.primary} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View>
            <Text style={styles.heroTitle}>🤖 AI just found</Text>
            <Text style={styles.heroNumber}>{jobs.filter((j) => j.visaSponsorship).length} new visa-sponsored jobs</Text>
            <Text style={styles.heroSub}>Scraped from 200+ sources in the last hour</Text>
          </View>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => {
              setFilters({ visaOnly: true });
              router.push('/(tabs)/search');
            }}
          >
            <Text style={styles.heroBtnText}>View all</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <StatCard icon="briefcase-outline" value={`${jobs.length}`} label="Jobs Today" color={Colors.primary} />
          <StatCard icon="shield-checkmark-outline" value={`${jobs.filter((j) => j.visaSponsorship).length}`} label="Visa Sponsor" color={Colors.secondary} />
          <StatCard icon="globe-outline" value={`${new Set(jobs.map((j) => j.country)).size}`} label="Countries" color={Colors.accentOrange} />
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
        </View>
        <FlatList
          data={JOB_CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryCard}
              activeOpacity={0.8}
              onPress={() => handleCategoryPress(item.id as JobCategory)}
            >
              <Text style={styles.categoryEmoji}>{item.icon}</Text>
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Featured */}
        {featuredJobs.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ Featured Roles</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {featuredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => router.push(`/job/${job.id}`)}
                onSave={() => toggleSaveJob(job.id)}
                isSaved={isJobSaved(job.id)}
              />
            ))}
          </>
        )}

        {/* Top Countries */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🌍 Top Hiring Countries</Text>
        </View>
        <FlatList
          data={TOP_COUNTRIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.countryCard}
              activeOpacity={0.8}
              onPress={() => {
                setFilters({ country: item.name });
                router.push('/(tabs)/search');
              }}
            >
              <Text style={styles.countryFlag}>{item.flag}</Text>
              <Text style={styles.countryName}>{item.name.split(' ')[0]}</Text>
              <Text style={styles.countryJobs}>{item.jobs.toLocaleString()} jobs</Text>
            </TouchableOpacity>
          )}
        />

        {/* Recent Jobs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🕐 Recently Posted</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {recentJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onPress={() => router.push(`/job/${job.id}`)}
            onSave={() => toggleSaveJob(job.id)}
            isSaved={isJobSaved(job.id)}
          />
        ))}

        {/* Notifications preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
        </View>
        {MOCK_NOTIFICATIONS.slice(0, 3).map((n) => (
          <View key={n.id} style={[styles.notifCard, !n.read && styles.notifCardUnread]}>
            {!n.read && <View style={styles.unreadDot} />}
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>{n.title}</Text>
              <Text style={styles.notifBody}>{n.body}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '30' }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  greeting: { fontSize: FontSize.md, color: Colors.textSecondary },
  userName: { fontSize: FontSize.xl + 2, fontWeight: '800', color: Colors.text },
  notifBtn: { position: 'relative', padding: 4 },
  notifBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.error,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  hero: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  heroTitle: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  heroNumber: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff', lineHeight: 30 },
  heroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
  },
  heroBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.sm + 4,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  statValue: { fontSize: FontSize.xl, fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  categoryList: { paddingBottom: Spacing.xs, gap: Spacing.sm },
  categoryCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    minWidth: 80,
  },
  categoryEmoji: { fontSize: 24 },
  categoryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },
  countryCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    minWidth: 90,
  },
  countryFlag: { fontSize: 28 },
  countryName: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },
  countryJobs: { fontSize: FontSize.xs, color: Colors.textMuted },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notifCardUnread: { borderColor: Colors.primary + '40' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  notifBody: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
});
