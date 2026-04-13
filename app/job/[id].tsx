import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../constants/theme';

const { width } = Dimensions.get('window');

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

function formatSalary(min: number, max: number, currency: string, period: string): string {
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));
  const sym =
    currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'CAD' ? 'C$' : currency;
  return `${sym}${fmt(min)} – ${sym}${fmt(max)} / ${period === 'year' ? 'year' : period}`;
}

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { jobs, toggleSaveJob, isJobSaved, applyToJob, user, applications } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'benefits'>('overview');

  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: Colors.textSecondary }}>Job not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const saved = isJobSaved(job.id);
  const application = applications.find((a) => a.jobId === job.id);
  const hasApplied = !!application || user?.appliedJobIds.includes(job.id);

  function handleApply() {
    if (!job) return;
    if (hasApplied) {
      Alert.alert('Already Applied', 'You have already applied to this job.');
      return;
    }
    const _job = job;
    Alert.alert('Apply to ' + _job.company, 'This will open the official careers page.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Apply Now',
        onPress: () => {
          applyToJob(_job.id);
          Linking.openURL(_job.sourceUrl).catch(() => {});
          Alert.alert('✅ Application Recorded', 'We\'ve tracked your application. Good luck!');
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Job Details</Text>
        <TouchableOpacity onPress={() => toggleSaveJob(job.id)} style={styles.saveBtn} hitSlop={8}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={saved ? Colors.primary : Colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Company + Title */}
        <View style={styles.topCard}>
          <View style={styles.companyLogoLarge}>
            <Text style={styles.companyLogoText}>{job.company.charAt(0)}</Text>
          </View>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.companyName}>{job.company}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.locationText}>{job.location}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.postedText}>{timeAgo(job.postedAt)}</Text>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            <Tag label={job.type} />
            <Tag label={job.level} />
            {job.visaSponsorship && <Tag label="✅ Visa Sponsor" highlight="visa" />}
            {job.remote && <Tag label="🌐 Remote" highlight="remote" />}
          </View>

          {/* AI Match */}
          {job.aiMatchScore && (
            <LinearGradient
              colors={Colors.gradient.primary}
              style={styles.matchBar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="sparkles" size={14} color="#fff" />
              <Text style={styles.matchBarText}>AI Match Score: {job.aiMatchScore}%</Text>
            </LinearGradient>
          )}
        </View>

        {/* Salary + Stats */}
        <View style={styles.statsRow}>
          <StatItem
            icon="cash-outline"
            label="Salary"
            value={formatSalary(job.salary.min, job.salary.max, job.salary.currency, job.salary.period)}
            color={Colors.secondary}
          />
          <StatItem
            icon="people-outline"
            label="Applicants"
            value={job.applicants.toLocaleString()}
            color={Colors.primary}
          />
          <StatItem
            icon="globe-outline"
            label="Country"
            value={job.country}
            color={Colors.accentOrange}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {(['overview', 'requirements', 'benefits'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {activeTab === 'overview' && (
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>About the Role</Text>
              <Text style={styles.bodyText}>{job.description}</Text>

              <Text style={styles.sectionTitle}>Skills Required</Text>
              <View style={styles.skillsWrap}>
                {job.skills.map((skill) => (
                  <View key={skill} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>

              {job.deadline && (
                <View style={styles.deadlineBanner}>
                  <Ionicons name="time-outline" size={16} color={Colors.warning} />
                  <Text style={styles.deadlineText}>
                    Apply before {new Date(job.deadline).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'requirements' && (
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              {job.requirements.map((req, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{req}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'benefits' && (
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>Benefits & Perks</Text>
              {job.benefits.map((benefit, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} style={{ marginTop: 2 }} />
                  <Text style={styles.bulletText}>{benefit}</Text>
                </View>
              ))}

              {/* Visa sponsorship highlight */}
              {job.visaSponsorship && (
                <View style={styles.visaHighlight}>
                  <Text style={styles.visaHighlightTitle}>🛡️ Visa Sponsorship Available</Text>
                  <Text style={styles.visaHighlightBody}>
                    This company actively sponsors work visas for international talent. Check specific visa types in the benefits list above.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.xs }]}>
        <TouchableOpacity
          style={[styles.aiBtn]}
          activeOpacity={0.8}
          onPress={() => {
            useStore.getState().sendMessage(`Tell me more about the ${job.title} role at ${job.company} and whether I'm a good fit.`);
            router.push('/(tabs)/assistant');
          }}
        >
          <Ionicons name="sparkles" size={18} color={Colors.primary} />
          <Text style={styles.aiBtnText}>Ask AI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleApply}
          style={styles.applyBtnWrapper}
        >
          <LinearGradient
            colors={hasApplied ? [Colors.dark[600], Colors.dark[600]] : Colors.gradient.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.applyBtn}
          >
            <Text style={styles.applyBtnText}>
              {hasApplied ? '✓ Applied' : 'Apply Now'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Tag({ label, highlight }: { label: string; highlight?: 'visa' | 'remote' }) {
  return (
    <View
      style={[
        styles.tag,
        highlight === 'visa' && { backgroundColor: Colors.secondary + '18', borderColor: Colors.secondary + '40' },
        highlight === 'remote' && { backgroundColor: Colors.primary + '18', borderColor: Colors.primary + '40' },
      ]}
    >
      <Text
        style={[
          styles.tagText,
          highlight === 'visa' && { color: Colors.secondary },
          highlight === 'remote' && { color: Colors.primary },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function StatItem({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={[styles.statItem, { borderColor: color + '25' }]}>
      <Ionicons name={icon as any} size={16} color={color} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  saveBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: Spacing.md },
  topCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 6,
  },
  companyLogoLarge: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  companyLogoText: { fontSize: 32, fontWeight: '800', color: Colors.primary },
  jobTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, textAlign: 'center', lineHeight: 30 },
  companyName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: FontSize.sm, color: Colors.textMuted },
  dot: { color: Colors.textMuted, fontSize: FontSize.md },
  postedText: { fontSize: FontSize.sm, color: Colors.textMuted },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 4 },
  tag: {
    backgroundColor: Colors.dark[600],
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  tagText: { fontSize: FontSize.xs, color: Colors.textSecondary, textTransform: 'capitalize' },
  matchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    marginTop: 4,
  },
  matchBarText: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statItem: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
  },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  statValue: { fontSize: FontSize.xs + 1, fontWeight: '700', textAlign: 'center' },
  tabBar: { flexDirection: 'row', marginBottom: Spacing.md, backgroundColor: Colors.backgroundCard, borderRadius: Radius.lg, padding: 4 },
  tab: { flex: 1, paddingVertical: Spacing.xs + 2, alignItems: 'center', borderRadius: Radius.md },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  tabContent: { marginBottom: Spacing.md },
  contentSection: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  bodyText: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24 },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  skillText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  deadlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.warning + '18',
    borderRadius: Radius.md,
    padding: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  deadlineText: { fontSize: FontSize.sm, color: Colors.warning, fontWeight: '600' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 8 },
  bulletText: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24 },
  visaHighlight: {
    backgroundColor: Colors.secondary + '18',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
    gap: 6,
  },
  visaHighlightTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.secondary },
  visaHighlightBody: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    backgroundColor: Colors.background,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '18',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  aiBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  applyBtnWrapper: { flex: 1, borderRadius: Radius.lg, overflow: 'hidden' },
  applyBtn: { paddingVertical: Spacing.sm + 6, alignItems: 'center', justifyContent: 'center' },
  applyBtnText: { fontSize: FontSize.md, fontWeight: '800', color: '#fff' },
});
