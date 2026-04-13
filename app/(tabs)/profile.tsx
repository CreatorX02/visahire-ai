import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../constants/theme';

const VISA_STATUS_LABELS: Record<string, string> = {
  requires_sponsorship: 'Needs Visa Sponsorship',
  work_visa: 'Has Work Visa',
  permanent_resident: 'Permanent Resident',
  citizen: 'Citizen',
  student: 'Student Visa',
};

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { user, logout, savedJobs, applications } = useStore();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [aiScanning, setAiScanning] = useState(true);

  function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  if (!user) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile card */}
        <LinearGradient
          colors={Colors.gradient.primary}
          style={styles.profileCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          {user.title && <Text style={styles.profileTitle}>{user.title}</Text>}
          <View style={styles.visaChip}>
            <Ionicons name="shield-checkmark" size={12} color={Colors.secondary} />
            <Text style={styles.visaChipText}>
              {VISA_STATUS_LABELS[user.visaStatus] ?? user.visaStatus}
            </Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox value={savedJobs.length} label="Saved" icon="bookmark" color={Colors.primary} />
          <StatBox value={applications.length} label="Applied" icon="paper-plane" color={Colors.secondary} />
          <StatBox value={user.skills.length} label="Skills" icon="code-slash" color={Colors.accentOrange} />
        </View>

        {/* Skills */}
        <SectionCard title="My Skills">
          <View style={styles.skillsWrap}>
            {user.skills.map((skill) => (
              <View key={skill} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
            <TouchableOpacity style={[styles.skillChip, styles.addSkill]}>
              <Ionicons name="add" size={14} color={Colors.primary} />
              <Text style={[styles.skillText, { color: Colors.primary }]}>Add</Text>
            </TouchableOpacity>
          </View>
        </SectionCard>

        {/* Preferred Locations */}
        <SectionCard title="Preferred Locations">
          <View style={styles.skillsWrap}>
            {user.preferredLocations.map((loc) => (
              <View key={loc} style={styles.locationChip}>
                <Text style={styles.skillText}>🌍 {loc}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        {/* AI Preferences */}
        <SectionCard title="AI Preferences">
          <ToggleRow
            label="Job match notifications"
            subLabel="Get notified when AI finds new matches"
            value={notifEnabled}
            onToggle={setNotifEnabled}
          />
          <ToggleRow
            label="Auto AI scanning"
            subLabel="Continuously scan for new visa jobs"
            value={aiScanning}
            onToggle={setAiScanning}
          />
        </SectionCard>

        {/* Account actions */}
        <SectionCard title="Account">
          <MenuRow icon="person-outline" label="Edit Profile" onPress={() => {}} />
          <MenuRow icon="lock-closed-outline" label="Change Password" onPress={() => {}} />
          <MenuRow icon="document-text-outline" label="My Resume" onPress={() => {}} />
          <MenuRow icon="notifications-outline" label="Notification Settings" onPress={() => {}} />
          <MenuRow icon="help-circle-outline" label="Help & Support" onPress={() => {}} />
          <MenuRow icon="information-circle-outline" label="About VisaHire AI" onPress={() => {}} />
        </SectionCard>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>VisaHire AI v1.0.0</Text>
        <View style={{ height: insets.bottom + Spacing.lg }} />
      </ScrollView>
    </View>
  );
}

function StatBox({ value, label, icon, color }: { value: number; label: string; icon: string; color: string }) {
  return (
    <View style={[styles.statBox, { borderColor: color + '30' }]}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ToggleRow({ label, subLabel, value, onToggle }: { label: string; subLabel: string; value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleSub}>{subLabel}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.dark[600], true: Colors.primary + '80' }}
        thumbColor={value ? Colors.primary : Colors.textMuted}
      />
    </View>
  );
}

function MenuRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconWrapper}>
        <Ionicons name={icon as any} size={18} color={Colors.textSecondary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.md },
  profileCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: 4,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  profileName: { fontSize: FontSize.xl, fontWeight: '800', color: '#fff' },
  profileEmail: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)' },
  profileTitle: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  visaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: 4,
  },
  visaChipText: { fontSize: FontSize.xs, color: Colors.secondary, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.sm + 4,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
  },
  statValue: { fontSize: FontSize.xl, fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  sectionCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  addSkill: {
    borderColor: Colors.primary + '60',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationChip: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  skillText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleInfo: { flex: 1, paddingRight: Spacing.md },
  toggleLabel: { fontSize: FontSize.md, color: Colors.text, fontWeight: '600' },
  toggleSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  menuIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.error + '18',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  logoutText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.error },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.sm },
});
