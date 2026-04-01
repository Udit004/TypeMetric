"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { ChatMessage } from "../../types/multiplayerTypes";

interface RoomChatPanelProps {
  messages: ChatMessage[];
  currentUserId: string | null;
  currentUserName: string | null;
  typingUserNames: string[];
  isConnected: boolean;
  onSendMessage: (text: string) => void;
  onTypingChange: (isTyping: boolean) => void;
  className?: string;
}

const MAX_CHAT_MESSAGE_LENGTH = 280;

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RoomChatPanel({
  messages,
  currentUserId,
  currentUserName,
  typingUserNames,
  isConnected,
  onSendMessage,
  onTypingChange,
  className,
}: RoomChatPanelProps) {
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => a.sentAt - b.sentAt),
    [messages]
  );

  const submitMessage = () => {
    const normalizedText = text.trim();

    if (!normalizedText || !isConnected) {
      return;
    }

    onSendMessage(normalizedText);
    onTypingChange(false);
    isTypingRef.current = false;

    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setText("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    submitMessage();
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  };

  const handleInputChange = (nextText: string) => {
    const trimmed = nextText.trim();

    setText(nextText.slice(0, MAX_CHAT_MESSAGE_LENGTH));

    if (!isConnected) {
      return;
    }

    if (trimmed.length === 0) {
      if (isTypingRef.current) {
        onTypingChange(false);
        isTypingRef.current = false;
      }

      if (typingTimeoutRef.current !== null) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      return;
    }

    if (!isTypingRef.current) {
      onTypingChange(true);
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      onTypingChange(false);
      isTypingRef.current = false;
      typingTimeoutRef.current = null;
    }, 1400);
  };

  useEffect(() => {
    return () => {
      if (isTypingRef.current) {
        onTypingChange(false);
      }

      if (typingTimeoutRef.current !== null) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [onTypingChange]);

  const visibleTypingUsers = useMemo(
    () => typingUserNames.filter((name) => name !== currentUserName),
    [currentUserName, typingUserNames]
  );

  const typingText = useMemo(() => {
    if (visibleTypingUsers.length === 0) {
      return "";
    }

    if (visibleTypingUsers.length === 1) {
      return `${visibleTypingUsers[0]} is typing...`;
    }

    if (visibleTypingUsers.length === 2) {
      return `${visibleTypingUsers[0]} and ${visibleTypingUsers[1]} are typing...`;
    }

    return "Several people are typing...";
  }, [visibleTypingUsers]);

  return (
    <section className={`flex h-full min-h-72 max-h-[68vh] min-w-0 flex-col rounded-2xl border border-sky-200/20 bg-slate-900/40 p-3 sm:p-4 ${className ?? ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-200">Room Chat</h3>
        <span className="text-[11px] text-slate-400">{sortedMessages.length} messages</span>
      </div>

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-xl border border-slate-700/60 bg-slate-950/60 p-2"
      >
        {sortedMessages.length === 0 ? (
          <p className="px-2 py-3 text-xs text-slate-400">No messages yet. Start the conversation.</p>
        ) : (
          sortedMessages.map((message) => {
            const isMine = currentUserId === message.userId;

            return (
              <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl border px-2.5 py-2 ${
                    isMine
                      ? "border-cyan-200/35 bg-cyan-400/18 text-cyan-50"
                      : "border-slate-600/50 bg-slate-800/80 text-slate-100"
                  }`}
                >
                  <div className={`flex items-center gap-2 ${isMine ? "justify-end" : "justify-between"}`}>
                    <p className="text-[11px] font-semibold text-slate-100">
                      {isMine ? "You" : message.userName}
                    </p>
                    <span className="text-[10px] text-slate-300">{formatTime(message.sentAt)}</span>
                  </div>
                  <p className="mt-1 wrap-break-word text-xs">{message.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 space-y-2">
        <textarea
          value={text}
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={isConnected ? "Type your message..." : "Reconnecting chat..."}
          className="h-12 w-full resize-none rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-cyan-400"
          disabled={!isConnected}
        />
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-400">{typingText || `${text.length}/${MAX_CHAT_MESSAGE_LENGTH}`}</p>
          <button
            type="submit"
            disabled={!isConnected || text.trim().length === 0}
            className="cursor-pointer rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
