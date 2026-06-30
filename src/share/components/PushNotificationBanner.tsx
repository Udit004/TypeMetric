"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/share/hooks/useAuth";
import { usePushNotifications } from "@/share/hooks/usePushNotifications";

const BellIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export function PushNotificationBanner() {
  const { token } = useAuth();
  const { permissionStatus, requestPermission, isSupported } = usePushNotifications(!!token);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show the banner if:
    // 1. User is logged in
    // 2. Push notifications are supported
    // 3. Permission is not yet granted or denied (it's "default")
    // 4. We haven't previously dismissed the banner in this session/browser
    const dismissed = localStorage.getItem("push_banner_dismissed") === "true";
    if (!!token && isSupported && permissionStatus === "default" && !dismissed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [token, isSupported, permissionStatus]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("push_banner_dismissed", "true");
  };

  const handleEnable = async () => {
    await requestPermission();
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-4 flex flex-col sm:flex-row items-center gap-4 text-white">
      <div className="flex items-center gap-3 flex-1 w-full">
        <div className="bg-cyan-500/20 p-2 rounded-full shrink-0">
          <BellIcon className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <p className="font-semibold text-sm mb-0.5">Enable Notifications</p>
          <p className="text-xs text-zinc-400">Get alerted when friends invite you to play or beat your records.</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 justify-end">
        <button 
          onClick={handleDismiss}
          className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          Not Now
        </button>
        <button 
          onClick={handleEnable}
          className="px-4 py-1.5 text-xs font-medium bg-cyan-500 text-black rounded hover:bg-cyan-400 transition-colors"
        >
          Enable
        </button>
      </div>

      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-zinc-500 hover:text-white sm:hidden"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
