"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RemoteAudioTrack, Room, RoomEvent } from "livekit-client";

import { getRoomVoiceTokenApi } from "../services/multiplayerRoomService";

interface UseRoomVoiceChatReturn {
  isSupported: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  isMicMuted: boolean;
  isSpeakerMuted: boolean;
  connectedParticipants: number;
  errorMessage: string | null;
  toggleMicMute: () => Promise<void>;
  toggleSpeakerMute: () => void;
  clearError: () => void;
}

interface UseRoomVoiceChatParams {
  roomId: string;
  authToken: string | null;
}

export function useRoomVoiceChat({ roomId, authToken }: UseRoomVoiceChatParams): UseRoomVoiceChatReturn {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [connectedParticipants, setConnectedParticipants] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const isSupported = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(navigator.mediaDevices?.getUserMedia);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const removeAllRemoteAudioElements = useCallback(() => {
    audioElementsRef.current.forEach((element) => {
      element.pause();
      element.remove();
    });
    audioElementsRef.current.clear();
  }, []);

  const leaveVoice = useCallback(() => {
    const room = roomRef.current;

    if (!room) {
      return;
    }

    room.disconnect();
    roomRef.current = null;

    removeAllRemoteAudioElements();
    setIsConnected(false);
    setIsConnecting(false);
    setConnectedParticipants(0);
    setIsMicMuted(false);
  }, [removeAllRemoteAudioElements]);

  const joinVoice = useCallback(async () => {
    if (!authToken) {
      setErrorMessage("You must be logged in to join voice chat.");
      return;
    }

    if (!isSupported) {
      setErrorMessage("Voice chat is not supported in this browser.");
      return;
    }

    if (roomRef.current || isConnecting) {
      return;
    }

    setErrorMessage(null);
    setIsConnecting(true);

    try {
      const credentials = await getRoomVoiceTokenApi(roomId, authToken);

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      const refreshParticipantCount = () => {
        const local = room.state === "connected" ? 1 : 0;
        setConnectedParticipants(room.remoteParticipants.size + local);
      };

      room.on(RoomEvent.TrackSubscribed, (track, publication) => {
        if (!(track instanceof RemoteAudioTrack)) {
          return;
        }

        const mediaElement = track.attach();
        mediaElement.autoplay = true;
        mediaElement.muted = isSpeakerMuted;
        mediaElement.dataset.voiceTrackSid = publication.trackSid;
        mediaElement.style.display = "none";
        document.body.appendChild(mediaElement);
        audioElementsRef.current.set(publication.trackSid, mediaElement);
      });

      room.on(RoomEvent.TrackUnsubscribed, (track, publication) => {
        if (!(track instanceof RemoteAudioTrack)) {
          return;
        }

        const existing = audioElementsRef.current.get(publication.trackSid);

        if (existing) {
          existing.pause();
          existing.remove();
          audioElementsRef.current.delete(publication.trackSid);
        }

        track.detach();
      });

      room.on(RoomEvent.ParticipantConnected, refreshParticipantCount);
      room.on(RoomEvent.ParticipantDisconnected, refreshParticipantCount);

      room.on(RoomEvent.Disconnected, () => {
        removeAllRemoteAudioElements();
        setIsConnected(false);
        setConnectedParticipants(0);
        setIsMicMuted(false);
        roomRef.current = null;
      });

      await room.connect(credentials.url, credentials.token, {
        autoSubscribe: true,
      });

      await room.localParticipant.setMicrophoneEnabled(true);
      roomRef.current = room;
      setIsMicMuted(false);
      setIsConnected(true);
      refreshParticipantCount();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to join voice chat";
      setErrorMessage(message);
      leaveVoice();
    } finally {
      setIsConnecting(false);
    }
  }, [authToken, isConnecting, isSpeakerMuted, isSupported, leaveVoice, removeAllRemoteAudioElements, roomId]);

  const toggleMicMute = useCallback(async () => {
    const room = roomRef.current;

    if (!room || !isConnected) {
      return;
    }

    try {
      const nextMicMuted = !isMicMuted;
      await room.localParticipant.setMicrophoneEnabled(!nextMicMuted);
      setIsMicMuted(nextMicMuted);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update microphone";
      setErrorMessage(message);
    }
  }, [isConnected, isMicMuted]);

  const toggleSpeakerMute = useCallback(() => {
    setIsSpeakerMuted((previous) => {
      const next = !previous;

      audioElementsRef.current.forEach((element) => {
        element.muted = next;
      });

      return next;
    });
  }, []);

  useEffect(() => {
    if (!authToken || !isSupported || isConnected || isConnecting || roomRef.current) {
      return;
    }

    void joinVoice();
  }, [authToken, isConnected, isConnecting, isSupported, joinVoice]);

  useEffect(() => {
    return () => {
      leaveVoice();
    };
  }, [leaveVoice]);

  return {
    isSupported,
    isConnecting,
    isConnected,
    isMicMuted,
    isSpeakerMuted,
    connectedParticipants,
    errorMessage,
    toggleMicMute,
    toggleSpeakerMute,
    clearError,
  };
}
