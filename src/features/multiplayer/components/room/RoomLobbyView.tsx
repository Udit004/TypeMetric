"use client";

import { useEffect, useState } from "react";
import { ChatMessage } from "../../types/multiplayerTypes";
import { MultiplayerPlayer } from "../../types/multiplayerTypes";
import { RoomLobbyScene } from "./RoomLobbyScene";
import { RoomChatPanel } from "../racing/RoomChatPanel";
import { RoomFriendInvitePanel } from "../racing/RoomFriendInvitePanel";
import styles from "./RoomLobbyView.module.css";

interface RoomLobbyViewProps {
  participants: MultiplayerPlayer[];
  isHost: boolean;
  canStartRace: boolean;
  onStartRace: () => void;
  roomId: string;
  token: string | null;
  currentUserId: string | null;
  currentUserName: string | null;
  messages: ChatMessage[];
  typingUserNames: string[];
  isConnected: boolean;
  onSendMessage: (text: string) => void;
  onTypingChange: (isTyping: boolean) => void;
}

export function RoomLobbyView({
  participants,
  isHost,
  canStartRace,
  onStartRace,
  roomId,
  token,
  currentUserId,
  currentUserName,
  messages,
  typingUserNames,
  isConnected,
  onSendMessage,
  onTypingChange,
}: RoomLobbyViewProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section className="relative h-144 overflow-hidden rounded-2xl border border-cyan-200/20 bg-[linear-gradient(140deg,#020617_0%,#0b1120_36%,#062135_100%)] p-2 sm:h-168 sm:p-3">
      <div
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(56,189,248,0.23),transparent_42%),radial-gradient(circle_at_82%_20%,rgba(16,185,129,0.21),transparent_42%),radial-gradient(circle_at_50%_78%,rgba(45,212,191,0.18),transparent_46%)] ${styles.enterScene} ${isVisible ? styles.visible : ""}`}
      />
      <RoomLobbyScene
        participants={participants}
      />

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute left-3 top-14 w-56 pointer-events-auto sm:left-4 sm:top-16 sm:w-60 md:w-64">
          <RoomFriendInvitePanel roomId={roomId} token={token} />
        </div>

        <div className="absolute right-3 top-14 w-72 pointer-events-auto sm:right-4 sm:top-16 sm:w-80 md:w-88">
          <RoomChatPanel
            messages={messages}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            typingUserNames={typingUserNames}
            isConnected={isConnected}
            onSendMessage={onSendMessage}
            onTypingChange={onTypingChange}
            className="h-96! min-h-96! max-h-96!"
          />
        </div>

        <div className="absolute bottom-4 right-4 pointer-events-auto">
          {isHost ? (
            <button
              type="button"
              onClick={onStartRace}
              disabled={!canStartRace}
              className="cursor-pointer rounded-full border border-cyan-200/30 bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 shadow-[0_0_38px_rgba(34,211,238,0.45)] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-200"
            >
              {canStartRace ? "Start Race" : "Need 2 players"}
            </button>
          ) : (
            <p className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-xs font-semibold text-slate-200 shadow-lg">
              Waiting for host...
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
