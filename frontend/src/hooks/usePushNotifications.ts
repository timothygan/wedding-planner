import { useEffect, useState } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      return false;
    }

    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }

    return Notification.permission === 'granted';
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && isSupported) {
      new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options,
      });
    }
  };

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
  };
}

