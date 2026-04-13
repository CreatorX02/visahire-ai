import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { JobCard } from '../../components/JobCard';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';
import type { Job } from '../../types';

export default function Saved() {
  const insets = useSafeAreaInsets();
  const { savedJobs, toggleSaveJob, isJobSaved, applications } = useStore();

  function getStatus(jobId: string) {
    return applications.find((a) => a.jobId === jobId)?.status;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saved Jobs</Text>
        <Text style={styles.count}>{savedJobs.length} saved</Text>
      </View>

      {savedJobs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔖</Text>
          <Text style={styles.emptyTitle}>No saved jobs yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the bookmark icon on any job to save it for later
          </Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.browseBtnText}>Browse Jobs</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedJobs}
          keyExtractor={(item: Job) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              {/* Application tracker summary */}
              {applications.length > 0 && (
                <View style={styles.trackerCard}>
                  <Text style={styles.trackerTitle}>📊 Application Tracker</Text>
                  <View style={styles.trackerStats}>
                    {(['applied', 'screening', 'interview', 'offer'] as const).map((status) => {
                      const count = applications.filter((a) => a.status === status).length;
                      return (
                        <View key={status} style={styles.trackerStat}>
                          <Text style={styles.trackerStatValue}>{count}</Text>
                          <Text style={styles.trackerStatLabel}>{status}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => {
            const status = getStatus(item.id);
            return (
              <View>
                {status && (
                  <View style={[styles.statusBanner, getStatusStyle(status)]}>
                    <Ionicons name={getStatusIcon(status)} size={12} color="#fff" />
                    <Text style={styles.statusText}>{status.toUpperCase()}</Text>
                  </View>
                )}
                <JobCard
                  job={item}
                  onPress={() => router.push(`/job/${item.id}`)}
                  onSave={() => toggleSaveJob(item.id)}
                  isSaved={isJobSaved(item.id)}
                />
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

function getStatusStyle(status: string) {
  const map: Record<string, object> = {
    applied: { backgroundColor: Colors.info },
    screening: { backgroundColor: Colors.warning },
    interview: { backgroundColor: Colors.secondary },
    offer: { backgroundColor: Colors.success },
    rejected: { backgroundColor: Colors.error },
  };
  return map[status] ?? { backgroundColor: Colors.textMuted };
}

function getStatusIcon(status: string): any {
  const map: Record<string, string> = {
    applied: 'paper-plane',
    screening: 'eye',
    interview: 'people',
    offer: 'star',
    rejected: 'close-circle',
  };
  return map[status] ?? 'ellipse';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  title: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  count: { fontSize: FontSize.sm, color: Colors.textMuted },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  browseBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
  },
  browseBtnText: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
  trackerCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  trackerTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  trackerStats: { flexDirection: 'row', justifyContent: 'space-around' },
  trackerStat: { alignItems: 'center', gap: 2 },
  trackerStatValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  trackerStatLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'capitalize' },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    marginBottom: -Radius.lg,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: '700', color: '#fff' },
});
