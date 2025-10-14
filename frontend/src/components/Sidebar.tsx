import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CubeIcon, ClipboardDocumentListIcon, CogIcon, UserGroupIcon, HomeIcon } from '@heroicons/react/24/outline';

const menu = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/stoklar', label: 'Stoklar', icon: CubeIcon },
  { to: '/siparisler', label: 'Siparişler', icon: ClipboardDocumentListIcon },
  { to: '/uretim', label: 'Üretim', icon: CogIcon },
  { to: '/isciler', label: 'İşçiler', icon: UserGroupIcon },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="px-6 py-4 text-2xl font-bold text-primary-gold">Otomasyon</div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex items-center px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${location.pathname === item.to ? 'bg-yellow-100 dark:bg-gray-800 font-semibold' : ''}`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 