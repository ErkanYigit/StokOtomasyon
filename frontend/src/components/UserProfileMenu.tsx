import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from './ChangePasswordModal';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { UserIcon, KeyIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

const defaultAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111827&color=fff&size=128&rounded=true`;

const getInitials = (firstName: string | undefined, lastName: string | undefined) => {
  if (!firstName || !lastName) return '';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const UserProfileMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleProfile = () => {
    setOpen(false);
    navigate('/profil');
  };

  const handleChangePassword = () => {
    setOpen(false);
    setShowChangePw(true);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!user) return null;
  const fullName = `${user.ad} ${user.soyad}`;
  const avatarUrl = defaultAvatar(fullName);
  const email = user.email || '';
  const lastLogin = user.sonGiris ? new Date(user.sonGiris).toLocaleString('tr-TR') : '';

  return (
    <div className="relative inline-block text-left">
      <button
        className="flex items-center gap-2 focus:outline-none hover:bg-gray-100 rounded-full px-2 py-1"
        onClick={() => setOpen((v) => !v)}
        aria-label="Profil Menüsü"
      >
        <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full border border-gray-300" />
        <span className="hidden md:block font-medium text-gray-800 text-sm">{user.ad}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary-gold flex items-center justify-center text-white font-bold text-lg">
                {getInitials(user?.ad, user?.soyad)}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{user?.ad} {user?.soyad}</div>
                <div className="text-xs text-gray-500 dark:text-gray-300">{user?.email}</div>
                <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">Son giriş: {user?.sonGiris ? new Date(user.sonGiris).toLocaleString('tr-TR') : '-'}</div>
              </div>
            </div>
          </div>
          <div className="py-1">
            <button
              onClick={handleProfile}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <UserIcon className="h-5 w-5 mr-2" />
              Profilimi Gör
            </button>
            <button
              onClick={handleChangePassword}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <KeyIcon className="h-5 w-5 mr-2" />
              Şifre Değiştir
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-700 dark:text-red-400"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Oturumu Kapat
            </button>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5 mr-2" />
              ) : (
                <MoonIcon className="h-5 w-5 mr-2" />
              )}
              {theme === 'dark' ? 'Açık Tema' : 'Karanlık Tema'}
            </button>
          </div>
        </div>
      )}
      <ChangePasswordModal open={showChangePw} onClose={() => setShowChangePw(false)} />
    </div>
  );
};

export default UserProfileMenu; 