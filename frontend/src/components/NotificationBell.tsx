import React, { useState, useEffect, useRef } from 'react';
import { notificationAPI, NotificationData } from '../services/api';

function timeAgo(date: Date) {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff} sn önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationAPI.getAll();
      setNotifications(data);
    } catch (err) {
      setError('Bildirimler alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchNotifications();
    // eslint-disable-next-line
  }, [open]);

  // Panel dışında tıklanınca kapat
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  return (
    <>
      <button
        className="relative focus:outline-none"
        onClick={() => setOpen(true)}
        aria-label="Bildirimler"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </button>
      {/* Sağdan kayan panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 max-w-full bg-white dark:bg-gray-900 shadow-2xl z-[9999] transition-transform duration-300 border-l border-gray-200 dark:border-gray-700 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}
        ref={panelRef}
        style={{ boxShadow: open ? 'rgba(0,0,0,0.12) -8px 0 24px' : undefined }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">Bildirimler</span>
          <button className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 text-xl" onClick={() => setOpen(false)} aria-label="Kapat">×</button>
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-300">Son 10 bildirim</span>
          <button
            className="text-xs text-primary-gold hover:underline"
            onClick={handleMarkAllRead}
          >
            Tümünü oku
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
          {loading && <li className="p-4 text-gray-500 dark:text-gray-400 text-sm">Yükleniyor...</li>}
          {error && <li className="p-4 text-red-500 dark:text-red-400 text-sm">{error}</li>}
          {!loading && !error && notifications.length === 0 && (
            <li className="p-4 text-gray-500 dark:text-gray-400 text-sm">Hiç bildiriminiz yok.</li>
          )}
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${!n.isRead ? 'bg-yellow-50 dark:bg-yellow-900' : 'bg-white dark:bg-gray-900'}`}
              onClick={() => handleMarkRead(n._id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-gray-100">{n.title}</span>
                {!n.isRead && <span className="ml-2 h-2 w-2 rounded-full bg-red-400 inline-block"></span>}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{n.message}</div>
              <div className="text-xs text-gray-400 dark:text-gray-400 mt-1">{timeAgo(new Date(n.createdAt))}</div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default NotificationBell; 