import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { SearchBar } from '../../components/SearchBar';
import { FilterChip } from '../../components/FilterChip';
import { JobCard } from '../../components/JobCard';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import type { Job } from '../../types';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'remote'] as const;
const JOB_LEVELS = ['entry', 'mid', 'senior', 'lead'] as const;
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'match', label: 'AI Match' },
  { value: 'date', label: 'Latest' },
  { value: 'salary', label: 'Salary' },
] as const;

export default function Search() {
  const insets = useSafeAreaInsets();
  const { filters, searchResults, isLoadingJobs, setFilters, resetFilters } = useStore();
  const [localQuery, setLocalQuery] = useState(filters.query);

  useEffect(() => {
    setLocalQuery(filters.query);
  }, [filters.query]);

  const handleSearch = useCallback(() => {
    setFilters({ query: localQuery });
  }, [localQuery, setFilters]);

  const resultCount = searchResults.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search bar */}
      <View style={styles.searchSection}>
        <SearchBar
          value={localQuery}
          onChangeText={setLocalQuery}
          onSubmit={handleSearch}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <FilterChip
          label="🛡 Visa Only"
          selected={filters.visaOnly}
          onPress={() => setFilters({ visaOnly: !filters.visaOnly })}
        />
        <FilterChip
          label="🌐 Remote"
          selected={filters.remoteOnly}
          onPress={() => setFilters({ remoteOnly: !filters.remoteOnly })}
        />
        {JOB_TYPES.map((t) => (
          <FilterChip
            key={t}
            label={t}
            selected={filters.type === t}
            onPress={() => setFilters({ type: filters.type === t ? undefined : t })}
          />
        ))}
        {JOB_LEVELS.map((l) => (
          <FilterChip
            key={l}
            label={l}
            selected={filters.level === l}
            onPress={() => setFilters({ level: filters.level === l ? undefined : l })}
          />
        ))}
      </ScrollView>

      {/* Sort */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortRow}
      >
        {SORT_OPTIONS.map((s) => (
          <FilterChip
            key={s.value}
            label={s.label}
            selected={filters.sortBy === s.value}
            onPress={() => setFilters({ sortBy: s.value })}
          />
        ))}
        <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Results header */}
      <View style={styles.resultsHeader}>
        {isLoadingJobs ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Text style={styles.resultsCount}>
            {resultCount} {resultCount === 1 ? 'job' : 'jobs'} found
          </Text>
        )}
      </View>

      {/* Results list */}
      {isLoadingJobs ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Searching jobs…</Text>
        </View>
      ) : resultCount === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>No jobs found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your filters or search terms</Text>
          <TouchableOpacity onPress={resetFilters} style={styles.resetBtnLarge}>
            <Text style={styles.resetBtnText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item: Job) => item.id}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onPress={() => router.push(`/job/${item.id}`)}
              onSave={() => useStore.getState().toggleSaveJob(item.id)}
              isSaved={useStore.getState().isJobSaved(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchSection: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  filterRow: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, gap: 8 },
  sortRow: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: 8 },
  resetBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, justifyContent: 'center' },
  resetText: { fontSize: FontSize.sm, color: Colors.error, fontWeight: '600' },
  resultsHeader: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xs },
  resultsCount: { fontSize: FontSize.sm, color: Colors.textMuted },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  loadingText: { fontSize: FontSize.md, color: Colors.textMuted },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  resetBtnLarge: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  resetBtnText: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
});
