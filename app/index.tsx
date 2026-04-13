import { Redirect } from 'expo-router';
import { useStore } from '../store/useStore';

export default function Index() {
  const { isAuthenticated, hasOnboarded } = useStore();

  if (!hasOnboarded) return <Redirect href="/onboarding" />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}
