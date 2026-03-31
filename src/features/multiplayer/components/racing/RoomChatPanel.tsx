"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { ChatMessage } from "../../types/multiplayerTypes";

interface RoomChatPanelProps {
  messages: ChatMessage[];
  currentUserId: string | null;
  isConnected: boolean;
  onSendMessage: (text: string) => void;
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
  isConnected,
  onSendMessage,
  className,
}: RoomChatPanelProps) {
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedText = text.trim();

    if (!normalizedText || !isConnected) {
      return;
    }

    onSendMessage(normalizedText);
    setText("");
  };

  return (
    <section className={`flex h-full min-h-80 flex-col rounded-2xl border border-sky-200/20 bg-slate-900/40 p-3 sm:p-4 ${className ?? ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-200">Room Chat</h3>
        <span className="text-[11px] text-slate-400">{sortedMessages.length} messages</span>
      </div>

      <div
        ref={listRef}
        className="min-h-48 flex-1 space-y-2 overflow-y-auto rounded-xl border border-slate-700/60 bg-slate-950/60 p-2"
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
          onChange={(event) => setText(event.target.value.slice(0, MAX_CHAT_MESSAGE_LENGTH))}
          placeholder={isConnected ? "Type your message..." : "Reconnecting chat..."}
          className="h-20 w-full resize-none rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-cyan-400"
          disabled={!isConnected}
        />
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            {text.length}/{MAX_CHAT_MESSAGE_LENGTH}
          </p>
          <button
            type="submit"
            disabled={!isConnected || text.trim().length === 0}
            className="rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
