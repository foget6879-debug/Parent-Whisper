import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChatMessage } from '@/lib/openRouter';

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'openrouter-chat-history';
const MAX_CHATS = 3;

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultTitle(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === 'user')?.content?.trim();
  if (!first) return 'New chat';
  return first.length > 42 ? `${first.slice(0, 42)}…` : first;
}

function sanitizeSession(value: unknown): ChatSession | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== 'string') return null;
  const messages = Array.isArray(v.messages)
    ? v.messages
        .filter((m): m is Record<string, unknown> => !!m && typeof m === 'object')
        .map((m) => {
          const role = m.role === 'user' || m.role === 'assistant' ? m.role : null;
          const content = typeof m.content === 'string' ? m.content : null;
          return role && content ? { role, content } : null;
        })
        .filter((m): m is ChatMessage => m !== null)
    : [];
  const createdAt = typeof v.createdAt === 'number' ? v.createdAt : Date.now();
  const updatedAt = typeof v.updatedAt === 'number' ? v.updatedAt : createdAt;
  const title = typeof v.title === 'string' && v.title.trim() ? v.title : defaultTitle(messages);
  return { id: v.id, title, messages, createdAt, updatedAt };
}

function prune(sessions: ChatSession[]): ChatSession[] {
  return [...sessions]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_CHATS);
}

function readSessions(): ChatSession[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return prune(parsed.map(sanitizeSession).filter((s): s is ChatSession => s !== null));
  } catch {
    return [];
  }
}

function writeSessions(sessions: ChatSession[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prune(sessions)));
  } catch {
    // ignore storage errors
  }
}

function createSession(): ChatSession {
  const now = Date.now();
  return { id: uid(), title: 'New chat', messages: [], createdAt: now, updatedAt: now };
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => readSessions());
  const [activeId, setActiveId] = useState<string>(() => readSessions()[0]?.id ?? '');

  useEffect(() => {
    if (sessions.length === 0) {
      const first = createSession();
      setSessions([first]);
      setActiveId(first.id);
      writeSessions([first]);
      return;
    }
    if (!activeId || !sessions.some((s) => s.id === activeId)) {
      setActiveId(sessions[0].id);
    }
  }, [sessions, activeId]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? sessions[0] ?? null,
    [sessions, activeId]
  );

  const updateActiveMessages = useCallback(
    (messages: ChatMessage[]) => {
      setSessions((prev) => {
        const targetId = activeId || prev[0]?.id;
        if (!targetId) return prev;
        const next = prev.map((s) =>
          s.id === targetId
            ? {
                ...s,
                messages,
                title: s.messages.length === 0 ? defaultTitle(messages) : s.title,
                updatedAt: Date.now(),
              }
            : s
        );
        const pruned = prune(next);
        writeSessions(pruned);
        return pruned;
      });
    },
    [activeId]
  );

  const newChat = useCallback(() => {
    setSessions((prev) => {
      const current = prev.find((s) => s.id === activeId);
      const withoutEmptyCurrent = current && current.messages.length === 0 ? prev.filter((s) => s.id !== current.id) : prev;
      const created = createSession();
      const next = prune([created, ...withoutEmptyCurrent]);
      writeSessions(next);
      setActiveId(created.id);
      return next;
    });
  }, [activeId]);

  const selectChat = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const removeChat = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id);
        const pruned = prune(next.length > 0 ? next : [createSession()]);
        writeSessions(pruned);
        if (activeId === id) setActiveId(pruned[0].id);
        return pruned;
      });
    },
    [activeId]
  );

  return {
    sessions,
    activeId: activeSession?.id ?? '',
    activeSession,
    updateActiveMessages,
    newChat,
    selectChat,
    removeChat,
    maxChats: MAX_CHATS,
  };
}
