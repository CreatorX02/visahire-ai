import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { AIChatBubble } from '../../components/AIChatBubble';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';
import { AI_QUICK_PROMPTS } from '../../constants/data';
import type { ChatMessage } from '../../types';

export default function Assistant() {
  const insets = useSafeAreaInsets();
  const { chatMessages, isChatLoading, sendMessage, clearChat } = useStore();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);
  const [showPrompts, setShowPrompts] = useState(chatMessages.length <= 1);

  async function handleSend(text?: string) {
    const msg = text ?? input.trim();
    if (!msg) return;
    setInput('');
    setShowPrompts(false);
    await sendMessage(msg);
  }

  useEffect(() => {
    if (chatMessages.length > 1) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chatMessages.length]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.bottom}
    >
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={Colors.gradient.primary} style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>AI</Text>
        </LinearGradient>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>VisaHire AI</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online • Powered by GPT</Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat} hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={chatMessages}
        keyExtractor={(item: ChatMessage) => item.id}
        renderItem={({ item }) => (
          <AIChatBubble role={item.role} content={item.content} />
        )}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isChatLoading ? (
            <AIChatBubble role="assistant" content="" isLoading />
          ) : null
        }
      />

      {/* Quick prompts */}
      {showPrompts && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promptsRow}
        >
          {AI_QUICK_PROMPTS.map((p, i) => (
            <TouchableOpacity
              key={i}
              style={styles.promptChip}
              onPress={() => handleSend(p)}
              activeOpacity={0.8}
            >
              <Text style={styles.promptText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + Spacing.xs }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything about visa jobs…"
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={500}
          returnKeyType="default"
        />
        <TouchableOpacity
          onPress={() => handleSend()}
          disabled={!input.trim() || isChatLoading}
          style={styles.sendBtnWrapper}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={input.trim() ? Colors.gradient.primary : [Colors.dark[500], Colors.dark[500]]}
            style={styles.sendBtn}
          >
            {isChatLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    gap: Spacing.sm,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  onlineText: { fontSize: FontSize.xs, color: Colors.textMuted },
  messageList: { paddingVertical: Spacing.md },
  promptsRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 8,
  },
  promptChip: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    maxWidth: 220,
  },
  promptText: { fontSize: FontSize.sm, color: Colors.primary, lineHeight: 18 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    gap: Spacing.sm,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.md,
    color: Colors.text,
    maxHeight: 120,
  },
  sendBtnWrapper: { borderRadius: Radius.lg, overflow: 'hidden' },
  sendBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
  },
});
