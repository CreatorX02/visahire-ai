import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../constants/theme';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  onPress: () => void;
  onSave: () => void;
  isSaved: boolean;
  compact?: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function formatSalary(job: Job): string {
  const { min, max, currency, period } = job.salary;
  const fmt = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
  const sym =
    currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'CAD' ? 'C$' : currency;
  return `${sym}${fmt(min)}–${fmt(max)}/${period === 'year' ? 'yr' : period}`;
}

export function JobCard({ job, onPress, onSave, isSaved, compact }: JobCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, compact && styles.cardCompact, Shadow.sm]}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            {job.company.charAt(0)}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.company} numberOfLines={1}>{job.company}</Text>
          <Text style={styles.location} numberOfLines={1}>
            <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
            {' '}{job.location}
          </Text>
        </View>
        <TouchableOpacity onPress={onSave} style={styles.saveBtn} hitSlop={8}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? Colors.primary : Colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.title} numberOfLines={2}>{job.title}</Text>

      <View style={styles.tags}>
        <View style={[styles.tag, { backgroundColor: Colors.dark[600] }]}>
          <Text style={styles.tagText}>{job.type}</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: Colors.dark[600] }]}>
          <Text style={styles.tagText}>{job.level}</Text>
        </View>
        {job.visaSponsorship && (
          <View style={[styles.tag, styles.tagVisa]}>
            <Ionicons name="shield-checkmark" size={10} color={Colors.secondary} />
            <Text style={[styles.tagText, { color: Colors.secondary, marginLeft: 3 }]}>Visa</Text>
          </View>
        )}
        {job.remote && (
          <View style={[styles.tag, styles.tagRemote]}>
            <Text style={[styles.tagText, { color: Colors.primary }]}>Remote</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.salary}>{formatSalary(job)}</Text>
        <View style={styles.footerRight}>
          {job.aiMatchScore && (
            <View style={styles.matchBadge}>
              <LinearGradient
                colors={Colors.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.matchGradient}
              >
                <Text style={styles.matchText}>{job.aiMatchScore}% match</Text>
              </LinearGradient>
            </View>
          )}
          <Text style={styles.time}>{timeAgo(job.postedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  cardCompact: {
    padding: Spacing.sm + 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  logoText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  company: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  location: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  saveBtn: {
    padding: 4,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  tag: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagVisa: {
    backgroundColor: Colors.secondary + '18',
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
  },
  tagRemote: {
    backgroundColor: Colors.primary + '18',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  tagText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  salary: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchBadge: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  matchGradient: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  matchText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#fff',
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
