import { useEffect, useState } from 'react';
import { app } from '../lib/firebase';
import { getMessaging, getToken, isSupported as checkIsSupported, Messaging } from 'firebase/messaging';
import { api } from '../servies/api';

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  permissionStatus: NotificationPermission;
  token: string | null;
  error: Error | null;
  requestPermission: () => Promise<void>;
}

export function usePushNotifications(isAuthenticated: boolean = false): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const getMessagingInstance = async (): Promise<Messaging | null> => {
    try {
      const supported = await checkIsSupported();
      if (!supported) {
        setIsSupported(false);
        return null;
      }
      return getMessaging(app);
    } catch (e) {
      setIsSupported(false);
      return null;
    }
  };

  const registerTokenWithBackend = async (deviceToken: string) => {
    try {
      const response = await api.post('/profile/me/fcm-token', { token: deviceToken });
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to register device token with server');
      }
    } catch (err) {
      console.error('Token registration failed:', err);
    }
  };

  const setupPush = async (askPermission: boolean = false) => {
    try {
      let currentPermission = Notification.permission;
      
      // We must ask for permission FIRST to preserve the browser's user gesture context.
      // If we await getMessagingInstance() first, the browser might block the prompt.
      if (currentPermission === 'default' && askPermission) {
        currentPermission = await Notification.requestPermission();
        setPermissionStatus(currentPermission);
      }

      if (currentPermission !== 'granted') {
        return;
      }

      const messaging = await getMessagingInstance();
      if (!messaging) return;

      // 3. Get FCM Token
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.warn("No VAPID key found. Push notifications may fail.");
      }
      
      const currentToken = await getToken(messaging, { vapidKey });

      if (currentToken) {
        setToken(currentToken);
        await registerTokenWithBackend(currentToken);
      } else {
        console.warn('No FCM token available. Retrying might be needed.');
      }
    } catch (err) {
      console.error('Error setting up push notifications:', err);
      setError(err instanceof Error ? err : new Error('Unknown error during push setup'));
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated) return;

    checkIsSupported().then((supported) => {
      setIsSupported(supported);
      if (supported && Notification.permission === 'granted') {
        setupPush(false);
      }
    });
  }, [isAuthenticated]);

  const requestPermission = async () => {
    await setupPush(true);
  };

  return {
    isSupported,
    permissionStatus,
    token,
    error,
    requestPermission,
  };
}
